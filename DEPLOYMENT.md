# SmartPrep — Deployment Guide

This guide walks you through deploying every piece of SmartPrep to **free** cloud platforms. The local dev workflow is in [README.md](README.md); this document is purely for putting the app online so anyone with the URL (or the APK) can use it.

---

## 1. Architecture recap

```
                ┌─────────────────┐
                │  Mobile (APK)   │  Expo build
                └────────┬────────┘
                         │ HTTPS
                         ▼
┌──────────────┐   ┌─────────────────┐   ┌────────────────┐
│ Web (Vercel) │──▶│ Backend (Render)│──▶│ AI service     │
│ React + Vite │   │ Node + Express  │   │ FastAPI + GPT  │
└──────────────┘   └────────┬────────┘   └────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ MongoDB Atlas    │
                   │ (free M0 cluster)│
                   └──────────────────┘
```

You will end up with **four** running cloud resources plus an Android APK:

| # | Component | Where it lives | Free? |
|---|---|---|---|
| 1 | MongoDB database | MongoDB Atlas (M0 cluster) | yes |
| 2 | AI service (Python FastAPI) | Render.com (or Hugging Face Spaces) | yes |
| 3 | Backend (Node Express) | Render.com | yes |
| 4 | Web frontend | Vercel | yes |
| 5 | Mobile APK | Expo EAS Build → direct download | yes |

The **only** thing that costs money is the OpenAI API itself (pay-as-you-go, typically a few cents per interview with `gpt-4o-mini`). Everything below assumes you already have an OpenAI API key with billing enabled.

---

## 2. Free platforms — what we chose and why

There are many free options; here is why these specific ones were picked.

| Platform | Used for | Free-tier limit | Trade-off |
|---|---|---|---|
| **MongoDB Atlas** (M0) | Database | 512 MB storage, shared CPU | More than enough for a thousand interviews |
| **Render.com** (Web Service) | Backend + AI service Docker images | 750 hrs/month free; spins down after **15 min idle** (cold-start ~50 s) | Free containers sleep — first request after idle is slow. Fine for a demo / FYP |
| **Vercel** (Static) | Web frontend | 100 GB bandwidth, unlimited builds | Best DX for Vite/React SPAs |
| **Expo EAS Build** | Mobile APK | 30 builds / month on free plan | Generates a signed APK in the cloud — no Android Studio required |
| **Cloudinary** *(optional)* | Persistent audio/video uploads | 25 GB storage + 25 GB bandwidth | Only needed if you want recordings to survive container restarts |

### Other free platforms you could swap in

- **Fly.io** — Free 3 shared VMs, no sleep. Slightly more setup; good if Render's cold start bothers you.
- **Railway** — $5 free trial credit. Fast, no sleep, very nice DX, but the free credit doesn't reset.
- **Hugging Face Spaces** — Best free home for the AI service. Public Docker spaces never sleep; great if you want the Python service to be snappy.
- **Netlify** / **Cloudflare Pages** — Drop-in replacements for Vercel.

---

## 3. Pre-deployment checklist

Before touching any cloud, gather:

- [ ] A GitHub account, with this repo pushed to a GitHub repository
- [ ] An OpenAI API key with billing enabled (`sk-...`)
- [ ] A long random string for `JWT_SECRET` (run `openssl rand -hex 32` or use any password manager)
- [ ] An email account you'll use to sign up for Atlas / Render / Vercel / Expo

> **Push to GitHub first.** Render and Vercel both deploy by watching a GitHub branch. From `c:\Users\ZAli2\Desktop\FYP Implementation\smartprep`:
> ```powershell
> git init
> git add .
> git commit -m "Initial deploy-ready snapshot"
> git branch -M main
> git remote add origin https://github.com/<you>/smartprep.git
> git push -u origin main
> ```

---

## 4. Step 1 — MongoDB Atlas (database)

1. Sign up at **https://www.mongodb.com/cloud/atlas/register**.
2. Click **Build a Database** → choose **M0 FREE** → AWS / nearest region → **Create**.
3. Under **Database Access** → **Add New Database User**
   - username: `smartprep`
   - password: generate a strong one and save it
   - role: **Atlas admin** (easiest for demos)
4. Under **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
   *Not ideal for production, but required because Render's IPs are dynamic. The database password is your real protection.*
5. Back on **Database** → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://smartprep:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password from step 3 and append the database name, e.g.:
   ```
   mongodb+srv://smartprep:YOURPASS@cluster0.xxxxx.mongodb.net/smartprep?retryWrites=true&w=majority
   ```
7. Save this string — you'll paste it into Render in Step 3.

---

## 5. Step 2 — Deploy the AI service (Render)

1. Sign up at **https://render.com** with your GitHub account.
2. Click **New** → **Web Service** → **Build and deploy from a Git repository** → pick your `smartprep` repo.
3. Fill in:
   - **Name:** `smartprep-ai`
   - **Region:** the closest one
   - **Branch:** `main`
   - **Root Directory:** `ai-service`
   - **Runtime:** **Docker** (Render auto-detects `Dockerfile`)
   - **Instance Type:** **Free**
4. Scroll to **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `OPENAI_API_KEY` | `sk-...` (your real key) |
   | `OPENAI_MODEL` | `gpt-4o-mini` |
   | `OPENAI_EVAL_MODEL` | `gpt-4o-mini` |
   | `WHISPER_MODEL` | `whisper-1` |
   | `PORT` | `5000` |
5. Click **Create Web Service**. The first build takes ~5 minutes.
6. When the badge turns green, copy the public URL — it will be `https://smartprep-ai.onrender.com` or similar.
7. Verify: open `https://smartprep-ai.onrender.com/health` in a browser → you should see `{"ok": true, ...}`. (First hit may take ~50 s if the container went to sleep.)

> **Alternative: Hugging Face Spaces** — If you want the AI service to never sleep, create a **Docker** space at https://huggingface.co/new-space and point it at the `ai-service` folder. Add `OPENAI_API_KEY` as a *secret* in the Space settings. The URL will be `https://<user>-<space>.hf.space`.

---

## 6. Step 3 — Deploy the backend (Render)

1. Render dashboard → **New** → **Web Service** → same repo.
2. Fill in:
   - **Name:** `smartprep-backend`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** **Docker**
   - **Instance Type:** **Free**
3. Environment variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `MONGO_URI` | the connection string from Step 1 |
   | `JWT_SECRET` | your random hex string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `AI_SERVICE_URL` | `https://smartprep-ai.onrender.com` (from Step 2) |
   | `DAILY_SESSION_LIMIT` | `10` (or whatever you want) |
4. Click **Create Web Service**.
5. Once green, copy the URL — e.g. `https://smartprep-backend.onrender.com`.
6. Verify: `https://smartprep-backend.onrender.com/health` → `{"ok": true}`.

> **Uploads warning** — Render's free filesystem is **ephemeral**. The audio/video the user uploads will work for the immediate AI call but will be wiped on restart. For an FYP demo this is fine because the transcript and scores are saved to MongoDB. If you want to keep the actual recordings, see Section 11 (Cloudinary).

---

## 7. Step 4 — Deploy the web frontend (Vercel)

1. Sign up at **https://vercel.com** with your GitHub account.
2. **Add New… → Project** → import your `smartprep` repo.
3. Configure:
   - **Root Directory:** `web-frontend`
   - **Framework Preset:** **Vite** (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://smartprep-backend.onrender.com` (from Step 3) |
5. Click **Deploy**. First build takes ~1 min.
6. You'll get a URL like `https://smartprep-xxx.vercel.app`. Open it — you should see the splash screen.
7. **Important:** if you ever change `VITE_API_BASE_URL`, you must **redeploy** (Vercel → Deployments → ⋯ → Redeploy). Vite bakes env vars into the bundle at build time.

### Allow the Vercel domain in your backend CORS

Open `backend/src/server.js` (or wherever CORS is configured) and ensure the Vercel domain is in the allow-list. Easiest production-safe config:

```js
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
  credentials: true
}));
```

Then add a `CORS_ORIGIN` env var to Render with value:
```
https://smartprep-xxx.vercel.app
```
(or `*` for an open API during testing). Restart the Render service.

---

## 8. Step 5 — Build & distribute the mobile APK (Expo EAS)

The mobile app needs to point at the **production** backend, then be compiled into an installable `.apk`.

### 8a. Point the mobile app at your production backend

Edit `mobile/app.json` and change `extra.apiBaseUrl` from your LAN IP to the public backend:

```json
"extra": {
  "apiBaseUrl": "https://smartprep-backend.onrender.com"
}
```

Commit and push.

### 8b. Install EAS CLI and log in

```powershell
npm install -g eas-cli
cd mobile
npx eas login            # sign up at https://expo.dev if you haven't
npx eas init             # links this project to your Expo account
```

### 8c. Configure the build profile

Create `mobile/eas.json`:

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 8d. Build the APK

```powershell
npx eas build --platform android --profile preview
```

- The build runs in the Expo cloud (free tier: ~30 builds/month).
- Takes ~10–15 minutes.
- When done, you'll get a download URL. Open it on any Android phone to install (you may need to enable **Install from unknown sources**).

### 8e. Distribute

For a demo, just share the APK download link. For real distribution:
- **Google Play Internal Testing** — free, requires a one-time $25 developer account
- **Direct download** — host the APK anywhere (GitHub Releases works)

### 8f. (Optional) Run the mobile app on iOS

iOS builds require an **Apple Developer Program** membership ($99/year) — there is no truly free iOS distribution path. For a free demo, use **Expo Go** on an iPhone: change `app.json` `apiBaseUrl` to your public backend and run `npx expo start` — the QR code installs into Expo Go and works without an Apple account.

---

## 9. Post-deployment smoke test

1. Open the Vercel URL → **Create account** → register a user. (Render backend will cold-start on the first request; allow ~50 s.)
2. Land on Home → **Start Interview** → pick a domain → setup screen.
3. Begin interview → allow mic/cam permissions → record a 15-second answer → **Submit & Next**.
4. Finish all questions → verify the Feedback screen shows scores + tips.
5. Check **History** — the session should appear.
6. Install the APK on your phone → repeat the flow → verify it talks to the same backend (the new session will show up in History on the web too).

If anything breaks, check **Render → Logs** for the backend and AI service, and **Vercel → Deployments → View Logs** for the web build.

---

## 10. Environment variables — full reference

### Backend (`smartprep-backend` on Render)

| Variable | Required | Example |
|---|---|---|
| `MONGO_URI` | ✅ | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ | long hex string |
| `JWT_EXPIRES_IN` | | `7d` |
| `AI_SERVICE_URL` | ✅ | `https://smartprep-ai.onrender.com` |
| `PORT` | | `4000` (Render injects this) |
| `DAILY_SESSION_LIMIT` | | `10` |
| `CORS_ORIGIN` | | `https://smartprep-xxx.vercel.app` |
| `NODE_ENV` | | `production` |

### AI service (`smartprep-ai` on Render)

| Variable | Required | Example |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | `sk-...` |
| `OPENAI_MODEL` | | `gpt-4o-mini` |
| `OPENAI_EVAL_MODEL` | | `gpt-4o-mini` |
| `WHISPER_MODEL` | | `whisper-1` |
| `PORT` | | `5000` |

### Web frontend (Vercel)

| Variable | Required | Example |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | `https://smartprep-backend.onrender.com` |

### Mobile (`mobile/app.json`)

`extra.apiBaseUrl` must point to the public backend URL **before** running `eas build`.

---

## 11. Optional: persistent uploads with Cloudinary

If you want user audio/video to persist across container restarts, swap multer's disk storage for Cloudinary.

1. Sign up at **https://cloudinary.com** (free 25 GB).
2. Grab the **Cloud name**, **API Key**, and **API Secret** from the dashboard.
3. Add to Render env vars on the backend:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
4. Install in `backend`:
   ```powershell
   cd backend
   npm install cloudinary multer-storage-cloudinary
   ```
5. Replace the multer disk storage in `src/routes/sessions.js` with a Cloudinary storage adapter. (Ask if you want the diff for this.)

---

## 12. Cost expectations

| Item | Cost |
|---|---|
| MongoDB Atlas M0 | $0 |
| Render free web services × 2 | $0 |
| Vercel hobby | $0 |
| Expo EAS free tier | $0 |
| **OpenAI API** (real cost) | ~$0.01 per interview turn with `gpt-4o-mini` + Whisper. A full 5-question interview runs around **$0.05–$0.10**. |

For a final-year project demo with ~50 interviews, expect to spend **under $5** on OpenAI total.

---

## 13. Common deployment issues

| Symptom | Cause | Fix |
|---|---|---|
| Web app shows "Network Error" on first load | Render backend is cold-starting | Wait ~50 s, retry. To eliminate, upgrade to a paid Render plan or move backend to Fly.io / HF Spaces. |
| `CORS error` in browser console | Backend `CORS_ORIGIN` doesn't include the Vercel domain | Update `CORS_ORIGIN` on Render, restart. |
| `MongoNetworkError` in Render logs | Atlas IP allow-list missing | Make sure Atlas **Network Access** has `0.0.0.0/0`. |
| OpenAI calls fail with 401 | Wrong / missing `OPENAI_API_KEY` | Re-paste the key in Render's AI service env, redeploy. |
| Mobile app can't reach backend | `apiBaseUrl` still points at localhost | Edit `mobile/app.json`, rebuild with `eas build`. |
| Vercel build fails on env var | Forgot `VITE_API_BASE_URL` | Add it, redeploy from Deployments tab. |
| User uploads disappear after a while | Render free filesystem is ephemeral | Acceptable for demo. For persistence, follow Section 11 (Cloudinary). |

---

## 14. After deploying — share the demo

You now have:

- **Web:** `https://smartprep-xxx.vercel.app`
- **API:** `https://smartprep-backend.onrender.com`
- **APK:** the EAS download link

For an FYP submission, include all three in your report along with one demo account (email + password) so evaluators can log in instantly.
