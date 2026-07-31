import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.scrapers.nvd_scraper import NvdScraper
from app.scrapers.cisa_scraper import CisaScraper
from app.scrapers.github_scraper import GitHubScraper
from app.scrapers.rss_scraper import RssScraper
from app.ai.pipeline import ai_pipeline
from app.repositories.threat_repository import threat_repo
from app.core.firebase import get_db

logger = logging.getLogger("cybervision.scheduler")

scheduler = BackgroundScheduler()

def run_ingestion_cycle():
    """
    Core Ingestion Loop: Fetch -> Normalize -> AI Enrichment -> Store -> Notify
    """
    logger.info("Executing periodic threat intelligence ingestion cycle...")
    
    scrapers = [
        ("NVD API", NvdScraper()),
        ("CISA KEV", CisaScraper()),
        ("GitHub Advisories", GitHubScraper()),
        ("RSS Feeds", RssScraper())
    ]
    
    ingested_count = 0
    db = get_db()
    
    for name, scraper in scrapers:
        try:
            logger.info(f"Triggering scraper: {name}")
            raw_vulnerabilities = scraper.fetch_vulnerabilities()
            
            for item in raw_vulnerabilities:
                # 1. Pipeline Telemetry Enrichment
                enriched = ai_pipeline.process_telemetry(item)
                
                # 2. Database Save
                doc_id = threat_repo.save(enriched)
                ingested_count += 1
                
                # 3. Trigger notification alerts on High/Critical severities
                if enriched.get("severity") in ["Critical", "High"]:
                    import uuid
                    notif_id = f"notif-{uuid.uuid4().hex[:8]}"
                    notif = {
                        "id": notif_id,
                        "timestamp": datetime.utcnow().isoformat(),
                        "message": f"New {enriched.get('severity')} exploit threat detected: {enriched.get('cve')}",
                        "severity": enriched.get("severity"),
                        "source": enriched.get("source"),
                        "category": enriched.get("threatType"),
                        "isRead": False
                    }
                    db.collection("notifications").document(notif_id).set(notif)
                    logger.warning(f"CRITICAL ALARM DISPATCHED: {notif['message']}")
                    
        except Exception as e:
            logger.error(f"Error executing scraper {name} during ingestion run: {e}")
            
    logger.info(f"Ingestion cycle completed. Logged {ingested_count} threat metrics.")
    return ingested_count

def start_scheduler():
    if not scheduler.running:
        # 1. Ingest RSS alerts every 15 minutes
        scheduler.add_job(run_ingestion_cycle, "interval", minutes=15, id="rss_feed_job")
        
        # 2. Ingest NVD/GitHub every 30 minutes
        scheduler.add_job(run_ingestion_cycle, "interval", minutes=30, id="nvd_github_job")
        
        # 3. Ingest CISA KEV hourly
        scheduler.add_job(run_ingestion_cycle, "interval", hours=1, id="cisa_kev_job")
        
        scheduler.start()
        logger.info("Background threat ingestion scheduler started successfully.")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background threat ingestion scheduler terminated.")
