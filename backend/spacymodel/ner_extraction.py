import spacy
import fitz
import re
from pathlib import Path
from pymongo import MongoClient
from bson import ObjectId, errors
import json

# ---------------- MODEL LOAD ----------------
BASE_DIR = Path(__file__).parent
model_path = BASE_DIR / "model-best"
nlp = spacy.load(model_path)
print("Model loaded successfully!\n")

# ---------------- DB CONNECTION ----------------
MONGO_URI = "mongodb+srv://recruitai_db_user:70qFE6xwkGrj1dnV@recruitaicluster.6jbpkdu.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["test"]
candidates_col = db["candidates"]
jobs_col = db["jobs"]

UPLOAD_FOLDER = BASE_DIR.parent / "uploads"

# ---------------- UTILS ----------------
def extract_text_from_pdf(pdf_path: Path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{2,}', '\n', text)
    return text.strip()

def extract_experience_patterns(text: str):
    patterns = re.findall(
        r'\b\d+\+?\s*(?:year|years|yr|yrs)\b(?:\s+of\s+experience|\s+experience)?',
        text,
        re.IGNORECASE
    )
    return [p.strip() for p in patterns]

def extract_entities_from_resume(text: str):
    exp_patterns = extract_experience_patterns(text)
    for match in exp_patterns:
        text += f" WORK_EXPERIENCE: {match}"

    doc = nlp(text)

    data = {
        "skills": [],
        "education": [],
        "work experience": [],
        "project experience": []
    }

    for ent in doc.ents:
        label = ent.label_.lower()
        content = ent.text.strip()
        if label in data and content not in data[label]:
            data[label].append(content)

    for exp in exp_patterns:
        if exp not in data["work experience"]:
            data["work experience"].append(exp)

    return data

def extract_candidates(job_id_str: str):
    try:
        job_oid = ObjectId(job_id_str)
        return list(candidates_col.find({"jobId": job_oid}))
    except errors.InvalidId:
        return list(candidates_col.find({"jobId": job_id_str}))

# ---------------- MAIN PIPELINE (STRING FORMAT) ----------------
def run_ner_extraction(job_id: str, save_file: bool = True):
    print(f"\n--- Starting extraction for Job ID: {job_id} ---")

    try:
        job_oid = ObjectId(job_id)
        job = jobs_col.find_one({"_id": job_oid})
    except errors.InvalidId:
        job = jobs_col.find_one({"_id": job_id})

    if not job:
        print(" Job not found")
        return {}

    print("Found Job:", job.get("title"))

    candidates = extract_candidates(job_id)
    print(f"Total candidates found = {len(candidates)}")

    final_output = {}

    for c in candidates:
        resume_path = UPLOAD_FOLDER / Path(c["resume"]).name
        candidate_name = c["name"]
        print(f"\nCandidate: {candidate_name}")

        if not resume_path.exists():
            print("  Resume missing, skipping")
            continue

        try:
            text = extract_text_from_pdf(resume_path)
            extracted = extract_entities_from_resume(text)

            def clean_field(items):
                cleaned = []
                for i in items:
                    line = re.sub(r'\s+', ' ', i).strip()
                    if line:
                        cleaned.append(line)
                return "\n".join(cleaned)

            formatted = {
                "skills": clean_field(extracted["skills"]),
                "education": clean_field(extracted["education"]),
                "work experience": clean_field(extracted["work experience"]),
                "project experience": clean_field(extracted["project experience"])
            }

            # Use candidate name as key (original style)
            final_output[candidate_name] = formatted
            print("  Extraction successful")

        except Exception as e:
            print("  Extraction failed:", e)
            final_output[candidate_name] = {}

    if save_file:
        save_path = BASE_DIR / "extracted_resumes.json"
        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(final_output, f, indent=4, ensure_ascii=False)
        print(f"\nExtraction saved to {save_path}")

    return final_output

# ---------------- STANDALONE TEST ----------------
if __name__ == "__main__":
    JOB_ID = "693ffa8ca2b623602ba784c3"
    run_ner_extraction(JOB_ID)
