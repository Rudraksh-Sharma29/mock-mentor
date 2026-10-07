import sys
import os
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_mock_mentor_pipeline():
    print("=== 1. Health Check ===")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health Check OK:", res.json())

    print("\n=== 2. User Authentication ===")
    login_res = client.post("/api/auth/login", json={
        "email": "candidate@example.com",
        "password": "Password123!"
    })
    if login_res.status_code != 200:
        # Register first
        client.post("/api/auth/register", json={
            "name": "Alex Developer",
            "email": "candidate@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        })
        login_res = client.post("/api/auth/login", json={
            "email": "candidate@example.com",
            "password": "Password123!"
        })
    
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Candidate authenticated successfully.")

    print("\n=== 3. Resume Upload & Gemini Analysis ===")
    sample_resume_content = """
Alex Developer
Email: alex.dev@example.com | San Francisco, CA | Portfolio: https://github.com/alexdev

PROFESSIONAL SUMMARY
Senior Backend Engineer with 4 years of experience specializing in distributed systems, FastAPI, Python, PostgreSQL, and LLM agent architectures.

TECHNICAL SKILLS
Languages: Python, TypeScript, SQL, Go
Frameworks: FastAPI, Django, React, Celery
Databases & Cloud: PostgreSQL, Redis, ChromaDB, Docker, AWS (ECS, S3), Kafka

PROJECTS
1. RAG-Based Enterprise Knowledge Agent (FastAPI, React, ChromaDB, Gemini)
- Architected an asynchronous Retrieval-Augmented Generation agent indexing 50,000+ internal engineering documents.
- Achieved sub-150ms semantic search latency using ChromaDB vector collections and cosine similarity embeddings.
- Implemented real-time streaming WebSocket endpoints for token-by-token answer generation.

2. Distributed High-Throughput Payment Ingestion Pipeline (Python, Kafka, PostgreSQL)
- Engineered a financial transaction processing pipeline capable of handling 8,000 requests/sec with exactly-once delivery guarantees.
- Integrated Redis sliding-window distributed rate limiting and idempotent request validation.

EXPERIENCE
Backend Software Engineer - CloudScale Technologies (2022 - Present)
- Designed and maintained 15+ production microservices handling 20M+ daily API requests.
- Optimized slow analytical SQL queries, reducing P99 latency by 45%.

EDUCATION
B.S. in Computer Science - University of California, Berkeley (2021), GPA: 3.85
"""
    file_payload = {
        "file": ("alex_developer_resume.txt", io.BytesIO(sample_resume_content.encode("utf-8")), "text/plain")
    }
    upload_res = client.post("/api/resumes/upload", files=file_payload, headers=headers)
    assert upload_res.status_code == 200, f"Resume upload failed: {upload_res.text}"
    resume_data = upload_res.json()
    resume_id = resume_data["id"]
    parsed = resume_data["parsed_data"]
    print(f"Resume uploaded & parsed (ID: {resume_id}):")
    print(f"  Candidate Name: {parsed.get('candidate_name')}")
    print(f"  Skills: {parsed.get('skills')}")
    print(f"  Projects Extracted: {len(parsed.get('projects', []))}")
    print(f"  Resume Claims: {len(parsed.get('resume_claims', []))}")
    assert len(parsed.get("skills", [])) > 0, "Expected skills to be extracted"

    print("\n=== 4. Configure & Launch Interview Session ===")
    create_payload = {
        "resume_id": resume_id,
        "job_role": "Backend Engineer",
        "experience_level": "Experienced",
        "interview_type": "Technical + Project-Based",
        "difficulty": "Hard",
        "total_questions": 5
    }
    create_res = client.post("/api/interviews", json=create_payload, headers=headers)
    assert create_res.status_code == 200, f"Interview creation failed: {create_res.text}"
    session = create_res.json()
    session_id = session["id"]
    print(f"Created Interview Session ID: {session_id} linked to Resume ID: {session['resume_id']}")

    print("\n=== 5. WebSocket Live Interview Conversation Flow ===")
    with client.websocket_connect(f"/ws/interview/{session_id}?token={token}") as websocket:
        # 1. Receive opening question from AI Mentor
        data1 = websocket.receive_json()
        print("AI Mentor Opening Message:")
        print(f"  Topic: {data1.get('topic')}")
        print(f"  Question: {data1.get('message')}")
        assert data1.get("type") == "mentor_message"

        # 2. Send candidate response discussing the RAG project
        websocket.send_json({
            "type": "candidate_message",
            "message": "For the Enterprise Knowledge Agent, I designed the retrieval pipeline using ChromaDB for vector embeddings and FastAPI to expose asynchronous REST and WebSocket endpoints for token streaming."
        })

        # Receive thinking / next question
        msg2 = websocket.receive_json()
        if msg2.get("type") == "mentor_thinking":
            msg2 = websocket.receive_json()

        print("\nAI Mentor Adaptive Follow-Up Question:")
        print(f"  Topic: {msg2.get('topic')}")
        print(f"  Is Follow-up: {msg2.get('is_follow_up')}")
        print(f"  Question: {msg2.get('message')}")

        # 3. Send candidate second response discussing trade-offs and challenge claim
        websocket.send_json({
            "type": "candidate_message",
            "message": "We benchmarked ChromaDB against PostgreSQL pgvector and chose ChromaDB for our initial phase due to lightweight local in-memory indexing, but we added Redis caching to store frequent query embeddings to achieve sub-150ms latency."
        })

        msg3 = websocket.receive_json()
        if msg3.get("type") == "mentor_thinking":
            msg3 = websocket.receive_json()

        print("\nAI Mentor Progression Question:")
        print(f"  Topic: {msg3.get('topic')}")
        print(f"  Question: {msg3.get('message')}")

        # 4. End interview explicitly
        websocket.send_json({"type": "end_interview"})
        completion_data = websocket.receive_json()
        print("\nInterview Completed Event received:", completion_data)
        assert completion_data.get("type") == "interview_completed"

    print("\n=== 6. Post-Interview Evaluation & Scorecard ===")
    results_res = client.get(f"/api/interviews/{session_id}/results", headers=headers)
    assert results_res.status_code == 200, f"Results retrieval failed: {results_res.text}"
    report = results_res.json()
    print("Gemini Flash Evaluation Report:")
    print(f"  Overall Score: {report['overall_score']}/100")
    print(f"  Technical Score: {report['technical_score']}")
    print(f"  Project Knowledge Score: {report['project_knowledge_score']}")
    print(f"  Communication Score: {report['communication_score']}")
    print(f"  Problem Solving Score: {report['problem_solving_score']}")
    print(f"  Confidence Score: {report['confidence_score']}")
    print(f"  Strengths Count: {len(report['strengths'])}")
    print(f"  Weaknesses Count: {len(report['weaknesses'])}")
    print(f"  Topics to Study: {report['topics_to_study']}")
    print(f"  Personalized Practice Questions: {len(report['practice_questions'])}")

    assert report["overall_score"] > 0
    assert len(report["strengths"]) > 0
    assert len(report["transcript"]) >= 3

    print("\n=======================================================")
    print(">>> ALL PHASE 2 & PHASE 3 END-TO-END TESTS PASSED! <<<")
    print("=======================================================")

if __name__ == "__main__":
    test_mock_mentor_pipeline()
