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

function generateSeasonFixtures(universe, userTeamName) {
    const currentYear = new Date().getFullYear();
    let season = {
        year: currentYear,
        currentDate: `${currentYear}-01-25`,
        torneio: { phase: 'groups', groups: {}, schedule: [], table: {}, finalists: [], finalSchedule: [], finalTable: {} },
        copa: { round: 'quartas', schedule: [] },
    };
    const giganesDoBairro = universe.filter(t => t.name !== userTeamName).map(t => t.name);
    const torneioTeams = [userTeamName, ...giganesDoBairro.slice(0, 19)];
    const shuffledTorneioTeams = [...torneioTeams].sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffledTorneioTeams.slice(0, 10);
    season.torneio.groups['B'] = shuffledTorneioTeams.slice(10, 20);
    torneioTeams.forEach(name => { season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }; });

    let fullSchedule = [];
    let matchDate = new Date(season.currentDate);
    
    Object.values(season.torneio.groups).forEach(group => {
        const teams = group;
        const groupSchedule = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                groupSchedule.push({ home: teams[i], away: teams[j] }); // Turno
                groupSchedule.push({ home: teams[j], away: teams[i] }); // Returno
            }
        }
        fullSchedule.push(...groupSchedule);
    });

    // Atribui datas de Domingo para cada rodada
    for (let i = 0; i < 18; i++) { // 18 rodadas
        let dayOfWeek = matchDate.getDay();
        let daysUntilSunday = (7 - dayOfWeek) % 7;
        if(i > 0 && dayOfWeek === 0) daysUntilSunday = 7;
        else if (i === 0 && dayOfWeek === 0) daysUntilSunday = 0;
        matchDate.setDate(matchDate.getDate() + daysUntilSunday);
        
        const matchesForThisWeek = fullSchedule.filter(m => !m.date).slice(0, 10); // Pega 10 jogos
        matchesForThisWeek.forEach(match => {
            match.date = new Date(matchDate);
            match.week = i + 1;
            match.played = false;
            match.competition = 'Torneio da Vila Freitas';
        });
    }
    
    season.torneio.schedule = fullSchedule;
    return season;
}

// ========== MOTOR DA TEMPORADA ==========
// ... (O resto das funções permanecem as mesmas, pois o erro estava na geração)

// ========== INICIALIZAÇÃO ==========
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
    if (seasonData.copa && seasonData.copa.schedule) {
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

function displayNextEvent() {
    const userTeamName = userData.teamName;
    const today = new Date(seasonData.currentDate);
    
    const allUserMatches = [...seasonData.torneio.schedule] // Adicionar copa aqui no futuro
        .filter(m => (m.home === userTeamName || m.away === userTeamName) && !m.played)
        .sort((a,b) => new Date(a.date) - new Date(b.date));

    const nextMatch = allUserMatches[0];
    const isMatchToday = nextMatch && new Date(nextMatch.date).toDateString() === today.toDateString();

    if (isMatchToday) {
        const location = nextMatch.home === userTeamName ? 'Em Casa' : 'Fora de Casa';
        elements.nextEventCard.innerHTML = `
            <h3>Próxima Partida</h3>
            <div>
                <p class="match-details-small">Hoje! ${today.toLocaleDateString('pt-BR')} - ${nextMatch.competition}</p>
                <div class="vs">${nextMatch.home} vs ${nextMatch.away}</div>
                <p class="match-details-small">${location}</p>
            </div>
            <a id="linkPlayMatch" href="escalacao.html"><button class="btn-play">Se Preparar para a Partida</button></a>
        `;
        document.getElementById('linkPlayMatch').onclick = () => {
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
            <button id="btnAdvanceDay" class="btn-advance-day">Avançar Dia</button>
        `;
        document.getElementById('btnAdvanceDay').onclick = advanceDay;
    }
}

function advanceDay() {
    let currentDate = new Date(seasonData.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    seasonData.currentDate = currentDate.toISOString();
    // Lógica futura para simular jogos de IA
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

function displayCopaFixtures() {
    elements.copaFixtures.innerHTML = '<p class="muted">Aguardando início...</p>';
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
        html += `<div class="calendario-fixture ${match.played ? 'played' : ''}">
            <span>(${matchDate})</span>
            <span style="text-align: right;">${match.home}</span>
            <span style="font-weight: bold;">${score}</span>
            <span style="text-align: left;">${match.away}</span>
        </div>`;
    });
    elements.calendarioList.innerHTML = html;
    elements.calendarioModal.style.display = 'block';
}

init();
