# SmartPrep

AI-powered mock interview app for technical job seekers. Mobile-first (Expo / React Native) plus a React web client, with an Express backend (MERN) and a Python FastAPI AI service that wraps OpenAI Chat + Whisper + Vision.

```
smartprep/
├── backend/        Node + Express + MongoDB (REST API, auth, sessions)
├── ai-service/     Python FastAPI (OpenAI + Whisper + Vision)
├── web-frontend/   React + Vite web client
└── mobile/         Expo React Native app (Android target)
```

> **Looking to deploy?** This README covers **local development**. For putting SmartPrep on the public internet (web + mobile APK) using only free cloud platforms, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## 1. Prerequisites

Install once on your machine:

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.10+ | https://www.python.org |
| MongoDB | local install **or** MongoDB Atlas free tier | https://www.mongodb.com/try/download/community |
| Android Studio | latest | for the Android emulator |
| Expo Go app | from Play Store | install on a real Android device for fastest testing |
| OpenAI API key | https://platform.openai.com | put a few dollars on it; `gpt-4o-mini` is cheap |

Verify in PowerShell:

```powershell
node --version
python --version
mongod --version    # only if running Mongo locally
```

---

## 2. One-time setup

Open **three** PowerShell terminals, one per service. Run these commands inside `c:\Users\ZAli2\Desktop\FYP Implementation\smartprep`.

### 2a. Backend

```powershell
cd backend
npm install
copy .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET (any long random string)
```

### 2b. AI Service

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# edit .env: paste your OPENAI_API_KEY
```

### 2c. Mobile

```powershell
cd mobile
npm install
```

> **API base URL** — `mobile/app.json` ships with `apiBaseUrl: "http://10.0.2.2:4000"`, which is the Android emulator's loopback to the host machine. If you test on a real Android device over Wi-Fi, replace it with your PC's LAN IP, e.g. `http://192.168.1.50:4000`. Find it via `ipconfig`.

Asset placeholders: drop any 1024×1024 PNG into `mobile/assets/` named `icon.png`, `splash.png`, `adaptive-icon.png` — Expo will complain otherwise. (You can generate them with any image tool.)

---

## 3. Daily workflow — running the project

You need **all three** services running simultaneously.

### Terminal 1 — MongoDB
If using a local install:
```powershell
mongod --dbpath C:\data\db
```
If using Atlas: skip this, just set `MONGO_URI` in `backend/.env` to your Atlas connection string.

### Terminal 2 — AI service (Python FastAPI on port 5000)
```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 5000
```
Health check: open `http://localhost:5000/health` → `{"ok": true, ...}`.

### Terminal 3 — Backend (Express on port 4000)
```powershell
cd backend
npm run dev
```
Health check: `http://localhost:4000/health`.

### Terminal 4 — Mobile (Expo)
```powershell
cd mobile
npm start
```
- Press `a` to launch on Android emulator, **or**
- Scan the QR code with Expo Go on your Android phone (phone must be on same Wi-Fi as PC, and `apiBaseUrl` must be your LAN IP).

---

## 4. End-to-end smoke test (5 minutes)

1. App opens → tap **Create account** → name, email, password (≥6 chars) → you land on Home.
2. Home → **Start Interview** → Software Dev / Medium / 5 questions → **Start interview**.
3. Question appears. Tap **Start Recording**, speak for ~15 seconds, tap **Stop & Submit**. Wait for "Analyzing…".
4. Next question appears. Repeat 5×.
5. After the last submit, the **Feedback** screen opens with three score bars, a summary, and 3 tips.
6. Back to Home → the session is in History; tap to reopen the report.
7. Try **Practice** for a single Q&A drill, and **AI Challenge** for an MCQ.

Expect each turn to take ~5–10 s end-to-end (Whisper + GPT calls).

---

## 5. Common issues

| Symptom | Fix |
|---|---|
| App can't reach backend | Check `mobile/app.json` `apiBaseUrl`. Emulator → `10.0.2.2`. Real device → your PC LAN IP. Both backend and AI service must be running. |
| `OPENAI_API_KEY not set` | Edit `ai-service/.env`, restart `uvicorn`. |
| `MongoNetworkError` | Mongo not running, or `MONGO_URI` wrong in `backend/.env`. |
| Recording fails on Android | First-run permission prompt — accept the mic permission, then retry. |
| 429 "Daily session limit reached" | Configurable: `DAILY_SESSION_LIMIT` in `backend/.env`. |
| Slow / costs ramping | Switch `OPENAI_MODEL` and `OPENAI_EVAL_MODEL` to `gpt-4o-mini` (already default). |

---

## 6. Project management tips

- **Branching:** `main` for stable, `dev` for integration; feature branches like `feat/interview-flow`.
- **Split work:** Dev A on `mobile/`, Dev B on `backend/` + `ai-service/`. The HTTP contract (this README + Postman collection) is the integration point.
- **Track tasks** weekly per the plan in `C:\Users\ZAli2\.claude\plans\hi-in-which-golden-volcano.md`.
- **Cost control:** OpenAI usage dashboard daily; the backend already enforces a per-user `DAILY_SESSION_LIMIT`.
- **Demo prep:** record a 3-min screencast of the smoke test in §4. Prepare slides covering: problem, template-hybrid AI approach, architecture diagram (matches the SDS), live demo, future work (web app, video analysis, more domains).

---

## 7. API quick reference

```
POST  /auth/signup        { name, email, password }
POST  /auth/login         { email, password }
GET   /auth/me            → current user
GET   /profile            → user profile
PATCH /profile            { name?, domainPreference? }

POST  /sessions           { domain, difficulty, targetQuestions } → { sessionId, question, index, total }
POST  /sessions/:id/answer (multipart: audio) → next question OR { done: true }
POST  /sessions/:id/abandon
GET   /sessions           → recent history
GET   /sessions/:id       → full transcript + scores

GET   /practice/question?domain&difficulty
POST  /practice/evaluate   (multipart: audio + question)

GET   /challenge?domain    → MCQ
```

AI service (internal — only the backend calls these):
```
POST /generate-question
POST /transcribe       (multipart audio)
POST /evaluate-answer
POST /generate-feedback
POST /generate-challenge
```

---

## 8. Roadmap (post-MVP)

- React web client reusing the same backend.
- MediaPipe face-mesh for eye-contact during interviews.
- More domains (cybersecurity, system design deep-dives).
- Admin dashboard for question-bank curation.
- On-device sentiment fallback for offline practice.
