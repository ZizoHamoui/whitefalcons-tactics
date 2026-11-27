# White Falcons Tactics

Mobile-first team site for the White Falcons Sunday Div 3 side (4-2-2-2, defend and control).

- **Select the player:** each player picks their name from a dropdown (or coach view), then a short loading screen. The choice is remembered on that device.
- **Defend / Keep it / Final third:** a Tactics view (team shape plus a numbered diagram for each scenario) and a Simulation view that loops the animation. The chosen player is highlighted in amber; bench players see the starter whose slot they cover.
- **Battle cards:** every player's role card (zones with and without the ball, three passing options, match target). Your own card is first.

Plain static HTML, CSS and JavaScript, no build step. Data lives in `js/cards.js` (role cards) and `js/scenarios.js` (simulations).
