# Vercel Deployment Guide

## 📋 Was Sie benötigen für Vercel-Hosting

### 1. Voraussetzungen
- ✅ GitHub Account
- ✅ Vercel Account (kostenlos: https://vercel.com/signup)
- ✅ Git installiert auf Ihrem Computer

### 2. Projekt-Struktur anpassen

Vercel kann **nur das Frontend** hosten (Next.js). Das Backend (FastAPI) muss separat gehostet werden.

---

## 🚀 Option A: Nur Frontend auf Vercel (Empfohlen für Demo)

### Schritt 1: Frontend API-Endpunkte anpassen

Erstellen Sie eine `.env.local` Datei im `frontend/` Verzeichnis:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://ihr-backend-url.com
```

Dann ändern Sie alle `http://localhost:8000` Aufrufe zu verwenden:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
fetch(`${API_URL}/api/product-factors/${selectedProduct}`)
```

### Schritt 2: Git Repository erstellen

```bash
cd C:\Users\tobia\Desktop\vlt-tool
git init
git add .
git commit -m "Initial commit"
```

### Schritt 3: GitHub Repository erstellen

1. Gehen Sie zu https://github.com/new
2. Repository Name: `vlt-tool` (oder eigener Name)
3. Private oder Public wählen
4. **Nicht** README, .gitignore, oder License hinzufügen
5. Klicken Sie "Create repository"

### Schritt 4: Code zu GitHub pushen

```bash
git remote add origin https://github.com/IHR-USERNAME/vlt-tool.git
git branch -M main
git push -u origin main
```

### Schritt 5: Vercel Deployment

1. Gehen Sie zu https://vercel.com
2. Klicken Sie "Add New..." → "Project"
3. Importieren Sie Ihr GitHub Repository
4. **Root Directory**: Setzen Sie auf `frontend`
5. **Framework Preset**: Next.js (automatisch erkannt)
6. **Environment Variables** hinzufügen:
   ```
   NEXT_PUBLIC_API_URL = https://ihr-backend-url.com
   ```
7. Klicken Sie "Deploy"

### Schritt 6: Backend separat hosten

Das Backend (FastAPI) muss auf einem Python-Server gehostet werden:

**Empfohlene Optionen:**
- **Railway.app** (einfach, kostenlos bis $5/Monat)
- **Render.com** (kostenlos mit Einschränkungen)
- **Heroku** (kostenlos Tier eingestellt, ab $5/Monat)
- **PythonAnywhere** (kostenlos mit Limits)
- **AWS EC2 / Google Cloud / Azure** (flexibel, komplex)

---

## 🔄 Option B: Full-Stack Deployment (Frontend + Backend getrennt)

### Frontend auf Vercel (wie oben)

### Backend auf Railway.app

**Schritt 1: `railway.json` erstellen** (im Root-Verzeichnis)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Schritt 2: `runtime.txt` erstellen** (im Root-Verzeichnis)

```
python-3.11
```

**Schritt 3: Railway Deployment**

1. Gehen Sie zu https://railway.app
2. Sign up mit GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Wählen Sie Ihr Repository
5. Railway erkennt automatisch Python
6. Environment Variables setzen (falls nötig)
7. Deploy!

**Schritt 4: Backend-URL in Frontend eintragen**

Nach Backend-Deployment erhalten Sie eine URL wie:
```
https://vlt-tool-production.up.railway.app
```

Diese URL in Vercel unter Environment Variables eintragen:
```
NEXT_PUBLIC_API_URL = https://vlt-tool-production.up.railway.app
```

---

## 📁 Benötigte Dateien für Deployment

### Im Root-Verzeichnis (`vlt-tool/`)

**`.gitignore`**
```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
.venv

# Frontend
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

**`requirements.txt`** (bereits vorhanden)
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pandas==2.1.3
python-multipart==0.0.6
openpyxl==3.1.2
```

### Im Frontend-Verzeichnis (`vlt-tool/frontend/`)

**`.env.local`** (lokal, nicht committen!)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**`.env.production`** (für Vercel)
```
NEXT_PUBLIC_API_URL=https://ihr-backend-url.com
```

**`vercel.json`** (Optional, für erweiterte Konfiguration)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ihr-backend-url.com/:path*"
    }
  ]
}
```

---

## 🔧 Code-Anpassungen für Production

### 1. API URL Environment Variable

**`frontend/lib/api.ts`** erstellen:

```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### 2. Alle Fetch-Aufrufe anpassen

**In `ManualInput.tsx`, `FileUpload.tsx`, etc.:**

```typescript
import { API_URL } from '@/lib/api';

// Vorher:
fetch('http://localhost:8000/api/product-factors/...')

// Nachher:
fetch(`${API_URL}/api/product-factors/...`)
```

### 3. CORS im Backend anpassen

**In `main.py`:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://vlt-tool.vercel.app",  # Ihre Vercel URL
        "https://*.vercel.app"  # Alle Vercel Preview Deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📋 Deployment Checklist

### Vor dem Deployment

- [ ] `.gitignore` erstellt
- [ ] Git Repository initialisiert
- [ ] Code auf GitHub gepusht
- [ ] API URL als Environment Variable konfiguriert
- [ ] Alle `localhost:8000` durch `API_URL` ersetzt
- [ ] CORS-Einstellungen für Production angepasst

### Frontend (Vercel)

- [ ] Vercel Account erstellt
- [ ] GitHub Repository verbunden
- [ ] Root Directory auf `frontend` gesetzt
- [ ] Environment Variables gesetzt
- [ ] Deployment erfolgreich

### Backend (Railway/Render/etc.)

- [ ] Platform gewählt
- [ ] `requirements.txt` aktuell
- [ ] Start-Command konfiguriert
- [ ] Environment Variables gesetzt (falls nötig)
- [ ] Deployment erfolgreich
- [ ] URL erhalten

### Nach dem Deployment

- [ ] Backend-URL in Vercel Environment Variables eingetragen
- [ ] Frontend neu deployed (mit neuer Backend-URL)
- [ ] Manuelle Eingabe testen
- [ ] File Upload testen
- [ ] Template Download testen

---

## 💰 Kosten-Übersicht

### Frontend (Vercel)
- ✅ **Free Tier**: Perfekt für Demos und kleine Projekte
- ✅ Unlimited Bandwidth
- ✅ Automatische SSL-Zertifikate
- ✅ Git-basiertes Deployment

### Backend Optionen

**Railway.app:**
- ✅ $5 kostenlos pro Monat (ausreichend für Demo)
- ✅ Einfaches Setup
- ✅ Automatisches Scaling

**Render.com:**
- ✅ Kostenloser Tier (mit Einschränkungen)
- ⚠️ Free Tier schläft nach 15 Min Inaktivität
- ✅ Automatisches Deployment

**PythonAnywhere:**
- ✅ Kostenloser Tier für kleine Apps
- ⚠️ Limitierte CPU und Bandbreite
- ✅ Gut für Demos

---

## 🔐 Sicherheit

### Produktions-Tipps

1. **Environment Variables** für sensitive Daten
2. **API Keys** niemals im Code
3. **CORS** nur für vertrauenswürdige Domains
4. **Rate Limiting** für API-Endpunkte
5. **HTTPS** überall (automatisch bei Vercel/Railway)

---

## 📞 Hilfe & Ressourcen

**Vercel Dokumentation:**
https://vercel.com/docs

**Railway Dokumentation:**
https://docs.railway.app

**Next.js Deployment:**
https://nextjs.org/docs/deployment

**FastAPI Deployment:**
https://fastapi.tiangolo.com/deployment/

---

## 🎯 Zusammenfassung

**Minimale Schritte für Demo:**

1. Code auf GitHub pushen
2. Vercel Account erstellen
3. GitHub Repo mit Vercel verbinden
4. Root Directory: `frontend` setzen
5. Deploy!

**Für voll funktionsfähige App:**
+ Backend auf Railway/Render hosten
+ Backend-URL als Environment Variable in Vercel
+ CORS im Backend anpassen

**Geschätzte Zeit:** 15-30 Minuten
**Kosten:** $0 (mit Free Tiers) oder ~$5-10/Monat (mit Paid Tiers)

---

Viel Erfolg beim Deployment! 🚀


