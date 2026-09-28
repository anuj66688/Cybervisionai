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

def _create_response(content_bytes, media_type: str, filename: str, inline: bool = False):
    """Construct a StreamingResponse with appropriate Content‑Disposition.
    * ``inline=True`` – the browser will try to display the file (preview).
    * ``inline=False`` – the file is offered as a download.
    """
    disposition = "inline" if inline else "attachment"
    response = StreamingResponse(iter([content_bytes.getvalue()]), media_type=media_type)
    response.headers["Content-Disposition"] = f"{disposition}; filename={filename}"
    return response

@router.get("/csv")
def export_csv(current_user: dict = Depends(get_current_user)):
    try:
        threats = threat_repo.get_all(limit=100)
        csv_file = generate_csv_report(threats)
        return _create_response(csv_file, "text/csv", "cybervision_incidents_export.csv")
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
        return _create_response(
            excel_bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "cybervision_incidents_export.xlsx",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Excel sheet: {e}"
        )

@router.get("/pdf")
def export_pdf(current_user: dict = Depends(get_current_user)):
    """Download PDF report as an attachment."""
    try:
        threats = threat_repo.get_all(limit=100)
        pdf_bytes = generate_pdf_report(threats)
        return _create_response(pdf_bytes, "application/pdf", "cybervision_threat_intelligence_report.pdf")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF brief: {e}"
        )

@router.get("/pdf/preview")
def preview_pdf(current_user: dict = Depends(get_current_user)):
    """Preview PDF report inline in the browser before downloading."""
    try:
        threats = threat_repo.get_all(limit=100)
        pdf_bytes = generate_pdf_report(threats)
        return _create_response(pdf_bytes, "application/pdf", "cybervision_report_preview.pdf", inline=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF preview: {e}"
        )
