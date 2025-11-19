import spacy
import fitz 
import re
import os
import json

model_path = "backend\spacymodel\model-best"
nlp = spacy.load(model_path)
print("Model loaded successfully!\n")

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Extract entities using model
def extract_entities_from_resume(text):
    doc = nlp(text)
    data = {"SKILLS": [], "EDUCATION": [], "WORK EXPERIENCE": [], "PROJECT EXPERIENCE": []}

    for ent in doc.ents:
        label = ent.label_.upper()
        if label in data:
            data[label].append(ent.text.strip())
    return data

# Clean extracted data
def clean_predicted_entities(resume_data):
    cleaned = {}
    for label, items in resume_data.items():
        cleaned[label] = []
        for text in items:
            # Remove unwanted symbols and normalize spacing
            text = re.sub(r'[^A-Za-z0-9,.\-()&/ ]+', '', text)
            text = re.sub(r'\s+', ' ', text).strip()
            if text and text not in cleaned[label]:
                cleaned[label].append(text)
    return cleaned

# Evaluate multiple resumes
folder_path = "backend/spacymodel/10_Resumes"

# Get all PDFs in folder automatically
resume_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.lower().endswith(".pdf")]

# Save extracted data to JSON

all_resumes_data = {}

for pdf_path in resume_files:
    if not os.path.exists(pdf_path):
        continue

    raw_text = extract_text_from_pdf(pdf_path)
    extracted_data = extract_entities_from_resume(raw_text)
    cleaned_data = clean_predicted_entities(extracted_data)

    # Convert list of items to multiline string per section
    resume_dict = {}
    for section, values in cleaned_data.items():
        if values:
            resume_dict[section.lower()] = "\n".join(values)
        else:
            resume_dict[section.lower()] = ""

    # Use PDF filename (without extension) as the key
    resume_name = os.path.splitext(os.path.basename(pdf_path))[0]
    all_resumes_data[resume_name] = resume_dict

# Save to JSON
output_json_path = "backend/spacymodel/extracted_resumes.json"
with open(output_json_path, "w", encoding="utf-8") as f:
    json.dump(all_resumes_data, f, indent=4, ensure_ascii=False)

print(f"\nExtracted data saved to '{output_json_path}'")


print("=====================  RESUME EVALUATION START =====================\n")

for pdf_path in resume_files:
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}\n")
        continue

    print(f" Processing: {os.path.basename(pdf_path)}")
    print("-" * 60)

    raw_text = extract_text_from_pdf(pdf_path)
    extracted_data = extract_entities_from_resume(raw_text)
    cleaned_data = clean_predicted_entities(extracted_data)

    for section, values in cleaned_data.items():
        if values:
            print(f"{section}:")
            for val in values:
                print(f"  - {val}")
            print("-" * 50)

    print(f" Finished processing: {os.path.basename(pdf_path)}\n")
    print("=" * 60 + "\n")

print(" All  resumes processed successfully!")

