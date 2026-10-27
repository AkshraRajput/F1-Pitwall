/* app.js — helpers, rendering and the live update loops */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2,'0');
const col = id => COLORS[id] || '#999';
const flag = c => FLAGS[c] || '🏁';
const rdate = r => new Date(r.date + 'T' + (r.time || '12:00:00Z'));
const fmtRange = r => { const d = rdate(r), s = new Date(d - 2*864e5); const m = x => x.toLocaleString('en',{month:'short'}); return s.getMonth()===d.getMonth() ? `${m(s)} ${pad(s.getDate())}–${pad(d.getDate())}` : `${m(s)} ${pad(s.getDate())}–${m(d)} ${d.getDate()}`; };


function render(){
  const now = Date.now();
  S.next = S.races.find(r => rdate(r).getTime() + 2*36e5 > now) || null;
  $('yr').textContent = S.season;
  renderTicker(); renderHero(); renderCal(); renderDrivers(); renderTeams(); renderIntel(); renderStats();
}

function renderTicker(){
  const d = S.drivers, t = S.teams, L = S.last;
  const fl = L && L.Results.find(x => x.FastestLap && x.FastestLap.rank==='1');
  const fav = d.find(x => x.Driver.driverId===CFG.favDriver), favT = t.find(x => x.Constructor.constructorId===CFG.favTeam);
  const riv = d.find(x => x.Driver.driverId===CFG.rival);
  const items = [];
  if(fl) items.push(`<span class="m">FL</span><b>${esc(fl.Driver.familyName.toUpperCase())}</b>${esc(fl.FastestLap.Time.time)}`);
  if(L) items.push(`<i>LAST RACE</i><b>${esc(L.raceName.toUpperCase())}</b>${esc(L.Results[0].Driver.familyName.toUpperCase())} P1`);
  if(riv) items.push(`<span class="r">${esc(riv.Driver.code)}</span><b>−${d[0].points - riv.points}</b>P${riv.position}`);
  if(fav) items.push(`<i>★ FAV DRIVER</i><b>${esc(fav.Driver.familyName.toUpperCase())}</b>P${fav.position}`);
  if(favT) items.push(`<span class="m">★ FAV TEAM</span><b>${esc(favT.Constructor.name.toUpperCase())}</b>P${favT.position}`);
  if(d[0]) items.push(`<span class="r">WDC</span><b>${esc(d[0].Driver.familyName.toUpperCase())}</b>${d[0].points} PTS`);
  if(t[0]) items.push(`<span class="m">WCC</span><b>${esc(t[0].Constructor.name.toUpperCase())}</b>${t[0].points} PTS`);
  const html = items.join('<span class="d">◆</span>');
  $('ticker').innerHTML = html + '<span class="d">◆</span>' + html + '<span class="d">◆</span>';
}

function renderHero(){
  const r = S.next, h = $('hero');
  if(!r){ h.innerHTML = `<div><div class="badge mono">◆ Season complete</div><h2>That's a <em>wrap.</em></h2><p>All ${S.races.length} rounds are done. See you at lights out next season.</p></div><div></div>`; return; }
  const loc = r.Circuit.Location;
  const sess = [['Practice 1',r.FirstPractice],['Qualifying',r.Qualifying],['Race',{date:r.date,time:r.time}]].filter(x=>x[1]);
  const words = r.raceName.split(' '); const last2 = words.slice(-2).join(' '), first = words.slice(0,-2).join(' ');
  h.innerHTML = `<div>
    <span class="badge mono">◆ Round ${pad(r.round)} · Up next</span> <span style="font-size:36px;margin-left:12px;vertical-align:-4px">${flag(loc.country)}</span>
    <h2>${esc(first)} <em>${esc(last2)}</em></h2>
    <p>${esc(r.Circuit.circuitName)} · ${esc(loc.locality)}, ${esc(loc.country)}<br>Round ${r.round} of ${S.races.length}</p>
    <div class="facts">${sess.map(([n,s]) => `<div><small>${n}</small><span>${new Date(s.date+'T'+(s.time||'12:00:00Z')).toLocaleString('en',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div>`).join('')}</div>
  </div>
  <div><div class="cd-l mono" id="cdl">Lights out in</div>
    <div class="cd"><div><b id="cd-d">00</b><small>DAYS</small></div><div><b id="cd-h">00</b><small>HOURS</small></div><div><b id="cd-m">00</b><small>MINS</small></div><div><b id="cd-s">00</b><small>SECS</small></div></div></div>`;
  tick();
}
function tick(){
  const r = S.next; if(!r || !$('cd-d')) return;
  let ms = rdate(r) - Date.now();
  const live = ms <= 0; $('cdl').textContent = live ? 'Race in progress · lights are out' : 'Lights out in';
  if(live) ms = 0;
  const s = Math.floor(ms/1000);
  $('cd-d').textContent = pad(Math.floor(s/86400)); $('cd-h').textContent = pad(Math.floor(s%86400/3600));
  $('cd-m').textContent = pad(Math.floor(s%3600/60)); $('cd-s').textContent = pad(s%60);
  const d = new Date(); $('date').textContent = d.toLocaleDateString('en',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).replace(/,/g,'').replace(/ /g,' · ');
  const h = d.getHours(); $('greet').textContent = `Good ${h<12?'morning':h<17?'afternoon':'evening'}, ${CFG.name}`;
  if(live && ms===0 && Date.now() > rdate(r).getTime()+2*36e5) load();
}

function renderCal(){
  const nx = S.next ? S.next.round : null;
  $('calmeta').textContent = `${S.races.length} rounds · ${fmtRange(S.races[0]).split(' ')[0]} → ${rdate(S.races[S.races.length-1]).toLocaleString('en',{month:'short'})} ${S.season}`;
  $('cal').innerHTML = S.races.map(r => {
    const l = r.Circuit.Location, past = rdate(r) < Date.now() && r.round !== nx;
    return `<div class="race ${past?'past':''} ${r.round===nx?'next':''}"><div class="rn">R${pad(r.round)}${r.round===nx?' · NEXT':''}</div><div class="fl">${flag(l.country)}</div><div class="co mono">${esc(l.country)}</div><h4>${esc(l.locality)}</h4><div class="dt mono" style="letter-spacing:.1em">${fmtRange(r)}</div></div>`;
  }).join('');
  const n = $('cal').querySelector('.next'); if(n && !renderCal.done){ $('cal').scrollLeft = n.offsetLeft - 20; renderCal.done = true; }
}

function renderDrivers(){
  const top = S.drivers.slice(0,10), lead = +S.drivers[0]?.points || 0;
  $('dsub').textContent = `Top 10 · after ${S.rounds} round${S.rounds==1?'':'s'}`;
  $('dlist').innerHTML = top.map((x,i) => {
    const c = col(x.Constructors[0]?.constructorId), isF = x.Driver.driverId===CFG.favDriver;
    return `<div class="row ${i===0?'lead':''} ${isF?'fav':''}" style="--c:${c}"><div class="p">${pad(x.position)}</div>
      <div><div class="nm">${esc(x.Driver.givenName[0])}. ${esc(x.Driver.familyName)} <span class="tag">${esc(x.Driver.code||'')}</span></div>
      <div class="sub">${esc(x.Constructors[0]?.name)} · ${esc(x.Driver.nationality)}${i?` · −${lead-x.points}`:''}</div></div>
      ${i===0?'<span class="fb">P1</span>':isF?'<span class="fb" style="color:#c70">★ FAV</span>':''}
      <div class="pt">${x.points}<small>PTS</small></div></div>`;
  }).join('');
}

function renderTeams(){
  const lead = +S.teams[0]?.points || 1;
  $('csub').textContent = `All ${S.teams.length} teams · ${S.season}`;
  $('clist').innerHTML = S.teams.map((x,i) => {
    const id = x.Constructor.constructorId, c = col(id);
    return `<div class="row ${id===CFG.favTeam?'fav':''}" style="--c:${c}"><div class="p">${pad(x.position)}</div>
      <div><div class="nm" style="font-size:22px">${esc(x.Constructor.name)}</div><div class="sub">${esc(x.Constructor.nationality)}${x.wins>0?` · ${x.wins} win${x.wins>1?'s':''}`:''}</div></div>
      <div class="pt">${x.points}</div><div class="track"><i style="width:${Math.max(2,x.points/lead*100)}%"></i></div></div>`;
  }).join('');
}

function renderIntel(){
  const L = S.last, d = S.drivers, t = S.teams, out = [];
  const pc = ['#c9a227','#9a9a9a','#a46a3a'];
  if(L){
    const R = L.Results;
    out.push(`<div class="res"><div class="s mono">${esc(L.raceName)} · ${esc(L.Circuit.circuitName)} · Result</div>${R.slice(0,3).map((x,i)=>`<div class="pod"><b style="background:${pc[i]}">P${x.position}</b><div class="a">${esc(x.Driver.givenName)} ${esc(x.Driver.familyName)}<div>${esc(x.Constructor.name)} · #${esc(x.number)}</div></div><span>${i===0?esc(x.Time?.time||x.status):esc(x.Time?.time||x.status)}</span></div>`).join('')}</div>`);
  }
  const st = (tag,bg,h,p,n) => `<div class="story"><div class="t"><b style="background:${bg}">${tag}</b><span>0${n}</span></div><h5>${esc(h)}</h5><p>${esc(p)}</p></div>`;
  let n = 1;
  if(d.length>1) out.push(st('THE STORY','#2bb99a',`${d[0].Driver.familyName} leads the title fight by ${d[0].points-d[1].points} pts`,`${d[0].Driver.givenName} ${d[0].Driver.familyName} (${d[0].Constructors[0].name}) tops the table on ${d[0].points} points with ${d[0].wins} win${d[0].wins==1?'':'s'}. ${d[1].Driver.familyName} sits second on ${d[1].points}.`,n++));
  if(L){ const fl = L.Results.find(x=>x.FastestLap?.rank==='1'); const g = L.Results.filter(x=>+x.grid>0 && +x.position>0).sort((a,b)=>(a.grid-a.position)-(b.grid-b.position)).pop();
    if(g) out.push(st('RACE CRAFT','#0b0b0b',`${g.Driver.familyName} gained ${g.grid-g.position} places in ${L.raceName.replace(' Grand Prix','')}`,`Started P${g.grid}, finished P${g.position} for ${g.Constructor.name}.${fl?` Fastest lap went to ${fl.Driver.familyName} (${fl.FastestLap.Time.time}).`:''}`,n++)); }
  const f = d.find(x=>x.Driver.driverId===CFG.favDriver);
  if(f){ const p5 = d[4], gap = p5 && f.position>5 ? p5.points-f.points : 0; out.push(st('FAV WATCH','#f08a24',`${f.Driver.familyName} is P${f.position} on ${f.points} pts`,`${f.Constructors[0].name} driver, ${d[0].points-f.points} pts behind the leader.${gap?` Gap to P5: ${gap} pts.`:' Inside the top 5 — keep it going.'}`,n++)); }
  if(S.next) out.push(`<div class="story" style="border-left:5px solid var(--red);background:rgba(0,0,0,.04)"><div class="t"><b style="background:#0b0b0b">UP NEXT</b><span>0${n}</span></div><h5>${esc(S.next.raceName)} · ${fmtRange(S.next)}</h5><p>${esc(S.next.Circuit.circuitName)}, ${esc(S.next.Circuit.Location.locality)}. Round ${S.next.round} of ${S.races.length}.</p></div>`);
  $('intel').innerHTML = out.join('');
}

function renderStats(){
  const d = S.drivers, L = S.last; if(d.length<2) return;
  const fl = L?.Results.find(x=>x.FastestLap?.rank==='1');
  const f = d.find(x=>x.Driver.driverId===CFG.favDriver), v = d.find(x=>x.Driver.driverId===CFG.rival);
  const cell = (a,b,c,e) => `<div><small>${a}</small><b>${b}</b><p>${c}</p></div>`;
  $('stats').innerHTML =
    cell('Championship lead',`<em style="color:var(--mint)">+${d[0].points-d[1].points}</em> pts`,`${esc(d[0].Driver.familyName)} over ${esc(d[1].Driver.familyName)}`) +
    cell('Fastest lap · last race',fl?esc(fl.FastestLap.Time.time):'—',fl?`${esc(fl.Driver.familyName)} · ${esc(L.raceName.replace(' Grand Prix',''))}`:'No data') +
    cell('Fav driver',f?`<em style="color:var(--amber)">${f.points}</em> pts`:'—',f?`P${f.position} · ${esc(f.Constructors[0].name)}`:'Not in standings') +
    cell(v?esc(v.Driver.familyName)+' gap':'Rival',v?`P${v.position} <span style="color:var(--red)">·</span> −${d[0].points-v.points}`:'—',`${v?v.points:0} pts on the board`);
}

load();
setInterval(load, CFG.refreshMs);
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => { if(!document.hidden) load(); });
