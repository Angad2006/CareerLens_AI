"""
ATS keyword analysis service.
Analyzes keyword presence, density, and optimization for target industry.
"""
import json
import re
from pathlib import Path
from collections import Counter

_keywords_db = None

def _get_keywords_db() -> dict:
    global _keywords_db
    if _keywords_db is None:
        path = Path(__file__).parent.parent / "data" / "keywords_db.json"
        with open(path, "r", encoding="utf-8") as f:
            _keywords_db = json.load(f)
    return _keywords_db

def analyze_keywords(text: str, target_industry: str = None) -> dict:
    db = _get_keywords_db()
    text_lower = text.lower()
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text_lower)

    target_keywords = list(db.get("universal", []))
    if target_industry:
        key = _norm(target_industry)
        if key in db:
            target_keywords.extend(db[key])

    present, missing, keyword_density = [], [], {}
    for kw in target_keywords:
        if kw.lower() in text_lower:
            present.append(kw)
            count = text_lower.count(kw.lower())
            keyword_density[kw] = round((count / max(len(words), 1)) * 100, 2)
        else:
            missing.append(kw)

    present = list(dict.fromkeys(present))
    missing = list(dict.fromkeys(missing))
    total = len(set(target_keywords))
    opt = (len(present) / total * 100) if total else 50.0

    return {
        "present_keywords": present,
        "missing_keywords": missing[:20],
        "keyword_density": dict(sorted(keyword_density.items(), key=lambda x: x[1], reverse=True)[:15]),
        "optimization_score": round(min(100, opt), 1)
    }

def _norm(industry: str) -> str:
    m = {
        "technology": "technology", "software": "technology",
        "data science": "data_science", "ai/ml": "ai_ml",
        "marketing": "marketing", "sales": "sales", "finance": "finance",
        "healthcare": "healthcare", "pharma": "pharma", "hr": "hr",
        "consulting": "consulting", "cybersecurity": "cybersecurity",
        "product management": "product_management", "ui/ux": "ui_ux",
        "operations": "operations", "customer support": "customer_support",
        "ecommerce": "ecommerce", "manufacturing": "manufacturing",
    }
    return m.get(industry.lower().strip(), industry.lower().replace(" ", "_"))
