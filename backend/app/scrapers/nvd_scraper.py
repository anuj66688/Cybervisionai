import httpx
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from app.scrapers.normalizer import normalize_vulnerability
from app.core.config import settings

logger = logging.getLogger("cybervision.scraper.nvd")

NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

class NvdScraper:
    _network_warned = False  # Log the network-blocked message only once

    def fetch_vulnerabilities(self, limit: int = 15, days_back: int = 120) -> List[Dict[str, Any]]:
        logger.info("Querying NVD API directory...")
        headers = {}
        if settings.NVD_API_KEY and settings.NVD_API_KEY.strip():
            headers["apiKey"] = settings.NVD_API_KEY.strip()
            
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=days_back)
        date_format = "%Y-%m-%dT%H:%M:%S.000Z"
        
        # Primary parameter set using strict ISO-8601 UTC date bounds
        params_list = [
            {
                "resultsPerPage": limit,
                "pubStartDate": start_date.strftime(date_format),
                "pubEndDate": now.strftime(date_format)
            },
            {
                "resultsPerPage": limit
            }
        ]
        
        try:
            with httpx.Client(timeout=20.0) as client:
                for params in params_list:
                    try:
                        response = client.get(NVD_API_URL, headers=headers, params=params)
                        if response.status_code == 200:
                            data = response.json()
                            vulnerabilities = data.get("vulnerabilities", [])
                            if vulnerabilities:
                                logger.info(f"Ingested {len(vulnerabilities)} vulnerabilities from NVD API.")
                                NvdScraper._network_warned = False  # Reset on success
                                normalized = []
                                for vuln in vulnerabilities:
                                    cve_data = vuln.get("cve", {})
                                    cve_id = cve_data.get("id")
                                    descriptions = cve_data.get("descriptions", [])
                                    desc_text = descriptions[0].get("value") if descriptions else "No description available."
                                    
                                    metrics = cve_data.get("metrics", {})
                                    cvss_score = 5.0
                                    attack_vector = "Network"
                                    
                                    cvss_list = (
                                        metrics.get("cvssMetricV40", []) or
                                        metrics.get("cvssMetricV31", []) or
                                        metrics.get("cvssMetricV30", []) or
                                        metrics.get("cvssMetricV2", [])
                                    )
                                    if cvss_list:
                                        cvss_info = cvss_list[0].get("cvssData", {})
                                        cvss_score = cvss_info.get("baseScore", 5.0)
                                        attack_vector = cvss_info.get("attackVector", cvss_info.get("accessVector", "Network"))
                                        if isinstance(attack_vector, str):
                                            attack_vector = attack_vector.capitalize()
                                    
                                    source_id = cve_data.get("sourceIdentifier", "NVD Vendor")
                                    vendor_name = source_id.split("@")[0] if "@" in source_id else "NVD Advisory"
                                    references_list = [r.get("url") for r in cve_data.get("references", []) if r.get("url")]

                                    normalized.append(normalize_vulnerability({
                                        "cve": cve_id,
                                        "vendor": vendor_name.capitalize(),
                                        "product": f"Vulnerability {cve_id}",
                                        "threatType": "Ingested CVE Vulnerability",
                                        "severity": "Critical" if cvss_score >= 9.0 else "High" if cvss_score >= 7.0 else "Warning",
                                        "publishedDate": cve_data.get("published", "").split("T")[0],
                                        "summary": desc_text,
                                        "remediation": "Audit affected systems and apply vendor security patch releases.",
                                        "cvssScore": cvss_score,
                                        "attackVector": attack_vector,
                                        "references": references_list[:3]
                                    }, "NVD Directory API"))
                                
                                return normalized
                        else:
                            logger.warning(f"NVD API returned HTTP status {response.status_code} with params {params}")
                    except (OSError, PermissionError) as e:
                        if not NvdScraper._network_warned:
                            logger.warning(f"Network access blocked — skipping NVD scrape ({e.__class__.__name__})")
                            NvdScraper._network_warned = True
                        return []
                    except httpx.RequestError as e:
                        if not NvdScraper._network_warned:
                            logger.warning(f"Network unreachable — skipping NVD scrape ({e})")
                            NvdScraper._network_warned = True
                        return []
        except (OSError, PermissionError) as e:
            if not NvdScraper._network_warned:
                logger.warning(f"Network access blocked — skipping NVD scrape ({e.__class__.__name__})")
                NvdScraper._network_warned = True
            return []
        except Exception as e:
            logger.error(f"Unexpected error querying NVD API: {e}")
            
        return []
