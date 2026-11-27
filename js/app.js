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
  hideDock(); closeGuide();
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
  hideDock();
  setTimeout(() => { L.classList.add("fade"); setTimeout(() => { L.hidden = true; document.body.style.overflow = ""; showDock(); maybeGuide(); }, reduce ? 0 : 350); }, wait);
}
$("#meBtn").onclick = openWelcome;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#welcome").hidden && me){ $("#welcome").hidden = true; document.body.style.overflow = ""; showDock(); maybeGuide(); } });

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
    rules: ["Pass sideways or forward. No rushing, no hopeful balls.", "When in doubt, lob the ball centrally behind the defense for Bryce or Sameed to catch.", "Once we're in their half, hold it there."]},
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
const VIEWS = ["week","tactics","instructions","simulations"];
const PHASES = ["without-ball","with-ball","final-third"];
const EYEBROW = {"without-ball":"Without the ball","with-ball":"With the ball","final-third":"Final third"};
let view = "week", phase = PHASES.includes(store.get("wf-phase")) ? store.get("wf-phase") : "without-ball";
let tabIx = 0, scIx = {}, comp = null, T = 0, lastTs = 0;
const HOLD = 1600;
const tabData = () => TABS[tabIx];
const scn = () => tabData().scenarios[scIx[phase] || 0];
const involves = (st, id) => !!id && (st.from === id || st.to === id || new RegExp("\\b" + id + "\\b").test(st.text));

function enterView(v){
  if (!VIEWS.includes(v)) v = "week";
  const changed = v !== view; view = v;
  $$(".tab").forEach(b => { const on = b.dataset.view === v; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  try { if (location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v); } catch(e){}
  $("#viewWeek").hidden = v !== "week"; $("#viewCards").hidden = v !== "instructions";
  $("#viewSim").hidden = !(v === "tactics" || v === "simulations");
  if (changed) window.scrollTo(0, 0);
  if (v === "week") renderWeek();
  else if (v !== "instructions") setPhase(phase);
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
  const n = VIEWS[(VIEWS.indexOf(view) + (e.key === "ArrowRight" ? 1 : 3)) % 4]; enterView(n); $(`.tab[data-view="${n}"]`).focus();
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
      ${mine && REPORTS_ENC[c.id] ? `<button class="myrep" type="button" id="cardRep">Open my report card</button>` : ""}
      ${c.bench ? `<p class="hint">Bench: covers ${esc(c.slot)}'s position, so the zones and passes are ${esc(c.slot)}'s.</p>` : ""}
    </div></div>`;
  dlg.querySelector(".x").onclick = () => dlg.close();
  const cr = dlg.querySelector("#cardRep"); if (cr) cr.onclick = () => { dlg.close(); openReport(); };
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
}
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

// ---------- report card reminder ----------
const dock = $("#rcDock");
let dockTimer = 0;
const hasReport = () => me && me !== "coach" && !!REPORTS_ENC[me];
function setDock(state){ dock.dataset.state = state; $("#rcOpen").setAttribute("aria-label", state === "compact" ? "Open your report card" : "Open your report card: your season review"); }
function showDock(){
  if (!hasReport()){ hideDock(); return; }
  dock.dataset.seen = store.get("wf-rep-seen-" + me) ? "1" : "0";
  setDock("open"); dock.hidden = false; document.body.classList.add("has-dock");
  clearTimeout(dockTimer);
  dockTimer = setTimeout(() => setDock("compact"), 7000);
}
function hideDock(){ dock.hidden = true; document.body.classList.remove("has-dock"); clearTimeout(dockTimer); }
$("#rcMin").onclick = () => { clearTimeout(dockTimer); setDock("compact"); $("#rcOpen").focus(); };
$("#rcOpen").onclick = () => openReport();
window.addEventListener("scroll", () => { if (!dock.hidden && dock.dataset.state === "open" && window.scrollY > 120){ clearTimeout(dockTimer); setDock("compact"); } }, {passive: true});

// Reports are encrypted; a player's 6-character code derives the key in the browser.
const ub64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const normCode = v => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
async function decryptReport(pid, code){
  const e = REPORTS_ENC[pid];
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({name:"PBKDF2", salt:ub64(e.salt), iterations:REPORT_KDF_ITER, hash:"SHA-256"}, base, {name:"AES-GCM", length:256}, false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({name:"AES-GCM", iv:ub64(e.iv)}, key, ub64(e.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}
function showDialog(label){ dlg.setAttribute("aria-label", label); if (!dlg.open){ if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); } }
async function openReport(){
  if (!hasReport()) return;
  clearTimeout(dockTimer); setDock("compact");
  const saved = store.get("wf-code-" + me);
  if (saved){
    try { renderReport(await decryptReport(me, saved), true); return; }
    catch(e){ try { localStorage.removeItem("wf-code-" + me); } catch(_){} }
  }
  codeScreen();
}
function codeScreen(){
  dlg.innerHTML = `<div class="full rep lock"><div class="band"><div class="cue">PRIVATE · ${esc(nick(CARD[me]).toUpperCase())}</div><h2>Enter your access code</h2><div class="rl">Your report card is locked</div><button class="x" type="button" aria-label="Close">&#215;</button></div>
    <form class="body" id="codeForm" novalidate>
      <p>Type the 6-character code your coach sent you with the website link.</p>
      <label class="codelbl" for="codeIn">Access code</label>
      <input class="codein" id="codeIn" name="code" inputmode="text" autocomplete="one-time-code" autocapitalize="characters" autocorrect="off" spellcheck="false" maxlength="7" placeholder="••••••" aria-describedby="codeMsg">
      <p class="codemsg" id="codeMsg" role="status" aria-live="polite"></p>
      <label class="remember" for="codeRem"><input type="checkbox" id="codeRem" checked> Remember on this phone</label>
      <button class="go" id="codeGo" type="submit" disabled>Unlock report card</button>
      <p class="note">No code? Ask your coach.</p>
    </form></div>`;
  dlg.querySelector(".x").onclick = () => dlg.close();
  const inp = $("#codeIn"), go = $("#codeGo"), msg = $("#codeMsg");
  inp.addEventListener("input", () => { const v = normCode(inp.value).slice(0, 6); if (inp.value !== v) inp.value = v; go.disabled = v.length !== 6; msg.textContent = ""; inp.classList.remove("bad"); });
  $("#codeForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const code = normCode(inp.value); if (code.length !== 6) return;
    go.disabled = true; go.textContent = "Checking…";
    try {
      const rep = await decryptReport(me, code);
      if ($("#codeRem").checked) store.set("wf-code-" + me, code);
      renderReport(rep, !!$("#codeRem").checked);
    } catch(e){
      go.disabled = false; go.textContent = "Unlock report card";
      inp.classList.add("bad"); msg.textContent = "That code doesn't match. Check the message from your coach and try again.";
      inp.select();
    }
  });
  showDialog("Report card access code");
  setTimeout(() => inp.focus(), 50);
}
function renderReport(r, remembered){
  store.set("wf-rep-seen-" + me, "1"); dock.dataset.seen = "1";
  const s = r.s, f1 = v => v.toFixed(1), f2 = v => v.toFixed(2);
  const tile = (v, l) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`;
  dlg.innerHTML = `<div class="full rep"><div class="band"><div class="cue">PLAYER PERFORMANCE REPORT</div><h2>${esc(r.name)}</h2><div class="rl">${esc(r.pos)} · Season to date</div><button class="x" type="button" aria-label="Close report card">&#215;</button></div>
    <div class="body">
      <div class="tiles">${tile(s.games,"Games")}${tile(s.minutes,"Minutes")}${tile(f1(s.avgMin),"Avg min")}${tile(f2(s.rating),"Avg rating")}${tile(s.goals,"Goals")}${tile(s.assists,"Assists")}</div>
      <div class="two">
        <div><h3>Output and impact</h3><dl><dt>Goal contributions</dt><dd>${s.contrib}</dd><dt>Goals per 90</dt><dd>${f2(s.g90)}</dd><dt>Assists per 90</dt><dd>${f2(s.a90)}</dd><dt>Contributions per 90</dt><dd>${f2(s.c90)}</dd><dt>Impact score / 10</dt><dd>${f2(s.impact)}</dd></dl></div>
        <div><h3>Availability and discipline</h3><dl><dt>Clean sheets</dt><dd>${s.clean}</dd><dt>Player of the match</dt><dd>${s.pom}</dd><dt>Yellow cards</dt><dd>${s.yellow}</dd><dt>Red cards</dt><dd>${s.red}</dd><dt>Discipline points</dt><dd>${s.disc}</dd></dl></div>
      </div>
      <div class="sect good"><h3>Strengths to highlight</h3><ul>${r.strengths.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
      <div class="sect work"><h3>Areas for improvement</h3><ul>${r.improve.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
      <div class="repfoot"><p class="note">From your coach. Questions about it? Ask at training.</p>${remembered ? '<button class="lockbtn" type="button" id="lockBtn">Lock on this phone</button>' : ""}</div>
    </div></div>`;
  dlg.querySelector(".x").onclick = () => dlg.close();
  const lb = $("#lockBtn"); if (lb) lb.onclick = () => { try { localStorage.removeItem("wf-code-" + me); } catch(e){} dlg.close(); };
  showDialog("Report card");
}
dlg.addEventListener("close", () => { dlg.setAttribute("aria-label", "Battle card"); });

// ---------- this week ----------
const TEAM = "White Falcons FC";
const pad = n => String(n).padStart(2, "0");
function vanNow(){
  const p = {}; new Intl.DateTimeFormat("en-CA", {timeZone:"America/Vancouver", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23"}).formatToParts(new Date()).forEach(x => p[x.type] = x.value);
  return {y:+p.year, m:+p.month, d:+p.day, iso:`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`};
}
const addDays = (y, m, d, n) => { const t = new Date(Date.UTC(y, m-1, d + n)); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth()+1)}-${pad(t.getUTCDate())}`; };
function weekInfo(){
  const n = vanNow(), wd = new Date(Date.UTC(n.y, n.m-1, n.d)).getUTCDay();
  const mon = addDays(n.y, n.m, n.d, -((wd + 6) % 7)), nextMon = addDays(+mon.slice(0,4), +mon.slice(5,7), +mon.slice(8,10), 7);
  const idx = Math.round((Date.UTC(+mon.slice(0,4), +mon.slice(5,7)-1, +mon.slice(8,10)) - Date.UTC(2026,0,5)) / 6048e5);
  const thisWeek = SCHEDULE.find(g => g.d >= mon && g.d < nextMon) || null;
  const next = thisWeek || SCHEDULE.find(g => g.d >= n.iso) || null;
  const after = next ? SCHEDULE.find(g => g.d > next.d) || null : null;
  return {now:n.iso, key:mon, idx, match:next, inWeek:!!thisWeek, after};
}
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtMatch(g){
  const y = +g.d.slice(0,4), mo = +g.d.slice(5,7), da = +g.d.slice(8,10), hh = +g.d.slice(11,13), mi = g.d.slice(14,16);
  const wd = new Date(Date.UTC(y, mo-1, da)).getUTCDay();
  const home = g.home === TEAM, opp = home ? g.away : g.home;
  return {opp, home, day:`${DAYS[wd]} ${da} ${MONTHS[mo-1]}`, dayLong:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][wd],
    time:`${(hh % 12) || 12}:${mi} ${hh < 12 ? "AM" : "PM"}`};
}
function countdown(g, nowIso){
  const day = s => Date.UTC(+s.slice(0,4), +s.slice(5,7)-1, +s.slice(8,10));
  const diff = Math.round((day(g.d) - day(nowIso)) / 864e5);
  if (diff < 0 || (diff === 0 && nowIso > g.d)) return "Played";
  return diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `In ${diff} days`;
}
const initials = s => s.replace(/\bFC\b/g, "").trim().split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase();
const crest = (name, ours) => ours ? `<img class="mc-badge" src="assets/badge.png" alt="White Falcons badge">` :
  OPP_BADGES[name] ? `<img class="mc-badge" src="${OPP_BADGES[name]}" alt="${esc(name)} badge">` : `<span class="mc-badge mc-init" aria-hidden="true">${esc(initials(name))}</span>`;
function renderWeek(){
  const w = weekInfo(), box = $("#weekWrap"), player = me && me !== "coach";
  let h = "";
  if (!w.match){
    h = `<div class="goal" data-phase="without-ball"><span class="eyebrow">This week</span><h1>No upcoming matches</h1><p>The schedule has no more fixtures. Check back when the next one is added.</p></div>`;
  } else {
    const f = fmtMatch(w.match), home = f.home;
    const left = home ? TEAM : f.opp, right = home ? f.opp : TEAM;
    h += `<article class="mc" id="matchCard">
      <div class="mc-top"><span class="mc-label">${w.inWeek ? "This week's match" : "Next match"} · ${esc(w.match.comp)}</span><span class="mc-when">${esc(countdown(w.match, w.now))}</span></div>
      <div class="mc-teams"><div class="mc-team">${crest(left, left === TEAM)}<b>${esc(left.replace(/ FC$/,""))}</b><small>Home</small></div><span class="mc-vs">vs</span><div class="mc-team">${crest(right, right === TEAM)}<b>${esc(right.replace(/ FC$/,""))}</b><small>Away</small></div></div>
      <div class="mc-facts"><div><span>Date</span><b>${esc(f.day)}</b></div><div><span>Kick-off</span><b>${esc(f.time)}</b></div><div><span>Field</span><b>${esc(w.match.field)}</b></div></div>
    </article>`;
    if (w.after){ const a2 = fmtMatch(w.after); h += `<p class="after">After that: ${esc(a2.day)} vs ${esc(a2.opp)}, ${esc(a2.time)} at ${esc(w.after.field)}</p>`; }
  }
  if (player){
    const done = !!store.get(guideKey());
    h += `<div class="panel brief"><div><h3>Your briefing</h3><p>${done ? "Done for this week. Replay it any time before kick-off." : "Five quick steps: the match, your job without and with the ball, one scenario to watch, and a quick check."}</p></div><button class="go" type="button" id="briefBtn">${done ? "Replay briefing" : "Start briefing"}</button></div>`;
  } else {
    h += `<div class="panel"><h3>Coach view</h3><p>Players get a personal five-step briefing here each week. Pick a player with Switch to preview theirs.</p></div>`;
  }
  box.innerHTML = h;
  const bb = $("#briefBtn"); if (bb) bb.onclick = () => openGuide(0);
}

// ---------- weekly briefing guide ----------
const guide = $("#guide"), gTip = $("#gTip"), gHole = $("#gHole");
let gSteps = [], gIx = 0, gTarget = null, gDot = null, gQuiz = null, gRaf = 0;
const guideKey = () => "wf-guide-" + me + "-" + weekInfo().key;
function bestScenario(id){
  let best = null;
  TABS.forEach(t => t.scenarios.forEach((sc, k) => {
    const n = compile(sc).steps.filter(st => st.from === id || st.to === id).length;
    if (!best || n > best.n) best = {phase:t.id, k, n, sc};
  }));
  return best;
}
function buildQuiz(c, w){
  const kind = ["pass","zone","target"][((w.idx % 3) + 3) % 3];
  const rot = (arr, n) => arr.map((_, i) => arr[(i + n) % arr.length]);
  if (kind === "pass"){
    const opts = c.p.map(o => o.label);
    return {q:"With the ball, who is your first pass (option 1)?", answer:opts[0], opts:rot(opts, w.idx % 3), back:2};
  }
  if (kind === "zone"){
    const z = C.ZD[c.slot], cands = [z+1, z-1, z+3, z-3].filter(n => n >= 1 && n <= 18 && n !== z);
    const opts = [z, cands[0], cands[1]].map(n => "Zone " + n);
    return {q:"Without the ball, which zone do you hold?", answer:"Zone " + z, opts:rot(opts, (w.idx + 1) % 3), back:1};
  }
  const others = C.CARDS.filter(x => x.t !== c.t).map(x => x.t).filter((t, i, s) => s.indexOf(t) === i);
  const pick = [others[w.idx % others.length], others[(w.idx + 5) % others.length]];
  return {q:"What is your match target this week?", answer:c.t, opts:rot([c.t, pick[0], pick[1]], (w.idx + 2) % 3), back:2};
}
function buildSteps(){
  const c = CARD[me], slot = c.slot, w = weekInfo(), f = w.match ? fmtMatch(w.match) : null;
  const pre = c.bench ? `If you come on for ${slot}: ` : "";
  const sc = bestScenario(slot);
  const opts = c.p.map(o => `<li><span class="num ${o.n === 1 ? "n1" : ""}">${o.n}</span><span><b>${esc(o.label)}</b> ${esc(o.hint)}</span></li>`).join("");
  gQuiz = buildQuiz(c, w);
  const chips = `<div class="g-chips">${c.p.map(o => `<span class="${o.n === 1 ? "c1" : ""}"><i>${o.n}</i>${esc(o.label)}</span>`).join("")}</div>`;
  const s1 = f ? `<p><b>${esc(f.dayLong)} vs ${esc(f.opp)}</b></p><p class="g-meta">${esc(f.time)} · ${esc(w.match.field)}</p>` : `<p>No match is scheduled this week. Use the time to refresh your role.</p>`;
  return [
    {title: f ? "This week's match" : "This week", view:"week", target:"#matchCard",
     main: s1, more:""},
    {title:"Your job without the ball", view:"tactics", phase:"without-ball", target:"#tgrid .pv", dot:true,
     main:`<p class="g-clamp">${esc(pre + c.d)}</p>`, more:`<p class="g-small">Your red dot shows where you stand.</p>`},
    {title:"Your job with the ball", view:"tactics", phase:"with-ball", target:"#tgrid .pv", dot:true,
     main:`<p class="g-clamp">${esc(pre + c.a)}</p>` + chips, more:`<ol class="g-opts">${opts}</ol><p class="g-small"><b>Target:</b> ${esc(c.t)}</p>`},
    {title:"Watch: " + sc.sc.name, view:"simulations", phase:sc.phase, scen:sc.k, target:".pitchcard", sim:true,
     main:`<p>You're the red dot. Watch your moments; the move loops.</p>`, more:`<p>${esc(sc.sc.trigger)}</p>`},
    {title:"Quick check", view:"week", quiz:true, body:""}
  ];
}
function maybeGuide(){
  if (!me || me === "coach" || store.get(guideKey())) return;
  setTimeout(() => { if ($("#welcome").hidden && $("#loading").hidden && !dlg.open) openGuide(0); }, 450);
}
function openGuide(i){
  if (!me || me === "coach") return;
  gSteps = buildSteps(); guide.hidden = false; document.body.classList.add("guiding"); hideDock();
  goStep(i || 0);
  cancelAnimationFrame(gRaf); const loop = () => { placeGuide(); gRaf = requestAnimationFrame(loop); }; gRaf = requestAnimationFrame(loop);
}
function closeGuide(){
  if (guide.hidden) return;
  guide.hidden = true; document.body.classList.remove("guiding"); cancelAnimationFrame(gRaf);
  if (view === "week") renderWeek();
  showDock();
}
function goStep(i){
  gIx = Math.max(0, Math.min(gSteps.length - 1, i));
  const st = gSteps[gIx];
  if (view !== st.view) enterView(st.view);
  if (st.phase && phase !== st.phase) setPhase(st.phase);
  if (st.sim) startScenario(st.scen);
  $("#gStep").textContent = `Step ${gIx + 1} of ${gSteps.length}`;
  $("#gTitle").textContent = st.title;
  $("#gDots").innerHTML = gSteps.map((_, k) => `<i class="${k === gIx ? "on" : k < gIx ? "done" : ""}"></i>`).join("");
  $("#gBack").disabled = gIx === 0;
  const next = $("#gNext");
  if (st.quiz){ renderQuiz(); }
  else {
    $("#gBody").innerHTML = `<div class="g-main">${st.main}</div>` + (st.more ? `<div class="g-more">${st.more}</div>` : "");
    next.disabled = false; next.textContent = "Next"; next.dataset.mode = "next";
  }
  gTip.classList.remove("open");
  const mb = $("#gMore"), clamp = $("#gBody .g-clamp");
  const needMore = !st.quiz && (!!st.more || (clamp && clamp.scrollHeight > clamp.clientHeight + 2));
  mb.hidden = !needMore; mb.textContent = "More"; mb.setAttribute("aria-expanded", "false");
  gTarget = st.target ? $(st.target) : null;
  gDot = st.dot || st.sim ? focus() : null;
  gTip.classList.toggle("center", !gTarget);
  requestAnimationFrame(() => requestAnimationFrame(() => { scrollToStep(st); setTimeout(() => $("#gNext").focus({preventScroll:true}), 30); }));
}
function renderQuiz(){
  const q = gQuiz, done = !!store.get(guideKey()), next = $("#gNext");
  $("#gBody").innerHTML = `<p class="g-q">${esc(q.q)}</p><div class="g-answers">${q.opts.map((o, k) => `<button type="button" class="g-ans" data-k="${k}">${esc(o)}</button>`).join("")}</div><p class="g-fb" id="gFb" role="status" aria-live="polite"></p>`;
  next.dataset.mode = done ? "restart" : "locked"; next.textContent = done ? "Restart" : "Next"; next.disabled = !done;
  $$(".g-ans").forEach(b => b.onclick = () => {
    const ok = q.opts[+b.dataset.k] === q.answer, fb = $("#gFb");
    $$(".g-ans").forEach(x => x.classList.remove("right", "wrong"));
    b.classList.add(ok ? "right" : "wrong");
    if (ok){
      store.set(guideKey(), "1");
      fb.className = "g-fb ok"; fb.textContent = "Spot on. You're ready for this week.";
      next.disabled = false; next.textContent = "Restart"; next.dataset.mode = "restart"; next.focus();
    } else {
      fb.className = "g-fb no"; fb.innerHTML = `Not quite. Let's look again. <button type="button" class="g-link" id="gReplay">Show me step ${q.back + 1}</button>`;
      $("#gReplay").onclick = () => goStep(q.back);
    }
  });
}
function svgPoint(svgEl, x, y){
  const vb = svgEl.viewBox.baseVal, r = svgEl.getBoundingClientRect();
  return [r.left + (x - vb.x) / vb.width * r.width, r.top + (y - vb.y) / vb.height * r.height];
}
function dotScreen(){
  if (!gDot || !gTarget) return null;
  if (gSteps[gIx].sim){ const g = P.pl[gDot]; if (!g) return null; const r = g.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; }
  const svgEl = gTarget.querySelector("svg"); if (!svgEl) return null;
  const pos = SHAPE[phase].pos()[gDot]; return pos ? svgPoint(svgEl, pos[0], pos[1]) : null;
}
const isPhone = () => window.innerWidth < 900;
function scrollToStep(st){
  if (!gTarget){ window.scrollTo({top:0, behavior:"auto"}); return; }
  const head = $(".top").getBoundingClientRect().bottom, tipH = isPhone() ? gTip.getBoundingClientRect().height + 24 : 0;
  const avail = window.innerHeight - tipH - head;
  const r = gTarget.getBoundingClientRect(), d = dotScreen();
  let delta;
  if (d && r.height > avail) delta = d[1] - (head + avail * 0.45);
  else delta = r.top - head - 12;
  window.scrollBy({top: delta, behavior: reduce ? "auto" : "smooth"});
}
function placeGuide(){
  if (guide.hidden) return;
  if (gTarget && gTarget.isConnected){
    const r = gTarget.getBoundingClientRect(), p = 6;
    gHole.style.display = "block";
    gHole.style.left = (r.left - p) + "px"; gHole.style.top = (r.top - p) + "px";
    gHole.style.width = (r.width + 2*p) + "px"; gHole.style.height = (r.height + 2*p) + "px";
    if (!isPhone()){
      const tw = gTip.offsetWidth, th = gTip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
      let x = r.right + 20; if (x + tw > vw - 16) x = r.left - tw - 20; if (x < 16) x = Math.min(vw - tw - 16, Math.max(16, r.left));
      let y = Math.max(84, Math.min(vh - th - 16, r.top));
      gTip.style.left = x + "px"; gTip.style.top = y + "px";
    } else { gTip.style.left = ""; gTip.style.top = ""; }
  } else {
    gHole.style.display = "none";
    if (!isPhone()){ gTip.style.left = Math.round((window.innerWidth - gTip.offsetWidth) / 2) + "px"; gTip.style.top = Math.round((window.innerHeight - gTip.offsetHeight) / 2) + "px"; }
    else { gTip.style.left = ""; gTip.style.top = ""; }
  }
}
$("#gBack").onclick = () => goStep(gIx - 1);
$("#gNext").onclick = () => { const m = $("#gNext").dataset.mode; if (m === "restart") goStep(0); else if (m === "next") goStep(gIx + 1); };
$("#gX").onclick = closeGuide;
$("#gMore").onclick = () => { const o = gTip.classList.toggle("open"); $("#gMore").textContent = o ? "Less" : "More"; $("#gMore").setAttribute("aria-expanded", o); };
document.addEventListener("keydown", e => {
  if (guide.hidden) return;
  if (e.key === "Escape") closeGuide();
  else if (e.key === "ArrowRight" && !$("#gNext").disabled && e.target.tagName !== "INPUT") $("#gNext").click();
  else if (e.key === "ArrowLeft" && gIx > 0) goStep(gIx - 1);
});

// ---------- start ----------
buildSelect();
if (me) $("#meName").textContent = meLabel();
buildPitch();
renderCards();
const h0 = location.hash.slice(1);
view = null;
enterView(VIEWS.includes(h0) ? h0 : "week");
if (!me) openWelcome(); else { showDock(); maybeGuide(); }
requestAnimationFrame(frame);
})();
