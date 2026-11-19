# BakeFlow • Chat-to-Order Tracker (Monorepo)

A zero-friction, one-thumb mobile order and batch production tracker for home bakers and online sellers flooded with Messenger/IG DMs.

This repository is structured as a **monorepo** containing both the offline-first frontend PWA and the Laravel sync backend.

---

## Repository Structure

```text
chat-to-order-tracker/
├── frontend/                     # Mobile-first React + Dexie.js PWA
│   ├── src/
│   │   ├── components/           # Modular UI (Orders, Kitchen Prep, Modals)
│   │   ├── db/                   # Dexie.js (IndexedDB) schema & sync queue
│   │   ├── hooks/                # useSyncWorker (Delta sync engine)
│   │   ├── parser/               # Taglish deterministic chat parser (<5ms)
│   │   ├── services/             # API client for Laravel backend
│   │   └── utils/                # Receipt and rider handoff generators
│   └── package.json
│
├── backend/                      # Laravel REST API + Delta Sync Engine
│   ├── app/
│   │   ├── Http/Controllers/Api/ # AuthController & SyncController
│   │   └── Models/               # Seller, User, Order, OrderItem, MenuItem
│   ├── database/migrations/      # Multi-tenant UUID schema & indexes
│   ├── routes/api.php            # Auth & /api/sync endpoints
│   └── tests/Feature/            # End-to-end sync engine test suite
│
└── README.md
```

---

## Getting Started

### 1. Start the Backend API (Laravel)
The backend manages tenant accounts, authentication tokens (Sanctum), and cloud backup via delta synchronization.

```bash
cd backend
composer install
php artisan migrate
php artisan serve --port=8000
```
> The backend runs at `http://127.0.0.1:8000`. SQLite is pre-configured for zero-fuss local development.

To run the backend automated test suite:
```bash
php artisan test
```

---

### 2. Start the Frontend App (React PWA)
The frontend is local-first: all user actions (pasting DMs, adding items, ticking prep batches) write directly to on-device IndexedDB with zero network lag, syncing to the backend when online.

```bash
cd frontend
npm install
npm run dev
```
> The frontend runs at `http://localhost:5173`.

To build the frontend for production:
```bash
npm run build
```

---

## Core Features
- **Deterministic Chat Parser (<5ms)**: Instantly extracts customer name, items, variants, date/time, and payments from messy Taglish/English Messenger threads.
- **Messenger Thread Cleaner**: Automatically strips timestamps and outgoing seller chatter (`"You sent: ..."`).
- **"Pahabol" Auto-Merge**: Detects existing orders for the same customer on that date and merges them with 1 tap.
- **Daily Batch Production Caps**: Set limits (e.g. 15 boxes/day) with live capacity warnings and +/- steppers.
- **3 Contextual 1-Tap Copy Generators**:
  1. *Messenger Confirmation Receipt* with downpayment math and remaining balance.
  2. *Payment Reminder* with seller GCash/Maya number.
  3. *Courier/Rider Handoff* details formatted for Lalamove, Grab, or Maxim.
- **Local-First & Offline-Ready**: Works without an internet connection using IndexedDB (Dexie.js), syncing automatically via delta mutations when reconnected.
