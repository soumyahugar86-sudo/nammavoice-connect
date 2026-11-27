# NammaVoice 🎙️

A bilingual (Kannada / English) civic complaint prototype. Citizens report potholes, garbage, water leaks, drainage and streetlight problems by voice or text, add a photo and location, get an AI (or offline rule-based) analysis and a unique complaint ID, then track it. A demo admin dashboard lets reviewers search, filter and update status.

> Prototype only — complaints are **not** sent to any government department.

## Features
- Voice input via the browser Web Speech API (`kn-IN` / `en-IN`), editable transcript, text fallback
- AI analysis (category, urgency, title, summary) via a server function; automatic offline rule-based fallback, clearly labelled
- Photo upload (resized in-browser), GPS or manual area entry
- Complaint IDs like `NV-24A7K3`, tracking timeline, admin dashboard with search/filters
- Persistent storage in the Lovable Cloud database with realistic sample data

## Run locally
```bash
bun install
bun run dev   # http://localhost:8080
```
The `.env` file contains only public (publishable) keys. The AI key lives on the server and is never sent to the browser; without it the app uses the rule-based analysis.

## Docker
```bash
docker compose up --build
```
Then open http://localhost:8080.

## GitHub
```bash
git init && git add . && git commit -m "NammaVoice"
git remote add origin https://github.com/<you>/nammavoice.git
git push -u origin main
```
Or use Lovable's GitHub integration to sync automatically.

## Tests
```bash
bunx vitest run
```
