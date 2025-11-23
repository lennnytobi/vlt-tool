# 🔧 Vercel Environment Variable Fix

## Problem

Die Konsole zeigt:
```
Fetching from: https://vlt-tool-production.up.railway.app//api/product-factors/pv
```

Das bedeutet: `NEXT_PUBLIC_API_URL` ist noch auf das alte Railway-Backend gesetzt!

## ✅ Lösung: Environment Variable entfernen

### Schritt 1: Vercel Dashboard öffnen

1. Gehen Sie zu: https://vercel.com/dashboard
2. Wählen Sie Ihr Projekt: `vlt-tool`

### Schritt 2: Environment Variable löschen

1. Klicken Sie auf **Settings**
2. Klicken Sie auf **Environment Variables**
3. Suchen Sie nach: `NEXT_PUBLIC_API_URL`
4. Klicken Sie auf das **X** (Löschen)
5. Bestätigen Sie die Löschung

### Schritt 3: Redeploy

1. Gehen Sie zu **Deployments**
2. Klicken Sie auf das **drei Punkte Menü** (⋯) beim neuesten Deployment
3. Wählen Sie **Redeploy**
4. Oder: Pushen Sie einen neuen Commit (triggert automatisches Deployment)

---

## 🎯 Nach dem Fix

Nach dem Redeploy sollte die Konsole zeigen:
```
Fetching from: /api/product-factors/pv
```

(Relative URL statt Railway-URL)

---

## ✅ Warum?

- **Vorher:** Frontend verwendet externes Railway-Backend (nicht mehr nötig)
- **Jetzt:** Frontend verwendet integrierte Next.js API Routes (alles in einem)

---

**Nach diesem Fix sollte alles funktionieren!** 🚀

