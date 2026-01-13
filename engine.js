// ARQUIVO: engine.js (V5.3 - CORREÇÃO DEFINITIVA DO FINANCEIRO)

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando: ${nomeTimeSelecionado}`);

        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO: calendario.js não carregado.");
            return;
        }

        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
        });

        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome, escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        // CRIAÇÃO DO ESTADO INICIAL (JÁ COM HISTÓRICO FINANCEIRO)
        const estadoDoJogo = {
            info: {
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Manager",
                time: nomeTimeSelecionado,
                escudo: localStorage.getItem('brfutebol_escudo'),
                divisao: divisao
            },
            recursos: { 
                dinheiro: 5000000, 
                moral: 100,
                rodadaFinanceiraProcessada: false 
            },
            financas: {
                saldo: 5000000,
                historico: [
                    { texto: "Investimento Inicial", valor: 5000000, tipo: "entrada" }
                ]
            },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            classificacao: classificacaoInicial,
            jogadoresStatus: {},
            mensagens: [] // Inicia caixa de entrada vazia
        };

        this.salvarJogo(estadoDoJogo);
    },

    // --- 2. SISTEMA DE BUSCA ---
    encontrarTime: function(nomeTime) {
        const save = this.carregarJogo();
        if (!save || !save.times) return { nome: nomeTime, forca: 0, elenco: [] };
        return save.times.find(t => t.nome === nomeTime) || { nome: nomeTime, forca: 0, elenco: [] };
    },

    getMeuTime: function() {
        const save = this.carregarJogo();
        if (!save) return null;
        return this.encontrarTime(save.info.time);
    },

    // --- 3. SAVE / LOAD ---
    salvarJogo: function(estado) {
        localStorage.setItem('brfutebol_save', JSON.stringify(estado));
    },

    carregarJogo: function() {
        const saveJson = localStorage.getItem('brfutebol_save');
        return saveJson ? JSON.parse(saveJson) : null;
    },

    // --- 4. ATUALIZAÇÃO DA TABELA (MODIFICADO PARA SINCRONIZAR FINANCEIRO) ---
    atualizarTabela: function(estadoJogo) {
        const tabela = estadoJogo.classificacao || estadoJogo.tabela;

        // Reseta pontuação para recalcular (garante consistência)
        tabela.forEach(t => {
            t.pts = 0; t.j = 0; t.v = 0; t.e = 0; t.d = 0; t.gp = 0; t.gc = 0; t.sg = 0;
        });

        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => {
                if (jogo.jogado) {
                    this._computarJogoNaTabela(tabela, jogo);
                }
            });
        });

        tabela.sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg || b.gp - a.gp);
        
        // --- HOOK FINANCEIRO INTEGRADO ---
        // Verifica se é a rodada atual e se o jogo do player aconteceu
        const rodadaIdx = estadoJogo.rodadaAtual - 1;
        if(estadoJogo.calendario[rodadaIdx]) {
            const jogoPlayer = estadoJogo.calendario[rodadaIdx].jogos.find(j => j.mandante === estadoJogo.info.time || j.visitante === estadoJogo.info.time);
            
            // Se o jogo foi jogado e a grana ainda não foi processada
            if (jogoPlayer && jogoPlayer.jogado && !estadoJogo.recursos.rodadaFinanceiraProcessada) {
                
                const isMandante = jogoPlayer.mandante === estadoJogo.info.time;
                const adversario = isMandante ? jogoPlayer.visitante : jogoPlayer.mandante;
                
                // Passamos o 'estadoJogo' para a função modificar DIRETAMENTE na memória
                this.sistema.processarRodadaFinanceira(estadoJogo, isMandante, adversario);
                this.sistema.gerarPropostaTransferencia(); 
                
                estadoJogo.recursos.rodadaFinanceiraProcessada = true;
            }
        }

        // SALVA TUDO DE UMA VEZ (Tabela + Financeiro)
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);
        if (!timeCasa || !timeFora) return;

        const gc = parseInt(jogo.placarCasa);
        const gf = parseInt(jogo.placarFora);

        timeCasa.j++; timeCasa.gp += gc; timeCasa.gc += gf; timeCasa.sg = timeCasa.gp - timeCasa.gc;
        timeFora.j++; timeFora.gp += gf; timeFora.gc += gc; timeFora.sg = timeFora.gp - timeFora.gc;

        if (gc > gf) { timeCasa.v++; timeCasa.pts += 3; timeFora.d++; }
        else if (gf > gc) { timeFora.v++; timeFora.pts += 3; timeCasa.d++; }
        else { timeCasa.e++; timeCasa.pts++; timeFora.e++; timeFora.pts++; }
    },

    // --- 5. SIMULAÇÃO CPU ---
    simularJogoCPU: function(jogo) {
        jogo.jogado = true;
        jogo.placarCasa = Math.floor(Math.random() * 3);
        jogo.placarFora = Math.floor(Math.random() * 2);
        if(Math.random() > 0.6) jogo.placarCasa++;
        if(Math.random() > 0.7) jogo.placarFora++;

        jogo.eventos = []; 

        const timeCasa = this.encontrarTime(jogo.mandante);
        for(let i=0; i<jogo.placarCasa; i++) {
            jogo.eventos.push(this._gerarGolSimulado(timeCasa, jogo.mandante));
        }

        const timeFora = this.encontrarTime(jogo.visitante);
        for(let i=0; i<jogo.placarFora; i++) {
            jogo.eventos.push(this._gerarGolSimulado(timeFora, jogo.visitante));
        }
        
        jogo.eventos.sort((a,b) => a.min - b.min);
    },

    _gerarGolSimulado: function(timeObj, nomeTime) {
        let nomeJog = "Atacante";
        
        if(timeObj.elenco && timeObj.elenco.length > 0) {
            const artilheiros = timeObj.elenco.filter(j => j.pos !== 'GOL');
            const pool = artilheiros.length > 0 ? artilheiros : timeObj.elenco;
            const sorteado = pool[Math.floor(Math.random() * pool.length)];
            nomeJog = sorteado.nome;
        } else {
            nomeJog = "Camisa " + (Math.floor(Math.random() * 10) + 2);
        }

        return {
            min: Math.floor(Math.random() * 90) + 1,
            time: nomeTime,
            jogador: nomeJog,
            tipo: 'gol'
        };
    },

    _gerarTimesGenericos: function(div) {
        let lista = [];
        for (let i = 1; i <= 20; i++) {
            lista.push({ nome: `Time ${i}`, forca: 50, elenco: [] });
        }
        return lista;
    },

    // =========================================================================
    // --- 6. MÓDULO DE ESTÁDIO (LISTA COMPLETA) ---
    // =========================================================================
    estadios: {
        db: {
            // SÃO PAULO
            "Corinthians": { nome: "Neo Química Arena", cap: 49205 },
            "Palmeiras": { nome: "Allianz Parque", cap: 43713 },
            "São Paulo": { nome: "MorumBIS", cap: 66795 },
            "Santos": { nome: "Vila Belmiro", cap: 16068 },
            "Bragantino": { nome: "Nabi Abi Chedid", cap: 17022 },
            "Ponte Preta": { nome: "Moisés Lucarelli", cap: 17728 },
            "Guarani": { nome: "Brinco de Ouro", cap: 29130 },
            "Novorizontino": { nome: "Jorjão", cap: 16000 },
            "Mirassol": { nome: "Maião", cap: 15000 },
            "Ituano": { nome: "Novelli Júnior", cap: 18560 },
            "Botafogo-SP": { nome: "Santa Cruz", cap: 29292 },

            // RIO DE JANEIRO
            "Flamengo": { nome: "Maracanã", cap: 78838 },
            "Fluminense": { nome: "Maracanã", cap: 78838 },
            "Vasco": { nome: "São Januário", cap: 21880 },
            "Botafogo": { nome: "Nilton Santos", cap: 44661 },

            // MINAS GERAIS
            "Atlético-MG": { nome: "Arena MRV", cap: 46000 },
            "Cruzeiro": { nome: "Mineirão", cap: 61846 },
            "América-MG": { nome: "Independência", cap: 23018 },
            "Tombense": { nome: "Almeidão", cap: 6555 },

            // SUL
            "Grêmio": { nome: "Arena do Grêmio", cap: 55662 },
            "Internacional": { nome: "Beira-Rio", cap: 50842 },
            "Juventude": { nome: "Alfredo Jaconi", cap: 19924 },
            "Criciúma": { nome: "Heriberto Hülse", cap: 19225 },
            "Avaí": { nome: "Ressacada", cap: 17800 },
            "Chapecoense": { nome: "Arena Condá", cap: 20089 },
            "Brusque": { nome: "Augusto Bauer", cap: 5000 },
            "Athletico-PR": { nome: "Ligga Arena", cap: 42372 },
            "Coritiba": { nome: "Couto Pereira", cap: 40502 },
            "Operário-PR": { nome: "Germano Krüger", cap: 10632 },
            "Londrina": { nome: "Estádio do Café", cap: 30000 },

            // NORDESTE
            "Bahia": { nome: "Arena Fonte Nova", cap: 47907 },
            "Vitória": { nome: "Barradão", cap: 30618 },
            "Fortaleza": { nome: "Arena Castelão", cap: 63903 },
            "Ceará": { nome: "Arena Castelão", cap: 63903 },
            "Sport": { nome: "Arena de Pernambuco", cap: 44300 }, 
            "Náutico": { nome: "Aflitos", cap: 22856 },
            "Santa Cruz": { nome: "Arruda", cap: 60044 },
            "CRB": { nome: "Rei Pelé", cap: 17126 },
            "CSA": { nome: "Rei Pelé", cap: 17126 },
            "Sampaio Corrêa": { nome: "Castelão-MA", cap: 40149 },
            "ABC": { nome: "Frasqueirão", cap: 18000 },

            // CENTRO-OESTE & NORTE
            "Cuiabá": { nome: "Arena Pantanal", cap: 44097 },
            "Atlético-GO": { nome: "Antônio Accioly", cap: 12500 },
            "Goiás": { nome: "Serrinha", cap: 14450 },
            "Vila Nova": { nome: "OBA", cap: 11788 },
            "Paysandu": { nome: "Curuzu", cap: 16200 },
            "Remo": { nome: "Baenão", cap: 13792 },
            "Amazonas": { nome: "Arena da Amazônia", cap: 44000 },

            // GENÉRICO
            "Padrao": { nome: "Estádio Municipal", cap: 15000 }
        },

        getEstadio: function() {
            const game = Engine.carregarJogo();
            const timeNome = game.info.time;
            const dadosBase = this.db[timeNome] || this.db["Padrao"];
            
            const config = game.estadio || {
                precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 },
                manutencao: 100 
            };

            return { ...dadosBase, ...config };
        },

        salvarPrecos: function(novosPrecos) {
            const game = Engine.carregarJogo();
            if(!game.estadio) game.estadio = {};
            game.estadio.precos = novosPrecos;
            Engine.salvarJogo(game);
        },

        calcularBilheteria: function(adversarioNome) {
            const game = Engine.carregarJogo();
            const estadio = this.getEstadio();
            const moral = game.recursos.moral || 50; 
            
            let demandaBase = moral / 100; 
            const grandes = ["Corinthians", "Flamengo", "Palmeiras", "São Paulo", "Vasco", "Grêmio", "Internacional", "Atlético-MG", "Cruzeiro", "Santos"];
            
            if (grandes.includes(adversarioNome)) demandaBase *= 1.4; 

            const capGeral = Math.floor(estadio.cap * 0.50);
            const capCadeiras = Math.floor(estadio.cap * 0.40);
            const capVip = Math.floor(estadio.cap * 0.10);

            const fatorFase = 1 + ((moral - 50) / 200);
            const justo = { geral: 40 * fatorFase, cadeiras: 90 * fatorFase, vip: 280 * fatorFase };

            const calcOcupacao = (cap, preco, ref) => {
                let atratividade = ref / preco; 
                let taxaOcupacao = demandaBase * atratividade;
                taxaOcupacao *= (0.9 + Math.random() * 0.2); 
                return Math.floor(Math.max(0, Math.min(cap * taxaOcupacao, cap)));
            };

            const pubGeral = calcOcupacao(capGeral, estadio.precos.geral, justo.geral);
            const pubCadeiras = calcOcupacao(capCadeiras, estadio.precos.cadeiras, justo.cadeiras);
            const pubVip = calcOcupacao(capVip, estadio.precos.vip, justo.vip);
            
            const publicoTotal = pubGeral + pubCadeiras + pubVip;
            const carros = Math.floor(publicoTotal * 0.2);
            const rendaPark = carros * estadio.precos.estacionamento;

            const rendaIngressos = (pubGeral * estadio.precos.geral) + 
                                   (pubCadeiras * estadio.precos.cadeiras) + 
                                   (pubVip * estadio.precos.vip);

            return {
                publico: publicoTotal,
                rendaTotal: rendaIngressos + rendaPark,
                detalhes: { pubGeral, pubCadeiras, pubVip, carros }
            };
        }
    },

    // --- 7. SISTEMA FINANCEIRO E MENSAGENS ---
    sistema: {
        novaMensagem: function(titulo, corpo, tipo = 'info', acao = null) {
            const game = Engine.carregarJogo();
            if (!game.mensagens) game.mensagens = [];
            
            const msg = {
                id: Date.now(),
                rodada: game.rodadaAtual,
                titulo: titulo,
                corpo: corpo,
                tipo: tipo,
                lida: false,
                acao: acao 
            };
            
            game.mensagens.unshift(msg);
            Engine.salvarJogo(game);
        },

        // MODIFICADO: Agora altera o objeto 'game' que vem da memória, NÃO carrega do disco
        processarRodadaFinanceira: function(game, mandante, adversario) {
            if (!game.financas) game.financas = { saldo: 0, historico: [] };
            
            // 1. Bilheteria (Se Mandante)
            if (mandante) {
                const bilheteria = Engine.estadios.calcularBilheteria(adversario);
                const renda = bilheteria.rendaTotal;
                
                game.recursos.dinheiro += renda;
                game.financas.historico.push({ texto: `Bilheteria vs ${adversario}`, valor: renda, tipo: 'entrada' });
            }

            // 2. Salários (Fixo por rodada)
            let folhaSalarial = 0;
            // Busca o elenco dentro do objeto 'game' que estamos manipulando
            const meuTime = game.times.find(t => t.nome === game.info.time);
            if(meuTime && meuTime.elenco) {
                meuTime.elenco.forEach(j => {
                    folhaSalarial += ((j.forca || 60) * 1500); 
                });
            }
            
            game.recursos.dinheiro -= folhaSalarial;
            game.financas.historico.push({ texto: `Salários da Equipe`, valor: -folhaSalarial, tipo: 'saida' });

            // 3. Manutenção do Estádio
            const dadosEstadio = Engine.estadios.getEstadio();
            const custoManutencao = Math.floor(dadosEstadio.cap * 5); 
            
            game.recursos.dinheiro -= custoManutencao;
            game.financas.historico.push({ texto: `Manutenção Arena`, valor: -custoManutencao, tipo: 'saida' });

            // NOTA: Não chamamos Engine.salvarJogo(game) aqui. 
            // Quem chama é o 'atualizarTabela', que salva tudo de uma vez.
        },

        gerarPropostaTransferencia: function() {
            const game = Engine.carregarJogo();
            const meuTime = Engine.encontrarTime(game.info.time);
            
            if(Math.random() > 0.15) return; 

            const jogador = meuTime.elenco[Math.floor(Math.random() * meuTime.elenco.length)];
            const valorBase = (jogador.forca * 80000); 
            const oferta = Math.floor(valorBase * (0.9 + Math.random() * 0.6)); 

            const interessados = ["Real Madrid", "Barcelona", "City", "PSG", "Bayern", "Chelsea", "Boca", "River", "Al-Hilal", "Benfica"];
            const timeComprador = interessados[Math.floor(Math.random() * interessados.length)];

            Engine.sistema.novaMensagem(
                `Oferta por ${jogador.nome}`,
                `O ${timeComprador} ofereceu <b>R$ ${oferta.toLocaleString()}</b> pelo atleta ${jogador.nome}.`,
                'proposta',
                { tipo: 'venda', valor: oferta, uid: jogador.uid, nomeJog: jogador.nome }
            );
        },

        aceitarVenda: function(msgId) {
            const game = Engine.carregarJogo();
            const msgIndex = game.mensagens.findIndex(m => m.id === msgId);
            if(msgIndex === -1) return;

            const msg = game.mensagens[msgIndex];
            if(!msg.acao || msg.acao.processada) return;

            game.recursos.dinheiro += msg.acao.valor;
            game.financas.historico.push({ texto: `Venda: ${msg.acao.nomeJog}`, valor: msg.acao.valor, tipo: 'entrada' });

            // Atualiza no array de times
            const idxTime = game.times.findIndex(t => t.nome === game.info.time);
            if(idxTime > -1) {
                game.times[idxTime].elenco = game.times[idxTime].elenco.filter(j => j.uid !== msg.acao.uid);
            }

            msg.acao.processada = true;
            msg.corpo += "<br><br><b>[VENDIDO]</b>";
            
            Engine.salvarJogo(game);
            alert(`Negócio fechado! Recebemos R$ ${msg.acao.valor.toLocaleString()}.`);
            location.reload(); 
        }
    }
};
window.Engine = Engine;
