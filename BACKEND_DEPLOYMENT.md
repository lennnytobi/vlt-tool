# Backend Deployment - Schnellstart

## 🚨 Problem: "Backend-Verbindung fehlgeschlagen"

Das Frontend auf Vercel kann das Backend nicht erreichen, weil:
1. ❌ Backend ist nicht deployed
2. ❌ `NEXT_PUBLIC_API_URL` ist nicht in Vercel gesetzt

---

## ✅ Lösung: Backend deployen (Railway.app - Empfohlen)

### Schritt 1: Railway Account erstellen

1. Gehen Sie zu: https://railway.app/signup
2. Mit GitHub anmelden
3. Account erstellen (kostenlos bis $5/Monat)

### Schritt 2: Backend deployen

1. **In Railway Dashboard:**
   - Klicken Sie "New Project"
   - Wählen Sie "Deploy from GitHub repo"
   - Wählen Sie Ihr `vlt-tool` Repository

2. **Railway erkennt automatisch:**
   - Python wird erkannt
   - `requirements.txt` wird verwendet
   - Start-Command wird automatisch gesetzt

3. **Falls nicht automatisch:**
   - Settings → Deploy → Start Command:
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

4. **Warten Sie auf Deployment** (~2-3 Minuten)

5. **Backend-URL kopieren:**
   - Nach Deployment sehen Sie eine URL wie:
     ```
     https://vlt-tool-production.up.railway.app
     ```
   - Diese URL kopieren!

---

## ✅ Schritt 3: Environment Variable in Vercel setzen

1. **Gehen Sie zu Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Wählen Sie Ihr Projekt

2. **Settings → Environment Variables:**

3. **Neue Variable hinzufügen:**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** Ihre Railway-URL (z.B. `https://vlt-tool-production.up.railway.app`)
   - **Environment:** 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

4. **Speichern**

5. **Redeploy auslösen:**
   - Deployments → Latest → "Redeploy"
   - Oder warten Sie auf automatischen Build nach Git Push

---

## 🔧 Alternative: Render.com (Kostenlos)

### Schritt 1: Render Account

1. Gehen Sie zu: https://render.com
2. Sign up mit GitHub

### Schritt 2: New Web Service

1. "New" → "Web Service"
2. GitHub Repository verbinden
3. **Settings:**
   - **Name:** vlt-tool-backend
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Deploy!**

5. **URL kopieren** (z.B. `https://vlt-tool.onrender.com`)

6. **In Vercel eintragen** (siehe Schritt 3 oben)

---

## 🧪 Testen

### Nach Deployment:

1. **Backend testen:**
   ```
   https://ihre-backend-url.com/docs
   ```
   Sollte Swagger UI zeigen

2. **API testen:**
   ```
   https://ihre-backend-url.com/api/product-factors/pv
   ```
   Sollte JSON mit Faktoren zurückgeben

3. **Frontend testen:**
   - Gehen Sie zu Ihrer Vercel-URL
   - Wählen Sie ein Produkt
   - Faktoren sollten jetzt laden!

---

## ⚠️ Wichtige Hinweise

### CORS muss erlaubt sein

Stellen Sie sicher, dass in `main.py` Ihre Vercel-URL erlaubt ist:

```python
allow_origins=[
    "http://localhost:3000",
    "https://*.vercel.app",  # Alle Vercel URLs
    "https://ihr-projekt.vercel.app",  # Ihre spezifische URL
],
```

### Environment Variables

- **Railway:** Automatisch, keine zusätzlichen nötig
- **Render:** Kann Environment Variables setzen falls nötig

### Kosten

- **Railway:** $5 kostenlos pro Monat (ausreichend)
- **Render:** Kostenlos mit Einschränkungen (kann nach 15 Min schlafen)

---

## 🐛 Troubleshooting

### "Backend nicht erreichbar"

1. ✅ Prüfen Sie, ob Backend läuft:
   - Railway/Render Dashboard → Logs
   - Sollte "Application startup complete" zeigen

2. ✅ Prüfen Sie die URL:
   - Backend-URL im Browser öffnen
   - Sollte Swagger UI oder JSON zeigen

3. ✅ Prüfen Sie CORS:
   - Browser-Konsole (F12) → Network Tab
   - Prüfen Sie CORS-Fehler

### "NEXT_PUBLIC_API_URL nicht gesetzt"

1. ✅ In Vercel prüfen:
   - Settings → Environment Variables
   - Sollte `NEXT_PUBLIC_API_URL` vorhanden sein

2. ✅ Nach Änderung:
   - **Redeploy erforderlich!**
   - Environment Variables werden nur beim Build geladen

3. ✅ Prüfen Sie den Wert:
   - Sollte mit `https://` beginnen
   - Kein `/` am Ende

---

## 📋 Checkliste

- [ ] Backend auf Railway/Render deployed
- [ ] Backend-URL funktioniert (im Browser testen)
- [ ] `NEXT_PUBLIC_API_URL` in Vercel gesetzt
- [ ] Vercel Projekt neu deployed
- [ ] Frontend testen - Faktoren sollten laden
- [ ] CORS in `main.py` erlaubt Vercel-URLs

---

## 🎯 Quick Commands

### Backend lokal testen:
```bash
cd C:\Users\tobia\Desktop\vlt-tool
uvicorn main:app --reload
```

### Frontend lokal testen:
```bash
cd frontend
npm run dev
```

### Git Push (triggert Vercel Deployment):
```bash
git add .
git commit -m "Update"
git push
```

---

**Nach diesen Schritten sollte alles funktionieren!** 🚀


