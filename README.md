# Hara Sameeraj Kuppili · Portfolio

Personal portfolio of Hara Sameeraj Kuppili, full-stack AI engineer (VIT Chennai).

- Dark and light themes with a circular view-transition switch
- WebGL dot-terrain hero (Three.js) with an on-device cut-out portrait
- Live in-page demos for each project: candidate ranking (Stitch ATS), PII redaction (Kavach), parent/teacher app (Orbit), vendor risk scan (VendorScan) and vitals triage
- A working terminal, a ⌘K command menu and GitHub data pulled live from the API
- Strict Content-Security-Policy and security headers (see `vercel.json`)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production site is the static `dist/` folder. It deploys to Vercel with the settings in `vercel.json`.

## Stack

Vite · vanilla JavaScript · Three.js · GSAP (ScrollTrigger, Flip) · Lenis
