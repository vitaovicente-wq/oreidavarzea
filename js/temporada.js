// ========== ESTADO DO JOGO ==========
let userData = {};
let varzeaUniverse = [];
let seasonData = {};

const elements = {
    headerTitle: document.getElementById('headerTitle'),
    nextMatchTitle: document.getElementById('nextMatchTitle'),
    nextMatchInfo: document.getElementById('nextMatchInfo'),
    linkPlayMatch: document.getElementById('linkPlayMatch'),
    torneioTables: document.getElementById('torneioTables'),
    copaFixtures: document.getElementById('copaFixtures'),
};

function createAISquad() { /* ... (código completo da função, sem alterações) ... */ }
function createUniverse() { /* ... (código completo da função, sem alterações) ... */ }

function generateSeasonFixtures(universe, userTeamName) {
    let season = {
        currentWeek: 1,
        torneio: {
            phase: 'groups',
            groups: {},
            schedule: [],
            table: {}
        },
    };
    const giganesDoBairro = universe.slice(0, 19).map(t => t.name); // Pega 19 times de IA
    const torneioTeams = [userTeamName, ...giganesDoBairro];
    
    const shuffledTeams = [...torneioTeams].sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffledTeams.slice(0, 10);
    season.torneio.groups['B'] = shuffledTeams.slice(10, 20);

    torneioTeams.forEach(name => {
        season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 };
    });

    let schedule = [];
    Object.values(season.torneio.groups).forEach(group => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                schedule.push({ home: group[i], away: group[j] }); // Turno
                schedule.push({ home: group[j], away: group[i] }); // Returno
            }
        }
    });

    schedule.sort(() => 0.5 - Math.random());
    season.torneio.schedule = schedule.map((match, index) => ({
        ...match,
        week: Math.floor(index / 10) + 1, // 10 jogos por rodada
        played: false
    }));

    return season;
}

function updateTableStats(result, table) { /* ... (código completo da função, sem alterações) ... */ }
function simulateAIMatch(homeTeamName, awayTeamName) { /* ... (código completo da função, sem alterações) ... */ }

function processLastMatchResult() {
    const result = JSON.parse(localStorage.getItem('lastMatchResult'));
    if (!result) return;

    updateTableStats(result, seasonData.torneio.table);

    const matchIndex = seasonData.torneio.schedule.findIndex(m => m.home === result.homeTeam && m.away === result.awayTeam);
    if(matchIndex > -1) {
        seasonData.torneio.schedule[matchIndex].played = true;
    }

    const weekOfLastMatch = seasonData.torneio.schedule[matchIndex]?.week;
    if(weekOfLastMatch){
        const otherMatches = seasonData.torneio.schedule.filter(m => m.week === weekOfLastMatch && !m.played);
        otherMatches.forEach(match => {
            const aiResult = simulateAIMatch(match.home, match.away);
            updateTableStats(aiResult, seasonData.torneio.table);
            match.played = true;
        });
    }

    localStorage.setItem('seasonData', JSON.stringify(seasonData));
    localStorage.removeItem('lastMatchResult');
}

function displayNextMatch() {
    const userTeamName = userData.teamName;
    const nextMatch = seasonData.torneio.schedule.find(m => (m.home === userTeamName || m.away === userTeamName) && !m.played);
    
    if (nextMatch) {
        elements.nextMatchTitle.textContent = `Próxima Partida - Rodada ${nextMatch.week}`;
        const location = nextMatch.home === userTeamName ? 'Em Casa' : 'Fora de Casa';
        elements.nextMatchInfo.innerHTML = `
            <div class="vs">${nextMatch.home} vs ${nextMatch.away}</div>
            <p class="match-details-small">${location}</p>
        `;
        localStorage.setItem('currentMatchInfo', JSON.stringify({
            homeTeam: nextMatch.home,
            awayTeam: nextMatch.away,
            competition: 'Torneio da Vila Freitas'
        }));
    } else {
        elements.nextMatchTitle.textContent = 'Fim da Fase de Grupos!';
        elements.nextMatchInfo.innerHTML = `<p>Calculando classificados...</p>`;
        elements.linkPlayMatch.style.display = 'none';
        // Aqui entrará a lógica do mata-mata no futuro
    }
}

function displayTorneioTables() {
    let html = '';
    Object.keys(seasonData.torneio.groups).forEach(groupKey => {
        const group = seasonData.torneio.groups[groupKey];
        html += `<h4 class="group-title">Grupo ${groupKey}</h4>`;
        html += `<table><thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>`;
        const table = seasonData.torneio.table;
        group.sort((a, b) => {
            const statsA = table[a];
            const statsB = table[b];
            if (statsB.P !== statsA.P) return statsB.P - statsA.P;
            if (statsB.SG !== statsA.SG) return statsB.SG - statsA.SG;
            return 0;
        });
        group.forEach((teamName, index) => {
            const stats = table[teamName];
            html += `<tr><td>${index + 1}</td><td>${teamName}</td><td>${stats.P}</td><td>${stats.J}</td><td>${stats.V}</td><td>${stats.E}</td><td>${stats.D}</td><td>${stats.GP}</td><td>${stats.GC}</td><td>${stats.SG}</td></tr>`;
        });
        html += `</tbody></table>`;
    });
    elements.torneioTables.innerHTML = html;
}

function init() {
    userData = JSON.parse(localStorage.getItem('userData')) || {};
    varzeaUniverse = JSON.parse(localStorage.getItem('varzeaUniverse')) || [];
    let storedSeason = localStorage.getItem('seasonData');
    
    elements.headerTitle.textContent = userData.teamName || 'O Rei da Várzea';

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
}
// Funções omitidas para brevidade, mas que devem estar no seu arquivo
function createAISquad() { const firsts = ["Beto", "Formiga", "Tico", "Careca", "Juninho", "Nego", "Bira", "Léo", "Tadeu", "Marcão", "Zé", "Sandro"]; const lastParts = ["da Silva", "Souza", "Reis", "Gomes", "do Bairro", "da Padaria", "Paulista"]; const positions = { 'Goleiro': 2, 'Lateral': 4, 'Zagueiro': 4, 'Volante': 4, 'Meia': 4, 'Atacante': 4 }; let squad = []; let idCounter = 0; Object.keys(positions).forEach(pos => { for (let i = 0; i < positions[pos]; i++) { squad.push({ id: `ai_p${Math.round(Math.random()*10000)}_${idCounter++}`, name: `${firsts[Math.floor(Math.random() * firsts.length)]} ${lastParts[Math.floor(Math.random() * lastParts.length)]}`, pos: pos, skill: Math.floor(Math.random() * 35) + 40 }); } }); return squad; }
function createUniverse() { const teamNames = [ "Tsunami da ZL", "Galácticos do Grajaú", "Ajax da Vila Sônia", "Real Madruga", "Mulekes da Vila", "Fúria do Capão Redondo", "EC Beira-Rio", "Juventus da Mooca", "Parma da Augusta", "Boca do Lixo FC", "Manchester Paulista", "PSV - Pau Sem Vontade", "Borussia do Ipiranga", "Atlético do Jaçanã", "Inter de Limão", "Só Canelas FC", "Bayern do M'Boi Mirim", "Liverpool da Cantareira", "Chelsea do Cimento", "PSG do Povo" ]; return teamNames.map(name => ({ name, squad: createAISquad() })); }
function updateTableStats(result, table) { const { homeTeam, awayTeam, homeScore, awayScore } = result; if (!table[homeTeam] || !table[awayTeam]) return; table[homeTeam].J++; table[awayTeam].J++; table[homeTeam].GP += homeScore; table[homeTeam].GC += awayScore; table[awayTeam].GP += awayScore; table[awayTeam].GC += homeScore; table[homeTeam].SG = table[homeTeam].GP - table[homeTeam].GC; table[awayTeam].SG = table[awayTeam].GP - table[awayTeam].GC; if (homeScore > awayScore) { table[homeTeam].V++; table[awayTeam].D++; table[homeTeam].P += 3; } else if (awayScore > homeScore) { table[awayTeam].V++; table[homeTeam].D++; table[awayTeam].P += 3; } else { table[homeTeam].E++; table[awayTeam].E++; table[homeTeam].P += 1; table[awayTeam].P += 1; } }
function simulateAIMatch(homeTeamName, awayTeamName) { const homeTeam = varzeaUniverse.find(t => t.name === homeTeamName); const awayTeam = varzeaUniverse.find(t => t.name === awayTeamName); if(!homeTeam || !awayTeam) return { homeTeam: homeTeamName, awayTeam: awayTeamName, homeScore: 0, awayScore: 0}; const avgSkillHome = homeTeam.squad.reduce((sum, p) => sum + p.skill, 0) / homeTeam.squad.length; const avgSkillAway = awayTeam.squad.reduce((sum, p) => sum + p.skill, 0) / awayTeam.squad.length; let homeScore = 0; let awayScore = 0; const skillDiff = avgSkillHome - avgSkillAway; const homeWinProb = 50 + (skillDiff * 1.5); const rand = Math.random() * 100; if (rand < homeWinProb - 15) { homeScore = Math.floor(Math.random() * 3) + 1; awayScore = Math.floor(Math.random() * 2); if(homeScore <= awayScore) homeScore = awayScore + 1; } else if (rand < homeWinProb + 15) { homeScore = Math.floor(Math.random() * 3); awayScore = homeScore; } else { awayScore = Math.floor(Math.random() * 3) + 1; homeScore = Math.floor(Math.random() * 2); if(homeScore >= awayScore) homeScore = awayScore - 1; } return { homeTeam: homeTeamName, awayTeam: awayTeamName, homeScore: Math.max(0, homeScore), awayScore: Math.max(0, awayScore) }; }

init();
