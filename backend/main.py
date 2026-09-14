from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Enrollee, Grievance
import services
import uvicorn

app = FastAPI(title="Outreach Pulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/dashboard/overview")
def get_overview(centre: str = None, db: Session = Depends(get_db)):
    q_e = db.query(Enrollee)
    q_g = db.query(Grievance)
    if centre and centre != "All Centres":
        q_e = q_e.filter(Enrollee.centre == centre)
        q_g = q_g.filter(Grievance.centre == centre)
        
    total_enrollees = q_e.count()
    active_enrollees = q_e.filter(Enrollee.status == "Active").count()
    total_grievances = q_g.count()
    resolved_grievances = q_g.filter(Grievance.status == "Resolved").count()
    
    return {
        "totalEnrollees": total_enrollees,
        "activeEnrollees": active_enrollees,
        "totalGrievances": total_grievances,
        "resolvedGrievances": resolved_grievances,
    }

@app.get("/api/dashboard/enrollees")
def get_enrollees(centre: str = None, db: Session = Depends(get_db)):
    q = db.query(Enrollee)
    if centre and centre != "All Centres":
        q = q.filter(Enrollee.centre == centre)
    enrollees = q.all()
    return [{"id": e.id, "name": e.name, "centre": e.centre, "status": e.status, "riskScore": e.risk_score} for e in enrollees]

@app.get("/api/dashboard/grievances")
def get_grievances(centre: str = None, db: Session = Depends(get_db)):
    q = db.query(Grievance)
    if centre and centre != "All Centres":
        q = q.filter(Grievance.centre == centre)
    grievances = q.all()
    return [{"id": g.id, "reporterName": g.reporter_name, "category": g.category, "status": g.status, "centre": g.centre} for g in grievances]

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    result = services.process_csv(contents, db)
    return result

@app.get("/api/reports/monthly")
def get_monthly_report(db: Session = Depends(get_db)):
    pdf_buffer = services.generate_monthly_report(db)
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=monthly_report.pdf"})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
