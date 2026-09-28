import sys
import os

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Dark Slate
    accent_color = colors.HexColor("#2563eb")  # Blue
    secondary_color = colors.HexColor("#475569") # Muted slate
    bg_light = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=accent_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
        backColor=bg_light,
        borderColor=border_color,
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=8
    )

    story = []

    # Title & Header Banner
    story.append(Paragraph("CyberVision AI — Project Execution Guide", title_style))
    story.append(Paragraph("Comprehensive Step-by-Step Setup, Configuration, and Troubleshooting Guide", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=12))

    # Architecture Summary
    story.append(Paragraph("1. System Architecture Overview", h1_style))
    arch_text = (
        "<b>CyberVision AI</b> is an enterprise threat intelligence and vulnerability management platform. "
        "The architecture is composed of two primary sub-systems working in tandem:<br/>"
        "• <b>Backend API Server:</b> Powered by FastAPI (Python), APScheduler (background ingesters), "
        "NVD CVE API, RSS Scrapers, and Firebase Admin SDK.<br/>"
        "• <b>Frontend Dashboard:</b> Next.js 16 (React 19, TypeScript, Tailwind CSS, Chart.js) providing a real-time SOC dashboard."
    )
    story.append(Paragraph(arch_text, body_style))
    story.append(Spacer(1, 8))

    # Environment Prerequisites
    story.append(Paragraph("2. Prerequisites & Environment Setup", h1_style))
    prereqs = [
        "<b>Python 3.10+</b> (with virtualenv enabled)",
        "<b>Node.js v18+ or v20+</b> (with npm 9+)",
        "<b>Firebase Credentials JSON:</b> Located at root or specified in backend <code>.env</code> file",
        "<b>NVD API Key:</b> Configured for automated threat intelligence scraping"
    ]
    for p in prereqs:
        story.append(Paragraph(f"• {p}", bullet_style))
    story.append(Spacer(1, 8))

    # Step-by-Step Backend
    story.append(Paragraph("3. Backend Setup & Startup Instructions", h1_style))
    
    b_step1 = (
        "<b>Step 3.1: Navigate to Backend Directory</b><br/>"
        "Open a terminal and navigate to the backend folder:"
    )
    story.append(Paragraph(b_step1, body_style))
    story.append(Paragraph("cd backend", code_style))

    b_step2 = (
        "<b>Step 3.2: Create and Activate Virtual Environment</b><br/>"
        "<b>On Windows (PowerShell):</b>"
    )
    story.append(Paragraph(b_step2, body_style))
    story.append(Paragraph("python -m venv venv\n.\\venv\\Scripts\\Activate.ps1", code_style))
    story.append(Paragraph("<b>On Linux / macOS:</b>", body_style))
    story.append(Paragraph("python3 -m venv venv\nsource venv/bin/activate", code_style))

    b_step3 = (
        "<b>Step 3.3: Install Dependencies</b><br/>"
        "Install required Python packages:"
    )
    story.append(Paragraph(b_step3, body_style))
    story.append(Paragraph("pip install -r requirements.txt", code_style))

    b_step4 = (
        "<b>Step 3.4: Configure Environment Variables (.env)</b><br/>"
        "Ensure <code>backend/.env</code> contains valid paths and keys:"
    )
    story.append(Paragraph(b_step4, body_style))
    env_content = (
        "ENV=development\n"
        "DEBUG=True\n"
        "FIREBASE_PROJECT_ID=cybervisionai-35391\n"
        "FIREBASE_CREDENTIALS_PATH=d:/cybervision/cybervisionai-35391-firebase-adminsdk-fbsvc-8862f9826d.json\n"
        "NVD_API_KEY=ffe133eb-5c4d-4039-b5aa-338912a17059"
    )
    story.append(Paragraph(env_content.replace("\n", "<br/>"), code_style))

    b_step5 = (
        "<b>Step 3.5: Launch FastAPI Backend Server</b><br/>"
        "Run the server with Uvicorn (hot-reloading enabled):"
    )
    story.append(Paragraph(b_step5, body_style))
    story.append(Paragraph("python main.py\n# Or directly:\nuvicorn main:app --host 0.0.0.0 --port 8000 --reload", code_style))

    story.append(Spacer(1, 8))

    # Step-by-Step Frontend
    story.append(Paragraph("4. Frontend Setup & Startup Instructions", h1_style))

    f_step1 = (
        "<b>Step 4.1: Open Terminal in Frontend Directory</b>"
    )
    story.append(Paragraph(f_step1, body_style))
    story.append(Paragraph("cd frontend", code_style))

    f_step2 = (
        "<b>Step 4.2: Install Dependencies</b>"
    )
    story.append(Paragraph(f_step2, body_style))
    story.append(Paragraph("npm install", code_style))

    f_step3 = (
        "<b>Step 4.3: Launch Next.js Development Server</b>"
    )
    story.append(Paragraph(f_step3, body_style))
    story.append(Paragraph("npm run dev", code_style))
    
    f_step4 = (
        "<b>Step 4.4: Access the Frontend Dashboard</b><br/>"
        "Open your web browser and navigate to: <b>http://localhost:3000</b>"
    )
    story.append(Paragraph(f_step4, body_style))

    story.append(Spacer(1, 8))

    # Verification & Diagnostic Table
    story.append(Paragraph("5. Verification & Service Endpoints", h1_style))
    
    data = [
        [Paragraph("<b>Service</b>", body_style), Paragraph("<b>URL / Location</b>", body_style), Paragraph("<b>Expected Output / Purpose</b>", body_style)],
        [Paragraph("Frontend UI", body_style), Paragraph("http://localhost:3000", body_style), Paragraph("CyberVision SOC Dashboard Interface", body_style)],
        [Paragraph("Backend Root API", body_style), Paragraph("http://localhost:8000/", body_style), Paragraph('{"status": "online", "database": "connected"}', body_style)],
        [Paragraph("Swagger API Docs", body_style), Paragraph("http://localhost:8000/docs", body_style), Paragraph("Interactive API specification & endpoints", body_style)],
        [Paragraph("ReDoc API Docs", body_style), Paragraph("http://localhost:8000/redoc", body_style), Paragraph("Alternative OpenAPI documentation", body_style)],
        [Paragraph("Backend Test Suite", body_style), Paragraph("cd backend && pytest", body_style), Paragraph("Runs pytest suite for repositories/scrapers", body_style)]
    ]
    t = Table(data, colWidths=[1.5*inch, 2.2*inch, 3.3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('TEXTCOLOR', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)

    story.append(Spacer(1, 10))

    # Troubleshooting Section
    story.append(Paragraph("6. Troubleshooting Guide", h1_style))
    troubleshoot_items = [
        "<b>Firebase Credential File Not Found:</b> Verify `FIREBASE_CREDENTIALS_PATH` in `backend/.env` points to the absolute path of your JSON key file.",
        "<b>Port Conflict (8000 or 3000 in use):</b> Identify and terminate conflicting processes, or specify `--port 8001` for uvicorn.",
        "<b>Missing Dependencies:</b> Ensure your virtual environment is active before running `pip install -r requirements.txt`.",
        "<b>CORS Errors:</b> Ensure backend server is running and `API_BASE_URL` in `frontend/utils/api.ts` is configured to `http://localhost:8000/api`."
    ]
    for item in troubleshoot_items:
        story.append(Paragraph(f"• {item}", bullet_style))

    doc.build(story)
    print("PDF build successful:", filename)

if __name__ == "__main__":
    out_pdf = "d:/cybervision/CyberVision_AI_Execution_Guide.pdf"
    build_pdf(out_pdf)
