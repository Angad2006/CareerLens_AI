"""
Resume section detection service.
Identifies and extracts major resume sections (Education, Experience, Skills, etc.)
"""
import re


# Section heading patterns — common variations
SECTION_PATTERNS = {
    "contact": {
        "patterns": [
            r"contact\s*(?:info|information|details)?",
            r"personal\s*(?:info|information|details)?",
        ],
        "required": True
    },
    "summary": {
        "patterns": [
            r"(?:professional\s*)?summary",
            r"(?:career\s*)?objective",
            r"profile",
            r"about\s*me",
            r"executive\s*summary",
        ],
        "required": False
    },
    "experience": {
        "patterns": [
            r"(?:work\s*)?experience",
            r"(?:professional\s*)?experience",
            r"employment\s*(?:history)?",
            r"work\s*history",
            r"career\s*history",
        ],
        "required": True
    },
    "education": {
        "patterns": [
            r"education",
            r"academic\s*(?:background|qualifications?|history)?",
            r"qualifications?",
        ],
        "required": True
    },
    "skills": {
        "patterns": [
            r"(?:technical\s*)?skills",
            r"(?:core\s*)?competenc(?:ies|y)",
            r"expertise",
            r"technologies",
            r"tech\s*stack",
        ],
        "required": True
    },
    "projects": {
        "patterns": [
            r"projects?",
            r"(?:key\s*)?projects?",
            r"portfolio",
        ],
        "required": False
    },
    "certifications": {
        "patterns": [
            r"certifications?",
            r"licenses?\s*(?:&|and)?\s*certifications?",
            r"professional\s*(?:certifications?|development)",
        ],
        "required": False
    },
    "achievements": {
        "patterns": [
            r"achievements?",
            r"awards?\s*(?:&|and)?\s*achievements?",
            r"honors?\s*(?:&|and)?\s*awards?",
            r"accomplishments?",
        ],
        "required": False
    }
}


def detect_sections(text: str) -> dict:
    """
    Detect resume sections and evaluate completeness.

    Returns:
        dict with sections list and completeness_score.
    """
    lines = text.split("\n")
    sections = []
    detected_count = 0
    total_sections = len(SECTION_PATTERNS)

    for section_name, config in SECTION_PATTERNS.items():
        detected = False
        content = ""
        quality = 0.0

        for i, line in enumerate(lines):
            line_clean = line.strip().lower()
            # Skip very long lines (unlikely to be headers)
            if len(line_clean) > 80:
                continue

            for pattern in config["patterns"]:
                if re.search(pattern, line_clean, re.IGNORECASE):
                    detected = True

                    # Extract content until next section header or end
                    content_lines = []
                    for j in range(i + 1, min(i + 50, len(lines))):
                        next_line = lines[j].strip()
                        if not next_line:
                            content_lines.append("")
                            continue
                        # Check if next line is another section header
                        is_header = False
                        for other_config in SECTION_PATTERNS.values():
                            for other_pattern in other_config["patterns"]:
                                if re.search(other_pattern, next_line.lower()) and len(next_line) < 60:
                                    is_header = True
                                    break
                            if is_header:
                                break
                        if is_header:
                            break
                        content_lines.append(next_line)

                    content = "\n".join(content_lines).strip()
                    break
            if detected:
                break

        # Calculate quality based on content
        if detected and content:
            word_count = len(content.split())
            if word_count > 100:
                quality = 90.0
            elif word_count > 50:
                quality = 75.0
            elif word_count > 20:
                quality = 60.0
            elif word_count > 5:
                quality = 40.0
            else:
                quality = 20.0
        elif detected:
            quality = 15.0

        if detected:
            detected_count += 1

        # Even if not explicitly detected, check for implicit presence
        if not detected and section_name == "contact":
            # Contact info might not have a header
            email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
            phone_match = re.search(r"[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,15}", text)
            if email_match or phone_match:
                detected = True
                detected_count += 1
                quality = 50.0
                content = "Contact information found (no explicit header)"

        sections.append({
            "name": section_name.replace("_", " ").title(),
            "detected": detected,
            "content": content[:500],  # Truncate for response size
            "quality_score": quality
        })

    # Completeness score
    completeness = (detected_count / total_sections) * 100

    return {
        "sections": sections,
        "completeness_score": round(completeness, 1)
    }
