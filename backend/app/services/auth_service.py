from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.schemas.auth import UserRegister, UserLogin
from backend.app.utils.security import hash_password, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        if user_data.password != user_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        email_clean = user_data.email.lower().strip()
        existing_user = db.query(User).filter(User.email == email_clean).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )

        new_user = User(
            name=user_data.name.strip(),
            email=email_clean,
            password_hash=hash_password(user_data.password),
            role="user"  # Frontend can never choose admin role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> dict:
        email_clean = credentials.email.lower().strip()
        user = db.query(User).filter(User.email == email_clean).first()
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
