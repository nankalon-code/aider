import datetime
import random
from database import SessionLocal, Enrollee, Grievance, Base, engine

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    if db.query(Enrollee).count() > 0:
        print("Database already seeded")
        db.close()
        return

    centres = ["Okhla Ph-1", "Tiruppur Hub", "Peenya Industrial", "Surat Textile Park"]
    names = ["Asha Devi", "Sunita M.", "Ramesh K.", "Priya S.", "Anjali P.", "Karthik R.", "Meena T."]
    
    for _ in range(50):
        enrollee = Enrollee(
            name=random.choice(names) + str(random.randint(1, 100)),
            centre=random.choice(centres),
            enrolment_date=datetime.date.today() - datetime.timedelta(days=random.randint(10, 60)),
            status=random.choices(["Active", "Completed", "Dropped Out"], weights=[70, 10, 20])[0],
            risk_score=random.choices(["Low", "Medium", "High"], weights=[60, 20, 20])[0]
        )
        db.add(enrollee)

    grievance_categories = ["Unpaid Wages", "Verbal Abuse", "Unsafe Machinery", "Overtime Dispute"]
    
    for _ in range(30):
        g = Grievance(
            reporter_name=random.choice(names),
            centre=random.choice(centres),
            date_logged=datetime.date.today() - datetime.timedelta(days=random.randint(1, 30)),
            category=random.choice(grievance_categories),
            status=random.choices(["Open", "In Progress", "Resolved"], weights=[40, 20, 40])[0],
        )
        if g.status == "Resolved":
            g.date_resolved = g.date_logged + datetime.timedelta(days=random.randint(1, 14))
        db.add(g)

    db.commit()
    db.close()
    print("Database seeded with synthetic data.")

if __name__ == "__main__":
    seed_data()
