// ========== ELEMENTOS DOM ==========
const elements = {
    gigantesGrid: document.getElementById('gigantesGrid'),
    deusesGrid: document.getElementById('deusesGrid'),
    reisGrid: document.getElementById('reisGrid'),
    teamDetailModal: document.getElementById('teamDetailModal'),
    teamDetailModalClose: document.getElementById('teamDetailModalClose'),
    teamDetailContent: document.getElementById('teamDetailContent'),
};

// ========== LÓGICA DE CRIAÇÃO DE JOGADORES ==========
function createFootDistribution(count) {
    const feet = [];
    const numLeft = Math.ceil(count * 0.20);
    const numAmbi = Math.floor(count * 0.05);
    for (let i = 0; i < numLeft; i++) feet.push('Esquerdo');
    for (let i = 0; i < numAmbi; i++) feet.push('Ambidestro');
    const numRight = count - feet.length;
    for (let i = 0; i < numRight; i++) feet.push('Direito');
    return feet.sort(() => 0.5 - Math.random());
}

function createPlayer(idCounter, pos, fameTier) {
    const firsts = ["Marrentinho","Juscelino","Ronaldinho","Berg","Tico","Zeca","Xandão","Pedrinho","Claudinho","Sandro","Marollo","Ricardão"];
    const lastParts = ["Carioca","Paulista","Baiano","Gaucho","Mineiro","Nordestino","Pernambucano","Capixaba"];
    let skillBonus = 0;
    if (fameTier === 'Rei da Várzea') skillBonus = 25;
    if (fameTier === 'Deus da Cidade') skillBonus = 15;
    const age = Math.floor(Math.random() * 20) + 16;
    const skill = Math.min(100, Math.floor(Math.random() * 25) + 30 + skillBonus);
    const salarioJogo = Math.round((30 + (skill * 0.8)) / 5) * 5;
    const specializations = { 'Goleiro': 'Pega-Pênalti 🧤', 'Zagueiro': 'Xerife 🛡️', 'Lateral': 'Velocista ⚡', 'Volante': 'Motorzinho 🔋', 'Meia': 'Armador 🧠', 'Atacante': 'Finalizador 🎯' };
    return {
        id: `p${idCounter}`, name: `${firsts[Math.floor(Math.random() * firsts.length)]} ${lastParts[Math.floor(Math.random() * lastParts.length)]}`,
        pos, age, skill, salarioJogo, health: 100,
        specialization: specializations[pos], foot: '',
        isPai: Math.random() < 0.2, contrato: '6 meses',
        profissao: { nome: ['Pedreiro', 'Motoboy', 'Professor', 'Vendedor', 'TI', 'Entregador', 'Segurança', 'Garçom'][Math.floor(Math.random() * 8)] },
        apresentacao: "Pronto pra dar o sangue pelo time, professor!"
    };
}

function createFullSquad(fameTier) {
    let squad = [];
    let idCounter = 0;
    const structure = { 'Goleiro': 2, 'Lateral': 4, 'Zagueiro': 4, 'Volante': 4, 'Meia': 4, 'Atacante': 4 };
    Object.keys(structure).forEach(pos => {
        const playerCount = structure[pos];
        const footDistribution = createFootDistribution(playerCount);
        for (let i = 0; i < playerCount; i++) {
            let player = createPlayer(idCounter++, pos, fameTier);
            player.foot = footDistribution.pop() || 'Direito';
            squad.push(player);
        }
    });
    return squad;
}

function generateCrest(teamName) {
    let seed = 0;
    for (let i = 0; i < teamName.length; i++) { seed += teamName.charCodeAt(i); }
    const shapes = ['crest-shield', 'crest-circle', 'crest-badge'];
    const patterns = ['pattern-stripes', 'pattern-sash', 'pattern-half', 'pattern-none'];
    const primaryColors = ['#d50000', '#004D40', '#01579B', '#311B92', '#000000', '#FF6F00', '#1B5E20'];
    const secondaryColors = ['#FFFFFF', '#FFD700', '#C0C0C0'];
    const shape = shapes[seed % shapes.length];
    const pattern = patterns[seed % patterns.length];
    const color1 = primaryColors[seed % primaryColors.length];
    const color2 = secondaryColors[seed % secondaryColors.length];
    const initial = teamName.charAt(0);
    let patternStyle = '';
    switch(pattern) {
        case 'pattern-stripes': patternStyle = `background-image: linear-gradient(90deg, ${color2} 33%, transparent 33%, transparent 66%, ${color2} 66%)`; break;
        case 'pattern-sash': patternStyle = `background-image: linear-gradient(45deg, transparent 42%, ${color2} 42%, ${color2} 58%, transparent 58%)`; break;
        case 'pattern-half': patternStyle = `background-image: linear-gradient(90deg, ${color2} 50%, transparent 50%)`; break;
    }
    return `<div class="crest ${shape}" style="background-color: ${color1};"><div class="pattern" style="${patternStyle}"></div><div class="initial">${initial}</div></div>`;
}

// ========== LÓGICA PRINCIPAL ==========
function displayTeams(teams, regions) {
    teams.forEach(teamData => {
        const grid = (teamData.fama === 'Gigante do Bairro') ? elements.gigantesGrid : (teamData.fama === 'Deus da Cidade') ? elements.deusesGrid : elements.reisGrid;
        const card = document.createElement('div');
        card.className = 'team-card';
        const crestHTML = generateCrest(teamData.nome);
        card.innerHTML = `${crestHTML}<h4>${teamData.nome}</h4><p class="muted">${teamData.cidade} - ${teamData.estado}</p>`;
        
        if (teamData.fama !== 'Gigante do Bairro') {
            card.classList.add('locked');
        } else {
            card.onclick = () => openTeamDetailModal(teamData, regions);
        }
        grid.appendChild(card);
    });
}

function openTeamDetailModal(teamData, regions) {
    const squad = createFullSquad(teamData.fama);
    const region = regions[teamData.estado] || regions['DEFAULT'];

    let squadTable = `<table><thead><tr>
        <th>Nome</th><th class="col-small">Pos</th><th class="col-medium">Pé</th><th class="col-small">Idade</th>
        <th class="col-small">Hab.</th><th class="col-small">Saúde</th><th class="col-medium">Profissão</th>
    </tr></thead><tbody>`;
    squad.forEach(p => {
        squadTable += `<tr>
            <td>${p.name} ${p.isPai ? '<span class="badge-pai">Pai</span>' : ''}</td>
            <td class="col-small">${p.pos}</td><td class="col-medium">${p.foot}</td>
            <td class="col-small">${p.age}</td><td class="col-small">${p.skill}</td>
            <td class="col-small">${p.health}%</td><td class="col-medium">${p.profissao.nome}</td>
        </tr>`;
    });
    squadTable += '</tbody></table>';

    elements.teamDetailContent.innerHTML = `
        <div class="team-details-header">
            ${generateCrest(teamData.nome)}
            <h2>${teamData.nome}</h2>
            <p class="muted">${teamData.cidade} - ${teamData.estado} (${teamData.fama})</p>
        </div>
        <div class="advantage-box"><strong>Vantagem (${region.vantagem.nome}):</strong> ${region.vantagem.desc}</div>
        <div class="disadvantage-box"><strong>Desvantagem (${region.desvantagem.nome}):</strong> ${region.desvantagem.desc}</div>
        <h4>Elenco Inicial</h4>
        <div class="squad-list">${squadTable}</div>
        <div class="manager-inputs">
            <label>Seu Nome (Professor)</label>
            <input id="userName" type="text" placeholder="Seu nome">
            <button id="btnStartGame">Assumir o Comando</button>
        </div>
    `;

    document.getElementById('btnStartGame').onclick = () => {
        const userName = document.getElementById('userName').value.trim();
        if(!userName) {
            alert("Preencha seu nome de professor para continuar!");
            return;
        }
        
        localStorage.clear();
        localStorage.setItem('userData', JSON.stringify({ userName, teamName: teamData.nome, teamRegion: teamData.estado }));
        localStorage.setItem('elencoDoTime', JSON.stringify(squad));
        const financasIniciais = { caixaAtual: 20000, gastosContratacoes: 0, gastosSalarios: 0, gastosBicho: 0, receitaPartidas: 0, receitaPremiosPatrocinios: 0 };
        localStorage.setItem('financasDoTime', JSON.stringify(financasIniciais));
        const statsIniciais = { entrosamento: 50 };
        localStorage.setItem('teamStats', JSON.stringify(statsIniciais));
        window.location.href = 'temporada.html';
    };

    elements.teamDetailModal.style.display = 'block';
}

async function init() {
    try {
        const response = await fetch('data/universo.json');
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.statusText}`);
        }
        const universoData = await response.json();
        
        displayTeams(universoData.teams, universoData.regions);

        elements.teamDetailModalClose.onclick = () => elements.teamDetailModal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == elements.teamDetailModal) {
                elements.teamDetailModal.style.display = "none";
            }
        };

    } catch (error) {
        console.error("Falha ao carregar o universo do jogo:", error);
        document.querySelector('.container').innerHTML = '<h1>Erro ao carregar dados do jogo. Tente recarregar a página.</h1>';
    }
}

init();
