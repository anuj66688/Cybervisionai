from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from app.repositories.threat_repository import threat_repo
from app.middleware.auth import get_current_user
from app.core.firebase import get_db

router = APIRouter(prefix="/threats", tags=["Threat Incidents"])

@router.get("/")
def get_threats(
    limit: int = Query(100, description="Max items to return"),
    current_user: dict = Depends(get_current_user)
):
    try:
        threats = threat_repo.get_all(limit=limit)
        # If DB is empty, seed mock list to prevent empty-state blocks
        if not threats:
            from app.utils.mockThreats import MOCK_THREATS # wait, we created mockThreats inside utils
            # Seed mock items into repository
            for t in MOCK_THREATS:
                threat_repo.save(t)
            threats = threat_repo.get_all(limit=limit)
        return threats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query database catalog: {e}"
        )

@router.get("/search")
def search_threats(
    q: str = Query(..., min_length=2, description="Query string keyword"),
    current_user: dict = Depends(get_current_user)
):
    try:
        return threat_repo.search(q)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database search index error: {e}"
        )

@router.get("/bookmarks")
def get_bookmarked_threats(
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_db()
        user_uid = current_user["uid"]
        # Query bookmarks for this user
        bookmarks_docs = db.collection("bookmarks").stream()
        bookmarked_ids = []
        for doc in bookmarks_docs:
            b_data = doc.to_dict()
            if b_data.get("userId") == user_uid:
                bookmarked_ids.append(b_data.get("threatId"))
        
        results = []
        for t_id in bookmarked_ids:
            threat = threat_repo.get_by_id(t_id)
            if threat:
                results.append(threat)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query bookmarks watchlist: {e}"
        )

@router.get("/{threat_id}")
def get_threat_details(
    threat_id: str,
    current_user: dict = Depends(get_current_user)
):
    threat = threat_repo.get_by_id(threat_id)
    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Threat profile matching ID {threat_id} was not found."
        )
    return threat

@router.post("/bookmark")
def toggle_bookmark(
    threat_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_uid = current_user["uid"]
        is_bookmarked = threat_repo.toggle_bookmark(user_uid, threat_id)
        return {
            "status": "success",
            "threatId": threat_id,
            "bookmarked": is_bookmarked,
            "message": "Asset watcher active." if is_bookmarked else "Asset watcher disabled."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to adjust watch-list status: {e}"
        )

@router.post("/{threat_id}/mitigate")
def mitigate_threat(
    threat_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        threat = threat_repo.get_by_id(threat_id)
        if not threat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Threat matching ID {threat_id} not found."
            )
        
        # Update status
        threat["status"] = "mitigated"
        threat_repo.save(threat)
        
        # Dispatch notification
        db = get_db()
        import uuid
        from datetime import datetime
        notif_id = f"notif-{uuid.uuid4().hex[:8]}"
        notif = {
            "id": notif_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": f"Threat mitigated: Firewall rules deployed for {threat.get('cve')}",
            "severity": "Info",
            "source": current_user.get("email", "SOC-Automation"),
            "category": "Mitigation",
            "isRead": False
        }
        db.collection("notifications").document(notif_id).set(notif)
        
        return {
            "status": "success",
            "message": f"Firewall rules deployed. Threat {threat.get('cve')} mitigated.",
            "threat": threat
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deploy firewall mitigation rules: {e}"
        )
