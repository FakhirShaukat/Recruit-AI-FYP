from sentence_transformers import SentenceTransformer, util
import json

# Load Sentence Transformer Model
model = SentenceTransformer('all-MiniLM-L6-v2')
print("SentenceTransformer model loaded successfully!\n")

# Load Cleaned Resumes from JSON File
json_path = "backend\spacymodel\cleaned_resumes.json"  # your cleaned JSON file path

with open(json_path, "r", encoding="utf-8") as f:
    resumes_data = json.load(f)

print(f"Loaded {len(resumes_data)} resumes from cleaned_resumes_v2.json\n")

# Job Description (MongoDB format) for testing purpose
job_post = {
    "title": ".NET Core 7.0 Developer",
    "description": "We are looking for a skilled .NET Core Developer to design, develop, and maintain web applications using the .NET Core 7.0 framework, ensuring high-quality and scalable software solutions.",
    "requirements": "Design, develop, and maintain web applications using .NET Core 7.0 framework following best practices, design patterns, and coding standards. Collaborate with cross-functional teams and optimize performance within DevExpress Grid controls.",
    "skills": "C#, ASP.NET Core, DevExpress Grid controls, HTML5, CSS3, JavaScript, jQuery, SQL, SQL Server, MySQL, RESTful APIs, Agile methodologies (Scrum/Kanban).",
    "education": "Bachelor's degree in Computer Science, Software Engineering, or a related field.",
    "experience": "2+ years of professional experience in web application development using .NET Core and DevExpress Grid controls.",
    "salaryexpectation": "80000",
    "jobtype": "Full-time",
    "location": "Karachi"
}

# Combine job description fields into one string
job_description = f"""
Title: {job_post['title']}
Description: {job_post['description']}
Requirements: {job_post['requirements']}
Skills: {job_post['skills']}
Education: {job_post['education']}
Experience: {job_post['experience']}
Job Type: {job_post['jobtype']}
Location: {job_post['location']}
"""

# Encode Job Description
jd_embedding = model.encode(job_description, convert_to_tensor=True)


# Compute Resume Similarities
results = {}

for name, info in resumes_data.items():
    # Get main resume sections safely
    skills = " ".join(info.get("SKILLS", []))
    education = " ".join(info.get("EDUCATION", []))
    work_exp = " ".join(info.get("WORK EXPERIENCE", []))
    project_exp = " ".join(info.get("PROJECT EXPERIENCE", []))

    # If no work experience, use project experience
    if not work_exp.strip():
        work_exp = project_exp

    # Combine the final text (skills + education + work experience)
    combined_text = " ".join([skills, education, work_exp]).strip()

    if not combined_text:
        continue

    # Encode and compute similarity
    resume_embedding = model.encode(combined_text, convert_to_tensor=True)
    similarity = util.cos_sim(jd_embedding, resume_embedding).item()
    results[name] = round(similarity * 100, 2)

sorted_results = sorted(results.items(), key=lambda x: x[1], reverse=True)[:5]

print("\nTop 5 Resume Matches (Compared to Job Description):\n")
for i, (name, score) in enumerate(sorted_results, start=1):
    print(f"{i}. {name}: {score}% match")

# Highlight Best Match
if sorted_results:
    best_candidate = sorted_results[0][0]
    print(f"\nBest Match: {best_candidate}")
else:
    print("\nNo valid resumes found in the JSON file.")
