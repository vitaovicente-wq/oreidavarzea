const Engine = {
    // --- CONFIGURAÇÕES GERAIS ---
    configCompeticoes: {
        brasil: { nome: "Brasileirão", cont: "Libertadores" },
        argentina: { nome: "Liga Profesional", cont: "Libertadores" },
        espanha: { nome: "La Liga", cont: "Champions League" },
        inglaterra: { nome: "Premier League", cont: "Champions League" }
        // Adicione outros conforme necessário
    },

    // --- 1. SETUP DO JOGO ---
    novoJogo: function(paisUsuario, divisao, timeJogador) {
        const gameState = {
            paisUsuario: paisUsuario,
            meuTime: timeJogador,
            ano: 2026,
            semanaAtual: 1,
            mundo: {}, 
            calendarioUsuario: []
        };

        // Inicializa o Mundo
        Object.keys(database).forEach(pais => {
            let timesRaw = Array.isArray(database[pais]) ? database[pais] : (database[pais].primeira || database[pais].serieA);
            if (timesRaw && timesRaw.length > 0) {
                const timesProcessados = JSON.parse(JSON.stringify(timesRaw)).map(t => this.inicializarTime(t, pais));
                
                // Gera calendário local
                const calendarioLiga = this.gerarCalendarioPontosCorridos(timesProcessados);

                gameState.mundo[pais] = {
                    times: timesProcessados,
                    calendario: calendarioLiga,
                    tabela: [] // Será preenchida dinamicamente
                };
            }
        });

        // Constrói Calendário do Usuário (Linear)
        this.construirCalendarioUsuario(gameState);

        // Inicializa Finanças do Jogador
        const meuTimeObj = this.encontrarTime(gameState, timeJogador);
        if (meuTimeObj) this.inicializarFinancas(meuTimeObj);

        this.salvarJogo(gameState);
        return gameState;
    },

    inicializarTime: function(t, pais) {
        t.stats = { p:0, j:0, v:0, e:0, d:0, gp:0, gc:0, s:0 };
        t.elenco = this.gerarElenco(t.nome, t.forca || 60);
        t.forca = this.calcularForcaElenco(t.elenco);
        t.moral = 100;
        
        // Tática
        t.funcoes = { capitao: null, penalti: null, falta: null, escanteio: null };
        this.definirFuncoesAutomaticas(t);
        
        return t;
    },

    // --- 2. CALENDÁRIO ---
    gerarCalendarioPontosCorridos: function(times) {
        if (times.length % 2 !== 0) times.push({ nome: "Folga", fantasma: true });
        const n = times.length;
        const rodadas = [];
        const jogosPorRodada = n / 2;
        let indices = times.map((_, i) => i);

        for (let r = 0; r < n - 1; r++) {
            let rodada = [];
            for (let i = 0; i < jogosPorRodada; i++) {
                const t1 = indices[i];
                const t2 = indices[n - 1 - i];
                if (!times[t1].fantasma && !times[t2].fantasma) {
                    if (r % 2 === 0) rodada.push({ casa: times[t1].nome, fora: times[t2].nome });
                    else rodada.push({ casa: times[t2].nome, fora: times[t1].nome });
                }
            }
            rodadas.push(rodada);
            indices.splice(1, 0, indices.pop());
        }
        
        const returno = rodadas.map(r => r.map(j => ({ casa: j.fora, fora: j.casa })));
        return [...rodadas, ...returno];
    },

    construirCalendarioUsuario: function(gameState) {
        const ligaUser = gameState.mundo[gameState.paisUsuario];
        gameState.calendarioUsuario = []; // Limpa e recria

        // Mapeia o calendário do país do usuário para a visão linear
        ligaUser.calendario.forEach((jogosRodada, idx) => {
            gameState.calendarioUsuario.push({
                semana: idx + 1,
                tipo: 'LIGA',
                nome: `Rodada ${idx + 1}`,
                jogos: jogosRodada
            });
        });
    },

    // --- 3. SIMULAÇÃO ---
    processarSemana: function(gameState) {
        const semanaReal = gameState.semanaAtual - 1;
        
        // Simula TODOS os países
        Object.keys(gameState.mundo).forEach(pais => {
            const liga = gameState.mundo[pais];
            
            if (liga.calendario[semanaReal]) {
                liga.calendario[semanaReal].forEach(jogo => {
                    if (jogo.golsCasa !== undefined) return; // Já jogado

                    const tC = this.encontrarTimeNoPais(gameState, pais, jogo.casa);
                    const tF = this.encontrarTimeNoPais(gameState, pais, jogo.fora);

                    if (tC && tF) {
                        const placar = this.simularPlacarRapido(tC, tF);
                        jogo.golsCasa = placar.gc;
                        jogo.golsFora = placar.gf;

                        this.computarJogo(tC, tF, placar.gc, placar.gf);
                        this.distribuirGols(tC, placar.gc);
                        this.distribuirGols(tF, placar.gf);
                    }
                });
            }
        });

        gameState.semanaAtual++;
        this.salvarJogo(gameState);
        return { fim: false };
    },

    computarJogo: function(tC, tF, gc, gf) {
        const update = (t, gp, gc_adv) => {
            t.stats.j++; t.stats.gp += gp; t.stats.gc += gc_adv; t.stats.s = t.stats.gp - t.stats.gc;
            if(gp > gc_adv) { t.stats.v++; t.stats.p += 3; }
            else if(gp === gc_adv) { t.stats.e++; t.stats.p += 1; }
            else t.stats.d++;
        };
        update(tC, gc, gf);
        update(tF, gf, gc);
    },

    simularPlacarRapido: function(tC, tF) {
        const fC = tC.forca + 5; 
        const fF = tF.forca;
        const diff = fC - fF;
        
        let lambdaC = 1.3 + (diff/30);
        let lambdaF = 1.0 - (diff/30);
        if(lambdaC < 0.1) lambdaC = 0.1;
        if(lambdaF < 0.1) lambdaF = 0.1;

        const getGols = (l) => {
            let L = Math.exp(-l), p=1, k=0;
            do { k++; p *= Math.random(); } while(p > L);
            return k-1;
        };
        return { gc: getGols(lambdaC), gf: getGols(lambdaF) };
    },

    // --- 4. UTILITÁRIOS (FUNDAMENTAL PARA O DASHBOARD) ---

    // Busca um time em todo o mundo (usado pelo Dashboard antigo/novo)
    encontrarTime: function(gameState, nomeTime) {
        if (!gameState || !gameState.mundo) return null;
        for (const pais in gameState.mundo) {
            const time = gameState.mundo[pais].times.find(t => t.nome === nomeTime);
            if (time) return time;
        }
        return null;
    },

    encontrarTimeNoPais: function(gameState, pais, nomeTime) {
        return gameState.mundo[pais].times.find(t => t.nome === nomeTime);
    },

    getClassificacao: function(gameState, paisOverride = null) {
        // Se não passar país, usa o do usuário
        const pais = paisOverride || gameState.paisUsuario;
        if (!gameState.mundo[pais]) return [];

        return [...gameState.mundo[pais].times].sort((a, b) => {
            if (b.stats.p !== a.stats.p) return b.stats.p - a.stats.p;
            if (b.stats.v !== a.stats.v) return b.stats.v - a.stats.v;
            return b.stats.s - a.stats.s;
        });
    },

    // --- ELENCO E FINANÇAS ---
    gerarElenco: function(nome, forcaBase) {
        if (typeof PlayersDB !== 'undefined' && PlayersDB[nome]) {
            // Se existir no DB real
            return PlayersDB[nome].map((j, i) => ({
                id: nome+i, nome: j.nome, pos: j.pos, forca: j.forca, carac: j.carac || "Normal", gols: 0, idade: 25, energia: 100
            }));
        }
        // Aleatório
        let elenco = [];
        const posicoes = ["GOL", "ZAG", "MEI", "ATA"];
        for(let i=0; i<20; i++) {
            let pos = posicoes[i % 4]; if(i<2) pos = "GOL";
            elenco.push({
                id: nome+i, nome: `Jogador ${i}`, pos: pos, 
                forca: Math.max(40, forcaBase + Math.floor(Math.random()*10)-5),
                carac: "Normal", gols: 0, idade: 20+Math.floor(Math.random()*10), energia: 100
            });
        }
        return elenco;
    },

    calcularForcaElenco: function(elenco) {
        const tits = elenco.slice(0, 11);
        let s = 0; tits.forEach(p => s += p.forca);
        return Math.floor(s / Math.max(1, tits.length));
    },

    inicializarFinancas: function(t) {
        t.financas = { 
            caixa: 10000000, 
            moeda: "R$",
            receitas: { patrocinioMaster: 5000000, tv: 8000000, bilheteria: 0 }, 
            despesas: { folhaSalarial: 0, manutencao: 200000 } 
        };
        // Calcula salários
        let folha = 0;
        t.elenco.forEach(p => { 
            p.salario = p.forca * 1000; 
            folha += p.salario;
        });
        t.financas.despesas.folhaSalarial = folha * 13;
    },

    definirFuncoesAutomaticas: function(t) {
        if(t.elenco.length > 0) {
            t.funcoes.capitao = t.elenco[0].id;
            t.funcoes.penalti = t.elenco[t.elenco.length-1].id;
            t.funcoes.falta = t.elenco[t.elenco.length-1].id;
            t.funcoes.escanteio = t.elenco[t.elenco.length-1].id;
        }
    },

    distribuirGols: function(time, qtd) {
        for(let i=0; i<qtd; i++) {
            const autor = time.elenco[Math.floor(Math.random() * Math.min(11, time.elenco.length))];
            if(autor) autor.gols++;
        }
    },

    formatarDinheiro: function(v, m) { return (m||"R$") + " " + (v||0).toLocaleString(); },
    salvarJogo: function(s) { localStorage.setItem('brfutebol_save', JSON.stringify(s)); },
    carregarJogo: function() { return JSON.parse(localStorage.getItem('brfutebol_save')); }
};
