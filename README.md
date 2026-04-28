# Asset Tracker

A self-hosted personal asset management app. Track what you own, what you paid, where you bought it, and whether you made a profit when you sold it.

Runs in Docker on your local network — no cloud account required.

![Dashboard](https://placehold.co/900x500/1a1a1a/666666?text=Asset+Tracker)

---

## Features

- **Asset records** — name, manufacturer, model/serial number, purchase date, price, store, quantity, and product URL
- **Status tracking** — Active, Sold, or Lost, with sale price/date and automatic profit & loss calculation
- **Warranty tracking** — expiry date with Active / Expiring Soon / Expired indicators
- **File attachments** — upload receipts, manuals, or photos (up to 50 MB each)
- **Sub-items** — nest accessories or components under a parent asset
- **Dashboard** — total asset value, realized P&L, and lost asset count at a glance
- **Table view** — sortable columns, status filter, bulk delete, and CSV export
- **⌘K search** — fuzzy search across all assets from anywhere in the app
- **Appearance settings** — light, dark, or system mode + 12 accent color themes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database | SQLite via Prisma 7 + libsql adapter |
| File storage | Local filesystem (Docker volume) |
| Container | Docker + Docker Compose |

---

## Quick Start (Docker)

**Prerequisites:** Docker and Docker Compose installed.

```bash
git clone https://github.com/YOUR_USERNAME/asset-tracker.git
cd asset-tracker
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

Data persists in two named Docker volumes:
- `db_data` — SQLite database at `/data/assets.db`
- `uploads` — file attachments at `/uploads`

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:/data/assets.db` | libsql connection string |
| `UPLOAD_DIR` | `/uploads` | Directory for uploaded files |

These are set automatically by `docker-compose.yml`. For local development, copy `.env.example` to `.env`.

---

## Local Development

**Prerequisites:** Node.js 20+.

```bash
npm install
cp .env.example .env          # uses prisma/dev.db by default
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── assets/                   # Asset list, detail, add, edit
│   ├── settings/                 # Appearance settings
│   └── api/                      # REST API routes
│       ├── assets/               # CRUD + CSV export
│       └── uploads/              # File serving
├── components/
│   ├── assets/                   # AssetTable, AssetForm, SearchBar, …
│   ├── dashboard/                # StatCard, RecentAssets
│   ├── layout/                   # Sidebar, Header, ThemeToggle
│   └── providers/                # ThemeProvider, ThemeColorProvider
└── lib/
    ├── prisma.ts                 # Singleton Prisma client
    ├── upload.ts                 # File save/delete helpers
    ├── csv.ts                    # CSV export
    └── validations/asset.ts      # Zod schema
```

---

## Docker Volumes

To back up your data:

```bash
# Database
docker run --rm -v asset-tracker_db_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db_backup.tar.gz /data

# Uploads
docker run --rm -v asset-tracker_uploads:/uploads -v $(pwd):/backup \
  alpine tar czf /backup/uploads_backup.tar.gz /uploads
```

---

## License

MIT
