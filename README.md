# Rise Hire — RecruteIA Frontend

> **Part of RecruteIA (FQIA PFF N°3).**
> **Front-door repo (full docs + setup):** [yassjustice/RecruteIA-FQIA-PFF3](https://github.com/yassjustice/RecruteIA-FQIA-PFF3)

Next.js 14 frontend for the RecruteIA AI recruitment assistant. Connects to the
[recruiteia-api](https://github.com/yassjustice/recruiteia-api) FastAPI backend.

**Live:** https://rise-hire-frontend.vercel.app *(or current Vercel deployment URL)*

---

## 🚀 Run locally

```bash
git clone https://github.com/yassjustice/rise-hire-frontend.git
cd rise-hire-frontend

npm install

# (Optional) Create .env.local to point at a local backend:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
# If omitted, the app uses the live HF Space backend.

npm run dev
# Open http://localhost:3000
```

---

## 🛠 Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **API client:** `lib/api.ts` — JSON envelope `{success, data}`, JWT in localStorage
- **Cold-start UX:** `components/ui/ColdStartBanner.tsx` shows when API takes >5 s to respond

## 📋 Key routes

| Route | Purpose |
|-------|---------|
| `/login`, `/register` | Auth |
| `/dashboard` | Overview stats |
| `/offers`, `/offers/new`, `/offers/[id]` | Job offer management + Module 2 (JD analysis) |
| `/cvs`, `/cvs/[id]` | CV upload + Module 1 (CV extraction) |
| `/sessions/new`, `/sessions/[id]`, `/sessions/[id]/results` | Scoring session + Module 3 results |
| `/account` | User profile |

---

## 🔗 Related

- Backend API: [yassjustice/recruiteia-api](https://github.com/yassjustice/recruiteia-api)
- Docs hub: [yassjustice/RecruteIA-FQIA-PFF3](https://github.com/yassjustice/RecruteIA-FQIA-PFF3)
