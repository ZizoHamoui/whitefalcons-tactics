// Coordinates: 100 x 140 pitch (x 2-98, y 2-138). We attack UP (their goal y=2). One unit is about 0.7 m.
const OURS = ["Dyvane","Taran","Yazan","OG","Noah","Yosof","Farhad","Mehmet","Sherif","Bryce","Sameed"];
const ROLE = {Dyvane:"GK",Taran:"LCB",Yazan:"RCB",OG:"LB",Noah:"RB",Yosof:"6",Farhad:"6",Mehmet:"LM",Sherif:"RM",Bryce:"ST",Sameed:"ST"};
// Passing options exactly as printed on the player role cards.
const ALLOWED = {
  Dyvane:["Taran","Yazan","OG","Noah"], Taran:["Yosof","OG","Yazan"], Yazan:["Farhad","Noah","Taran"],
  OG:["Yosof","Mehmet","Taran"], Noah:["Farhad","Sherif","Yazan"], Yosof:["Mehmet","Sameed","Farhad"],
  Farhad:["Yosof","Sherif","Noah"], Mehmet:["Bryce","Yosof","Sameed"], Sherif:["Sameed","Yosof","Farhad"],
  Sameed:["Bryce","Sherif","Yosof"], Bryce:["Sameed","Mehmet","Yosof"]
};

// ---- team shapes ----
const DEF = {Dyvane:[50,126],OG:[18,104],Taran:[41,104],Yazan:[59,104],Noah:[82,104],Mehmet:[18,82],Yosof:[41,82],Farhad:[59,82],Sherif:[82,82],Bryce:[41,62],Sameed:[59,62]};
const BUILD = {Dyvane:[50,122],Taran:[38,102],Yazan:[62,102],OG:[18,98],Noah:[82,98],Yosof:[41,80],Farhad:[59,80],Mehmet:[18,76],Sherif:[82,76],Bryce:[41,62],Sameed:[59,62]};
const FT = {Dyvane:[50,118],Taran:[38,92],Yazan:[62,92],OG:[18,86],Noah:[82,86],Yosof:[44,47],Farhad:[59,63],Mehmet:[20,34],Sherif:[80,34],Bryce:[41,30],Sameed:[58,36]};

const OPP_ATT   = {o1:[50,42],o2:[12,64],o3:[37,54],o4:[63,54],o5:[88,64],o6:[14,74],o7:[38,70],o8:[62,70],o9:[86,74],o10:[36,92],o11:[64,92]};
const OPP_MID   = {o1:[50,8],o2:[16,36],o3:[38,34],o4:[62,34],o5:[84,36],o6:[14,54],o7:[36,50],o8:[64,50],o9:[86,54],o10:[42,76],o11:[58,76]};
const OPP_PRESS = {o1:[50,12],o2:[16,44],o3:[38,42],o4:[62,42],o5:[84,44],o6:[14,62],o7:[36,56],o8:[64,56],o9:[86,62],o10:[40,92],o11:[60,90]};
const OPP_LOW   = {o1:[50,6],o2:[14,26],o3:[38,25],o4:[62,25],o5:[86,26],o6:[12,42],o7:[39,42],o8:[61,42],o9:[88,42],o10:[44,56],o11:[56,56]};

const TABS = [
{ id:"without-ball", name:"Without the ball", view:[0,-4,100,148],
  goal:"Defend.", goalText:"Keep the block compact, deny the shot, and win it when they make a mistake.",
  scenarios:[
  { id:"shape", name:"Hold the shape", trigger:"They switch the play and probe the pocket in front of our 6s.",
    coach:"The block moves as one unit and nobody chases the ball. The strikers cut the pass back, the 6s screen, and Noah wins it on the touchline when their winger over-runs it.",
    result:{text:"Ball won back. No shot conceded.",kind:"good"},
    setup:{ours:DEF,opp:OPP_ATT,ball:"o3"},
    steps:[
    {b:["pass","o3","o4"],t:"They switch the play to our right. We shift six units across as one block. The strikers stay on the half line and cut the pass into their 6s.",
     m:{Bryce:[47,62],Sameed:[65,62],Mehmet:[24,82],Yosof:[47,82],Farhad:[65,82],Sherif:[88,82],OG:[24,104],Taran:[47,104],Yazan:[65,104],Noah:[88,104],Dyvane:[54,126],o7:[44,70],o8:[68,70],o10:[42,92],o11:[70,92]}},
    {b:["pass","o4","o8"],t:"Forward into the pocket. Farhad steps up to screen and stays on his feet. Sameed shuts the pass back. Yosof covers inside.",
     m:{Farhad:[67,77],Sameed:[64,66],Yosof:[53,80],Bryce:[52,64],Taran:[49,104],Yazan:[66,104],o4:[63,58],o9:[90,78],o5:[92,70]}},
    {b:["pass","o8","o9"],t:"Wide again. Sherif tucks in and shows the winger down the line. Farhad drops back into the line. Noah stays goal-side.",
     m:{Sherif:[84,80],Farhad:[64,82],Noah:[88,100],Yazan:[66,103],Mehmet:[30,82],Yosof:[50,82],o8:[66,74]}},
    {b:["carry","o9"],t:"He drives at us. Sherif cuts off the inside lane, Noah holds goal-side and waits. Nobody dives in. Farhad covers behind Sherif.",
     m:{o9:[86,90],Sherif:[82,86],Noah:[86,98],Farhad:[74,86],Yazan:[68,103],Yosof:[58,84],o11:[72,98]}},
    {b:["tackle","o9","Noah"],t:"He takes it too close to the line. Noah steps in and wins it. Pounce.",h:350,
     m:{o9:[90,92],Noah:[86,94],Sherif:[84,86],Farhad:[72,86],Yosof:[60,84],Yazan:[66,104]}},
    {b:["pass","Noah","Farhad"],t:"Safe pass first, inside to Farhad's feet. Nothing lost in our half. The strikers show to give an outlet.",
     m:{Farhad:[70,84],Bryce:[50,60],Sameed:[66,62],Noah:[86,98],Yazan:[64,103],o9:[88,86],o8:[62,68],o11:[66,88]}}
    ]},
  { id:"wide", name:"Wide threat and a cross", trigger:"Their winger beats the first man down our left and crosses.",
    coach:"OG holds his ground and shows the winger to the line. The centre-backs take their men goal-side, Taran wins first contact, and Dyvane stays on his line for crosses.",
    result:{text:"Cross defended. No shot conceded.",kind:"good"},
    setup:{ours:DEF,opp:OPP_ATT,ball:"o7"},
    steps:[
    {b:["pass","o7","o6"],t:"They go long to their winger on our left. We shift left as a block. OG stays goal-side, Mehmet and Yosof squeeze across.",
     m:{o6:[14,78],o2:[12,68],Bryce:[35,62],Sameed:[53,62],Mehmet:[20,82],Yosof:[35,82],Farhad:[53,82],Sherif:[76,82],OG:[20,104],Taran:[35,104],Yazan:[53,104],Noah:[76,104],Dyvane:[46,126]}},
    {b:["carry","o6"],t:"He runs at OG. OG holds his ground and shows him to the line. Mehmet tracks back and Yosof slides over.",
     m:{o6:[13,92],OG:[21,100],Mehmet:[21,88],Yosof:[30,86],Farhad:[48,84],Taran:[36,105],o10:[32,98],o11:[48,100],o9:[78,86],o7:[36,74],o8:[52,70]}},
    {b:["pass","o6","Taran"],t:"The cross comes in. Taran gets there first and heads it. Yazan marks the second striker and Noah covers the back post. Dyvane stays on his line.",
     m:{o6:[12,100],Taran:[38,104],o10:[43,100],o11:[52,102],Yazan:[54,106],Noah:[70,104],o9:[74,96],Dyvane:[47,125],OG:[22,102],Mehmet:[24,92]}},
    {b:["pass","Taran","Yosof"],t:"Cleared to Yosof, who is free. Everyone steps out together so there is no gap for a second ball.",
     m:{Yosof:[32,88],Mehmet:[22,92],OG:[22,98],Farhad:[46,86],Sameed:[48,66],Bryce:[34,64],Taran:[38,106],o10:[36,96],o11:[50,98],o6:[14,92],o7:[34,78]}},
    {b:["pass","Yosof","Farhad"],t:"Yosof passes sideways to Farhad. Danger over, no shot conceded, and we are back in shape with the ball.",
     m:{Farhad:[46,86],Mehmet:[26,84],Sherif:[70,82],Noah:[64,100],Yazan:[52,104],OG:[24,100],o6:[16,88]}}
    ]},
  { id:"sweep", name:"Ball over the top", trigger:"Their midfielder looks up and their striker pulls onto Taran's shoulder.",
    coach:"The back four drops and delays instead of stepping up. Dyvane's strength is reading the ball early and sweeping, so we use it. He clears wide with his feet, never a catch.",
    result:{text:"Danger cleared by the sweeper. No shot.",kind:"good"},
    setup:{ours:DEF,opp:OPP_ATT,ball:"o7"},
    steps:[
    {b:["carry","o7"],t:"Their striker pulls onto Taran's shoulder. The back four drops a step to stay level. Nobody steps up and gets caught.",
     m:{o7:[40,76],o10:[34,100],Taran:[41,107],Yazan:[59,107],OG:[19,106],Noah:[81,106],Dyvane:[50,124],o11:[66,96]}},
    {b:["pass","o7","Dyvane"],t:"Ball over the top. Dyvane reads it early, comes out and gets there first. Taran recovers and Yazan covers.",sp:["o10","Dyvane","Taran"],
     m:{o10:[46,110],Dyvane:[48,114],Taran:[40,112],Yazan:[57,110],OG:[24,108],Noah:[76,108],Farhad:[58,86]}},
    {b:["pass","Dyvane","Noah"],t:"He clears wide to Noah, away from the pressure. A foot, never a catch. That is not his game, and he plays to his strengths.",
     m:{Noah:[82,104],o10:[44,118],Taran:[44,108],Yazan:[58,106],Mehmet:[22,86],Sherif:[80,84]}},
    {b:["pass","Noah","Farhad"],t:"Noah plays inside to Farhad and the block steps out together. Danger cleared by the sweeper, no shot conceded.",
     m:{Farhad:[62,86],Yosof:[48,82],OG:[20,102],Taran:[42,104],Yazan:[60,104],Sherif:[80,80],o10:[46,100],o7:[40,72]}}
    ]},
  { id:"recover", name:"We lose it up the pitch", trigger:"Sherif's pass is cut out at the edge of their box and they break.",
    coach:"Five seconds, every time. The wide mids sprint back, the 6s screen, and the back four holds the line. No one dives in. We finish with nine outfielders behind the half line.",
    result:{text:"Counter stopped. No shot conceded.",kind:"good"},
    setup:{ours:FT,opp:OPP_LOW,ball:"Sherif"},
    steps:[
    {b:["pass","Sherif","o8"],t:"Our pass is cut out at the edge of their box. Sherif and Sameed press for a moment while everyone else starts to drop.",
     m:{o8:[64,40],Sherif:[76,40],Sameed:[58,40],Mehmet:[22,42],Yosof:[47,52],Farhad:[58,66],Bryce:[41,34],o7:[44,44],o11:[58,54]}},
    {b:["pass","o8","o11"],t:"They counter fast, forward to their striker. Mehmet and Sherif sprint back, Yosof drops and Farhad steps back to screen.",sp:["Mehmet","Sherif","Sameed","Yosof"],
     m:{o11:[58,58],Farhad:[58,72],Yosof:[50,66],Mehmet:[24,60],Sherif:[74,58],Sameed:[56,50],Bryce:[44,48],OG:[18,88],Noah:[82,88],Taran:[38,94],Yazan:[62,94]}},
    {b:["carry","o11"],t:"He turns and runs at us. Farhad jockeys, giving ground. Yosof comes across to pinch. The back four holds the line.",sp:["Mehmet","Sherif","Sameed"],
     m:{o11:[58,68],Farhad:[58,76],Yosof:[52,72],Mehmet:[28,74],Sherif:[72,72],Sameed:[57,62],Bryce:[44,60],Noah:[82,90],OG:[18,90],Taran:[40,98],Yazan:[60,98],o10:[46,70],o9:[86,64]}},
    {b:["tackle","o11","Yosof"],t:"Farhad shows him one way, Yosof closes the other and wins it. No shot conceded.",h:350,
     m:{o11:[60,72],Yosof:[53,73],Farhad:[60,78],Mehmet:[30,78],Sherif:[70,76],Sameed:[58,66],o10:[48,74]}},
    {b:["pass","Yosof","Farhad"],t:"Won, and straight back into shape. A safe pass to Farhad, then we rebuild from there.",
     m:{Farhad:[60,80],Mehmet:[22,82],Sherif:[78,80],Bryce:[44,62],Sameed:[58,64],Noah:[82,100],OG:[18,100],o11:[62,70],o10:[48,70]}}
    ]}
  ]},

{ id:"with-ball", name:"With the ball", view:[0,-4,100,148],
  goal:"Keep it.", goalText:"Pass sideways or forward, never lose it in our half, and hold the ball in their half.",
  scenarios:[
  { id:"left", name:"Build down the left", trigger:"Their striker closes Taran, so Yosof is shadowed and Taran takes option 2.",
    coach:"Every pass is one of the three options on the role card. OG goes inside to Yosof, the safest way up. Mehmet drags their winger, Bryce holds it, Sameed links.",
    result:{text:"Seven passes, none lost. Ball held in their half.",kind:"good"},
    setup:{ours:BUILD,opp:OPP_MID,ball:"Dyvane"},
    steps:[
    {b:["pass","Dyvane","Taran"],t:"Dyvane starts short to Taran. Their striker closes Taran and shadows Yosof, so Taran does not force the 6.",
     m:{Taran:[38,100],Dyvane:[50,120],OG:[18,95],Noah:[82,96],Yosof:[40,82],Farhad:[59,79],Mehmet:[18,74],o10:[40,90],o11:[57,82],o7:[40,55]}},
    {b:["pass","Taran","OG"],t:"Option 2: Taran plays wide to OG. OG controls it and waits for support.",
     m:{OG:[18,93],Taran:[38,98],Mehmet:[18,68],Yosof:[38,78],o10:[30,92],o6:[15,70],o7:[38,60]}},
    {b:["pass","OG","Yosof"],t:"OG goes inside to Yosof, the safest way up. OG steps up to the bottom of zone 7 and stops there, behind the ball.",
     m:{OG:[18,89],Mehmet:[18,62],Yosof:[38,78],Farhad:[58,76],Bryce:[40,56],Sameed:[58,56],o10:[28,86],o7:[38,62],o6:[16,68]}},
    {b:["pass","Yosof","Mehmet"],t:"Yosof plays wide to Mehmet. Their winger has to come out to him, which pulls their block to the left.",
     m:{Mehmet:[20,60],Yosof:[41,72],Farhad:[59,72],Bryce:[40,50],Sameed:[58,52],Sherif:[80,66],o6:[16,62],o7:[36,60],o2:[16,44]}},
    {b:["pass","Mehmet","Bryce"],t:"Mehmet finds Bryce's feet. Bryce holds it up, back to goal, while the others come forward.",
     m:{Bryce:[40,46],Sameed:[56,44],Yosof:[44,64],Farhad:[59,66],Mehmet:[22,54],Sherif:[80,52],o3:[40,38],o7:[40,56]}},
    {b:["pass","Bryce","Sameed"],t:"Bryce lays it off to Sameed, a step behind him. We are in their half now. Hold it here.",
     m:{Sameed:[56,40],Mehmet:[20,46],Sherif:[80,46],Yosof:[44,56],Farhad:[59,63],Bryce:[40,42],o8:[58,48]}},
    {b:["pass","Sameed","Sherif"],t:"Sameed switches to Sherif. The ball moves across their half and nobody rushes.",
     m:{Sherif:[80,40],Mehmet:[20,40],Bryce:[42,32],Yosof:[44,50],Farhad:[59,62],Sameed:[56,36],o9:[84,46],o8:[56,46]}}
    ]},
  { id:"right", name:"Build down the right", trigger:"Their strikers sit off, so Yazan has time to play the vertical pass to Farhad.",
    coach:"Farhad is the hub. Noah steps to the bottom of zone 9 only after the ball has gone past him. Sherif and Sameed work the one-two, and Sherif is always available for the return.",
    result:{text:"Six passes, none lost. One-two completed.",kind:"good"},
    setup:{ours:BUILD,opp:OPP_MID,ball:"Dyvane"},
    steps:[
    {b:["pass","Dyvane","Yazan"],t:"Dyvane starts to Yazan. Their strikers stay off, so Yazan has time. Farhad shows in front of him.",
     m:{Yazan:[62,100],Noah:[82,96],Farhad:[60,78],Sherif:[82,74],Dyvane:[50,120],o11:[58,82],o8:[60,54],o10:[44,84]}},
    {b:["pass","Yazan","Farhad"],t:"Yazan plays the vertical pass to Farhad. He receives on the half-turn, facing forward.",
     m:{Farhad:[60,76],Yazan:[62,98],Noah:[82,92],Sherif:[82,68],Yosof:[44,76],Sameed:[58,58],Mehmet:[18,64],o8:[62,64],o11:[62,82]}},
    {b:["pass","Farhad","Sherif"],t:"Farhad plays wide to Sherif. Noah steps up to the bottom of zone 9, behind the ball. Sameed drops to be the one-two partner.",
     m:{Sherif:[82,64],Noah:[82,89],Farhad:[60,72],Sameed:[60,54],Bryce:[42,52],Mehmet:[20,56],o9:[86,58],o5:[86,42],o8:[64,58]}},
    {b:["pass","Sherif","Sameed"],t:"Sherif plays into Sameed and moves. He is the one-two partner, always available for the return.",
     m:{Sameed:[60,52],Sherif:[82,56],Bryce:[42,46],Yosof:[46,66],Farhad:[60,68],Mehmet:[20,50],o8:[64,56],o4:[62,36]}},
    {b:["pass","Sameed","Sherif"],t:"Sameed gives it straight back into Sherif's run. The one-two takes out their winger.",sp:["Sherif"],
     m:{Sherif:[82,46],Sameed:[58,48],Bryce:[42,42],Mehmet:[22,46],o9:[84,52],o5:[84,40],Farhad:[60,66]}},
    {b:["pass","Sherif","Sameed"],t:"Sherif plays it inside to Sameed. We keep the ball in their half and wait for the gap. No hurry.",
     m:{Sameed:[58,42],Sherif:[80,44],Mehmet:[22,40],Yosof:[46,56],Farhad:[60,64],Bryce:[42,36],o8:[62,46]}}
    ]},
  { id:"press", name:"Beat the press", trigger:"Their strikers press high and jump on Taran as soon as he gets it.",
    coach:"One touch, sideways. Pressure on one side opens space on the other. We never go back to the keeper and never force the 6. The left opens up because they pressed right.",
    result:{text:"Press beaten. Seven passes, none lost.",kind:"good"},
    setup:{ours:BUILD,opp:OPP_PRESS,ball:"Dyvane"},
    steps:[
    {b:["pass","Dyvane","Taran"],t:"Their striker jumps on Taran as soon as he gets it. Yosof's lane is shadowed, so Taran does not force it.",
     m:{Taran:[38,102],o10:[38,96],o11:[56,96],Yazan:[62,102],OG:[18,98],Noah:[82,98],Farhad:[58,84],Yosof:[42,84]}},
    {b:["pass","Taran","Yazan"],t:"Taran switches to Yazan before the press lands. One touch, sideways. Their strikers are now on the wrong side.",
     m:{o10:[48,100],o11:[58,98],Noah:[82,98],Farhad:[62,86],Sherif:[82,74],Dyvane:[50,118]}},
    {b:["pass","Yazan","Noah"],t:"Yazan plays to Noah. Their winger sprints to press him. Farhad shows inside.",sp:["o9"],
     m:{Noah:[82,98],o9:[84,88],o11:[68,100],Farhad:[66,86],Sherif:[82,76],Yazan:[62,102]}},
    {b:["pass","Noah","Farhad"],t:"Noah goes inside to Farhad, past the winger who just pressed him. That press is beaten.",
     m:{Farhad:[66,84],Noah:[82,94],o9:[87,89],o8:[62,68],Sherif:[82,70],Yosof:[46,82]}},
    {b:["pass","Farhad","Yosof"],t:"Farhad swings it to Yosof. Their two strikers and their winger are all on the right now. The left is open.",
     m:{Yosof:[46,82],Mehmet:[18,66],Sherif:[82,68],Bryce:[42,60],Sameed:[58,58],o10:[52,98],o11:[66,98],o7:[34,60]}},
    {b:["pass","Yosof","Mehmet"],t:"Yosof plays forward to Mehmet, who is free. Space opened on the left because they pressed right.",
     m:{Mehmet:[18,64],OG:[18,90],Yosof:[44,76],Farhad:[64,80],Bryce:[40,50],Sameed:[58,52],o6:[16,68]}},
    {b:["pass","Mehmet","Bryce"],t:"Mehmet plays into Bryce. We are through their press and in their half.",
     m:{Bryce:[40,46],Sameed:[56,44],Mehmet:[20,54],Yosof:[44,64],Farhad:[62,72],Sherif:[80,52],o3:[42,38],o7:[34,58]}}
    ]}
  ]},

{ id:"final-third", name:"Final third", view:[0,-4,100,106],
  goal:"Create the chance.", goalText:"Combine between the lines, break the back line and get a clean shot. Strikers hold the shoulder of the line, then run into the box.",
  scenarios:[
  { id:"one-two", name:"Sherif and Sameed one-two", trigger:"Farhad plays into Yosof and the right side opens up.",
    coach:"Sameed drops between the lines, Sherif holds the width, then they swap passes. Sherif gets in behind and cuts it back, so Sameed takes the shot from the spot, not Sherif from the wing. Bryce takes a centre-back to the near post.",
    result:{text:"GOAL. Sameed finishes the cut-back.",kind:"goal"},
    setup:{ours:FT,opp:OPP_LOW,ball:"Farhad"},
    steps:[
    {b:["pass","Farhad","Yosof"],t:"Farhad plays into Yosof, who turns. Everyone around him shows: Sameed drops, Sherif holds the width.",
     m:{Sameed:[60,38],Sherif:[80,36],Mehmet:[24,34],Bryce:[42,30],o10:[46,52],o7:[41,43],Farhad:[59,62]}},
    {b:["pass","Yosof","Sameed"],t:"Yosof plays through the lines to Sameed, who receives between their mids and their back four.",
     m:{o8:[60,43],o4:[62,29],Sherif:[78,34],Bryce:[44,28],Mehmet:[26,33],Yosof:[44,45]}},
    {b:["pass","Sameed","Sherif"],t:"Sameed lays it wide to Sherif and moves. Pass and move, so he is available for the return.",
     m:{Sherif:[80,34],Sameed:[64,32],o9:[84,38],o5:[84,28],Bryce:[46,26],Mehmet:[30,30]}},
    {b:["pass","Sherif","Sameed"],t:"Sherif plays it straight back to Sameed's feet, then sprints past the full-back.",sp:["Sherif"],
     m:{Sameed:[66,31],Sherif:[84,26],o5:[86,32],o9:[84,36],Bryce:[48,22],Mehmet:[34,28]}},
    {b:["pass","Sameed","Sherif"],t:"Sameed flicks it first-time into Sherif's run behind the full-back. Sherif is in the box now, not shooting from the wing.",sp:["Sherif","Bryce"],
     m:{Sherif:[78,16],Sameed:[64,26],Bryce:[50,14],o5:[84,22],o4:[62,22],o3:[44,20],Mehmet:[40,24]}},
    {b:["pass","Sherif","Sameed"],t:"Sherif looks up and cuts it back to Sameed, who arrives late at the penalty spot. Bryce holds the near post and drags a defender.",sp:["Sameed","Bryce"],
     m:{Sameed:[58,17],Bryce:[48,11],Mehmet:[40,22],o4:[66,20],o3:[44,16],Sherif:[78,14]}},
    {b:["shot","Sameed",[46.5,1.5],"goal"],t:"Sameed takes it first time from the spot, low into the far corner. Goal.",h:1100,sp:["Bryce","Mehmet"],
     m:{o1:[54,5],Bryce:[50,8],Sherif:[72,12],Mehmet:[38,20],Yosof:[46,40],Farhad:[59,58]}}
    ]},
  { id:"give-go", name:"Mehmet and Bryce give-and-go", trigger:"Yosof plays out to Mehmet and Bryce drops to meet it.",
    coach:"Bryce holds it up with his back to goal and lays it off into Mehmet's run. Sameed arrives late for the cut-back. Farhad, Yosof and the back four stay as rest defence.",
    result:{text:"Chance created, saved. Sherif waits at the back post.",kind:"neutral"},
    setup:{ours:FT,opp:OPP_LOW,ball:"Yosof"},
    steps:[
    {b:["pass","Yosof","Mehmet"],t:"Yosof plays out to Mehmet, who takes it in the pocket. Bryce shows to feet.",
     m:{Mehmet:[22,38],Bryce:[38,31],Sameed:[56,34],Sherif:[78,36],o6:[16,42],o2:[16,30],Farhad:[59,62]}},
    {b:["pass","Mehmet","Bryce"],t:"Mehmet plays it to Bryce's feet. Bryce holds it up, back to goal, with their centre-back on his back.",
     m:{Bryce:[40,32],o3:[40,28],o7:[36,40],Mehmet:[24,34],Sameed:[54,30],Sherif:[78,32]}},
    {b:["pass","Bryce","Mehmet"],t:"Bryce lays it back into Mehmet's run, a give-and-go. Mehmet sprints past their full-back.",sp:["Mehmet"],
     m:{Mehmet:[24,22],o2:[18,26],Bryce:[42,26],Sameed:[54,24],Sherif:[74,28],o3:[44,21]}},
    {b:["pass","Mehmet","Sameed"],t:"Mehmet cuts it back along the six-yard line. Sameed arrives late at the penalty spot, Bryce takes the near post and Sherif the back post.",sp:["Sameed","Bryce","Sherif"],
     m:{Sameed:[52,17],Bryce:[44,10],Sherif:[72,16],o4:[56,18],o3:[44,16],Mehmet:[26,14]}},
    {b:["shot","Sameed",[53,2],"save"],t:"Sameed hits it first time. Their keeper gets down and saves it. Farhad, Yosof and the back four never moved, so there is no break.",h:1100,
     m:{o1:[52,4],Yosof:[46,40],Farhad:[59,58],Sherif:[72,14],Bryce:[46,9],Mehmet:[28,16]}}
    ]},
  { id:"pounce", name:"Pounce on a mistake", trigger:"Their 6 plays a lazy square pass in the middle.",
    coach:"We do not chase. Yosof reads the pass, steps in and wins it. Sameed turns, Bryce times his run to stay onside, and Bryce places the finish. Guide it in.",
    result:{text:"GOAL. Bryce places it past the keeper.",kind:"goal"},
    setup:{ours:FT,opp:OPP_LOW,ball:"o8"},
    steps:[
    {b:["pass","o8","Yosof"],t:"Their 6 plays a lazy square pass. Yosof reads it and steps across to cut it out.",
     m:{Yosof:[50,43],Farhad:[58,60],Sherif:[78,32],Mehmet:[22,32],o7:[41,42],o8:[61,44]}},
    {b:["pass","Yosof","Sameed"],t:"Yosof plays it forward to Sameed, who receives on the turn. Their centre-back jumps out to him.",
     m:{Sameed:[56,36],o4:[60,31],Bryce:[43,29],Yosof:[48,43],Sherif:[78,31],Mehmet:[24,30]}},
    {b:["pass","Sameed","Bryce"],t:"Their centre-back stepped out, so there is space behind. Sameed plays it in behind and Bryce, timing the run to stay onside, is clear.",sp:["Bryce","o1"],
     m:{Bryce:[46,14],o3:[42,22],o4:[58,28],o1:[51,9],Sameed:[56,34],Mehmet:[32,24],Sherif:[70,24]}},
    {b:["shot","Bryce",[45.8,1.5],"goal"],t:"Bryce goes one-on-one. He places it low into the far corner past the keeper. Goal.",h:1100,sp:["Sameed"],
     m:{o1:[53,5],Sameed:[56,20],Sherif:[68,18],Mehmet:[36,18]}}
    ]},
  { id:"switch", name:"Switch to the far side", trigger:"They shift to our left, which leaves Sherif free on the far side.",
    coach:"Move the block with passes on one side, then switch. Not every chance scores. When it goes wide the shape behind the ball never broke, so there is no counter.",
    result:{text:"Chance created, just wide. Shape intact.",kind:"neutral"},
    setup:{ours:FT,opp:OPP_LOW,ball:"Noah"},
    steps:[
    {b:["pass","Noah","Farhad"],t:"Noah plays inside to Farhad. Their block starts to shift toward the ball.",
     m:{Farhad:[62,64],Noah:[82,86],Sherif:[80,36],Yosof:[46,48],Mehmet:[24,36],o8:[56,43],o7:[36,42],o10:[46,56]}},
    {b:["pass","Farhad","Yosof"],t:"Farhad passes forward to Yosof, who draws their striker in. We are moving the block with the ball.",
     m:{Yosof:[46,48],Farhad:[62,62],o10:[44,52],o7:[34,42],o6:[18,42],o2:[16,28],Mehmet:[24,35]}},
    {b:["pass","Yosof","Mehmet"],t:"Yosof plays to Mehmet on the left. Their whole block slides toward the left side.",
     m:{Mehmet:[22,36],o6:[18,40],o7:[32,42],o8:[50,42],o9:[76,42],o5:[78,28],o4:[56,26],o3:[34,26]}},
    {b:["pass","Mehmet","Sameed"],t:"Mehmet plays inside to Sameed, who drifts centrally. Now they are crowded on the left.",
     m:{Sameed:[48,34],Bryce:[40,28],o8:[46,42],o9:[72,42],o4:[52,26],Sherif:[82,30]}},
    {b:["pass","Sameed","Sherif"],t:"The block shifted left. Sameed switches it to Sherif, free on the far side with time to take it forward.",sp:["Sherif"],
     m:{Sherif:[80,32],o5:[78,28],o9:[80,38],Bryce:[44,24],Mehmet:[28,34],Sameed:[50,32]}},
    {b:["carry","Sherif"],t:"Sherif does not shoot from there. He drives into the box and their full-back has to back off. Bryce and Sameed attack the near post and the spot.",sp:["Bryce","Sameed"],
     m:{Sherif:[68,18],o5:[76,24],o9:[78,32],Bryce:[46,14],Sameed:[56,20],Mehmet:[30,32],o4:[60,20],o3:[42,20]}},
    {b:["shot","Sherif",[43,-1],"wide"],t:"From inside the box Sherif strikes it across goal, just past the far post. A good chance, not a goal. The shape behind him never broke, so there is no counter.",h:1100,
     m:{o1:[48,5],Farhad:[60,62],Yosof:[46,46],Bryce:[48,12],Sameed:[56,22],Mehmet:[34,28]}}
    ]}
  ]}
];
