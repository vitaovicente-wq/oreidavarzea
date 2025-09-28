// ========== ESTADO DO JOGO ==========
let userData = {};
let varzeaUniverse = [];
let seasonData = {};

const elements = {
    headerTitle: document.getElementById('headerTitle'),
    nextEventCard: document.getElementById('nextEventCard'),
    torneioTables: document.getElementById('torneioTables'),
    copaFixtures: document.getElementById('copaFixtures'),
    calendarioButton: document.getElementById('calendarioButton'),
    calendarioModal: document.getElementById('calendarioModal'),
    calendarioModalClose: document.getElementById('calendarioModalClose'),
    calendarioList: document.getElementById('calendarioList'),
};

function createAISquad() {
    const firsts = ["Beto", "Formiga", "Tico", "Careca", "Juninho", "Nego", "Bira", "Léo", "Tadeu", "Marcão", "Zé", "Sandro"];
    const lastParts = ["da Silva", "Souza", "Reis", "Gomes", "do Bairro", "da Padaria", "Paulista"];
    const positions = { 'Goleiro': 2, 'Lateral': 4, 'Zagueiro': 4, 'Volante': 4, 'Meia': 4, 'Atacante': 4 };
    let squad = [];
    let idCounter = 0;
    Object.keys(positions).forEach(pos => {
        for (let i = 0; i < positions[pos]; i++) {
            squad.push({ id: `ai_p${Math.round(Math.random()*10000)}_${idCounter++}`, name: `${firsts[Math.floor(Math.random() * firsts.length)]} ${lastParts[Math.floor(Math.random() * lastParts.length)]}`, pos: pos, skill: Math.floor(Math.random() * 35) + 40 });
        }
    });
    return squad;
}

function createUniverse() {
    const teamNames = [ "Tsunami da ZL", "Galácticos do Grajaú", "Ajax da Vila Sônia", "Real Madruga", "Mulekes da Vila", "Fúria do Capão Redondo", "EC Beira-Rio", "Juventus da Mooca", "Parma da Augusta", "Boca do Lixo FC", "Manchester Paulista", "PSV - Pau Sem Vontade", "Borussia do Ipiranga", "Atlético do Jaçanã", "Inter de Limão", "Só Canelas FC", "Bayern do M'Boi Mirim", "Liverpool da Cantareira", "Chelsea do Cimento", "PSG do Povo" ];
    return teamNames.map(name => ({ name, squad: createAISquad() }));
}

function generateSeasonFixtures(universe, userTeamName) {
    const currentYear = new Date().getFullYear();
    let season = {
        startDate: `${currentYear}-02-01`,
        currentDate: `${currentYear}-02-01`,
        torneio: { phase: 'groups', groups: {}, schedule: [], table: {}, finalists: [], finalSchedule: [], finalTable: {} },
        copa: { schedule: [] },
    };
    const shuffledUniverse = [...universe].sort(() => 0.5 - Math.random());
    const torneioTeams = [userTeamName, ...shuffledUniverse.slice(0, 7).map(t => t.name)];
    const shuffledTorneioTeams = [...torneioTeams].sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffledTorneioTeams.slice(0, 4);
    season.torneio.groups['B'] = shuffledTorneioTeams.slice(4, 8);
    torneioTeams.forEach(name => { season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }; });

    let fullSchedule = [];
    Object.values(season.torneio.groups).forEach(group => {
        const teams = group;
        // Turno (Weeks 1, 2, 3)
        fullSchedule.push({ week: 1, home: teams[0], away: teams[1] }, { week: 1, home: teams[2], away: teams[3] });
        fullSchedule.push({ week: 2, home: teams[0], away: teams[2] }, { week: 2, home: teams[1], away: teams[3] });
        fullSchedule.push({ week: 3, home: teams[0], away: teams[3] }, { week: 3, home: teams[2], away: teams[1] });
        // Returno (Weeks 4, 5, 6)
        fullSchedule.push({ week: 4, home: teams[1], away: teams[0] }, { week: 4, home: teams[3], away: teams[2] });
        fullSchedule.push({ week: 5, home: teams[2], away: teams[0] }, { week: 5, home: teams[3], away: teams[1] });
        fullSchedule.push({ week: 6, home: teams[3], away: teams[0] }, { week: 6, home: teams[1], away: teams[2] });
    });
    season.torneio.schedule = fullSchedule.map(match => ({ ...match, played: false, competition: 'Torneio da Vila Freitas' }));
    return season;
}

function processLastMatchResult() { /* ...código da função... */ }
function displayNextMatch() { /* ...código da função... */ }
function displayTorneioTables() { /* ...código da função... */ }

function openCalendarioModal() {
    elements.calendarioList.innerHTML = '';
    const userTeamName = userData.teamName;
    const userSchedule = seasonData.torneio.schedule.filter(m => m.home === userTeamName || m.away === userTeamName);
    userSchedule.sort((a,b) => a.week - b.week);

    let html = '<h4>Fase de Grupos</h4>';
    userSchedule.forEach(match => {
        const score = match.played ? `<strong>${match.score}</strong>` : "vs";
        html += `<div class="calendario-fixture ${match.played ? 'played' : ''}">
            <span>(Rodada ${match.week})</span>
            <span style="text-align: right;">${match.home}</span>
            <span style="font-weight: bold;">${score}</span>
            <span style="text-align: left;">${match.away}</span>
        </div>`;
    });

    if(seasonData.torneio.phase === 'final' && seasonData.torneio.finalists.includes(userTeamName)) {
        html += '<h4>Quadrangular Final</h4>';
        // Lógica futura para mostrar jogos da fase final
    }

    elements.calendarioList.innerHTML = html;
    elements.calendarioModal.style.display = 'block';
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

    // processLastMatchResult();
    displayNextMatch();
    displayTorneioTables();
    elements.copaFixtures.innerHTML = '<p class="muted">Aguardando início...</p>';

    elements.calendarioButton.onclick = openCalendarioModal;
    elements.calendarioModalClose.onclick = () => elements.calendarioModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

// Funções completas que eu tinha omitido
function displayNextMatch() {
    const userTeamName = userData.teamName;
    const nextMatch = seasonData.torneio.schedule.find(m => (m.home === userTeamName || m.away === userTeamName) && !m.played);
    if (nextMatch) {
        const opponentName = nextMatch.home === userTeamName ? nextMatch.away : nextMatch.home;
        const location = nextMatch.home === userTeamName ? 'Em Casa' : 'Fora de Casa';
        elements.nextEventCard.innerHTML = `<h3>Próxima Partida - Rodada ${nextMatch.week}</h3><div class="vs">${nextMatch.home} vs ${nextMatch.away}</div><p class="match-details-small">${location}</p><a id="linkPlayMatch" href="escalacao.html"><button class="btn-play">Se Preparar para a Partida</button></a>`;
        document.getElementById('linkPlayMatch').onclick = () => {
            localStorage.setItem('currentMatchInfo', JSON.stringify({ homeTeam: nextMatch.home, awayTeam: nextMatch.away, competition: 'Torneio da Vila Freitas' }));
        };
    } else {
        elements.nextEventCard.innerHTML = `<h3>Fim da Fase de Grupos!</h3><p>Aguardando o Quadrangular Final...</p>`;
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
            if (statsB.GP !== statsA.GP) return statsB.GP - statsA.GP;
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

init();
