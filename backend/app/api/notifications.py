from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from app.core.firebase import get_db
from app.middleware.auth import get_current_user
from app.repositories.threat_repository import threat_repo
import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel

class SimulateActionRequest(BaseModel):
    action: str

class SimulatedThreatTemplate(BaseModel):
    cve: str
    vendor: str
    product: str
    threatType: str
    severity: str
    summary: str
    remediation: str
    cvssScore: float
    attackVector: str
    countryCode: str

ACTION_THREAT_TEMPLATES = {
    "critical_breach": SimulatedThreatTemplate(
        cve="CVE-2026-7719",
        vendor="Palo Alto Networks",
        product="GlobalProtect Gateway",
        threatType="Zero-Day Remote Access Breach",
        severity="Critical",
        summary="A simulated zero-day exploit chain was detected against the remote access perimeter, indicating active post-authentication shell deployment attempts.",
        remediation="Disable exposed portal access, rotate all privileged credentials, and deploy emergency IPS signatures to WAN edge appliances.",
        cvssScore=9.6,
        attackVector="Network (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H)",
        countryCode="US",
    ),
    "bruteforce_high": SimulatedThreatTemplate(
        cve="CVE-2026-5524",
        vendor="Okta",
        product="Workforce Identity",
        threatType="Credential Bruteforce Campaign",
        severity="High",
        summary="A simulated password spraying operation is targeting privileged federation sign-in endpoints with rotating source infrastructure.",
        remediation="Enforce conditional access challenges, lock targeted accounts, and deny traffic from the offending IP ranges.",
        cvssScore=8.4,
        attackVector="Network (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:M)",
        countryCode="GB",
    ),
}

logger = logging.getLogger("cybervision.api.notifications")
router = APIRouter(prefix="/notifications", tags=["Security Notifications"])

def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _build_notification(message: str, severity: str, source: str, category: str):
    notif_id = f"notif-{uuid.uuid4().hex[:8]}"
    return {
        "id": notif_id,
        "timestamp": _utc_now_iso(),
        "message": message,
        "severity": severity,
        "source": source,
        "category": category,
        "isRead": False,
    }

def _build_simulated_threat(template: SimulatedThreatTemplate):
    suffix = uuid.uuid4().hex[:4].upper()
    cve = f"{template.cve}-{suffix}"
    return {
        "id": f"threat-sim-{uuid.uuid4().hex[:8]}",
        "cve": cve,
        "vendor": template.vendor,
        "product": template.product,
        "threatType": template.threatType,
        "severity": template.severity,
        "publishedDate": datetime.now(timezone.utc).date().isoformat(),
        "source": "CyberVision Simulation Engine",
        "summary": template.summary,
        "remediation": template.remediation,
        "references": ["https://cybervision.local/simulated-incident-playbook"],
        "cvssScore": template.cvssScore,
        "attackVector": template.attackVector,
        "status": "active",
        "countryCode": template.countryCode,
        "timestamp": _utc_now_iso(),
    }

@router.get("/")
def get_notifications(current_user: dict = Depends(get_current_user)):
    try:
        db = get_db()
        docs = db.collection("notifications").stream()
        results = []
        for d in docs:
            data = d.to_dict()
            results.append(data)
        # Sort by timestamp descending
        results.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return results
    except Exception as e:
        logger.error(f"Failed to fetch notifications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {e}"
        )

@router.post("/simulate", status_code=status.HTTP_200_OK)
def simulate_notification_action(
    req: SimulateActionRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_db()
        action = req.action.strip().lower()

        if action == "critical_breach":
            threat = _build_simulated_threat(ACTION_THREAT_TEMPLATES[action])
            threat_repo.save(threat)
            notification = _build_notification(
                message=f"Simulated critical breach created for {threat['cve']} on {threat['product']}.",
                severity="Critical",
                source=current_user.get("email", "SOC-Automation"),
                category="Breach Simulation",
            )
            db.collection("notifications").document(notification["id"]).set(notification)
            return {
                "status": "success",
                "message": "Critical breach simulation injected into the live feed.",
                "notification": notification,
                "threat": threat,
            }

        if action == "bruteforce_high":
            threat = _build_simulated_threat(ACTION_THREAT_TEMPLATES[action])
            threat_repo.save(threat)
            notification = _build_notification(
                message=f"Simulated bruteforce campaign detected against identity controls for {threat['vendor']}.",
                severity="High",
                source=current_user.get("email", "SOC-Automation"),
                category="Identity Attack Simulation",
            )
            db.collection("notifications").document(notification["id"]).set(notification)
            return {
                "status": "success",
                "message": "High-severity bruteforce simulation injected into the live feed.",
                "notification": notification,
                "threat": threat,
            }

        if action == "network_sweep":
            notification = _build_notification(
                message="Network sweep simulation completed across WAN ingress points. No uncontained lateral movement detected.",
                severity="Info",
                source=current_user.get("email", "SOC-Automation"),
                category="Diagnostics",
            )
            db.collection("notifications").document(notification["id"]).set(notification)
            return {
                "status": "success",
                "message": "Network sweep completed successfully.",
                "notification": notification,
            }

        if action == "health_diagnostic":
            notification = _build_notification(
                message="Perimeter health diagnostic finished. Firewall, SIEM, and session audit checks all returned green.",
                severity="Info",
                source=current_user.get("email", "SOC-Automation"),
                category="Health Check",
            )
            db.collection("notifications").document(notification["id"]).set(notification)
            return {
                "status": "success",
                "message": "Deep perimeter diagnostic completed successfully.",
                "notification": notification,
                "checks": [
                    {"name": "Firewall Perimeter", "status": "healthy"},
                    {"name": "SIEM Log Ingest", "status": "healthy"},
                    {"name": "User Session Audits", "status": "healthy"},
                ],
            }

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported simulation action: {req.action}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to simulate action {req.action}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simulate action {req.action}: {e}"
        )

# Custom auth dependency checking query parameter 'token' for SSE streams
def get_current_user_sse(
    token: str = Query(None),
    db_ref = Depends(get_db)
):
    from app.core.firebase import MockFirestoreClient
    if isinstance(db_ref, MockFirestoreClient):
        return {
            "uid": "mock-analyst-uuid",
            "email": "analyst.lead@cybervision.ai",
            "name": "SecOps Analyst - Tier 3",
            "role": "Analyst"
        }

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token passcode query required for SSE listener hook."
        )
    try:
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name", "Unknown Analyst"),
            "role": decoded_token.get("role", "Analyst")
        }
    except Exception as e:
        logger.error(f"JWT verification token failure in SSE: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Analyst credentials token is invalid or has expired."
        )

@router.get("/stream")
async def stream_notifications(current_user: dict = Depends(get_current_user_sse)):
    async def event_generator():
        db = get_db()
        sent_ids = set()

        # Seed initial existing notification IDs
        docs = db.collection("notifications").stream()
        for d in docs:
            data = d.to_dict()
            sent_ids.add(data.get("id"))

        while True:
            try:
                docs = db.collection("notifications").stream()
                for d in docs:
                    data = d.to_dict()
                    notif_id = data.get("id")
                    if notif_id not in sent_ids:
                        sent_ids.add(notif_id)
                        yield f"data: {json.dumps(data)}\n\n"
            except Exception as e:
                logger.error(f"Error in SSE notification stream: {e}")
            await asyncio.sleep(2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
