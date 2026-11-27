// Pure simulation engine: compiles a scenario into a timeline and samples it at any time T (ms).
const JOG = 6.2, SPRINT = 10.5;          // units per second (about 4.4 m/s and 7.4 m/s)
const BALL_MS_PER_UNIT = 46;             // about 15 m/s pass speed
const dist = (a,b) => Math.hypot(a[0]-b[0], a[1]-b[1]);
const lerp = (a,b,t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t];
const easeIO = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
const easeOut = t => 1-Math.pow(1-t,2);
const isOpp = id => id[0]==="o" && id.length>1 && !isNaN(+id.slice(1));
const ballOff = id => isOpp(id) ? [0,2] : [0,-2];
const clone = o => { const r={}; for(const k in o) r[k]=o[k].slice(); return r; };
const label = id => isOpp(id) ? "#"+id.slice(1) : id;

function compile(sc){
  let cur = Object.assign({}, clone(sc.setup.ours), clone(sc.setup.opp));
  let holder = sc.setup.ball;
  let lastBall = null;
  let t = 0;
  const steps = [];
  sc.steps.forEach((st,i)=>{
    const s0 = clone(cur), s1 = clone(cur);
    for(const id in (st.m||{})){ if(!(id in s1)) throw new Error("unknown id "+id+" in step "+(i+1)); s1[id]=st.m[id].slice(); }
    const b = st.b || ["hold", holder];
    const kind = b[0];
    const bp = (id,s)=>{ const p=s[id]; if(!p) throw new Error("no player "+id); const o=ballOff(id); return [p[0]+o[0],p[1]+o[1]]; };
    let bs, be, flight=0, newHolder=holder, tag="", from=null, to=null, outcome=null;
    if(kind==="pass"||kind==="tackle"){
      from=b[1]; to=b[2];
      if(from!==holder) throw new Error("step "+(i+1)+": "+from+" does not have the ball (holder "+holder+")");
      bs=bp(from,s0); be=bp(to,s1); newHolder=to;
      flight = dist(bs,be)*(kind==="tackle"?28:BALL_MS_PER_UNIT);
      if(kind==="tackle") tag="won";
      else if(isOpp(from) && !isOpp(to)) tag="cut";
      else if(!isOpp(from) && isOpp(to)) tag="lost";
      else if(isOpp(from)) tag="opp";
      else { const dy=be[1]-bs[1]; tag = dy<-5 ? "forward" : dy>5 ? "back" : "sideways"; }
    } else if(kind==="shot"){
      from=b[1]; outcome=b[3];
      if(from!==holder) throw new Error("step "+(i+1)+": "+from+" does not have the ball");
      bs=bp(from,s0);
      be = outcome==="save" ? bp("o1",s1) : b[2].slice();
      newHolder = outcome==="save" ? "o1" : null;
      flight = Math.max(500, dist(bs,be)*26);
      tag = outcome==="goal" ? "goal" : outcome==="save" ? "saved" : "wide";
      to = outcome==="save" ? "o1" : null;
    } else { // carry or hold
      if(holder===null){ bs=be=lastBall; }
      else { bs=bp(holder,s0); be=bp(holder,s1); }
      if(kind==="carry"){ from=b[1]; if(from!==holder) throw new Error("step "+(i+1)+": carrier "+from+" is not the holder "+holder); }
      tag = kind;
    }
    let moveMs=0; let movers=0;
    for(const id in (st.m||{})){
      const d=dist(s0[id],s1[id]); if(d>0.01) movers++;
      const sp = (st.sp && st.sp.indexOf(id)>=0) ? SPRINT : JOG;
      moveMs=Math.max(moveMs, d/sp*1000);
    }
    const dur = Math.min(4800, Math.max(st.d||0, 850, flight, moveMs));
    const hold = st.h!=null ? st.h : 240;
    steps.push({i, kind, tag, from, to, outcome, bs, be, s0, s1, holder0:holder, holder1:newHolder, dur, hold, start:t, text:st.t, movers, flight, moveMs});
    t += dur+hold;
    cur = s1; holder = newHolder; if(be) lastBall = be;
  });
  return {steps, total:t+900, final:cur};
}

function sample(comp, T){
  T = Math.max(0, Math.min(comp.total, T));
  let idx = comp.steps.length-1;
  for(let k=0;k<comp.steps.length;k++){ if(T < comp.steps[k].start + comp.steps[k].dur + comp.steps[k].hold){ idx=k; break; } }
  const st = comp.steps[idx];
  const local = T - st.start;
  const moving = local < st.dur;
  const p = moving ? easeIO(Math.max(0,local)/st.dur) : 1;
  const pos = {};
  for(const id in st.s0) pos[id] = lerp(st.s0[id], st.s1[id], p);
  let ball, holder;
  if(st.kind==="pass"||st.kind==="tackle"||st.kind==="shot"){
    const q = moving ? easeOut(Math.max(0,local)/st.dur) : 1;
    ball = lerp(st.bs, st.be, q);
    holder = moving ? null : st.holder1;
  } else {
    ball = lerp(st.bs, st.be, p);
    holder = st.holder1;
  }
  return {T, idx, local, moving, pos, ball, holder, step:st};
}

// Running totals up to time T (completed passes only)
function tally(comp, T){
  const s = sample(comp,T);
  const c = {forward:0, sideways:0, back:0, lost:0, cut:0, passes:0, shots:0, goals:0, saved:0, wide:0, won:0};
  comp.steps.forEach((st,k)=>{
    const done = k<s.idx || (k===s.idx && !s.moving);
    if(!done) return;
    if(st.tag==="forward"||st.tag==="sideways"||st.tag==="back"){ c[st.tag]++; c.passes++; }
    if(st.tag==="lost") c.lost++;
    if(st.tag==="cut") c.cut++;
    if(st.tag==="won") c.won++;
    if(st.kind==="shot"){ c.shots++; if(st.outcome==="goal") c.goals++; if(st.outcome==="save") c.saved++; if(st.outcome==="wide") c.wide++; }
  });
  return c;
}


