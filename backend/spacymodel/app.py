from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from pymongo import MongoClient
from bson import ObjectId
import math

from final_matching import run_matching_pipeline
from cleaning_1 import run_cleaning_1
from cleaning_2 import run_cleaning_2
from ner_extraction import run_ner_extraction

app = FastAPI()

print("CORS loaded ")

# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- DATABASE -----------------
MONGO_URI = "mongodb+srv://recruitai_db_user:70qFE6xwkGrj1dnV@recruitaicluster.6jbpkdu.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["test"]

candidates_col = db["candidates"]
jobs_col = db["jobs"]
matching_results_col = db["matching_results"]

UPLOAD_FOLDER = Path(__file__).parent.parent / "uploads"
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")


# ----------------- CONFIDENCE SCORE -----------------
def calculate_model_confidence(resumes: list):
    scores = [
        r["match_score"]
        for r in resumes
        if r.get("match_score") is not None
    ]

    if not scores:
        return 0

    # Signal 1: Average match strength
    avg_score = sum(scores) / len(scores)
    avg_score_norm = avg_score / 100

    # Signal 2: Consistency (standard deviation)
    variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
    std_dev = math.sqrt(variance)
    consistency = 1 - min(std_dev / 50, 1)

    # Signal 3: Pipeline success rate
    success_rate = len(scores) / len(resumes)

    confidence = (
        0.5 * avg_score_norm +
        0.3 * consistency +
        0.2 * success_rate
    )

    return round(confidence * 100)

# ----------------- PIPELINE ROUTE -----------------
@app.get("/run-pipeline/{job_id}")
def run_pipeline(job_id: str):

    try:
        job = jobs_col.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidates = list(candidates_col.find({"jobId": ObjectId(job_id)}))
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found")

    
    extracted_data = run_ner_extraction(job_id, save_file=False)

    cleaned_1 = run_cleaning_1(extracted_data, save_file=False)
    cleaned_2 = run_cleaning_2(cleaned_1, save_file=False)

    results = []

    for c in candidates:
        name = c["name"]
        resume_filename = Path(c["resume"]).name
        resume_path = f"/uploads/{resume_filename}"

        if name not in cleaned_2:
            results.append({
                "name": name,
                "resume_path": resume_path,
                "resume_missing": True,
                "match_score": None,
                "skills": {},
                "education": {},
                "experience": {}
            })
            continue

        try:
            match = run_matching_pipeline(cleaned_2[name], job)

            results.append({
                "name": name,
                "email": c.get("email"),
                "resume_path": resume_path,
                "resume_missing": False,
                "match_score": match.get("match_score"),
                "skills": match.get("skills"),
                "education": match.get("education"),
                "experience": match.get("experience")
            })

        except Exception as e:
            results.append({
                "name": name,
                "resume_path": resume_path,
                "resume_missing": False,
                "match_score": None,
                "skills": {},
                "education": {},
                "experience": {},
                "error": str(e)
            })

    # MODEL CONFIDENCE
    model_confidence = calculate_model_confidence(results)

    result_doc = {
        "jobId": job_id,
        "jobTitle": job.get("title", "Untitled Job"),
        "userEmail": job["userEmail"],
        "total_candidates": len(candidates),
        "screened": len(results),
        "model_confidence": model_confidence,
        "resumes": results
    }

    matching_results_col.update_one(
        {"jobId": job_id},
        {"$set": result_doc},
        upsert=True
    )

    return result_doc


# ----------------- FETCH MATCHING RESULTS -----------------
@app.get("/matching-results/{job_id}")
def get_matching_results(job_id: str, userEmail: str = Query(...)):
    result = matching_results_col.find_one({
        "jobId": job_id,
        "userEmail": userEmail
    })

    if not result:
        raise HTTPException(status_code=404, detail="No results found")

    result["_id"] = str(result["_id"])
    return result


# ----------------- PREVIOUS RANKINGS -----------------
@app.get("/previous-rankings")
def get_previous_rankings(userEmail: str = Query(...)):
    results = list(
        matching_results_col.find({"userEmail": userEmail}).sort("_id", -1)
    )

    for r in results:
        r["_id"] = str(r["_id"])

    return results


# ----------------- REMOVE RANKING -----------------
@app.delete("/remove-ranking/{ranking_id}")
def remove_ranking(
    ranking_id: str,
    userEmail: str = Query(...)
):
    try:
        res = matching_results_col.delete_one({
            "_id": ObjectId(ranking_id),
            "userEmail": userEmail
        })

        if res.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Ranking not found or unauthorized"
            )

        return {"message": "Ranking removed"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    
# ----------------- SHORTLISTED CANDIDATES -----------------
@app.get("/shortlisted-db/{job_id}")
def get_shortlisted_from_db(job_id: str, userEmail: str = Query(...)):
    record = matching_results_col.find_one(
        {"jobId": job_id, "userEmail": userEmail},
        {"_id": 0}
    )

    if not record:
        return {
            "jobTitle": "",
            "shortlisted": []
        }

    resumes = record.get("resumes", [])

    top_three = sorted(
        resumes,
        key=lambda x: float(x.get("match_score") or 0),
        reverse=True
    )[:5] # Get top 5 candidates

    return {
        "jobTitle": record.get("jobTitle", ""),
        "shortlisted": top_three
    }
