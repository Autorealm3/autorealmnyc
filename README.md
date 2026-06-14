# Auto Realm Website

Luxury car rental, chauffeur & exotic import website for Auto Realm (NYC).

## 🚀 Deploy in 3 steps

1. **Upload this whole folder to GitHub** (see AUTO_REALM_DEPLOY_GUIDE.md)
2. **Connect the GitHub repo to Vercel** — it auto-detects Vite and deploys
3. **Add your custom domain** in Vercel settings

Vite + React. Vercel auto-detects everything — no config needed.

## 📁 Before you deploy — add your images

Drop these into `public/`:
- `public/logo.png` — your gold Auto Realm logo
- `public/fleet-photos/` — all your car photos (s580-01.jpg, etc.)
- `public/Auto_Realm_Rental_Agreement.pdf` — the blank contract (for the booking flow link)

The photo filenames must match what's in `src/AutoRealm.jsx` (the CARS array).

## ⚙️ Configure before launch

Open `src/AutoRealm.jsx` and update the CONFIG block at the top:
- `SHEET_WEBHOOK_URL` — your Google Apps Script URL (for lead database)
- All other settings are already filled in.

## 🛠️ Run locally (optional)

```bash
npm install
npm run dev
```

Opens at http://localhost:5173
