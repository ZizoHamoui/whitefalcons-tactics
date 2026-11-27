# White Falcons Tactics

Mobile-first team site for the White Falcons Sunday Div 3 side (4-2-2-2, defend and control).

- **Welcome:** each player picks who they are (starters on a formation pitch, bench players by name, or coach view). The choice is remembered on that device.
- **Defend / Keep it / Final third:** looping animated simulations of each phase. The chosen player is highlighted in amber; bench players see the starter whose slot they cover.
- **Battle cards:** every player's role card (zones with and without the ball, three passing options, match target). Your own card is first.

Plain static HTML, CSS and JavaScript, no build step. Data lives in `js/cards.js` (role cards) and `js/scenarios.js` (simulations).
