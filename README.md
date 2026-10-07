# Mock Mentor — AI Resume-Driven Mock Interview Platform (Phase 1, 2 & 3)

Mock Mentor is an intelligent, resume-driven AI mock interview platform that conducts personalized, adaptive interviews tailored to a candidate's uploaded resume, evaluates technical and behavioral responses in real-time, and generates multi-dimensional performance scorecards and study guides.

---

## Architecture & Workflow

```text
┌─────────────────────────┐
│     Candidate Resume    │ (PDF / DOCX)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    Resume Parsing &     │ ➔ Extracts Profile, Skills, Projects,
│   Gemini AI Analysis    │   Experience & Verifiable Resume Claims
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Interview Configuration │ ➔ Selects Round (Technical, HR, Project-Based,
│        Strategy         │   Internship, Placement), Difficulty & Duration
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    Live AI Interview    │ ➔ Bidirectional WebSocket (`/ws/interview/{session_id}`)
│  (Voice / Text Dialogue)│ ➔ Speech-to-Text & Text-to-Speech audio synthesizer
└───────────┬─────────────┘ ➔ Adaptive follow-ups probing resume claims & depth
            │
            ▼
┌─────────────────────────┐
│ Detailed Review Report  │ ➔ 5-Metric Scorecard (Technical, Project, Comm, PS, Confidence)
│    & Study Roadmap      │ ➔ Strengths, Weaknesses, Topic Breakdown & Practice Questions
└─────────────────────────┘
```

---

## Key Features

1. **Resume-First Interview Strategy:**
   * Resume upload (PDF/DOCX) using `pypdf` and `python-docx`.
   * Structured extraction of candidate profile, tech stack, highlighted projects, work experience, and specific claims using Google Gemini Flash.
   * Visual resume claim verification breakdown before starting the interview.

2. **Live AI Interview Room (WebSocket + Voice):**
   * Real-time bidirectional WebSocket connection (`/ws/interview/{session_id}`).
   * Dynamic, conversational turns with context-aware AI mentor.
   * Probes resume projects, architecture decisions, and claims with adaptive follow-up questions.
   * Full Speech-to-Text (microphone dictation) and SpeechSynthesis (AI voice reading) support.
   * Pulsing waveform AI avatar, response time tracking, and live question progression counter.

3. **Multi-Dimensional AI Evaluation Report:**
   * Post-interview evaluation synthesized across 5 core dimensions:
     - **Technical Competence** (0-100)
     - **Project & Architecture Depth** (0-100)
     - **Communication Clarity** (0-100)
     - **Problem Solving** (0-100)
     - **Confidence & Delivery** (0-100)
   * Qualitative breakdown of Strengths, Weaknesses, Actionable Study Topics, and Tailored Follow-up Practice Questions.
   * Full interactive dialogue transcript with turn-by-turn question/response review.

4. **Graceful Offline / Fallback Support:**
   * If `GEMINI_API_KEY` is not provided or network is offline, the platform automatically engages heuristic structured parsers and local rule-based evaluation so interviews never crash.

5. **Security & History:**
   * JWT-based authentication with bcrypt password hashing.
   * SQLite persistence via SQLAlchemy ORM with automatic schema migrations.
   * Historical review of all past interviews and resumes.

---

## Project Structure

```text
AI Mock Interview/
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entrypoint, routes & CORS setup
│   │   ├── database.py                # SQLite connection & auto-migration logic
│   │   ├── dependencies.py            # Auth & JWT dependency injection
│   │   │
│   │   ├── models/                    # SQLAlchemy database models
│   │   │   ├── user.py                # Candidate / Admin users
│   │   │   ├── resume.py              # Parsed resume records
│   │   │   ├── interview.py           # Interview sessions
│   │   │   ├── interview_message.py   # Live interview transcript turns
│   │   │   ├── interview_evaluation.py# 5-metric post-interview report
│   │   │   ├── question.py            # Static question bank
│   │   │   └── answer.py              # Answer records
│   │   │
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   │   ├── auth.py
│   │   │   ├── resume.py
│   │   │   ├── interview.py
│   │   │   ├── question.py
│   │   │   └── answer.py
│   │   │
│   │   ├── routers/                   # API endpoint controllers
│   │   │   ├── auth.py                # Register & Login
│   │   │   ├── users.py               # Current user profile
│   │   │   ├── resume.py              # Resume upload & query
│   │   │   ├── websocket.py           # Live WebSocket interview channel
│   │   │   ├── interviews.py          # Interview sessions & evaluations
│   │   │   ├── questions.py           # Question bank
│   │   │   └── admin.py               # Admin metrics
│   │   │
│   │   ├── services/                  # Business logic services
│   │   │   ├── gemini_service.py      # Google Gemini Flash integration & fallback
│   │   │   ├── resume_service.py      # PDF / DOCX text extraction
│   │   │   ├── report_service.py      # Final evaluation report aggregator
│   │   │   ├── auth_service.py
│   │   │   ├── interview_service.py
│   │   │   └── evaluation_service.py
│   │   │
│   │   └── utils/
│   │       └── security.py            # Password hashing & JWT tokens
│   │
│   ├── interview.db                   # SQLite database
│   ├── requirements.txt               # Backend Python dependencies
│   ├── seed_questions.py              # Question bank seed script
│   └── create_admin.py                # Admin user creation script
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ScoreCard.jsx
│   │   │
│   │   ├── pages/                     # Application views
│   │   │   ├── Landing.jsx            # Landing page
│   │   │   ├── Login.jsx              # Login view
│   │   │   ├── Register.jsx           # Registration view
│   │   │   ├── Dashboard.jsx          # Candidate overview
│   │   │   ├── ResumeUpload.jsx       # Resume upload & parsed claims view
│   │   │   ├── InterviewSetup.jsx     # Resume-driven strategy configuration
│   │   │   ├── Interview.jsx          # Live AI Mentor room (WebSocket + Voice)
│   │   │   ├── Results.jsx            # 5-metric evaluation report & study guide
│   │   │   ├── History.jsx            # Past interviews & transcripts
│   │   │   ├── InterviewDetails.jsx   # Specific interview replay
│   │   │   └── AdminDashboard.jsx     # Admin management portal
│   │   │
│   │   ├── services/
│   │   │   └── api.js                 # Axios API client & WebSocket helper
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # JWT state management
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Setup & Running Instructions

### Prerequisites
* **Python 3.10+** (Tested on Python 3.13)
* **Node.js 18+** & **npm**

---

### Step 1: Backend Setup

Open a terminal in the root directory:

```powershell
# Navigate to backend
cd backend

# Create and activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your Gemini API key for live AI synthesis
# If not set, system seamlessly runs in intelligent fallback mode
$env:GEMINI_API_KEY="your_gemini_api_key_here"

# Seed default question bank & Admin account
python seed_questions.py
python create_admin.py

# Start FastAPI backend server
uvicorn backend.app.main:app --reload --port 8000
```

* **API Base URL:** `http://127.0.0.1:8000`
* **Swagger API Documentation:** `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup

Open a second terminal in the root directory:

```powershell
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite React development server
npm run dev
```

* **Web Application:** `http://localhost:5173`

---

## Default Accounts

### Administrator Account
* **Email:** `admin@example.com`
* **Password:** `AdminPassword123!`
* **Access:** `/admin`

### Candidate Account
* Register a new candidate directly at `http://localhost:5173/register` or login with your created user.

---

## Core API & WebSocket Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new candidate | No |
| `POST` | `/api/auth/login` | Authenticate & get JWT | No |
| `POST` | `/api/resumes/upload` | Upload & parse candidate resume (PDF/DOCX) | Yes (Bearer) |
| `GET` | `/api/resumes` | Get candidate's resumes | Yes (Bearer) |
| `GET` | `/api/resumes/{id}` | Get parsed resume details & claims | Yes (Bearer) |
| `POST` | `/api/interviews` | Create interview session configured with resume | Yes (Bearer) |
| `GET` | `/api/interviews` | List interview sessions | Yes (Bearer) |
| `GET` | `/api/interviews/{id}` | Get interview session details | Yes (Bearer) |
| `POST` | `/api/interviews/{id}/complete` | Complete session and trigger evaluation report | Yes (Bearer) |
| `GET` | `/api/interviews/{id}/messages` | Get interview transcript turns | Yes (Bearer) |
| `GET` | `/api/interviews/{id}/evaluation` | Get 5-metric AI scorecard & study roadmap | Yes (Bearer) |
| `WS` | `/ws/interview/{session_id}` | Real-time live AI interview WebSocket | Token param |

---

## Live Interview WebSocket Protocol

* **Connection:** `ws://localhost:8000/ws/interview/{session_id}?token={JWT_ACCESS_TOKEN}`
* **Client Send Message:**
  ```json
  {
    "type": "answer",
    "content": "In my distributed cache project, I used Redis with consistent hashing...",
    "audio_duration_seconds": 12.5
  }
  ```
* **Client End Interview:**
  ```json
  {
    "type": "end"
  }
  ```
* **Server Responses:**
  * `ai_question`: Transmits the next question / follow-up, topic, progress counter, and whether it's an adaptive follow-up.
  * `evaluation_ready`: Sent upon completion with the full 5-metric scorecard.
  * `error`: Transmits connection/processing errors.