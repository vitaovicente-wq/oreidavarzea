// js/temporada_mod1.js
// Módulo 1: gera 20 times, divide em 2 grupos de 10, gera calendário (turno+returno, 18 rodadas)
// Liga aos domingos; Copa 1º de Maio (8 times) começa às quartas (ida/volta).
// Salva no localStorage: varzeaUniverse, seasonData

(function(){
  const STORAGE = { UNIVERSE: 'varzeaUniverse', SEASON: 'seasonData', USER: 'userData' };
  const SEASON_START = '2026-01-26'; // ponto de partida (pode ajustar)
  const SUNDAY = 0, WEDNESDAY = 3;

  // ---------- util ----------
  function toDate(x){ return (x instanceof Date) ? x : new Date(x); }
  function iso(d){ return toDate(d).toISOString(); }
  function formatBR(isoStr){ return toDate(isoStr).toLocaleDateString('pt-BR'); }
  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  // ---------- criar universo ----------
  function createAISquad(){
    const firsts = ["Beto","Formiga","Tico","Careca","Juninho","Nego","Bira","Léo","Tadeu","Marcão","Zé","Sandro"];
    const last = ["da Silva","Souza","Reis","Gomes","do Bairro","da Padaria","Paulista"];
    const pos = { Goleiro:2, Lateral:4, Zagueiro:4, Volante:4, Meia:4, Atacante:4 };
    const squad = [];
    let idc = 0;
    Object.keys(pos).forEach(p=>{
      for(let i=0;i<pos[p];i++){
        squad.push({
          id: `p${Date.now()}_${idc++}_${Math.floor(Math.random()*10000)}`,
          name: `${firsts[Math.floor(Math.random()*firsts.length)]} ${last[Math.floor(Math.random()*last.length)]}`,
          pos: p,
          skill: randInt(40,80)
        });
      }
    });
    return squad;
  }

  function createUniverse(){
    const teamNames = [
      "Tsunami da ZL","Galácticos do Grajaú","Ajax da Vila Sônia","Real Madruga",
      "Mulekes da Vila","Fúria do Capão Redondo","EC Beira-Rio","Juventus da Mooca",
      "Parma da Augusta","Boca do Lixo FC","Manchester Paulista","PSV - Pau Sem Vontade",
      "Borussia do Ipiranga","Atlético do Jaçanã","Inter de Limão","Só Canelas FC",
      "Bayern do M'Boi Mirim","Liverpool da Cantareira","Chelsea do Cimento","PSG do Povo"
    ];
    return teamNames.map(n => ({ name: n, squad: createAISquad() }));
  }

  // ---------- round-robin (circle method) ----------
  function roundRobinSingle(teams){
    const arr = teams.slice();
    if(arr.length %2 !== 0) arr.push('__BYE__');
    const rounds = [];
    const n = arr.length;
    for(let r=0; r<n-1; r++){
      const pairings = [];
      for(let i=0;i<n/2;i++){
        const a = arr[i], b = arr[n-1-i];
        if(a !== '__BYE__' && b !== '__BYE__') pairings.push({ home: a, away: b });
      }
      rounds.push(pairings);
      // rotate keeping first fixed
      arr.splice(1,0,arr.pop());
    }
    return rounds; // array of rounds (each round is an array of pairings)
  }

  // ---------- gerar season (grupos + calendário + copa) ----------
  function generateSeason(universe, userTeamName){
    const season = {
      year: 2026,
      currentDate: SEASON_START,
      torneio: { groups: {}, schedule: [], table: {} },
      copa: { schedule: [] },
    };

    // ensure 20 team names
    const names = universe.map(t=>t.name).slice(0,20);
    // shuffle
    const shuffled = names.slice().sort(()=>0.5 - Math.random());

    season.torneio.groups.A = shuffled.slice(0,10);
    season.torneio.groups.B = shuffled.slice(10,20);

    // init table entries
    season.torneio.groups.A.forEach(n => season.torneio.table[n] = { P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0 });
    season.torneio.groups.B.forEach(n => season.torneio.table[n] = { P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0 });

    // generate rounds (single round robin -> 9 rounds), then mirror for returno
    ['A','B'].forEach(groupKey=>{
      const teams = season.torneio.groups[groupKey].slice();
      const single = roundRobinSingle(teams); // 9 rounds expected
      // first leg
      single.forEach((pairs, idx)=>{
        pairs.forEach(p=>{
          season.torneio.schedule.push({
            competition: 'Torneio da Vila Freitas',
            group: groupKey,
            week: idx+1,
            home: p.home,
            away: p.away,
            played: false,
            date: null
          });
        });
      });
      // return leg
      single.forEach((pairs, idx)=>{
        pairs.forEach(p=>{
          season.torneio.schedule.push({
            competition: 'Torneio da Vila Freitas',
            group: groupKey,
            week: idx+10,
            home: p.away,
            away: p.home,
            played: false,
            date: null
          });
        });
      });
    });

    // assign dates for weeks 1..18 on Sundays
    let matchDate = toDate(season.currentDate);
    // find next Sunday on or after season.currentDate
    function getNextSundayFrom(d, allowSame=true){
      const dt = new Date(d);
      const day = dt.getDay();
      let diff = (7 - day) % 7;
      if(!allowSame && diff === 0) diff = 7;
      dt.setDate(dt.getDate() + diff);
      return dt;
    }

    for(let week=1; week<=18; week++){
      // find Sunday for this week
      const sunday = getNextSundayFrom(matchDate, week===1 ? true : false);
      // assign that date to all matches with week===week
      season.torneio.schedule.filter(m=>m.week===week).forEach(m=>{
        m.date = iso(sunday);
      });
      // move matchDate to day after this sunday for next iteration
      matchDate = new Date(sunday);
      matchDate.setDate(matchDate.getDate() + 1);
    }

    // sort schedule by date
    season.torneio.schedule.sort((a,b)=> new Date(a.date) - new Date(b.date));

    // ---------- Copa 1º de Maio: pick 8 random teams (rule for 1st season) ----------
    const cupTeams = shuffled.slice().sort(()=>0.5 - Math.random()).slice(0,8);
    // pair them sequentially (random order already)
    const cupPairs = [];
    for(let i=0;i<8;i+=2) cupPairs.push({ home: cupTeams[i], away: cupTeams[i+1] });

    // schedule cup quarterfinals (first leg on next Wednesday after season start, return leg 14 days later)
    let cupDate = getNextWednesdayFrom(season.currentDate());
    function getNextWednesdayFrom(isoOrDate){
      const d = toDate(isoOrDate);
      const day = d.getDay();
      let diff = (WEDNESDAY - day + 7) % 7;
      diff = diff === 0 ? 7 : diff; // next wednesday (not same day)
      d.setDate(d.getDate() + diff);
      return d;
    }
    cupPairs.forEach((p, idx)=>{
      const firstLeg = { competition: 'Copa 1º de Maio', round: 'quartas', leg: 1, home: p.home, away: p.away, played:false, date: iso(cupDate) };
      const returnDate = new Date(cupDate); returnDate.setDate(returnDate.getDate() + 14);
      const secondLeg = { competition: 'Copa 1º de Maio', round: 'quartas', leg: 2, home: p.away, away: p.home, played:false, date: iso(returnDate) };
      season.copa.schedule.push(firstLeg, secondLeg);
      // move cupDate 7 days for next pairing scheduling convenience
      cupDate.setDate(cupDate.getDate() + 7);
    });

    // finalize
    return season;
  }

  // ---------- rendering helpers ----------
  function ensureElements(){
    const els = {};
    els.headerTitle = document.getElementById('headerTitle');
    els.torneioTables = document.getElementById('torneioTables');
    els.copaFixtures = document.getElementById('copaFixtures');
    els.mainContent = document.querySelector('.main-content') || document.body;
    // if copaFixtures missing, create it under main content after torneioTables
    if(!els.copaFixtures){
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = '<h3>Copa 1º de Maio</h3><div id="copaFixtures"><p class="muted">Gerando agenda da Copa...</p></div>';
      // append after torneioTables if exists
      if(els.torneioTables && els.torneioTables.parentNode) els.torneioTables.parentNode.appendChild(card);
      else els.mainContent.appendChild(card);
      els.copaFixtures = document.getElementById('copaFixtures');
    }
    // add full calendar container if not exists
    let calendar = document.getElementById('fullCalendar');
    if(!calendar){
      calendar = document.createElement('div');
      calendar.id = 'fullCalendar';
      calendar.className = 'card';
      calendar.innerHTML = '<h3>Calendário Completo</h3><div id="calendarList"><p class="muted">Gerando calendário...</p></div>';
      // place below torneioTables
      if(els.torneioTables && els.torneioTables.parentNode) els.torneioTables.parentNode.appendChild(calendar);
      else els.mainContent.appendChild(calendar);
    }
    els.calendarList = document.getElementById('calendarList');
    return els;
  }

  function renderTables(season, els){
    if(!els.torneioTables) return;
    els.torneioTables.innerHTML = '';
    ['A','B'].forEach(gk=>{
      const title = document.createElement('div');
      title.className = 'group-title';
      title.textContent = `Grupo ${gk}`;
      els.torneioTables.appendChild(title);

      const tbl = document.createElement('table');
      tbl.innerHTML = `<thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead>`;
      const tbody = document.createElement('tbody');

      const group = season.torneio.groups[gk];
      // default stats 0 (season.torneio.table initialized)
      group.forEach((name, idx)=>{
        const s = season.torneio.table[name] || { P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0 };
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx+1}</td><td>${name}</td><td>${s.P}</td><td>${s.J}</td><td>${s.V}</td><td>${s.E}</td><td>${s.D}</td><td>${s.GP}</td><td>${s.GC}</td><td>${s.SG}</td>`;
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      els.torneioTables.appendChild(tbl);
    });
  }

  function renderCalendar(season, els){
    const list = els.calendarList;
    if(!list) return;
    list.innerHTML = '';
    // group matches by week number (week exists for torneio, copa may have no week)
    const allMatches = [...season.torneio.schedule, ...(season.copa.schedule||[])].slice().sort((a,b)=> new Date(a.date)-new Date(b.date));
    // iterate and render
    allMatches.forEach(m=>{
      const d = formatBR(m.date);
      const div = document.createElement('div');
      div.className = 'calendar-row';
      const comp = m.competition || 'Torneio';
      const roundLabel = m.round ? ` - ${m.round}${m.leg ? ' L' + m.leg : ''}` : (m.week ? ` - Rodada ${m.week}` : '');
      div.innerHTML = `<small class="muted">${d} — ${comp}${roundLabel}</small><div class="vs">${m.home} vs ${m.away}</div>`;
      list.appendChild(div);
    });
  }

  function renderCopa(season, els){
    const c = els.copaFixtures;
    if(!c) return;
    c.innerHTML = '<h5>Agenda da Copa 1º de Maio</h5>';
    if(!season.copa || !season.copa.schedule || season.copa.schedule.length===0){
      c.innerHTML += '<p class="muted">Aguardando sorteio...</p>'; return;
    }
    const box = document.createElement('div');
    season.copa.schedule.slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(m=>{
      const d = formatBR(m.date);
      const el = document.createElement('div');
      el.className = 'copa-fixture';
      el.innerHTML = `<small class="muted">${d}</small><br>${m.home} vs ${m.away} ${m.leg ? ` — L${m.leg}` : ''}`;
      box.appendChild(el);
    });
    c.appendChild(box);
  }

  // ---------- bootstrap ----------
  function init(){
    // load or create universe
    let universe = JSON.parse(localStorage.getItem(STORAGE.UNIVERSE) || 'null');
    if(!universe || !Array.isArray(universe) || universe.length < 20){
      universe = createUniverse();
      localStorage.setItem(STORAGE.UNIVERSE, JSON.stringify(universe));
    }

    // ensure user team exists (simple)
    let user = JSON.parse(localStorage.getItem(STORAGE.USER) || 'null');
    if(!user){
      user = { teamName: universe[0].name };
      localStorage.setItem(STORAGE.USER, JSON.stringify(user));
    }

    // load or create season
    let season = JSON.parse(localStorage.getItem(STORAGE.SEASON) || 'null');
    if(!season){
      season = generateSeason(universe, user.teamName);
      localStorage.setItem(STORAGE.SEASON, JSON.stringify(season));
    }

    // ensure elements
    const els = ensureElements();
    if(els.headerTitle) els.headerTitle.textContent = user.teamName || 'O Rei da Várzea';

    // render
    renderTables(season, els);
    renderCalendar(season, els);
    renderCopa(season, els);

    // expose for debugging
    window._varzea_mod1 = { universe, season, reRender: ()=>{ const s = JSON.parse(localStorage.getItem(STORAGE.SEASON)); const e = ensureElements(); renderTables(s,e); renderCalendar(s,e); renderCopa(s,e); } };
  }

  // run
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
