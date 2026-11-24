# Screens & Features

Global: charcoal #1F2937 background, gold #D4A017 accents, rounded cards.
EN/GU toggle in the top-right of every screen. Tap targets at least 44px on phone.
Staff screens (/reception, /barber/:name, /admin) ask for a PIN first.

## Screen 1: Home (/) — phone
- Salon name + logo, badge: "Open · Closes 9 PM" (or "Closed").
- Live card: "6 people waiting · about 50 min".
- Barber chips with status: Ravi (busy) · Amit (free) · Imran (on break).
- Big gold button [ Join Queue ].
- If the queue is closed: button disabled, message "Online queue is closed. Walk-ins are welcome."
- Empty state: "No one waiting, walk right in!"

## Screen 2: Join Queue (/join) — phone
- Fields: Name (required), Phone (exactly 10 digits, validated inline).
- Service cards, multi-select, max 3. Each shows name, minutes, price.
  A 4th selection is blocked with the message "Maximum 3 services".
- Barber picker: "Any barber (fastest)" (default) or a barber photo card.
  A barber on break shows "On break" but can still be chosen.
- Live summary bar: "Total 45 min · ₹230 · Expected wait ~35 min", updates on every change.
- [ Confirm ] disabled until name, valid phone, and 1+ service are set.
- If the phone already has an active spot: skip creating, go to that spot's My Status with a note.
- On success: create token, go to My Status.

## Screen 3: My Status (/status/:id) — phone
- Large token (e.g. "S-14"), position "4th in line".
- Circular countdown: "about 35 min", updates by itself.
- Chosen barber and services listed. If the barber is on break: "Ravi is on break".
- When 2nd in line: gold banner "Start coming to the salon".
- When called: full-screen gold "It's your turn! Go to Ravi", large text, gentle pulse, phone vibration.
- When in chair: "Service in progress". When done: "Thank you!".
- [ Cancel my spot ] with a confirm pop-up (only while Waiting).
- Cancelled / No-show state: clear message and a [ Join again ] button.
- Error: unknown id shows "Spot not found" with a link Home.

## Screen 4: Reception Dashboard (/reception) — 10-inch tablet, landscape
- Top bar: [ + Add walk-in ] (quick form: name, phone, services, barber), queue Open/Closed badge.
- Left: barber cards, 3 per row. Each shows photo, name, status (Free / Called / In chair / On break),
  current customer, time-left progress bar, and [ Call next ].
- Right: waiting list in queue order. Row: token, name, services, preferred barber,
  waiting time, [ No-show ] (only for Called customers) and [ Cancel ].
- Waiting more than 60 min: row highlighted amber.
- Called customers show a 10-minute timer; after 10 minutes the [ No-show ] button turns active/red.
- Empty state: "No one waiting."

## Screen 5: Barber View (/barber/:name) — phone
- Current customer: name, services, timer since start.
- Big buttons: [ Start ] then [ Done ]. Only one is active at a time.
- "Next for you: S-15 Kunal (Haircut)", or "No one waiting for you".
- Toggle: On break / Available. Cannot go on break while a customer is in the chair.

## Screen 6: Waiting Area TV (/display) — large TV, landscape, no interaction
- One row per working barber: photo, name, "Now: S-12" (or "Free").
- "Up next" list of 5 tokens with estimated times.
- Newly called token flashes gold and plays a chime (after a one-time "Tap to enable sound" overlay).
- Text readable from 5 metres: minimum 48px for tokens and names.

## Screen 7: Owner Settings (/admin) — tablet or phone
- Services list: name (EN/GU), minutes, price, On/Off toggle; add and edit.
- Barbers on duty today: toggle per barber.
- Queue switch: Open / Closed for online joining.
- Today's stats cards: customers served, average wait, no-shows.
