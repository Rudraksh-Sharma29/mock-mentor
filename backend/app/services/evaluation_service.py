import re
from typing import List, Dict, Any

class EvaluationService:
    """
    Automated Rule-Based Evaluation Engine (Phase 1).
    Evaluates candidate answers deterministically based on keyword matching,
    vocabulary completeness, structural clarity, and technical relevance.
    Designed with a clean interface for plug-and-play LLM replacement in Phase 2.
    """

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        # Keep alphanumeric and single spaces
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text).lower()
        return " ".join(cleaned.split())

    @classmethod
    def evaluate(
        cls,
        question_text: str,
        candidate_answer: str,
        expected_keywords_str: str,
        model_answer: str
    ) -> Dict[str, Any]:
        answer_raw = (candidate_answer or "").strip()
        answer_clean = cls.clean_text(answer_raw)
        words = answer_clean.split()
        word_count = len(words)

        # Parse expected keywords (comma-separated)
        raw_keywords = [k.strip() for k in expected_keywords_str.split(",") if k.strip()]
        if not raw_keywords:
            raw_keywords = [w for w in cls.clean_text(question_text).split() if len(w) > 4]

        matched_keywords = []
        missing_keywords = []

        for kw in raw_keywords:
            kw_clean = cls.clean_text(kw).strip()
            if not kw_clean:
                continue
            
            # Check for exact word or phrase occurrence
            pattern = r'\b' + re.escape(kw_clean) + r'\b'
            if re.search(pattern, answer_clean) or (kw_clean in answer_clean):
                matched_keywords.append(kw)
            else:
                # Also check individual words if keyword is compound
                kw_parts = kw_clean.split()
                if len(kw_parts) > 1 and all(re.search(r'\b' + re.escape(part) + r'\b', answer_clean) for part in kw_parts):
                    matched_keywords.append(kw)
                else:
                    missing_keywords.append(kw)

        total_kw = max(1, len(raw_keywords))
        matched_kw_count = len(matched_keywords)
        keyword_ratio = matched_kw_count / total_kw

        # 1. Relevance Score (0-100)
        relevance_score = min(100.0, keyword_ratio * 100.0)

        # 2. Technical Score (0-100)
        if word_count >= 15 and keyword_ratio >= 0.60:
            technical_score = min(100.0, max(60.0, keyword_ratio * 100.0))
        else:
            technical_score = min(100.0, (keyword_ratio * 80.0) + min(20.0, word_count * 0.5))

        # 3. Completeness Score (0-100)
        length_ratio = min(1.0, word_count / 25.0)
        completeness_score = min(100.0, (keyword_ratio * 55.0) + (length_ratio * 45.0))

        # 4. Clarity Score (0-100)
        if word_count == 0:
            clarity_score = 0.0
        else:
            has_punctuation = bool(re.search(r'[.!?]', answer_raw))
            has_capital = bool(re.search(r'^[A-Z]', answer_raw.strip()))
            avg_word_len = sum(len(w) for w in words) / max(1, word_count)

            structure_pts = (30.0 if has_punctuation else 10.0) + (20.0 if has_capital else 10.0)
            vocab_pts = 50.0 if (3.5 <= avg_word_len <= 10.0 and word_count >= 8) else min(50.0, word_count * 5.0)
            clarity_score = min(100.0, structure_pts + vocab_pts)

        if word_count < 3:
            relevance_score = max(0.0, relevance_score * 0.15)
            technical_score = max(0.0, technical_score * 0.15)
            completeness_score = max(0.0, completeness_score * 0.10)
            clarity_score = max(0.0, clarity_score * 0.10)

        # Weighting: Technical (40%), Relevance (25%), Completeness (20%), Clarity (15%)
        overall_score = (
            0.40 * technical_score +
            0.25 * relevance_score +
            0.20 * completeness_score +
            0.15 * clarity_score
        )

        overall_score = round(min(100.0, max(0.0, overall_score)), 1)
        technical_score = round(technical_score, 1)
        relevance_score = round(relevance_score, 1)
        clarity_score = round(clarity_score, 1)
        completeness_score = round(completeness_score, 1)

        # Deterministic feedback
        if overall_score >= 90:
            feedback_text = "Excellent answer. You covered the important concepts clearly."
        elif overall_score >= 75:
            feedback_text = "Good answer. You covered most important concepts. Consider adding examples."
        elif overall_score >= 60:
            feedback_text = "Fair answer. The main idea is present, but additional technical details are needed."
        elif overall_score >= 40:
            feedback_text = "The answer needs improvement. Include more relevant concepts and explanation."
        else:
            feedback_text = "The answer requires significant improvement. Review the topic and provide a more complete response."

        return {
            "overall_score": overall_score,
            "technical_score": technical_score,
            "relevance_score": relevance_score,
            "clarity_score": clarity_score,
            "completeness_score": completeness_score,
            "feedback": feedback_text,
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords,
            "model_answer": model_answer
        }
