LIVE LINK : https://pratham-rabari.github.io/Salon_Queue_Management_Vibe_Code/#/


# 💈 Royal Crown Salon — Real-Time Queue Management App

A client-side, zero-backend, multi-window synchronized queue management web application designed to eliminate weekend salon waiting friction, customer disputes, and chaotic lines. Built with **React 18**, **Vite**, and **Tailwind CSS**.

---

## 📌 Project in Brief

### The Problem
On weekends, salon customers frequently wait 1–2 hours without knowing their exact turn or estimated service time. Customers leave out of frustration, and walk-ins argue over who arrived first. 

### The Solution
A transparent, fair, first-come-first-served (FIFO) live digital queue where:
- **Customers** can check queue status, join from their phone, choose up to 3 services, pick their barber, and track their turn live.
- **Receptionists** manage walk-ins, call the next customer per barber, and handle no-shows.
- **Barbers** track their active customer, run service timers, and toggle their break status.
- **Waiting Area TV** provides a hands-off, large-screen billboard readable from 5 meters away with real-time token announcements.

---

## 🚀 Architecture & Real-Time Sync Model

This project operates entirely on the client side without needing backend servers, databases, or WebSocket servers:

1. **Persistent Browser `localStorage`**: All queue tokens, barber statuses, and salon configuration are stored under a single structured schema in the browser.
2. **Native Window `"storage"` Events**: Whenever a token is created, called, or updated in one window (e.g. `/join`), the browser triggers a native `storage` event in all other open tabs/windows, updating their UI instantly.
3. **2-Second Polling Fallback**: A lightweight interval ensures that live elapsed timers and queue estimates remain updated even if a window is idle.
4. **Auto Daily Reset**: Queue tokens automatically reset when the calendar date changes, with a manual **"Reset demo data"** button on the Reception screen for testing.

---

## 📱 The 6 Dedicated Screens

| Screen / URL | Target Device | Key Features |
|---|---|---|
| **Home (`/`)** | Mobile Phone | Live customer count, estimated wait time, barber status chips (`Free`, `Busy`, `On break`), big `[Join Queue]` CTA, and direct navigation links. |
| **Join Queue (`/join`)** | Mobile Phone | Name input, inline 10-digit phone validation, service cards (max 3), barber selector ("Any barber" or specific barber), live time & price summary bar, active spot protection. |
| **My Status (`/status/:id`)** | Mobile Phone | Dynamic token ID (e.g. `S-14`), live position ("4th in line"), plain-text countdown ("about 35 min"), gold `"Start coming to the salon"` alert at 2nd in line, full-screen gold `"It's your turn!"` notification when called, spot cancellation with confirmation popup. |
| **Reception Dashboard (`/reception`)** | 10-inch Tablet | Landscape dashboard with barber status cards, elapsed service progress bars, `[Call next]` buttons, FIFO queue table with `[No-show]` and `[Cancel]`, `[+ Add walk-in]` modal, and `[Reset demo data]`. |
| **Barber View (`/barber/:name`)** | Mobile Phone | View for Ravi, Amit, or Imran (`/barber/ravi`, `/barber/amit`, `/barber/imran`) with current customer card, elapsed timer, sequential `[Start]` and `[Done]` buttons, and `On break / Available` toggle. |
| **Waiting TV Display (`/display`)** | Large TV Screen | Hands-off landscape display readable from 5m ($\ge 48\text{px}$ text). Shows stationed barbers with `Now: S-1`, Next 5 queued tokens, and gold flashing when a token is called. |

---

## ⚙️ Core Queue Rules & State Machine

- **Token Lifecycle**: `Waiting` $\rightarrow$ `Called` $\rightarrow$ `In chair` $\rightarrow$ `Done` (strictly forward-moving). Terminal exits: `Waiting` $\rightarrow$ `Cancelled` and `Called` $\rightarrow$ `No-show`.
- **First-Come, First-Served**: Order is strictly determined by join timestamp (`createdAt`).
- **Barber Preference Matching**: `[Call next]` for Barber X prioritizes the earliest waiting customer who chose Barber X or "Any barber". A customer who explicitly chose another barber is never reassigned.
- **One Customer per Barber**: A barber can only serve one active customer (`Called` or `In chair`) at a time.
- **Active Spot Limit**: Only 1 active spot per phone number. If an active customer attempts to join again, they are immediately redirected to their existing status screen. Once marked `Done`, `Cancelled`, or `No-show`, the customer can rejoin with a new sequential token placed at the end of the queue.
- **Dynamic Estimated Wait**:
  $$\text{Wait Time} = \left\lceil \frac{\text{Total Service Minutes Ahead}}{\text{Working Barbers}} \div 5 \right\rceil \times 5\text{ minutes}$$

---

## 📦 Demo Data

- **Barbers**:
  - Ravi 👨🏽 (Busy with `S-1`)
  - Amit 👨🏻 (Free, ready for walk-ins)
  - Imran 🧔🏽 (On break)
- **Services**:
  - Haircut: 30 min (₹150)
  - Beard trim: 15 min (₹80)
  - Hair spa: 45 min (₹400)
  - Shave: 15 min (₹60)
  - Head massage: 20 min (₹100)
- **Salon Operating Hours**: 10:00 AM – 9:00 PM

---

## 🛠️ Tech Stack

- **Framework**: React 18 (Functional components + Hooks)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS (Custom charcoal `#1F2937` & gold `#D4A017` theme)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

---

## 💻 Getting Started Locally

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/pratham-rabari/Salon_Queue_Management_Vibe_Code.git
cd Salon_Queue_Management_Vibe_Code
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🧪 Recommended Multi-Window Testing Walkthrough

To see the real-time synchronization in action without a backend:
1. Open **Window 1**: `http://localhost:3000/reception` (Reception Dashboard)
2. Open **Window 2**: `http://localhost:3000/display` (TV Board)
3. Open **Window 3**: `http://localhost:3000/join` (Customer Join Screen)
4. Fill in customer details in Window 3 and click **Confirm**.
5. Watch Windows 1 & 2 update within milliseconds!
6. Click `[Call next]` on Amit's card in Window 1. Customer phone (Window 3) immediately changes to the full-screen gold **"It's your turn!"** alert, and the TV flashes the token in gold!
