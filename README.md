# Recruva - Next-Gen Recruitment Made Simple

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/460b438afced48bebd23a85389935f30)](https://app.codacy.com/gh/AreebaTanveer19/Recruva?utm_source=github.com&utm_medium=referral&utm_content=AreebaTanveer19/Recruva&utm_campaign=Badge_Grade)

## Project Overview
Recruva is a modern Applicant Tracking System (ATS) designed to streamline the recruitment process for organizations. It helps hiring managers post jobs, track applicants, schedule interviews, and manage the hiring workflow efficiently. The system leverages AI-driven insights to match candidates with job requirements, reducing hiring delays and improving quality.

---

## Problem Statement
Traditional recruitment processes are often slow, inefficient, and prone to bias. Companies struggle to:
- Track multiple applicants across different job openings.
- Evaluate candidates effectively based on skills and experience.
- Manage scheduling and communication during recruitment.

**Recruva** addresses these issues by automating applicant tracking, improving candidate evaluation, and providing a smooth recruitment workflow.

---

## Key Features
- **Job Creation & Approval:** Hiring managers can create job requests with required skills, experience, and salary.
- **Job Posting:** Post jobs on multiple platforms and track applicant submissions.
- **Candidate Management:** View, evaluate, and filter candidates with AI-driven skill matching.
- **Interview Scheduling:** Schedule interviews and share meeting links.
- **Scalable Architecture:** Modular and easy to maintain for future expansion.

---

## Technologies Used
- **Frontend:** React.js, Tailwind CSS, MaterialUI
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL (via Prisma ORM)  
- **AI & Automation:** Semantic skill analysis, candidate-job matching algorithms  
- **Other Tools:** GitHub for version control

---

## Installation Steps
1. **Clone the repository**
```bash
git clone https://github.com/yourusername/recruva.git
cd recruva
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
Create a .env file in the root directory and add your configuration:
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173

DATABASE_URL=
DIRECT_URL = 

JWT_SECRET = 
ENCRYPTION_KEY=

LINKEDIN_CLIENT_ID =
LINKEDIN_CLIENT_SECRET=
REDIRECT_URI=
FRONTEND_URL=

CLIENT_ID = 
CLIENT_SECRET = 
REDIRECT_URL = 
API_KEY=
```
## How to run the project
1. **Start the backend**
```bash
npm run dev
```
2. **Start the frontend**
```bash
npm run dev
```
3. **Access the application**
```bash
Open your browser and go to:
http://localhost:5173
```

---
## License
This project is licensed under the MIT License.
