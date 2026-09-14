from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Enrollee, Grievance
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
def get_overview(db: Session = Depends(get_db)):
    total_enrollees = db.query(Enrollee).count()
    active_enrollees = db.query(Enrollee).filter(Enrollee.status == "Active").count()
    total_grievances = db.query(Grievance).count()
    resolved_grievances = db.query(Grievance).filter(Grievance.status == "Resolved").count()
    
    return {
        "totalEnrollees": total_enrollees,
        "activeEnrollees": active_enrollees,
        "totalGrievances": total_grievances,
        "resolvedGrievances": resolved_grievances,
    }

@app.get("/api/dashboard/enrollees")
def get_enrollees(db: Session = Depends(get_db)):
    enrollees = db.query(Enrollee).all()
    return [{"id": e.id, "name": e.name, "centre": e.centre, "status": e.status, "riskScore": e.risk_score} for e in enrollees]

@app.get("/api/dashboard/grievances")
def get_grievances(db: Session = Depends(get_db)):
    grievances = db.query(Grievance).all()
    return [{"id": g.id, "reporterName": g.reporter_name, "category": g.category, "status": g.status, "centre": g.centre} for g in grievances]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
