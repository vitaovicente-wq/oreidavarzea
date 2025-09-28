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

// ========== LÓGICA DE CRIAÇÃO DO UNIVERSO ==========
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

function generateRoundRobin(teams) {
    const schedule = [];
    const numRounds = teams.length - 1;
    const half = teams.length / 2;
    let localTeams = [...teams];
    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];
        for (let i = 0; i < half; i++) {
            const home = localTeams[i];
            const away = localTeams[localTeams.length - 1 - i];
            roundMatches.push({ home, away });
        }
        schedule.push(roundMatches);
        const last = localTeams.pop();
        localTeams.splice(1, 0, last);
    }
    return schedule;
}

function generateSeasonFixtures(universe, userTeamName) {
    const year = 2026;
    let season = {
        year: year,
        currentDate: `${year}-01-25`,
        torneio: { phase: 'groups', groups: {}, schedule: [], table: {}, finalists: [], finalSchedule: [], finalTable: {} },
        copa: { round: 'quartas', schedule: [] },
    };
    const giganesDoBairro = universe.filter(t => t.name !== userTeamName).map(t => t.name);
    const torneioTeams = [userTeamName, ...giganesDoBairro.slice(0, 19)];
    const shuffledTorneioTeams = [...torneioTeams].sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffledTorneioTeams.slice(0, 10);
    season.torneio.groups['B'] = shuffledTorneioTeams.slice(10, 20);
    torneioTeams.forEach(name => {
        season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 };
    });

    let matchDate = new Date(season.currentDate);
    let fullSchedule = [];
    Object.values(season.torneio.groups).forEach(group => {
        const turnoRounds = generateRoundRobin([...group]);
        turnoRounds.forEach((round, index) => {
            const week = index + 1;
            let dayOfWeek = matchDate.getDay();
            let daysUntilSunday = (7 - dayOfWeek) % 7;
            let roundDate = new Date(matchDate);
            roundDate.setDate(roundDate.getDate() + (index * 7) + daysUntilSunday);
            round.forEach(match => {
                fullSchedule.push({ ...match, week, date: roundDate, played: false, competition: 'Torneio da Vila Freitas' });
            });
        });
    });
    season.torneio.schedule = fullSchedule;
    
    const copaTeams = [...torneioTeams].sort(() => 0.5 - Math.random()).slice(0, 8);
    let copaDate = new Date(season.currentDate);
    copaDate.setDate(copaDate.getDate() + (3 - copaDate.getDay() + 7) % 7); // Próxima Quarta-feira
    for(let i = 0; i < copaTeams.length; i += 2) {
        season.copa.schedule.push({ date: new Date(copaDate), home: copaTeams[i], away: copaTeams[i+1], played: false, competition: 'Copa 1º de Maio' });
    }
    
    return season;
}

// ========== MOTOR DA TEMPORADA E OUTRAS FUNÇÕES ==========
function processLastMatchResult() { /* A ser implementado */ }

function displayNextEvent() {
    const userTeamName = userData.teamName;
    const today = new Date(seasonData.currentDate);
    
    const allUserMatches = [...seasonData.torneio.schedule, ...seasonData.copa.schedule]
        .filter(m => (m.home === userTeamName || m.away === userTeamName) && !m.played)
        .sort((a,b) => new Date(a.date) - new Date(b.date));

    const nextMatch = allUserMatches[0];
    const isMatchToday = nextMatch && new Date(nextMatch.date).toDateString() === today.toDateString();

    const linkPlayMatch = document.createElement('a');
    linkPlayMatch.href = 'escalacao.html';
    const playButton = document.createElement('button');
    playButton.className = 'btn-play';
    playButton.textContent = 'Se Preparar para a Partida';
    linkPlayMatch.appendChild(playButton);

    if (isMatchToday) {
        const location = nextMatch.home === userTeamName ? 'Em Casa' : 'Fora de Casa';
        elements.nextEventCard.innerHTML = `
            <h3>Próxima Partida</h3>
            <div>
                <p class="match-details-small">Hoje! ${today.toLocaleDateString('pt-BR')} - ${nextMatch.competition}</p>
                <div class="vs">${nextMatch.home} vs ${nextMatch.away}</div>
                <p class="match-details-small">${location}</p>
            </div>
        `;
        elements.nextEventCard.appendChild(linkPlayMatch);
        linkPlayMatch.onclick = () => {
             localStorage.setItem('currentMatchInfo', JSON.stringify({ homeTeam: nextMatch.home, awayTeam: nextMatch.away, competition: nextMatch.competition }));
        };
    } else {
        elements.nextEventCard.innerHTML = `
            <h3>Próximo Evento</h3>
            <div>
                <p class="match-details-small">Data Atual: ${today.toLocaleDateString('pt-BR')}</p>
                <div class="vs">Dia de Folga / Treino</div>
                <p class="match-details-small">Próximo jogo em: ${nextMatch ? new Date(nextMatch.date).toLocaleDateString('pt-BR') : 'Fim de Temporada'}</p>
            </div>
        `;
        const advanceButton = document.createElement('button');
        advanceButton.id = 'btnAdvanceDay';
        advanceButton.className = 'btn-advance-day';
        advanceButton.textContent = 'Avançar Dia';
        elements.nextEventCard.appendChild(advanceButton);
        advanceButton.onclick = advanceDay;
    }
}

function advanceDay() {
    let currentDate = new Date(seasonData.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    seasonData.currentDate = currentDate.toISOString();
    localStorage.setItem('seasonData', JSON.stringify(seasonData));
    window.location.reload();
}

function displayTorneioTables() {
    let html = '';
    Object.keys(seasonData.torneio.groups).forEach(groupKey => {
        const group = seasonData.torneio.groups[groupKey];
        html += `<h4 class="group-title">Grupo ${groupKey}</h4>`;
        html += `<table><thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>`;
        const table = seasonData.torneio.table;
        group.sort((a, b) => {
            const statsA = table[a]; const statsB = table[b];
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

function displayCopaFixtures() {
    let html = `<h5>Quartas de Final</h5>`;
    if (seasonData.copa.schedule.length > 0) {
        seasonData.copa.schedule.forEach(match => {
            html += `<div class="copa-fixture">${match.home} vs ${match.away}</div>`;
        });
    } else {
        html = '<p class="muted">Aguardando sorteio...</p>';
    }
    elements.copaFixtures.innerHTML = html;
}

function openCalendarioModal() {
    elements.calendarioList.innerHTML = '';
    const userTeamName = userData.teamName;
    let html = '<h4>Fase de Grupos - Torneio</h4>';
    const userSchedule = seasonData.torneio.schedule.filter(m => m.home === userTeamName || m.away === userTeamName);
    userSchedule.sort((a,b) => new Date(a.date) - new Date(b.date));
    userSchedule.forEach(match => {
        const score = match.played ? `<strong>${match.score}</strong>` : "vs";
        const matchDate = new Date(match.date).toLocaleDateString('pt-BR');
        html += `<div class="calendario-fixture ${match.played ? 'played' : ''}"><span>(${matchDate})</span><span style="text-align: right;">${match.home}</span><span style="font-weight: bold;">${score}</span><span style="text-align: left;">${match.away}</span></div>`;
    });
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

    seasonData.currentDate = new Date(seasonData.currentDate);
    seasonData.torneio.schedule.forEach(m => m.date = new Date(m.date));
    if(seasonData.copa.schedule) {
        seasonData.copa.schedule.forEach(m => m.date = new Date(m.date));
    }
    
    // processLastMatchResult();
    displayNextEvent();
    displayTorneioTables();
    displayCopaFixtures();

    elements.calendarioButton.onclick = openCalendarioModal;
    elements.calendarioModalClose.onclick = () => elements.calendarioModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

init();
