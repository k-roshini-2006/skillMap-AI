# 🚀 SkillMap AI - Dynamic Resume Analytics & Career Acceleration Platform

SkillMap AI is an end-to-end resume analyzer, competency mapping, and career acceleration platform powered by a Python Flask engine, SQLite persistence, and an interactive React dashboard.

---

## 🔗 Project Links

- **GitHub Repository:** [https://github.com/k-roshini-2006/skillMap-AI](https://github.com/k-roshini-2006/skillMap-AI)
- **Live Deployed Application:**https://skillmap-frontend-wf5r.onrender.com

---

## 🏗️ System Architecture & Data Flow

```text
                +----------------------------------+
                |     React Frontend (Vite UI)     |
                +----------------------------------+
                                 |
                                 | (Upload PDF Resume / Auth API)
                                 v
                +----------------------------------+
                |    Python Flask Engine (app.py)  |
                +----------------------------------+
                                 |
                  +--------------+--------------+
                  |                             |
                  v                             v
        +-------------------+         +--------------------+
        |   pypdf Parsing   |         |   SQLite Database  |
        | (Text Extraction) |         |    (resumes.db)    |
        +-------------------+         +--------------------+
                  |                             |
                  +--------------+--------------+
                                 |
                                 v
          +----------------------------------------------+
          | Dynamic ATS Scoring & Competency Mapping     |
          +----------------------------------------------+
                                 |
        +------------------------+------------------------+
        |                                                 |
        v                                                 v
+-------------------------------+             +--------------------+
| Skill Gap Analysis & Direct   |             | Smart Job          |
| Platform Learning Paths       |             | Gatekeeper         |
| (GFG, Coursera, Udemy, edX)   |             | (Unlocked >= 60%)  |
+-------------------------------+             +--------------------+
```

---

## 💻 Tech Stack

- **Backend Engine:** Python 3.x, Flask, SQLite3, `pypdf`, `gunicorn`, `flask-cors`
- **Frontend UI:** React.js, Vite, Tailwind CSS, Lucide Icons, Axios
- **State & Persistence:** LocalStorage, SQLite database session handling
- **Routing & Direct Links:** Dynamic course mapping to GeeksforGeeks, Coursera, Udemy, edX, and LinkedIn Jobs API

---

## ⚡ Execution Commands & Setup Guide

### 1. Repository Clone
```bash
git clone https://github.com/k-roshini-2006/skillMap-AI.git
cd skillMap-AI
```

### 2. Backend Setup (Python Flask)
```bash
# Navigate to project root / server folder
pip install flask pypdf python-dotenv flask-cors gunicorn

# Run Backend API Server
python app.py
```
*Backend runs locally at: `http://127.0.0.1:5000`*

### 3. Frontend Setup (React Client)
```bash
# Open terminal and enter client directory
cd client

# Install NPM dependencies
npm install

# Start Vite Development Server
npm run dev
```
*Frontend runs locally at: `http://localhost:5173`*

---

## 👥 Team Contributions

* **ROSHINI K** (Team Lead & Lead System Architect)
  * **Project Leadership & Core Backend:** Led project direction, built the Python Flask backend (`app.py`), engineered `pypdf` resume parsing algorithms, and designed the SQLite database schema (`resumes.db`).
  * **Algorithm & Gatekeeper Logic:** Authored the direct course platform routing (`getDirectCourseUrl`), implemented the 60% ATS match threshold job gatekeeper, and directed Git version control & deployment workflows.

* **PREETHI P** (Frontend Architect & UI/UX Specialist)
  * **Core UI Architecture:** Designed, engineered, and structured the React frontend platform, creating key user-facing modules including `LearningPathPage`, `Dashboard`, `CompetencyMapping`, and `SkillGapAnalysis`.
  * **State Synchronization & Testing:** Implemented dynamic state workflows between client components and backend APIs, optimized UI responsiveness, and led full end-to-end integration testing.

---

## 📜 License
This project is open-source under the MIT License.
