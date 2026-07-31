from datetime import datetime
from typing import Dict, Any

def normalize_vulnerability(raw: Dict[str, Any], source: str) -> Dict[str, Any]:
    """
    Standardizes threat models ingested from NVD, CISA, GitHub, and RSS feeds.
    """
    cve = raw.get("cve", "CVE-2026-TEMP")
    vendor = raw.get("vendor", "Unknown Vendor")
    product = raw.get("product", "Unknown Product")
    threat_type = raw.get("threatType", "Vulnerability Alert")
    severity = raw.get("severity", "Warning")
    published_date = raw.get("publishedDate", datetime.utcnow().strftime("%Y-%m-%d"))
    summary = raw.get("summary", "No details provided.")
    remediation = raw.get("remediation", "No mitigation strategy has been assigned yet.")
    references = raw.get("references", [])
    cvss_score = float(raw.get("cvssScore", 5.0))
    attack_vector = raw.get("attackVector", "Network (AV:N/AC:L/PR:N/UI:N)")
    status = raw.get("status", "active")
    country_code = raw.get("countryCode", "US")
    timestamp = raw.get("timestamp", datetime.utcnow().isoformat())

    return {
        "cve": cve,
        "vendor": vendor,
        "product": product,
        "threatType": threat_type,
        "severity": severity,
        "publishedDate": published_date,
        "source": source,
        "summary": summary,
        "remediation": remediation,
        "references": references,
        "cvssScore": cvss_score,
        "attackVector": attack_vector,
        "status": status,
        "countryCode": country_code,
        "timestamp": timestamp
    }
