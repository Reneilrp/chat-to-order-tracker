# Chat-to-Order Tracker (BakeFlow v2)

A zero-friction, one-thumb mobile order and batch production tracker for home bakers and online sellers flooded with Messenger/IG DMs.

## Features
- **Deterministic Chat Parser (<5ms)**: Instant regex & heuristic extraction of customer names, items, quantities, delivery/pickup times, and payment channels from messy Taglish/English threads.
- **Messenger Thread Cleaner**: Strips out timestamps and outgoing seller chatter (`"You sent:"`) to isolate buyer requests.
- **"Pahabol" Auto-Merge**: Automatically detects active orders for the same customer and offers a 1-tap merge option.
- **Daily Batch Caps**: Set production limits per item (e.g. 15 boxes/day) with live capacity warnings and instant +/- steppers.
- **Multi-Template 1-Tap Copy Generators**:
  - Messenger Confirmation Receipt with downpayment math and remaining balance.
  - Polite Payment Reminder with payment details.
  - Courier / Rider Handoff details for Lalamove / Grab / Maxim.
- **Downpayment Quick-Pop Modal**: Record partial DP with 50% split buttons and balance tracking.
- **End-of-Day Sales & Cash Tally**: Reconciles E-wallets vs Cash-on-hand with collection rates.
- **Local-First & Offline-Ready**: Works without an internet connection, saves to `localStorage` with JSON export/restore.

## Project Structure
```
chat-to-order-tracker/
├── src/
│   ├── types/
│   │   └── index.ts                 # Full TypeScript schemas (Order, MenuItem, etc.)
│   ├── utils/
│   │   ├── formatters.ts            # Currencies (₱), 12h times, IDs, clipboard
│   │   └── receiptGenerator.ts      # Clipboard templates (Receipt, Reminder, Rider)
│   ├── parser/
│   │   └── chatParser.ts            # Messenger cleaner & Taglish parser
│   ├── data/
│   │   └── sampleData.ts            # Default menu, sample Taglish chats, mock orders
│   ├── components/
│   │   ├── common/
│   │   │   └── Toast.tsx            # Floating feedback alert
│   │   ├── header/
│   │   │   └── Header.tsx           # Brand, offline status, date toggle, cash bar
│   │   ├── orders/
│   │   │   ├── OrderCard.tsx        # Card with 48px thumb actions & status advance
│   │   │   └── OrdersView.tsx       # Filter pills, search, order list
│   │   ├── prep/
│   │   │   └── KitchenPrepView.tsx  # Production progress & batch checklists
│   │   ├── menu/
│   │   │   └── MenuManager.tsx      # Add product form, cap steppers, backup/restore
│   │   ├── modals/
│   │   │   ├── IntakeDrawer.tsx     # Slide-up paste & draft confirmation card
│   │   │   ├── PaymentModal.tsx     # Quick DP and payment channel popover
│   │   │   └── DailyTallySheet.tsx  # End-of-day reconciliation drawer
│   │   └── navigation/
│   │       ├── BottomNav.tsx        # Fixed 3-tab navigation
│   │       └── FloatingIntakeButton.tsx # "+ Paste Chat / Order" button
│   ├── App.tsx                      # App orchestrator & derived selectors
│   ├── main.tsx
│   └── index.css                    # Tailwind CSS directives
└── package.json
```

## Getting Started

### Development Server
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```
