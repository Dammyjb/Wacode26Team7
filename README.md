# Allofood

**Helping food businesses allocate surplus food smarter.**

🌐 **Live demo:** [https://wacode26-team7.vercel.app](https://wacode26-team7.vercel.app)

---

## What it does

Allofood is an AI-powered food allocation platform for food businesses (restaurants, grocers, cafeterias, distributors). It helps staff:

1. **Classify surplus food** — type or scan items with a camera; AI routes each to donation, biodigester, or landfill with a confidence score and reason.
2. **Find nearby facilities** — live map of food banks, biodigesters, and landfill drop-offs with real-time capacity status.
3. **Generate tax docs** — auto-fills IRS Form 8283 for food donations so businesses can claim their deduction.
4. **Track impact** — personal dashboard with CO₂ saved, meals provided, tier progression, and badges.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **AI:** Claude Sonnet via Anthropic API — text classification + vision/camera scan
- **Map:** Leaflet + OpenStreetMap
- **PDF:** pdf-lib (IRS Form 8283 generation)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To enable real AI classification, add your Anthropic API key:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

Without a key the app runs in mock mode — all features still work for demo purposes.

## Demo credentials (Tax Docs)

- Email: `demo@allofood.com`
- Password: `allofood2024`

---

Built for Wacode 2026 — Team 7
