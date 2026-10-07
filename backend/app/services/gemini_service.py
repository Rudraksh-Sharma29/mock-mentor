import os
import json
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL_FLASH = os.getenv("GEMINI_MODEL_FLASH", "gemini-2.5-flash").strip()
GEMINI_MODEL_LIVE = os.getenv("GEMINI_MODEL_LIVE", "gemini-2.0-flash-exp").strip()

genai_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception:
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=GEMINI_API_KEY)
        except Exception:
            pass


class GeminiService:
    @staticmethod
    def is_available() -> bool:
        return bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 5)

    @classmethod
    def _call_gemini(cls, model_name: str, prompt: str, system_instruction: Optional[str] = None, json_mode: bool = True) -> str:
        """Invokes Gemini model using google-genai or legacy SDK with clean fallback."""
        if not cls.is_available():
            raise RuntimeError("Gemini API key is not configured.")

        # Try google.genai SDK
        if genai_client:
            try:
                config = {}
                if json_mode:
                    config["response_mime_type"] = "application/json"
                if system_instruction:
                    config["system_instruction"] = system_instruction
                
                resp = genai_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config if config else None
                )
                return resp.text.strip()
            except Exception as e:
                print(f"[GeminiService] genai_client call failed: {e}. Trying legacy genai fallback.")

        # Fallback to legacy google.generativeai if available
        import google.generativeai as legacy_genai
        legacy_genai.configure(api_key=GEMINI_API_KEY)
        model = legacy_genai.GenerativeModel(model_name, system_instruction=system_instruction)
        gen_config = legacy_genai.GenerationConfig(
            response_mime_type="application/json" if json_mode else None,
            temperature=0.3
        )
        response = model.generate_content(prompt, generation_config=gen_config)
        return response.text.strip()

    @classmethod
    def analyze_resume_text(cls, resume_text: str, filename: str = "") -> Dict[str, Any]:
        """
        Extracts structured resume data (profile, education, skills, projects,
        experience, resume claims, and challenge questions) using Gemini Flash.
        Falls back to rule-based structural parsing if API key is not configured.
        """
        if not cls.is_available():
            return cls._fallback_resume_analysis(resume_text, filename)

        prompt = f"""
You are an expert technical recruiter and resume analyzer for Mock Mentor.
Analyze the following candidate resume text and extract all details in STRICT structured JSON matching this schema:

{{
  "candidate_name": "Full Name",
  "email": "email address or null",
  "phone": "phone number or null",
  "location": "location or null",
  "summary": "2-3 sentence professional summary",
  "education": [
    {{
      "degree": "B.Tech / B.S. in Computer Science",
      "university": "University Name",
      "cgpa_or_percentage": "8.5 / 85%",
      "graduation_year": "2025"
    }}
  ],
  "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Machine Learning"],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Short project overview",
      "technologies": ["FastAPI", "ChromaDB", "React"],
      "candidate_role": "Backend Developer",
      "key_contribution": "Designed RAG vector search pipeline",
      "interview_topics": ["RAG Architecture", "Vector Databases", "Embeddings", "API Design"],
      "possible_questions": [
        "Why did you choose ChromaDB over other vector databases?",
        "How do you handle chunking and embedding generation?"
      ]
    }}
  ],
  "experience": [
    {{
      "organization": "Company / Org Name",
      "role": "Software Engineering Intern",
      "duration": "June 2024 - August 2024",
      "responsibilities": ["Built RESTful APIs", "Optimized database queries"],
      "technologies": ["Django", "PostgreSQL", "Redis"],
      "achievements": ["Reduced API latency by 35%"]
    }}
  ],
  "certifications": [
    {{
      "name": "AWS Certified Cloud Practitioner",
      "issuer": "Amazon Web Services",
      "skills": ["AWS", "Cloud Architecture"]
    }}
  ],
  "resume_claims": [
    {{
      "claim": "Direct high-impact claim or technical choice made in resume (e.g., 'Reduced query latency by 40% using Redis caching')",
      "context": "Context where this claim was made",
      "challenge_questions": [
        "What eviction policy did you configure for Redis and why?",
        "How did you measure the 40% latency reduction?"
      ]
    }}
  ],
  "suggested_roles": ["Backend Developer", "Full Stack Developer", "Software Engineer"],
  "question_topics": ["Python", "FastAPI", "System Design", "Databases", "RAG"]
}}

Important Guidelines:
1. Extract REAL details from the resume. Do NOT hallucinate claims or technologies not mentioned.
2. Formulate 2-3 specific challenge questions for every project and key resume claim.
3. Return ONLY the valid JSON object without markdown fences or extra dialogue.

RESUME TEXT:
{resume_text}
"""
        try:
            raw_text = cls._call_gemini(GEMINI_MODEL_FLASH, prompt, json_mode=True)
            data = json.loads(raw_text)
            return data
        except Exception as e:
            print(f"[GeminiService] Error during Gemini resume analysis: {e}. Using fallback parser.")
            return cls._fallback_resume_analysis(resume_text, filename)

    @classmethod
    def generate_interview_response(
        cls,
        resume_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        interview_type: str = "Technical",
        difficulty: str = "Medium",
        current_question_number: int = 1,
        total_questions: int = 5
    ) -> Dict[str, Any]:
        """
        Generates the next adaptive interviewer response based on candidate answer,
        resume claims, and conversation history.
        """
        if not cls.is_available():
            return cls._fallback_interview_turn(
                resume_context, conversation_history, interview_type, difficulty, current_question_number, total_questions
            )

        system_instruction = f"""
You are Mock Mentor, an elite, professional, and empathetic AI technical interviewer.
You are conducting a live mock interview with a candidate based on their verified resume context.

Candidate Profile:
- Name: {resume_context.get('candidate_name', 'Candidate')}
- Skills: {', '.join(resume_context.get('skills', []))}
- Key Projects: {json.dumps(resume_context.get('projects', []), indent=2)}
- Key Resume Claims: {json.dumps(resume_context.get('resume_claims', []), indent=2)}
- Interview Type: {interview_type}
- Difficulty Level: {difficulty}
- Current Question: {current_question_number} of {total_questions}

INTERVIEWING RULES:
1. Speak in a conversational, professional, and natural tone like an interviewer at a top tech company.
2. Ask ONE clear question at a time.
3. ADAPTIVE EVALUATION:
   - If the candidate's previous answer was shallow, buzzword-heavy, or incomplete, challenge them specifically (e.g., 'You mentioned using X, but how did you handle edge case Y?').
   - If their answer was thorough and accurate, acknowledge it briefly and transition deeper or move to the next topic.
4. Ground your questions in their specific resume projects, skills, and claims.
5. If question count reaches {total_questions}, provide a warm closing remark thanking the candidate and concluding the interview.
6. Keep your responses concise (2 to 4 sentences maximum) so the candidate has time to speak.

OUTPUT FORMAT: Return JSON:
{{
  "mentor_response": "Your spoken question or remark here.",
  "is_follow_up": true/false,
  "topic": "Topic being asked about (e.g., FastAPI, RAG, Database Design)",
  "evaluation_note": "Brief internal note on previous answer quality",
  "is_concluded": true/false
}}
"""

        transcript_formatted = "\n".join([
            f"{msg.get('speaker', 'user').upper()}: {msg.get('message', '')}"
            for msg in conversation_history
        ])

        prompt = f"""
CONVERSATION TRANSCRIPT SO FAR:
{transcript_formatted if transcript_formatted else "No prior dialogue. Start the interview with an engaging opening question."}

Generate the next interviewer response:
"""
        try:
            raw_text = cls._call_gemini(GEMINI_MODEL_FLASH, prompt, system_instruction=system_instruction, json_mode=True)
            return json.loads(raw_text)
        except Exception as e:
            print(f"[GeminiService] Error generating interview response: {e}. Using fallback.")
            return cls._fallback_interview_turn(
                resume_context, conversation_history, interview_type, difficulty, current_question_number, total_questions
            )

    @classmethod
    def generate_evaluation_report(
        cls,
        resume_context: Dict[str, Any],
        transcript: List[Dict[str, str]],
        interview_type: str = "Technical",
        difficulty: str = "Medium"
    ) -> Dict[str, Any]:
        """
        Performs post-interview comprehensive analysis using Gemini Flash,
        evaluating technical depth, communication, problem solving, project knowledge,
        and generating strengths, weaknesses, study topics, and practice questions.
        """
        if not cls.is_available():
            return cls._fallback_evaluation_report(resume_context, transcript, interview_type, difficulty)

        prompt = f"""
You are the Chief Evaluation Officer for Mock Mentor.
Analyze the following mock interview transcript against the candidate's resume and generate a comprehensive performance review in JSON.

Candidate Resume Context:
{json.dumps(resume_context, indent=2)}

Interview Type: {interview_type}
Difficulty: {difficulty}

Full Interview Transcript:
{json.dumps(transcript, indent=2)}

Generate STRICT JSON matching this schema:
{{
  "overall_score": 78.5,
  "technical_score": 82.0,
  "communication_score": 75.0,
  "confidence_score": 70.0,
  "problem_solving_score": 80.0,
  "project_knowledge_score": 85.0,
  "strengths": [
    "Strong architectural understanding of project components",
    "Clear explanation of REST API design and backend routing"
  ],
  "weaknesses": [
    "Lacked depth when asked about database indexing trade-offs",
    "Did not quantify metrics for performance optimization claims"
  ],
  "incorrect_answers": [
    "Stated that Redis persists all data in memory without disk persistence options"
  ],
  "missed_opportunities": [
    "Could have discussed asynchronous task queues (Celery) when talking about background jobs"
  ],
  "topics_to_study": [
    "Database Indexing & Query Optimization",
    "Redis Persistence Modes (RDB vs AOF)",
    "Distributed Caching Invalidation Patterns"
  ],
  "recommendations": [
    "Practice articulating technical decisions using the STAR method (Situation, Task, Action, Result)",
    "Deep-dive into the internals of frameworks and libraries listed on your resume"
  ],
  "practice_questions": [
    {{
      "topic": "FastAPI",
      "question": "How does FastAPI leverage Pydantic and type hints for dependency injection and request validation?",
      "difficulty": "Medium"
    }},
    {{
      "topic": "System Design",
      "question": "How would you design a distributed rate limiter for a public API gateway?",
      "difficulty": "Hard"
    }}
  ]
}}

Guidelines:
1. Provide constructive, honest, and highly specific feedback based on the exact dialogue.
2. Scores must be realistic numbers between 0 and 100 based on answer precision.
3. Return ONLY valid JSON without markdown fences.
"""
        try:
            raw_text = cls._call_gemini(GEMINI_MODEL_FLASH, prompt, json_mode=True)
            return json.loads(raw_text)
        except Exception as e:
            print(f"[GeminiService] Error during evaluation generation: {e}. Using fallback report.")
            return cls._fallback_evaluation_report(resume_context, transcript, interview_type, difficulty)

    # ------------------------------------------------------------------------
    # Fallback Parsers (For offline/testing or when GEMINI_API_KEY is not set)
    # ------------------------------------------------------------------------
    @classmethod
    def _fallback_resume_analysis(cls, text: str, filename: str) -> Dict[str, Any]:
        """Heuristic rule-based fallback parser"""
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        candidate_name = lines[0] if lines else "Candidate"
        if len(candidate_name) > 40 or "@" in candidate_name:
            candidate_name = "Candidate"

        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)

        known_skills = [
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
            "React", "Vue", "Angular", "Next.js", "FastAPI", "Django", "Flask", "Node.js", "Express",
            "Spring Boot", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "ChromaDB",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "Machine Learning", "PyTorch", "TensorFlow"
        ]
        found_skills = [s for s in known_skills if re.search(r'\b' + re.escape(s) + r'\b', text, re.I)]
        if not found_skills:
            found_skills = ["Python", "FastAPI", "SQL", "Git", "REST APIs"]

        return {
            "candidate_name": candidate_name,
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0) if phone_match else None,
            "location": "Remote / Hybrid",
            "summary": f"Aspiring software engineer skilled in {', '.join(found_skills[:4])} with experience building scalable applications.",
            "education": [
                {
                    "degree": "Bachelor of Technology / Computer Science",
                    "university": "University Institute of Technology",
                    "cgpa_or_percentage": "8.4 / 10",
                    "graduation_year": "2025"
                }
            ],
            "skills": found_skills,
            "projects": [
                {
                    "name": "AI Document Assistant & Mock Platform",
                    "description": "Full-stack intelligent web application built with FastAPI and React.",
                    "technologies": found_skills[:4],
                    "candidate_role": "Lead Developer",
                    "key_contribution": "Architected the backend API and database schemas",
                    "interview_topics": ["API Architecture", "Database Design", "Performance"],
                    "possible_questions": [
                        f"How did you integrate {found_skills[0] if found_skills else 'the backend'} into your application?",
                        "What was the most challenging technical hurdle you solved?"
                    ]
                }
            ],
            "experience": [
                {
                    "organization": "Tech Innovations Lab",
                    "role": "Software Developer Intern",
                    "duration": "3 Months",
                    "responsibilities": ["Developed backend REST APIs", "Wrote unit and integration tests"],
                    "technologies": found_skills[:3],
                    "achievements": ["Successfully shipped 4 core features ahead of schedule"]
                }
            ],
            "certifications": [],
            "resume_claims": [
                {
                    "claim": f"Built high-performance applications using {found_skills[0] if found_skills else 'modern tech stack'}",
                    "context": "Key project implementation",
                    "challenge_questions": [
                        "How did you benchmark and ensure high performance under load?",
                        "What architectural trade-offs did you consider?"
                    ]
                }
            ],
            "suggested_roles": ["Software Engineer", "Backend Developer", "Full Stack Developer"],
            "question_topics": found_skills[:5]
        }

    @classmethod
    def _fallback_interview_turn(
        cls,
        resume_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        interview_type: str,
        difficulty: str,
        current_question_number: int,
        total_questions: int
    ) -> Dict[str, Any]:
        """Deterministic fallback conversational generator"""
        name = resume_context.get("candidate_name", "Candidate")
        skills = resume_context.get("skills", ["Python", "FastAPI"])
        projects = resume_context.get("projects", [])
        claims = resume_context.get("resume_claims", [])

        if current_question_number > total_questions:
            return {
                "mentor_response": f"Thank you so much, {name}! That concludes our mock interview session. I have gathered enough data to prepare your detailed performance scorecard.",
                "is_follow_up": False,
                "topic": "Conclusion",
                "evaluation_note": "Interview session completed.",
                "is_concluded": True
            }

        last_candidate_msg = ""
        for m in reversed(conversation_history):
            if m.get("speaker") == "candidate":
                last_candidate_msg = m.get("message", "")
                break

        if not conversation_history:
            proj_name = projects[0]["name"] if projects else "one of your featured projects"
            return {
                "mentor_response": f"Hello {name}, welcome to your Mock Mentor interview! To start off, could you walk me through the architecture of {proj_name} and your specific role in building it?",
                "is_follow_up": False,
                "topic": "Project Overview",
                "evaluation_note": "Initial opening question",
                "is_concluded": False
            }

        if last_candidate_msg and len(last_candidate_msg.split()) < 12:
            return {
                "mentor_response": f"Could you elaborate a bit more on that? Specifically, what underlying mechanisms or technical decisions influenced that approach?",
                "is_follow_up": True,
                "topic": "Deep Dive",
                "evaluation_note": "Candidate answer was concise; requesting deeper elaboration",
                "is_concluded": False
            }

        topics = [
            (f"I see you highlighted {skills[0] if skills else 'core technologies'} on your resume. How do you handle concurrency, error handling, and performance bottlenecks when building services with it?", skills[0] if skills else "Core Tech"),
            (f"Looking at your resume claims: '{claims[0]['claim'] if claims else 'your recent project work'}'. How did you measure that impact and what trade-offs did you make?", "Resume Claims"),
            (f"In a production system using {skills[1] if len(skills) > 1 else 'relational databases'}, how would you design your schema and indexing strategy to handle high read/write throughput?", "Database & System Design"),
            (f"Tell me about a time when you faced an unexpected technical roadblock or bug during development. How did you diagnose and resolve it?", "Problem Solving & Behavioral"),
        ]

        idx = (current_question_number - 2) % len(topics)
        question_text, topic_name = topics[idx]

        return {
            "mentor_response": question_text,
            "is_follow_up": False,
            "topic": topic_name,
            "evaluation_note": "Topic progression question",
            "is_concluded": False
        }

    @classmethod
    def _fallback_evaluation_report(
        cls,
        resume_context: Dict[str, Any],
        transcript: List[Dict[str, str]],
        interview_type: str,
        difficulty: str
    ) -> Dict[str, Any]:
        """Deterministic evaluation report fallback"""
        candidate_words = sum(
            len(m.get("message", "").split())
            for m in transcript if m.get("speaker") == "candidate"
        )
        responses_count = len([m for m in transcript if m.get("speaker") == "candidate"])
        avg_len = candidate_words / max(1, responses_count)

        tech_score = min(92.0, max(55.0, 60.0 + min(30.0, avg_len * 0.8)))
        comm_score = min(90.0, max(60.0, 65.0 + min(25.0, responses_count * 4.0)))
        prob_score = min(88.0, max(58.0, 62.0 + min(25.0, avg_len * 0.6)))
        proj_score = min(94.0, max(65.0, 70.0 + min(24.0, avg_len * 0.5)))
        conf_score = min(86.0, max(55.0, 60.0 + min(25.0, responses_count * 3.5)))
        overall = round((tech_score * 0.35 + proj_score * 0.25 + comm_score * 0.15 + prob_score * 0.15 + conf_score * 0.10), 1)

        skills = resume_context.get("skills", ["Python", "FastAPI", "SQL"])

        return {
            "overall_score": overall,
            "technical_score": round(tech_score, 1),
            "communication_score": round(comm_score, 1),
            "confidence_score": round(conf_score, 1),
            "problem_solving_score": round(prob_score, 1),
            "project_knowledge_score": round(proj_score, 1),
            "strengths": [
                f"Articulated practical knowledge of {skills[0] if skills else 'core frameworks'}",
                "Clear explanation of project contributions and architectural decisions",
                "Communicated ideas with structured sentence formatting and terminology"
            ],
            "weaknesses": [
                "Could expand further on low-level database optimization and indexing strategies",
                "Consider backing up project claims with quantitative performance metrics"
            ],
            "incorrect_answers": [
                "Some explanations around distributed locking and cache invalidation were partially incomplete"
            ],
            "missed_opportunities": [
                "Opportunity to highlight asynchronous background job workers and queue resilience"
            ],
            "topics_to_study": [
                f"{skills[0] if skills else 'Backend'} Asynchronous Architecture & Concurrency",
                "Database Indexing (B-Trees) and Query Plan Optimization",
                "System Design Principles: Rate Limiting, Caching, and Load Balancing"
            ],
            "recommendations": [
                "Use the STAR method (Situation, Task, Action, Result) when describing project challenges",
                "Review edge case handling and error recovery patterns for frameworks on your resume"
            ],
            "practice_questions": [
                {
                    "topic": skills[0] if skills else "System Design",
                    "question": f"How do you handle connection pooling and transaction rollbacks in high-concurrency {skills[0] if skills else 'web'} services?",
                    "difficulty": "Medium"
                },
                {
                    "topic": "Architecture",
                    "question": "Explain how you would design an idempotent RESTful API for financial transactions.",
                    "difficulty": "Hard"
                }
            ]
        }
