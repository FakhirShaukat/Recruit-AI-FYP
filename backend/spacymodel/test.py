import spacy
import fitz  # PyMuPDF
import re
import os
import json

# -------------------------------
# STEP 1: Load trained model
# -------------------------------
model_path = r"backend\spacymodel\model-best"  # update this path
nlp = spacy.load(model_path)
print("Model loaded successfully!\n")