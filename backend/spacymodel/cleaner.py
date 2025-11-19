import re
import json

with open("backend\spacymodel\extracted_resumes.json", "r") as f:
    extracted_data = json.load(f)

def clean_text_field(text):
    """Clean and split text into unique, meaningful items."""
    if not text:
        return []

    # Split by newline first
    items = text.split('\n')

    cleaned_items = []
    for item in items:
        # Remove extra spaces and weird symbols
        item = re.sub(r'[^A-Za-z0-9,.&()\-/% ]+', ' ', item)
        item = re.sub(r'\s+', ' ', item).strip()
        if item:
            cleaned_items.append(item)

    # Remove duplicates while keeping order
    seen = set()
    unique_items = []
    for item in cleaned_items:
        if item not in seen:
            unique_items.append(item)
            seen.add(item)

    return unique_items

# Process all resumes
cleaned_resumes = {}

for name, data in extracted_data.items():
    cleaned_resumes[name] = {
        "SKILLS": clean_text_field(data.get("skills", "")),
        "EDUCATION": clean_text_field(data.get("education", "")),
        "WORK EXPERIENCE": clean_text_field(data.get("work experience", "")),
        "PROJECT EXPERIENCE": clean_text_field(data.get("project experience", ""))
    }

# Save cleaned JSON
with open("backend\spacymodel\cleaned_resumes.json", "w") as f:
    json.dump(cleaned_resumes, f, indent=4)

print(" Cleaned resumes without duplication!")
