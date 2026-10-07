from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from backend.app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    return AuthService.register_user(db, user_data)

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    return AuthService.authenticate_user(db, credentials)
