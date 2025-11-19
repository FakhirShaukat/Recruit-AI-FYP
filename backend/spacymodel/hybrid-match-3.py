from sentence_transformers import SentenceTransformer, util
import json
import re

# ---------------- MODEL LOADING ----------------
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')
print("Model loaded successfully!\n")

# ---------------- LOAD RESUMES ----------------
json_path = r"backend\spacymodel\cleaned_resumes.json"
with open(json_path, "r", encoding="utf-8") as f:
    resumes_data = json.load(f)
print(f"Loaded {len(resumes_data)} resumes.\n")

# ---------------- JOB DESCRIPTION ----------------
job_post = {
    "title": "Frontend Developer (React + Node.js)",
    "description": "We are looking for a Frontend Developer skilled in React, JavaScript, and UI design principles to build scalable web applications.",
    "requirements": "Experience with React, RESTful APIs, Node.js, HTML, CSS, and modern JavaScript (ES6+). Strong debugging and problem-solving skills required.",
    "skills": "React, JavaScript, HTML, CSS, Node.js, Git, REST APIs, UI Design, Frontend Performance",
    "education": "Bachelor’s or Master’s degree in Computer Science, Software Engineering, or related field.",
    "experience": "1+ year of frontend development experience with React and Node.js.",
    "jobtype": "Full-time",
    "location": "Karachi"
}

# ---------------- ENCODING JOB DESCRIPTION ----------------
job_skills_emb = model.encode(job_post["skills"], convert_to_tensor=True)
job_edu_emb = model.encode(job_post["education"], convert_to_tensor=True)
job_exp_emb = model.encode(job_post["experience"], convert_to_tensor=True)

# ---------------- MATCHING LOGIC ----------------
results = []

for name, info in resumes_data.items():
    # -------- Skills Scoring --------
    skills_text = " ".join(info.get("SKILLS", []))
    skill_score = 0
    if skills_text.strip():
        resume_skill_emb = model.encode(skills_text, convert_to_tensor=True)
        skill_score = util.cos_sim(job_skills_emb, resume_skill_emb).item() * 100

    # -------- Education Matching (Improved Binary Logic) --------
    education_text = " ".join(info.get("EDUCATION", [])).lower()
    if re.search(r"\bmaster|ms|m\.sc|mcs|m\.s\b", education_text):
        education_comment = "Match (Master’s degree found in relevant field)"
        education_score = 100
    elif re.search(r"\bbachelor|bs|b\.sc|bcs|software|computer\b", education_text):
        education_comment = "Match (Bachelor’s degree found)"
        education_score = 100
    else:
        education_comment = "No Match"
        education_score = 0

    # -------- Experience & Projects --------
    work_exp = " ".join(info.get("WORK EXPERIENCE", []))
    project_exp = " ".join(info.get("PROJECT EXPERIENCE", []))
    experience_score = 0
    exp_comment = ""

    if not work_exp.strip() and project_exp.strip():
        project_embed = model.encode(project_exp, convert_to_tensor=True)
        project_score = util.cos_sim(job_exp_emb, project_embed).item() * 100
        experience_score = project_score
        exp_comment = f"No experience, but projects are {round(project_score, 2)}% relevant"

    elif work_exp.strip():
        work_embed = model.encode(work_exp, convert_to_tensor=True)
        work_score = util.cos_sim(job_exp_emb, work_embed).item() * 100
        if project_exp.strip():
            project_embed = model.encode(project_exp, convert_to_tensor=True)
            project_score = util.cos_sim(job_exp_emb, project_embed).item() * 100
            experience_score = max(work_score, project_score)
        else:
            experience_score = work_score
        exp_comment = f"Relevant Experience match ({round(experience_score, 2)}%)"

    else:
        exp_comment = "no relevant experience or projects found"
        experience_score = 0

    # -------- Weighted Total --------
    total_score = (
        (skill_score * 0.5) +      # Skills weight 50%
        (education_score * 0.2) +  # Education weight 20%
        (experience_score * 0.3)   # Experience weight 30%
    )

    results.append({
        "name": name,
        "skills": round(skill_score, 2),
        "education": education_comment,
        "experience": exp_comment,
        "experience_score": round(experience_score, 2),
        "total": round(total_score, 2)
    })

# ---------------- SORT & DISPLAY ----------------
results = sorted(results, key=lambda x: x["total"], reverse=True)

print("Top Resume Matches:\n")
for i, r in enumerate(results[:5], start=1):
    print(f"{i}. {r['name']}: {r['total']}% match ")
    print(f"   - Skills: {r['skills']}%")
    print(f"   - Education: {r['education']}")
    print(f"   - Experience: {r['experience']}\n")

best = results[0]
print("Best Match:", best["name"])
print(f"   Total Weighted Match: {best['total']}%")
print(f"   Skills Match: {best['skills']}%")
print(f"   Education: {best['education']}")
print(f"   Experience: {best['experience']}")
