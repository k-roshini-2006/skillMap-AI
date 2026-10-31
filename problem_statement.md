# Problem Statement: AI-Powered SkillMap & Resume Analytics Platform

## 1. Background
In the modern hiring ecosystem, job seekers—especially fresh graduates and early-career professionals—face severe opacity when applying for technical roles. Traditional Applicant Tracking Systems (ATS) reject resumes using rigid or poorly configured keyword matching algorithms, leaving candidates without constructive feedback or a clear understanding of why they were rejected.

---

## 2. Visual Overview of Industry Pain Points

![SkillMap AI Problem Visual Blueprint](./assets/problem_statement_visual.png)

---

## 3. Core Challenges & Industry Pain Points

* **Static & Inaccurate ATS Parsing:** Existing resume screeners often rely on outdated text extractors or hardcoded thresholds, resulting in stagnant match scores (e.g., rigid 35% fallbacks) that fail to accurately capture actual candidate qualifications from complex PDF formats.
* **Lack of Actionable Skill Gap Insights:** Standard job portals inform candidates if they lack skills, but fail to map those missing competencies against industry-specific role requirements.
* **Disjointed Upskilling & Job Application Pipelines:** Learning platforms and job search engines operate in silos. Candidates must manually identify missing skills, search for relevant courses across multiple platforms (GeeksforGeeks, Coursera, Udemy), and track their learning progress independently.
* **Gated Career Opportunities:** Job seekers frequently waste time applying for high-leverage roles without verifying whether their current skill set meets the minimum benchmark for candidate selection.

---

## 4. Objective & Proposed Solution
The objective of **SkillMap AI** is to build a unified, privacy-focused, offline-first resume analytics and career acceleration platform powered by Python (`app.py`), `pypdf`, and SQLite (`resumes.db`). 

The platform accurately parses candidate resumes, computes dynamic percentage-based ATS match scores, generates tailored skill gap analysis, dynamically boosts scores upon course completion, and gates job applications behind a verified **60% ATS match score threshold**.