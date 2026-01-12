import json
import re
import os
from collections import OrderedDict
from difflib import SequenceMatcher
from pathlib import Path

BASE_DIR = Path(__file__).parent

# ---------------- Helper Functions ----------------
def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def remove_contact_info(text):
    """Remove phone numbers, emails, addresses, and URLs"""
    if not text:
        return text

    # Remove phone numbers (various formats)
    text = re.sub(r'\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}', '', text)
    text = re.sub(r'\+92[-.\s]?\d{2,4}[-.\s]?\d{7}', '', text)  # Pakistan format

    # Remove emails (more aggressive)
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '', text)
    text = re.sub(r'\b\w+@\w+\.\w+\b', '', text)  # Catch malformed emails
    text = re.sub(r'\b\w+gmail\.com\b', '', text, flags=re.IGNORECASE)  # Catch malformed emails like "hummibrohigmail.com"
    text = re.sub(r'\b\w+@\w+\b', '', text)  # Catch emails without domain extension

    # Remove URLs
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    text = re.sub(r'www\.(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    text = re.sub(r'linkedin\.com/[^\s]+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'github\.com/[^\s]+', '', text, flags=re.IGNORECASE)

    # Remove addresses (common patterns)
    text = re.sub(r'\b(?:House|Flat|Block|Street|Road|Avenue|Lane|Building|Apartment|Tower)\s+[^,]+(?:,\s*[^,]+)*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(?:Karachi|Pakistan|Lahore|Islamabad)[,\s]*', '', text, flags=re.IGNORECASE)

    return text.strip()

def remove_section_headers(text):
    """Remove common section headers and labels"""
    if not text:
        return text

    headers = [
        r'\bSKILLS\b', r'\bEDUCATION\b', r'\bWORK\s+EXPERIENCE\b', r'\bPROJECT\s+EXPERIENCE\b',
        r'\bPROJECTS\b', r'\bCONTACT\b', r'\bPROFILE\b', r'\bREFERENCE\b', r'\bCERTIFICATIONS\b',
        r'\bLANGUAGES\b', r'\bLANGUAGE\b', r'\bRELEVANT\b', r'\bADDITIONAL\s+EXPERIENCE\b',
        r'\bACHIEVEMENTS\b', r'\bPROFESSIONAL\b', r'\bSOFT\s+SKILLS\b', r'\bTECHNICAL\s+SKILLS\b',
        r'\bP\s+R\s+O\s+J\s+E\s+C\s+T\s+S\b', r'\bS\s+K\s+I\s+L\s+L\s+S\b', r'\bE\s+D\s+U\s+C\s+A\s+T\s+I\s+O\s+N\b',
        r'\bC\s+O\s+N\s+T\s+A\s+C\s+T\b', r'\bL\s+A\s+N\s+G\s+U\s+A\s+G\s+E\s+S\b'
    ]

    for header in headers:
        text = re.sub(header, '', text, flags=re.IGNORECASE)

    return text.strip()

def clean_text(text):
    """Clean and normalize text"""
    if not text:
        return ""

    # Remove contact info
    text = remove_contact_info(text)

    # Remove section headers
    text = remove_section_headers(text)

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove leading/trailing punctuation and whitespace
    text = text.strip(' ,.-;:')

    return text.strip()

def clean_skills(skills_list):
    """Clean skills but keep original format (no normalization)"""
    if not skills_list:
        return []

    cleaned_skills = []

    for skill_item in skills_list:
        if not skill_item:
            continue

        # Only remove contact info and noise, keep the skill format as-is
        cleaned = remove_contact_info(skill_item)
        cleaned = remove_section_headers(cleaned)

        # Remove extra whitespace but keep structure
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        if not cleaned or len(cleaned) < 2:
            continue

        # Skip if it's clearly not a skill (too long descriptions, work experience, etc.)
        if len(cleaned) > 150 or any(word in cleaned.lower() for word in ['developed', 'implemented', 'managed', 'responsibilities', 'years of experience', 'created engaging', 'user-friendly']):
            continue

        # Skip if it's clearly an address or contact info
        if any(word in cleaned.lower() for word in ['house no', 'flat no', 'block', 'karachi, pakistan', 'phone', 'email']):
            continue

        # Skip if it looks like a sentence/description rather than a skill list
        if cleaned.count(' ') > 6 and any(word in cleaned.lower() for word in ['created', 'designed', 'developed', 'implemented']):
            continue

        cleaned_skills.append(cleaned)

    # Remove duplicates while preserving original format
    seen = set()
    unique_skills = []
    for skill in cleaned_skills:
        normalized = skill.lower().strip()
        if normalized not in seen:
            seen.add(normalized)
            unique_skills.append(skill)

    return unique_skills

def clean_education(education_list):
    """Clean education entries - only keep actual education degrees"""
    if not education_list:
        return []

    cleaned_education = []

    # Education keywords that must be present
    edu_keywords = ['bachelor', 'master', 'degree', 'university', 'college', 'diploma',
                   'certificate', 'bsc', 'msc', 'mba', 'bba', 'bsse', 'bss', 'fsc',
                   'hsc', 'matric', 'intermediate', 'b.com', 'b com', 'm.com', 'm com',
                   'phd', 'doctorate', 'graduate', 'undergraduate']

    for edu in education_list:
        if not edu:
            continue

        cleaned = clean_text(edu)

        if not cleaned or len(cleaned) < 5:
            continue

        # Must contain education keywords
        has_edu_keyword = any(word in cleaned.lower() for word in edu_keywords)
        if not has_edu_keyword:
            continue

        # Skip if it's clearly work experience (has dates and job titles but no education keywords in context)
        # Check for date patterns that indicate work experience
        date_pattern = r'\d{2}\.\d{4}\s*-\s*\d{2}\.\d{4}'  # 08.2023 - 06.2024
        has_work_dates = bool(re.search(date_pattern, cleaned))
        if has_work_dates and not any(word in cleaned.lower() for word in ['university', 'college', 'school', 'academy', 'institute']):
            continue  # Likely work experience, not education

        # Skip if it's clearly an address (has house/flat/block but no education)
        if any(word in cleaned.lower() for word in ['flat no', 'house no', 'block', 'building', 'market']) and not has_edu_keyword:
            continue

        # Skip if it's clearly work experience or project description
        work_keywords = ['developed', 'implemented', 'managed', 'responsibilities',
                        'years of experience', 'built', 'created', 'designed', 'portfolio website']
        has_work_keyword = any(word in cleaned.lower() for word in work_keywords)

        # If it has work/project keywords, try to extract only education part
        if has_work_keyword:
            # First, try to extract the degree name and university info
            # Look for patterns like "Bachelor...University" or "Degree...College"
            degree_patterns = [
                r'(?:Bachelor|Master|B\.?Sc|M\.?Sc|MBA|BBA|BSSE|BS|MS|B\.?Com|M\.?Com)[^.!?]*(?:University|College|Institute)[^.!?]*(?:CGPA|GPA)?[^.!?]*',
                r'(?:Bachelor|Master|B\.?Sc|M\.?Sc|MBA|BBA|BSSE|BS|MS)[^.!?]*(?:University|College)[^.!?]*',
                r'(?:FSC|HSC|Intermediate|Matric)[^.!?]*(?:University|College|School|Academy)[^.!?]*'
            ]

            extracted_edu = None
            for pattern in degree_patterns:
                match = re.search(pattern, cleaned, re.IGNORECASE)
                if match:
                    extracted_edu = match.group(0).strip()
                    break

            if extracted_edu:
                # Clean up the extracted education - remove project descriptions
                # Split by common project keywords and take only the first part
                project_markers = ['developed', 'built', 'created', 'implemented', 'designed', 'portfolio website', 'responsive portfolio', 'a responsive']

                # Extract just the degree and university part, removing project descriptions
                # Check the full text for project markers (including multi-word)
                text_lower = extracted_edu.lower()
                first_marker_pos = len(extracted_edu)
                first_marker = None

                for marker in project_markers:
                    pos = text_lower.find(marker)
                    if pos != -1 and pos < first_marker_pos:
                        first_marker_pos = pos
                        first_marker = marker

                # Extract everything before the first project marker
                # But if "Developed" comes right after degree name, we need to handle it differently
                before_marker = extracted_edu[:first_marker_pos].strip()

                # Special case: if "Developed" or "a responsive" appears right after degree name
                # Pattern: "Engineering Developed" or "Engineering a responsive"
                if re.search(r'Engineering\s+(?:Developed|a\s+responsive)', before_marker, re.IGNORECASE):
                    # Extract just the degree part (stop at "Engineering")
                    eng_match = re.search(r'(?:Bachelor|Master|B\.?Sc|M\.?Sc|MBA|BBA|BSSE|BS|MS|B\.?Com|M\.?Com)[^.!?]*Engineering', before_marker, re.IGNORECASE)
                    if eng_match:
                        before_marker = eng_match.group(0).strip()
                        # Now we need to get university info from after the marker
                        after_marker = extracted_edu[first_marker_pos:]
                        if any(w in after_marker.lower() for w in ['university', 'college', 'cgpa', 'gpa', 'iqra', 'main campus', 'sep', 'oct', '2023']):
                            uni_match = re.search(r'(?:Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug)[^.!?]*(?:Iqra|University|College|CGPA|GPA|Main Campus)[^.!?]*(?:CGPA|GPA)?[^.!?]*', after_marker, re.IGNORECASE)
                            if uni_match:
                                before_marker = before_marker + ' ' + uni_match.group(0).strip()

                # Now extract degree and university from before_marker
                # Pattern: Degree name (stop at "Developed" or other project keywords) + University + CGPA
                degree_uni_pattern = r'(?:Bachelor|Master|B\.?Sc|M\.?Sc|MBA|BBA|BSSE|BS|MS|B\.?Com|M\.?Com|FSC|HSC|Intermediate|Matric)[^.!?]*(?:University|College|Institute|School|Academy|Iqra)[^.!?]*(?:CGPA|GPA|Main Campus)?[^.!?]*'
                degree_match = re.search(degree_uni_pattern, before_marker, re.IGNORECASE)
                if degree_match:
                    extracted_edu = degree_match.group(0).strip()
                else:
                    # If pattern didn't match, extract manually: Degree + University info
                    # Find degree start
                    degree_start = -1
                    for ekw in ['bachelor', 'master', 'bsc', 'msc', 'mba', 'bba', 'bsse']:
                        pos = before_marker.lower().find(ekw)
                        if pos != -1:
                            degree_start = pos
                            break

                    if degree_start != -1:
                        # Extract from degree start to before project marker
                        degree_part = before_marker[degree_start:].strip()
                        # Also check after marker for university/CGPA
                        after_marker = extracted_edu[first_marker_pos:]
                        if any(w in after_marker.lower() for w in ['university', 'college', 'cgpa', 'gpa', 'iqra', 'main campus', 'sep', 'oct', '2023']):
                            # Extract university/CGPA from after marker
                            uni_match = re.search(r'(?:Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug)[^.!?]*(?:Iqra|University|College|CGPA|GPA|Main Campus)[^.!?]*(?:CGPA|GPA)?[^.!?]*', after_marker, re.IGNORECASE)
                            if uni_match:
                                extracted_edu = degree_part + ' ' + uni_match.group(0).strip()
                            else:
                                extracted_edu = degree_part
                        else:
                            extracted_edu = degree_part
                    elif before_marker:
                        # Use what's before the marker if it contains education keywords
                        if any(ekw in before_marker.lower() for ekw in edu_keywords):
                            extracted_edu = before_marker

                # Final cleanup: remove any remaining project descriptions
                if extracted_edu:
                    # Remove project keywords that might still be in the text
                    # Check for "a responsive" or "responsive portfolio" patterns
                    text_lower = extracted_edu.lower()
                    # Find the earliest project marker
                    earliest_pos = len(extracted_edu)
                    earliest_marker = None
                    for marker in ['developed', 'built', 'created', 'implemented', 'designed', 'responsive portfolio', 'a responsive', 'portfolio website', 'using html5', 'using html', 'portfolio']:
                        pos = text_lower.find(marker)
                        if pos != -1 and pos < earliest_pos:
                            earliest_pos = pos
                            earliest_marker = marker

                    if earliest_marker and earliest_pos < len(extracted_edu):
                        # Take everything before the marker
                        before = extracted_edu[:earliest_pos].strip()
                        # Check if university/CGPA info comes after
                        after = extracted_edu[earliest_pos + len(earliest_marker):]
                        if any(w in after.lower() for w in ['university', 'college', 'cgpa', 'gpa', 'iqra', 'main campus', 'sep', 'oct', '2023']):
                            # Extract university part from after
                            uni_match = re.search(r'(?:Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug)[^.!?]*(?:Iqra|University|College|CGPA|GPA|Main Campus)[^.!?]*(?:CGPA|GPA)?[^.!?]*', after, re.IGNORECASE)
                            if uni_match:
                                extracted_edu = before + ' ' + uni_match.group(0).strip()
                            else:
                                extracted_edu = before
                        else:
                            extracted_edu = before

                cleaned = extracted_edu

                # One more pass: if cleaned still has project descriptions, remove them
                if cleaned:
                    # Check if "a responsive" or project keywords are still there
                    cleaned_lower = cleaned.lower()
                    # Find position of "a responsive" or other project markers
                    project_start = len(cleaned)
                    for marker in ['a responsive', 'responsive portfolio', 'portfolio website', 'developed', 'using html5', 'using html', 'using html5, css3', 'css3, javascript']:
                        pos = cleaned_lower.find(marker)
                        if pos != -1 and pos < project_start:
                            project_start = pos

                    if project_start < len(cleaned):
                        # Take only what's before the project description
                        degree_part = cleaned[:project_start].strip()
                        # Check if university info is after the project description
                        after_project = cleaned[project_start:]
                        if any(w in after_project.lower() for w in ['university', 'college', 'cgpa', 'gpa', 'iqra', 'main campus', 'sep', 'oct', '2023']):
                            # Extract university part - look for date pattern followed by university
                            uni_match = re.search(r'(?:Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug)[^.!?]*(?:Iqra|University|College|CGPA|GPA|Main Campus)[^.!?]*(?:CGPA|GPA)?[^.!?]*', after_project, re.IGNORECASE)
                            if uni_match:
                                cleaned = degree_part + ' ' + uni_match.group(0).strip()
                            else:
                                cleaned = degree_part
                        else:
                            cleaned = degree_part

                    # Final check: if "Portfolio" appears at the end, remove it
                    if cleaned.lower().endswith('portfolio'):
                        cleaned = cleaned[:-8].strip()
            else:
                # Split by sentences and keep only those with education keywords
                sentences = re.split(r'[.!?]\s+', cleaned)
                edu_sentences = []
                for s in sentences:
                    s = s.strip()
                    # Keep sentence if it has education keywords
                    has_edu = any(word in s.lower() for word in edu_keywords)
                    if has_edu:
                        # Remove work keywords from the sentence but keep the education part
                        words = s.split()
                        edu_words = []
                        for word in words:
                            if not any(wk in word.lower() for wk in work_keywords):
                                edu_words.append(word)
                            elif any(ekw in word.lower() for ekw in edu_keywords):
                                edu_words.append(word)  # Keep if it's also an education keyword
                        if edu_words:
                            edu_sentences.append(' '.join(edu_words))

                if edu_sentences:
                    cleaned = '. '.join(edu_sentences)
                else:
                    # Last resort: extract just the education keywords and nearby context
                    words = cleaned.split()
                    edu_parts = []
                    for i, word in enumerate(words):
                        if any(ekw in word.lower() for ekw in edu_keywords):
                            # Include 15 words before and after
                            start = max(0, i - 15)
                            end = min(len(words), i + 15)
                            edu_parts = words[start:end]
                            break
                    if edu_parts:
                        cleaned = ' '.join(edu_parts)
                    else:
                        continue  # Skip if no education content found

        # Remove project/work descriptions that might be mixed in
        # Keep only sentences/phrases with education content
        if len(cleaned) > 200:
            # Too long, likely has mixed content - extract education parts
            words = cleaned.split()
            edu_parts = []
            for i, word in enumerate(words):
                if any(ekw in word.lower() for ekw in edu_keywords):
                    # Include surrounding context (10 words before and after)
                    start = max(0, i - 10)
                    end = min(len(words), i + 10)
                    edu_parts.extend(words[start:end])
                    break
            if edu_parts:
                cleaned = ' '.join(edu_parts)

        cleaned_education.append(cleaned)

    # Remove duplicates
    return list(OrderedDict.fromkeys(cleaned_education))

def clean_experience(work_list):
    """Extract experience entries with numeric years and/or company names"""
    if not work_list:
        return []

    cleaned_experience = []

    # Pattern to match numeric experience (years) - more flexible
    year_pattern = r'\d+\+?\s*(?:years?|year|Years?|Year)\s*(?:of\s*)?(?:experience|Experience)?'
    # Pattern to match company names (usually capitalized words, may include Ltd, Inc, etc.)
    company_pattern = r'[A-Z][a-zA-Z0-9\s&.,-]+(?:Ltd|Limited|Inc|Corporation|Corp|Pvt|Private|Solutions|Technologies|Systems|Group|Company|Bank|Motors|Service|Hub|Digital)?'

    # Also look for job titles that might indicate experience
    job_titles = ['developer', 'engineer', 'manager', 'executive', 'intern', 'officer',
                 'specialist', 'analyst', 'consultant', 'designer', 'ambassador', 'trainee']

    for work in work_list:
        if not work:
            continue

        cleaned = clean_text(work)

        if not cleaned or len(cleaned) < 3:
            continue

        # Check for numeric years of experience
        has_years = bool(re.search(year_pattern, cleaned, re.IGNORECASE))

        # Try to find company name
        has_company = bool(re.search(company_pattern, cleaned))

        # Check for common company indicators
        company_indicators = ['ltd', 'limited', 'inc', 'corp', 'pvt', 'private',
                           'solutions', 'technologies', 'systems', 'group', 'company',
                           'bank', 'motors', 'service', 'hub', 'digital', 'abtach']
        has_company_indicator = any(indicator in cleaned.lower() for indicator in company_indicators)

        # Check for job titles
        has_job_title = any(title in cleaned.lower() for title in job_titles)

        # Check for date patterns (Jan 2022, March 2025, etc.)
        date_pattern = r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}'
        has_dates = bool(re.search(date_pattern, cleaned, re.IGNORECASE))

        # Keep if it has:
        # 1. Years of experience (keep even if standalone)
        # 2. Company name with job title
        # 3. Job title with dates
        # 4. Years + company/job title combination
        if has_years:
            # Has years - keep it, try to include company if present
            if has_company or has_company_indicator:
                # Extract relevant parts
                sentences = cleaned.split('.')
                relevant_sentences = []
                for sentence in sentences:
                    if re.search(year_pattern, sentence, re.IGNORECASE) or \
                       (re.search(company_pattern, sentence) or any(ind in sentence.lower() for ind in company_indicators)):
                        relevant_sentences.append(sentence.strip())

                if relevant_sentences:
                    cleaned = '. '.join(relevant_sentences)

            # Keep years of experience even if standalone (user wants numeric experience)
            cleaned_experience.append(cleaned)
        elif (has_company or has_company_indicator) and has_job_title:
            # Has company and job title - keep it
            cleaned_experience.append(cleaned)
        elif has_job_title and has_dates:
            # Has job title with dates - keep it
            cleaned_experience.append(cleaned)
        elif has_company_indicator and len(cleaned) > 10:
            # Has company indicator and is substantial - might be valid
            cleaned_experience.append(cleaned)

    # Remove duplicates
    return list(OrderedDict.fromkeys(cleaned_experience))

def clean_project_experience(project_list):
    """Clean project experience entries - only keep project-related content"""
    if not project_list:
        return []

    cleaned_projects = []

    # Project-related keywords
    project_keywords = ['developed', 'built', 'created', 'implemented', 'designed',
                       'system', 'app', 'application', 'website', 'web app', 'project',
                       'platform', 'portal', 'management system', 'e-commerce',
                       'ecommerce', 'mobile app', 'web application', 'software',
                       'marketing', 'seo', 'smm', 'recruitment', 'portfolio']

    # Work-related keywords that should NOT be in projects (unless it's clearly a project)
    work_keywords = ['years of experience', 'ltd', 'limited', 'company', 'responsibilities']

    for project in project_list:
        if not project:
            continue

        cleaned = clean_text(project)

        if not cleaned or len(cleaned) < 3:
            continue

        # Must contain project-related keywords OR be a short project name
        has_project_keyword = any(word in cleaned.lower() for word in project_keywords)

        # Check if it's a short project name or title
        is_short_name = len(cleaned) < 100 and (
            any(word in cleaned.lower() for word in ['system', 'app', 'website', 'platform',
                'portal', 'management', 'marketing', 'project', 'website', 'portfolio',
                'advisor', 'manager', 'development']) or
            '(' in cleaned or ')' in cleaned  # Often project names have parentheses
        )

        # Check if it's a job title that might be a project role
        project_roles = ['advisor', 'manager', 'developer', 'consultant', 'specialist', 'development manager']
        is_project_role = any(role in cleaned.lower() for role in project_roles) and len(cleaned) < 100

        # Also check if it contains company indicators but is short (likely a project title with company)
        has_company_in_project = len(cleaned) < 80 and any(ind in cleaned.lower() for ind in ['ltd', 'pvt', 'digital', 'solutions'])

        # Skip if it's clearly a skill, tool, or education (unless it's a project name)
        if not has_project_keyword and not is_short_name and not is_project_role and not has_company_in_project:
            # Check if it might still be a project (has action words)
            if not any(word in cleaned.lower() for word in ['involved', 'managed', 'spearheaded', 'gathered', 'directed']):
                continue  # Skip skills, tools, etc.

        # Skip if it's clearly education
        if any(word in cleaned.lower() for word in ['bachelor', 'master', 'degree', 'university', 'college', 'cgpa', 'gpa']):
            # Unless it's part of a project description
            if not any(word in cleaned.lower() for word in ['developed', 'built', 'created', 'project', 'app', 'system']):
                continue

        # Keep work experience that's actually project descriptions (like "Technical Recruitment")
        # These often describe project work rather than employment
        if any(word in cleaned.lower() for word in work_keywords):
            # Only keep if it also has project-like descriptions OR is short (likely a project title)
            if any(word in cleaned.lower() for word in ['involved', 'process', 'campaign', 'spearheaded', 'gathered', 'directed', 'analyzed']) or len(cleaned) < 80:
                pass  # Keep it - it's describing project work or is a short project title
            else:
                continue  # Skip pure work experience

        cleaned_projects.append(cleaned)

    # Remove duplicates
    return list(OrderedDict.fromkeys(cleaned_projects))

def extract_name_parts(name):
    """Extract meaningful name parts from resume name"""
    # Remove common suffixes
    name = re.sub(r'\s*\(.*?\)', '', name)  # Remove parentheses content
    name = re.sub(r'\s*-\s*v?\d+\.?\d*.*', '', name)  # Remove version numbers
    name = re.sub(r'\s*(resume|cv).*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'[^a-z0-9\s]', '', name.lower())
    # Extract words (likely name parts)
    words = [w for w in name.split() if len(w) > 2 and w not in ['resume', 'cv', 'the', 'and', 'for']]
    return set(words)

def are_similar_names(name1, name2):
    """Check if two resume names refer to the same person"""
    parts1 = extract_name_parts(name1)
    parts2 = extract_name_parts(name2)

    if not parts1 or not parts2:
        return False

    # Check if they share significant name parts (at least 1 meaningful common word)
    common = parts1 & parts2
    if len(common) >= 1 and len(common) >= min(len(parts1), len(parts2)) * 0.5:  # At least 50% overlap
        return True

    # Also check if one name is a subset of the other (e.g., "danish" in "danish ahmed")
    if parts1.issubset(parts2) or parts2.issubset(parts1):
        return True

    # Check similarity of full normalized names
    n1 = ''.join(sorted(parts1))
    n2 = ''.join(sorted(parts2))
    if len(n1) > 0 and len(n2) > 0:
        similarity = SequenceMatcher(None, n1, n2).ratio()
        if similarity > 0.5:  # Lower threshold
            return True

    return False

def find_duplicate_resumes(resumes):
    """Find duplicate resumes based on name similarity and content"""
    duplicates = {}
    keys = list(resumes.keys())

    for i, key1 in enumerate(keys):
        for key2 in keys[i+1:]:
            if are_similar_names(key1, key2):
                # Check content similarity
                resume1 = resumes[key1]
                resume2 = resumes[key2]

                # Compare skills (normalize for comparison)
                skills1 = set([s.lower().strip() for s in resume1.get('SKILLS', resume1.get('Skills', [])) if s])
                skills2 = set([s.lower().strip() for s in resume2.get('SKILLS', resume2.get('Skills', [])) if s])

                # Also compare education
                edu1 = set([e.lower().strip()[:50] for e in resume1.get('EDUCATION', resume1.get('Education', [])) if e])  # First 50 chars
                edu2 = set([e.lower().strip()[:50] for e in resume2.get('EDUCATION', resume2.get('Education', [])) if e])

                # If names are similar and they share significant content, mark as duplicate
                skill_overlap = 0
                if skills1 and skills2:
                    skill_overlap = len(skills1 & skills2) / max(len(skills1), len(skills2))

                edu_overlap = 0
                if edu1 and edu2:
                    edu_overlap = len(edu1 & edu2) / max(len(edu1), len(edu2))

                # If significant overlap in skills or education, or if names are very similar
                if skill_overlap > 0.4 or edu_overlap > 0.3 or (skill_overlap > 0.2 and edu_overlap > 0.2):
                    if key1 not in duplicates:
                        duplicates[key1] = []
                    duplicates[key1].append(key2)

    return duplicates

def clean_resume_data(resumes):
    """Clean all resume data"""
    cleaned_resumes = {}
    duplicates = find_duplicate_resumes(resumes)
    skip_keys = set()

    # Mark duplicates to skip (keep the first one, skip others)
    for key, dup_list in duplicates.items():
        skip_keys.update(dup_list)
        print(f"Found duplicate: Keeping '{key}', removing: {', '.join(dup_list)}")

    for name, resume in resumes.items():
        if name in skip_keys:
            print(f"Skipping duplicate resume: {name}")
            continue

        cleaned_resume = {
            'Skills': clean_skills(resume.get('SKILLS', [])),
            'Education': clean_education(resume.get('EDUCATION', [])),
            'Experience': clean_experience(resume.get('WORK EXPERIENCE', [])),
            'Project Experience': clean_project_experience(resume.get('PROJECT EXPERIENCE', []))
        }

        # Only keep resume if it has at least some meaningful data
        total_items = (len(cleaned_resume['Skills']) +
                      len(cleaned_resume['Education']) +
                      len(cleaned_resume['Experience']) +
                      len(cleaned_resume['Project Experience']))

        if total_items > 0:
            cleaned_resumes[name] = cleaned_resume
        else:
            print(f"Removing resume with no valid data: {name}")

    return cleaned_resumes

def convert_extracted_format(resumes):
    """Convert from extracted_resumes.json format (lowercase keys, strings) to cleaned format (uppercase keys, arrays)"""
    converted = {}
    for name, resume in resumes.items():
        converted_resume = {}

        # Convert skills (string to array)
        skills_str = resume.get('skills', '') or resume.get('SKILLS', '')
        if isinstance(skills_str, str):
            skills_list = [s.strip() for s in skills_str.split('\n') if s.strip()]
        else:
            skills_list = skills_str if isinstance(skills_str, list) else []
        converted_resume['SKILLS'] = skills_list

        # Convert education (string to array)
        edu_str = resume.get('education', '') or resume.get('EDUCATION', '')
        if isinstance(edu_str, str):
            edu_list = [e.strip() for e in edu_str.split('\n') if e.strip()] if edu_str else []
        else:
            edu_list = edu_str if isinstance(edu_str, list) else []
        converted_resume['EDUCATION'] = edu_list

        # Convert work experience
        work_str = resume.get('work experience', '') or resume.get('WORK EXPERIENCE', '')
        if isinstance(work_str, str):
            work_list = [w.strip() for w in work_str.split('\n') if w.strip()] if work_str else []
        else:
            work_list = work_str if isinstance(work_str, list) else []
        converted_resume['WORK EXPERIENCE'] = work_list

        # Convert project experience
        proj_str = resume.get('project experience', '') or resume.get('PROJECT EXPERIENCE', '')
        if isinstance(proj_str, str):
            proj_list = [p.strip() for p in proj_str.split('\n') if p.strip()] if proj_str else []
        else:
            proj_list = proj_str if isinstance(proj_str, list) else []
        converted_resume['PROJECT EXPERIENCE'] = proj_list

        converted[name] = converted_resume

    return converted

def run_cleaning_2(input_data=None, save_file=True):
    """
    input_data: dict of resumes from Cleaning1
    If None, loads from cleaned_resumes_1.json
    """
    if input_data is None:
        input_file = BASE_DIR / "cleaned_resumes_1.json"
        input_data = load_json(input_file)

    print(f"Loaded {len(input_data)} resumes for further cleaning...")

    cleaned_resumes = clean_resume_data(input_data)

    print(f"Final cleaned resumes count: {len(cleaned_resumes)}")

    if save_file:
        output_file = BASE_DIR / "cleaned_resumes_2.json"
        save_json(cleaned_resumes, output_file)
        print(f"Cleaned resumes saved as {output_file}")

    return cleaned_resumes

# ---------------- Standalone Execution ----------------
if __name__ == "__main__":
    run_cleaning_2()
