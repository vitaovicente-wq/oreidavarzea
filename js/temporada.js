// js/temporada.js
// Lógica completa: Torneio da Vila Freitas (20 times, 2 grupos, turno/returno),
// Copa 1º de Maio (8 times, ida e volta), Troféu Jair Cabeça (final única).
// Salva estado em localStorage em formato consistente (datas em ISO strings).

(() => {
  // ---------- CONFIG ----------
  const STORAGE_KEYS = {
    USER: 'userData',
    UNIVERSE: 'varzeaUniverse',
    SEASON: 'seasonData'
  };

  const SEASON_START_ISO = '2026-01-26'; // Segunda - ponto de partida
  const SUNDAY = 0; // domingo getDay() === 0
  const WEDNESDAY = 3;

  // ---------- UTIL ----------
  function iso(d) { return (d instanceof Date) ? d.toISOString() : new Date(d).toISOString(); }
  function toDate(isoString) { return (isoString instanceof Date) ? isoString : new Date(isoString); }
  function formatBR(isoString) { return toDate(isoString).toLocaleDateString('pt-BR'); }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // compute a simple team strength from squad average
  function teamStrength(team) {
    if (!team || !team.squad || team.squad.length === 0) return 50;
    const avg = team.squad.reduce((s, p) => s + (p.skill || 50), 0) / team.squad.length;
    return Math.round(avg);
  }

  // ---------- DOM elements (graceful) ----------
  const elements = {
    headerTitle: document.getElementById('headerTitle'),
    nextEventCard: document.querySelector('.next-match-card'),
    nextMatchTitle: document.getElementById('nextMatchTitle'),
    nextMatchInfo: document.getElementById('nextMatchInfo'),
    linkPlayMatch: document.getElementById('linkPlayMatch'),
    torneioTables: document.getElementById('torneioTables'),
    copaFixtures: document.getElementById('copaFixtures'),
  };

  // if copaFixtures missing, create one in sidebar
  if (!elements.copaFixtures) {
    const sidebar = document.querySelector('.sidebar') || document.body;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>Copa 1º de Maio</h3><div id="copaFixtures"><p class="muted">Gerando...</p></div>';
    sidebar.appendChild(card);
    elements.copaFixtures = document.getElementById('copaFixtures');
  }

  // ---------- UNIVERSE ----------
  function createAISquad() {
    const firsts = ["Beto","Formiga","Tico","Careca","Juninho","Nego","Bira","Léo","Tadeu","Marcão","Zé","Sandro"];
    const lastParts = ["da Silva","Souza","Reis","Gomes","do Bairro","da Padaria","Paulista"];
    const positions = { 'Goleiro': 2, 'Lateral': 4, 'Zagueiro': 4, 'Volante': 4, 'Meia': 4, 'Atacante': 4 };
    let squad = [];
    let idCounter = 0;
    Object.keys(positions).forEach(pos => {
      for (let i=0;i<positions[pos];i++){
        squad.push({
          id: `ai_${Date.now()}_${idCounter++}_${Math.floor(Math.random()*10000)}`,
          name: `${firsts[Math.floor(Math.random()*firsts.length)]} ${lastParts[Math.floor(Math.random()*lastParts.length)]}`,
          pos,
          skill: Math.floor(Math.random()*35)+40
        });
      }
    });
    return squad;
  }

  function createUniverse() {
    const teamNames = [
      "Tsunami da ZL","Galácticos do Grajaú","Ajax da Vila Sônia","Real Madruga",
      "Mulekes da Vila","Fúria do Capão Redondo","EC Beira-Rio","Juventus da Mooca",
      "Parma da Augusta","Boca do Lixo FC","Manchester Paulista","PSV - Pau Sem Vontade",
      "Borussia do Ipiranga","Atlético do Jaçanã","Inter de Limão","Só Canelas FC",
      "Bayern do M'Boi Mirim","Liverpool da Cantareira","Chelsea do Cimento","PSG do Povo"
    ];
    return teamNames.map(name => ({ name, squad: createAISquad() }));
  }

  // ---------- SCHEDULE GENERATION ----------
  // round-robin for a list of team names (single round). We'll use circle method.
  function roundRobinSingle(teams) {
    const n = teams.length;
    if (n % 2 !== 0) teams.push('__BYE__');
    const rounds = [];
    const arr = teams.slice();
    const half = arr.length / 2;
    for (let r=0;r< arr.length - 1; r++){
      const pairings = [];
      for (let i=0;i<half;i++){
        const a = arr[i];
        const b = arr[arr.length - 1 - i];
        if (a !== '__BYE__' && b !== '__BYE__') pairings.push({ home: a, away: b });
      }
      rounds.push(pairings);
      // rotate (keep first fixed)
      arr.splice(1,0,arr.pop());
    }
    return rounds;
  }

  function generateSeasonFixtures(universe, userTeamName) {
    const year = 2026;
    const season = {
      year,
      currentDate: SEASON_START_ISO,
      torneio: { phase: 'groups', groups: {}, schedule: [], table: {} },
      copa: { round: 'quartas', schedule: [] },
      playoffs: { bracket: [], champion: null },
      copaChampion: null,
      supercup: { played: false, winner: null },
      prizes: {}
    };

    // build team list (20)
    const teamNames = universe.map(t => t.name).slice(0,20);
    // ensure userTeamName first if present
    const uniqueTeams = teamNames.filter(n => n !== userTeamName);
    if (userTeamName && userTeamName.length) {
      if (!uniqueTeams.includes(userTeamName)) uniqueTeams.unshift(userTeamName);
      else uniqueTeams.unshift(uniqueTeams.splice(uniqueTeams.indexOf(userTeamName),1)[0]);
    }
    // groups A and B
    const shuffled = uniqueTeams.sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffled.slice(0,10);
    season.torneio.groups['B'] = shuffled.slice(10,20);

    // initialize table entries
    season.torneio.groups.A.forEach(n => season.torneio.table[n] = { P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0 });
    season.torneio.groups.B.forEach(n => season.torneio.table[n] = { P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0 });

    // generate round-robin rounds per group (single round = 9 rounds. We'll use double round by mirroring)
    const groups = season.torneio.groups;
    let fullSchedule = [];

    Object.keys(groups).forEach(groupKey => {
      const teams = groups[groupKey].slice();
      const singleRounds = roundRobinSingle(teams); // array of rounds (each round is pairings)
      // singleRounds length = 9
      // create first leg (home as generated), then second leg (reverse home/away)
      singleRounds.forEach((pairs, idx) => {
        pairs.forEach(p => {
          fullSchedule.push({ week: idx+1, home: p.home, away: p.away, group: groupKey, competition: 'Torneio da Vila Freitas', played:false });
        });
      });
      // return leg
      singleRounds.forEach((pairs, idx) => {
        pairs.forEach(p => {
          fullSchedule.push({ week: idx+10, home: p.away, away: p.home, group: groupKey, competition: 'Torneio da Vila Freitas', played:false });
        });
      });
    });

    // assign dates: Sundays for each week sequentially, starting at season.currentDate
    let matchDate = new Date(season.currentDate);
    for (let week = 1; week <= 18; week++) {
      // move to next Sunday (or the same if start is Sunday and week===1)
      let day = matchDate.getDay();
      let daysUntilSunday = (7 - day) % 7;
      // if it's the same day (Sunday) and week>1, advance 7
      if (daysUntilSunday === 0 && week > 1) daysUntilSunday = 7;
      matchDate.setDate(matchDate.getDate() + daysUntilSunday);
      const matchesForWeek = fullSchedule.filter(m => m.week === week);
      matchesForWeek.forEach(m => {
        // clone date per match to avoid reference issues
        m.date = new Date(matchDate).toISOString();
      });
      // after scheduling that Sunday, increment matchDate by 1 so next loop calculates next Sunday
      matchDate.setDate(matchDate.getDate() + 1);
    }

    season.torneio.schedule = fullSchedule.sort((a,b) => new Date(a.date) - new Date(b.date));

    // Copa 1º de Maio - pick 8 teams randomly (first season rule)
    const copaTeams = shuffled.slice().sort(()=>0.5 - Math.random()).slice(0,8);
    // Create bracket pairs (random pairing)
    const pairs = [];
    for (let i=0;i<8;i+=2) pairs.push({ home: copaTeams[i], away: copaTeams[i+1] });

    // schedule cup first legs on next Wednesday after season start, then return legs 14 days later (every two weeks)
    let copaDate = new Date(season.currentDate);
    // move to next Wednesday
    let day = copaDate.getDay();
    let daysUntilWed = (WEDNESDAY - day + 7) % 7;
    daysUntilWed = daysUntilWed === 0 ? 7 : daysUntilWed;
    copaDate.setDate(copaDate.getDate() + daysUntilWed);

    pairs.forEach((p, idx) => {
      // first leg
      season.copa.schedule.push({
        round: 'quartas-1',
        leg: 1,
        date: new Date(copaDate).toISOString(),
        home: p.home,
        away: p.away,
        played:false,
        competition: 'Copa 1º de Maio'
      });
      // second leg 14 days later (two weeks)
      const ret = new Date(copaDate);
      ret.setDate(ret.getDate() + 14);
      season.copa.schedule.push({
        round: 'quartas-2',
        leg: 2,
        date: ret.toISOString(),
        home: p.away,
        away: p.home,
        played:false,
        competition: 'Copa 1º de Maio'
      });
      // advance copaDate 7 days for next matchup group scheduling convenience, but actual legs use explicit dates
      copaDate.setDate(copaDate.getDate() + 7);
    });

    return season;
  }

  // ---------- MATCH SIMULATION & UPDATES ----------
  // simulate a single-legged match, return {homeGoals, awayGoals, penalties?: {home,away,winner}}
  function simulateMatchObj(homeTeamObj, awayTeamObj) {
    // basic model: Poisson-like using team strength
    // average goals baseline
    const base = 1.1;
    const homeAdv = 0.25; // home field advantage
    const homeStrength = (teamStrength(homeTeamObj) / 50) * base + homeAdv;
    const awayStrength = (teamStrength(awayTeamObj) / 50) * base;

    // generate goals as small random around strength (not pure poisson for simplicity)
    const homeGoals = Math.max(0, Math.round(Math.random() * homeStrength + Math.random()*2));
    const awayGoals = Math.max(0, Math.round(Math.random() * awayStrength + Math.random()*2));

    return { homeGoals, awayGoals };
  }

  // apply result to season tables for league matches
  function applyLeagueResult(season, match, homeGoals, awayGoals) {
    const table = season.torneio.table;
    if (!table[match.home] || !table[match.away]) return;
    const h = table[match.home], a = table[match.away];
    h.J++; a.J++;
    h.GP += homeGoals; h.GC += awayGoals; h.SG = h.GP - h.GC;
    a.GP += awayGoals; a.GC += homeGoals; a.SG = a.GP - a.GC;
    if (homeGoals > awayGoals) { h.V++; a.D++; h.P += 3; }
    else if (homeGoals < awayGoals) { a.V++; h.D++; a.P += 3; }
    else { h.E++; a.E++; h.P += 1; a.P += 1; }
  }

  // ---------- CUP Two-legged helper ----------
  function decideTwoLeggedAggregate(firstLeg, secondLeg, firstRes, secondRes) {
    // aggregate: home goals for each
    const aggHome = firstRes.homeGoals + secondRes.awayGoals; // home in first leg
    const aggAway = firstRes.awayGoals + secondRes.homeGoals;
    if (aggHome > aggAway) return { winner: firstLeg.home, method: 'aggregate', aggHome, aggAway };
    if (aggHome < aggAway) return { winner: firstLeg.away, method: 'aggregate', aggHome, aggAway };
    // tied -> go to penalties
    // simulate penalties: best of randomness
    const penHome = randInt(3,5);
    const penAway = randInt(2,5);
    const winner = penHome > penAway ? firstLeg.home : firstLeg.away;
    return { winner, method: 'penalties', penalties: { home: penHome, away: penAway }, aggHome, aggAway };
  }

  // ---------- PROCESSING & ADVANCING ----------
  function getNextUnplayedMatch(season) {
    const all = [...(season.torneio.schedule||[]), ...(season.copa.schedule||[])].filter(m => !m.played);
    if (all.length === 0) return null;
    all.sort((a,b) => new Date(a.date) - new Date(b.date));
    return all[0];
  }

  function simulateAndProcessNextMatch(season, universe) {
    const next = getNextUnplayedMatch(season);
    if (!next) return { message: 'Nenhuma partida pendente.' };
    // find team objects
    const homeTeamObj = universe.find(t => t.name === next.home) || { name: next.home, squad: [] };
    const awayTeamObj = universe.find(t => t.name === next.away) || { name: next.away, squad: [] };

    // simulate
    const res = simulateMatchObj(homeTeamObj, awayTeamObj);

    // mark played and save result
    next.played = true;
    next.result = { homeGoals: res.homeGoals, awayGoals: res.awayGoals };

    // if competition is league: update table directly
    if (next.competition && next.competition.includes('Torneio')) {
      applyLeagueResult(season, next, res.homeGoals, res.awayGoals);
    }

    // if competition is Copa and it's two-legged logic, we need to wait until second leg to decide aggregate:
    if (next.competition && next.competition.includes('Copa')) {
      // find the corresponding mate leg (same teams swapped and same pair)
      // We'll check if there is an unplayed corresponding leg already played earlier
      const sameTie = season.copa.schedule.filter(s => {
        return ((s.home === next.away && s.away === next.home) || (s.home === next.home && s.away === next.away)) &&
               (s.round && s.round.startsWith('quartas')) && (s !== next);
      });
      // attempt to find the other leg for this pairing by matching teams ignoring order and same round groupings
      const matchingOtherLeg = sameTie.find(s => {
        return (s.date !== next.date) && s.played;
      });

      if (matchingOtherLeg) {
        // decide aggregate between matchingOtherLeg (played) and next (just played)
        const firstLeg = matchingOtherLeg.date < next.date ? matchingOtherLeg : next;
        const secondLeg = matchingOtherLeg.date < next.date ? next : matchingOtherLeg;
        const firstRes = firstLeg.result;
        const secondRes = secondLeg.result;
        const decision = decideTwoLeggedAggregate(firstLeg, secondLeg, firstRes, secondRes);

        // mark winner for the tie: we'll store advancement info
        // store in season.copa.winners array for building next rounds (create if needed)
        season.copa.winners = season.copa.winners || [];
        season.copa.winners.push({ winner: decision.winner, details: decision, tie: [firstLeg, secondLeg] });
      }
    }

    // update storage
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
    return { match: next, result: res };
  }

  // recompute and sort tables for display (stable)
  function getSortedGroupTable(season, groupKey) {
    const group = season.torneio.groups[groupKey];
    const table = season.torneio.table;
    const arr = group.map(name => ({ name, stats: table[name] || { P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0 } }));
    arr.sort((a,b) => {
      if (b.stats.P !== a.stats.P) return b.stats.P - a.stats.P;
      if (b.stats.SG !== a.stats.SG) return b.stats.SG - a.stats.SG;
      if (b.stats.GP !== a.stats.GP) return b.stats.GP - a.stats.GP;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }

  // after all group matches played (18 rounds), create playoffs bracket (top4 each group)
  function buildPlayoffsIfReady(season) {
    // check if any league match unplayed
    const leagueLeft = (season.torneio.schedule || []).some(m => !m.played);
    if (leagueLeft) return false;

    if (season.playoffs.bracket && season.playoffs.bracket.length > 0) return true;

    // pick top4 from each group
    const topA = getSortedGroupTable(season, 'A').slice(0,4).map(r => r.name);
    const topB = getSortedGroupTable(season, 'B').slice(0,4).map(r => r.name);

    // bracket: A1 vs B4, A2 vs B3, A3 vs B2, A4 vs B1 (two legs)
    const pairs = [
      { home: topA[0], away: topB[3] },
      { home: topA[1], away: topB[2] },
      { home: topA[2], away: topB[1] },
      { home: topA[3], away: topB[0] },
    ];

    // schedule playoff two-legged ties after last league date: for simplicity, start 7 days after last league match
    const lastLeagueDate = new Date(Math.max(...season.torneio.schedule.map(m => new Date(m.date).getTime())));
    let playDate = new Date(lastLeagueDate);
    playDate.setDate(playDate.getDate() + 7); // first leg weekend-ish; we'll use Sundays for playoffs too

    const bracket = [];
    pairs.forEach((p, idx) => {
      const firstLeg = { round: 'quarter', leg: 1, date: new Date(playDate).toISOString(), home: p.home, away: p.away, played:false, competition:'Playoffs' };
      const secondDate = new Date(playDate); secondDate.setDate(secondDate.getDate() + 7);
      const secondLeg = { round: 'quarter', leg: 2, date: secondDate.toISOString(), home: p.away, away: p.home, played:false, competition:'Playoffs' };
      bracket.push([firstLeg, secondLeg]);
      // advance playDate a bit for next tie
      playDate.setDate(playDate.getDate() + 1);
    });

    season.playoffs.bracket = bracket;
    // append playoff matches to season (for scheduling)
    bracket.forEach(tuple => season.torneio.schedule.push(...tuple));
    season.torneio.schedule.sort((a,b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
    return true;
  }

  // run playoffs when all bracket matches played -> determine champion
  function resolvePlayoffs(season) {
    if (!season.playoffs.bracket || season.playoffs.champion) return;
    // for each tie, find its two legs in season.torneio.schedule (they were appended)
    const bracket = season.playoffs.bracket;
    const winners = [];
    for (const tie of bracket) {
      const leg1 = season.torneio.schedule.find(m => m.date === tie[0].date && m.home === tie[0].home && m.away === tie[0].away);
      const leg2 = season.torneio.schedule.find(m => m.date === tie[1].date && m.home === tie[1].home && m.away === tie[1].away);
      if (!leg1 || !leg2 || !leg1.played || !leg2.played) return; // tie not resolved yet
      const decision = decideTwoLeggedAggregate(leg1, leg2, leg1.result, leg2.result);
      winners.push(decision.winner);
    }

    // now winners hold 4 teams -> semis: 1v4 and 2v3 (we'll pair winners[0] vs winners[3], winners[1] vs winners[2])
    const semis = [
      [winners[0], winners[3]],
      [winners[1], winners[2]]
    ];
    // schedule semis (two legs)
    const lastDate = new Date(Math.max(...season.torneio.schedule.map(m => new Date(m.date).getTime())));
    let base = new Date(lastDate);
    base.setDate(base.getDate() + 7);
    const semiBracket = [];
    semis.forEach((p, idx) => {
      const l1 = { round:'semi', leg:1, date: new Date(base).toISOString(), home: p[0], away: p[1], played:false, competition:'Playoffs' };
      const l2d = new Date(base); l2d.setDate(l2d.getDate() + 7);
      const l2 = { round:'semi', leg:2, date: l2d.toISOString(), home: p[1], away: p[0], played:false, competition:'Playoffs' };
      semiBracket.push([l1,l2]);
      base.setDate(base.getDate() + 1);
    });
    // append semis
    semiBracket.forEach(tuple => season.torneio.schedule.push(...tuple));
    season.playoffs.semiBracket = semiBracket;
    // now final scheduled after semis
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
    // Note: further resolution happens once those matches are played (see below)
  }

  // after semis resolved, schedule single-match final
  function maybeScheduleFinal(season) {
    if (!season.playoffs.semiBracket || season.playoffs.final) return;
    // ensure semis played and winners known
    const semis = season.playoffs.semiBracket;
    const semiWinners = [];
    for (const tie of semis) {
      const leg1 = season.torneio.schedule.find(m => m.date === tie[0].date && m.home === tie[0].home && m.away === tie[0].away);
      const leg2 = season.torneio.schedule.find(m => m.date === tie[1].date && m.home === tie[1].home && m.away === tie[1].away);
      if (!leg1 || !leg2 || !leg1.played || !leg2.played) return;
      const decision = decideTwoLeggedAggregate(leg1, leg2, leg1.result, leg2.result);
      semiWinners.push(decision.winner);
    }
    // schedule final (single match) 7 days after last semi
    const lastSemiDate = new Date(Math.max(...season.torneio.schedule.map(m => new Date(m.date).getTime())));
    const finalDate = new Date(lastSemiDate); finalDate.setDate(finalDate.getDate() + 7);
    const finalMatch = { round:'final', leg:1, date: finalDate.toISOString(), home: semiWinners[0], away: semiWinners[1], played:false, competition:'Playoffs', singleMatch:true };
    season.playoffs.final = finalMatch;
    season.torneio.schedule.push(finalMatch);
    season.torneio.schedule.sort((a,b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  }

  // after final played, pick champion
  function resolveFinalIfPlayed(season) {
    const final = season.playoffs.final;
    if (!final || !final.played) return;
    // if draw, go to penalties (simulate)
    const r = final.result;
    if (!r) return;
    if (r.homeGoals !== r.awayGoals) {
      season.playoffs.champion = (r.homeGoals > r.awayGoals) ? final.home : final.away;
    } else {
      // simulate penalties
      const ph = randInt(3,5), pa = randInt(2,5);
      season.playoffs.champion = ph > pa ? final.home : final.away;
      final.result.penalties = { home: ph, away: pa, winner: season.playoffs.champion };
    }
    // assign promotion & prize
    season.prizes.leagueChampion = season.playoffs.champion;
    season.prizes.accessTo = 'Deuses da Cidade';
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  }

  // resolve cup if its schedule complete and produce champion
  function resolveCupIfReady(season) {
    // if all copa schedule played AND winners array has 4 winners for quartas, then we need to build semis and final inside season.copa
    const copaMatches = season.copa.schedule || [];
    if (copaMatches.some(m => !m.played)) return; // wait
    // if we already have cup champion, return
    if (season.copaChampion) return;

    // Build winners array from two-legged quartas already computed when second legs were played (we stored season.copa.winners earlier)
    const winners = season.copa.winners ? season.copa.winners.map(w => w.winner) : [];
    if (winners.length !== 4) {
      // If no winners (maybe all played but we didn't populate winners), compute programmatically by matching pairs
      // We'll group quartas by pairing home/away teams ignoring order
      const pairs = {};
      copaMatches.forEach(m => {
        const key = [m.home, m.away].sort().join('||');
        pairs[key] = pairs[key] || [];
        pairs[key].push(m);
      });
      const computedWinners = [];
      Object.values(pairs).forEach(pairMatches => {
        if (pairMatches.length === 2 && pairMatches[0].played && pairMatches[1].played) {
          const a = pairMatches[0], b = pairMatches[1];
          const first = a.date < b.date ? a : b;
          const second = a.date < b.date ? b : a;
          const decision = decideTwoLeggedAggregate(first, second, first.result, second.result);
          computedWinners.push(decision.winner);
        }
      });
      if (computedWinners.length === 4) winners.push(...computedWinners);
    }

    if (winners.length !== 4) return; // wait for all quartas resolved

    // schedule semis (two legs) and final single
    // pair winners[0] vs winners[3], winners[1] vs winners[2]
    const semisPairs = [[winners[0], winners[3]],[winners[1], winners[2]]];
    const lastCupDate = new Date(Math.max(...copaMatches.map(m => new Date(m.date).getTime())));
    let base = new Date(lastCupDate); base.setDate(base.getDate()+7);

    const newMatches = [];
    semisPairs.forEach(p => {
      const l1 = { round:'semi', leg:1, date: new Date(base).toISOString(), home: p[0], away: p[1], played:false, competition:'Copa 1º de Maio' };
      const l2 = { round:'semi', leg:2, date: new Date(base).toISOString(), home: p[1], away: p[0], played:false, competition:'Copa 1º de Maio' };
      // second leg 14 days later (to mimic prior cadence)
      const l2d = new Date(base); l2d.setDate(l2d.getDate()+14); l2.date = l2d.toISOString();
      newMatches.push(l1, l2);
      base.setDate(base.getDate()+1);
    });

    // final single match 7 days after semis complete (we'll set date but resolution later)
    const finalDate = new Date(base); finalDate.setDate(finalDate.getDate()+7);
    const finalPlaceholder = { round:'final', leg:1, date: finalDate.toISOString(), home: null, away: null, played:false, competition:'Copa 1º de Maio', singleMatch:true };

    // attach to season.copa.schedule
    season.copa.schedule.push(...newMatches);
    season.copa.schedule.push(finalPlaceholder);
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  }

  // maybe set final participants after semis resolved
  function finalizeCupFinalIfSemisDone(season) {
    const final = season.copa.schedule.find(m => m.round === 'final' && m.singleMatch);
    if (!final) return;
    // find semis matches
    const semis = season.copa.schedule.filter(m => m.round === 'semi');
    // each semi pair must be resolved (two legs)
    const semiPairs = {};
    semis.forEach(m => {
      const key = [m.home, m.away].sort().join('||');
      semiPairs[key] = semiPairs[key] || [];
      semiPairs[key].push(m);
    });
    const semiWinners = [];
    for (const matches of Object.values(semiPairs)) {
      if (matches.length !== 2) return;
      if (!matches[0].played || !matches[1].played) return;
      const first = matches[0].date < matches[1].date ? matches[0] : matches[1];
      const second = matches[0].date < matches[1].date ? matches[1] : matches[0];
      const decision = decideTwoLeggedAggregate(first, second, first.result, second.result);
      semiWinners.push(decision.winner);
    }
    if (semiWinners.length !== 2) return;
    final.home = semiWinners[0];
    final.away = semiWinners[1];
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  }

  // after cup final played, set cup champion and prize
  function resolveCupFinal(season) {
    const final = season.copa.schedule.find(m => m.round === 'final' && m.singleMatch);
    if (!final || !final.played) return;
    const r = final.result;
    if (!r) return;
    if (r.homeGoals !== r.awayGoals) {
      season.copaChampion = r.homeGoals > r.awayGoals ? final.home : final.away;
    } else {
      const ph = randInt(3,5), pa = randInt(2,5);
      season.copaChampion = ph > pa ? final.home : final.away;
      final.result.penalties = { home: ph, away: pa, winner: season.copaChampion };
    }
    season.prizes.cupChampion = season.copaChampion;
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  }

  // Supercup between league champion and cup champion
  function maybeScheduleSupercup(season) {
    if (!season.playoffs.champion || !season.copaChampion) return;
    if (season.supercup.played || season.supercup.scheduled) return;
    // schedule single match 7 days after both resolved
    const lastDate = new Date(Math.max(
      ...season.torneio.schedule.map(m => new Date(m.date).getTime()),
      ...season.copa.schedule.map(m => new Date(m.date).getTime())
    ));
    const d = new Date(lastDate); d.setDate(d.getDate()+7);
    season.supercup.match = { date: d.toISOString(), home: season.playoffs.champion, away: season.copaChampion, played:false, competition:'Troféu Jair Cabeça', singleMatch:true };
    season.supercup.scheduled = true;
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  }

  // resolve supercup if played
  function resolveSupercupIfPlayed(season) {
    const m = season.supercup.match;
    if (!m || !m.played || season.supercup.played) return;
    const r = m.result;
    if (!r) return;
    if (r.homeGoals !== r.awayGoals) season.supercup.winner = r.homeGoals > r.awayGoals ? m.home : m.away;
    else {
      const ph = randInt(3,5), pa = randInt(2,5);
      season.supercup.winner = ph > pa ? m.home : m.away;
      m.result.penalties = { home: ph, away: pa, winner: season.supercup.winner };
    }
    season.supercup.played = true;
    season.prizes.supercup = season.supercup.winner;
    localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
  }

  // ---------- UI: display functions ----------
  function displayTorneioTables(season) {
    const container = elements.torneioTables;
    if (!container) return;
    container.innerHTML = '';
    ['A','B'].forEach(gk => {
      const title = document.createElement('div');
      title.className = 'group-title';
      title.textContent = `Grupo ${gk}`;
      container.appendChild(title);

      const tableEl = document.createElement('table');
      tableEl.innerHTML = `<thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead>`;
      const tbody = document.createElement('tbody');

      const sorted = getSortedGroupTable(season, gk);
      sorted.forEach((row, i) => {
        const s = row.stats;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${row.name}</td><td>${s.P}</td><td>${s.J}</td><td>${s.V}</td><td>${s.E}</td><td>${s.D}</td><td>${s.GP}</td><td>${s.GC}</td><td>${s.SG}</td>`;
        tbody.appendChild(tr);
      });
      tableEl.appendChild(tbody);
      container.appendChild(tableEl);
    });
  }

  function displayCopaFixtures(season) {
    const container = elements.copaFixtures;
    if (!container) return;
    container.innerHTML = '<h5>Agenda da Copa 1º de Maio</h5>';
    if (!season.copa || !season.copa.schedule || season.copa.schedule.length === 0) {
      container.innerHTML += '<p class="muted">Aguardando sorteio...</p>'; return;
    }
    const list = document.createElement('div');
    season.copa.schedule.slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(m => {
      const d = formatBR(m.date);
      let label = `${d} — ${m.home} vs ${m.away}`;
      if (m.round) label = `${m.round.toUpperCase()} ${m.leg ? 'L' + m.leg : ''} — ${label}`;
      if (m.singleMatch && m.round === 'final') label = `FINAL — ${label}`;
      const el = document.createElement('div');
      el.className = 'copa-fixture';
      el.innerHTML = `<small class="muted">${d}</small><br>${m.home} vs ${m.away} ${m.played ? ` — <strong>${m.result.homeGoals}x${m.result.awayGoals}</strong>` : ''}`;
      list.appendChild(el);
    });
    container.appendChild(list);
  }

  function displayNextEvent(season) {
    const next = getNextUnplayedMatch(season);
    const today = new Date(season.currentDate);
    elements.nextMatchTitle.textContent = next ? 'Próxima Partida' : 'Próximo Evento';
    if (!next) {
      elements.nextMatchInfo.innerHTML = `<p class="muted">Fim de Temporada ou nenhum jogo pendente.</p>`;
      if (elements.linkPlayMatch) elements.linkPlayMatch.style.display = 'none';
      return;
    }
    const matchDate = new Date(next.date);
    const isToday = matchDate.toDateString() === today.toDateString();
    const location = next.home === (JSON.parse(localStorage.getItem(STORAGE_KEYS.USER))||{}).teamName ? 'Em Casa' : 'Fora de Casa';
    elements.nextMatchInfo.innerHTML = `
      <p class="match-details-small">${formatBR(next.date)} - ${next.competition}${next.round ? ' - ' + next.round : ''}</p>
      <div class="vs">${next.home} vs ${next.away}</div>
      <p class="match-details-small">${location}</p>
      <p class="match-details-small">${isToday ? 'Hoje!' : ''}</p>
    `;
    if (elements.linkPlayMatch) {
      elements.linkPlayMatch.style.display = 'block';
      const btn = elements.linkPlayMatch.querySelector('button') || elements.linkPlayMatch;
      if (btn) btn.textContent = 'Simular Próimo Jogo';
      // clicking simulates the next match and refreshes UI
      elements.linkPlayMatch.onclick = (e) => {
        e.preventDefault();
        const outcome = simulateAndProcessNextMatch(season, JSON.parse(localStorage.getItem(STORAGE_KEYS.UNIVERSE)));
        // after simulation, attempt progressive tasks
        buildPlayoffsIfReady(season);
        resolvePlayoffs(season);
        maybeScheduleFinal(season);
        resolveFinalIfPlayed(season);
        resolveCupIfReady(season);
        finalizeCupFinalIfSemisDone(season);
        resolveCupFinal(season);
        maybeScheduleSupercup(season);
        // if supercup scheduled and same day, it will be in schedule; simulate next calls subsequently
        // save time advance: set currentDate to match date
        season.currentDate = next.date;
        localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
        renderAll();
      };
    }
  }

  function renderAll() {
    const season = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEASON));
    if (!season) return;
    displayTorneioTables(season);
    displayCopaFixtures(season);
    displayNextEvent(season);
    // show champions/prizes if present
    const sidebar = document.querySelector('.sidebar');
    if (season.prizes) {
      // remove old summary if exists
      const old = document.getElementById('seasonSummary');
      if (old) old.remove();
      const div = document.createElement('div');
      div.id = 'seasonSummary';
      div.className = 'card';
      let html = `<h3>Resumo da Temporada</h3>`;
      if (season.playoffs.champion) html += `<p>Campeão Liga: <strong>${season.playoffs.champion}</strong></p>`;
      if (season.copaChampion) html += `<p>Campeão Copa: <strong>${season.copaChampion}</strong></p>`;
      if (season.supercup && season.supercup.winner) html += `<p>Troféu Jair Cabeça: <strong>${season.supercup.winner}</strong></p>`;
      div.innerHTML = html;
      if (sidebar) sidebar.prepend(div);
    }
  }

  // ---------- BOOT / INIT ----------
  function init() {
    // load or create universe & season
    let universe = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNIVERSE));
    if (!universe || !Array.isArray(universe) || universe.length < 20) {
      universe = createUniverse();
      localStorage.setItem(STORAGE_KEYS.UNIVERSE, JSON.stringify(universe));
    }

    // user data placeholder
    let userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || { teamName: universe[0].name }; // default to first team
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    if (elements.headerTitle) elements.headerTitle.textContent = userData.teamName || 'O Rei da Várzea';

    let season = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEASON));
    if (!season) {
      season = generateSeasonFixtures(universe, userData.teamName);
      localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(season));
    }

    // ensure season dates are ISO strings (they are)
    // build UI actions: simulate next match button present on page as linkPlayMatch (we wired above)
    renderAll();

    // Expose some helpers for debugging via window (dev convenience)
    window._varzea = {
      universe,
      season,
      simulateNext: () => { const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEASON)); const u = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNIVERSE)); const res = simulateAndProcessNextMatch(s,u); buildPlayoffsIfReady(s); resolvePlayoffs(s); maybeScheduleFinal(s); resolveFinalIfPlayed(s); resolveCupIfReady(s); finalizeCupFinalIfSemisDone(s); resolveCupFinal(s); maybeScheduleSupercup(s); localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(s)); renderAll(); return res; },
      forceBuildPlayoffs: () => { const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEASON)); buildPlayoffsIfReady(s); localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(s)); renderAll(); },
      resetSeason: () => { localStorage.removeItem(STORAGE_KEYS.SEASON); localStorage.removeItem(STORAGE_KEYS.UNIVERSE); location.reload(); }
    };
  }

  // run init on DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
