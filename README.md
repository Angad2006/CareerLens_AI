# Smart Resume Analyzer AI

An AI-powered resume analysis platform that provides ATS scoring, skills analysis, career prediction, and intelligent improvement suggestions.

## 🚀 Features

- **Resume Upload** — Drag-and-drop PDF/DOCX with instant text extraction
- **ATS Scoring** — Multi-factor ATS compatibility score (0-100)
- **Skills Analysis** — Detect technical, soft, tools, and industry-specific skills
- **Career Prediction** — AI-powered industry matching with confidence scores
- **ATS Keywords** — Keyword presence, density, and optimization analysis
- **Section Detection** — Identify and score resume sections
- **JD Matching** — Compare resume against any job description
- **AI Suggestions** — Prioritized improvement recommendations
- **Career Recommendations** — Roles, certifications, courses, technologies
- **Dark/Light Mode** — Modern glassmorphic UI with theme toggle

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Framer Motion, Recharts, React Icons |
| Backend | Python, FastAPI, spaCy, scikit-learn |
| Parsing | pdfplumber, python-docx |
| Database | Supabase (optional) |

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- pip

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy env file
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Run backend
python run.py
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at: http://localhost:5173

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload resume (PDF/DOCX) |
| POST | `/api/analyze` | Full resume analysis |
| POST | `/api/analyze/skills` | Skills extraction only |
| POST | `/api/analyze/ats-score` | ATS score only |
| POST | `/api/analyze/career` | Career prediction only |
| POST | `/api/jd-match` | Job description matching |
| GET | `/health` | Health check |

## 📁 Project Structure

```
Resume Analyzer/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API client
│   │   ├── context/        # Theme context
│   │   └── index.css       # Design system
│   └── package.json
├── backend/                # FastAPI Python
│   ├── app/
│   │   ├── routers/        # API routes
│   │   ├── services/       # NLP analysis services
│   │   ├── models/         # Pydantic schemas
│   │   ├── data/           # Skills & keywords databases
│   │   └── utils/          # Text utilities
│   └── requirements.txt
└── README.md
```

## 🎨 Design

- Glassmorphic cards with backdrop blur
- Animated background orbs
- Framer Motion entrance/interaction animations
- Responsive grid layout
- Custom SVG progress rings
- Dark navy/purple color palette

## 📄 License

MIT
