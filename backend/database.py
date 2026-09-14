import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./outreach_pulse.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UploadBatch(Base):
    __tablename__ = "upload_batches"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String)  # Processed, Needs Review

class Enrollee(Base):
    __tablename__ = "enrollees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    centre = Column(String, index=True)
    enrolment_date = Column(Date)
    status = Column(String)  # Active, Dropped Out, Completed
    risk_score = Column(String, default="Low") # Low, Medium, High
    
    attendances = relationship("AttendanceRecord", back_populates="enrollee")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    enrollee_id = Column(Integer, ForeignKey("enrollees.id"))
    date = Column(Date)
    present = Column(Boolean)

    enrollee = relationship("Enrollee", back_populates="attendances")

class Grievance(Base):
    __tablename__ = "grievances"
    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String, index=True)
    centre = Column(String, index=True)
    date_logged = Column(Date)
    category = Column(String)
    status = Column(String)  # Open, In Progress, Resolved
    date_resolved = Column(Date, nullable=True)

Base.metadata.create_all(bind=engine)
