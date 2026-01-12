import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Set
from sentence_transformers import SentenceTransformer, util

BASE_DIR = Path(__file__).parent
resumes_file = BASE_DIR / "cleaned_resumes_2.json"

MODEL_NAME = "all-MiniLM-L6-v2"
STRONG_THRESHOLD = 0.70
MEDIUM_THRESHOLD = 0.55
WEAK_THRESHOLD = 0.35
EDU_RELEVANCE_THRESHOLD = 0.50
EXPERIENCE_THRESHOLD = 0.65

DEGREE_RANK = {
    "diploma": 0,
    "associate": 1,
    "bachelor": 2,
    "master": 3,
    "phd": 4,
}

DEGREE_LABELS = {
    "diploma": "Diploma",
    "associate": "Associate degree",
    "bachelor": "Bachelor's",
    "master": "Master's",
    "phd": "PhD",
}

DEGREE_PATTERNS = {
    "phd": re.compile(r"\b(phd|doctorate|doctoral)\b", re.IGNORECASE),
    "master": re.compile(r"\b(master'?s?|msc|m\.sc|ms|mba|mcs)\b", re.IGNORECASE),
    "bachelor": re.compile(r"\b(bachelor'?s?|bsc|b\.sc|bs|b\.s|bcs|bsse|btech|b\.tech|be|b\.eng)\b", re.IGNORECASE),
    "associate": re.compile(r"\bassociate\b", re.IGNORECASE),
    "diploma": re.compile(r"\b(diploma|intermediate|matric)\b", re.IGNORECASE),
}

YEAR_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)", re.IGNORECASE)

model = SentenceTransformer(MODEL_NAME)

# ---------------- Utility Functions ----------------
def load_resumes(path: str = resumes_file) -> Dict[str, Dict]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_list(value) -> List[str]:
    if not value:
        return []
    if isinstance(value, (list, tuple, set)):
        return [str(v) for v in value if str(v).strip()]
    if isinstance(value, str):
        return [value]
    return [str(value)]


def collapse_text(entries: List[str], separator: str = " ") -> str:
    clean_entries = [entry.strip() for entry in entries if isinstance(entry, str) and entry.strip()]
    return separator.join(clean_entries)


def build_skill_text(entries: List[str]) -> str:
    tokens: List[str] = []
    for entry in ensure_list(entries):
        parts = [part.strip() for part in entry.split(",") if part.strip()]
        tokens.extend(parts or [entry.strip()])
    return ", ".join(tokens)


def build_experience_text(experience: List[str], project_experience: List[str]) -> str:
    exp_text = collapse_text(ensure_list(experience))
    if exp_text:
        return exp_text
    return collapse_text(ensure_list(project_experience))


def encode_text(text: str):
    if not text or not text.strip():
        return None
    return model.encode(text.strip(), convert_to_tensor=True, normalize_embeddings=True)


def similarity_label(score: float) -> str:
    if score >= STRONG_THRESHOLD:
        return "strong match"
    if score >= MEDIUM_THRESHOLD:
        return "moderate match"
    if score >= WEAK_THRESHOLD:
        return "weak match"
    return "match"


# ---------------- Section Comparison ----------------
def prepare_job_sections(job_post: Dict) -> Dict[str, str]:
    return {
        "skills": build_skill_text(job_post.get("skills", [])),
        "education": collapse_text(ensure_list(job_post.get("education", ""))),
        "experience": collapse_text(ensure_list(job_post.get("experience", ""))),
    }


def build_resume_sections(resume: Dict) -> Dict[str, str]:
    return {
        "skills": build_skill_text(resume.get("Skills", [])),
        "education": collapse_text(ensure_list(resume.get("Education", []))),
        "experience": build_experience_text(resume.get("Experience", []), resume.get("Project Experience", [])),
    }


def compare_section(job_vector, resume_text: str) -> Dict[str, Optional[float]]:
    resume_vector = encode_text(resume_text)
    if job_vector is None or resume_vector is None:
        return {"score": None, "label": "no match"}

    score = float(util.cos_sim(job_vector, resume_vector))
    return {
        "score": round(score, 3),
        "label": similarity_label(score),
    }


def detect_degree_level(text: str) -> Optional[str]:
    if not text:
        return None
    for level in sorted(DEGREE_RANK, key=lambda k: DEGREE_RANK[k], reverse=True):
        if DEGREE_PATTERNS[level].search(text):
            return level
    return None


def find_degree_levels(text: str) -> Set[str]:
    levels: Set[str] = set()
    if not text:
        return levels
    for level, pattern in DEGREE_PATTERNS.items():
        if pattern.search(text):
            levels.add(level)
    return levels


def format_degree_label(levels: Set[str]) -> str:
    if not levels:
        return "degree"
    ordered = sorted(levels, key=lambda lvl: DEGREE_RANK.get(lvl, 0))
    labels = [DEGREE_LABELS.get(level, level.title()) for level in ordered]
    return " / ".join(labels)


def degree_satisfies_requirement(candidate_level: str, required_levels: Set[str]) -> bool:
    if not required_levels:
        return True
    candidate_rank = DEGREE_RANK.get(candidate_level, -1)
    required_rank = min(DEGREE_RANK.get(level, 99) for level in required_levels)
    return candidate_rank >= required_rank


def education_match(job_text: str, job_vector, resume_entries: List[str]) -> Dict[str, Optional[float]]:
    required_levels = find_degree_levels(job_text)
    required_label = format_degree_label(required_levels)

    if not resume_entries:
        return {"score": 0.0, "label": "No education information provided"}

    relevant_found = False
    best_similarity = 0.0

    for entry in resume_entries:
        degree_level = detect_degree_level(entry.lower())
        if not degree_level:
            continue
        if not degree_satisfies_requirement(degree_level, required_levels):
            continue

        relevant_found = True
        if job_vector is None:
            return {"score": None, "label": f"Match: {required_label} found"}

        resume_vector = encode_text(entry)
        if resume_vector is None:
            continue
        similarity = float(util.cos_sim(job_vector, resume_vector))
        best_similarity = max(best_similarity, similarity)
        if similarity >= EDU_RELEVANCE_THRESHOLD:
            return {"score": 1.0, "label": f"Match: {required_label} found in relevant field"}

    if relevant_found:
        return {"score": 0.5, "label": f"{required_label} found but not in relevant field"}

    return {"score": 0.0, "label": "No matching education"}


def extract_years(text: str) -> Optional[float]:
    if not text:
        return None
    match = YEAR_PATTERN.search(text)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None


def experience_match(
    job_text: str,
    job_vector,
    resume_experience: List[str],
    resume_projects: List[str],
) -> Dict[str, Optional[float]]:
    exp_entries = ensure_list(resume_experience)
    has_numeric_years = False
    max_years = 0.0

    for entry in exp_entries:
        years = extract_years(entry)
        if years is not None:
            has_numeric_years = True
            max_years = max(max_years, years)

    if has_numeric_years and exp_entries:
        resume_text = collapse_text(exp_entries)
        resume_vector = encode_text(resume_text)
        if job_vector is not None and resume_vector is not None:
            similarity = float(util.cos_sim(job_vector, resume_vector))
            label = "Experience match" if similarity >= EXPERIENCE_THRESHOLD else "Experience found but not in relevant field"
            if max_years:
                label = f"{label} ({int(max_years)}+ years)"
            return {"score": round(similarity, 3), "label": label}
        label = "Experience information available"
        if max_years:
            label = f"{label} ({int(max_years)}+ years)"
        return {"score": None, "label": label}

    project_entries = ensure_list(resume_projects)
    if project_entries:
        project_text = collapse_text(project_entries)
        proj_vector = encode_text(project_text)
        if job_vector is not None and proj_vector is not None:
            similarity = float(util.cos_sim(job_vector, proj_vector))
            percent = round(similarity * 100, 1)
            return {"score": round(similarity, 3), "label": f"No experience but projects are {percent}% relevant"}
        return {"score": None, "label": "No experience but projects provided"}

    return {"score": None, "label": "No experience"}


def match_resume_to_job(
    resume_name: str,
    resume_data: Dict,
    job_sections: Dict[str, str],
    job_vectors: Dict[str, Optional[object]],
) -> Dict:
    resume_sections = build_resume_sections(resume_data)
    section_results = {}

    for section in ("skills",):
        section_results[section] = compare_section(job_vectors[section], resume_sections[section])
    section_results["education"] = education_match(
        job_sections["education"],
        job_vectors["education"],
        resume_data.get("Education", []),
    )
    section_results["experience"] = experience_match(
        job_sections["experience"],
        job_vectors["experience"],
        resume_data.get("Experience", []),
        resume_data.get("Project Experience", []),
    )

    numeric_scores = [result["score"] if result["score"] is not None else 0.0 for result in section_results.values()]
    overall = round((sum(numeric_scores) / 3.0) * 100, 1)

    return {
        "candidate_name": resume_name,
        "overall_score": overall,
        "sections": section_results,
    }


def rank_resumes(job_post: Dict, resumes: Dict[str, Dict], top_n: Optional[int] = None) -> List[Dict]:
    job_sections = prepare_job_sections(job_post)
    job_vectors = {section: encode_text(text) for section, text in job_sections.items()}

    results = [
        match_resume_to_job(name, data, job_sections, job_vectors)
        for name, data in resumes.items()
    ]
    results.sort(key=lambda r: r["overall_score"], reverse=True)

    if top_n:
        return results[:top_n]
    return results


def print_summary(results: List[Dict], top_n: int = 5) -> None:
    display = results[:top_n] if top_n else results
    print(f"\n=========== Top {len(display)} Candidates ===========")
    for idx, result in enumerate(display, start=1):
        print(f"\n{idx}. {result['candidate_name']} — overall {result['overall_score']}%")
        for section, detail in result["sections"].items():
            if section == "skills" and detail["score"] is not None:
                perc = int(round(detail["score"] * 100))
                print(f"   {section.capitalize():>10}: ({perc}%) {detail['label']}")
            else:
                print(f"   {section.capitalize():>10}: {detail['label']}")


def run_matching_pipeline(cleaned_resume_data: dict, job_post: dict) -> Dict:
    job_sections = prepare_job_sections(job_post)
    job_vectors = {s: encode_text(t) for s, t in job_sections.items()}
    resume_sections = build_resume_sections(cleaned_resume_data)
    result = {
        "skills": compare_section(job_vectors["skills"], resume_sections["skills"]),
        "education": education_match(job_sections["education"], job_vectors["education"], cleaned_resume_data.get("Education", [])),
        "experience": experience_match(job_sections["experience"], job_vectors["experience"], cleaned_resume_data.get("Experience", []), cleaned_resume_data.get("Project Experience", []))
    }
    numeric_scores = [r["score"] if r["score"] is not None else 0.0 for r in result.values()]
    overall = round(sum(numeric_scores) / 3 * 100, 1)
    return {"match_score": overall, **result}


 # ----------------- Run Matching in Colab -----------------
# Load resumes
resumes = load_resumes(resumes_file)

# Example job post
job_post = {
    "title": "Frontend Developer (React + Node.js)",
    "description": "We are looking for a Frontend Developer skilled in React, JavaScript, and UI design principles to build scalable web applications.",
    "requirements": "Experience with React, RESTful APIs, Node.js, HTML, CSS, and modern JavaScript (ES6+). Strong debugging and problem-solving skills required.",
    "skills": "React, JavaScript, HTML, CSS, Node.js, Git, REST APIs, UI Design, Frontend Performance",
    "education": "Bachelor’s or Master’s degree in Computer Science, Software Engineering, or related field.",
    "experience": "1+ year of frontend development experience with (React + Nodejs)."
}

# Rank resumes
ranked_results = rank_resumes(job_post, resumes, top_n=10)

# Print top candidates
print_summary(ranked_results, top_n=10)


   
