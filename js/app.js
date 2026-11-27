// White Falcons Tactics: welcome picker, looping simulations, battle cards.
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
  get(){ try { return localStorage.getItem("wf-player"); } catch(e){ return null; } },
  set(v){ try { localStorage.setItem("wf-player", v); } catch(e){} }
};
const shortRole = c => c.role.split("·")[0].trim();
const firstName = c => c.name.split(" ")[0];

// ---------- who am I ----------
let me = store.get();
if (me && me !== "coach" && !CARD[me]) me = null;
const focus = () => (me && me !== "coach") ? CARD[me].slot : null;

function setMe(v){
  me = v; store.set(v);
  const c = CARD[v];
  $("#meName").textContent = v === "coach" ? "Coach view" : (c.id === "OG" ? "OG" : firstName(c)) + " · " + (c.bench ? "Bench" : shortRole(c));
  closeWelcome();
  buildPitch(); renderCards(); enterView(view, true);
}

// ---------- welcome ----------
const WPOS = {Bryce:[34,13],Sameed:[66,13],Mehmet:[14,34],Sherif:[86,34],Yosof:[35,46],Farhad:[65,46],OG:[13,64],Taran:[37,68],Yazan:[63,68],Noah:[87,64],Dyvane:[50,88]};
let pick = null;
function buildWelcome(){
  const wp = $("#wpitch");
  $$(".pk", wp).forEach(n => n.remove());
  STARTERS.forEach(c => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "pk"; b.dataset.id = c.id;
    b.style.left = WPOS[c.id][0] + "%"; b.style.top = WPOS[c.id][1] + "%";
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", c.name + ", " + shortRole(c));
    b.innerHTML = `<span class="d">${esc(shortRole(c))}</span><span class="n">${esc(c.id === "OG" ? "OG" : firstName(c))}</span>`;
    b.onclick = () => choose(c.id);
    wp.appendChild(b);
  });
  const wb = $("#wbench"); wb.innerHTML = "";
  BENCH.forEach(c => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "bp"; b.dataset.id = c.id; b.setAttribute("aria-pressed", "false");
    b.innerHTML = `<b>${esc(c.name)}</b><span>Covers ${esc(c.slot)} (${esc(shortRole(CARD[c.slot]))})</span>`;
    b.onclick = () => choose(c.id);
    wb.appendChild(b);
  });
  $("#goBtn").onclick = () => { if (pick) setMe(pick); };
  $("#coachBtn").onclick = () => setMe("coach");
}
function choose(id){
  pick = id;
  $$(".pk,.bp").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === id));
  const c = CARD[id], go = $("#goBtn");
  go.disabled = false;
  go.textContent = `I'm ${c.id === "OG" ? "OG" : firstName(c)} · Let's go`;
}
function openWelcome(){
  pick = (me && me !== "coach") ? me : null;
  $$(".pk,.bp").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === pick));
  const go = $("#goBtn"); go.disabled = !pick; go.textContent = pick ? `I'm ${pick === "OG" ? "OG" : firstName(CARD[pick])} · Let's go` : "Pick your position";
  $("#welcome").hidden = false; document.body.style.overflow = "hidden";
}
function closeWelcome(){ $("#welcome").hidden = true; document.body.style.overflow = ""; }
$("#meBtn").onclick = openWelcome;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#welcome").hidden && me) closeWelcome(); });

// ---------- simulation pitch ----------
const svg = $("#pitch");
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const COLX = [2,34,66,98], ROWY = [138,115.333,92.667,70,47.333,24.667,2];
const cell = n => { const c = (n-1)%3, r = Math.floor((n-1)/3)+1; return [COLX[c], ROWY[r], 32, +(ROWY[r-1]-ROWY[r]).toFixed(3)]; };
const TAGCOL = {forward:"#F2B134", sideways:"#FFFFFF", back:"#FF9A8C", opp:"#E4574B", cut:"#F2B134", lost:"#E4574B", won:"#F2B134", goal:"#F2B134", saved:"#F2B134", wide:"#FFFFFF"};
let P = {};
function buildPitch(){
  svg.innerHTML = "";
  el("rect", {x:-5,y:-10,width:110,height:162,fill:"#1D6446"}, svg);
  for (let i = 0; i < 12; i += 2) el("rect", {x:2,y:2+i*(136/12),width:96,height:136/12,fill:"#FFFFFF","fill-opacity":".045"}, svg);
  const z = el("g", {}, svg);
  for (let n = 1; n <= 18; n++){
    const [x,y,w,h] = cell(n);
    el("rect", {x,y,width:w,height:h,fill:"none",stroke:"#FFFFFF","stroke-opacity":".18","stroke-width":".35"}, z);
    el("text", {x:x+2,y:y+4.4,"font-size":3.2,"font-weight":700,fill:"#FFFFFF","fill-opacity":".35","font-family":"Barlow, sans-serif"}, z).textContent = n;
  }
  const m = el("g", {fill:"none",stroke:"#FFFFFF","stroke-opacity":".6","stroke-width":".55"}, svg);
  el("rect", {x:2,y:2,width:96,height:136}, m);
  el("circle", {cx:50,cy:70,r:12}, m);
  el("rect", {x:21.5,y:2,width:57,height:22.4}, m); el("rect", {x:21.5,y:115.6,width:57,height:22.4}, m);
  el("rect", {x:37,y:2,width:26,height:7.5}, m); el("rect", {x:37,y:130.5,width:26,height:7.5}, m);
  el("path", {d:"M39.5 24.4 A12 12 0 0 0 60.5 24.4"}, m); el("path", {d:"M39.5 115.6 A12 12 0 0 1 60.5 115.6"}, m);
  const g = el("g", {fill:"#FFFFFF","fill-opacity":".16",stroke:"#FFFFFF","stroke-width":".7"}, svg);
  el("rect", {x:44.8,y:-1.2,width:10.4,height:3.2}, g); el("rect", {x:44.8,y:138,width:10.4,height:3.2}, g);
  el("line", {x1:2,y1:70,x2:98,y2:70,stroke:"#F2B134","stroke-width":".9","stroke-dasharray":"3 2"}, svg);
  P.team = {};
  ["back","mid","fwd"].forEach(k => P.team[k] = el("polyline", {fill:"none",stroke:"#FFFFFF","stroke-opacity":".4","stroke-width":".6","stroke-dasharray":"1.6 1.4"}, svg));
  P.lines = [0,1,2].map(() => el("line", {"stroke-linecap":"round","stroke-width":1,opacity:0}, svg));
  P.pl = {};
  for (let i = 1; i <= 11; i++){
    const gg = el("g", {}, svg);
    el("circle", {r:2.5,fill:"#E4574B",stroke:"#FFFFFF","stroke-width":".7"}, gg);
    el("text", {y:1.05,"text-anchor":"middle","font-size":2.9,"font-weight":700,fill:"#FFFFFF","font-family":"Barlow, sans-serif"}, gg).textContent = i;
    P.pl["o"+i] = gg;
  }
  const f = focus();
  OURS.filter(id => id !== f).concat(f ? [f] : []).forEach(id => {
    const gg = el("g", {}, svg), mine = id === f;
    if (mine){
      const halo = el("circle", {r:5.5,fill:"#F2B134","fill-opacity":".25",stroke:"#F2B134","stroke-width":".6"}, gg);
      if (!reduce){
        el("animate", {attributeName:"r",values:"4.6;7;4.6",dur:"1.8s",repeatCount:"indefinite"}, halo);
        el("animate", {attributeName:"fill-opacity",values:".35;.08;.35",dur:"1.8s",repeatCount:"indefinite"}, halo);
      }
    }
    el("circle", {r:mine?3.2:2.8,fill:mine?"#F2B134":"#0B1F3A",stroke:"#FFFFFF","stroke-width":".8"}, gg);
    const t = el("text", {y:mine?7.6:6.6,"text-anchor":"middle","font-size":mine?4.2:3.3,"font-weight":700,fill:mine?"#F2B134":"#FFFFFF","font-family":"Barlow, sans-serif","paint-order":"stroke",stroke:"#0B1F3A","stroke-width":1.1,"stroke-linejoin":"round"}, gg);
    t.textContent = mine && me !== f ? CARD[me].id + " (" + f + ")" : id;
    P.pl[id] = gg;
  });
  P.ring = el("circle", {r:4.4,fill:"none",stroke:"#FFFFFF","stroke-width":".9",opacity:0}, svg);
  P.shadow = el("circle", {r:1.5,fill:"#000000","fill-opacity":".3"}, svg);
  P.ball = el("circle", {r:1.35,fill:"#FFFFFF",stroke:"#0B1F3A","stroke-width":".45"}, svg);
}

// ---------- simulation loop ----------
const VIEWS = ["without-ball","with-ball","final-third","cards"];
const EYEBROW = {"without-ball":"Without the ball","with-ball":"With the ball","final-third":"Final third"};
let view = "without-ball", tabIx = 0, scIx = {}, comp = null, T = 0, lastTs = 0;
const HOLD = 1600;
const tabData = () => TABS[tabIx];
const scn = () => tabData().scenarios[scIx[view] || 0];
const involves = (st, id) => !!id && (st.from === id || st.to === id || new RegExp("\\b" + id + "\\b").test(st.text));

function enterView(v, force){
  if (!VIEWS.includes(v)) v = "without-ball";
  const changed = v !== view; view = v;
  $$(".tab").forEach(b => { const on = b.dataset.view === v; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  try { if (location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v); } catch(e){}
  const isCards = v === "cards";
  $("#viewSim").hidden = isCards; $("#viewCards").hidden = !isCards;
  if (changed) window.scrollTo(0, 0);
  if (isCards) return;
  tabIx = TABS.findIndex(t => t.id === v);
  const t = tabData();
  svg.setAttribute("viewBox", t.view.join(" "));
  $("#goalEyebrow").textContent = EYEBROW[v];
  $("#goalWord").textContent = t.goal.replace(/\.$/, "");
  $("#goalText").textContent = t.goalText;
  renderJob();
  buildChips();
  startScenario(scIx[v] || 0);
}

function renderJob(){
  const job = $("#job");
  if (!me || me === "coach"){ job.hidden = true; return; }
  job.hidden = false;
  const c = CARD[me];
  $("#jobTitle").textContent = "Your job · " + (c.id === "OG" ? "OG" : firstName(c));
  $("#jobText").textContent = view === "without-ball" ? c.d : c.a;
  const s = $("#jobSlot");
  if (c.bench){ s.hidden = false; s.textContent = `On the bench you cover ${c.slot}. Watch the amber dot: that is your slot when you come on.`; }
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
  scIx[view] = k;
  const s = scn();
  comp = compile(s);
  T = reduce ? comp.total : 0; lastTs = 0;
  $$("#chips .chip").forEach((b, j) => { b.setAttribute("aria-selected", j === k); if (j === k && b.scrollIntoView) { const box = $("#chips"); box.scrollTo({left: b.offsetLeft - box.offsetLeft - 8, behavior: reduce ? "auto" : "smooth"}); } });
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
  if (S.holder){ const p = S.pos[S.holder]; P.ring.setAttribute("cx", p[0]); P.ring.setAttribute("cy", p[1]); P.ring.setAttribute("stroke", isOpp(S.holder) ? "#FFB3AB" : "#FFFFFF"); P.ring.setAttribute("opacity", 1); }
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
  const st = comp.steps[S.idx];
  const cap = S.idx + "|" + scIx[view];
  if (cap !== lastCap){
    lastCap = cap;
    $("#capScn").textContent = scn().name;
    $("#capStep").textContent = `Step ${S.idx + 1} of ${comp.steps.length}`;
    $("#capText").textContent = st.text;
    $("#capYou").hidden = !involves(st, f);
  }
  const done = T >= comp.total - 900;
  const r = $("#result");
  if (done){ r.hidden = false; r.className = "result k-" + scn().result.kind; r.textContent = scn().result.text; }
  else r.hidden = true;
  const bar = $$("#chips .chip")[scIx[view]];
  if (bar) bar.querySelector(".bar").style.width = Math.min(100, T / (comp.total + HOLD) * 100) + "%";
}

function frame(ts){
  if (view !== "cards" && comp && !document.hidden && !reduce){
    if (!lastTs) lastTs = ts;
    T += Math.min(80, ts - lastTs);
    lastTs = ts;
    if (T >= comp.total + HOLD){ startScenario(((scIx[view] || 0) + 1) % tabData().scenarios.length); }
    else render();
  } else lastTs = 0;
  requestAnimationFrame(frame);
}

$$(".tab").forEach(b => b.onclick = () => enterView(b.dataset.view));
$(".tabs").addEventListener("keydown", e => {
  const i = VIEWS.indexOf(view);
  if (e.key === "ArrowRight" || e.key === "ArrowLeft"){
    const n = VIEWS[(i + (e.key === "ArrowRight" ? 1 : 3)) % 4]; enterView(n); $(`.tab[data-view="${n}"]`).focus();
  }
});
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (VIEWS.includes(h) && h !== view) enterView(h); });

// ---------- battle cards ----------
function cardSvg(c, mode, big){
  const Z = mode === "d" ? C.ZD : C.ZA, D = mode === "d" ? C.DD : C.DA, me_ = c.slot;
  const [x,y,w,h] = cell(Z[me_]);
  const opt = new Set(); c.p.forEach(o => o.to.forEach(k => opt.add(k)));
  let s = `<svg viewBox="0 0 100 140" aria-hidden="true"><rect width="100" height="140" fill="#1D6446"/>`;
  s += `<rect x="2" y="2" width="96" height="68" fill="${mode === "d" ? "#000" : "#FFF"}" fill-opacity="${mode === "d" ? .25 : .08}"/>`;
  s += `<g fill="none" stroke="#FFF" stroke-opacity=".2" stroke-width=".4">`;
  for (let n = 1; n <= 18; n++){ const q = cell(n); s += `<rect x="${q[0]}" y="${q[1]}" width="${q[2]}" height="${q[3]}"/>`; }
  s += `</g><g fill="none" stroke="#FFF" stroke-opacity=".55" stroke-width=".7"><rect x="2" y="2" width="96" height="136"/><rect x="21.5" y="2" width="57" height="22.4"/><rect x="21.5" y="115.6" width="57" height="22.4"/></g>`;
  s += `<line x1="2" y1="70" x2="98" y2="70" stroke="#F2B134" stroke-width="1" stroke-dasharray="3 2"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F2B134" fill-opacity=".45" stroke="#F2B134" stroke-width="1.2"/>`;
  if (big) s += `<text x="${x + 2}" y="${y + 5.5}" font-size="5" font-weight="700" fill="#0B1F3A" font-family="Barlow, sans-serif">Z${Z[me_]}</text>`;
  for (const k in D) if (k !== me_ && !opt.has(k)) s += `<circle cx="${D[k][0]}" cy="${D[k][1]}" r="2.6" fill="#FFF" fill-opacity=".45"/>`;
  const [fx, fy] = D[me_];
  c.p.forEach(o => o.to.forEach(k => { const [cx, cy] = D[k]; s += o.n === 1 ? `<line x1="${fx}" y1="${fy}" x2="${cx}" y2="${cy}" stroke="#F2B134" stroke-width="1.8"/>` : `<line x1="${fx}" y1="${fy}" x2="${cx}" y2="${cy}" stroke="#FFF" stroke-width="1.1" stroke-dasharray="3 2"/>`; }));
  s += `<circle cx="${fx}" cy="${fy}" r="4.6" fill="#0B1F3A" stroke="#F2B134" stroke-width="1.6"/>`;
  c.p.forEach(o => o.to.forEach(k => { const [cx, cy] = D[k]; s += `<circle cx="${cx}" cy="${cy}" r="5" fill="${o.n === 1 ? "#F2B134" : "#FFF"}" stroke="#0B1F3A" stroke-width=".8"/><text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="5.6" font-weight="800" fill="#0B1F3A" font-family="Barlow, sans-serif">${o.n}</text>`; }));
  return s + "</svg>";
}
function orderCards(){
  const all = C.CARDS.slice();
  if (me && me !== "coach"){ const i = all.findIndex(c => c.id === me); all.unshift(all.splice(i, 1)[0]); }
  return all;
}
function renderCards(){
  const g = $("#grid"); g.innerHTML = "";
  orderCards().forEach(c => {
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
buildWelcome();
if (me) $("#meName").textContent = me === "coach" ? "Coach view" : (me === "OG" ? "OG" : firstName(CARD[me])) + " · " + (CARD[me].bench ? "Bench" : shortRole(CARD[me]));
buildPitch();
renderCards();
const h0 = location.hash.slice(1);
view = null;
enterView(VIEWS.includes(h0) ? h0 : "without-ball");
if (!me) openWelcome();
requestAnimationFrame(frame);
})();
