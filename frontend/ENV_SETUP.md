# Environment Variables Setup

## Lokale Entwicklung

Erstellen Sie eine `.env.local` Datei im `frontend/` Verzeichnis:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Production (Vercel)

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://ihre-backend-url.com
```

Beispiele:
- Railway: `https://vlt-tool-production.up.railway.app`
- Render: `https://vlt-tool.onrender.com`
- Heroku: `https://vlt-tool.herokuapp.com`

## Wichtig

- `.env.local` wird **nicht** in Git committed (siehe `.gitignore`)
- Für Production-Deployments: Backend URL in Vercel eintragen
- Ohne Environment Variable wird standardmäßig `http://localhost:8000` verwendet


