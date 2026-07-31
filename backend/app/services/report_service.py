import io
import csv
from datetime import datetime
import pandas as pd
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_csv_report(threats: List[Dict[str, Any]]) -> io.StringIO:
    output = io.StringIO()
    writer = csv.writer(output)
    # Header
    writer.writerow(["CVE", "Vendor", "Product", "Threat Type", "Severity", "CVSS Score", "Published Date", "Source", "Status"])
    
    for t in threats:
        writer.writerow([
            t.get("cve", ""),
            t.get("vendor", ""),
            t.get("product", ""),
            t.get("threatType", ""),
            t.get("severity", ""),
            t.get("cvssScore", 5.0),
            t.get("publishedDate", ""),
            t.get("source", ""),
            t.get("status", "")
        ])
    output.seek(0)
    return output

def generate_excel_report(threats: List[Dict[str, Any]]) -> io.BytesIO:
    output = io.BytesIO()
    df = pd.DataFrame(threats)
    
    # Select subset of keys for clean formatting
    columns = ["cve", "vendor", "product", "threatType", "severity", "cvssScore", "publishedDate", "source", "status"]
    if not df.empty:
        # Keep only existing columns
        cols_to_keep = [c for c in columns if c in df.columns]
        df = df[cols_to_keep]
        # Rename for clean capital headers
        df.columns = [c.upper() for c in df.columns]
        
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Threat Ingestions")
        
    output.seek(0)
    return output

def generate_pdf_report(threats: List[Dict[str, Any]]) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        textColor=colors.HexColor('#2563EB'),
        fontSize=18,
        spaceAfter=12
    )
    normal_style = styles['Normal']
    
    story.append(Paragraph("CyberVision AI - Threat Telemetry Report", title_style))
    story.append(Paragraph(f"Report Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC", normal_style))
    story.append(Spacer(1, 15))
    
    # Table headers
    table_data = [["CVE", "VENDOR", "PRODUCT", "SEVERITY", "CVSS", "STATUS"]]
    for t in threats[:25]: # Cap at 25 items for visual layout clarity
        table_data.append([
            t.get("cve", ""),
            t.get("vendor", ""),
            t.get("product", "")[:15] + "..." if len(t.get("product", "")) > 15 else t.get("product", ""),
            t.get("severity", ""),
            str(t.get("cvssScore", 5.0)),
            t.get("status", "")
        ])
        
    table = Table(table_data, colWidths=[90, 80, 110, 80, 50, 70])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111827')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#06B6D4')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#374151')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('FONTSIZE', (0,0), (-1,-1), 9),
    ]))
    story.append(table)
    doc.build(story)
    buffer.seek(0)
    return buffer
