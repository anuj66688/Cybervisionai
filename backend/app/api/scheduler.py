from fastapi import APIRouter, Depends, HTTPException, status
from app.scheduler.manager import run_ingestion_cycle
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/scheduler", tags=["Scheduler Control"])

@router.post("/run", status_code=status.HTTP_200_OK)
def trigger_manual_ingestion(current_user: dict = Depends(get_current_user)):
    try:
        count = run_ingestion_cycle()
        return {
            "status": "success",
            "message": "Manual intelligence ingestion run triggered successfully.",
            "ingestedRecords": count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Telemetry compilation cycle failed: {e}"
        )
