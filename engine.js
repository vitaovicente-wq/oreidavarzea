// ARQUIVO: engine.js (V9.0 - VERSÃO DEFINITIVA)

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando: ${nomeTimeSelecionado}`);

        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO: calendario.js não carregado.");
            return;
        }

        // Reset do Mercado
        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // Setup Inicial dos Jogadores
        const DATA_FIM_PADRAO = "31/12/2026";
        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
            t.elenco.forEach((jogador, idx) => {
                if (!jogador.uid) jogador.uid = `start_${t.nome.substring(0,3)}_${idx}_${Date.now()}`;
                jogador.contrato = DATA_FIM_PADRAO;
                if (!jogador.salario) jogador.salario = (jogador.forca || 60) * 1500;
                jogador.jogos = 0;
                jogador.gols = 0;
            });
        });

        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome, escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        const dataInicio = new Date('2026-01-01T12:00:00').getTime();

        const estadoDoJogo = {
            info: {
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Manager",
                time: nomeTimeSelecionado,
                escudo: localStorage.getItem('brfutebol_escudo'),
                divisao: divisao,
                dataInicio: dataInicio
            },
            recursos: { 
                dinheiro: 2000000, // Começa baixo para forçar patrocínio
                moral: 100,
                rodadaFinanceiraProcessada: false 
            },
            // NOVO: Objeto para guardar contratos assinados
            contratos: { patrocinio: null, tv: null },
            financas: {
                saldo: 2000000,
                historico: [{ texto: "Investimento Inicial", valor: 2000000, tipo: "entrada" }]
            },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            classificacao: classificacaoInicial,
            jogadoresStatus: {},
            mensagens: [] 
        };

        this.salvarJogo(estadoDoJogo);

        // GERA O MUNDO INICIAL
        this.Mercado.gerarAgentesLivres();
        this.Mercado.gerarListaTransferencias(estadoDoJogo);
        
        // ENVIA OS E-MAILS INICIAIS
        this.Contratos.enviarBoasVindas(estadoDoJogo);
        this.Contratos.gerarOfertasPatrocinio(estadoDoJogo);
        this.Contratos.gerarOfertasTV(estadoDoJogo);
    },

    // --- 2. SISTEMA DE CONTRATOS (NOVO) ---
    Contratos: {
        empresas: ["Hyper", "Ultra", "Neo", "Global", "Royal", "King", "Super", "Mega", "Iron", "Alpha"],
        setores: ["Bet", "Bank", "Motors", "Energy", "Foods", "Tech", "Airlines", "Beer", "Seguros", "Pharma"],
        tv: ["Rede Esportiva", "Cabo Sports", "StreamMax", "TV Nacional", "PlayGol"],

        enviarBoasVindas: function(game) {
            Engine.sistema.novaMensagem(
                "Boas Vindas da Diretoria", 
                `Olá, <b>${game.info.tecnico}</b>. Seja bem-vindo ao comando do <b>${game.info.time}</b>.<br><br>Sua missão é clara: Levar o time à glória. Mas cuidado com as finanças.<br>Confira as propostas de patrocínio e TV abaixo para garantir nosso fluxo de caixa.`,
                'info'
            );
        },

        gerarOfertasPatrocinio: function(game) {
            const baseValue = 350000; 
            const propostas = [];
            
            // 1. Conservadora
            propostas.push({ id: 1, empresa: this.empresas[0] + " " + this.setores[0], mensal: baseValue * 1.5, luvas: baseValue * 5, bonusTitulo: baseValue * 10, duracao: 12, estilo: "Estabilidade" });
            // 2. Agressiva (Cash agora)
            propostas.push({ id: 2, empresa: this.empresas[1] + " " + this.setores[1], mensal: baseValue * 0.8, luvas: baseValue * 20, bonusTitulo: baseValue * 5, duracao: 24, estilo: "Injeção de Caixa" });
            // 3. Performance
            propostas.push({ id: 3, empresa: this.empresas[2] + " " + this.setores[2], mensal: baseValue, luvas: baseValue * 8, bonusTitulo: baseValue * 40, duracao: 12, estilo: "Foco em Títulos" });

            let html = "Recebemos 3 propostas para o master. Escolha com sabedoria:<br><br>";
            propostas.forEach(p => {
                html += `<div style="border:1px solid #333; padding:10px; margin-bottom:10px; background:#111; border-radius:5px;">
                    <strong style="color:#00ff88;">${p.empresa}</strong> <span style="font-size:0.8rem; color:#aaa">(${p.estilo})</span><br>
                    • Mensal: R$ ${p.mensal.toLocaleString()}<br>• Luvas: R$ ${p.luvas.toLocaleString()}<br>• Bônus Campeão: R$ ${p.bonusTitulo.toLocaleString()}<br>
                    <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p)}, this)' style="margin-top:5px; background:#3498db; color:#fff; border:none; padding:5px 10px; cursor:pointer;">Assinar</button>
                </div>`;
            });
            Engine.sistema.novaMensagem("Propostas de Patrocínio Master", html, 'acao');
        },

        gerarOfertasTV: function(game) {
            const baseCota = 800000;
            const p1 = { id: 'tv1', emissora: this.tv[0], fixo: Math.floor(baseCota * 1.2), porJogo: 0, desc: "Cota Fixa Alta" };
            const p2 = { id: 'tv2', emissora: this.tv[1], fixo: Math.floor(baseCota * 0.6), porJogo: Math.floor(baseCota * 0.2), desc: "Fixo Baixo + Variável" };

            let html = "As emissoras enviaram as propostas:<br><br>";
            [p1, p2].forEach(p => {
                html += `<div style="border:1px solid #333; padding:10px; margin-bottom:10px; background:#111;">
                    <strong style="color:#f1c40f;">${p.emissora}</strong> (${p.desc})<br>• Mensal: R$ ${p.fixo.toLocaleString()}<br>${p.porJogo > 0 ? `• Por Jogo: R$ ${p.porJogo.toLocaleString()}<br>` : ''}
                    <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(p)}, this)' style="margin-top:5px; background:#3498db; color:#fff; border:none; padding:5px 10px; cursor:pointer;">Fechar Contrato</button>
                </div>`;
            });
            Engine.sistema.novaMensagem("Direitos de Transmissão de TV", html, 'acao');
        },

        assinarPatrocinio: function(proposta, btnElement) {
            const game = Engine.carregarJogo();
            if(game.contratos.patrocinio) { alert("Já existe um patrocinador ativo!"); return; }
            
            game.contratos.patrocinio = proposta;
            game.recursos.dinheiro += proposta.luvas;
            game.financas.historico.push({ texto: `Luvas Patrocínio (${proposta.empresa})`, valor: proposta.luvas, tipo: 'entrada' });
            
            Engine.salvarJogo(game);
            btnElement.parentNode.innerHTML = `<div style="color:#00ff88; font-weight:bold; text-align:center;">CONTRATO ASSINADO ✅</div>`;
            alert(`Contrato fechado com ${proposta.empresa}!`);
        },

        assinarTV: function(proposta, btnElement) {
            const game = Engine.carregarJogo();
            if(game.contratos.tv) { alert("Contrato de TV já assinado!"); return; }
            
            game.contratos.tv = proposta;
            Engine.salvarJogo(game);
            btnElement.parentNode.innerHTML = `<div style="color:#00ff88; font-weight:bold; text-align:center;">CONTRATO ASSINADO ✅</div>`;
            alert(`Direitos fechados com a ${proposta.emissora}!`);
        }
    },

    // --- 3. SISTEMA DE BUSCA ---
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

    // --- 4. SAVE / LOAD ---
    salvarJogo: function(estado) {
        localStorage.setItem('brfutebol_save', JSON.stringify(estado));
    },

    carregarJogo: function() {
        const saveJson = localStorage.getItem('brfutebol_save');
        return saveJson ? JSON.parse(saveJson) : null;
    },

    // --- 5. ATUALIZAÇÃO DA TABELA E FINANCEIRO ---
    atualizarTabela: function(estadoJogo) {
        const tabela = estadoJogo.classificacao || estadoJogo.tabela;
        tabela.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });

        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => { if (jogo.jogado) this._computarJogoNaTabela(tabela, jogo); });
        });
        tabela.sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg || b.gp - a.gp);
        
        // HOOK FINANCEIRO
        const rodadaIdx = estadoJogo.rodadaAtual - 1;
        if(estadoJogo.calendario[rodadaIdx]) {
            const jogoPlayer = estadoJogo.calendario[rodadaIdx].jogos.find(j => j.mandante === estadoJogo.info.time || j.visitante === estadoJogo.info.time);
            if (jogoPlayer && jogoPlayer.jogado && !estadoJogo.recursos.rodadaFinanceiraProcessada) {
                const isMandante = jogoPlayer.mandante === estadoJogo.info.time;
                const adversario = isMandante ? jogoPlayer.visitante : jogoPlayer.mandante;
                
                this.sistema.processarRodadaFinanceira(estadoJogo, isMandante, adversario);
                
                // Movimenta Mercado
                this.sistema.gerarPropostaTransferencia(); 
                this.Mercado.atualizarListaTransferencias(estadoJogo); 
                this.Mercado.simularDispensasCPU(estadoJogo);       
                
                estadoJogo.recursos.rodadaFinanceiraProcessada = true;
            }
        }
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);
        if (!timeCasa || !timeFora) return;
        const gc = parseInt(jogo.placarCasa);
        const gf = parseInt(jogo.placarFora);
        timeCasa.j++; timeCasa.gp+=gc; timeCasa.gc+=gf; timeCasa.sg = timeCasa.gp - timeCasa.gc;
        timeFora.j++; timeFora.gp+=gf; timeFora.gc+=gc; timeFora.sg = timeFora.gp - timeFora.gc;
        if (gc > gf) { timeCasa.v++; timeCasa.pts+=3; timeFora.d++; }
        else if (gf > gc) { timeFora.v++; timeFora.pts+=3; timeCasa.d++; }
        else { timeCasa.e++; timeCasa.pts++; timeFora.e++; timeFora.pts++; }
    },

    // --- 6. SIMULAÇÃO CPU E DADOS GERAIS ---
    simularJogoCPU: function(jogo) {
        jogo.jogado = true;
        jogo.placarCasa = Math.floor(Math.random() * 3);
        jogo.placarFora = Math.floor(Math.random() * 2);
        if(Math.random() > 0.6) jogo.placarCasa++;
        if(Math.random() > 0.7) jogo.placarFora++;
        jogo.eventos = []; 
        const timeCasa = this.encontrarTime(jogo.mandante);
        for(let i=0; i<jogo.placarCasa; i++) jogo.eventos.push(this._gerarGolSimulado(timeCasa, jogo.mandante));
        const timeFora = this.encontrarTime(jogo.visitante);
        for(let i=0; i<jogo.placarFora; i++) jogo.eventos.push(this._gerarGolSimulado(timeFora, jogo.visitante));
        jogo.eventos.sort((a,b) => a.min - b.min);
    },

    _gerarGolSimulado: function(timeObj, nomeTime) {
        let nomeJog = "Atacante";
        if(timeObj.elenco && timeObj.elenco.length > 0) {
            const pool = timeObj.elenco.filter(j => j.pos !== 'GOL');
            const sorteado = (pool.length>0 ? pool : timeObj.elenco)[Math.floor(Math.random() * (pool.length>0 ? pool.length : timeObj.elenco.length))];
            nomeJog = sorteado.nome;
        } else { nomeJog = "Camisa " + (Math.floor(Math.random() * 10) + 2); }
        return { min: Math.floor(Math.random() * 90) + 1, time: nomeTime, jogador: nomeJog, tipo: 'gol' };
    },

    _gerarTimesGenericos: function(div) {
        let lista = [];
        for (let i = 1; i <= 20; i++) lista.push({ nome: `Time ${i}`, forca: 50, elenco: [] });
        return lista;
    },

    estadios: {
        db: { "Padrao": { nome: "Estádio Municipal", cap: 15000 }, "Corinthians": { nome: "Neo Química Arena", cap: 49000 }, "Flamengo": { nome: "Maracanã", cap: 78000 } },
        getEstadio: function() {
            const game = Engine.carregarJogo();
            const timeNome = game.info.time;
            const dadosBase = this.db[timeNome] || this.db["Padrao"];
            const config = game.estadio || { precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 }, manutencao: 100 };
            return { ...dadosBase, ...config };
        },
        calcularBilheteria: function(adversarioNome) {
            const game = Engine.carregarJogo();
            const estadio = this.getEstadio();
            const moral = game.recursos.moral || 50; 
            let demandaBase = moral / 100; 
            const capGeral = Math.floor(estadio.cap * 0.50);
            const pubGeral = Math.floor(Math.min(capGeral, capGeral * demandaBase));
            const renda = pubGeral * estadio.precos.geral; // Simplificado para economizar espaço
            return { publico: pubGeral, rendaTotal: renda };
        }
    },

    // --- 7. SISTEMA DE MERCADO ---
    Mercado: {
        getAgentesLivres: function() { return JSON.parse(localStorage.getItem('brfutebol_livres') || '[]'); },
        getListaTransferencias: function() { return JSON.parse(localStorage.getItem('brfutebol_transferencias') || '[]'); },
        
        avaliarTransferencia: function(jogador, meuTime) {
            const necessidade = Math.floor(Math.random() * 100);
            let valorBase = jogador.valor;
            let postura = 'neutra';
            if (jogador.forca > 80) { valorBase *= 1.3; postura = 'dura'; } 
            else if (necessidade > 70) { valorBase *= 0.85; postura = 'flexivel'; }
            
            const alvosTroca = meuTime.elenco.filter(j => j.pos === jogador.pos).slice(0, 3);
            return { valorPedido: Math.floor(valorBase), aceitaEmprestimo: jogador.forca < 75, aceitaTroca: true, postura, paciencia: 4, alvosTroca };
        },

        atualizarListaTransferencias: function(game) {
            let lista = this.getListaTransferencias();
            if(Math.random() > 0.7) { 
                const timesCPU = game.times.filter(t => t.nome !== game.info.time);
                const timeAleatorio = timesCPU[Math.floor(Math.random() * timesCPU.length)];
                if(timeAleatorio && timeAleatorio.elenco.length > 18) {
                    const jogador = timeAleatorio.elenco[Math.floor(Math.random() * timeAleatorio.elenco.length)];
                    if (!lista.find(j => j.uid === jogador.uid) && jogador.forca < 85) {
                        const valorMercado = Math.floor(Math.pow(jogador.forca, 3) * 18);
                        lista.push({ ...jogador, valor: valorMercado, clube: timeAleatorio.nome });
                    }
                }
            }
            if (lista.length > 20) lista.shift();
            localStorage.setItem('brfutebol_transferencias', JSON.stringify(lista));
        },

        simularDispensasCPU: function(game) {
            let livres = this.getAgentesLivres();
            if (Math.random() > 0.85) { 
                const timesCPU = game.times.filter(t => t.nome !== game.info.time);
                const timeAleatorio = timesCPU[Math.floor(Math.random() * timesCPU.length)];
                if (timeAleatorio && timeAleatorio.elenco.length > 22) {
                    const candidatos = timeAleatorio.elenco.filter(j => j.forca < 70);
                    if (candidatos.length > 0) {
                        const dispensado = candidatos[Math.floor(Math.random() * candidatos.length)];
                        timeAleatorio.elenco = timeAleatorio.elenco.filter(j => j.uid !== dispensado.uid);
                        livres.push({ ...dispensado, valor: 0, clube: null, carac: "Dispensado" });
                        Engine.sistema.novaMensagem("Jogador Dispensado", `O ${timeAleatorio.nome} rescindiu com ${dispensado.nome}.`, 'info');
                    }
                }
            }
            localStorage.setItem('brfutebol_livres', JSON.stringify(livres));
        },

        removerJogador: function(uid, tipo) {
            let lista = tipo === 'livre' ? this.getAgentesLivres() : this.getListaTransferencias();
            lista = lista.filter(j => j.uid !== uid);
            localStorage.setItem(tipo === 'livre' ? 'brfutebol_livres' : 'brfutebol_transferencias', JSON.stringify(lista));
        }
    },

    // --- 8. SISTEMA FINANCEIRO E MENSAGENS ---
    sistema: {
        novaMensagem: function(titulo, corpo, tipo = 'info', acao = null) {
            const game = Engine.carregarJogo();
            if (!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({ id: Date.now(), rodada: game.rodadaAtual, titulo, corpo, tipo, lida: false, acao });
            Engine.salvarJogo(game);
        },

        processarRodadaFinanceira: function(game, mandante, adversario) {
            if (!game.financas) game.financas = { saldo: 0, historico: [] };
            
            // 1. Bilheteria
            if (mandante) {
                const bilheteria = Engine.estadios.calcularBilheteria(adversario);
                game.recursos.dinheiro += bilheteria.rendaTotal;
                game.financas.historico.push({ texto: `Bilheteria vs ${adversario}`, valor: bilheteria.rendaTotal, tipo: 'entrada' });
            }

            // 2. Pagamento Mensal (A cada 4 rodadas - "Mês")
            if (game.rodadaAtual % 4 === 0) {
                // Patrocínios e TV
                if (game.contratos && game.contratos.patrocinio) {
                    const val = game.contratos.patrocinio.mensal;
                    game.recursos.dinheiro += val;
                    game.financas.historico.push({ texto: `Patrocínio Master`, valor: val, tipo: 'entrada' });
                }
                if (game.contratos && game.contratos.tv) {
                    const val = game.contratos.tv.fixo;
                    game.recursos.dinheiro += val;
                    game.financas.historico.push({ texto: `Cota de TV`, valor: val, tipo: 'entrada' });
                }

                // Salários
                let folha = 0;
                const meuTime = game.times.find(t => t.nome === game.info.time);
                if(meuTime && meuTime.elenco) meuTime.elenco.forEach(j => folha += j.salario);
                
                game.recursos.dinheiro -= folha;
                game.financas.historico.push({ texto: `Folha Salarial`, valor: -folha, tipo: 'saida' });
            }

            // 3. Custos Fixos por jogo
            const custo = 50000; 
            game.recursos.dinheiro -= custo;
            game.financas.historico.push({ texto: `Custos Jogo`, valor: -custo, tipo: 'saida' });
        },

        gerarPropostaTransferencia: function() {
            // (Simplificado)
            const game = Engine.carregarJogo();
            if(Math.random() > 0.15) return;
            const meuTime = Engine.encontrarTime(game.info.time);
            if(meuTime.elenco.length > 0) {
                const jog = meuTime.elenco[Math.floor(Math.random()*meuTime.elenco.length)];
                Engine.sistema.novaMensagem("Proposta", `Oferta por ${jog.nome}`, 'proposta', { uid: jog.uid, valor: jog.forca * 80000 });
            }
        },
        
        aceitarVenda: function(msgId) {
            // (Logica de venda)
            const game = Engine.carregarJogo();
            const msg = game.mensagens.find(m => m.id === msgId);
            if(msg && !msg.acao.processada) {
                game.recursos.dinheiro += msg.acao.valor;
                // Remover do time... (simplificado)
                msg.acao.processada = true;
                Engine.salvarJogo(game);
                alert("Vendido!");
            }
        }
    },

    data: {
        getDataAtual: function(rodada) {
            // Retorna data formatada
            return `Rodada ${rodada}`;
        }
    }
};
window.Engine = Engine;
