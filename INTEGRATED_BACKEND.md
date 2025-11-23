# ✅ Backend ist jetzt integriert!

## 🎉 Was hat sich geändert?

Das Backend läuft jetzt **direkt in Next.js als API Routes** - kein separates Backend-Deployment mehr nötig!

### Vorher:
- ❌ Separates FastAPI-Backend (Python)
- ❌ Muss auf Railway/Render deployed werden
- ❌ Environment Variable `NEXT_PUBLIC_API_URL` nötig
- ❌ Zwei separate Deployments

### Jetzt:
- ✅ Backend als Next.js API Routes (TypeScript)
- ✅ Alles in einem Projekt
- ✅ Einfaches Deployment auf Vercel
- ✅ Keine Environment Variables nötig

---

## 📁 Neue Struktur

```
frontend/
├── app/
│   ├── api/                    # ← Backend ist hier!
│   │   ├── product-factors/
│   │   │   └── [product]/
│   │   │       └── route.ts    # Faktordefinitionen
│   │   ├── score/
│   │   │   ├── manual/
│   │   │   │   └── route.ts   # Manuelle Score-Berechnung
│   │   │   └── csv/
│   │   │       └── route.ts    # CSV-Upload
│   │   └── template/
│   │       ├── csv/
│   │       │   └── route.ts    # CSV-Template Download
│   │       └── excel/
│   │           └── route.ts    # Excel-Template Download
│   └── page.tsx
└── components/
```

---

## 🚀 Deployment

### Vercel (Alles in einem!)

1. **Code zu GitHub pushen:**
   ```bash
   git add .
   git commit -m "Backend integriert"
   git push
   ```

2. **Vercel deployt automatisch:**
   - Frontend + Backend in einem
   - Keine zusätzliche Konfiguration nötig
   - Fertig! 🎉

### Lokale Entwicklung

```bash
# Nur Frontend starten (Backend ist integriert!)
cd frontend
npm run dev
```

Öffnen: http://localhost:3000

**Kein separates Backend mehr nötig!**

---

## 🔄 Migration von altem Setup

### Falls Sie noch `NEXT_PUBLIC_API_URL` gesetzt haben:

**Entfernen Sie die Environment Variable in Vercel:**
- Settings → Environment Variables
- `NEXT_PUBLIC_API_URL` löschen
- Redeploy

Das Frontend verwendet jetzt automatisch die integrierten API Routes.

### Falls Sie ein externes Backend behalten möchten:

**Setzen Sie `NEXT_PUBLIC_API_URL`:**
- Dann wird das externe Backend verwendet
- Sonst werden die API Routes verwendet

---

## 📊 Was funktioniert?

✅ **Manuelle Eingabe** - Faktoren eingeben, Score berechnen  
✅ **CSV-Upload** - Dateien hochladen, Scores berechnen  
✅ **Template-Download** - CSV-Templates herunterladen  
✅ **Produktspezifische Faktoren** - PV, Storage, Charging  
✅ **Top/Flop Indikatoren** - Zeigt beste/schlechteste Faktoren  

---

## 🗑️ Altes Backend (main.py)

Das `main.py` File kann bleiben für:
- Referenz
- Lokale Python-Entwicklung
- Oder einfach löschen, wenn nicht mehr benötigt

**Für Production wird es nicht mehr benötigt!**

---

## 💡 Vorteile

1. **Einfacher:** Ein Deployment statt zwei
2. **Schneller:** Keine Netzwerk-Latenz zwischen Frontend/Backend
3. **Günstiger:** Keine zusätzlichen Backend-Hosting-Kosten
4. **Einfacher zu warten:** Alles in einem Codebase
5. **Type-Safe:** TypeScript für Frontend und Backend

---

## 🐛 Troubleshooting

### "API Route nicht gefunden"

- ✅ Prüfen Sie, ob die Route-Dateien existieren
- ✅ Prüfen Sie die Dateistruktur (`app/api/...`)
- ✅ Restart: `npm run dev`

### "Score-Berechnung funktioniert nicht"

- ✅ Prüfen Sie Browser-Konsole (F12)
- ✅ Prüfen Sie Network-Tab für API-Calls
- ✅ Prüfen Sie, ob alle Faktoren gesendet werden

### "CSV-Upload schlägt fehl"

- ✅ CSV muss UTF-8 sein
- ✅ Spaltennamen müssen exakt sein
- ✅ Prüfen Sie die CSV-Struktur

---

## 📝 API Endpunkte

Alle Endpunkte sind jetzt unter `/api/...`:

- `GET /api/product-factors/[product]` - Faktordefinitionen
- `POST /api/score/manual` - Manuelle Score-Berechnung
- `POST /api/score/csv` - CSV-Upload
- `GET /api/template/csv` - CSV-Template Download
- `GET /api/template/excel` - Excel-Template Download

---

**Viel einfacher jetzt!** 🎉


