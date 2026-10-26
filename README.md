# Louie — Portfolio

Full-stack portfolio: **Next.js + React** frontend, **Express.js** backend.

```
Portfolio/
├── shared/portfolio.json   ← ALL your content: name, skills, journey, projects, contacts, CV
├── backend/                ← Express API (port 4000)
│   ├── src/server.js         routes
│   ├── src/mailer.js         Gmail notifications
│   └── data/messages.json    saved contact messages
└── frontend/               ← Next.js app (port 3000)
    ├── app/page.js           the portfolio
    ├── app/inbox/            your private inbox at /inbox
    ├── app/icon.js           favicon
    ├── app/opengraph-image.js  link preview image
    └── public/               images, CV
```

## Run it

Always from the main `Portfolio` folder, in **one** terminal:

```bash
npm run install:all   # first time only
npm run dev           # starts API (4000) + website (3000) together
```

Open http://localhost:3000

## How the loop works

```
 Next.js page ──GET /api/portfolio──▶ Express ──reads──▶ shared/portfolio.json
      │  (refreshes every 60s; falls back to the bundled JSON if the API is down)
 StatusLoop ──GET /api/health every 15s──▶ "API online · 12ms" badge
 ContactForm ──POST /api/contact──▶ validate + rate-limit ──▶ messages.json ──▶ email to your Gmail
 /inbox ──GET/DELETE /api/messages (password)──▶ read, reply, delete
```

## Reading messages

- **Website:** open http://localhost:3000/inbox and enter the `ADMIN_TOKEN` from `backend/.env`.
- **Email:** fill in `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `backend/.env`
  (create the App Password at https://myaccount.google.com/apppasswords; 2-Step Verification must be ON),
  then restart. Every new message is emailed to `NOTIFY_TO`, and pressing Reply answers the sender.

## Filling in your info (`shared/portfolio.json`)

Anything empty stays hidden on the site.

| What | How |
|---|---|
| Full name | `profile.name` |
| Skills / about | `skills`, `profile.about` |
| CV | put `cv.pdf` in `frontend/public/`, then set `"cv": "/cv.pdf"` |
| GitHub | in `contacts`, set the github entry's `"value": "username"`, `"url": "https://github.com/username"` |
| Discord | discord entry: `"value": "yourname"`, `"url": "https://discord.com/users/YOUR_USER_ID"` |
| Experience / education | add to `journey`: `{ "period": "2023 – Present", "title": "BS Information Technology", "place": "School name", "description": "..." }` |
| New project | add to `projects` and put the screenshot in `frontend/public/images/` |

## Deploy

1. Push this folder to GitHub.
2. **Backend → Render:** New → Blueprint → pick the repo (uses `render.yaml`).
   Set `FRONTEND_ORIGIN` to your Vercel URL and the Gmail values.
3. **Frontend → Vercel:** New Project → pick the repo → Root Directory `frontend`.
   Env vars: `NEXT_PUBLIC_API_URL` = your Render URL, `NEXT_PUBLIC_SITE_URL` = your Vercel URL.

Note: on Render's free plan the server sleeps when idle and its files reset on redeploy, so
`messages.json` can be wiped. The Gmail notification is your permanent copy of every message.
