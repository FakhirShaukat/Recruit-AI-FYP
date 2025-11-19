from sentence_transformers import SentenceTransformer, util
import json

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

# ------------------ UNIVERSAL WEIGHTS ------------------
SKILLS_WEIGHT = 0.50
EDUCATION_WEIGHT = 0.20
EXPERIENCE_WEIGHT = 0.20
PROJECT_WEIGHT = 0.10
# -------------------------------------------------------

# Sample Job Description (You can change this anytime)
job_post = {
    "title": "Frontend Developer (React + Node.js)",
    "description": "We are seeking a talented Frontend Developer skilled in React.js, Node.js, and Tailwind CSS to build scalable, user-friendly web applications.",
    "requirements": "Strong knowledge of JavaScript, React, Node.js, Express.js, REST APIs, and modern frontend frameworks.",
    "skills": "HTML, CSS, JavaScript, React.js, Node.js, Express.js, Tailwind CSS, Git, MongoDB",
    "education": "Bachelor's degree in Computer Science, Software Engineering, or related field.",
    "experience": "1+ years of experience in web application development or equivalent project work.",
    "jobtype": "Full-time"
}

# Encode JD sections
jd_skills_emb = model.encode(job_post["skills"], convert_to_tensor=True)
jd_edu_emb = model.encode(job_post["education"], convert_to_tensor=True)
jd_exp_emb = model.encode(job_post["experience"], convert_to_tensor=True)

# Load cleaned resumes
with open("backend/spacymodel/cleaned_resumes.json", "r", encoding="utf-8") as f:
    resumes = json.load(f)

results = []

# Compare each resume
for name, sections in resumes.items():
    skills_text = " ".join(sections.get("SKILLS", []))
    edu_text = " ".join(sections.get("EDUCATION", []))
    work_text = " ".join(sections.get("WORK EXPERIENCE", []))
    proj_text = " ".join(sections.get("PROJECT EXPERIENCE", []))

    # Fallback: if no work experience, use project experience
    if not work_text.strip() and proj_text.strip():
        work_text = proj_text

    # Encode resume sections
    skills_emb = model.encode(skills_text, convert_to_tensor=True)
    edu_emb = model.encode(edu_text, convert_to_tensor=True)
    exp_emb = model.encode(work_text, convert_to_tensor=True)

    # Cosine similarities
    skill_sim = float(util.cos_sim(skills_emb, jd_skills_emb))
    edu_sim = float(util.cos_sim(edu_emb, jd_edu_emb))
    exp_sim = float(util.cos_sim(exp_emb, jd_exp_emb))

    # Weighted total score
    total = (skill_sim * SKILLS_WEIGHT +
             edu_sim * EDUCATION_WEIGHT +
             exp_sim * EXPERIENCE_WEIGHT)

    results.append({
        "resume": name,
        "total_match": total * 100,
        "skills": skill_sim * 100,
        "education": edu_sim * 100,
        "experience": exp_sim * 100
    })

# Sort and select top 5
results = sorted(results, key=lambda x: x["total_match"], reverse=True)
top5 = results[:5]
best_match = results[0]

# ------------------- DISPLAY OUTPUT -------------------
print("\n🎯 Top 5 Resume Matches (Section-wise Breakdown):\n")
for i, r in enumerate(top5, 1):
    print(f"{i}. {r['resume']}: {r['total_match']:.2f}% match")
    print(f"   - SKILLS: {r['skills']:.2f}%")
    print(f"   - EDUCATION: {r['education']:.2f}%")
    print(f"   - EXPERIENCE/PROJECT: {r['experience']:.2f}%\n")

print("🏆 Best Match:", best_match['resume'])
print(f"   ✅ Total Match: {best_match['total_match']:.2f}%")
print(f"   🧠 Skills Match: {best_match['skills']:.2f}%")
print(f"   🎓 Education Match: {best_match['education']:.2f}%")
print(f"   💼 Experience/Project Match: {best_match['experience']:.2f}%\n")
