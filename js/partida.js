// ========== ESTADO DO JOGO ==========
let hired = []; let userData = {}; let lineup = {}; let varzeaUniverse = []; let currentMatchInfo = {};
let homeTeam = {}; let awayTeam = {}; let userIsHome = false; let opponent = {};
let minuto = 1; let gameInterval = null; let currentHalf = 1;
let halftimeStoppage = 0; let fulltimeStoppage = 0;
let subsMade = 0; const MAX_SUBS = 5; let subWindows = 3;
let selectedPlayerOutId = null; let matchRevenue = 0;

const elements = {
  headerTitle: document.getElementById('headerTitle'),
  leftTeamName: document.getElementById('leftTeamName'),
  leftTeamStarters: document.getElementById('leftTeamStarters'),
  leftTeamBench: document.getElementById('leftTeamBench'),
  rightTeamName: document.getElementById('rightTeamName'),
  rightTeamStarters: document.getElementById('rightTeamStarters'),
  rightTeamBench: document.getElementById('rightTeamBench'),
  homeTeamName: document.getElementById('homeTeamName'),
  awayTeamName: document.getElementById('awayTeamName'),
  scoreDisplay: document.getElementById('score'),
  comentarios: document.getElementById('comentarios'),
  btnContinuar: document.getElementById('btnContinuar'),
  btnSubstituicao: document.getElementById('btnSubstituicao'),
  substitutionModal: document.getElementById('substitutionModal'),
  substitutionModalTitle: document.getElementById('substitutionModalTitle'),
  subsCount: document.getElementById('subsCount'),
  subPitchPlayers: document.getElementById('subPitchPlayers'),
  subBenchPlayers: document.getElementById('subBenchPlayers'),
  btnConfirmSubs: document.getElementById('btnConfirmSubs'),
  matchLocation: document.getElementById('matchLocation'),
  matchChampionship: document.getElementById('matchChampionship'),
  matchAudience: document.getElementById('matchAudience'),
  matchTicketRevenue: document.getElementById('matchTicketRevenue'),
  matchSodaSales: document.getElementById('matchSodaSales'),
  matchKebabSales: document.getElementById('matchKebabSales'),
  matchTotalRevenue: document.getElementById('matchTotalRevenue'),
};

function showNotif(text, time = 3000) { const box = document.createElement('div'); box.className = 'notif'; box.textContent = text; document.body.appendChild(box); setTimeout(() => box.remove(), time); }
function formatReal(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
const addComentario = (min, texto, tipo = 'normal') => { const p = document.createElement('p'); p.innerHTML = `<strong>${min}'</strong> - ${texto}`; if (tipo === 'gol') p.classList.add('gol'); if (tipo === 'evento') p.classList.add('evento'); if (tipo === 'cartao') p.classList.add('cartao'); elements.comentarios.appendChild(p); elements.comentarios.scrollTop = elements.comentarios.scrollHeight; };

function saveMatchState() {
    const state = {
        score: elements.scoreDisplay.textContent, minute: minuto, half: currentHalf,
        subsMade: subsMade, subWindows: subWindows, commentary: elements.comentarios.innerHTML,
        playerEvents: {}, stoppageTimes: { half1: halftimeStoppage, half2: fulltimeStoppage },
        revenueDetails: { location: elements.matchLocation.textContent, championship: elements.matchChampionship.textContent, audience: elements.matchAudience.textContent, ticket: elements.matchTicketRevenue.textContent, soda: elements.matchSodaSales.textContent, kebab: elements.matchKebabSales.textContent, total: elements.matchTotalRevenue.textContent },
        matchRevenue: matchRevenue, opponent: opponent
    };
    document.querySelectorAll('#leftTeamStarters li, #rightTeamStarters li').forEach(li => { 
        const id = li.dataset.playerId || li.dataset.playerName;
        const eventSpan = li.querySelector('.player-events');
        if (eventSpan && eventSpan.textContent) { state.playerEvents[id] = eventSpan.textContent; }
    });
    localStorage.setItem('matchInProgress', JSON.stringify(state));
}

function calculateMatchRevenue() {
    elements.matchLocation.textContent = `Campo do ${homeTeam.name}`;
    elements.matchChampionship.textContent = currentMatchInfo.competition;
    const history = JSON.parse(localStorage.getItem('teamHistory')) || { wins: 0, losses: 0 };
    
    // ===== LINHA DA CORREÇÃO AQUI =====
    const titularesIds = Object.values(lineup);
    
    const titulares = hired.filter(j => titularesIds.includes(j.id));
    if (titulares.length === 0) return; 
    const averageSkill = titulares.reduce((sum, p) => sum + p.skill, 0) / titulares.length;
    const baseAudience = (averageSkill / 100) * 700;
    const historyBonus = (history.wins - history.losses) * 15;
    const randomFactor = Math.floor(Math.random() * 100) - 50;
    const totalAudience = Math.round(baseAudience + historyBonus + randomFactor);
    const finalAudience = Math.max(50, Math.min(totalAudience, 1000));
    const ticketRevenue = finalAudience * 5;
    const sodasSold = Math.round(finalAudience * (0.8 + Math.random() * 0.4));
    const sodaRevenue = sodasSold * 2.5;
    const kebabsSold = Math.round(finalAudience * (0.6 + Math.random() * 0.3));
    const kebabRevenue = kebabsSold * 5;
    matchRevenue = ticketRevenue + sodaRevenue + kebabRevenue;
    elements.matchAudience.textContent = `${finalAudience.toLocaleString('pt-BR')} pessoas`;
    elements.matchTicketRevenue.textContent = formatReal(ticketRevenue);
    elements.matchSodaSales.textContent = `${sodasSold} un. (${formatReal(sodaRevenue)})`;
    elements.matchKebabSales.textContent = `${kebabsSold} un. (${formatReal(kebabRevenue)})`;
    elements.matchTotalRevenue.textContent = formatReal(matchRevenue);
}

function gameTick() {
    const endMin = (currentHalf === 1) ? 45 : 90;
    const stoppageTime = endMin + (currentHalf === 1 ? halftimeStoppage : fulltimeStoppage);
    if (minuto > stoppageTime) {
        pauseGame();
        if (currentHalf === 1) { openSubstitutionModal(false); } 
        else { endGame(); }
        return;
    }
    let lance = ""; let tipoLance = 'normal';
    const randomEvent = Math.random();
    if (randomEvent < 0.04) {
        let [golsCasa, golsVisitante] = elements.scoreDisplay.textContent.split('x').map(s => parseInt(s.trim()));
        if (Math.random() < 0.5) { // Home team scores
            golsCasa++;
            const scorer = pickPlayerForEvent(['Atacante', 'Meia'], homeTeam);
            lance = `⚽ GOOOOL DE ${homeTeam.name.toUpperCase()}! Marcado por ${scorer.name}!`;
            addEventIcon(scorer.id || scorer.name, '⚽', homeTeam.name === userData.teamName);
        } else { // Away team scores
            golsVisitante++;
            const scorer = pickPlayerForEvent(['Atacante', 'Meia'], awayTeam);
            lance = `⚽ GOOOOL DE ${awayTeam.name.toUpperCase()}! Marcado por ${scorer.name}!`;
            addEventIcon(scorer.id || scorer.name, '⚽', awayTeam.name === userData.teamName);
        }
        elements.scoreDisplay.textContent = `${golsCasa} x ${golsVisitante}`;
        tipoLance = 'gol';
    } else if (randomEvent < 0.07) {
        if (Math.random() < 0.5) {
            const player = pickPlayerForEvent(['Zagueiro', 'Volante', 'Lateral'], homeTeam);
            lance = `🟨 Cartão amarelo para ${player.name} de ${homeTeam.name}.`;
            addEventIcon(player.id || player.name, '🟨', homeTeam.name === userData.teamName);
        } else {
            const player = pickPlayerForEvent(['Zagueiro', 'Volante', 'Lateral'], awayTeam);
            lance = `🟨 Cartão amarelo para ${player.name} de ${awayTeam.name}.`;
            addEventIcon(player.id || player.name, '🟨', awayTeam.name === userData.teamName);
        }
        tipoLance = 'cartao';
    } else {
        const lances = [ "Jogada de perigo!", "Falta no meio-campo", "Escanteio", "Contra-ataque perigoso!" ];
        lance = lances[Math.floor(Math.random() * lances.length)];
    }
    addComentario(minuto, lance, tipoLance);
    minuto += Math.floor(Math.random() * 3) + 1;
    saveMatchState();
}

function pauseGame() { clearInterval(gameInterval); gameInterval = null; }
function resumeGame() { if (!gameInterval) { gameInterval = setInterval(gameTick, 800); } }

function endGame() {
    addComentario('FIM', '⏱️ Apita o árbitro! Fim de jogo!', 'evento');
    elements.btnContinuar.style.display = 'inline-block';
    elements.btnSubstituicao.disabled = true;
    const playersInMatch = userIsHome ? Object.values(lineup) : opponent.squad.slice(0,11).map(p=>p.id);
    hired.forEach(jogador => { if (playersInMatch.includes(jogador.id)) { let desgaste = 8 + Math.floor(Math.random() * 5); jogador.health = Math.max(0, jogador.health - desgaste); } });
    let financas = JSON.parse(localStorage.getItem('financasDoTime'));
    financas.caixaAtual += matchRevenue;
    financas.receitaPartidas += matchRevenue;
    const folhaSalarial = hired.reduce((total, player) => total + player.salarioJogo, 0);
    financas.caixaAtual -= folhaSalarial;
    financas.gastosSalarios += folhaSalarial;
    localStorage.setItem('financasDoTime', JSON.stringify(financas));
    const history = JSON.parse(localStorage.getItem('teamHistory')) || { wins: 0, losses: 0, draws: 0 };
    const [golsCasa, golsVisitante] = elements.scoreDisplay.textContent.split('x').map(s => parseInt(s.trim()));
    const userWon = (userIsHome && golsCasa > golsVisitante) || (!userIsHome && golsVisitante > golsCasa);
    const userLost = (userIsHome && golsVisitante > golsCasa) || (!userIsHome && golsCasa > golsVisitante);
    if (userWon) history.wins++; else if (userLost) history.losses++; else history.draws++;
    localStorage.setItem('teamHistory', JSON.stringify(history));
    localStorage.setItem('elencoDoTime', JSON.stringify(hired));
    localStorage.setItem('lastMatchResult', JSON.stringify({ homeTeam: homeTeam.name, awayTeam: awayTeam.name, homeScore: golsCasa, awayScore: golsVisitante }));
    generateZapMessages(golsCasa, golsVisitante);
    localStorage.removeItem('treinoRealizado'); 
    localStorage.removeItem('matchInProgress');
}

function generateZapMessages(golsCasa, golsVisitante){
    let zapMessages = JSON.parse(localStorage.getItem('zapMessages')) || [];
    const agora = new Date();
    let resumo = `Resultado Final: ${homeTeam.name} ${golsCasa} x ${golsVisitante} ${awayTeam.name}. `;
    if ((userIsHome && golsCasa > golsVisitante) || (!userIsHome && golsVisitante > golsCasa)) resumo += "Bela vitória!";
    else if ((userIsHome && golsVisitante > golsCasa) || (!userIsHome && golsCasa > golsVisitante)) resumo += "Resultado amargo...";
    else resumo += "Tudo igual no placar.";
    zapMessages.push({ from: "João Tartaruga 🐢", text: resumo, read: false, date: agora });
    hired.forEach(p => { if (p.health < 50) { zapMessages.push({ from: p.name, text: `Chefe, o corpo tá pedindo arrego. Tô com a saúde em ${p.health}%.`, read: false, date: agora }); } });
    localStorage.setItem('zapMessages', JSON.stringify(zapMessages));
}

function pickPlayerForEvent(positions, teamObject) {
    const isUser = teamObject.name === userData.teamName;
    const squad = isUser ? hired : teamObject.squad;
    const starters = isUser ? squad.filter(p => Object.values(lineup).includes(p.id)) : squad.slice(0, 11);
    const playersInPosition = starters.filter(p => p.pos && positions.includes(p.pos));
    if (playersInPosition.length > 0) return playersInPosition[Math.floor(Math.random() * playersInPosition.length)];
    return starters[Math.floor(Math.random() * starters.length)];
}
function addEventIcon(playerIdentifier, icon, isUserTeam) {
    const selector = isUserTeam ? `li[data-player-id="${playerIdentifier}"]` : `li[data-player-name="${playerIdentifier}"]`;
    const playerLi = document.querySelector(selector);
    if (playerLi) {
        const eventSpan = playerLi.querySelector('.player-events');
        eventSpan.textContent = icon;
    }
}
function openSubstitutionModal(isMidGame) {
    pauseGame();
    const modalTitle = elements.substitutionModal.querySelector('h2');
    if (isMidGame) {
        modalTitle.textContent = "Pausa para Substituição";
        addComentario(minuto, `⏱️ Jogo pausado para substituição.`, 'evento');
    } else {
        modalTitle.textContent = "Intervalo - Faça suas substituições";
        addComentario('45', `⏱️ Fim do primeiro tempo! Intervalo de jogo.`, 'evento');
    }
    elements.substitutionModal.style.display = 'block';
    elements.btnConfirmSubs.textContent = isMidGame ? "Confirmar e Voltar ao Jogo" : "Iniciar 2º Tempo";
    elements.btnConfirmSubs.dataset.isMidGame = isMidGame;
    updateSubstitutionModal();
}
function updateSubstitutionModal() {
    elements.subPitchPlayers.innerHTML = '';
    elements.subBenchPlayers.innerHTML = '';
    elements.subsCount.textContent = `Substituições: ${subsMade}/${MAX_SUBS}`;
    const titularesIds = Object.values(lineup);
    const titulares = hired.filter(j => titularesIds.includes(j.id));
    const reservas = hired.filter(j => !titularesIds.includes(j.id));
    titulares.forEach(p => { const item = document.createElement('div'); item.className = 'sub-player-item'; item.textContent = `${p.name} (${p.pos})`; item.dataset.playerId = p.id; item.onclick = () => handleSubPlayerClick(p.id, true); elements.subPitchPlayers.appendChild(item); });
    reservas.forEach(p => { const item = document.createElement('div'); item.className = 'sub-player-item'; item.textContent = `${p.name} (${p.pos})`; item.dataset.playerId = p.id; item.onclick = () => handleSubPlayerClick(p.id, false); if (subsMade >= MAX_SUBS) item.classList.add('disabled'); elements.subBenchPlayers.appendChild(item); });
}
function handleSubPlayerClick(playerId, isTitular) { if (isTitular) { if (selectedPlayerOutId === playerId) { selectedPlayerOutId = null; } else { selectedPlayerOutId = playerId; } document.querySelectorAll('#subPitchPlayers .sub-player-item').forEach(el => { el.classList.toggle('selected', el.dataset.playerId === selectedPlayerOutId); }); } else { if (!selectedPlayerOutId) { showNotif("Primeiro, selecione um jogador em campo para substituir."); return; } if (subsMade >= MAX_SUBS) { showNotif("Você já usou todas as 5 substituições!"); return; } performSubstitution(selectedPlayerOutId, playerId); } }
function performSubstitution(playerOutId, playerInId) { const playerOut = hired.find(j => j.id === playerOutId); const playerIn = hired.find(j => j.id === playerInId); if (playerOut.pos !== playerIn.pos) { if (!confirm(`Atenção! ${playerIn.name} (${playerIn.pos}) vai entrar no lugar de ${playerOut.name} (${playerOut.pos}) de forma improvisada. Continuar?`)) { return; } } const slotId = Object.keys(lineup).find(key => lineup[key] === playerOutId); lineup[slotId] = playerInId; subsMade++; selectedPlayerOutId = null; addComentario('Jogo Parado', `🔄 Substituição: Sai ${playerOut.name} e entra ${playerIn.name}.`, 'evento'); updateSubstitutionModal(); populateTeamColumn('left', homeTeam, homeTeam.name === userData.teamName); populateTeamColumn('right', awayTeam, awayTeam.name === userData.teamName); }
function populateTeamColumn(side, team, isUserTeam) {
    const nameEl = elements[`${side}TeamName`];
    const startersEl = elements[`${side}TeamStarters`];
    const benchEl = elements[`${side}TeamBench`];
    nameEl.textContent = team.name;
    startersEl.innerHTML = '';
    benchEl.innerHTML = '';
    const squad = isUserTeam ? hired : team.squad;
    const starters = isUserTeam ? squad.filter(p => Object.values(lineup).includes(p.id)) : squad.slice(0, 11);
    const subs = isUserTeam ? squad.filter(p => !Object.values(lineup).includes(p.id)) : squad.slice(11);
    starters.forEach(p => { const li = document.createElement('li'); if (isUserTeam) { li.dataset.playerId = p.id; } else { li.dataset.playerName = p.name; } li.innerHTML = `<span>${p.name} (${p.pos})</span><span class="player-events"></span>`; startersEl.appendChild(li); });
    subs.forEach(p => { const card = document.createElement('div'); card.className = 'player-card'; if(isUserTeam){ const statusColor = p.health > 75 ? 'green' : 'yellow'; card.innerHTML = `<div class="player-card-info"><span class="status-dot status-${statusColor}"></span><div><div><strong>${p.name}</strong> <span class="spec-tag">${p.specialization}</span></div><div class="muted">${p.pos} • Saúde: ${p.health}%</div></div></div>`; } else { card.innerHTML = `<div class="player-card-info"><div><strong>${p.name}</strong><div class="muted">${p.pos}</div></div></div>`; } benchEl.appendChild(card); });
}

function init() {
    hired = JSON.parse(localStorage.getItem('elencoDoTime')) || [];
    userData = JSON.parse(localStorage.getItem('userData')) || {};
    lineup = JSON.parse(localStorage.getItem('escalacaoFinal')) || {};
    varzeaUniverse = JSON.parse(localStorage.getItem('varzeaUniverse')) || [];
    currentMatchInfo = JSON.parse(localStorage.getItem('currentMatchInfo')) || {};

    if (!currentMatchInfo.homeTeam) {
        alert("Informações da partida não encontradas! Volte para a tela da temporada.");
        window.location.href = 'temporada.html';
        return;
    }

    userIsHome = currentMatchInfo.homeTeam === userData.teamName;
    const opponentName = userIsHome ? currentMatchInfo.awayTeam : currentMatchInfo.homeTeam;
    opponent = varzeaUniverse.find(t => t.name === opponentName);
    if(!opponent){
        alert(`Adversário "${opponentName}" não encontrado no universo do jogo!`);
        window.location.href = 'temporada.html';
        return;
    }
    
    const userTeamObject = { name: userData.teamName, squad: hired };
    homeTeam = userIsHome ? userTeamObject : opponent;
    awayTeam = userIsHome ? opponent : userTeamObject;
    
    const savedMatch = localStorage.getItem('matchInProgress');
    if (savedMatch) {
        const state = JSON.parse(savedMatch);
        minuto = state.minute; currentHalf = state.half; subsMade = state.subsMade; subWindows = state.subWindows;
        halftimeStoppage = state.stoppageTimes.half1; fulltimeStoppage = state.stoppageTimes.half2;
        matchRevenue = state.matchRevenue; opponent = state.opponent;
        elements.scoreDisplay.textContent = state.score;
        elements.comentarios.innerHTML = state.commentary;
        elements.btnSubstituicao.textContent = `Fazer Substituição (${subWindows})`;
        if (subWindows <= 0) elements.btnSubstituicao.disabled = true;
        Object.keys(state.revenueDetails).forEach(key => {
            const elementId = `match${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if(elements[elementId]) elements[elementId].textContent = state.revenueDetails[key];
        });
        populateTeamColumn('left', homeTeam, homeTeam.name === userData.teamName);
        populateTeamColumn('right', awayTeam, awayTeam.name === userData.teamName);
        Object.keys(state.playerEvents).forEach(pId => { const icons = state.playerEvents[pId]; const isUser = pId.startsWith('p'); addEventIcon(pId, icons, isUser); });
        resumeGame();
    } else {
        if (Object.keys(lineup).length < 11) { alert("Nenhuma escalação encontrada!"); window.location.href = 'escalacao.html'; return; }
        const specializations = { 'Goleiro': 'Pega-Pênalti 🧤', 'Zagueiro': 'Xerife 🛡️', 'Lateral': 'Velocista ⚡', 'Volante': 'Motorzinho 🔋', 'Meia': 'Armador 🧠', 'Atacante': 'Finalizador 🎯' };
        hired.forEach(p => { if(!p.specialization) p.specialization = specializations[p.pos]; });
        populateTeamColumn('left', homeTeam, homeTeam.name === userData.teamName);
        populateTeamColumn('right', awayTeam, awayTeam.name === userData.teamName);
        calculateMatchRevenue();
        halftimeStoppage = Math.floor(Math.random() * 4) + 1;
        fulltimeStoppage = Math.floor(Math.random() * 5) + 1;
        addComentario('0', `⏱️ Apita o árbitro! Começa a partida pelo ${currentMatchInfo.competition}!`, 'evento');
        resumeGame();
    }
    
    elements.headerTitle.textContent = `${currentMatchInfo.competition}`;
    elements.homeTeamName.textContent = homeTeam.name.substring(0, 10);
    elements.awayTeamName.textContent = awayTeam.name.substring(0, 10);
    
    elements.btnSubstituicao.onclick = () => { if (subsMade >= MAX_SUBS) { showNotif("Você já usou o máximo de 5 substituições."); return; } if (subWindows > 0 && gameInterval) { openSubstitutionModal(true); } else if (!gameInterval && currentHalf < 2) { showNotif("Faça as substituições na janela que abriu."); } else if (!gameInterval && currentHalf === 2) { showNotif("O jogo já acabou!"); } else { showNotif("Você não tem mais paradas para substituição."); } };
    elements.btnConfirmSubs.onclick = () => { const isMidGameSub = elements.btnConfirmSubs.dataset.isMidGame === 'true'; elements.substitutionModal.style.display = 'none'; if (isMidGameSub) { subWindows--; elements.btnSubstituicao.textContent = `Fazer Substituição (${subWindows})`; if (subWindows <= 0) elements.btnSubstituicao.disabled = true; resumeGame(); } else { currentHalf = 2; minuto = 46; addComentario('46', '⏱️ Bola rolando para o segundo tempo!', 'evento'); resumeGame(); } };
}
init();
</script>
</body>
</html>
