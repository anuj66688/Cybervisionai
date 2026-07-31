from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.repositories.threat_repository import threat_repo
from app.middleware.auth import get_current_user
from app.services.report_service import (
    generate_csv_report,
    generate_excel_report,
    generate_pdf_report,
)

router = APIRouter(prefix="/reports", tags=["Report Exporters"])

@router.get("/csv")
def export_csv(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        csv_file = generate_csv_report(threats)
        
        response = StreamingResponse(
            iter([csv_file.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=cybervision_incidents_export.csv"
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate CSV export file: {e}"
        )

@router.get("/excel")
def export_excel(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        excel_bytes = generate_excel_report(threats)
        
        response = StreamingResponse(
            iter([excel_bytes.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response.headers["Content-Disposition"] = "attachment; filename=cybervision_incidents_export.xlsx"
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Excel sheet: {e}"
        )

@router.get("/pdf")
def export_pdf(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        pdf_bytes = generate_pdf_report(threats)
        
        response = StreamingResponse(
            iter([pdf_bytes.getvalue()]),
            media_type="application/pdf"
        )
        response.headers["Content-Disposition"] = "attachment; filename=cybervision_threat_intelligence_report.pdf"
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF brief: {e}"
        )
