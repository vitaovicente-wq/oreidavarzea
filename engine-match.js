// ARQUIVO: engine-match.js
// Responsável por: Estádios, Bilheteria e Simulação

Engine.Estadios = {
    db: {
        "Corinthians": { nome: "Neo Química Arena", cap: 49205 },
        "Palmeiras": { nome: "Allianz Parque", cap: 43713 },
        "São Paulo": { nome: "MorumBIS", cap: 66795 },
        "Santos": { nome: "Vila Belmiro", cap: 16068 },
        "Flamengo": { nome: "Maracanã", cap: 78838 },
        "Fluminense": { nome: "Maracanã", cap: 78838 },
        "Vasco": { nome: "São Januário", cap: 21880 },
        "Botafogo": { nome: "Nilton Santos", cap: 44661 },
        "Atlético-MG": { nome: "Arena MRV", cap: 46000 },
        "Cruzeiro": { nome: "Mineirão", cap: 61846 },
        "Grêmio": { nome: "Arena do Grêmio", cap: 55662 },
        "Internacional": { nome: "Beira-Rio", cap: 50842 },
        "Bahia": { nome: "Arena Fonte Nova", cap: 47907 },
        "Padrao": { nome: "Estádio Municipal", cap: 15000 }
    },
    getEstadio: function() {
        const game = Engine.carregarJogo();
        const nome = game.info.time;
        const base = this.db[nome] || this.db["Padrao"];
        const conf = game.estadio || { precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 } };
        return { ...base, ...conf };
    },
    calcularBilheteria: function(adversarioNome) {
        const game = Engine.carregarJogo();
        const est = this.getEstadio();
        const moral = game.recursos.moral || 50; 
        
        let demanda = moral / 100; 
        const grandes = ["Corinthians", "Flamengo", "Palmeiras", "São Paulo", "Grêmio", "Internacional"];
        if (grandes.includes(adversarioNome)) demanda *= 1.4; 

        const publico = Math.floor(Math.min(est.cap, est.cap * demanda * (0.8 + Math.random()*0.4)));
        const renda = publico * est.precos.geral; // Simplificado para garantir funcionamento

        return { publico, rendaTotal: renda, detalhes: { pubGeral: publico } };
    }
};

Engine.simularJogoCPU = function(jogo) {
    jogo.jogado = true;
    jogo.placarCasa = Math.floor(Math.random() * 3);
    jogo.placarFora = Math.floor(Math.random() * 2);
    if(Math.random() > 0.6) jogo.placarCasa++;
    if(Math.random() > 0.7) jogo.placarFora++;
    // Gera eventos falsos para log
    jogo.eventos = [];
    for(let i=0; i<jogo.placarCasa; i++) jogo.eventos.push({min:10+i*10, tipo:'gol', time:jogo.mandante, jogador:'Atacante'});
    for(let i=0; i<jogo.placarFora; i++) jogo.eventos.push({min:15+i*10, tipo:'gol', time:jogo.visitante, jogador:'Atacante'});
};
