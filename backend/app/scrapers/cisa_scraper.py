import httpx
import logging
from typing import List, Dict, Any
from app.scrapers.normalizer import normalize_vulnerability

logger = logging.getLogger("cybervision.scraper.cisa")

CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

class CisaScraper:
    _network_warned = False

    def fetch_vulnerabilities(self) -> List[Dict[str, Any]]:
        logger.info("Ingesting CISA KEV catalog...")
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(CISA_KEV_URL)
                if response.status_code == 200:
                    data = response.json()
                    vulnerabilities = data.get("vulnerabilities", [])
                    logger.info(f"Ingested {len(vulnerabilities)} vulnerabilities from CISA KEV.")
                    CisaScraper._network_warned = False
                    
                    normalized = []
                    # Process top 15 recent alerts to keep ingestion rates clean
                    for item in vulnerabilities[:15]:
                        normalized.append(normalize_vulnerability({
                            "cve": item.get("cveID"),
                            "vendor": item.get("vendorProject"),
                            "product": item.get("product"),
                            "threatType": item.get("vulnerabilityName"),
                            "severity": "Critical" if "Remote Code Execution" in item.get("vulnerabilityName", "") else "High",
                            "publishedDate": item.get("dateAdded"),
                            "summary": item.get("shortDescription"),
                            "remediation": item.get("requiredAction"),
                            "references": [item.get("notes")] if item.get("notes") else [],
                            "cvssScore": 8.5,
                            "attackVector": "Network (AV:N/AC:L/PR:N/UI:N)"
                        }, "CISA KEV Feed"))
                    return normalized
        except (OSError, PermissionError) as e:
            if not CisaScraper._network_warned:
                logger.warning(f"Network access blocked — skipping CISA scrape ({e.__class__.__name__})")
                CisaScraper._network_warned = True
        except httpx.RequestError as e:
            if not CisaScraper._network_warned:
                logger.warning(f"Network unreachable — skipping CISA scrape ({e})")
                CisaScraper._network_warned = True
        except Exception as e:
            logger.error(f"Unexpected error fetching CISA KEV catalog: {e}")
            
        return []
