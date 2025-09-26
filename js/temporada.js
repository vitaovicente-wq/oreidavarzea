// ========== ESTADO DO JOGO ==========
let userData = {};
let varzeaUniverse = [];
let seasonData = {};

const elements = {
    headerTitle: document.getElementById('headerTitle'),
    nextMatchInfo: document.getElementById('nextMatchInfo'),
    linkPlayMatch: document.getElementById('linkPlayMatch'),
    torneioTables: document.getElementById('torneioTables'),
    copaFixtures: document.getElementById('copaFixtures'),
};

// ========== LÓGICA DE CRIAÇÃO DO UNIVERSO ==========
function createAISquad() {
    const firsts = ["Beto", "Formiga", "Tico", "Careca", "Juninho", "Nego", "Bira", "Léo", "Tadeu", "Marcão", "Zé", "Sandro"];
    const lastParts = ["da Silva", "Souza", "Reis", "Gomes", "do Bairro", "da Padaria", "Paulista"];
    const positions = { 'Goleiro': 2, 'Lateral': 4, 'Zagueiro': 4, 'Volante': 4, 'Meia': 4, 'Atacante': 4 };
    let squad = [];
    let idCounter = 0;
    Object.keys(positions).forEach(pos => {
        for (let i = 0; i < positions[pos]; i++) {
            squad.push({
                id: `ai_p${Math.round(Math.random()*10000)}_${idCounter++}`,
                name: `${firsts[Math.floor(Math.random() * firsts.length)]} ${lastParts[Math.floor(Math.random() * lastParts.length)]}`,
                pos: pos,
                skill: Math.floor(Math.random() * 35) + 40
            });
        }
    });
    return squad;
}

function createUniverse() {
    const teamNames = [ "Tsunami da ZL", "Galácticos do Grajaú", "Ajax da Vila Sônia", "Real Madruga", "Mulekes da Vila", "Fúria do Capão Redondo", "EC Beira-Rio", "Juventus da Mooca", "Parma da Augusta", "Boca do Lixo FC", "Manchester Paulista", "PSV - Pau Sem Vontade", "Borussia do Ipiranga", "Atlético do Jaçanã", "Inter de Limão", "Só Canelas FC", "Bayern do M'Boi Mirim", "Liverpool da Cantareira", "Chelsea do Cimento", "PSG do Povo" ];
    return teamNames.map(name => ({ name, squad: createAISquad() }));
}

function generateSeasonFixtures(universe, userTeamName) {
    let season = {
        currentWeek: 1,
        torneio: { groups: {}, schedule: [], table: {} },
        copa: { schedule: [] },
    };
    const shuffledUniverse = [...universe].sort(() => 0.5 - Math.random());
    const torneioTeams = [userTeamName, ...shuffledUniverse.slice(0, 7).map(t => t.name)];
    const shuffledTorneioTeams = [...torneioTeams].sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffledTorneioTeams.slice(0, 4);
    season.torneio.groups['B'] = shuffledTorneioTeams.slice(4, 8);
    torneioTeams.forEach(name => { season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }; });
    
    let schedule = [];
    Object.values(season.torneio.groups).forEach(group => {
        const teams = group;
        // Turno
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                schedule.push({ home: teams[i], away: teams[j] });
            }
        }
        // Returno
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                schedule.push({ home: teams[j], away: teams[i] }); // Inverte mandante
            }
        }
    });
    
    schedule.sort(() => 0.5 - Math.random()); // Embaralha a ordem dos jogos
    season.torneio.schedule = schedule.map((match, index) => ({ ...match, week: Math.floor(index / 4) + 1, played: false })); // 4 jogos por semana (2 por grupo)
    
    return season;
}

// ========== MOTOR DA TEMPORADA ==========
function updateTableStats(result, table) {
    const { homeTeam, awayTeam, homeScore, awayScore } = result;
    if (!table[homeTeam] || !table[awayTeam]) return;

    table[homeTeam].J++; table[awayTeam].J++;
    table[homeTeam].GP += homeScore; table[homeTeam].GC += awayScore;
    table[awayTeam].GP += awayScore; table[awayTeam].GC += homeScore;
    table[homeTeam].SG = table[homeTeam].GP - table[homeTeam].GC;
    table[awayTeam].SG = table[awayTeam].GP - table[awayTeam].GC;

    if (homeScore > awayScore) {
        table[homeTeam].V++; table[awayTeam].D++; table[homeTeam].P += 3;
    } else if (awayScore > homeScore) {
        table[awayTeam].V++; table[homeTeam].D++; table[awayTeam].P += 3;
    } else {
        table[homeTeam].E++; table[awayTeam].E++; table[homeTeam].P += 1; table[awayTeam].P += 1;
    }
}

function simulateAIMatch(homeTeamName, awayTeamName) {
    const homeTeam = varzeaUniverse.find(t => t.name === homeTeamName);
    const awayTeam = varzeaUniverse.find(t => t.name === awayTeamName);
    const avgSkillHome = homeTeam.squad.reduce((sum, p) => sum + p.skill, 0) / homeTeam.squad.length;
    const avgSkillAway = awayTeam.squad.reduce((sum, p) => sum + p.skill, 0) / awayTeam.squad.length;
    let homeScore = 0; let awayScore = 0;
    const skillDiff = avgSkillHome - avgSkillAway;
    const homeWinProb = 50 + (skillDiff * 1.5);
    const rand = Math.random() * 100;

    if (rand < homeWinProb - 15) {
        homeScore = Math.floor(Math.random() * 3) + 1;
        awayScore = Math.floor(Math.random() * 2);
        if(homeScore === awayScore) homeScore++;
    } else if (rand < homeWinProb + 15) {
        homeScore = Math.floor(Math.random() * 3);
        awayScore = homeScore;
    } else {
        awayScore = Math.floor(Math.random() * 3) + 1;
        homeScore = Math.floor(Math.random() * 2);
        if(homeScore === awayScore) awayScore++;
    }
    return { homeTeam: homeTeamName, awayTeam: awayTeamName, homeScore, awayScore };
}

function processLastMatchResult() {
    const result = JSON.parse(localStorage.getItem('lastMatchResult'));
    if (!result) return;

    updateTableStats(result, seasonData.torneio.table);
    
    const matchIndex = seasonData.torneio.schedule.findIndex(m => m.home === result.homeTeam && m.away === result.awayTeam);
    let weekOfLastMatch = 0;
    if(matchIndex > -1) {
        seasonData.torneio.schedule[matchIndex].played = true;
        weekOfLastMatch = seasonData.torneio.schedule[matchIndex].week;
    }
    
    const otherMatches = seasonData.torneio.schedule.filter(m => m.week === weekOfLastMatch && !m.played);
    otherMatches.forEach(match => {
        const aiResult = simulateAIMatch(match.home, match.away);
        updateTableStats(aiResult, seasonData.torneio.table);
        match.played = true;
    });

    const currentWeekMatches = seasonData.torneio.schedule.filter(m => m.week === seasonData.currentWeek);
    const allPlayed = currentWeekMatches.every(m => m.played);
    if(allPlayed && seasonData.currentWeek <= 6){
        seasonData.currentWeek++;
    }

    localStorage.setItem('seasonData', JSON.stringify(seasonData));
    localStorage.removeItem('lastMatchResult');
}

// ========== LÓGICA DE EXIBIÇÃO ==========
function displayNextMatch() {
    const userTeamName = userData.teamName;
    const nextMatch = seasonData.torneio.schedule.find(m => (m.home === userTeamName || m.away === userTeamName) && !m.played);
    
    if (nextMatch) {
        const opponentName = nextMatch.home === userTeamName ? nextMatch.away : nextMatch.home;
        const location = nextMatch.home === userTeamName ? 'Em Casa' : 'Fora de Casa';
        elements.nextMatchInfo.innerHTML = `
            <p class="match-details-small">Torneio da Vila Freitas - Rodada ${nextMatch.week}</p>
            <div class="vs">${nextMatch.home} vs ${nextMatch.away}</div>
            <p class="match-details-small">${location}</p>
        `;
        localStorage.setItem('currentMatchInfo', JSON.stringify({
            homeTeam: nextMatch.home,
            awayTeam: nextMatch.away,
            competition: 'Torneio da Vila Freitas'
        }));
    } else {
        elements.nextMatchInfo.innerHTML = `<p style="font-weight:bold; font-size: 1.2em;">Fim da Fase de Grupos!</p>`;
        elements.linkPlayMatch.style.display = 'none';
    }
}

function displayTorneioTables() {
    let html = '';
    Object.keys(seasonData.torneio.groups).forEach(groupKey => {
        const group = seasonData.torneio.groups[groupKey];
        html += `<h4 class="group-title">Grupo ${groupKey}</h4>`;
        html += `<table><thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>`;
        group.sort((a, b) => {
            const statsA = seasonData.torneio.table[a];
            const statsB = seasonData.torneio.table[b];
            if (statsB.P !== statsA.P) return statsB.P - statsA.P;
            if (statsB.SG !== statsA.SG) return statsB.SG - statsA.SG;
            if (statsB.GP !== statsA.GP) return statsB.GP - statsA.GP;
            return 0;
        });
        group.forEach((teamName, index) => {
            const stats = seasonData.torneio.table[teamName];
            html += `<tr><td>${index + 1}</td><td>${teamName}</td><td>${stats.P}</td><td>${stats.J}</td><td>${stats.V}</td><td>${stats.E}</td><td>${stats.D}</td><td>${stats.GP}</td><td>${stats.GC}</td><td>${stats.SG}</td></tr>`;
        });
        html += `</tbody></table>`;
    });
    elements.torneioTables.innerHTML = html;
}

function init() {
    userData = JSON.parse(localStorage.getItem('userData')) || {};
    elements.headerTitle.textContent = userData.teamName || 'O Rei da Várzea';
    let storedSeason = localStorage.getItem('seasonData');
    varzeaUniverse = JSON.parse(localStorage.getItem('varzeaUniverse')) || [];
    
    if (storedSeason) {
        seasonData = JSON.parse(storedSeason);
    } else {
        if(varzeaUniverse.length === 0){
            varzeaUniverse = createUniverse();
            localStorage.setItem('varzeaUniverse', JSON.stringify(varzeaUniverse));
        }
        seasonData = generateSeasonFixtures(varzeaUniverse, userData.teamName);
        localStorage.setItem('seasonData', JSON.stringify(seasonData));
    }

    processLastMatchResult();

    displayNextMatch();
    displayTorneioTables();
    elements.copaFixtures.innerHTML = '<p class="muted">Aguardando início...</p>';
}

init();
