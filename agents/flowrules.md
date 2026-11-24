# Flows & Rules

## Flow: remote customer
1. Opens Home, taps Join, picks Haircut + "Any barber", gets token S-14 at 6th place.
2. Watches My Status from home. At 2nd in line, gets "Start coming".
3. Receptionist taps [ Call next ] on Amit's card. S-14 becomes Called.
4. Customer's phone shows "It's your turn! Go to Amit". TV flashes S-14.
5. Amit taps Start, then Done. S-14 leaves the queue.

## Flow: walk-in
Receptionist taps + Add walk-in, enters name, phone, services, barber.
Customer joins the same queue at the end (first come, first served).

## Statuses
Waiting -> Called -> In chair -> Done. Never backwards.
Waiting -> Cancelled. Called -> No-show.

## Rules
1. First come, first served. Order is by join time.
2. Call next for barber X picks the earliest Waiting customer who chose X or "Any".
3. A customer who chose Ravi is never given to another barber.
4. A barber has only one customer (Called or In chair) at a time.
5. Call next is only available for a Free barber who is on duty and not on break.
6. Waiting time ≈ total minutes of services ahead ÷ number of working barbers
   (on duty, not on break). Round up to the nearest 5 min. Minimum 0.
7. Token numbers are sequential per day (S-1, S-2…) and never reused.
8. One active spot per phone number (Waiting, Called, or In chair). A second attempt
   shows the existing spot.
9. Called but not arrived within 10 min: receptionist can mark No-show.
   If they arrive later, they are added again at the END with a new token.
10. Customers can cancel only while Waiting.
11. Online joining closes 30 min before closing time; walk-ins are still allowed.
12. Owner closing the queue stops online joining only; existing customers stay in the queue.
13. Barber on break: customers who chose that barber see "Ravi is on break".
    They stay in the queue and are not reassigned.
14. Turning off a service hides it from Join; customers already waiting keep it.
15. All queue logic lives in ONE module and is reused by every screen.
16. Any change appears on all screens within 5 seconds.

## Edge cases
- Two receptionists press Call next at once: only one succeeds; the other sees "Already called".
- All barbers on break: wait time shows "Waiting for a barber".
- Customer's phone loses connection: shows "Reconnecting…" and refreshes on return.
- Invalid status id in URL: "Spot not found".

## Test checklist
[ ] Join with 2 services -> correct total time and price shown
[ ] More than 3 services cannot be selected
[ ] Invalid phone (not 10 digits) is rejected
[ ] Same phone joins twice -> shown existing spot, no duplicate
[ ] Call next for Amit skips a customer who chose Ravi
[ ] Call next -> customer's phone shows "It's your turn" within 5 s
[ ] Start/Done on Barber View updates Reception and TV
[ ] No-show, then re-add -> goes to end of queue with a new token
[ ] Cancel from My Status removes the customer from Reception
[ ] Barber on break -> Ravi's customers see "Ravi is on break"
[ ] Close online queue -> Join button disabled with message
[ ] Turn off a service -> hidden from Join
[ ] Language toggle switches all labels to Gujarati
[ ] Waiting time goes down as customers finish
[ ] Phone, tablet and TV windows all stay in sync
[ ] Staff screens ask for the PIN
