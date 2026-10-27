/* api.js — talks to the Jolpica F1 API (Ergast-compatible, no key needed) */
const get = async p => { const r = await fetch(API + p); if(!r.ok) throw new Error(r.status); return (await r.json()).MRData; };
// Fetches everything, stores it in S, then calls render()
async function load(){
  try{
    const [sch, ds, cs, lr] = await Promise.all([
      get('current.json'), get('current/driverStandings.json'),
      get('current/constructorStandings.json'), get('current/last/results.json').catch(()=>null)
    ]);
    S.races = sch.RaceTable.Races;
    S.season = sch.RaceTable.season;
    const dl = ds.StandingsTable.StandingsLists[0] || {DriverStandings:[],round:0};
    const cl = cs.StandingsTable.StandingsLists[0] || {ConstructorStandings:[]};
    S.drivers = dl.DriverStandings; S.rounds = dl.round; S.teams = cl.ConstructorStandings;
    S.last = lr && lr.RaceTable.Races[0] || null;
    $('err').style.display='none';
    $('upd').textContent = 'Live · synced ' + new Date().toLocaleTimeString();
    render();
  }catch(e){
    $('err').style.display='block';
    $('err').textContent = 'Could not reach the F1 data API — showing last known data. Retrying automatically.';
  }
}

