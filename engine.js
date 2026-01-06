const Engine = {
    // --- DADOS PARA GERAÇÃO ALEATÓRIA ---
    nomes: ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Ferreira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Alves", "Carvalho", "Araújo", "Ribeiro", "Müller", "Schneider", "Rossi", "Bianchi", "Smith", "Johnson"],
    prenomes: ["João", "José", "Carlos", "Lucas", "Pedro", "Mateus", "Tiago", "Gabriel", "Rafael", "Daniel", "Bruno", "Leonardo", "Rodrigo", "Guilherme", "Gustavo", "Felipe", "Fernando", "Hans", "Francesco", "James", "Michael"],
    
    // Características Possíveis (Referência)
    caracteristicasPossiveis: [
        "Paredão", "Joga com os Pés", "Pegador de Pênaltis", // Goleiros
        "Xerife", "Construtor", "Apoio", "Defensivo",        // Defensores
        "Maestro", "Cão de Guarda", "Infiltrador",           // Meias
        "Artilheiro", "Veloz", "Pivô",                       // Atacantes
        "Líder", "Normal"                                    // Geral
    ],

    // --- 1. CONFIGURAÇÃO DE COMPETIÇÕES ---
    configCompeticoes: {
        // AMÉRICA DO SUL
        brasil: { copa: "Copa do Brasil", supercopa: "Supercopa do Brasil", cont: "Libertadores", continente: "SUL" },
        argentina: { copa: "Copa Argentina", supercopa: "Supercopa Argentina", cont: "Libertadores", continente: "SUL" },
        uruguai: { copa: "Copa AUF", supercopa: "Supercopa Uruguaia", cont: "Libertadores", continente: "SUL" },
        chile: { copa: "Copa Chile", supercopa: "Supercopa de Chile", cont: "Libertadores", continente: "SUL" },
        paraguai: { copa: "Copa Paraguai", supercopa: "Supercopa Paraguay", cont: "Libertadores", continente: "SUL" },
        colombia: { copa: "Copa Colômbia", supercopa: "Superliga", cont: "Libertadores", continente: "SUL" },
        equador: { copa: "Copa Equador", supercopa: "Supercopa Ecuador", cont: "Libertadores", continente: "SUL" },
        peru: { copa: "Copa Bicentenario", supercopa: "Supercopa Peruana", cont: "Libertadores", continente: "SUL" },
        bolivia: { copa: "Copa Tigo", supercopa: "Supercopa Bolivia", cont: "Libertadores", continente: "SUL" },
        venezuela: { copa: "Copa Venezuela", supercopa: "Supercopa Venezuela", cont: "Libertadores", continente: "SUL" },
        
        // EUROPA
        espanha: { copa: "Copa del Rey", supercopa: "Supercopa de España", cont: "Champions League", continente: "EUR" },
        inglaterra: { copa: "FA Cup", supercopa: "Community Shield", cont: "Champions League", continente: "EUR" },
        portugal: { copa: "Taça de Portugal", supercopa: "Supertaça Cândido de Oliveira", cont: "Champions League", continente: "EUR" }
    },

    // --- 2. SETUP DO JOGO (O "BIG BANG") ---

    novoJogo: function(pais, divisao, timeJogador) {
        // A. Carrega o time do jogador e a liga nacional dele
        const dbLocal = database[pais];
        let timesLiga = Array.isArray(dbLocal) ? JSON.parse(JSON.stringify(dbLocal)) : JSON.parse(JSON.stringify(dbLocal[divisao]));

        // B. Inicializa cada time (Gera elenco, calcula força real, zera stats)
        timesLiga.forEach(t => this.inicializarTime(t));

        // C. Configuração do País
        const config = this.configCompeticoes[pais] || { copa: "Copa Nacional", supercopa: "Supercopa", cont: "Mundial", continente: "SUL" };
        
        // D. Recalcula Expectativa (Baseado na força real dos elencos gerados vs os rivais)
        this.recalcularExpectativasDaLiga(timesLiga);

        // E. Sorteia times para Continental (Times "fantasmas" de outros países)
        const timesContinental = this.gerarParticipantesContinental(config.continente, timesLiga);

        // F. Define quem do meu campeonato vai pra continental
        this.distribuirVagasIniciais(timesLiga, timesContinental);

        // --- GERAÇÃO DE CALENDÁRIOS ---
        
        // 1. Liga Nacional (Pontos Corridos)
        const jogosLiga = this.gerarCalendarioLiga(timesLiga);

        // 2. Copa Nacional (Mata-Mata)
        const jogosCopa = this.sortearMataMata(timesLiga, "Oitavas de Final");

        // 3. Continental (Mata-Mata)
        const classificadosCont = timesContinental.filter(t => t.classificadoContinental === 'A');
        const jogosContinental = this.sortearMataMata(classificadosCont, "Oitavas Continental");

        // 4. Supercopa (Jogo Único - Semana 0)
        const jogoSupercopa = this.gerarSupercopa(timesLiga, pais);

        // 5. Calendário Mestre (Mescla tudo cronologicamente)
        const calendarioMestre = this.mesclarCalendarios(jogosLiga, jogosCopa, jogosContinental, jogoSupercopa, config);

        const saveGame = {
            pais: pais,
            divisao: divisao,
            meuTime: timeJogador,
            ano: 2026,
            semanaAtual: 1,
            times: timesLiga, 
            timesContinental: timesContinental,
            calendario: calendarioMestre,
            config: config
        };

        localStorage.setItem('brfutebol_save', JSON.stringify(saveGame));
        return saveGame;
    },

    inicializarTime: function(t) {
        // Define stats vazios
        t.stats = {
            liga: { p:0, v:0, e:0, d:0, gp:0, gc:0, s:0, j:0 },
            copa: { fase: null, eliminado: false },
            continental: { fase: null, eliminado: false },
            titulos: []
        };
        
        // Gera Elenco e Características
        const nivelBase = this.calcularNivelBase(t.expectativa);
        t.elenco = this.gerarElenco(t.nome, nivelBase, t.destaque);
        
        // Define Força Real (Média dos 11 melhores + Bônus de Traits)
        t.forca = this.calcularForcaElenco(t.elenco);
        
        // Moral começa neutra (100)
        t.moral = 100; 
    },

    // --- 3. GESTÃO DE ELENCO E FORÇA ---

    calcularNivelBase: function(expectativa) {
        const niveis = {
            "Tudo": 92, "Campeão": 88, "Título": 85,
            "Libertadores": 82, "Champions": 82, "Subir (Campeão)": 80,
            "G4": 78, "Subir": 76, "G6": 76, "Sul-Americana": 74,
            "Europa League": 74, "Conference": 72, "Meio Tabela": 68,
            "Meio de Tabela": 68, "Surpresa": 65, "Sobreviver": 62,
            "Não Cair": 58, "Playoffs": 64, "G8": 60
        };
        return niveis[expectativa] || 60;
    },

    gerarElenco: function(nomeTime, nivelBase, nomeDestaque) {
        // 1. TENTA BUSCAR NO BANCO DE DADOS DE JOGADORES REAIS
        if (typeof PlayersDB !== 'undefined' && PlayersDB[nomeTime]) {
            let elencoReal = PlayersDB[nomeTime].map((jogador, index) => ({
                id: `${nomeTime}_real_${index}`,
                nome: jogador.nome,
                pos: jogador.pos,
                forca: jogador.forca,
                idade: jogador.idade,
                carac: jogador.carac || this.sortearCaracteristica(jogador.pos), // Sorteia se não tiver
                energia: 100,
                gols: 0,
                real: true
            }));
            // Completa banco se tiver poucos jogadores
            if (elencoReal.length < 16) {
                const faltam = 16 - elencoReal.length;
                for(let i=0; i<faltam; i++) elencoReal.push(this.criarJogadorAleatorio(nomeTime, nivelBase - 5, i + 100));
            }
            return elencoReal;
        }

        // 2. SE NÃO ACHAR, GERA ALEATÓRIO
        let elenco = [];
        let idCounter = 1;
        // Craque
        elenco.push(this.criarJogadorAleatorio(nomeTime, nivelBase + 8, idCounter++, "ATA", nomeDestaque));
        // Goleiros
        for(let i=0; i<3; i++) elenco.push(this.criarJogadorAleatorio(nomeTime, nivelBase, idCounter++, "GOL"));
        // Linha
        for(let i=0; i<7; i++) elenco.push(this.criarJogadorAleatorio(nomeTime, nivelBase, idCounter++, "ZAG"));
        for(let i=0; i<7; i++) elenco.push(this.criarJogadorAleatorio(nomeTime, nivelBase, idCounter++, "MEI"));
        for(let i=0; i<4; i++) elenco.push(this.criarJogadorAleatorio(nomeTime, nivelBase, idCounter++, "ATA"));
        return elenco;
    },

    criarJogadorAleatorio: function(nomeTime, nivelBase, id, posFixa = null, nomeFixo = null) {
        let nome = nomeFixo;
        if (!nome) {
            const p = this.prenomes[Math.floor(Math.random() * this.prenomes.length)];
            const s = this.nomes[Math.floor(Math.random() * this.nomes.length)];
            nome = `${p} ${s}`;
        }
        const posicoes = ["GOL", "ZAG", "MEI", "ATA"];
        const pos = posFixa || posicoes[Math.floor(Math.random() * posicoes.length)];
        
        let variacao = Math.floor(Math.random() * 10) - 5; 
        let forca = nivelBase + variacao;
        if (forca > 99) forca = 99; if (forca < 40) forca = 40;

        // Atribui característica baseada na posição
        const carac = nomeFixo ? "Líder" : this.sortearCaracteristica(pos);

        return { id: `${nomeTime}_${id}`, nome: nome, pos: pos, forca: forca, carac: carac, idade: Math.floor(Math.random() * 18) + 18, energia: 100, gols: 0, real: false };
    },

    sortearCaracteristica: function(pos) {
        if (Math.random() > 0.6) return "Normal"; // 40% de chance de não ter nada especial

        if (pos === 'GOL') {
            const r = Math.random();
            if (r < 0.4) return "Paredão";
            if (r < 0.7) return "Joga com os Pés";
            return "Pegador de Pênaltis";
        }
        if (pos === 'ZAG') {
            const r = Math.random();
            if (r < 0.3) return "Xerife";
            if (r < 0.5) return "Construtor";
            if (r < 0.75) return "Apoio"; 
            return "Defensivo";
        }
        if (pos === 'MEI') {
            const r = Math.random();
            if (r < 0.35) return "Maestro";
            if (r < 0.7) return "Cão de Guarda";
            return "Infiltrador";
        }
        if (pos === 'ATA') {
            const r = Math.random();
            if (r < 0.4) return "Artilheiro";
            if (r < 0.7) return "Veloz";
            return "Pivô";
        }
        return "Líder";
    },

    calcularForcaElenco: function(elenco) {
        const titulares = this.escolherMelhores11(elenco);
        let soma = 0;
        titulares.forEach(j => soma += j.forca);
        return Math.floor(soma / titulares.length);
    },

    escolherMelhores11: function(elenco) {
        const gols = elenco.filter(j => j.pos === 'GOL').sort((a,b) => b.forca - a.forca);
        const zags = elenco.filter(j => j.pos === 'ZAG').sort((a,b) => b.forca - a.forca);
        const meis = elenco.filter(j => j.pos === 'MEI').sort((a,b) => b.forca - a.forca);
        const atas = elenco.filter(j => j.pos === 'ATA').sort((a,b) => b.forca - a.forca);

        const titulares = [
            gols[0],
            zags[0], zags[1], zags[2], zags[3],
            meis[0], meis[1], meis[2],
            atas[0], atas[1], atas[2]
        ];
        return titulares.filter(j => j !== undefined);
    },

    recalcularExpectativasDaLiga: function(times) {
        const rankingForca = [...times].sort((a, b) => b.forca - a.forca);
        const qtd = times.length;

        rankingForca.forEach((time, index) => {
            const percentual = (index + 1) / qtd;
            let pressao = 0;
            if (percentual <= 0.15) { time.expectativa = "Título"; pressao = 5; }
            else if (percentual <= 0.30) { time.expectativa = "Continental"; pressao = 4; }
            else if (percentual <= 0.60) { time.expectativa = "Meio de Tabela"; pressao = 3; }
            else if (percentual <= 0.85) { time.expectativa = "Não Cair"; pressao = 2; }
            else { time.expectativa = "Lutar contra Rebaixamento"; pressao = 1; }
            time.pressaoDiretoria = pressao;
        });
    },

    // --- 4. CALENDÁRIO ---

    gerarParticipantesContinental: function(continenteAlvo, timesMinhaLiga) {
        let pool = [...timesMinhaLiga];
        Object.keys(database).forEach(chavePais => {
            const confPais = this.configCompeticoes[chavePais];
            // Importa times de outros países do mesmo continente
            if (confPais && confPais.continente === continenteAlvo && database[chavePais] !== database.brasil) { 
                let timesPais = Array.isArray(database[chavePais]) ? database[chavePais] : (database[chavePais].primeira || database[chavePais].serieA);
                if(timesPais) {
                    const timesImportados = JSON.parse(JSON.stringify(timesPais));
                    timesImportados.forEach(t => this.inicializarTime(t));
                    pool = pool.concat(timesImportados);
                }
            }
        });
        return pool;
    },

    distribuirVagasIniciais: function(timesLiga, timesPool) {
        timesPool.sort((a, b) => b.forca - a.forca);
        // Top 16 do continente vão para o mata-mata principal
        for(let i=0; i<16; i++) {
            if(timesPool[i]) {
                timesPool[i].classificadoContinental = 'A';
                timesPool[i].stats.continental.fase = 'Oitavas';
            }
        }
    },

    gerarSupercopa: function(times, pais) {
        let timeA = null;
        let timeB = null;

        // REGRA ESPECÍFICA: BRASIL 2026 = FLAMENGO X CORINTHIANS
        if (pais === 'brasil') {
            timeA = times.find(t => t.nome === 'Flamengo');
            timeB = times.find(t => t.nome === 'Corinthians');
        }

        // Se não achou (ou outra liga), pega os 2 mais fortes
        if (!timeA || !timeB) {
            const tops = [...times].sort((a, b) => b.forca - a.forca).slice(0, 2);
            timeA = tops[0];
            timeB = tops[1];
        }
        
        if(timeA && timeB) {
            return [{ casa: timeA.nome, fora: timeB.nome, idConfronto: 'Final_Supercopa', neutro: true }];
        }
        return null;
    },

    gerarCalendarioLiga: function(times) {
        const numTimes = times.length;
        const jogosPorRodada = numTimes / 2;
        const calendario = [];
        let indices = times.map((_, i) => i);
        let fixo = indices[0];
        let rotativos = indices.slice(1);

        for (let r = 0; r < numTimes - 1; r++) {
            let rodada = [];
            if (r % 2 === 0) rodada.push({ casa: times[fixo].nome, fora: times[rotativos[0]].nome });
            else rodada.push({ casa: times[rotativos[0]].nome, fora: times[fixo].nome });

            for (let i = 1; i < jogosPorRodada; i++) {
                let tA = rotativos[i];
                let tB = rotativos[rotativos.length - i];
                if (r % 2 === 0) rodada.push({ casa: times[tA].nome, fora: times[tB].nome });
                else rodada.push({ casa: times[tB].nome, fora: times[tA].nome });
            }
            calendario.push(rodada);
            rotativos.unshift(rotativos.pop());
        }
        // Returno
        const turno = JSON.parse(JSON.stringify(calendario));
        turno.forEach(rodada => {
            const rodadaVolta = rodada.map(jogo => ({ casa: jogo.fora, fora: jogo.casa }));
            calendario.push(rodadaVolta);
        });
        return calendario;
    },

    sortearMataMata: function(times, faseNome) {
        const vivos = times.filter(t => !t.stats.copa.eliminado && !t.stats.continental.eliminado);
        if (vivos.length % 2 !== 0) vivos.pop(); // Remove ímpar

        const sorteados = [...vivos].sort(() => Math.random() - 0.5);
        const confrontos = [];

        for (let i = 0; i < sorteados.length; i += 2) {
            confrontos.push({
                casa: sorteados[i].nome,
                fora: sorteados[i+1].nome,
                idConfronto: `MataMata_${Math.floor(Math.random() * 99999)}`
            });
        }
        return confrontos;
    },

    mesclarCalendarios: function(jogosLiga, jogosCopa, jogosCont, jogoSupercopa, config) {
        const mestre = [];
        let ligaIdx = 0;

        // SEMANA 1: SUPERCOPA
        if (jogoSupercopa) {
            mestre.push({ tipo: 'SUPERCOPA', nome: config.supercopa, jogos: jogoSupercopa, fase: 'Final', decisivo: true });
        }

        // SEMANA 2, 3: LIGA
        if(jogosLiga[ligaIdx]) mestre.push({ tipo: 'LIGA', nome: `Rodada ${ligaIdx+1}`, jogos: jogosLiga[ligaIdx++] });
        if(jogosLiga[ligaIdx]) mestre.push({ tipo: 'LIGA', nome: `Rodada ${ligaIdx+1}`, jogos: jogosLiga[ligaIdx++] });

        // SEMANA 4: COPA IDA
        if (jogosCopa && jogosCopa.length > 0) {
            mestre.push({ tipo: 'COPA', nome: `${config.copa} (Ida)`, jogos: jogosCopa, fase: 'Oitavas' });
        }

        // SEMANA 5: LIGA
        if(jogosLiga[ligaIdx]) mestre.push({ tipo: 'LIGA', nome: `Rodada ${ligaIdx+1}`, jogos: jogosLiga[ligaIdx++] });

        // SEMANA 6: COPA VOLTA
        if (jogosCopa && jogosCopa.length > 0) {
            const volta = jogosCopa.map(j => ({ casa: j.fora, fora: j.casa, idConfronto: j.idConfronto }));
            mestre.push({ tipo: 'COPA', nome: `${config.copa} (Volta)`, jogos: volta, fase: 'Oitavas', decisivo: true });
        }

        // CONTINENTAL E RESTO DA LIGA
        if (jogosCont && jogosCont.length > 0) {
            if(jogosLiga[ligaIdx]) mestre.push({ tipo: 'LIGA', nome: `Rodada ${ligaIdx+1}`, jogos: jogosLiga[ligaIdx++] });
            
            mestre.push({ tipo: 'CONTINENTAL', nome: `${config.cont} (Ida)`, jogos: jogosCont, fase: 'Oitavas' });
            
            if(jogosLiga[ligaIdx]) mestre.push({ tipo: 'LIGA', nome: `Rodada ${ligaIdx+1}`, jogos: jogosLiga[ligaIdx++] });
            
            const voltaCont = jogosCont.map(j => ({ casa: j.fora, fora: j.casa, idConfronto: j.idConfronto }));
            mestre.push({ tipo: 'CONTINENTAL', nome: `${config.cont} (Volta)`, jogos: voltaCont, fase: 'Oitavas', decisivo: true });
        }

        while (ligaIdx < jogosLiga.length) {
            mestre.push({ tipo: 'LIGA', nome: `Rodada ${ligaIdx+1}`, jogos: jogosLiga[ligaIdx++] });
        }

        return mestre;
    },

    // --- 5. PROCESSAMENTO E SIMULAÇÃO ---

    processarSemana: function(gameState) {
        const semanaIdx = gameState.semanaAtual - 1;
        if (semanaIdx >= gameState.calendario.length) return { fim: true };

        const evento = gameState.calendario[semanaIdx];
        const resultados = [];

        evento.jogos.forEach(jogo => {
            const timeCasa = this.encontrarTime(gameState, jogo.casa);
            const timeFora = this.encontrarTime(gameState, jogo.fora);

            if (timeCasa && timeFora) {
                // Simula
                const placar = this.simularPartida(timeCasa, timeFora, evento.tipo);
                
                jogo.golsCasa = placar.golsCasa;
                jogo.golsFora = placar.golsFora;

                // Atualiza Tabelas
                if (evento.tipo === 'LIGA') {
                    if(this.isTimeDaLiga(gameState, timeCasa)) this.atualizarTabelaLiga(timeCasa, placar.golsCasa, placar.golsFora);
                    if(this.isTimeDaLiga(gameState, timeFora)) this.atualizarTabelaLiga(timeFora, placar.golsFora, placar.golsCasa);
                } 
                else if (evento.decisivo) {
                    this.processarClassificacao(timeCasa, timeFora, placar.golsCasa, placar.golsFora, evento.tipo);
                }

                resultados.push({
                    comp: evento.tipo,
                    casa: timeCasa.nome, escudoCasa: timeCasa.escudo, golsCasa: placar.golsCasa,
                    fora: timeFora.nome, escudoFora: timeFora.escudo, golsFora: placar.golsFora
                });
            }
        });

        // Agenda próximas fases se necessário
        if (evento.decisivo && evento.tipo !== 'SUPERCOPA') {
            this.agendarProximaFase(gameState, evento.tipo);
        }

        gameState.semanaAtual++;
        this.salvarJogo(gameState);
        return { fim: false, resultados: resultados, evento: evento };
    },

    // --- SIMULADOR TÁTICO ---

    simularPartida: function(timeCasa, timeFora, tipo) {
        // 1. Força Base (Média dos 11 titulares)
        let forcaCasa = this.calcularForcaElenco(timeCasa.elenco);
        let forcaFora = this.calcularForcaElenco(timeFora.elenco);

        // 2. Bônus de Características (TÁTICA)
        forcaCasa += this.calcularBonusCaracteristicas(timeCasa);
        forcaFora += this.calcularBonusCaracteristicas(timeFora);

        // 3. Fator Moral
        const moralC = (timeCasa.moral - 50) / 10;
        const moralF = (timeFora.moral - 50) / 10;

        // 4. Fator Casa (Neutro em Supercopa)
        let fatorCasa = 0;
        if (tipo !== 'SUPERCOPA') fatorCasa = Math.floor(Math.random() * 8) + 5;

        // Força Final
        const forcaFinalC = forcaCasa + fatorCasa + moralC;
        const forcaFinalF = forcaFora + moralF;

        // Cálculo de Gols
        const diff = forcaFinalC - forcaFinalF;
        let gC = 0, gF = 0;
        const rC = Math.random(), rF = Math.random();

        if (diff > 15) gC = Math.floor(rC * 5);
        else if (diff > 5) gC = Math.floor(rC * 3);
        else gC = Math.floor(rC * 2);

        if (diff < -15) gF = Math.floor(rF * 5);
        else if (diff < -5) gF = Math.floor(rF * 3);
        else gF = Math.floor(rF * 2);

        // Atualiza Moral pós jogo
        this.atualizarMoral(timeCasa, gC, gF);
        this.atualizarMoral(timeFora, gF, gC);

        return { golsCasa: gC, golsFora: gF };
    },

    calcularBonusCaracteristicas: function(time) {
        let bonus = 0;
        const titulares = this.escolherMelhores11(time.elenco);

        const paredao = titulares.some(j => j.carac === 'Paredão');
        const pes = titulares.some(j => j.carac === 'Joga com os Pés');
        const xerifes = titulares.filter(j => j.carac === 'Xerife').length;
        const apoio = titulares.filter(j => j.carac === 'Apoio').length;
        const maestros = titulares.filter(j => j.carac === 'Maestro').length;
        const caes = titulares.filter(j => j.carac === 'Cão de Guarda').length;
        const artilheiros = titulares.filter(j => j.carac === 'Artilheiro').length;
        const lider = titulares.some(j => j.carac === 'Líder');

        if (paredao) bonus += 2;
        if (xerifes >= 1) bonus += (xerifes * 1.5);
        if (caes >= 1) bonus += (caes * 1.5);
        if (pes) bonus += 1.5; 
        if (apoio >= 1) bonus += (apoio * 1.5);
        if (maestros >= 1) bonus += (maestros * 2);
        if (artilheiros >= 1) bonus += (artilheiros * 2.5);
        if (lider && time.moral < 60) bonus += 4; // Líder ajuda na crise

        return Math.floor(bonus);
    },

    processarClassificacao: function(timeCasa, timeFora, golsC, golsF, tipo) {
        let vencedor = null, perdedor = null;

        if (golsC > golsF) { vencedor = timeCasa; perdedor = timeFora; }
        else if (golsF > golsC) { vencedor = timeFora; perdedor = timeCasa; }
        else {
             // --- PÊNALTIS ---
             let chanceCasa = 0.5;
             const goleiroCasa = this.escolherMelhores11(timeCasa.elenco).find(j => j.pos === 'GOL');
             const goleiroFora = this.escolherMelhores11(timeFora.elenco).find(j => j.pos === 'GOL');

             // Goleiro pegador de pênaltis faz diferença
             if (goleiroCasa && goleiroCasa.carac === 'Pegador de Pênaltis') chanceCasa += 0.15;
             if (goleiroFora && goleiroFora.carac === 'Pegador de Pênaltis') chanceCasa -= 0.15;

             if (Math.random() < chanceCasa) { vencedor = timeCasa; perdedor = timeFora; }
             else { vencedor = timeFora; perdedor = timeCasa; }
        }

        if (tipo === 'SUPERCOPA') {
            vencedor.stats.titulos.push("Supercopa");
            vencedor.moral = 100;
            return { campeao: vencedor.nome };
        } else {
            if (tipo === 'COPA') perdedor.stats.copa.eliminado = true;
            else if (tipo === 'CONTINENTAL') perdedor.stats.continental.eliminado = true;
            
            vencedor.moral += 10; 
            perdedor.moral -= 10;
        }
        return null;
    },

    // --- MÉTODOS AUXILIARES ---

    encontrarTime: function(gameState, nomeTime) {
        let t = gameState.times.find(x => x.nome === nomeTime);
        if (t) return t;
        return gameState.timesContinental.find(x => x.nome === nomeTime);
    },

    isTimeDaLiga: function(gameState, time) {
        return gameState.times.some(t => t.nome === time.nome);
    },

    atualizarMoral: function(time, gp, gc) {
        if (gp > gc) {
            time.moral += 5;
        } else if (gp < gc) {
            const queda = 3 + (time.pressaoDiretoria || 1); 
            time.moral -= queda;
        } else {
            if (time.pressaoDiretoria >= 4) time.moral -= 2; 
            else time.moral += 2;
        }
        if (time.moral > 100) time.moral = 100;
        if (time.moral < 10) time.moral = 10;
    },

    atualizarTabelaLiga: function(time, gp, gc) {
        time.stats.liga.j++; time.stats.liga.gp += gp; time.stats.liga.gc += gc;
        time.stats.liga.s = time.stats.liga.gp - time.stats.liga.gc;
        if (gp > gc) { time.stats.liga.p += 3; time.stats.liga.v++; }
        else if (gp == gc) { time.stats.liga.p++; time.stats.liga.e++; }
        else time.stats.liga.d++;
    },

    agendarProximaFase: function(gameState, tipo) {
        let pool = tipo === 'COPA' ? gameState.times : gameState.timesContinental;
        let vivos = tipo === 'COPA' 
            ? pool.filter(t => !t.stats.copa.eliminado)
            : pool.filter(t => !t.stats.continental.eliminado && t.classificadoContinental === 'A');

        if (vivos.length < 2) return;

        let proximaFase = vivos.length === 8 ? "Quartas" : vivos.length === 4 ? "Semi-Final" : "Final";
        const novosJogos = this.sortearMataMata(vivos, proximaFase);
        const idx = gameState.semanaAtual + 1; 
        
        gameState.calendario.splice(idx, 0, { tipo: tipo, nome: `${this.getNomeTorneio(gameState, tipo)} (${proximaFase} Ida)`, jogos: novosJogos, fase: proximaFase });
        
        const volta = novosJogos.map(j => ({ casa: j.fora, fora: j.casa, idConfronto: j.idConfronto }));
        gameState.calendario.splice(idx + 1, 0, { tipo: tipo, nome: `${this.getNomeTorneio(gameState, tipo)} (${proximaFase} Volta)`, jogos: volta, fase: proximaFase, decisivo: true });
    },

    getNomeTorneio: function(gameState, tipo) {
        if (tipo === 'COPA') return gameState.config.copa;
        if (tipo === 'CONTINENTAL') return gameState.config.cont;
        return 'Liga';
    },

    salvarJogo: function(s) { localStorage.setItem('brfutebol_save', JSON.stringify(s)); },
    carregarJogo: function() { return JSON.parse(localStorage.getItem('brfutebol_save')); },
    getClassificacao: function(gameState) {
        return [...gameState.times].sort((a, b) => {
            if (b.stats.liga.p !== a.stats.liga.p) return b.stats.liga.p - a.stats.liga.p;
            if (b.stats.liga.v !== a.stats.liga.v) return b.stats.liga.v - a.stats.liga.v;
            return b.stats.liga.s - a.stats.liga.s;
        });
    }
};
