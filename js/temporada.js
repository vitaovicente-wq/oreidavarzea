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
// ... (createAISquad, createUniverse - sem alterações)

// ========== MOTOR DE TEMPO E CALENDÁRIO ==========
function generateSeasonFixtures(universe, userTeamName) {
    let season = {
        startDate: new Date('2025-02-01'),
        currentDate: new Date('2025-02-01'),
        torneio: { phase: 'groups', groups: {}, schedule: [], table: {}, finalists: [], finalSchedule: [], finalTable: {} },
        copa: { schedule: [] },
    };
    const shuffledUniverse = [...universe].sort(() => 0.5 - Math.random());
    const torneioTeams = [userTeamName, ...shuffledUniverse.slice(0, 7).map(t => t.name)];
    season.torneio.groups['A'] = torneioTeams.slice(0, 4);
    season.torneio.groups['B'] = torneioTeams.slice(4, 4 + 4);
    torneioTeams.forEach(name => { season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }; });

    let currentDate = new Date(season.startDate);
    // Agenda jogos do Torneio aos Domingos
    let weekCounter = 1;
    while(weekCounter <= 6) {
        currentDate.setDate(currentDate.getDate() + (7 - currentDate.getDay()) % 7); // Avança para o próximo Domingo
        // Lógica para agendar os jogos da semana
        // ... (será implementada a geração balanceada aqui)
        
        // Simulação simples por enquanto
        const groupA = season.torneio.groups['A'];
        const groupB = season.torneio.groups['B'];
        season.torneio.schedule.push({ date: new Date(currentDate), home: groupA[0], away: groupA[1], played: false, week: weekCounter });
        season.torneio.schedule.push({ date: new Date(currentDate), home: groupB[0], away: groupB[1], played: false, week: weekCounter });

        weekCounter++;
        currentDate.setDate(currentDate.getDate() + 1); // Avança um dia para não repetir a semana
    }
    
    // Agenda jogos da Copa às Quartas
    // ... (lógica futura)
    
    return season;
}


// ========== LÓGICA DE EXIBIÇÃO ==========
function displayNextEvent() {
    const userTeamName = userData.teamName;
    const nextMatch = seasonData.torneio.schedule
        .filter(m => (m.home === userTeamName || m.away === userTeamName) && !m.played)
        .sort((a,b) => a.date - b.date)[0];

    const today = seasonData.currentDate;

    if (nextMatch && nextMatch.date.getTime() === today.getTime()) {
        // É dia de jogo!
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
        // Dia de folga, simular
        elements.nextEventCard.innerHTML = `
            <h3>Próximo Evento</h3>
            <div>
                <p class="match-details-small">Data Atual: ${today.toLocaleDateString('pt-BR')}</p>
                <div class="vs">Dia de Folga</div>
                <p class="match-details-small">Próximo jogo em: ${nextMatch ? nextMatch.date.toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
            <button id="btnAdvanceDay" class="btn-advance-day">Avançar Dia</button>
        `;
        document.getElementById('btnAdvanceDay').onclick = advanceDay;
    }
}

function advanceDay() {
    seasonData.currentDate.setDate(seasonData.currentDate.getDate() + 1);

    // Simula jogos de IA que aconteceriam neste dia
    const aiMatchesToday = seasonData.torneio.schedule.filter(m => m.date.getTime() === seasonData.currentDate.getTime() && m.home !== userData.teamName && m.away !== userData.teamName && !m.played);
    aiMatchesToday.forEach(match => {
        // const aiResult = simulateAIMatch(match.home, match.away);
        // updateTableStats(aiResult, seasonData.torneio.table);
        match.played = true;
    });

    localStorage.setItem('seasonData', JSON.stringify(seasonData));
    displayNextEvent();
    // displayTorneioTables();
}

// ========== INICIALIZAÇÃO ==========
function init() {
    userData = JSON.parse(localStorage.getItem('userData')) || {};
    elements.headerTitle.textContent = userData.teamName || 'O Rei da Várzea';
    let storedSeason = localStorage.getItem('seasonData');
    varzeaUniverse = JSON.parse(localStorage.getItem('varzeaUniverse')) || [];
    
    if (storedSeason) {
        seasonData = JSON.parse(storedSeason);
        // Converte as strings de data de volta para objetos Date
        seasonData.currentDate = new Date(seasonData.currentDate);
        seasonData.torneio.schedule.forEach(m => m.date = new Date(m.date));
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
    // displayTorneioTables();
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
