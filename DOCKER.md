# SmartPrep — Docker

Three Dockerized services orchestrated by `docker-compose.yml`:

| Service       | Image base       | Port (host) | Path           |
| ------------- | ---------------- | ----------- | -------------- |
| `mongo`       | `mongo:7`        | 27017       | (managed)      |
| `ai-service`  | `python:3.11`    | 5000        | `./ai-service` |
| `backend`     | `node:20-alpine` | 4000        | `./backend`    |
| `web`         | `nginx:alpine`   | 8080 → 80   | `./web-frontend` |

The mobile app is **not** Dockerized — it ships as APK/IPA via Expo.

## First-time setup

1. Install Docker Desktop (Windows/Mac) or Docker Engine + Compose plugin (Linux).
2. From the repo root, copy env templates:
   ```bash
   cp .env.example .env
   cp ai-service/.env.example ai-service/.env   # if you have one
   ```
3. Put your real `OPENAI_API_KEY` in `ai-service/.env`.
4. Optionally set `JWT_SECRET` and `WEB_API_BASE_URL` in the root `.env`.

## Run the stack

```bash
docker compose up --build
```

Then:

- Web app:    http://localhost:8080
- Backend:    http://localhost:4000/health
- AI service: http://localhost:5000/health
- Mongo:      mongodb://localhost:27017

Stop: `docker compose down`. To also wipe Mongo data: `docker compose down -v`.

## Building images individually

```bash
docker build -t smartprep-backend ./backend
docker build -t smartprep-ai ./ai-service
docker build -t smartprep-web --build-arg VITE_API_BASE_URL=https://api.example.com ./web-frontend
```

## Production notes

- **Vite envs are baked at build time.** The web image is environment-specific because `VITE_API_BASE_URL` gets compiled into the JS bundle. Build a separate web image per environment, or pass `--build-arg VITE_API_BASE_URL=…` for each.
- **JWT_SECRET** must be a real long random string in any non-local deployment.
- **MongoDB**: in production, use a managed Mongo (Atlas, etc.) — point `MONGO_URI` at it and remove the `mongo` service from compose.
- **CORS** in the backend currently allows all origins (`cors()`); restrict it to your web origin before going public.
- **OpenAI key** must never be committed. Use the platform's secret-store (Render env, Railway secrets, K8s `Secret`, etc.).

## Mobile app

Update `mobile/app.json` →  `extra.apiBaseUrl` to your deployed backend URL before running `expo build`. The phone never talks to the AI service directly — only to the backend.
