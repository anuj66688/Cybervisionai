import httpx
import logging
from typing import List, Dict, Any
from app.scrapers.normalizer import normalize_vulnerability

logger = logging.getLogger("cybervision.scraper.github")

GITHUB_ADVISORY_URL = "https://api.github.com/advisories"

class GitHubScraper:
    _network_warned = False

    def fetch_vulnerabilities(self) -> List[Dict[str, Any]]:
        logger.info("Accessing GitHub Advisory database...")
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(GITHUB_ADVISORY_URL, headers={"Accept": "application/vnd.github.v3+json"})
                if response.status_code == 200:
                    advisories = response.json()
                    logger.info(f"Ingested {len(advisories)} advisories from GitHub.")
                    GitHubScraper._network_warned = False
                    
                    normalized = []
                    for item in advisories[:5]:
                        identifiers = item.get("identifiers", [])
                        cve = next((i.get("value") for i in identifiers if i.get("type") == "CVE"), "CVE-2026-GH")
                        
                        severity_map = {
                            "critical": "Critical",
                            "high": "High",
                            "moderate": "Warning",
                            "low": "Info"
                        }
                        raw_sev = item.get("severity", "moderate")
                        severity = severity_map.get(raw_sev.lower(), "Warning")
                        
                        cvss = item.get("cvss", {})
                        score = (cvss.get("score") or 6.5) if cvss else 6.5
                        
                        normalized.append(normalize_vulnerability({
                            "cve": cve,
                            "vendor": "OpenSource community",
                            "product": item.get("summary", "Developer Repository"),
                            "threatType": "Advisory Notice",
                            "severity": severity,
                            "publishedDate": item.get("published_at", "").split("T")[0],
                            "summary": item.get("description", "No details supplied."),
                            "remediation": "Upgrade package dependencies to secure release commits.",
                            "cvssScore": score,
                            "attackVector": "Network (AV:N/AC:L/PR:N/UI:N)"
                        }, "GitHub Advisory Ingest"))
                    return normalized
        except (OSError, PermissionError) as e:
            if not GitHubScraper._network_warned:
                logger.warning(f"Network access blocked — skipping GitHub scrape ({e.__class__.__name__})")
                GitHubScraper._network_warned = True
        except httpx.RequestError as e:
            if not GitHubScraper._network_warned:
                logger.warning(f"Network unreachable — skipping GitHub scrape ({e})")
                GitHubScraper._network_warned = True
        except Exception as e:
            logger.error(f"Unexpected error accessing GitHub Advisory DB: {e}")
            
        return []
