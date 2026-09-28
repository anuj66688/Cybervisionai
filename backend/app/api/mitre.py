from fastapi import APIRouter, Depends, HTTPException, status
from app.services.mitre_service import mitre_service
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/mitre", tags=["MITRE ATT&CK Matrix"])

@router.get("/matrix")
def get_mitre_matrix(
    current_user: dict = Depends(get_current_user)
):
    """
    Returns the complete MITRE ATT&CK Enterprise Matrix heat-map populated with active threats.
    """
    try:
        return mitre_service.get_matrix_data()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate MITRE ATT&CK matrix: {e}"
        )
