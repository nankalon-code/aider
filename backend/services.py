import io
import pandas as pd
from thefuzz import process
from sqlalchemy.orm import Session
from database import Enrollee, Grievance
import datetime
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


# 1. Fuzzy Matching Ingestion
CANONICAL_COLUMNS = ['name', 'centre', 'date', 'status', 'category']

def process_csv(file_bytes: bytes, db: Session):
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception:
        df = pd.read_excel(io.BytesIO(file_bytes))
    
    # Fuzzy column matching
    mapped_columns = {}
    for col in df.columns:
        match, score = process.extractOne(col.lower(), CANONICAL_COLUMNS)
        if score > 80:
            mapped_columns[col] = match
            
    df = df.rename(columns=mapped_columns)
    
    # Needs review queue (mock implementation for prototype)
    needs_review = []
    
    # Process rows assuming it's an Enrollee list for this prototype
    if 'name' in df.columns and 'centre' in df.columns:
        for _, row in df.iterrows():
            if pd.isna(row.get('name')) or pd.isna(row.get('centre')):
                needs_review.append(row.to_dict())
                continue
                
            enrollee = Enrollee(
                name=str(row['name']),
                centre=str(row['centre']),
                status=str(row.get('status', 'Active')),
                enrolment_date=datetime.date.today(),
                risk_score='Low'
            )
            db.add(enrollee)
        db.commit()
    
    return {"mapped_columns": mapped_columns, "inserted": len(df) - len(needs_review), "needs_review": len(needs_review)}

# 2. PDF Report Generation
def generate_monthly_report(db: Session):
    if not REPORTLAB_AVAILABLE:
        # Fallback if ReportLab couldn't install due to zlib/pillow C-dependencies
        return io.BytesIO(b"%PDF-1.4\n% Mock PDF - Install zlib/Pillow for actual report generation.\n")
        
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, 750, "Outreach Pulse - Monthly Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 720, f"Generated: {datetime.date.today().strftime('%B %d, %Y')}")
    
    # Metrics
    total_e = db.query(Enrollee).count()
    active_e = db.query(Enrollee).filter(Enrollee.status == 'Active').count()
    total_g = db.query(Grievance).count()
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 680, "Summary Metrics")
    c.setFont("Helvetica", 12)
    c.drawString(50, 660, f"Total Enrollees: {total_e}")
    c.drawString(50, 640, f"Active Participants: {active_e}")
    c.drawString(50, 620, f"Total Grievances Logged: {total_g}")
    
    # High Risk
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 580, "High Risk Enrollees (Action Required)")
    
    high_risk = db.query(Enrollee).filter(Enrollee.risk_score == 'High').limit(10).all()
    y = 550
    c.setFont("Helvetica", 10)
    for hr in high_risk:
        c.drawString(50, y, f"- {hr.name} ({hr.centre})")
        y -= 20
        
    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer
