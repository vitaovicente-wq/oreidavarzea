// ========== DADOS DO UNIVERSO ==========
const CIDADES_E_REGIOES = {
    'SP': { vantagem: { nome: "Molecada da Base", desc: "Maior chance de revelar jovens promissores a cada nova temporada." }, desvantagem: { nome: "Trampo e Correria", desc: "Jogadores recuperam a saúde um pouco mais devagar entre as partidas." } },
    'RJ': { vantagem: { nome: "Artilheiro Nato", desc: "Atacantes recebem um pequeno bônus na chance de fazer gol." }, desvantagem: { nome: "Vestiário Explosivo", desc: "O entrosamento do time cai mais rápido com derrotas." } },
    'MG': { vantagem: { nome: "Tática Mineira", desc: "A defesa recebe um pequeno bônus, diminuindo a chance do adversário marcar." }, desvantagem: { nome: "Ritmo Cadenciado", desc: "A eficácia do treino físico é um pouco reduzida." } },
    'RS': { vantagem: { nome: "Raça Gaúcha", desc: "Jogadores se cansam menos durante as partidas." }, desvantagem: { nome: "Futebol Força", desc: "A habilidade média do time é um pouco menor." } },
    'BA': { vantagem: { nome: "Alegria nas Pernas", desc: "O time começa com um nível de Entrosamento mais alto." }, desvantagem: { nome: "Relaxado Demais", desc: "A eficácia dos treinos é um pouco menor." } },
    'DEFAULT': { vantagem: { nome: "Neutro", desc: "Sem vantagem específica." }, desvantagem: { nome: "Neutro", desc: "Sem desvantagem específica." } }
};

const TIMES = [
    // Gigantes do Bairro (20)
    { nome: "Tsunami da ZL", cidade: "São Paulo", estado: "SP", fama: "Gigante do Bairro" },
    { nome: "Galácticos do Grajaú", cidade: "São Paulo", estado: "SP", fama: "Gigante do Bairro" },
    { nome: "Ajax da Vila Sônia", cidade: "São Paulo", estado: "SP", fama: "Gigante do Bairro" },
    { nome: "Molekes da Vila", cidade: "Santos", estado: "SP", fama: "Gigante do Bairro" },
    { nome: "Guarani do Brinco", cidade: "Campinas", estado: "SP", fama: "Gigante do Bairro" },
    { nome: "Guerreiros da Baixada", cidade: "Duque de Caxias", estado: "RJ", fama: "Gigante do Bairro" },
    { nome: "Índios Araribóia", cidade: "Niterói", estado: "RJ", fama: "Gigante do Bairro" },
    { nome: "Inconfidentes de Ouro Preto", cidade: "Ouro Preto", estado: "MG", fama: "Gigante do Bairro" },
    { nome: "Arrastapé de Caruaru", cidade: "Caruaru", estado: "PE", fama: "Gigante do Bairro" },
    { nome: "Padim Ciço FC", cidade: "Juazeiro do Norte", estado: "CE", fama: "Gigante do Bairro" },
    { nome: "Vaqueiros do Sertão", cidade: "Feira de Santana", estado: "BA", fama: "Gigante do Bairro" },
    { nome: "Parreiras de Aço", cidade: "Caxias do Sul", estado: "RS", fama: "Gigante do Bairro" },
    { nome: "Príncipes da Chuva", cidade: "Joinville", estado: "SC", fama: "Gigante do Bairro" },
    { nome: "Pé Vermelho EC", cidade: "Londrina", estado: "PR", fama: "Gigante do Bairro" },
    { nome: "Boi-Bumbá de Parintins", cidade: "Parintins", estado: "AM", fama: "Gigante do Bairro" },
    { nome: "Gigantes do Madeira", cidade: "Porto Velho", estado: "RO", fama: "Gigante do Bairro" },
    { nome: "Pequi Atômico FC", cidade: "Goiânia", estado: "GO", fama: "Gigante do Bairro" },
    { nome: "Dourado do Pantanal", cidade: "Cuiabá", estado: "MT", fama: "Gigante do Bairro" },
    { nome: "Tuiuiú de Campo Grande", cidade: "Campo Grande", estado: "MS", fama: "Gigante do Bairro" },
    { nome: "Real Madruga", cidade: "Rio de Janeiro", estado: "RJ", fama: "Gigante do Bairro" },
    // Deuses da Cidade (10)
    { nome: "EC Beira-Rio", cidade: "São Paulo", estado: "SP", fama: "Deus da Cidade" },
    { nome: "Fúria do Capão Redondo", cidade: "São Paulo", estado: "SP", fama: "Deus da Cidade" },
    { nome: "Manchester Paulista", cidade: "São Paulo", estado: "SP", fama: "Deus da Cidade" },
    { nome: "Leões da Gamboa", cidade: "Salvador", estado: "BA", fama: "Deus da Cidade" },
    { nome: "Dragões da Praia do Futuro", cidade: "Fortaleza", estado: "CE", fama: "Deus da Cidade" },
    { nome: "Leões do Capibaribe", cidade: "Recife", estado: "PE", fama: "Deus da Cidade" },
    { nome: "Churrasco & Gauchão FC", cidade: "Porto Alegre", estado: "RS", fama: "Deus da Cidade" },
    { nome: "Pinheiros de Curitiba", cidade: "Curitiba", estado: "PR", fama: "Deus da Cidade" },
    { nome: "Treme-Terra do Pará", cidade: "Belém", estado: "PA", fama: "Deus da Cidade" },
    { nome: "Galácticos da Pampulha", cidade: "Belo Horizonte", estado: "MG", fama: "Deus da Cidade" },
    // Reis da Várzea (10)
    { nome: "Juventus da Mooca", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Boca do Lixo FC", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "PSV - Pau Sem Vontade", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Borussia do Ipiranga", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Atlético do Jaçanã", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Inter de Limão", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Só Canelas FC", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Bayern do M'Boi Mirim", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Liverpool da Cantareira", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" },
    { nome: "Chelsea do Cimento", cidade: "São Paulo", estado: "SP", fama: "Rei da Várzea" }
];

const elements = {
    gigantesGrid: document.getElementById('gigantesGrid'),
    deusesGrid: document.getElementById('deusesGrid'),
    reisGrid: document.getElementById('reisGrid'),
    teamDetailModal: document.getElementById('teamDetailModal'),
    teamDetailModalClose: document.getElementById('teamDetailModalClose'),
    teamDetailContent: document.getElementById('teamDetailContent'),
};

function createPlayer(idCounter, pos, fameTier) {
    const firsts = ["Marrentinho","Juscelino","Ronaldinho","Berg","Tico","Zeca","Xandão","Pedrinho","Claudinho","Sandro","Marollo","Ricardão"];
    const lastParts = ["Carioca","Paulista","Baiano","Gaucho","Mineiro","Nordestino","Pernambucano","Capixaba"];
    
    let skillBonus = 0;
    if (fameTier === 'Rei da Várzea') skillBonus = 20;
    if (fameTier === 'Deus da Cidade') skillBonus = 10;

    const age = Math.floor(Math.random() * 25) + 16;
    const skill = Math.min(100, Math.floor(Math.random() * 25) + 40 + skillBonus);
    const salarioJogo = Math.round((30 + (skill * 0.8)) / 5) * 5;
    const specializations = { 'Goleiro': 'Pega-Pênalti 🧤', 'Zagueiro': 'Xerife 🛡️', 'Lateral': 'Velocista ⚡', 'Volante': 'Motorzinho 🔋', 'Meia': 'Armador 🧠', 'Atacante': 'Finalizador 🎯' };

    return {
        id: `p${idCounter}`, name: `${firsts[Math.floor(Math.random() * firsts.length)]} ${lastParts[Math.floor(Math.random() * lastParts.length)]}`,
        pos, age, skill, salarioJogo, health: 100,
        specialization: specializations[pos]
    };
}

function createFullSquad(fameTier) {
    let squad = [];
    let idCounter = 0;
    const structure = { 'Goleiro': 2, 'Lateral': 4, 'Zagueiro': 4, 'Volante': 4, 'Meia': 4, 'Atacante': 4 };
    Object.keys(structure).forEach(pos => {
        for (let i = 0; i < structure[pos]; i++) {
            squad.push(createPlayer(idCounter++, pos, fameTier));
        }
    });
    return squad;
}

function displayTeams() {
    TIMES.forEach(teamData => {
        const grid = (teamData.fama === 'Gigante do Bairro') ? elements.gigantesGrid : (teamData.fama === 'Deus da Cidade') ? elements.deusesGrid : elements.reisGrid;
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `<h4>${teamData.nome}</h4><p class="muted">${teamData.cidade} - ${teamData.estado}</p>`;
        
        if (teamData.fama !== 'Gigante do Bairro') {
            card.classList.add('locked');
        } else {
            card.onclick = () => openTeamDetailModal(teamData);
        }
        grid.appendChild(card);
    });
}

function openTeamDetailModal(teamData) {
    const squad = createFullSquad(teamData.fama);
    const region = CIDADES_E_REGIOES[teamData.estado] || CIDADES_E_REGIOES['DEFAULT'];

    let squadTable = '<table><thead><tr><th>Nome</th><th>Pos</th><th>Hab.</th></tr></thead><tbody>';
    squad.forEach(p => {
        squadTable += `<tr><td>${p.name}</td><td>${p.pos}</td><td>${p.skill}</td></tr>`;
    });
    squadTable += '</tbody></table>';

    elements.teamDetailContent.innerHTML = `
        <div class="team-details-header">
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
            <label>Sua Cidade Natal</label>
            <input id="cityName" type="text" placeholder="Cidade onde você nasceu">
            <button id="btnStartGame">Assumir o Comando</button>
        </div>
    `;

    document.getElementById('btnStartGame').onclick = () => {
        const userName = document.getElementById('userName').value.trim();
        const cityName = document.getElementById('cityName').value.trim();
        if(!userName || !cityName) {
            alert("Preencha seu nome e cidade para continuar!");
            return;
        }

        // Limpa tudo de um jogo antigo
        Object.keys(localStorage).forEach(key => {
            if (key !== 'algumaCoisaQueVoceQueiraManter') { // Exemplo de como manter um dado
                localStorage.removeItem(key);
            }
        });

        // Salva os dados iniciais do novo jogo
        localStorage.setItem('userData', JSON.stringify({ userName, cityName, teamName: teamData.nome }));
        localStorage.setItem('elencoDoTime', JSON.stringify(squad));
        const financasIniciais = { caixaAtual: 5000, gastosContratacoes: 0, gastosSalarios: 0, gastosBicho: 0, receitaPartidas: 0, receitaPremiosPatrocinios: 0 };
        localStorage.setItem('financasDoTime', JSON.stringify(financasIniciais));
        const statsIniciais = { entrosamento: 50 };
        localStorage.setItem('teamStats', JSON.stringify(statsIniciais));
        
        // Vai para a tela da temporada
        window.location.href = 'temporada.html';
    };

    elements.teamDetailModal.style.display = 'block';
}

function init() {
    displayTeams();
    elements.teamDetailModalClose.onclick = () => elements.teamDetailModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == elements.teamDetailModal) {
            elements.teamDetailModal.style.display = "none";
        }
    };
}

init();
</script>
</body>
</html>
