from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import init_db
from backend.app.routers import (
    auth,
    users,
    interviews,
    questions,
    admin,
    resume,
    websocket,
)

# Automatically initialize database & run lightweight migrations
init_db()

app = FastAPI(
    title="Mock Mentor API",
    description="Resume-Powered Live AI Mock Interview Platform API with Gemini Flash & Gemini Live.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include HTTP Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(resume.router)
app.include_router(interviews.router)
app.include_router(questions.router)
app.include_router(admin.router)

# Include WebSocket Routers
app.include_router(websocket.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Mock Mentor AI Platform",
        "phase": "Phase 2 & Phase 3 (Resume Analysis + Live AI Mentor)"
    }
