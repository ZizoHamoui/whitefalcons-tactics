// White Falcons Tactics: player select, loading screen, tactics / simulation views, battle cards.
(function(){
"use strict";
const NS = "http://www.w3.org/2000/svg";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const C = CARDDATA, CARD = {};
C.CARDS.forEach(c => CARD[c.id] = c);
const STARTERS = C.CARDS.filter(c => !c.bench);
const BENCH = C.CARDS.filter(c => c.bench);
const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
};
const shortRole = c => c.role.split("·")[0].trim();
const nick = c => c.id === "OG" ? "OG" : c.name.split(" ")[0];
const YOU = "#D7263D", US = "#3B5BA9", THEM = "#C3CAD8", INK = "#0E1626";

// ---------- who am I ----------
let me = store.get("wf-player");
if (me && me !== "coach" && !CARD[me]) me = null;
const focus = () => (me && me !== "coach") ? CARD[me].slot : null;

function meLabel(){
  if (me === "coach") return "Coach view";
  const c = CARD[me]; return nick(c) + " · " + (c.bench ? "Bench" : shortRole(c));
}

// ---------- select the player ----------
function buildSelect(){
  const s = $("#playerSel");
  let h = '<option value="" disabled selected>Choose your name</option><optgroup label="Players">';
  STARTERS.concat(BENCH).forEach(c => h += `<option value="${c.id}">${esc(c.name)} · ${esc(c.bench ? shortRole(CARD[c.slot]) : shortRole(c))}</option>`);
  h += '</optgroup><optgroup label="Staff"><option value="coach">Coach view (no highlight)</option></optgroup>';
  s.innerHTML = h;
  s.onchange = () => { s.classList.toggle("empty", !s.value); $("#goBtn").disabled = !s.value; };
  $("#goBtn").onclick = () => { if (s.value) chooseAndLoad(s.value); };
}
function openWelcome(){
  const s = $("#playerSel");
  if (me){ s.value = me; s.classList.remove("empty"); $("#goBtn").disabled = false; }
  else { s.selectedIndex = 0; s.classList.add("empty"); $("#goBtn").disabled = true; }
  $("#welcome").hidden = false; document.body.style.overflow = "hidden";
}
function chooseAndLoad(v){
  me = v; store.set("wf-player", v);
  $("#welcome").hidden = true;
  const L = $("#loading"), bar = $("#loadBar");
  $("#loadTitle").textContent = v === "coach" ? "Loading the coach view" : `Getting ${nick(CARD[v])}'s match plan ready`;
  $("#loadSub").textContent = v === "coach" ? "All players, all scenarios" : (CARD[v].bench ? `Your slot: ${CARD[v].slot}. Zones, passes and scenarios` : "Your zones, passing options and scenarios");
  L.classList.remove("fade"); L.hidden = false; bar.style.width = "0";
  $("#meName").textContent = meLabel();
  buildPitch(); renderCards(); enterView(view, true);
  const wait = reduce ? 300 : 1650;
  requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = "100%"; }));
  setTimeout(() => { L.classList.add("fade"); setTimeout(() => { L.hidden = true; document.body.style.overflow = ""; }, reduce ? 0 : 350); }, wait);
}
$("#meBtn").onclick = openWelcome;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#welcome").hidden && me){ $("#welcome").hidden = true; document.body.style.overflow = ""; } });

// ---------- shared pitch drawing ----------
const COLX = [2,34,66,98], ROWY = [138,115.333,92.667,70,47.333,24.667,2];
const cell = n => { const c = (n-1)%3, r = Math.floor((n-1)/3)+1; return [COLX[c], ROWY[r], 32, +(ROWY[r-1]-ROWY[r]).toFixed(3)]; };
const zoneOf = (x, y) => { const c = x < 34 ? 0 : x < 66 ? 1 : 2; let r = 1; for (let k = 1; k <= 6; k++) if (y <= ROWY[k-1] && y >= ROWY[k]) { r = k; break; } return (r-1)*3 + c + 1; };
const TAGCOL = {forward:"#8FB8FF", sideways:"#FFFFFF", back:"#FFB3BC", opp:"#C3CAD8", cut:"#8FB8FF", lost:"#FF5A6E", won:"#8FB8FF", goal:"#FF5A6E", saved:"#8FB8FF", wide:"#FFFFFF"};
function baseSvg(withNums){
  let s = `<rect x="-5" y="-10" width="110" height="162" fill="#1D6446"/>`;
  for (let i = 0; i < 12; i += 2) s += `<rect x="2" y="${2+i*(136/12)}" width="96" height="${136/12}" fill="#FFFFFF" fill-opacity=".045"/>`;
  s += `<g fill="none" stroke="#FFFFFF" stroke-opacity=".18" stroke-width=".35">`;
  for (let n = 1; n <= 18; n++){ const [x,y,w,h] = cell(n); s += `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`; }
  s += `</g>`;
  if (withNums) for (let n = 1; n <= 18; n++){ const [x,y] = cell(n); s += `<text x="${x+2}" y="${y+4.4}" font-size="3.2" font-weight="700" fill="#FFFFFF" fill-opacity=".35" font-family="Barlow, sans-serif">${n}</text>`; }
  s += `<g fill="none" stroke="#FFFFFF" stroke-opacity=".6" stroke-width=".55"><rect x="2" y="2" width="96" height="136"/><circle cx="50" cy="70" r="12"/><rect x="21.5" y="2" width="57" height="22.4"/><rect x="21.5" y="115.6" width="57" height="22.4"/><rect x="37" y="2" width="26" height="7.5"/><rect x="37" y="130.5" width="26" height="7.5"/><path d="M39.5 24.4 A12 12 0 0 0 60.5 24.4"/><path d="M39.5 115.6 A12 12 0 0 1 60.5 115.6"/></g>`;
  s += `<g fill="#FFFFFF" fill-opacity=".16" stroke="#FFFFFF" stroke-width=".7"><rect x="44.8" y="-1.2" width="10.4" height="3.2"/><rect x="44.8" y="138" width="10.4" height="3.2"/></g>`;
  s += `<line x1="2" y1="70" x2="98" y2="70" stroke="#B9CCF7" stroke-width=".9" stroke-dasharray="3 2"/>`;
  return s;
}
const halo = `paint-order="stroke" stroke="#0E1626" stroke-width="1.1" stroke-linejoin="round"`;
function ourDot(id, x, y, f, labelText){
  const mine = id === f;
  return (mine ? `<circle cx="${x}" cy="${y}" r="6" fill="${YOU}" fill-opacity=".28"/>` : "") +
    `<circle cx="${x}" cy="${y}" r="${mine?3.2:2.8}" fill="${mine?YOU:US}" stroke="#FFFFFF" stroke-width=".8"/>` +
    `<text x="${x}" y="${y+(mine?7.6:6.6)}" text-anchor="middle" font-size="${mine?4.2:3.3}" font-weight="700" fill="${mine?"#FFD3D9":"#FFFFFF"}" font-family="Barlow, sans-serif" ${halo}>${esc(labelText || id)}</text>`;
}
const oppDot = (id, x, y) => `<circle cx="${x}" cy="${y}" r="2.5" fill="${THEM}" stroke="${INK}" stroke-width=".5"/><text x="${x}" y="${y+1.05}" text-anchor="middle" font-size="2.9" font-weight="700" fill="${INK}" font-family="Barlow, sans-serif">${id.slice(1)}</text>`;
const youLabel = id => (me && me !== "coach" && CARD[me].bench && id === focus()) ? `${nick(CARD[me])} (${id})` : id;

// ---------- tactics view ----------
const FT_BOARD = {Bryce:[41,14],Sameed:[59,20],Mehmet:[18,30],Sherif:[82,30],Yosof:[44,43],Farhad:[59,63],OG:[18,89],Noah:[82,89],Taran:[38,98],Yazan:[62,98],Dyvane:[50,119]};
const SHAPE = {
  "without-ball": {pos: () => C.DD, title: "Team shape without the ball",
    rules: ["Everyone except Bryce and Sameed stays behind the half line.", "Move as one block toward the ball. Nobody chases.", "Win it when they make a mistake, then a safe first pass."]},
  "with-ball": {pos: () => Object.assign({}, C.DA, {Yosof:[41,63], Sameed:[59,17]}), title: "Team shape with the ball",
    rules: ["Pass sideways or forward. No rushing, no hopeful balls.", "Nothing lost in our half: in doubt, use option 3.", "Once we're in their half, hold it there."]},
  "final-third": {pos: () => FT_BOARD, title: "How we hold their half",
    rules: ["Bryce on the left of zone 17, Sameed a step deeper as the false 9.", "Mehmet and Sherif at the top of 13 and 15; Yosof at the bottom of 14.", "Farhad, OG and Noah cover behind; Taran, Yazan and Dyvane hold zones 5 and 2. No clean pass? Recycle."]}
};
function shapeSvg(v){
  const f = focus(), all = SHAPE[v].pos(), vb = TABS.find(t => t.id === v).view.join(" ");
  const pos = {}; for (const id in all) if (v !== "final-third" || all[id][1] < 96) pos[id] = all[id];
  const occ = {};
  for (const id in pos) occ[zoneOf(pos[id][0], pos[id][1])] = (occ[zoneOf(pos[id][0], pos[id][1])] || false) || id === f;
  let s = `<svg viewBox="${vb}" role="img" aria-label="${esc(SHAPE[v].title)}">` + baseSvg(true);
  for (const z in occ){ const [x,y,w,h] = cell(+z); s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${occ[z]?YOU:"#FFFFFF"}" fill-opacity="${occ[z]?.35:.14}" stroke="${occ[z]?YOU:"#FFFFFF"}" stroke-opacity=".8" stroke-width=".8"/>`; }
  OURS.filter(id => id !== f && pos[id]).concat(f && pos[f] ? [f] : []).forEach(id => { s += ourDot(id, pos[id][0], pos[id][1], f, youLabel(id)); });
  return s + "</svg>";
}
function renderTactics(){
  const g = $("#tgrid"), v = phase;
  let h = `<article class="tc shape"><div class="hd"><span class="kicker">Team shape</span><h2>${esc(SHAPE[v].title)}</h2></div><div class="pv">${shapeSvg(v)}</div><div class="bd"><h3>Rules</h3><ol class="seq">${SHAPE[v].rules.map((r, i) => `<li><span class="badge">${i+1}</span><span>${esc(r)}</span></li>`).join("")}</ol></div></article>`;
  g.innerHTML = h;
}

// ---------- simulation pitch ----------
const svg = $("#pitch");
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
let P = {};
function buildPitch(){
  svg.innerHTML = baseSvg(true);
  P.team = {};
  ["back","mid","fwd"].forEach(k => P.team[k] = el("polyline", {fill:"none",stroke:"#FFFFFF","stroke-opacity":".4","stroke-width":".6","stroke-dasharray":"1.6 1.4"}, svg));
  P.lines = [0,1,2].map(() => el("line", {"stroke-linecap":"round","stroke-width":1,opacity:0}, svg));
  P.pl = {};
  for (let i = 1; i <= 11; i++){
    const gg = el("g", {}, svg);
    el("circle", {r:2.5,fill:THEM,stroke:INK,"stroke-width":".5"}, gg);
    el("text", {y:1.05,"text-anchor":"middle","font-size":2.9,"font-weight":700,fill:INK,"font-family":"Barlow, sans-serif"}, gg).textContent = i;
    P.pl["o"+i] = gg;
  }
  const f = focus();
  OURS.filter(id => id !== f).concat(f ? [f] : []).forEach(id => {
    const gg = el("g", {}, svg), mine = id === f;
    if (mine){
      const hc = el("circle", {r:5.5,fill:YOU,"fill-opacity":".28",stroke:YOU,"stroke-width":".6"}, gg);
      if (!reduce){
        el("animate", {attributeName:"r",values:"4.6;7;4.6",dur:"1.8s",repeatCount:"indefinite"}, hc);
        el("animate", {attributeName:"fill-opacity",values:".4;.08;.4",dur:"1.8s",repeatCount:"indefinite"}, hc);
      }
    }
    el("circle", {r:mine?3.2:2.8,fill:mine?YOU:US,stroke:"#FFFFFF","stroke-width":".8"}, gg);
    const t = el("text", {y:mine?7.6:6.6,"text-anchor":"middle","font-size":mine?4.2:3.3,"font-weight":700,fill:mine?"#FFD3D9":"#FFFFFF","font-family":"Barlow, sans-serif","paint-order":"stroke",stroke:INK,"stroke-width":1.1,"stroke-linejoin":"round"}, gg);
    t.textContent = youLabel(id);
    P.pl[id] = gg;
  });
  P.ring = el("circle", {r:4.4,fill:"none",stroke:"#FFFFFF","stroke-width":".9",opacity:0}, svg);
  P.shadow = el("circle", {r:1.5,fill:"#000000","fill-opacity":".3"}, svg);
  P.ball = el("circle", {r:1.35,fill:"#FFFFFF",stroke:INK,"stroke-width":".45"}, svg);
}

// ---------- views ----------
const VIEWS = ["tactics","instructions","simulations"];
const PHASES = ["without-ball","with-ball","final-third"];
const EYEBROW = {"without-ball":"Without the ball","with-ball":"With the ball","final-third":"Final third"};
let view = "tactics", phase = PHASES.includes(store.get("wf-phase")) ? store.get("wf-phase") : "without-ball";
let tabIx = 0, scIx = {}, comp = null, T = 0, lastTs = 0;
const HOLD = 1600;
const tabData = () => TABS[tabIx];
const scn = () => tabData().scenarios[scIx[phase] || 0];
const involves = (st, id) => !!id && (st.from === id || st.to === id || new RegExp("\\b" + id + "\\b").test(st.text));

function enterView(v){
  if (!VIEWS.includes(v)) v = "tactics";
  const changed = v !== view; view = v;
  $$(".tab").forEach(b => { const on = b.dataset.view === v; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  try { if (location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v); } catch(e){}
  const isCards = v === "instructions";
  $("#viewSim").hidden = isCards; $("#viewCards").hidden = !isCards;
  if (changed) window.scrollTo(0, 0);
  if (!isCards) setPhase(phase);
}
function setPhase(p){
  phase = p; store.set("wf-phase", p);
  tabIx = TABS.findIndex(t => t.id === p);
  $$(".toggle button").forEach(b => b.setAttribute("aria-pressed", b.dataset.phase === p));
  const t = tabData();
  svg.setAttribute("viewBox", t.view.join(" "));
  $("#goal").dataset.phase = p;
  $("#goalEyebrow").textContent = EYEBROW[p];
  $("#goalWord").textContent = t.goal.replace(/\.$/, "");
  $("#goalText").textContent = t.goalText;
  renderJob();
  const tac = view === "tactics";
  $("#tgrid").hidden = !tac; $("#simgrid").hidden = tac;
  if (tac) renderTactics();
  else { buildChips(); startScenario(scIx[p] || 0); }
}
$$(".toggle button").forEach(b => b.onclick = () => setPhase(b.dataset.phase));

function renderJob(){
  const job = $("#job");
  if (!me || me === "coach"){ job.hidden = true; return; }
  job.hidden = false;
  const c = CARD[me];
  $("#jobTitle").textContent = "Your job · " + nick(c);
  $("#jobText").textContent = phase === "without-ball" ? c.d : c.a;
  const s = $("#jobSlot");
  if (c.bench){ s.hidden = false; s.textContent = `On the bench you cover ${c.slot}. The red dot is your slot when you come on.`; }
  else s.hidden = true;
}
function buildChips(){
  const box = $("#chips"); box.innerHTML = "";
  const f = focus();
  tabData().scenarios.forEach((s, k) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.setAttribute("role", "tab");
    const mine = f && s.steps.some(st => st.b && (st.b[1] === f || st.b[2] === f) || new RegExp("\\b" + f + "\\b").test(st.t));
    b.innerHTML = esc(s.name) + (mine ? '<span class="mine" title="You are involved"></span>' : "") + '<span class="bar"></span>';
    if (mine) b.setAttribute("aria-label", s.name + ", you are involved");
    b.onclick = () => startScenario(k);
    box.appendChild(b);
  });
}
function startScenario(k){
  scIx[phase] = k;
  const s = scn();
  comp = compile(s);
  T = reduce ? comp.total : 0; lastTs = 0; lastCap = "";
  $$("#chips .chip").forEach((b, j) => { b.setAttribute("aria-selected", j === k); if (j === k){ const box = $("#chips"); box.scrollTo({left: b.offsetLeft - box.offsetLeft - 8, behavior: reduce ? "auto" : "smooth"}); } });
  $("#trigger").textContent = s.trigger;
  $("#coach").textContent = s.coach;
  render();
}
const poly = (ids, pos) => ids.map(id => pos[id]).sort((a,b) => a[0]-b[0]).map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
let lastCap = "";
function render(){
  const S = sample(comp, T), f = focus();
  for (const id in S.pos){ const p = S.pos[id]; P.pl[id].setAttribute("transform", `translate(${p[0].toFixed(2)} ${p[1].toFixed(2)})`); }
  P.ball.setAttribute("cx", S.ball[0]); P.ball.setAttribute("cy", S.ball[1]);
  P.shadow.setAttribute("cx", S.ball[0] + .5); P.shadow.setAttribute("cy", S.ball[1] + .7);
  if (S.holder){ const p = S.pos[S.holder]; P.ring.setAttribute("cx", p[0]); P.ring.setAttribute("cy", p[1]); P.ring.setAttribute("stroke", isOpp(S.holder) ? "#0E1626" : "#FFFFFF"); P.ring.setAttribute("opacity", 1); }
  else P.ring.setAttribute("opacity", 0);
  for (let k = 0; k < 3; k++){
    const ln = P.lines[k], st = comp.steps[S.idx - k];
    if (!st || !(st.kind === "pass" || st.kind === "tackle" || st.kind === "shot")){ ln.setAttribute("opacity", 0); continue; }
    const end = (k === 0 && S.moving) ? S.ball : st.be;
    ln.setAttribute("x1", st.bs[0]); ln.setAttribute("y1", st.bs[1]); ln.setAttribute("x2", end[0]); ln.setAttribute("y2", end[1]);
    ln.setAttribute("stroke", TAGCOL[st.tag] || "#FFFFFF");
    ln.setAttribute("stroke-dasharray", st.tag === "sideways" ? "2.2 1.6" : "none");
    ln.setAttribute("stroke-width", (f && (st.from === f || st.to === f)) ? 1.5 : 1);
    ln.setAttribute("opacity", [.95, .4, .18][k]);
  }
  P.team.back.setAttribute("points", poly(["OG","Taran","Yazan","Noah"], S.pos));
  P.team.mid.setAttribute("points", poly(["Mehmet","Yosof","Farhad","Sherif"], S.pos));
  P.team.fwd.setAttribute("points", poly(["Bryce","Sameed"], S.pos));
  const st = comp.steps[S.idx], cap = S.idx + "|" + scIx[phase];
  if (cap !== lastCap){
    lastCap = cap;
    $("#capScn").textContent = scn().name;
    $("#capStep").textContent = `Step ${S.idx + 1} of ${comp.steps.length}`;
    $("#capText").textContent = st.text;
    $("#capYou").hidden = !involves(st, f);
  }
  const r = $("#result");
  if (T >= comp.total - 900){ r.hidden = false; r.className = "result k-" + scn().result.kind; r.textContent = scn().result.text; }
  else r.hidden = true;
  const chip = $$("#chips .chip")[scIx[phase]];
  if (chip) chip.querySelector(".bar").style.width = Math.min(100, T / (comp.total + HOLD) * 100) + "%";
}
function frame(ts){
  if (view === "simulations" && comp && !document.hidden && !reduce){
    if (!lastTs) lastTs = ts;
    T += Math.min(80, ts - lastTs);
    lastTs = ts;
    if (T >= comp.total + HOLD) startScenario(((scIx[phase] || 0) + 1) % tabData().scenarios.length);
    else render();
  } else lastTs = 0;
  requestAnimationFrame(frame);
}
$$(".tab").forEach(b => b.onclick = () => enterView(b.dataset.view));
$(".tabs").addEventListener("keydown", e => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const n = VIEWS[(VIEWS.indexOf(view) + (e.key === "ArrowRight" ? 1 : 2)) % 3]; enterView(n); $(`.tab[data-view="${n}"]`).focus();
});
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (VIEWS.includes(h) && h !== view) enterView(h); });

// ---------- battle cards ----------
function cardSvg(c, m, big){
  const Z = m === "d" ? C.ZD : C.ZA, D = m === "d" ? C.DD : C.DA, me_ = c.slot;
  const [x,y,w,h] = cell(Z[me_]);
  const opt = new Set(); if (m === "a") c.p.forEach(o => o.to.forEach(k => opt.add(k)));
  let s = `<svg viewBox="0 0 100 140" aria-hidden="true"><rect width="100" height="140" fill="#1D6446"/>`;
  s += `<rect x="2" y="2" width="96" height="68" fill="${m === "d" ? "#000" : "#FFF"}" fill-opacity="${m === "d" ? .25 : .08}"/>`;
  s += `<g fill="none" stroke="#FFF" stroke-opacity=".2" stroke-width=".4">`;
  for (let n = 1; n <= 18; n++){ const q = cell(n); s += `<rect x="${q[0]}" y="${q[1]}" width="${q[2]}" height="${q[3]}"/>`; }
  s += `</g><g fill="none" stroke="#FFF" stroke-opacity=".55" stroke-width=".7"><rect x="2" y="2" width="96" height="136"/><rect x="21.5" y="2" width="57" height="22.4"/><rect x="21.5" y="115.6" width="57" height="22.4"/></g>`;
  s += `<line x1="2" y1="70" x2="98" y2="70" stroke="#B9CCF7" stroke-width="1" stroke-dasharray="3 2"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#5B8DEF" fill-opacity=".55" stroke="#B9CCF7" stroke-width="1.2"/>`;
  if (big) s += `<text x="${x + 2}" y="${y + 5.5}" font-size="5" font-weight="700" fill="#FFFFFF" font-family="Barlow, sans-serif">Z${Z[me_]}</text>`;
  for (const k in D) if (k !== me_ && !opt.has(k)) s += `<circle cx="${D[k][0]}" cy="${D[k][1]}" r="2.6" fill="#FFF" fill-opacity=".45"/>`;
  const [fx, fy] = D[me_];
  if (m === "a") c.p.forEach(o => o.to.forEach(k => { const [cx, cy] = D[k]; s += o.n === 1 ? `<line x1="${fx}" y1="${fy}" x2="${cx}" y2="${cy}" stroke="#FF5A6E" stroke-width="1.8"/>` : `<line x1="${fx}" y1="${fy}" x2="${cx}" y2="${cy}" stroke="#FFF" stroke-width="1.1" stroke-dasharray="3 2"/>`; }));
  s += `<circle cx="${fx}" cy="${fy}" r="4.6" fill="${INK}" stroke="#FFFFFF" stroke-width="1.6"/>`;
  if (m === "a") c.p.forEach(o => o.to.forEach(k => { const [cx, cy] = D[k]; s += `<circle cx="${cx}" cy="${cy}" r="5" fill="${o.n === 1 ? YOU : "#FFF"}" stroke="${INK}" stroke-width=".8"/><text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="5.6" font-weight="800" fill="${o.n === 1 ? "#FFF" : INK}" font-family="Barlow, sans-serif">${o.n}</text>`; }));
  return s + "</svg>";
}
function renderCards(){
  const g = $("#grid"); g.innerHTML = "";
  const all = C.CARDS.slice();
  if (me && me !== "coach"){ const i = all.findIndex(c => c.id === me); all.unshift(all.splice(i, 1)[0]); }
  all.forEach(c => {
    const mine = c.id === me;
    const b = document.createElement("button");
    b.type = "button"; b.className = "bc" + (mine ? " mine" : "");
    b.setAttribute("aria-label", `${c.name}, ${c.role}${mine ? ", your card" : ""}. Open full card`);
    b.innerHTML = `<div class="band">${mine ? '<span class="youb">YOU</span>' : ""}<div class="cue">${esc(c.cue)}</div><div class="nm">${esc(c.name)}</div><div class="rl">${esc(c.role)}</div></div>
      <div class="maps"><figure><figcaption>No ball</figcaption>${cardSvg(c, "d")}</figure><figure><figcaption>With ball</figcaption>${cardSvg(c, "a")}</figure></div>
      <ol class="opts">${c.p.map(o => `<li><span class="num ${o.n === 1 ? "n1" : ""}">${o.n}</span>${esc(o.label)}</li>`).join("")}</ol>
      <div class="tgt"><b>Target</b>${esc(c.t)}</div>`;
    b.onclick = () => openCard(c);
    g.appendChild(b);
  });
}
const dlg = $("#dlg");
function openCard(c){
  const mine = c.id === me;
  dlg.innerHTML = `<div class="full${mine ? " mine" : ""}"><div class="band"><div class="cue">${esc(c.cue)}${mine ? " · YOUR CARD" : ""}</div><h2>${esc(c.name)}</h2><div class="rl">${esc(c.role)}</div><button class="x" type="button" aria-label="Close card">&#215;</button></div>
    <div class="body">
      <div class="maps"><figure><figcaption>Without the ball</figcaption>${cardSvg(c, "d", true)}<p>${esc(c.d)}</p></figure><figure><figcaption>With the ball</figcaption>${cardSvg(c, "a", true)}<p>${esc(c.a)}</p></figure></div>
      <div><h3>Passing options</h3><ol class="opts">${c.p.map(o => `<li><span class="num ${o.n === 1 ? "n1" : ""}">${o.n}</span><div><b>${esc(o.label)}</b><span>${esc(o.hint)}</span></div></li>`).join("")}</ol></div>
      <div class="target"><b>Match target</b>${esc(c.t)}</div>
      ${c.bench ? `<p class="hint">Bench: covers ${esc(c.slot)}'s position, so the zones and passes are ${esc(c.slot)}'s.</p>` : ""}
    </div></div>`;
  dlg.querySelector(".x").onclick = () => dlg.close();
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
}
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

// ---------- start ----------
buildSelect();
if (me) $("#meName").textContent = meLabel();
buildPitch();
renderCards();
const h0 = location.hash.slice(1);
view = null;
enterView(VIEWS.includes(h0) ? h0 : "tactics");
if (!me) openWelcome();
requestAnimationFrame(frame);
})();
