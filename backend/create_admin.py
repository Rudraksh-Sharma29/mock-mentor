import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.user import User
from backend.app.utils.security import hash_password

def create_admin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com").lower().strip()
        admin_password = os.getenv("ADMIN_PASSWORD", "AdminPassword123!")

        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            print(f"Admin user already exists with email: {admin_email}")
            if existing_admin.role != "admin":
                existing_admin.role = "admin"
                db.commit()
                print(f"Updated user role to admin for: {admin_email}")
            return

        admin_user = User(
            name="System Administrator",
            email=admin_email,
            password_hash=hash_password(admin_password),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Admin user created successfully! Email: {admin_email}")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
