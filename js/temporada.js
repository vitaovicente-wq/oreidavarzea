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


// ========== MOTOR DE TEMPO E CALENDÁRIO ==========
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
    let matchDate = new Date(season.startDate);
    
    // Gera 6 rodadas de jogos de Domingo
    for(let week = 1; week <= 6; week++) {
        // Encontra o próximo domingo
        let dayOfWeek = matchDate.getDay();
        let daysUntilSunday = (7 - dayOfWeek) % 7;
        if (dayOfWeek === 0 && week > 1) daysUntilSunday = 7; // se hoje é domingo e não é a primeira semana, avança 7 dias
        else if (dayOfWeek === 0 && week === 1) daysUntilSunday = 0;
        
        matchDate.setDate(matchDate.getDate() + daysUntilSunday);
        
        // Simulação simples de agendamento por enquanto
        Object.values(season.torneio.groups).forEach(group => {
            // Lógica para criar confrontos da rodada (simplificada)
            const match1 = { week: week, date: new Date(matchDate), home: group[0], away: group[1], played: false, competition: 'Torneio da Vila Freitas' };
            const match2 = { week: week, date: new Date(matchDate), home: group[2], away: group[3], played: false, competition: 'Torneio da Vila Freitas' };
            fullSchedule.push(match1, match2);
        });
    }

    season.torneio.schedule = fullSchedule;
    return season;
}

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
            const statsA = table[a] || {P:0, SG:0, GP:0};
            const statsB = table[b] || {P:0, SG:0, GP:0};
            if (statsB.P !== statsA.P) return statsB.P - statsA.P;
            if (statsB.SG !== statsA.SG) return statsB.SG - statsA.SG;
            if (statsB.GP !== statsA.GP) return statsB.GP - statsA.GP;
            return 0;
        });
        group.forEach((teamName, index) => {
            const stats = table[teamName] || { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 };
            html += `<tr><td>${index + 1}</td><td>${teamName}</td><td>${stats.P}</td><td>${stats.J}</td><td>${stats.V}</td><td>${stats.E}</td><td>${stats.D}</td><td>${stats.GP}</td><td>${stats.GC}</td><td>${stats.SG}</td></tr>`;
        });
        html += `</tbody></table>`;
    });
    elements.torneioTables.innerHTML = html;
}

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

    // Garante que as strings de data sejam convertidas de volta para objetos Date
    seasonData.currentDate = new Date(seasonData.currentDate);
    seasonData.torneio.schedule.forEach(m => m.date = new Date(m.date));
    
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
