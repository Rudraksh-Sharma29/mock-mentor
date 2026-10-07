from fastapi import APIRouter, Depends
from backend.app.schemas.auth import UserResponse
from backend.app.models.user import User
from backend.app.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
