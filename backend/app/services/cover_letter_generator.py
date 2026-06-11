"""
Cover Letter Generation Service.
Parses candidate resume metadata and matches against job description to output a tailored cover letter.
"""
import re
from datetime import datetime
from app.services.nlp_engine import extract_contact_info, get_nlp
from app.services.skills_extractor import extract_skills
from app.services.career_predictor import _estimate_experience_level

def _extract_name(text: str) -> str:
    """Extract candidate name from the first few lines using spaCy PERSON entities or fallback."""
    try:
        nlp = get_nlp()
        doc = nlp(text[:300])
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                # Clean name (remove any trailing email/numbers)
                name = ent.text.strip().replace("\n", " ")
                if len(name.split()) >= 2 and len(name) < 40:
                    return name
    except Exception:
        pass
        
    # Fallback: Extract the first non-empty line of the resume
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for line in lines[:3]:
        # Filter out contact info or section headings
        if '@' not in line and 'phone' not in line.lower() and not re.search(r'\d{3,}', line):
            if len(line) < 40 and len(line.split()) >= 2:
                return line
    return "Candidate Name"

def _extract_company_and_title(jd_text: str) -> tuple[str, str]:
    """Guess company name and job title from the first lines of the Job Description."""
    lines = [line.strip() for line in jd_text.split('\n') if line.strip()]
    job_title = "Target Position"
    company_name = "Company Name"
    
    # Simple regex guesses
    for line in lines[:10]:
        title_match = re.search(r'(?:role|position|title|job title)\s*:\s*(.+)', line, re.IGNORECASE)
        if title_match:
            job_title = title_match.group(1).strip()
            break
            
    for line in lines[:10]:
        company_match = re.search(r'(?:company|employer|organization)\s*:\s*(.+)', line, re.IGNORECASE)
        if company_match:
            company_name = company_match.group(1).strip()
            break
            
    # Second pass: If title not found, look at the first non-empty short line
    if job_title == "Target Position" and lines:
        for line in lines[:3]:
            if len(line) < 50 and len(line.split()) >= 2:
                job_title = line
                break
                
    return company_name, job_title

def generate_cover_letter(
    resume_text: str,
    jd_text: str,
    company_name: str = None,
    job_title: str = None
) -> dict:
    """
    Generate a tailored cover letter using resume and job description.
    """
    # 1. Gather candidate info
    contact = extract_contact_info(resume_text)
    name = _extract_name(resume_text)
    experience_level = _estimate_experience_level(resume_text)
    
    # 2. Extract skills
    skills_data = extract_skills(resume_text)
    hard_skills = skills_data.get("found_skills", {}).get("technical", [])
    soft_skills = skills_data.get("found_skills", {}).get("soft_skills", [])
    
    # 3. Gather JD info if not provided
    auto_company, auto_title = _extract_company_and_title(jd_text)
    final_company = company_name if company_name else auto_company
    final_title = job_title if job_title else auto_title
    
    # Clean experience level string for paragraph usage
    exp_label = "experienced"
    if "Senior" in experience_level:
        exp_label = "senior-level"
    elif "Mid" in experience_level:
        exp_label = "mid-level"
    elif "Junior" in experience_level:
        exp_label = "junior-level"
    elif "Entry" in experience_level:
        exp_label = "enthusiastic entry-level"
        
    # Get top 3 hard skills and top 2 soft skills for paragraph highlights
    skills_to_show = hard_skills[:3] if hard_skills else ["strategic planning", "project execution", "problem-solving"]
    softs_to_show = soft_skills[:2] if soft_skills else ["communication", "collaboration"]
    
    skills_str = ", ".join(skills_to_show[:-1]) + ", and " + skills_to_show[-1] if len(skills_to_show) > 1 else skills_to_show[0]
    softs_str = " and ".join(softs_to_show) if softs_to_show else "teamwork"
    
    # Clean email and phone layout
    contact_parts = []
    if contact.get("email"): contact_parts.append(contact["email"])
    if contact.get("phone"): contact_parts.append(contact["phone"])
    if contact.get("linkedin"): contact_parts.append(contact["linkedin"])
    header_contact = " | ".join(contact_parts)
    
    # Date
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Cover Letter Compilation
    cover_letter_text = f"""{name}
{header_contact}

{current_date}

Hiring Manager
{final_company}

Dear Hiring Team at {final_company},

I am writing to express my enthusiastic interest in the {final_title} position at {final_company}. As a {exp_label} professional, my background aligns closely with the qualifications and responsibilities outlined in your job description. With my experience in executing core industry workflows and optimizing project delivery, I am confident in my ability to make a meaningful impact on your team.

Throughout my career, I have developed expertise in areas such as {skills_str}. In my previous work, I have applied these technical capabilities alongside strong {softs_str} skills to resolve key business challenges, streamline processes, and collaborate with cross-functional partners. I take pride in delivering results that exceed benchmarks and driving projects from concept to completion.

What excites me most about the opportunity at {final_company} is your commitment to industry innovation and standard-setting work. I am eager to apply my unique competencies to help your organization achieve its operational and growth objectives. I believe my proactive approach and technical background make me an excellent fit for your current goals.

Thank you for your time and consideration. I would welcome the opportunity to discuss my background and how my skills can benefit the {final_title} role in more detail during an interview. 

Sincerely,

{name}"""

    return {
        "candidate_name": name,
        "company_name": final_company,
        "job_title": final_title,
        "cover_letter": cover_letter_text.strip()
    }
