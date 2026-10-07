from backend.app.routers.auth import router as auth_router
from backend.app.routers.users import router as users_router
from backend.app.routers.interviews import router as interviews_router
from backend.app.routers.questions import router as questions_router
from backend.app.routers.admin import router as admin_router
from backend.app.routers.resume import router as resume_router
from backend.app.routers.websocket import router as websocket_router

__all__ = [
    "auth_router",
    "users_router",
    "interviews_router",
    "questions_router",
    "admin_router",
    "resume_router",
    "websocket_router",
]
