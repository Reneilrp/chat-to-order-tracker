# BakeFlow • Chat-to-Order Tracker 🧁

> **Stop transcribing messy DMs into notebooks.**  
> BakeFlow is a zero-friction, one-thumb order tracker designed specifically for home bakers, pastry chefs, and online food sellers flooded with Messenger, Instagram, and Viber inquiries.

---

## The Problem BakeFlow Solves

When you're hands-deep in flour or juggling dozens of chats on your phone, traditional POS software and accounting apps are too slow, bloated, and complicated. Sellers often resort to notebooks, messy Notes apps, or loose memory—leading to:
- Forgotten add-ons (*"pahabol"*) and missing modifiers (*"no nuts"*, *"less sweet"*).
- Losing track of who actually paid vs. who sent a partial downpayment.
- Scrolling through 30 individual conversations just to figure out how many boxes of brownies to bake today.

**BakeFlow is engineered to feel faster than writing in a notebook, with zero loading lag and 100% offline capability.**

---

## How It Works in Your Daily Routine

### 1. ⚡ Instant Smart Paste (Under 5 Seconds)
Copy the buyer's messy chat message from Messenger or Instagram and tap **One-Tap Paste**:
> *"Ate Maria: 2 boxes classic brownies (no nuts), 1 ube cheese pandesal bukas 4pm pickup, 500 dp gcash sent na po"*

BakeFlow automatically extracts:
- **Customer Name**: Maria
- **Items & Modifiers**: 2x Classic Brownies *(Note: no nuts)*, 1x Ube Pandesal
- **Schedule**: Tomorrow at 4:00 PM (Pickup)
- **Payment**: GCash (₱500 downpayment recorded, remaining balance calculated automatically)

*Taking an order over the phone?* Use the **Quick-Tap Menu Chips** to log orders in under 5 seconds.

---

### 2. 👩‍🍳 The "Kitchen Prep" View (Batch Production Mode)
Instead of re-reading 30 separate orders while preparing your ingredients, switch to the **Kitchen Prep Tab**:
- Automatically groups and calculates your total batch counts for **Today** or **Tomorrow**:
  - `Classic Fudge Brownies: 14 boxes total`
  - `Red Velvet Crinkles: 8 jars total`
  - `Burnt Basque Cheesecake: 3 cakes total`
- Tap each batch item to check it off as it comes out of the oven or gets boxed.
- Includes special modifiers attached directly to the batch (e.g., *"2x less sweet for Camille"*).

---

### 3. 📋 1-Tap Copy Receipts & Courier Handoffs
Save time typing repetitive messages:
- **Order Confirmation Receipt**: Generates a clean, polite summary with downpayment math and remaining balance to paste straight back into your DM.
- **Friendly Payment Reminder**: 1-click nudge for customers with pending balances, including your GCash/Maya number.
- **Rider / Courier Details**: Formatted drop-off instructions with landmarks and cash-to-collect amounts for Lalamove, Grab, or Maxim drivers.

---

### 4. 📶 100% Offline-Ready with Cloud Backup
- **Works in the kitchen without internet**: All actions save instantly to your phone's local storage with zero delay.
- **Disaster Recovery**: Connect your free shop account to quietly back up your orders and menu to the cloud whenever you have internet, so you never lose data if you switch or misplace your phone.

---

## Quick Start (How to Launch)

### Run the App
```bash
# 1. Start the cloud backend (optional, for cross-device sync)
cd backend
php artisan serve --port=8000

# 2. Start the mobile app
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` on your browser or mobile phone, tap **+ Paste Chat / Order**, and you're ready to take orders!
