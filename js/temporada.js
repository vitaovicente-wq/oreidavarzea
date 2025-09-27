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
// ... (createAISquad e createUniverse permanecem iguais e completas)
function createAISquad() { /* ...código completo... */ }
function createUniverse() { /* ...código completo... */ }

// ========== MOTOR DE TEMPO E CALENDÁRIO (RECONSTRUÍDO) ==========
function generateSeasonFixtures(universe, userTeamName) {
    let season = {
        startDate: '2025-02-01',
        currentDate: '2025-02-01',
        torneio: { phase: 'groups', groups: {}, schedule: [], table: {}, finalists: [], finalSchedule: [], finalTable: {} },
        copa: { schedule: [] },
    };
    const shuffledUniverse = [...universe].sort(() => 0.5 - Math.random());
    const torneioTeams = [userTeamName, ...shuffledUniverse.slice(0, 7).map(t => t.name)];
    const shuffledTorneioTeams = [...torneioTeams].sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffledTorneioTeams.slice(0, 4);
    season.torneio.groups['B'] = shuffledTorneioTeams.slice(4, 8);
    torneioTeams.forEach(name => { season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }; });

    let schedule = [];
    let currentDate = new Date(season.startDate);
    
    Object.values(season.torneio.groups).forEach(group => {
        const teams = group;
        // Turno
        schedule.push({ date: new Date(currentDate), home: teams[0], away: teams[1] });
        schedule.push({ date: new Date(currentDate), home: teams[2], away: teams[3] });
        currentDate.setDate(currentDate.getDate() + 7);
        schedule.push({ date: new Date(currentDate), home: teams[0], away: teams[2] });
        schedule.push({ date: new Date(currentDate), home: teams[1], away: teams[3] });
        currentDate.setDate(currentDate.getDate() + 7);
        schedule.push({ date: new Date(currentDate), home: teams[0], away: teams[3] });
        schedule.push({ date: new Date(currentDate), home: teams[2], away: teams[1] });
        currentDate.setDate(currentDate.getDate() + 7);
    });

    season.torneio.schedule = schedule.map(match => ({...match, played: false, competition: 'Torneio da Vila Freitas' }));
    return season;
}


// ========== LÓGICA DE EXIBIÇÃO ==========
function displayNextEvent() {
    const userTeamName = userData.teamName;
    const today = new Date(seasonData.currentDate);
    
    const nextMatch = seasonData.torneio.schedule
        .filter(m => (m.home === userTeamName || m.away === userTeamName) && !m.played)
        .sort((a,b) => new Date(a.date) - new Date(b.date))[0];

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
            <a href="escalacao.html"><button class="btn-play">Ir para Jogo</button></a>
        `;
        localStorage.setItem('currentMatchInfo', JSON.stringify({ homeTeam: nextMatch.home, awayTeam: nextMatch.away, competition: nextMatch.competition }));
    } else {
        elements.nextEventCard.innerHTML = `
            <h3>Próximo Evento</h3>
            <div>
                <p class="match-details-small">Data Atual: ${today.toLocaleDateString('pt-BR')}</p>
                <div class="vs">Dia de Folga / Treino</div>
                <p class="match-details-small">Próximo jogo em: ${nextMatch ? new Date(nextMatch.date).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
            <button id="btnAdvanceDay" class="btn-advance-day">Avançar Dia</button>
        `;
        document.getElementById('btnAdvanceDay').onclick = advanceDay;
    }
}

function advanceDay() {
    let currentDate = new Date(seasonData.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    seasonData.currentDate = currentDate.toISOString(); // Salva como string

    localStorage.setItem('seasonData', JSON.stringify(seasonData));
    // Recarrega a tela para processar o novo dia
    window.location.reload();
}

function displayTorneioTables() { /* ...código completo... */ }
// ... (e todas as outras funções completas)

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
    // processLastMatchResult();
    displayNextEvent();
    displayTorneioTables();
    elements.copaFixtures.innerHTML = '<p class="muted">Aguardando início...</p>';

    elements.calendarioButton.onclick = () => { /* Lógica do calendário */ };
    elements.calendarioModalClose.onclick = () => elements.calendarioModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

init();
