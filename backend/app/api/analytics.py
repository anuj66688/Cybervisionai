from fastapi import APIRouter, Depends, HTTPException, status
from collections import Counter
from app.repositories.threat_repository import threat_repo
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])

@router.get("/dashboard")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        
        # Total threats count
        total_threats = len(threats)
        
        # Calculate counts per severity
        severity_counts = Counter(t.get("severity", "Info") for t in threats)
        critical_alerts = severity_counts.get("Critical", 0)
        high_severity = severity_counts.get("High", 0)
        
        # Dummy mock stats for static dashboard fields
        latest_cves = len(set(t.get("cve", "") for t in threats if "CVE" in t.get("cve", "")))
        ai_processed = sum(1 for t in threats if "AI" in t.get("summary", ""))
        
        return {
            "totalThreats": total_threats,
            "criticalAlerts": critical_alerts,
            "highSeverity": high_severity,
            "latestCves": latest_cves,
            "aiProcessed": ai_processed,
            "dataSourcesCount": 4,
            "ingestionFidelity": 98.4
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile dashboard summaries: {e}"
        )

@router.get("/vendors")
def get_vendor_distribution(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        vendor_counts = Counter(t.get("vendor", "Generic") for t in threats)
        
        # Format for Chart.js inputs: { labels: [], data: [] }
        sorted_vendors = vendor_counts.most_common(5)
        labels = [item[0] for item in sorted_vendors]
        data = [item[1] for item in sorted_vendors]
        
        return {
            "labels": labels,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile vendor distributions: {e}"
        )

@router.get("/severity")
def get_severity_distribution(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        severity_counts = Counter(t.get("severity", "Info") for t in threats)
        
        labels = ["Critical", "High", "Warning", "Info"]
        data = [severity_counts.get(l, 0) for l in labels]
        
        return {
            "labels": labels,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile severity allocations: {e}"
        )

@router.get("/categories")
def get_category_distribution(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        category_counts = Counter(t.get("threatType", "Other Attack") for t in threats)
        
        sorted_cats = category_counts.most_common(5)
        labels = [item[0] for item in sorted_cats]
        data = [item[1] for item in sorted_cats]
        
        return {
            "labels": labels,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile category allocations: {e}"
        )
