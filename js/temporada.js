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
    const year = 2026;
    let season = {
        year: year,
        currentDate: `${year}-01-25`,
        torneio: { phase: 'groups', groups: {}, schedule: [], table: {}, finalists: [], finalSchedule: [], finalTable: {} },
        copa: { round: 'oitavas', schedule: [] },
    };
    const giganesDoBairro = universe.filter(t => t.name !== userTeamName).map(t => t.name);
    const torneioTeams = [userTeamName, ...giganesDoBairro.slice(0, 19)];
    const shuffledTorneioTeams = [...torneioTeams].sort(() => 0.5 - Math.random());
    season.torneio.groups['A'] = shuffledTorneioTeams.slice(0, 10);
    season.torneio.groups['B'] = shuffledTorneioTeams.slice(10, 20);
    torneioTeams.forEach(name => {
        season.torneio.table[name] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 };
    });

    let fullSchedule = [];
    let matchDate = new Date(season.currentDate);

    Object.values(season.torneio.groups).forEach(group => {
        const teams = group;
        const numTeams = teams.length;
        // Gera o calendário de turno e returno para o grupo
        for (let round = 0; round < (numTeams - 1) * 2; round++) {
            const week = round + 1;
            for (let i = 0; i < numTeams / 2; i++) {
                const home = teams[i];
                const away = teams[numTeams - 1 - i];
                
                // Na segunda metade, inverte o mando
                if (round < numTeams - 1) {
                    fullSchedule.push({ week, home, away });
                } else {
                    fullSchedule.push({ week, home: away, away: home });
                }
            }
            // Rotaciona os times para a próxima rodada, mantendo o primeiro fixo
            teams.splice(1, 0, teams.pop());
        }
    });

    // Atribui datas de Domingo para cada rodada
    fullSchedule.sort((a, b) => a.week - b.week);
    for (let i = 0; i < fullSchedule.length; i++) {
        const week = fullSchedule[i].week;
        if (i === 0 || fullSchedule[i].week > fullSchedule[i-1].week) {
             // Avança para o próximo domingo
            let dayOfWeek = matchDate.getDay();
            let daysUntilSunday = (7 - dayOfWeek) % 7;
            if(i > 0 || dayOfWeek !== 0) daysUntilSunday = daysUntilSunday || 7;
            matchDate.setDate(matchDate.getDate() + daysUntilSunday);
        }
        fullSchedule[i].date = new Date(matchDate);
        fullSchedule[i].played = false;
        fullSchedule[i].competition = 'Torneio da Vila Freitas';
    }
    
    season.torneio.schedule = fullSchedule;
    return season;
}

// ========== MOTOR DA TEMPORADA E OUTRAS FUNÇÕES ==========
// (O restante das funções permanece o mesmo)
function processLastMatchResult() { /* ...código completo da função... */ }
function displayNextEvent() { /* ...código completo da função... */ }
function advanceDay() { /* ...código completo da função... */ }
function displayTorneioTables() { /* ...código completo da função... */ }
function displayCopaFixtures() { /* ...código completo da função... */ }
function openCalendarioModal() { /* ...código completo da função... */ }

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
    
    // processLastMatchResult(); // A ser implementado
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

// --- Colando as funções completas para garantir ---
function displayNextEvent() { const userTeamName = userData.teamName; const today = new Date(seasonData.currentDate); const allUserMatches = [...seasonData.torneio.schedule].filter(m => (m.home === userTeamName || m.away === userTeamName) && !m.played).sort((a,b) => new Date(a.date) - new Date(b.date)); const nextMatch = allUserMatches[0]; const isMatchToday = nextMatch && new Date(nextMatch.date).toDateString() === today.toDateString(); if (isMatchToday) { const location = nextMatch.home === userTeamName ? 'Em Casa' : 'Fora de Casa'; elements.nextEventCard.innerHTML = `<h3>Próxima Partida</h3><div><p class="match-details-small">Hoje! ${today.toLocaleDateString('pt-BR')} - ${nextMatch.competition}</p><div class="vs">${nextMatch.home} vs ${nextMatch.away}</div><p class="match-details-small">${location}</p></div><a id="linkPlayMatch" href="escalacao.html"><button class="btn-play">Se Preparar para a Partida</button></a>`; document.getElementById('linkPlayMatch').onclick = () => { localStorage.setItem('currentMatchInfo', JSON.stringify({ homeTeam: nextMatch.home, awayTeam: nextMatch.away, competition: nextMatch.competition })); }; } else { elements.nextEventCard.innerHTML = `<h3>Próximo Evento</h3><div><p class="match-details-small">Data Atual: ${today.toLocaleDateString('pt-BR')}</p><div class="vs">Dia de Folga / Treino</div><p class="match-details-small">Próximo jogo em: ${nextMatch ? new Date(nextMatch.date).toLocaleDateString('pt-BR') : 'Fim de Temporada'}</p></div><button id="btnAdvanceDay" class="btn-advance-day">Avançar Dia</button>`; document.getElementById('btnAdvanceDay').onclick = advanceDay; } }
function advanceDay() { let currentDate = new Date(seasonData.currentDate); currentDate.setDate(currentDate.getDate() + 1); seasonData.currentDate = currentDate.toISOString(); localStorage.setItem('seasonData', JSON.stringify(seasonData)); window.location.reload(); }
function displayTorneioTables() { let html = ''; Object.keys(seasonData.torneio.groups).forEach(groupKey => { const group = seasonData.torneio.groups[groupKey]; html += `<h4 class="group-title">Grupo ${groupKey}</h4>`; html += `<table><thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>`; const table = seasonData.torneio.table; group.sort((a, b) => { const statsA = table[a] || {P:0, SG:0, GP:0}; const statsB = table[b] || {P:0, SG:0, GP:0}; if (statsB.P !== statsA.P) return statsB.P - statsA.P; if (statsB.SG !== statsA.SG) return statsB.SG - statsA.SG; if (statsB.GP !== statsA.GP) return statsB.GP - statsA.GP; return 0; }); group.forEach((teamName, index) => { const stats = table[teamName] || { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }; html += `<tr><td>${index + 1}</td><td>${teamName}</td><td>${stats.P}</td><td>${stats.J}</td><td>${stats.V}</td><td>${stats.E}</td><td>${stats.D}</td><td>${stats.GP}</td><td>${stats.GC}</td><td>${stats.SG}</td></tr>`; }); html += `</tbody></table>`; }); elements.torneioTables.innerHTML = html; }
function displayCopaFixtures() { elements.copaFixtures.innerHTML = '<p class="muted">Aguardando início...</p>'; }
function openCalendarioModal() { elements.calendarioList.innerHTML = ''; const userTeamName = userData.teamName; let html = '<h4>Fase de Grupos - Torneio</h4>'; const userSchedule = seasonData.torneio.schedule.filter(m => m.home === userTeamName || m.away === userTeamName); userSchedule.sort((a,b) => new Date(a.date) - new Date(b.date)); userSchedule.forEach(match => { const score = match.played ? `<strong>${match.score}</strong>` : "vs"; const matchDate = new Date(match.date).toLocaleDateString('pt-BR'); html += `<div class="calendario-fixture ${match.played ? 'played' : ''}"><span>(${matchDate})</span><span style="text-align: right;">${match.home}</span><span style="font-weight: bold;">${score}</span><span style="text-align: left;">${match.away}</span></div>`; }); elements.calendarioList.innerHTML = html; elements.calendarioModal.style.display = 'block'; }

init();
