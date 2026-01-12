import re
import os
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent

# ---------------- Cleaning Functions ----------------
def clean_text_field(text):
    if not text:
        return []

    # Split by newline first
    items = text.split('\n')

    cleaned_items = []
    for item in items:
        # Remove extra symbols
        item = re.sub(r'[^A-Za-z0-9,.&()\-/% ]+', ' ', item)
        item = re.sub(r'\s+', ' ', item).strip()
        if item:
            cleaned_items.append(item)

    # Remove duplicates (preserve order)
    seen = set()
    unique_items = []
    for item in cleaned_items:
        if item not in seen:
            unique_items.append(item)
            seen.add(item)

    return unique_items

# ---------------- Run Pipeline ----------------
def run_cleaning_1(input_data=None, save_file=True):
    if input_data is None:
        file_path = BASE_DIR / "extracted_resumes.json"
        with open(file_path, "r", encoding="utf-8") as f:
            input_data = json.load(f)

    cleaned_resumes = {}
    for name, fields in input_data.items():
        cleaned_resumes[name] = {
            "SKILLS": clean_text_field(fields.get("skills", "")),
            "EDUCATION": clean_text_field(fields.get("education", "")),
            "WORK EXPERIENCE": clean_text_field(fields.get("work experience", "")),
            "PROJECT EXPERIENCE": clean_text_field(fields.get("project experience", ""))
        }

    # ---------------- Save File ----------------
    if save_file:
        output_file = BASE_DIR / "cleaned_resumes_1.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(cleaned_resumes, f, indent=4, ensure_ascii=False)
        print(f"Cleaned resumes saved as {output_file}")

    return cleaned_resumes

# ---------------- Standalone Execution ----------------
if __name__ == "__main__":
    run_cleaning_1()
