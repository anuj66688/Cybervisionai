import logging
from typing import List, Dict, Any
from app.scrapers.normalizer import normalize_vulnerability

logger = logging.getLogger("cybervision.scraper.rss")

SECURITY_RSS_FEEDS = [
    "https://www.bleepingcomputer.com/feed/",
    "https://feeds.feedburner.com/TheHackersNews"
]

class RssScraper:
    _network_warned = False

    def fetch_vulnerabilities(self) -> List[Dict[str, Any]]:
        logger.info("Ingesting XML Security RSS feeds...")
        normalized = []
        import re

        try:
            import feedparser
        except ImportError:
            logger.warning("feedparser not installed — skipping RSS scrape")
            return []
        
        for url in SECURITY_RSS_FEEDS:
            try:
                feed = feedparser.parse(url)
                entries = feed.entries
                logger.info(f"Parsed {len(entries)} entries from RSS feed.")
                RssScraper._network_warned = False
                
                for entry in entries[:5]:
                    summary_text = entry.get("summary", entry.get("description", "No details."))
                    # Strip HTML tags from summary
                    clean_summary = re.sub(r'<[^>]+>', '', summary_text).strip()
                    
                    cve_match = re.search(r"CVE-\d{4}-\d+", clean_summary)
                    cve = cve_match.group(0) if cve_match else f"CVE-2026-{hash(entry.get('title', '')) % 10000:04d}"
                    
                    pub_date = entry.get("published", "")
                    date_str = pub_date[:10] if len(pub_date) >= 10 else "2026-08-01"
                    
                    normalized.append(normalize_vulnerability({
                        "cve": cve,
                        "vendor": "Security Intel",
                        "product": entry.get("title", "Ingested RSS Security Advisory"),
                        "threatType": "Security Broadcast",
                        "severity": "High" if "exploit" in clean_summary.lower() or "critical" in clean_summary.lower() else "Warning",
                        "publishedDate": date_str,
                        "summary": clean_summary[:300] + ("..." if len(clean_summary) > 300 else ""),
                        "remediation": "Audit network signatures and refer to vendor security releases.",
                        "cvssScore": 7.5 if "exploit" in clean_summary.lower() else 6.5,
                        "attackVector": "Network (AV:N/AC:L/PR:N/UI:N)",
                        "references": [entry.get("link")] if entry.get("link") else []
                    }, "RSS Advisories Feed"))
            except (OSError, PermissionError) as e:
                if not RssScraper._network_warned:
                    logger.warning(f"Network access blocked — skipping RSS feed {url} ({e.__class__.__name__})")
                    RssScraper._network_warned = True
            except Exception as e:
                logger.error(f"Error parsing RSS feed from {url}: {e}")
                
        return normalized
