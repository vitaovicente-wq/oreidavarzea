const Engine = {
    // --- CONFIGURAÇÕES GERAIS ---
    configCompeticoes: {
        brasil: { 
            nome: "Brasileirão", 
            estaduais: {
                "SP": "Paulistão", "RJ": "Carioca", "MG": "Mineiro", "RS": "Gaúcho", "BA": "Baiano", "PR": "Paranaense"
            },
            cont1: "Libertadores", 
            cont2: "Sul-Americana" 
        },
        argentina: { nome: "Liga Profesional", cont1: "Libertadores", cont2: "Sul-Americana" },
        espanha: { nome: "La Liga", cont1: "Champions League", cont2: "Europa League" },
        inglaterra: { nome: "Premier League", cont1: "Champions League", cont2: "Europa League" },
        italia: { nome: "Serie A", cont1: "Champions League", cont2: "Europa League" }
        // Outros países seguem o padrão...
    },

    // --- 1. SETUP DO JOGO ---

    novoJogo: function(paisUsuario, divisao, timeJogador) {
        // 1. Prepara o Estado Global
        const gameState = {
            paisUsuario: paisUsuario,
            meuTime: timeJogador,
            ano: 2026,
            semanaAtual: 1,
            mundo: {}, 
            calendarioUsuario: []
        };

        // 2. Inicializa o Mundo (Times, Força, Elencos)
        Object.keys(database).forEach(pais => {
            let timesRaw = Array.isArray(database[pais]) ? database[pais] : (database[pais].primeira || database[pais].serieA);
            if (timesRaw && timesRaw.length > 0) {
                // Cria objetos completos
                const timesProcessados = JSON.parse(JSON.stringify(timesRaw)).map(t => this.inicializarTime(t, pais));
                
                gameState.mundo[pais] = {
                    times: timesProcessados,
                    tabelaNacional: this.inicializarTabela(timesProcessados),
                    calendario: [] // Será preenchido abaixo
                };
            }
        });

        // 3. GERAÇÃO DE CALENDÁRIOS (A Mágica Acontece Aqui)
        
        // A. Estaduais (Apenas Brasil por enquanto, outros países fazem pré-temporada)
        if (paisUsuario === 'brasil') {
            this.gerarEstaduais(gameState);
        }

        // B. Ligas Nacionais (Pontos Corridos)
        Object.keys(gameState.mundo).forEach(pais => {
            const liga = gameState.mundo[pais];
            const jogosLiga = this.gerarCalendarioPontosCorridos(liga.times);
            
            // Adiciona ao calendário global do país (após os estaduais se houver)
            // Se for Brasil, os jogos da liga começam na semana 16 (após estaduais)
            const offset = (pais === 'brasil') ? 16 : 0; 
            
            jogosLiga.forEach((rodada, idx) => {
                // Garante que o array da semana existe
                const semanaReal = idx + offset;
                if (!liga.calendario[semanaReal]) liga.calendario[semanaReal] = [];
                
                // Adiciona tag da competição
                rodada.forEach(j => { 
                    j.comp = 'LIGA'; 
                    j.nomeComp = this.configCompeticoes[pais].nome; 
                });
                
                liga.calendario[semanaReal] = liga.calendario[semanaReal].concat(rodada);
            });
        });

        // C. Competições Continentais (Libertadores e Sul-Americana)
        this.gerarCompeticoesContinentais(gameState);

        // 4. Constrói a Visão do Usuário (Calendário Linear)
        this.construirCalendarioUsuario(gameState);

        this.salvarJogo(gameState);
        return gameState;
    },

    inicializarTime: function(t, pais) {
        t.stats = { p:0, j:0, v:0, e:0, d:0, gp:0, gc:0, s:0 };
        // Define estado de origem (simplificado pelo nome do time ou aleatório se genérico)
        t.estado = this.descobrirEstado(t.nome, pais); 
        t.elenco = this.gerarElenco(t.nome, t.forca || 60);
        t.forca = this.calcularForcaElenco(t.elenco);
        t.moral = 100;
        
        // Define vaga continental inicial (Baseado na força para o 1º ano)
        t.vagaContinental = null; // 'LIB' ou 'SULA'
        return t;
    },

    descobrirEstado: function(nome, pais) {
        if(pais !== 'brasil') return null;
        // Mapeamento simples para os grandes, o resto vai para "Genérico"
        const mapas = {
            "SP": ["São Paulo", "Corinthians", "Palmeiras", "Santos", "Bragantino", "Ponte Preta", "Guarani"],
            "RJ": ["Flamengo", "Vasco", "Fluminense", "Botafogo"],
            "MG": ["Cruzeiro", "Atlético-MG", "América-MG"],
            "RS": ["Grêmio", "Internacional", "Juventude"]
        };
        for (let est in mapas) {
            if (mapas[est].includes(nome)) return est;
        }
        return "SP"; // Fallback para não quebrar
    },

    // --- 2. GERADORES DE COMPETIÇÃO ---

    gerarEstaduais: function(gameState) {
        const ligaBrasil = gameState.mundo['brasil'];
        
        // Agrupa times por estado
        const timesPorEstado = {};
        ligaBrasil.times.forEach(t => {
            if (!timesPorEstado[t.estado]) timesPorEstado[t.estado] = [];
            timesPorEstado[t.estado].push(t);
        });

        // Gera calendário para cada estado
        Object.keys(timesPorEstado).forEach(uf => {
            const timesUF = timesPorEstado[uf];
            const nomeEstadual = this.configCompeticoes.brasil.estaduais[uf] || "Estadual";
            
            // Fase de Grupos (Turno único ou Ida/Volta curto)
            // Para simplificar: Todos contra todos turno único (se forem poucos times)
            // Se tiver menos de 4 times, faz ida e volta 2x para encher calendário
            let rodadas = this.gerarCalendarioPontosCorridos(timesUF);
            if (timesUF.length <= 4) rodadas = [...rodadas, ...rodadas]; // Dobra jogos

            // Insere nas primeiras semanas (1 a 12)
            rodadas.forEach((jogos, idx) => {
                if (!ligaBrasil.calendario[idx]) ligaBrasil.calendario[idx] = [];
                
                jogos.forEach(j => {
                    j.comp = 'ESTADUAL';
                    j.nomeComp = nomeEstadual;
                });
                ligaBrasil.calendario[idx] = ligaBrasil.calendario[idx].concat(jogos);
            });

            // Adiciona Final (Mata-mata) na semana 14 e 15
            // (A lógica de classificar para final será feita no processarSemana)
        });
    },

    gerarCompeticoesContinentais: function(gameState) {
        // 1. Distribui Vagas (Baseado na Força Inicial)
        const continente = "SUL"; // Focando na América do Sul
        const paisesSul = ['brasil', 'argentina', 'uruguai', 'chile', 'colombia']; // Exemplo
        
        let poolLiberta = [];
        let poolSula = [];

        Object.keys(gameState.mundo).forEach(pais => {
            // Ordena por força para definir quem vai pra onde
            const times = [...gameState.mundo[pais].times].sort((a,b) => b.forca - a.forca);
            
            // Regra: Top 4 -> Liberta | 5º ao 8º -> Sula
            // (Simplificado para o jogo)
            poolLiberta.push(...times.slice(0, 4));
            poolSula.push(...times.slice(4, 8));
        });

        // 2. Sorteia Confrontos (Oitavas de Final Direto para economizar datas)
        // Semana 18 (Ida) e 20 (Volta) - intercalado com Brasileiro
        this.agendarMataMataContinental(gameState, poolLiberta, 'Libertadores', 18);
        this.agendarMataMataContinental(gameState, poolSula, 'Sul-Americana', 19); // Começa uma semana depois
    },

    agendarMataMataContinental: function(gameState, times, nomeComp, semanaInicio) {
        if (times.length < 2) return;
        
        // Garante par
        if (times.length % 2 !== 0) times.pop();
        
        // Embaralha
        times.sort(() => Math.random() - 0.5);

        const jogosIda = [];
        const jogosVolta = [];

        for (let i = 0; i < times.length; i += 2) {
            const t1 = times[i];
            const t2 = times[i+1];
            const idConfronto = `${nomeComp}_${i}`;
            
            jogosIda.push({ casa: t1.nome, fora: t2.nome, comp: 'CONTINENTAL', nomeComp: nomeComp + " (Oitavas Ida)", idConfronto: idConfronto });
            jogosVolta.push({ casa: t2.nome, fora: t1.nome, comp: 'CONTINENTAL', nomeComp: nomeComp + " (Oitavas Volta)", idConfronto: idConfronto, decisivo: true });
        }

        // Insere no calendário global (usando o país de cada time para achar onde inserir)
        // Como o calendário é global por país, precisamos inserir nos calendários de TODOS os países envolvidos?
        // Sim, mas para simplificar a visualização do usuário, vamos focar em inserir no calendário do BRASIL se tiver time BR.
        // O ideal é ter um "Calendário Internacional" separado, mas vamos injetar no calendário do país do time.

        const injetarNoPais = (jogo, semana) => {
            // Acha o país do mandante
            const timeObj = this.encontrarTimeGlobal(gameState, jogo.casa);
            if (!timeObj) return;
            
            // Descobre o país varrendo o mundo (ineficiente mas funciona pra v1)
            let paisAlvo = null;
            for(let p in gameState.mundo) {
                if(gameState.mundo[p].times.find(t => t.nome === jogo.casa)) paisAlvo = p;
            }

            if (paisAlvo && gameState.mundo[paisAlvo]) {
                if (!gameState.mundo[paisAlvo].calendario[semana]) gameState.mundo[paisAlvo].calendario[semana] = [];
                gameState.mundo[paisAlvo].calendario[semana].push(jogo);
            }
        };

        jogosIda.forEach(j => injetarNoPais(j, semanaInicio));
        jogosVolta.forEach(j => injetarNoPais(j, semanaInicio + 2)); // Pula uma semana
    },

    construirCalendarioUsuario: function(gameState) {
        const ligaUser = gameState.mundo[gameState.paisUsuario];
        gameState.calendarioUsuario = [];

        // Varre todas as semanas possíveis (0 a 50)
        for (let i = 0; i < 50; i++) {
            const jogosDaSemana = ligaUser.calendario[i];
            if (jogosDaSemana && jogosDaSemana.length > 0) {
                // Filtra ou agrupa
                // Pega o nome da competição principal da semana
                const nomePrincipal = jogosDaSemana[0].nomeComp || "Rodada";
                const tipoPrincipal = jogosDaSemana[0].comp || "LIGA";
                
                gameState.calendarioUsuario.push({
                    semana: i + 1,
                    tipo: tipoPrincipal,
                    nome: nomePrincipal,
                    jogos: jogosDaSemana
                });
            }
        }
    },

    // --- 3. MOTOR DE SIMULAÇÃO ---

    processarSemana: function(gameState) {
        const semanaReal = gameState.semanaAtual - 1; // Índice 0-based
        const paisUser = gameState.paisUsuario;

        // 1. Simula Jogos do País do Usuário (Detalhado)
        if (gameState.mundo[paisUser].calendario[semanaReal]) {
            const jogos = gameState.mundo[paisUser].calendario[semanaReal];
            jogos.forEach(jogo => {
                if (jogo.golsCasa !== undefined) return; // Já jogado

                const tC = this.encontrarTimeGlobal(gameState, jogo.casa);
                const tF = this.encontrarTimeGlobal(gameState, jogo.fora);

                // Simula
                const placar = this.simularPlacarRapido(tC, tF);
                jogo.golsCasa = placar.gc;
                jogo.golsFora = placar.gf;

                // Atualiza Tabela (Se for Liga)
                if (jogo.comp === 'LIGA') {
                    this.computarJogoLiga(tC, tF, placar.gc, placar.gf, gameState.mundo[paisUser].tabelaNacional);
                }
                
                // Mata-mata (Continental/Copa)
                if (jogo.decisivo) {
                    this.processarMataMata(tC, tF, jogo, gameState);
                }

                // Gols
                this.distribuirGols(tC, placar.gc);
                this.distribuirGols(tF, placar.gf);
            });
        }

        // 2. Simula o Resto do Mundo (Rápido - Apenas Liga)
        Object.keys(gameState.mundo).forEach(p => {
            if (p === paisUser) return; // Já processado acima
            const liga = gameState.mundo[p];
            if (liga.calendario[semanaReal]) {
                liga.calendario[semanaReal].forEach(j => {
                    // Simulação ultra-rápida para estrangeiros
                    const r = this.simularPlacarRapido(
                        { forca: 70 }, { forca: 70 } // Placeholder se não achar time
                    ); 
                    // Se achar times reais, usa força real
                    const tC = liga.times.find(t => t.nome === j.casa);
                    const tF = liga.times.find(t => t.nome === j.fora);
                    if(tC && tF) {
                        const rReal = this.simularPlacarRapido(tC, tF);
                        this.computarJogoLiga(tC, tF, rReal.gc, rReal.gf, liga.tabelaNacional);
                    }
                });
            }
        });

        gameState.semanaAtual++;
        
        // Reconstrói a visão do usuário para atualizar nomes/fases se necessário
        this.construirCalendarioUsuario(gameState);
        
        this.salvarJogo(gameState);
        return { fim: false };
    },

    // --- AUXILIARES E UTILITÁRIOS ---

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

    computarJogoLiga: function(tC, tF, gc, gf, tabela) {
        // Atualiza stats do time
        const update = (t, gp, gc_adv) => {
            t.stats.j++; t.stats.gp += gp; t.stats.gc += gc_adv; t.stats.s = t.stats.gp - t.stats.gc;
            if(gp > gc_adv) { t.stats.v++; t.stats.p += 3; }
            else if(gp === gc_adv) { t.stats.e++; t.stats.p += 1; }
            else t.stats.d++;
        };
        update(tC, gc, gf);
        update(tF, gf, gc);
    },

    processarMataMata: function(tC, tF, jogo, gameState) {
        // Lógica simples: Quem passar avança.
        // Como não temos persistência do jogo de ida aqui fácil, vamos assumir que quem ganha o jogo decisivo ou pênaltis passa.
        // Para v1, apenas notificamos (o sistema de agendar próxima fase requereria ler o histórico).
        // Vamos deixar o mata-mata estático nas Oitavas por enquanto para não complicar demais o código nesta iteração.
    },

    // Métodos Genéricos Mantidos (GerarElenco, etc)
    gerarCalendarioPontosCorridos: function(times) {
        // Algoritmo Berger (mesmo do anterior)
        if (times.length % 2 !== 0) times.push({ nome: "Folga", fantasma: true });
        const n = times.length; const rodadas = []; const jogosPorRodada = n / 2;
        let indices = times.map((_, i) => i);
        for (let r = 0; r < n - 1; r++) {
            let rodada = [];
            for (let i = 0; i < jogosPorRodada; i++) {
                const t1 = indices[i]; const t2 = indices[n - 1 - i];
                if (!times[t1].fantasma && !times[t2].fantasma) {
                    if (r % 2 === 0) rodada.push({ casa: times[t1].nome, fora: times[t2].nome });
                    else rodada.push({ casa: times[t2].nome, fora: times[t1].nome });
                }
            }
            rodadas.push(rodada); indices.splice(1, 0, indices.pop());
        }
        const returno = rodadas.map(r => r.map(j => ({ casa: j.fora, fora: j.casa })));
        return [...rodadas, ...returno];
    },

    inicializarTabela: function(times) { return times; }, // A própria lista de times serve como tabela pois tem os stats
    encontrarTimeGlobal: function(gameState, nome) {
        for(let p in gameState.mundo) {
            const t = gameState.mundo[p].times.find(x => x.nome === nome);
            if(t) return t;
        }
        return null;
    },
    getClassificacao: function(gameState, pais) {
        return [...gameState.mundo[pais].times].sort((a,b) => {
            if(b.stats.p !== a.stats.p) return b.stats.p - a.stats.p;
            return b.stats.s - a.stats.s;
        });
    },
    
    // ... (Manter gerarElenco, calcularForcaElenco, distribuirGols, financas igual ao anterior)
    gerarElenco: function(nome, forcaBase) {
        let elenco = [];
        const posicoes = ["GOL", "ZAG", "MEI", "ATA"];
        for(let i=0; i<22; i++) {
            let pos = posicoes[i % 4]; if(i<3) pos = "GOL";
            elenco.push({ id: nome+i, nome: `Jog ${i} ${nome.substring(0,3)}`, pos: pos, forca: forcaBase, carac: "Normal", gols: 0, idade: 20 });
        }
        return elenco;
    },
    calcularForcaElenco: function(elenco) { return 70; }, // Placeholder
    distribuirGols: function(t, q) { /* Lógica simples */ },
    salvarJogo: function(s) { localStorage.setItem('brfutebol_save', JSON.stringify(s)); },
    carregarJogo: function() { return JSON.parse(localStorage.getItem('brfutebol_save')); },
    formatarDinheiro: function(v, m) { return (m||"R$") + " " + v.toLocaleString(); }
};
