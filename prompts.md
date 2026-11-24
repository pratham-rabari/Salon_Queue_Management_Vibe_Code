# prompts.md — Every prompt used, in order

Project: Salon Queue Management System (Lite)
Agent: Google Antigravity
Note: Add a result line under each prompt (worked / partly worked / failed, and why).
Keep failed prompts and bug fixes in this file, in the order you sent them.

---

## Phase 1: Understand

### Prompt 1: Check rules
```
Read AGENTS.md and tell me the rules you'll follow while building this project.
```
Result:

### Prompt 2: Summarise
```
Read AGENTS.md and all of docs/. Summarise the app in 6 bullets and list anything unclear. Don't write code yet.
```
Result:

### Prompt 3: Answers to agent's stack and scope questions
```
Answers (docs/04-lite-scope.md overrides the other docs):

Stack: React + Vite + Tailwind only. No Next.js.

Storage and sync: use the simplest option that works for a learning project. Use browser localStorage plus a "storage" event listener, with 2-second polling as a fallback, so all screens stay in sync across windows on the same device. No backend, no WebSockets. Explain your choice in 3 lines before building.

Staff PIN: skipped. No PIN on any screen.

Barber screen: /barber/:name opens directly. Add a small list of barber links (Ravi, Amit, Imran) on the Home page footer so I can reach it.

Daily reset: no admin screen. Tokens reset automatically when the date changes. Add a small "Reset demo data" button on /reception so I can restart tests.

Re-joining: yes. Once a customer is Done, Cancelled or No-show, the same phone can join again and gets a new token. Only one ACTIVE spot (Waiting, Called, In chair) per phone.

TV chime: skipped. Only flash the called token in gold.

Gujarati: skipped. English only.

Anything else unclear: choose the simplest option, tell me what you chose in one line, and continue.
```
Result:

### Prompt 4: Answers to second round of questions
```
Answers (follow these, then continue):

1. "Any barber" and "Start coming":
- "Any barber" customers are not assigned to anyone when they join. The first Free barber who taps Call next gets the earliest Waiting customer who chose that barber or "Any".
- "Start coming" banner: show it when the customer is Waiting and their position among ALL Waiting customers is 2 or lower. Position = number of Waiting customers who joined before them + 1.

2. Barber on break: yes, a customer who chose that barber may stay Waiting for as long as the barber is on break. No timeout and no reassignment. Show "Ravi is on break" on their status page. Reception can Cancel them manually.

3. Timers:
- Reception time-left = total minutes of the customer's chosen services minus minutes since the barber tapped Start. Progress bar = elapsed ÷ total. Never go below 0. If overtime, show "Overtime" with a full bar.
- While a customer is Called but not started, show "Waiting for customer" with an empty bar.
- Barber View timer: mm:ss counting up since Start.

4. TV flash: the newly called token flashes gold for 5 seconds.

5. Seed data: start EMPTY on first load. Add a [ Load demo data ] button next to [ Reset demo data ] on /reception. It adds 6 dummy customers with Indian names, mixed services and barber choices (some Ravi, some Amit, some "Any").

6. Project structure: this is a fresh project, so scaffold Vite + React in the current folder root. Don't delete or overwrite AGENTS.md or docs/. Use React Router with the default Vite entry point (src/main.jsx). Create README.md with the title "Salon Queue Management System", then on the very next line "**Live demo:** (add after deploy)", then a short About section.

If anything else is unclear, choose the simplest option, tell me in one line, and continue.
```
Result:

### Prompt 5: Save clarifications into docs
```
Append the answers above to docs/03-flows-rules.md under a "Clarifications" heading. Don't change anything else.
```
Result:

---

## Phase 2: Build

### Prompt 6: Setup (Step 1)
```
Set up React + Vite + Tailwind with the charcoal + gold theme and React Router. Create empty pages for the 6 screens at the URLs in docs/02-screens.md. Stop when it runs.
```
Result:

### Prompt 7: Storage and queue rules (Step 2)
```
Read docs/03-flows-rules.md. Create one queue module (src/queue/) with the storage layer (localStorage + `storage` event + 2s polling) and ALL queue rules: join, token numbering with daily reset, position, wait time, call next with barber preference, start, done, no-show, cancel, break, and one active spot per phone. Add a React hook so screens re-render when data changes. Put services, barbers and hours in one data file using docs/01-brief.md. No UI work. Then give me 3 quick console tests I can run to prove the rules work.
```
Result:

### Prompt 8: Home and Join (Step 3)
```
Build only Screen 1 (Home) and Screen 2 (Join Queue) from docs/02-screens.md, using the queue module. Validate the 10-digit phone and the 3-service limit. The live summary must update as services are selected. Mobile-first. Don't touch other screens. List changed files and how to test.
```
Result:

### Prompt 9: Early deploy to Vercel
```
Prepare this app for Vercel: check the build command, add vercel.json so refreshing /join or any route doesn't 404, and make sure no localhost URLs remain. Give me step-by-step deploy instructions for my setup.
```
Result:

### Prompt 10: My Status (Step 4)
```
Build only Screen 3 (My Status) from docs/02-screens.md. After Confirm on /join, open /status/:id. Show token, position, estimated wait, and every state: Waiting, "Start coming" banner, full-screen gold "It's your turn!", In chair, Done, Cancelled, No-show, "Spot not found". Add Cancel with a confirm pop-up and the Join again button. Don't touch other screens.
```
Result:

### Prompt 11: Reception (Step 5)
```
Build only Screen 4 (Reception) for a 10-inch landscape tablet from docs/02-screens.md, including + Add walk-in, Call next, No-show, Cancel, Reset demo data and Load demo data. Call next must follow the barber-preference rules exactly. Highlight waits over 60 min in amber. Then give me 3 manual scenarios to prove barber preferences are respected.
```
Result:

### Prompt 12: Barber View and TV (Step 6)
```
Build Screen 5 (Barber View) and Screen 6 (TV display) from docs/02-screens.md. Start, Done and On break must update Reception, TV and My Status within 5 seconds. The newly called token flashes gold for 5 seconds. TV text must be readable from 5 metres. Don't touch other screens.
```
Result:

---

## Phase 3: Verify and polish

### Prompt 13: Test checklist and polish (Step 7)
```
Go through the test checklist in docs/03-flows-rules.md. For each item, report pass/fail and how you checked it. Fix failures without changing the design. Then add friendly empty states (e.g. "No one waiting, walk right in!") and make sure all tap targets are at least 44px on phone.
```
Result:

### Prompt 14: Audit against core features
```
Check the project against the core features in docs/02-screens.md and the core rules in docs/03-flows-rules.md. Ignore these minor items: progress bars, overtime states, timers, the TV flash duration, amber highlights, the Load demo data button, rounding of wait times, and edge cases like double Call next or all barbers on break. Make a short table of Done / Partial / Missing for each item. Don't change code yet. Wait for my OK, then fix only the Partial and Missing ones without touching working parts.
```
Result:

### Prompt 15: Fix missing items
```
Fix all Missing items now, one screen at a time. After each screen, list the changed files and how to test.
```
Result:

---

## Phase 4: Deploy

### Prompt 16: Final deploy and README (Step 8)
```
Prepare the final deployment on Vercel. Make sure README.md starts with the title, then on the very next line **Live demo:** <url>, then a short About section. Confirm the link opens the working app on a phone without any setup.
```
Result:

---

## Phase 5: Bug fixes and tweaks (add yours here, in order)

### Bug template
```
Bug: On [screen], I did [action] and [what happened]. Expected: [what should happen]. Explain the cause first, then fix. Don't touch other screens.
```

### UI tweak template
```
UI tweak: On [screen], [what looks wrong]. Change it to [exact layout, size or colour]. Change nothing else.
```

### Out-of-scope reply (use if the agent adds a "Don't build" feature)
```
Out of scope per docs/01-brief.md. Remove it.
```

### My bug prompts
(Paste each real bug prompt you send below, with the result.)

---

## Reflection notes (for the half-page write-up)
- One thing the agent got wrong:
- How I noticed it:
- How I fixed my prompt or doc:
