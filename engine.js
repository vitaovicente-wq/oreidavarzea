// ARQUIVO: engine.js (V11.2 - CORREÇÃO DE LOOP DE EVENTOS)

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando: ${nomeTimeSelecionado}`);

        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO: calendario.js não carregado.");
            return;
        }

        // 1. Limpa o mercado antigo
        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        // 2. Carrega Times
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // 3. Configura Jogadores
        const DATA_FIM_PADRAO = "31/12/2026";
        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
            t.elenco.forEach((jogador, idx) => {
                if (!jogador.uid) jogador.uid = `start_${t.nome.substring(0,3)}_${idx}_${Date.now()}`;
                jogador.contrato = DATA_FIM_PADRAO;
                if (!jogador.salario) jogador.salario = (jogador.forca || 60) * 1500;
                jogador.jogos = 0;
                jogador.gols = 0;
                jogador.status = "Apto";
                jogador.rodadasFora = 0;
            });
        });

        // 4. Gera Calendário
        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome, escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        // --- CÁLCULO DE ORÇAMENTO ---
        const meuTimeTemp = timesDaLiga.find(t => t.nome === nomeTimeSelecionado);
        let somaOvr = 0;
        if(meuTimeTemp && meuTimeTemp.elenco.length > 0) {
            meuTimeTemp.elenco.forEach(j => somaOvr += j.forca);
        }
        const mediaOvr = meuTimeTemp.elenco.length > 0 ? Math.floor(somaOvr / meuTimeTemp.elenco.length) : 60;
        
        let orcamentoInicial = 2000000;
        if (mediaOvr > 90) orcamentoInicial = 10000000;
        else if (mediaOvr > 80) orcamentoInicial = 8000000;
        else if (mediaOvr > 70) orcamentoInicial = 5000000;
        else if (mediaOvr > 65) orcamentoInicial = 3000000;

        const dataInicio = new Date('2026-01-01T12:00:00').getTime();

        // 5. Cria o Estado Inicial
        const estadoDoJogo = {
            info: {
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Manager",
                time: nomeTimeSelecionado,
                escudo: localStorage.getItem('brfutebol_escudo'),
                divisao: divisao,
                dataInicio: dataInicio
            },
            recursos: { 
                dinheiro: orcamentoInicial, 
                moral: 100,
                // CORREÇÃO: Usamos número da rodada em vez de booleano
                ultimaRodadaProcessada: 0 
            },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false, patroEnviado: false, tvEnviado: false },
            financas: {
                saldo: orcamentoInicial,
                historico: [{ texto: "Aporte da Diretoria", valor: orcamentoInicial, tipo: "entrada" }]
            },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            classificacao: classificacaoInicial,
            jogadoresStatus: {},
            mensagens: [] 
        };

        this.salvarJogo(estadoDoJogo);
        this.Contratos.enviarBoasVindas(estadoDoJogo);
    },

    // --- 2. SISTEMA DE EVENTOS (Probabilidades Ajustadas) ---
    Eventos: {
        db: {
            intros: ["Más notícias,", "Infelizmente,", "Relatório do DM:", "Urgente:", "Atenção professor,"],
            lesoes: ["sentiu uma fisgada na coxa", "torceu o tornozelo", "reclamou de dores lombares", "teve uma contusão no joelho"],
            causas: ["durante o treino tático", "ao descer do ônibus", "numa dividida no treino", "na academia"],
            tempos: [1, 2, 3, 5], 
            
            mercado_intro: ["Chegou um fax.", "O telefone tocou.", "Email do exterior.", "Oferta na mesa."],
            compradores: ["Al-Hilal (ARA)", "Benfica (POR)", "River Plate (ARG)", "Flamengo (BRA)", "Real Madrid (ESP)"],
            argumentos: ["O jogador quer ir.", "A oferta é irrecusável.", "Eles pagam a multa."],
            
            reclamacoes: ["está insatisfeito com o banco", "quer aumento salarial", "brigou com um companheiro"],
            humores: ["Furioso", "Decepcionado", "Irritado"]
        },

        processarEventosRodada: function(game) {
            // Aumentei um pouco as chances para garantir que aconteça algo
            const chanceLesao = 0.30;     // 30%
            const chanceProposta = 0.20;  // 20%
            const chanceProblema = 0.15;  // 15%

            if(Math.random() < chanceLesao) this.gerarLesao(game);
            if(Math.random() < chanceProposta) this.gerarPropostaCompra(game);
            if(Math.random() < chanceProblema) this.gerarProblemaVestiario(game);
        },

        gerarLesao: function(game) {
            const meuTime = Engine.encontrarTime(game.info.time);
            const disponiveis = meuTime.elenco.filter(j => j.status !== "Lesionado");
            if(disponiveis.length === 0) return;

            const alvo = disponiveis[Math.floor(Math.random() * disponiveis.length)];
            const intro = this.db.intros[Math.floor(Math.random() * this.db.intros.length)];
            const lesao = this.db.lesoes[Math.floor(Math.random() * this.db.lesoes.length)];
            const causa = this.db.causas[Math.floor(Math.random() * this.db.causas.length)];
            const tempo = this.db.tempos[Math.floor(Math.random() * this.db.tempos.length)];

            // Aplica lesão
            const idx = meuTime.elenco.findIndex(j => j.uid === alvo.uid);
            if(idx !== -1) {
                meuTime.elenco[idx].status = "Lesionado";
                meuTime.elenco[idx].rodadasFora = tempo;
                const tIdx = game.times.findIndex(t => t.nome === game.info.time);
                game.times[tIdx] = meuTime;
                Engine.salvarJogo(game);
            }

            const html = `
                <div style="font-family:'Georgia'; color:#FF9999;">
                    <p>${intro}</p>
                    <p>O atleta <b>${alvo.nome}</b> ${lesao} ${causa}.</p>
                    <p>Previsão de retorno: <b>${tempo} rodada(s)</b>.</p>
                    <hr style="border-color:#555">
                    <button onclick="alert('Tratamento iniciado.')" style="width:100%; padding:8px; margin-bottom:5px; background:#444; border:none; color:#fff; cursor:pointer;">Tratamento Conservador</button>
                    <button onclick="Engine.Eventos.infiltrarJogador('${alvo.uid}')" style="width:100%; padding:8px; background:#d63031; border:none; color:#fff; cursor:pointer;">💉 Infiltrar (Risco)</button>
                </div>
            `;
            Engine.sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm');
        },

        gerarPropostaCompra: function(game) {
            const meuTime = Engine.encontrarTime(game.info.time);
            if(meuTime.elenco.length === 0) return;
            const alvo = meuTime.elenco[Math.floor(Math.random() * meuTime.elenco.length)];
            
            const comprador = this.db.compradores[Math.floor(Math.random() * this.db.compradores.length)];
            const intro = this.db.mercado_intro[Math.floor(Math.random() * this.db.mercado_intro.length)];
            const argumento = this.db.argumentos[Math.floor(Math.random() * this.db.argumentos.length)];
            
            const valorBase = alvo.valor || (alvo.forca * 80000);
            const oferta = Math.floor(valorBase * (0.8 + Math.random() * 0.7));

            const html = `
                <div style="font-family:'Georgia'; color:#a29bfe;">
                    <p>${intro}</p>
                    <p>O <b>${comprador}</b> quer <b>${alvo.nome}</b>.</p>
                    <p>Oferta: <b style="font-size:1.2rem; color:#00ff88">R$ ${oferta.toLocaleString()}</b>.</p>
                    <p><i>"${argumento}"</i></p>
                    <hr style="border-color:#555">
                    <button onclick='Engine.Eventos.venderJogador("${alvo.uid}", ${oferta})' style="width:100%; padding:10px; margin-bottom:5px; background:#00b894; border:none; color:#fff; cursor:pointer;">VENDER</button>
                    <button onclick="alert('Recusado.')" style="width:100%; padding:10px; background:#d63031; border:none; color:#fff; cursor:pointer;">RECUSAR</button>
                </div>
            `;
            Engine.sistema.novaMensagem(`Proposta: ${alvo.nome}`, html, 'negociacao');
        },

        gerarProblemaVestiario: function(game) {
            const meuTime = Engine.encontrarTime(game.info.time);
            if(meuTime.elenco.length === 0) return;
            const alvo = meuTime.elenco[Math.floor(Math.random() * meuTime.elenco.length)];
            
            const problema = this.db.reclamacoes[Math.floor(Math.random() * this.db.reclamacoes.length)];
            const humor = this.db.humores[Math.floor(Math.random() * this.db.humores.length)];

            const html = `
                <div style="font-family:'Georgia'; color:#ffeaa7;">
                    <p>Problema no vestiário: <b>${alvo.nome}</b> ${problema}.</p>
                    <p>Humor: <b>${humor}</b>.</p>
                    <hr style="border-color:#555">
                    <button onclick="alert('Multa aplicada.')" style="width:100%; padding:8px; margin-bottom:5px; background:#d63031; border:none; color:#fff; cursor:pointer;">Multar</button>
                    <button onclick="alert('Conversa realizada.')" style="width:100%; padding:8px; background:#0984e3; border:none; color:#fff; cursor:pointer;">Conversar</button>
                </div>
            `;
            Engine.sistema.novaMensagem(`Vestiário: ${alvo.nome}`, html, 'alerta');
        },

        venderJogador: function(uid, valor) {
            const game = Engine.carregarJogo();
            const timeIdx = game.times.findIndex(t => t.nome === game.info.time);
            const jogador = game.times[timeIdx].elenco.find(j => j.uid === uid);
            
            if(jogador) {
                game.recursos.dinheiro += valor;
                game.financas.historico.push({ texto: `Venda: ${jogador.nome}`, valor: valor, tipo: 'entrada' });
                game.times[timeIdx].elenco = game.times[timeIdx].elenco.filter(j => j.uid !== uid);
                Engine.salvarJogo(game);
                alert(`Vendido por R$ ${valor.toLocaleString()}!`);
                location.reload();
            }
        },

        infiltrarJogador: function(uid) {
            const game = Engine.carregarJogo();
            const timeIdx = game.times.findIndex(t => t.nome === game.info.time);
            const elenco = game.times[timeIdx].elenco;
            const idx = elenco.findIndex(j => j.uid === uid);

            if(idx !== -1) {
                if(Math.random() > 0.5) {
                    elenco[idx].status = "Apto";
                    elenco[idx].rodadasFora = 0;
                    alert("Deu certo! Ele joga.");
                } else {
                    elenco[idx].rodadasFora += 2;
                    alert("Piorou! Mais tempo fora.");
                }
                game.times[timeIdx].elenco = elenco;
                Engine.salvarJogo(game);
            }
        }
    },

    // --- 3. CONTRATOS ---
    Contratos: {
        enviarBoasVindas: function(game) {
            Engine.sistema.novaMensagem("Boas Vindas", "Olá Manager. Analise os patrocínios e TV.", 'boas_vindas');
        },
        liberarOfertasPatrocinio: function() {
            let game = Engine.carregarJogo();
            if(game.flags.patroEnviado) return;
            
            const base = Math.floor(game.recursos.dinheiro * 0.15);
            const p1 = {id:1, empresa:"Banco Nacional", mensal:base*1.2, luvas:base*2, desc:"Seguro"};
            const p2 = {id:2, empresa:"BetWin", mensal:base*0.8, luvas:base*8, desc:"Luvas Altas"};
            
            const html = `<div>
                <p>Escolha o Patrocínio:</p>
                <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p1)}, this)' style="margin:5px; padding:10px;">${p1.empresa} (Estável)</button>
                <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p2)}, this)' style="margin:5px; padding:10px;">${p2.empresa} (Agressivo)</button>
            </div>`;
            
            Engine.sistema.novaMensagem("Ofertas de Patrocínio", html, 'patrocinio_oferta');
            game = Engine.carregarJogo(); game.flags.patroEnviado = true; Engine.salvarJogo(game);
        },
        liberarOfertasTV: function() {
            let game = Engine.carregarJogo();
            if(game.flags.tvEnviado) return;
            
            const base = Math.floor(game.recursos.dinheiro * 0.10);
            const t1 = {id:'tv1', emissora:"Rede Nacional", fixo:base*1.5, desc:"Fixo Alto"};
            
            const html = `<div>
                <p>Escolha a TV:</p>
                <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t1)}, this)' style="margin:5px; padding:10px;">${t1.emissora}</button>
            </div>`;
            
            Engine.sistema.novaMensagem("Ofertas de TV", html, 'tv_oferta');
            game = Engine.carregarJogo(); game.flags.tvEnviado = true; Engine.salvarJogo(game);
        },
        assinarPatrocinio: function(p, btn) {
            const g = Engine.carregarJogo();
            if(g.contratos.patrocinio) { alert("Já tem!"); return; }
            g.contratos.patrocinio = p; g.recursos.dinheiro += p.luvas;
            Engine.salvarJogo(g); btn.innerHTML="✅"; alert("Assinado!");
        },
        assinarTV: function(t, btn) {
            const g = Engine.carregarJogo();
            if(g.contratos.tv) { alert("Já tem!"); return; }
            g.contratos.tv = t; Engine.salvarJogo(g); btn.innerHTML="✅"; alert("Assinado!");
        }
    },

    // --- 4. SISTEMA BASE ---
    encontrarTime: function(nome) {
        const s = this.carregarJogo();
        return s.times.find(t => t.nome === nome) || {nome, elenco:[]};
    },
    salvarJogo: function(s) { localStorage.setItem('brfutebol_save', JSON.stringify(s)); },
    carregarJogo: function() { return JSON.parse(localStorage.getItem('brfutebol_save')); },

    // --- 5. ATUALIZAÇÃO (CORRIGIDO PARA RESETAR A RODADA) ---
    atualizarTabela: function(estadoJogo) {
        const tabela = estadoJogo.classificacao;
        tabela.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });
        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => { if (jogo.jogado) this._computarJogoNaTabela(tabela, jogo); });
        });
        tabela.sort((a, b) => b.pts - a.pts || b.sg - a.sg);
        
        const rodadaIdx = estadoJogo.rodadaAtual - 1;
        if(estadoJogo.calendario[rodadaIdx]) {
            const jogoPlayer = estadoJogo.calendario[rodadaIdx].jogos.find(j => j.mandante === estadoJogo.info.time || j.visitante === estadoJogo.info.time);
            
            // CORREÇÃO: Verifica se o número da rodada mudou
            if (jogoPlayer && jogoPlayer.jogado && estadoJogo.recursos.ultimaRodadaProcessada !== estadoJogo.rodadaAtual) {
                
                const isMandante = jogoPlayer.mandante === estadoJogo.info.time;
                const adversario = isMandante ? jogoPlayer.visitante : jogoPlayer.mandante;
                
                this.sistema.processarRodadaFinanceira(estadoJogo, isMandante, adversario);
                
                // GERA EVENTOS AGORA
                this.Eventos.processarEventosRodada(estadoJogo);
                
                this.Mercado.atualizarListaTransferencias(estadoJogo); 
                this.Mercado.simularDispensasCPU(estadoJogo);       
                
                // Atualiza o marcador para a rodada atual
                estadoJogo.recursos.ultimaRodadaProcessada = estadoJogo.rodadaAtual;
            }
        }
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const c = tabela.find(t=>t.nome===jogo.mandante); const f = tabela.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return;
        const gc=parseInt(jogo.placarCasa); const gf=parseInt(jogo.placarFora);
        c.j++; f.j++; c.gp+=gc; f.gp+=gf; c.gc+=gf; f.gc+=gc; c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        if(gc>gf){c.v++;c.pts+=3;f.d++;}else if(gf>gc){f.v++;f.pts+=3;c.d++;}else{c.e++;f.e++;c.pts++;f.pts++;}
    },

    simularJogoCPU: function(jogo) {
        jogo.jogado = true;
        jogo.placarCasa = Math.floor(Math.random()*3); jogo.placarFora = Math.floor(Math.random()*2);
        if(Math.random()>0.6) jogo.placarCasa++; if(Math.random()>0.7) jogo.placarFora++;
        jogo.eventos = [{min:10, tipo:'gol', jogador:'Atacante', time:jogo.mandante}]; // Simplificado
    },

    estadios: {
        db: { "Padrao": { nome: "Estádio Municipal", cap: 15000 }, "Corinthians": { nome: "Neo Química Arena", cap: 49000 }, "Flamengo": { nome: "Maracanã", cap: 78000 } },
        getEstadio: function() {
            const game = Engine.carregarJogo();
            return { ...this.db["Padrao"], ...(this.db[game.info.time]||{}), ...(game.estadio||{precos:{geral:40}}) };
        },
        calcularBilheteria: function(adv) {
            const game = Engine.carregarJogo();
            const est = this.getEstadio();
            const cap = est.cap;
            const renda = cap * est.precos.geral * 0.5; // Simplificado
            return { publico: cap/2, rendaTotal: renda };
        }
    },

    Mercado: {
        getAgentesLivres: function() { return JSON.parse(localStorage.getItem('brfutebol_livres') || '[]'); },
        getListaTransferencias: function() { return JSON.parse(localStorage.getItem('brfutebol_transferencias') || '[]'); },
        avaliarTransferencia: function(j, t) {
            return { valorPedido: j.valor, aceitaEmprestimo: true, aceitaTroca: true, postura: 'neutra', paciencia: 4, alvosTroca: [] };
        },
        atualizarListaTransferencias: function(game) {
            let l = this.getListaTransferencias();
            if(Math.random()>0.7 && l.length<20) {
                const t = game.times.find(time => time.nome !== game.info.time);
                if(t && t.elenco.length > 0) l.push({...t.elenco[0], valor: t.elenco[0].forca*20000, clube:t.nome});
            }
            localStorage.setItem('brfutebol_transferencias', JSON.stringify(l));
        },
        simularDispensasCPU: function(game) {
            let l = this.getAgentesLivres();
            if(Math.random()>0.9) {
                const t = game.times.find(time => time.nome !== game.info.time);
                if(t && t.elenco.length > 0) l.push({...t.elenco[0], valor:0, clube:null});
            }
            localStorage.setItem('brfutebol_livres', JSON.stringify(l));
        },
        removerJogador: function(uid, tipo) {
            let k = tipo==='livre'?'brfutebol_livres':'brfutebol_transferencias';
            let l = JSON.parse(localStorage.getItem(k)||'[]');
            l = l.filter(j=>j.uid!==uid);
            localStorage.setItem(k, JSON.stringify(l));
        }
    },

    sistema: {
        novaMensagem: function(t, c, tipo, acao=null) {
            const game = Engine.carregarJogo();
            if(!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({ id: Date.now(), rodada: game.rodadaAtual, titulo: t, corpo: c, tipo, lida: false, acao });
            Engine.salvarJogo(game);
        },
        processarRodadaFinanceira: function(game, mand, adv) {
            if(!game.financas) game.financas = { saldo:0, historico:[] };
            if(mand) {
                const bilh = Engine.estadios.calcularBilheteria(adv);
                game.recursos.dinheiro += bilh.rendaTotal;
                game.financas.historico.push({ texto: `Bilheteria`, valor: bilh.rendaTotal, tipo: 'entrada' });
            }
            if(game.rodadaAtual % 4 === 0) {
                if(game.contratos.patrocinio) {
                    game.recursos.dinheiro += game.contratos.patrocinio.mensal;
                    game.financas.historico.push({ texto: `Patrocínio`, valor: game.contratos.patrocinio.mensal, tipo: 'entrada' });
                }
                let folha = 0;
                const time = game.times.find(t => t.nome === game.info.time);
                if(time) time.elenco.forEach(j => folha += j.salario);
                game.recursos.dinheiro -= folha;
                game.financas.historico.push({ texto: `Folha Salarial`, valor: -folha, tipo: 'saida' });
            }
        },
        gerarPropostaTransferencia: function() {}
    },

    data: {
        getDataAtual: function(rodada) {
            return `Rodada ${rodada}`;
        }
    }
};
window.Engine = Engine;
