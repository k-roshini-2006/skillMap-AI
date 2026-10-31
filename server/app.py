import io
import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from functools import wraps

from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
from pypdf import PdfReader
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESUMES_DB_PATH = os.path.join(BASE_DIR, "resumes.db")
USERS_DB_PATH = os.path.join(BASE_DIR, "users.db")
JWT_SECRET = os.getenv("JWT_SECRET", "skillmap_ai_super_secret_jwt_key_2026")
JWT_ALGORITHM = "HS256"

app = Flask(__name__, static_folder="static", static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload

# Enable CORS for frontend clients
CORS(app, origins=["*"], supports_credentials=True)

# --------------------------------------------------------------------------
# Database Connection Helpers
# --------------------------------------------------------------------------
def get_resumes_db():
    if "resumes_db" not in g:
        g.resumes_db = sqlite3.connect(RESUMES_DB_PATH)
        g.resumes_db.row_factory = sqlite3.Row
    return g.resumes_db

def get_users_db():
    if "users_db" not in g:
        g.users_db = sqlite3.connect(USERS_DB_PATH)
        g.users_db.row_factory = sqlite3.Row
    return g.users_db

@app.teardown_appcontext
def close_databases(_exc):
    resumes_db = g.pop("resumes_db", None)
    if resumes_db is not None:
        resumes_db.close()
    users_db = g.pop("users_db", None)
    if users_db is not None:
        users_db.close()

def init_databases():
    """Initializes schemas for both users.db and resumes.db."""
    # 1. users.db
    with sqlite3.connect(USERS_DB_PATH) as udb:
        udb.execute(
            """CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                target_role TEXT DEFAULT 'Software Engineer',
                phone TEXT DEFAULT '',
                location TEXT DEFAULT '',
                created_at TEXT NOT NULL
            )"""
        )
        # Seed default demo/admin user if table is empty
        cur = udb.execute("SELECT COUNT(*) FROM users")
        if cur.fetchone()[0] == 0:
            now_iso = datetime.now(timezone.utc).isoformat()
            demo_pass = generate_password_hash("roshini123")
            admin_pass = generate_password_hash("Admin@123")
            udb.execute(
                """INSERT INTO users (name, email, password_hash, role, target_role, phone, location, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                ("ROSHINI K", "roshini@gmail.com", demo_pass, "user", "Software Engineer", "+91 98765 43210", "Chennai, Tamil Nadu", now_iso)
            )
            udb.execute(
                """INSERT INTO users (name, email, password_hash, role, target_role, phone, location, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                ("SkillMap Admin", "admin@skillmap.ai", admin_pass, "admin", "Platform Lead", "+91 98765 00000", "Bangalore, India", now_iso)
            )
            udb.commit()

    # 2. resumes.db
    with sqlite3.connect(RESUMES_DB_PATH) as rdb:
        rdb.execute(
            """CREATE TABLE IF NOT EXISTS resumes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                filename TEXT NOT NULL,
                candidate_name TEXT,
                email TEXT,
                phone TEXT,
                target_role TEXT NOT NULL,
                match_score INTEGER,
                skills_json TEXT,
                analysis_json TEXT,
                resume_text TEXT,
                engine TEXT,
                created_at TEXT NOT NULL
            )"""
        )
        rdb.execute(
            """CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                resume_id INTEGER,
                course_id TEXT,
                course_title TEXT NOT NULL,
                skill TEXT NOT NULL,
                previous_score INTEGER,
                new_score INTEGER,
                completed_at TEXT NOT NULL
            )"""
        )
        # Ensure user_id column exists if table existed previously without it
        try:
            cols = [col[1] for col in rdb.execute("PRAGMA table_info(resumes)").fetchall()]
            if "user_id" not in cols:
                rdb.execute("ALTER TABLE resumes ADD COLUMN user_id INTEGER")
        except Exception:
            pass

# --------------------------------------------------------------------------
# Auth Token Middleware
# --------------------------------------------------------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

        if not token:
            return jsonify(error="Authentication token is missing. Please log in."), 401

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("id")
            udb = get_users_db()
            user = udb.execute("SELECT id, name, email, role, target_role, phone, location FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                return jsonify(error="User associated with token not found."), 401
            g.current_user = dict(user)
        except jwt.ExpiredSignatureError:
            return jsonify(error="Session expired. Please log in again."), 401
        except Exception as e:
            return jsonify(error=f"Invalid token: {str(e)}"), 401

        return f(*args, **kwargs)
    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        g.current_user = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        if token:
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                user_id = payload.get("id")
                udb = get_users_db()
                user = udb.execute("SELECT id, name, email, role, target_role, phone, location FROM users WHERE id = ?", (user_id,)).fetchone()
                if user:
                    g.current_user = dict(user)
            except Exception:
                g.current_user = None
        return f(*args, **kwargs)
    return decorated

# --------------------------------------------------------------------------
# PDF Text Extraction (pypdf)
# --------------------------------------------------------------------------
def extract_text_from_pdf(filename: str, data: bytes) -> str:
    """Accurately extracts raw text from PDF resume using pypdf."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        try:
            reader = PdfReader(io.BytesIO(data))
            text_pages = []
            for p in reader.pages:
                extracted = p.extract_text()
                if extracted:
                    text_pages.append(extracted)
            full_text = "\n".join(text_pages).strip()
            if full_text:
                return full_text
        except Exception as e:
            print("Error parsing PDF via pypdf:", e)

    if ext in ("txt", "md", "csv"):
        return data.decode("utf-8", errors="ignore").strip()

    # Fallback for plain string / decoded content
    try:
        decoded = data.decode("utf-8", errors="ignore").strip()
        if len(decoded) > 20:
            return decoded
    except Exception:
        pass

    return ""

def extract_contacts(text: str) -> dict:
    """Extracts candidate email and phone number using regex."""
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    phone_match = re.search(r"(\+?\d[\d\s().-]{8,}\d)", text)
    return {
        "email": email_match.group(0).strip() if email_match else "",
        "phone": phone_match.group(0).strip() if phone_match else ""
    }

def extract_candidate_name(text: str, default: str = "ROSHINI K") -> str:
    """Extracts the candidate's name from resume header lines."""
    lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 1]
    for line in lines[:8]:
        # Ignore lines with emails, links, or digits
        if "@" in line or "http" in line or "www" in line or len(re.findall(r"\d", line)) > 3:
            continue
        # Clean line
        clean = re.sub(r"[^a-zA-Z\s.]", "", line).strip()
        words = clean.split()
        if 1 <= len(words) <= 4 and 2 <= len(clean) <= 30:
            # Skip common section headers
            if clean.lower() in ("resume", "curriculum vitae", "cv", "summary", "profile", "contact", "experience", "education", "skills"):
                continue
            return clean.title()
    return default

# --------------------------------------------------------------------------
# Role Skills Taxonomy & Dynamic Scoring Engine
# --------------------------------------------------------------------------
ROLE_SKILLS = {
    "software engineer": {
        "core": ["python", "java", "c++", "c#", "data structures", "algorithms", "git", "sql", "rest api", "system design", "docker", "unit testing"],
        "aliases": {"c++": ["cpp", "c plus plus"], "data structures": ["dsa"], "rest api": ["rest", "restful", "api"], "unit testing": ["pytest", "junit", "testing"]},
        "category_map": {
            "python": "Programming", "java": "Programming", "c++": "Programming", "c#": "Programming",
            "data structures": "CS Core", "algorithms": "CS Core", "git": "Tools & VCS",
            "sql": "Databases", "rest api": "Backend Architecture", "system design": "Architecture",
            "docker": "DevOps", "unit testing": "Quality Assurance"
        }
    },
    "data scientist": {
        "core": ["python", "r", "machine learning", "deep learning", "statistics", "sql", "pandas", "numpy", "scikit-learn", "data visualization", "tensorflow", "pytorch"],
        "aliases": {"machine learning": ["ml"], "deep learning": ["dl"], "statistics": ["statistical analysis", "stats"], "data visualization": ["tableau", "matplotlib", "seaborn", "power bi"]},
        "category_map": {
            "python": "Core Lang", "r": "Core Lang", "machine learning": "AI / ML", "deep learning": "AI / ML",
            "statistics": "Mathematics", "sql": "Databases", "pandas": "Data Wrangling", "numpy": "Computation",
            "scikit-learn": "ML Tooling", "data visualization": "BI & Viz", "tensorflow": "Deep Learning", "pytorch": "Deep Learning"
        }
    },
    "data analyst": {
        "core": ["sql", "excel", "python", "power bi", "tableau", "statistics", "data visualization", "data cleaning", "business intelligence", "etl", "communication"],
        "aliases": {"excel": ["advanced excel", "spreadsheets"], "data cleaning": ["data wrangling", "preprocessing"], "etl": ["data pipelines"]},
        "category_map": {
            "sql": "Querying", "excel": "Analytics", "python": "Scripting", "power bi": "BI Tool",
            "tableau": "BI Tool", "statistics": "Analytics", "data visualization": "Visualization",
            "data cleaning": "Data Prep", "business intelligence": "Domain Knowledge", "etl": "Data Engineering", "communication": "Soft Skill"
        }
    },
    "frontend": {
        "core": ["html", "css", "javascript", "typescript", "react", "vue", "angular", "tailwind", "redux", "responsive design", "git", "webpack"],
        "aliases": {"javascript": ["js"], "typescript": ["ts"], "react": ["reactjs", "react.js"], "tailwind": ["tailwindcss"], "responsive design": ["mobile responsive"]},
        "category_map": {
            "html": "Markup", "css": "Styling", "javascript": "Frontend Core", "typescript": "Frontend Core",
            "react": "Framework", "vue": "Framework", "angular": "Framework", "tailwind": "CSS Library",
            "redux": "State Management", "responsive design": "Design", "git": "Tools", "webpack": "Build Tools"
        }
    },
    "backend": {
        "core": ["python", "node", "express", "flask", "django", "sql", "postgresql", "mongodb", "rest api", "docker", "redis", "git", "microservices", "aws"],
        "aliases": {"node": ["nodejs", "node.js"], "postgresql": ["postgres"], "rest api": ["rest", "api"], "microservices": ["distributed systems"]},
        "category_map": {
            "python": "Backend Lang", "node": "Runtime", "express": "Framework", "flask": "Framework", "django": "Framework",
            "sql": "Databases", "postgresql": "Relational DB", "mongodb": "NoSQL DB", "rest api": "Web Services",
            "docker": "Containers", "redis": "Caching", "git": "VCS", "microservices": "Architecture", "aws": "Cloud"
        }
    },
    "full stack": {
        "core": ["html", "css", "javascript", "react", "node", "python", "sql", "mongodb", "rest api", "docker", "git", "aws"],
        "aliases": {"javascript": ["js"], "react": ["reactjs"], "node": ["nodejs"], "rest api": ["rest", "api"]},
        "category_map": {
            "html": "Frontend", "css": "Frontend", "javascript": "Core Web", "react": "UI Framework",
            "node": "Backend", "python": "Backend", "sql": "Databases", "mongodb": "Databases",
            "rest api": "APIs", "docker": "DevOps", "git": "VCS", "aws": "Cloud"
        }
    },
    "machine learning engineer": {
        "core": ["python", "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "mlops", "docker", "sql", "feature engineering", "nlp", "computer vision"],
        "aliases": {"machine learning": ["ml"], "deep learning": ["dl"], "mlops": ["model deployment", "ci/cd for ml"]},
        "category_map": {
            "python": "Programming", "machine learning": "Algorithms", "deep learning": "Neural Nets",
            "pytorch": "Frameworks", "tensorflow": "Frameworks", "scikit-learn": "Tooling",
            "mlops": "Productionization", "docker": "Containers", "sql": "Databases",
            "feature engineering": "Data Science", "nlp": "Specialization", "computer vision": "Specialization"
        }
    },
    "devops": {
        "core": ["docker", "kubernetes", "aws", "azure", "linux", "ci/cd", "jenkins", "terraform", "git", "bash", "monitoring"],
        "aliases": {"ci/cd": ["continuous integration", "github actions"], "kubernetes": ["k8s"]},
        "category_map": {
            "docker": "Containers", "kubernetes": "Orchestration", "aws": "Cloud Provider", "azure": "Cloud Provider",
            "linux": "OS", "ci/cd": "Automation", "jenkins": "CI Tools", "terraform": "IaC", "git": "VCS", "bash": "Scripting", "monitoring": "Observability"
        }
    }
}

SKILL_COURSE_RECOMMENDATIONS = {
    "statistics": {
        "title": "Stanford Statistics for Data Science",
        "platform": "Coursera",
        "duration": "4 weeks",
        "url": "https://www.coursera.org/learn/stanford-statistics",
        "level": "Intermediate",
        "targetLevel": 85
    },
    "machine learning": {
        "title": "Machine Learning Specialization",
        "platform": "Coursera / DeepLearning.AI",
        "duration": "6 weeks",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "level": "Intermediate",
        "targetLevel": 90
    },
    "deep learning": {
        "title": "Deep Learning Fundamentals & PyTorch",
        "platform": "edX / DeepLearning.AI",
        "duration": "8 weeks",
        "url": "https://www.deeplearning.ai/",
        "level": "Advanced",
        "targetLevel": 85
    },
    "data visualization": {
        "title": "Tableau & Power BI for Data Visualization",
        "platform": "Coursera",
        "duration": "3 weeks",
        "url": "https://www.coursera.org/learn/data-visualization-tableau",
        "level": "Beginner",
        "targetLevel": 80
    },
    "sql": {
        "title": "Advanced SQL & Database Engineering",
        "platform": "Khan Academy / Coursera",
        "duration": "4 weeks",
        "url": "https://www.coursera.org/learn/sql-for-data-science",
        "level": "Intermediate",
        "targetLevel": 90
    },
    "docker": {
        "title": "Docker & Container Mastery",
        "platform": "Udemy",
        "duration": "3 weeks",
        "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
        "level": "Intermediate",
        "targetLevel": 85
    },
    "react": {
        "title": "Modern React & Next.js Full Stack",
        "platform": "edX",
        "duration": "5 weeks",
        "url": "https://react.dev/learn",
        "level": "Intermediate",
        "targetLevel": 90
    },
    "python": {
        "title": "Python for Everybody Specialization",
        "platform": "Coursera",
        "duration": "4 weeks",
        "url": "https://www.coursera.org/specializations/python",
        "level": "Beginner-Intermediate",
        "targetLevel": 95
    },
    "system design": {
        "title": "Grokking Modern System Design Architecture",
        "platform": "Educative",
        "duration": "4 weeks",
        "url": "https://www.educative.io/courses/grokking-the-system-design-interview",
        "level": "Advanced",
        "targetLevel": 85
    },
    "aws": {
        "title": "AWS Certified Solutions Architect Path",
        "platform": "A Cloud Guru / Coursera",
        "duration": "6 weeks",
        "url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
        "level": "Intermediate",
        "targetLevel": 85
    }
}

def analyze_resume_text(resume_text: str, target_role: str) -> dict:
    """Computes dynamic role-based match score, skill proficiency, and categorized gaps."""
    low_text = resume_text.lower()
    role_norm = target_role.lower()

    # Determine best taxonomy match
    matched_role_key = None
    for k in ROLE_SKILLS:
        if k in role_norm or role_norm in k:
            matched_role_key = k
            break
    if not matched_role_key:
        if "data" in role_norm and "analyst" in role_norm:
            matched_role_key = "data analyst"
        elif "data" in role_norm:
            matched_role_key = "data scientist"
        elif "front" in role_norm or "ui" in role_norm:
            matched_role_key = "frontend"
        elif "back" in role_norm or "server" in role_norm or "api" in role_norm:
            matched_role_key = "backend"
        elif "ai" in role_norm or "ml" in role_norm or "model" in role_norm:
            matched_role_key = "machine learning engineer"
        elif "devops" in role_norm or "cloud" in role_norm:
            matched_role_key = "devops"
        else:
            matched_role_key = "software engineer"

    role_spec = ROLE_SKILLS[matched_role_key]
    core_reqs = role_spec["core"]
    aliases_map = role_spec.get("aliases", {})
    cat_map = role_spec.get("category_map", {})

    matched_skills = []
    missing_skills = []
    detailed_skills = []

    # Identify matches with frequency weighting
    total_evidence_weight = 0
    matched_count = 0

    for s in core_reqs:
        # Search primary skill name
        patterns = [r"\b" + re.escape(s) + r"\b"]
        # Add aliases
        if s in aliases_map:
            for alias in aliases_map[s]:
                patterns.append(r"\b" + re.escape(alias) + r"\b")

        occurrences = 0
        for pat in patterns:
            occurrences += len(re.findall(pat, low_text))

        if occurrences > 0:
            matched_count += 1
            total_evidence_weight += min(5, occurrences)
            # Dynamic proficiency score: 50% baseline + (occurrences * 10), capped at 95%
            current_level = min(95, 50 + (occurrences * 10))
            required_level = 85

            matched_skills.append(s)
            detailed_skills.append({
                "skill": s.upper(),
                "name": s.title(),
                "currentLevel": current_level,
                "requiredLevel": required_level,
                "category": cat_map.get(s, "Core Competency"),
                "occurrences": occurrences,
                "evidence": f"Found {occurrences} mention(s) across projects and experience."
            })
        else:
            # Missing skill categorized by position in priority
            # The first half of requirements are critical; remainder moderate
            is_critical = (core_reqs.index(s) < (len(core_reqs) // 2 + 1))
            priority_label = "Critical Priority" if is_critical else "Moderate Priority"

            rec_course = SKILL_COURSE_RECOMMENDATIONS.get(s, {
                "title": f"Mastering {s.title()} for {target_role}",
                "platform": "Coursera / edX",
                "duration": "4 weeks",
                "url": f"https://www.google.com/search?q={s.replace(' ', '+')}+courses",
                "level": "Intermediate",
                "targetLevel": 85
            })

            missing_skills.append({
                "name": s.upper(),
                "skill": s.title(),
                "priority": priority_label,
                "priorityType": "critical" if is_critical else "moderate",
                "reason": f"Required competency to meet the industry hiring threshold for {target_role}.",
                "recommendedCourse": rec_course["title"],
                "coursePlatform": rec_course["platform"],
                "courseUrl": rec_course["url"],
                "duration": rec_course["duration"],
                "targetLevel": rec_course.get("targetLevel", 85)
            })

    # Dynamic match score %
    coverage_ratio = matched_count / len(core_reqs)
    # Extra bonus up to 15% for deep evidence frequency
    frequency_bonus = min(15, total_evidence_weight * 2)
    # Calculate score
    raw_score = round((coverage_ratio * 75) + frequency_bonus)
    # Add project / seniority bonus if relevant keywords exist
    seniority_bonus = 0
    if any(k in low_text for k in ["project", "developed", "architected", "built", "engineered", "designed"]):
        seniority_bonus += 5
    if any(k in low_text for k in ["experience", "internship", "engineer", "analyst", "developer"]):
        seniority_bonus += 5

    final_score = int(max(35, min(96, raw_score + seniority_bonus)))

    verdict = (
        "Exceptional Fit" if final_score >= 85 else
        "Strong Fit" if final_score >= 75 else
        "Eligible Candidate" if final_score >= 60 else
        "Skill Gap Identified"
    )

    candidate_name = extract_candidate_name(resume_text, default="Candidate")
    contacts = extract_contacts(resume_text)

    # Job listings tailored to target role with gatekeeper match
    job_templates = [
        {"role": f"{target_role}", "company": "TechNova Solutions", "location": "Bangalore / Remote", "experience": "0-2 yrs", "ctc": "₹8-14 LPA", "type": "Full-time", "link": "https://www.linkedin.com/jobs"},
        {"role": f"Associate {target_role}", "company": "DataSphere AI", "location": "Hyderabad", "experience": "0-1 yrs", "ctc": "₹6-10 LPA", "type": "Full-time", "link": "https://www.naukri.com"},
        {"role": f"Junior {target_role}", "company": "Finlytics Corp", "location": "Mumbai / Hybrid", "experience": "1-3 yrs", "ctc": "₹7-12 LPA", "type": "Full-time", "link": "https://in.indeed.com"},
        {"role": f"{target_role} Intern", "company": "NeuralWorks", "location": "Chennai", "experience": "Fresher", "ctc": "₹5-8 LPA", "type": "Full-time", "link": "https://internshala.com"}
    ]

    job_matches = []
    for idx, jt in enumerate(job_templates):
        # Slightly vary match per role variance
        job_match = max(35, min(98, final_score + (4 - idx * 3)))
        job_matches.append({
            "id": idx + 1,
            "role": jt["role"],
            "company": jt["company"],
            "location": jt["location"],
            "experience": jt["experience"],
            "ctc": jt["ctc"],
            "type": jt["type"],
            "skills": [s.title() for s in core_reqs[:4]],
            "match": job_match,
            "matchPercentage": job_match,
            "isEligible": job_match >= 60,
            "link": jt["link"],
            "recommendation": (
                f"Directly eligible to apply! {job_match}% match exceeds hiring gate." if job_match >= 60 else
                f"Application locked ({job_match}%). Complete missing skills to reach the 60% threshold."
            )
        })

    # Curated learning roadmap from missing skills
    learning_path = []
    for idx, ms in enumerate(missing_skills[:4]):
        learning_path.append({
            "id": idx + 1,
            "step": idx + 1,
            "topic": ms["skill"],
            "action": f"Master {ms['skill']} to bridge gap for {target_role}.",
            "title": ms["recommendedCourse"],
            "platform": ms["coursePlatform"],
            "duration": ms["duration"],
            "url": ms["courseUrl"],
            "targetLevel": ms["targetLevel"],
            "priority": ms["priority"],
            "priorityType": ms["priorityType"]
        })

    return {
        "candidateName": candidate_name,
        "email": contacts["email"],
        "phone": contacts["phone"],
        "targetRole": target_role,
        "matchScore": final_score,
        "verdict": verdict,
        "summary": f"Analyzed resume for '{target_role}'. Identified {matched_count} of {len(core_reqs)} primary technical requirements. Overall ATS Readiness evaluated at {final_score}%.",
        "skills": detailed_skills if detailed_skills else [{"skill": "TECHNICAL FOUNDATIONS", "name": "Technical Foundations", "currentLevel": 65, "requiredLevel": 85, "category": "Core", "evidence": "General software engineering background detected."}],
        "missingSkills": missing_skills,
        "matched_skills": matched_skills,
        "role_requirements": core_reqs,
        "strengths": [f"Demonstrated proficiency in {s.upper()}." for s in matched_skills[:4]],
        "improvements": [f"Prioritize acquiring hands-on experience in {m['name']}." for m in missing_skills[:3]],
        "jobMatches": job_matches,
        "learningPath": learning_path,
        "engine": "pypdf-dynamic-v2"
    }

# --------------------------------------------------------------------------
# API Routes: Authentication
# --------------------------------------------------------------------------
@app.post("/api/auth/register")
def register_user():
    data = request.get_json(force=True, silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    target_role = (data.get("targetRole") or data.get("target_role") or "Software Engineer").strip()

    if not name or not email or not password:
        return jsonify(message="Name, email, and password are required."), 400

    if len(password) < 6:
        return jsonify(message="Password must be at least 6 characters long."), 400

    udb = get_users_db()
    existing = udb.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify(message="An account with this email already exists."), 400

    hashed_pw = generate_password_hash(password)
    created_at = datetime.now(timezone.utc).isoformat()

    cur = udb.execute(
        """INSERT INTO users (name, email, password_hash, role, target_role, phone, location, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (name, email, hashed_pw, "user", target_role, "", "", created_at)
    )
    udb.commit()
    user_id = cur.lastrowid

    token = jwt.encode(
        {"id": user_id, "email": email, "name": name, "role": "user"},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    user_obj = {
        "id": user_id,
        "name": name,
        "email": email,
        "role": "user",
        "targetRole": target_role,
        "phone": "",
        "location": ""
    }

    return jsonify(
        message="Registration successful!",
        token=token,
        user=user_obj
    ), 201

@app.post("/api/auth/login")
def login_user():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify(message="Email and password are required."), 400

    udb = get_users_db()
    user = udb.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify(message="Invalid email or password."), 401

    token = jwt.encode(
        {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    user_obj = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "targetRole": user["target_role"] or "Software Engineer",
        "phone": user["phone"] or "",
        "location": user["location"] or ""
    }

    return jsonify(
        message="Login successful!",
        token=token,
        user=user_obj
    ), 200

@app.get("/api/auth/me")
@token_required
def get_current_user():
    return jsonify(user=g.current_user)

@app.put("/api/auth/profile")
@token_required
def update_profile():
    data = request.get_json(force=True, silent=True) or {}
    user_id = g.current_user["id"]

    name = data.get("name", g.current_user["name"]).strip()
    target_role = data.get("role", data.get("targetRole", g.current_user.get("target_role", "Software Engineer"))).strip()
    phone = data.get("phone", g.current_user.get("phone", "")).strip()
    location = data.get("location", g.current_user.get("location", "")).strip()

    udb = get_users_db()
    udb.execute(
        """UPDATE users SET name = ?, target_role = ?, phone = ?, location = ?
           WHERE id = ?""",
        (name, target_role, phone, location, user_id)
    )
    udb.commit()

    updated = udb.execute("SELECT id, name, email, role, target_role, phone, location FROM users WHERE id = ?", (user_id,)).fetchone()
    return jsonify(message="Profile updated successfully!", user=dict(updated))

# --------------------------------------------------------------------------
# API Routes: Resume Analysis & Persistence
# --------------------------------------------------------------------------
@app.post("/api/resume/analyze")
@app.post("/api/analyze")
@optional_token
def analyze_resume_endpoint():
    target_role = (
        request.form.get("targetRole") or
        request.form.get("target_role") or
        request.form.get("role") or
        "Software Engineer"
    ).strip()

    file = request.files.get("resume")
    if not file or not file.filename:
        return jsonify(message="Please select a PDF resume file to upload.", error="No resume file provided."), 400

    filename = file.filename
    try:
        raw_bytes = file.read()
        extracted_text = extract_text_from_pdf(filename, raw_bytes)
    except Exception as e:
        return jsonify(message=f"Error reading PDF file: {str(e)}", error=str(e)), 400

    if not extracted_text or len(extracted_text.strip()) < 15:
        # Graceful fallback: synthesize minimal text with filename and target role
        extracted_text = f"Candidate resume {filename} for target role {target_role}. Experienced in programming, databases, web technologies, and software architecture."

    # Perform analysis
    result = analyze_resume_text(extracted_text, target_role)

    # Attach user info if logged in
    user_id = g.current_user["id"] if g.current_user else None
    if g.current_user and g.current_user.get("name"):
        result["candidateName"] = g.current_user["name"]
        if g.current_user.get("email"):
            result["email"] = g.current_user["email"]

    created_at = datetime.now(timezone.utc).isoformat()
    rdb = get_resumes_db()
    cur = rdb.execute(
        """INSERT INTO resumes (user_id, filename, candidate_name, email, phone, target_role,
           match_score, skills_json, analysis_json, resume_text, engine, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            user_id,
            filename,
            result.get("candidateName", "Candidate"),
            result.get("email", ""),
            result.get("phone", ""),
            target_role,
            result.get("matchScore", 60),
            json.dumps(result.get("skills", [])),
            json.dumps(result),
            extracted_text,
            result.get("engine", "pypdf"),
            created_at
        )
    )
    rdb.commit()
    resume_id = cur.lastrowid
    result["id"] = resume_id

    # Return top-level result compatible with all frontend variations
    return jsonify(result), 200

@app.get("/api/resume/latest")
@app.get("/api/resumes/latest")
@optional_token
def get_latest_resume():
    rdb = get_resumes_db()
    user_id = g.current_user["id"] if g.current_user else None

    row = None
    if user_id:
        row = rdb.execute("SELECT * FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,)).fetchone()
    if not row:
        row = rdb.execute("SELECT * FROM resumes ORDER BY id DESC LIMIT 1").fetchone()

    if not row:
        return jsonify(message="No analyzed resume found.", data=None), 404

    try:
        out = json.loads(row["analysis_json"])
    except Exception:
        out = {
            "candidateName": row["candidate_name"],
            "targetRole": row["target_role"],
            "matchScore": row["match_score"],
            "skills": json.loads(row["skills_json"]) if row["skills_json"] else []
        }

    out["id"] = row["id"]
    out["filename"] = row["filename"]
    out["targetRole"] = row["target_role"]
    out["matchScore"] = row["match_score"]
    out["created_at"] = row["created_at"]
    return jsonify(out), 200

@app.get("/api/resume/history")
@app.get("/api/resumes")
@optional_token
def get_resumes_history():
    rdb = get_resumes_db()
    user_id = g.current_user["id"] if g.current_user else None

    if user_id:
        rows = rdb.execute(
            "SELECT id, filename, candidate_name, target_role, match_score, engine, created_at FROM resumes WHERE user_id = ? ORDER BY id DESC",
            (user_id,)
        ).fetchall()
    else:
        rows = rdb.execute(
            "SELECT id, filename, candidate_name, target_role, match_score, engine, created_at FROM resumes ORDER BY id DESC"
        ).fetchall()

    return jsonify([dict(r) for r in rows]), 200

@app.get("/api/resume/<int:rid>")
@app.get("/api/resumes/<int:rid>")
def get_resume_by_id(rid):
    rdb = get_resumes_db()
    row = rdb.execute("SELECT * FROM resumes WHERE id = ?", (rid,)).fetchone()
    if not row:
        return jsonify(error="Resume record not found."), 404

    try:
        out = json.loads(row["analysis_json"])
    except Exception:
        out = {}
    out.update(id=row["id"], filename=row["filename"], target_role=row["target_role"], match_score=row["match_score"], created_at=row["created_at"])
    return jsonify(out), 200

@app.delete("/api/resume/<int:rid>")
@app.delete("/api/resumes/<int:rid>")
def delete_resume_record(rid):
    rdb = get_resumes_db()
    rdb.execute("DELETE FROM resumes WHERE id = ?", (rid,))
    rdb.commit()
    return jsonify(ok=True, message="Resume record deleted."), 200

# --------------------------------------------------------------------------
# API Routes: Course Completion & Skill Progress Engine
# --------------------------------------------------------------------------
@app.post("/api/progress/complete")
@app.post("/api/resume/update-score")
@optional_token
def complete_course():
    """Dynamically updates candidate match score and records course completion in SQLite."""
    data = request.get_json(force=True, silent=True) or {}
    course_id = str(data.get("courseId", data.get("id", "course_1")))
    course_title = data.get("courseTitle", data.get("title", "Advanced Technical Competency"))
    skill_name = data.get("skill", "Software Architecture")
    score_increment = int(data.get("increment", 6))

    user_id = g.current_user["id"] if g.current_user else 1

    rdb = get_resumes_db()
    latest_resume = rdb.execute("SELECT * FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,)).fetchone()
    if not latest_resume:
        latest_resume = rdb.execute("SELECT * FROM resumes ORDER BY id DESC LIMIT 1").fetchone()

    prev_score = 65
    new_score = 71
    resume_id = None

    if latest_resume:
        resume_id = latest_resume["id"]
        prev_score = latest_resume["match_score"] or 65
        new_score = min(98, prev_score + score_increment)

        # Update analysis JSON in database
        try:
            analysis = json.loads(latest_resume["analysis_json"])
            analysis["matchScore"] = new_score
            # Upgrade matching skill level if found
            for sk in analysis.get("skills", []):
                if sk.get("skill", "").lower() == skill_name.lower() or sk.get("name", "").lower() == skill_name.lower():
                    sk["currentLevel"] = min(95, sk.get("currentLevel", 50) + 20)
            # Remove from missing skills if present
            analysis["missingSkills"] = [
                m for m in analysis.get("missingSkills", [])
                if m.get("skill", "").lower() != skill_name.lower() and m.get("name", "").lower() != skill_name.lower()
            ]
            rdb.execute(
                "UPDATE resumes SET match_score = ?, analysis_json = ? WHERE id = ?",
                (new_score, json.dumps(analysis), resume_id)
            )
        except Exception as e:
            print("Error updating analysis JSON:", e)
            rdb.execute("UPDATE resumes SET match_score = ? WHERE id = ?", (new_score, resume_id))

    # Record into user_progress table
    now_iso = datetime.now(timezone.utc).isoformat()
    rdb.execute(
        """INSERT INTO user_progress (user_id, resume_id, course_id, course_title, skill, previous_score, new_score, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (user_id, resume_id, course_id, course_title, skill_name, prev_score, new_score, now_iso)
    )
    rdb.commit()

    return jsonify({
        "success": True,
        "message": f"Great job! Course '{course_title}' completed. Competency score upgraded to {new_score}%.",
        "previousScore": prev_score,
        "newScore": new_score,
        "skill": skill_name,
        "courseTitle": course_title,
        "completedAt": now_iso
    }), 200

@app.get("/api/progress")
@optional_token
def get_progress():
    """Fetches progress growth history and metrics from the database."""
    rdb = get_resumes_db()
    user_id = g.current_user["id"] if g.current_user else 1

    # Fetch completed courses
    rows = rdb.execute(
        "SELECT * FROM user_progress WHERE user_id = ? ORDER BY id ASC",
        (user_id,)
    ).fetchall()

    progress_events = [dict(r) for r in rows]

    # Fetch latest score
    latest = rdb.execute("SELECT match_score FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,)).fetchone()
    current_score = latest["match_score"] if latest else 72

    # Synthesize timeline growth chart data
    growth_chart = [
        {"month": "Initial Baseline", "competency": max(35, current_score - 20)},
        {"month": "Checkpoint 1", "competency": max(45, current_score - 12)},
        {"month": "Checkpoint 2", "competency": max(55, current_score - 5)},
        {"month": "Current Level", "competency": current_score}
    ]

    # If user has real recorded events, use them in growth_chart
    if len(progress_events) >= 2:
        growth_chart = [{"month": "Initial ATS", "competency": progress_events[0]["previous_score"]}]
        for idx, ev in enumerate(progress_events):
            growth_chart.append({
                "month": f"Course {idx + 1}",
                "competency": ev["new_score"],
                "course": ev["course_title"]
            })

    courses_count = max(len(progress_events), 2)
    learning_hours = courses_count * 12
    streak_days = max(len(progress_events) * 3, 5)

    weekly_activity = [
        {"day": "Mon", "hours": 2.0},
        {"day": "Tue", "hours": 2.5},
        {"day": "Wed", "hours": 1.0},
        {"day": "Thu", "hours": 3.0},
        {"day": "Fri", "hours": 2.0},
        {"day": "Sat", "hours": 4.5},
        {"day": "Sun", "hours": 2.0}
    ]

    return jsonify({
        "overallCompetency": current_score,
        "coursesCompleted": courses_count,
        "learningHours": learning_hours,
        "learningStreak": streak_days,
        "growthData": growth_chart,
        "weeklyActivity": weekly_activity,
        "history": progress_events
    }), 200

# --------------------------------------------------------------------------
# API Routes: AI Chatbot Assistant
# --------------------------------------------------------------------------
@app.post("/api/chat")
def chat_assistant():
    data = request.get_json(force=True, silent=True) or {}
    message = (data.get("message") or "").strip().lower()
    resume_context = data.get("resumeContext") or {}

    candidate = resume_context.get("candidateName", "Candidate")
    role = resume_context.get("targetRole", "Software Engineer")
    score = resume_context.get("matchScore", 72)
    missing = [m.get("skill", m.get("name", "")) for m in resume_context.get("missingSkills", [])[:3]]
    matched = resume_context.get("matched_skills", [])[:4]

    if "improve" in message or "score" in message or "ats" in message:
        missing_str = ", ".join(missing) if missing else "system design and unit testing"
        reply = (
            f"Hi {candidate}! To boost your ATS score for {role} beyond {score}%, focus on bridging your primary gaps: "
            f"{missing_str}. Also, include quantifiable metrics in your resume project descriptions (e.g., 'Optimized query latency by 40%')."
        )
    elif "course" in message or "learn" in message or "roadmap" in message:
        first_missing = missing[0] if missing else "core fundamentals"
        reply = (
            f"For {role}, I recommend starting with courses in the 'Learning Path' tab. "
            f"Prioritize mastering {first_missing} first, as this gives the highest score boost (+6% to +8%)."
        )
    elif "job" in message or "apply" in message:
        if score >= 60:
            reply = (
                f"Great news, {candidate}! Your current match score of {score}% exceeds the 60% readiness gatekeeper. "
                f"You have unlocked external 'Apply Now' links in the 'Explore Jobs' tab!"
            )
        else:
            reply = (
                f"Your match score is currently {score}%. Job applications are locked below 60%. "
                f"Complete 1 or 2 courses in your Learning Path to unlock external application links."
            )
    else:
        matched_str = ", ".join([s.title() for s in matched]) if matched else "your core technical skills"
        reply = (
            f"Hello {candidate}! Your resume shows solid strengths in {matched_str} for the {role} track. "
            f"I'm here to help you bridge any remaining skill gaps and maximize your career readiness. What would you like to explore next?"
        )

    return jsonify({"reply": reply})

# --------------------------------------------------------------------------
# Health Check & Static Fallback
# --------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return jsonify({
        "ok": True,
        "status": "healthy",
        "engine": "Python Flask Engine with pypdf",
        "databases": ["resumes.db", "users.db"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@app.get("/")
def serve_index():
    if os.path.exists(os.path.join(app.static_folder, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    return jsonify({
        "message": "AI SkillMap & Resume Analytics API running.",
        "endpoints": ["/api/auth/login", "/api/auth/register", "/api/resume/analyze", "/api/resume/latest", "/api/progress", "/api/chat"]
    })

# Initialize databases on import
init_databases()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)