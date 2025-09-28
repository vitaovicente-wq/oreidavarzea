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

    Object.values(season.torneio.groups).forEach(group => {
        const teams = group;
        const groupMatches = [];
        // Turno
        groupMatches.push({ home: teams[0], away: teams[1] }, { home: teams[2], away: teams[3] });
        groupMatches.push({ home: teams[0], away: teams[2] }, { home: teams[3], away: teams[1] });
        groupMatches.push({ home: teams[0], away: teams[3] }, { home: teams[1], away: teams[2] });
        // Returno
        groupMatches.push({ home: teams[1], away: teams[0] }, { home: teams[3], away: teams[2] });
        groupMatches.push({ home: teams[2], away: teams[0] }, { home: teams[1], away: teams[3] });
        groupMatches.push({ home: teams[3], away: teams[0] }, { home: teams[2], away: teams[1] });
        
        fullSchedule.push(...groupMatches);
    });

    // Atribui datas de Domingo para cada rodada
    for (let i = 0; i < fullSchedule.length; i++) {
        const week = Math.floor(i / 4) + 1; // 4 jogos por semana
        if (i % 4 === 0) { // No início de cada nova semana
            // Avança para o próximo domingo
            let dayOfWeek = matchDate.getDay();
            let daysUntilSunday = 7 - dayOfWeek;
            if(dayOfWeek === 0) daysUntilSunday = 0; // Se já for domingo, não avança
            matchDate.setDate(matchDate.getDate() + daysUntilSunday);
        }
        fullSchedule[i].date = new Date(matchDate);
        fullSchedule[i].week = week;
        fullSchedule[i].played = false;
        fullSchedule[i].competition = 'Torneio da Vila Freitas';
    }
    
    season.torneio.schedule = fullSchedule;
    return season;
}

// ========== MOTOR DA TEMPORADA ==========
// ... (Todas as funções de processamento, simulação e exibição permanecem as mesmas)

// ========== INICIALIZAÇÃO ==========
function init() {
    userData = JSON.parse(localStorage.getItem('userData')) || {};
    elements.headerTitle.textContent = userData.teamName || 'O Rei da Várzea';
    let storedSeason = localStorage.getItem('seasonData');
    varzeaUniverse = JSON.parse(localStorage.getItem('varzeaUniverse')) || [];
    
    if (storedSeason) {
        seasonData = JSON.parse(storedSeason);
        // Garante que as datas sejam objetos Date
        seasonData.currentDate = new Date(seasonData.currentDate);
        seasonData.torneio.schedule.forEach(m => m.date = new Date(m.date));
        if (seasonData.torneio.finalSchedule) {
            seasonData.torneio.finalSchedule.forEach(m => m.date = new Date(m.date));
        }
    } else {
        if(varzeaUniverse.length === 0){
            varzeaUniverse = createUniverse();
            localStorage.setItem('varzeaUniverse', JSON.stringify(varzeaUniverse));
        }
        seasonData = generateSeasonFixtures(varzeaUniverse, userData.teamName);
        localStorage.setItem('seasonData', JSON.stringify(seasonData));
    }

    // processLastMatchResult(); // Esta função só roda se houver resultado
    displayNextEvent();
    displayTorneioTables();
    elements.copaFixtures.innerHTML = '<p class="muted">Aguardando início...</p>';

    // Eventos
    elements.calendarioButton.onclick = openCalendarioModal;
    elements.calendarioModalClose.onclick = () => elements.calendarioModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}


// INCLUINDO TODAS AS FUNÇÕES COMPLETAS PARA GARANTIR
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
    if (seasonData.torneio.phase === 'final') {
        html += `<h4 class="group-title">Quadrangular Final</h4>`;
        html += `<table><thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>`;
        const finalists = [...seasonData.torneio.finalists];
        const finalTable = seasonData.torneio.finalTable;
        finalists.sort((a,b) => finalTable[b].P - finalTable[a].P || finalTable[b].SG - finalTable[a].SG);
        finalists.forEach((teamName, index) => {
            const stats = finalTable[teamName];
            html += `<tr><td>${index + 1}</td><td>${teamName}</td><td>${stats.P}</td><td>${stats.J}</td><td>${stats.V}</td><td>${stats.E}</td><td>${stats.D}</td><td>${stats.GP}</td><td>${stats.GC}</td><td>${stats.SG}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    elements.torneioTables.innerHTML = html;
}

function openCalendarioModal() {
    elements.calendarioList.innerHTML = '';
    const userTeamName = userData.teamName;
    let html = '<h4>Fase de Grupos</h4>';
    const userSchedule = seasonData.torneio.schedule.filter(m => m.home === userTeamName || m.away === userTeamName);
    userSchedule.sort((a,b) => new Date(a.date) - new Date(b.date));
    userSchedule.forEach(match => {
        const score = match.played ? `<strong>${match.score}</strong>` : "vs";
        const matchDate = new Date(match.date).toLocaleDateString('pt-BR');
        html += `<div class="calendario-fixture ${match.played ? 'played' : ''}"><span>(${matchDate})</span><span>${match.home}</span><span>${score}</span><span>${match.away}</span></div>`;
    });
    if(seasonData.torneio.phase === 'final' && seasonData.torneio.finalists.includes(userTeamName)) {
        html += '<h4>Quadrangular Final</h4>';
        const finalUserSchedule = seasonData.torneio.finalSchedule.filter(m => m.home === userTeamName || m.away === userTeamName);
        finalUserSchedule.sort((a,b) => new Date(a.date) - new Date(b.date));
        finalUserSchedule.forEach(match => {
            const score = match.played ? `<strong>${match.score}</strong>` : "vs";
            const matchDate = new Date(match.date).toLocaleDateString('pt-BR');
            html += `<div class="calendario-fixture ${match.played ? 'played' : ''}"><span>(${matchDate})</span><span>${match.home}</span><span>${score}</span><span>${match.away}</span></div>`;
        });
    }
    elements.calendarioList.innerHTML = html;
    elements.calendarioModal.style.display = 'block';
}

init();
