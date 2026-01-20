// ARQUIVO: engine-core.js
// VERSÃO: WORLD SYSTEM V2.1 (Fix Artilheiros Persistentes)
// DESCRIÇÃO: Núcleo lógico que gerencia o mundo, simulação, finanças e saves.

window.Engine = {
    // =========================================================================
    // 1. SISTEMA DE MENSAGENS E FINANÇAS
    // =========================================================================
    Sistema: {
        novaMensagem: function(titulo, corpo, tipo, remetente="Diretoria") {
            const game = window.Engine.carregarJogo();
            if(!game) return; 
            
            if(!game.mensagens) game.mensagens = [];
            
            game.mensagens.unshift({
                id: Date.now() + Math.random(),
                rodada: game.rodadaAtual,
                remetente: remetente,
                titulo: titulo,
                corpo: corpo,
                tipo: tipo, 
                lida: false
            });
            
            if(game.mensagens.length > 50) game.mensagens.pop();
            window.Engine.salvarJogo(game);
        },
        
        processarFinancas: function(g, ehMandante, timeAdversario) {
            const registrar = (txt, val, tp) => {
                g.financas.historico.push({ texto: txt, valor: val, tipo: tp, rodada: g.rodadaAtual });
            };

            if(ehMandante) {
                let renda = 0;
                if(window.Engine.Estadios) {
                    const r = window.Engine.Estadios.calcularBilheteria(timeAdversario);
                    renda = r.rendaTotal;
                } else {
                    renda = (g.info.divisao === 'D1' ? 500000 : 100000); 
                }
                g.recursos.dinheiro += renda;
                registrar('Bilheteria', renda, 'entrada');
            } 
            
            if(g.rodadaAtual % 4 === 0) {
                let folhaSalarial = 0;
                const timeUser = window.Engine.encontrarTime(g.info.time);
                if(timeUser && timeUser.elenco) {
                    timeUser.elenco.forEach(j => { folhaSalarial += (j.salario || 15000); });
                }
                g.recursos.dinheiro -= folhaSalarial;
                registrar('Salários do Elenco', -folhaSalarial, 'saida');
            }

            const custoOp = (g.info.divisao === 'D1') ? 50000 : 15000;
            g.recursos.dinheiro -= custoOp; 
            registrar('Custos Operacionais', -custoOp, 'saida');
        }
    },

    // =========================================================================
    // 2. SAVE & LOAD
    // =========================================================================
    salvarJogo: function(estado) { 
        try {
            const saveState = { ...estado };
            delete saveState.times;
            delete saveState.calendario;
            delete saveState.classificacao;
            localStorage.setItem('brfutebol_save', JSON.stringify(saveState)); 
        } catch (e) {
            console.error("Erro ao salvar:", e);
            alert("Erro crítico: Espaço cheio.");
        }
    },

    carregarJogo: function() { 
        const s = localStorage.getItem('brfutebol_save'); 
        if (!s) return null;
        const game = JSON.parse(s);

        if (game.mundo && game.info) {
            const p = game.info.pais;
            const d = game.info.divisao;
            if (game.mundo[p] && game.mundo[p][d]) {
                game.times = game.mundo[p][d].times;
                game.calendario = game.mundo[p][d].calendario;
                game.classificacao = game.mundo[p][d].tabela;
            }
        }
        return game; 
    },

    encontrarTime: function(nomeBusca) { 
        const s = this.carregarJogo(); 
        if (!s || !s.mundo) return { nome: nomeBusca, elenco: [] };
        for(let p in s.mundo) {
            for(let d in s.mundo[p]) {
                const t = s.mundo[p][d].times.find(x => x.nome === nomeBusca);
                if(t) return t;
            }
        }
        return { nome: nomeBusca, elenco: [] }; 
    },
    
    // =========================================================================
    // 3. INICIALIZAÇÃO
    // =========================================================================
    novoJogo: function(paisSelecionado, divisaoSelecionada, nomeTimeSelecionado) {
        console.log(`🌍 Engine: Criando Universo... [${nomeTimeSelecionado}]`);

        if (typeof window.Database === 'undefined') { alert("Erro Fatal: database.js faltando."); return; }
        if (typeof CalendarioSystem === 'undefined') { alert("Erro Fatal: calendario.js faltando."); return; }

        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        const mundo = {};

        for (const p in window.Database) {
            mundo[p] = {};
            for (const div in window.Database[p]) {
                const timesRaw = JSON.parse(JSON.stringify(window.Database[p][div]));
                
                timesRaw.forEach(t => {
                    if (!t.elenco) t.elenco = [];
                    t.elenco.forEach((j, i) => {
                        j.uid = `${p}_${div}_${t.nome.substring(0,3).toUpperCase()}_${i}`;
                        j.contrato = "31/12/2026";
                        if(!j.salario) j.salario = Math.floor((j.forca || 60) * 1250); 
                        j.jogos=0; j.gols=0; j.assist=0; j.status="Apto"; j.rodadasFora=0; j.moral = 100;
                    });
                });

                const calendario = CalendarioSystem.gerarCampeonato(timesRaw);
                const tabela = timesRaw.map(t => ({ nome: t.nome, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 }));
                mundo[p][div] = { times: timesRaw, calendario: calendario, tabela: tabela };
            }
        }

        const ligaJogada = mundo[paisSelecionado][divisaoSelecionada];
        const meuTime = ligaJogada.times.find(t => t.nome === nomeTimeSelecionado);
        let orcamentoInicial = (meuTime.forca > 75) ? 15000000 : 2000000;

        const estadoInicial = {
            info: { tecnico: localStorage.getItem('brfutebol_tecnico') || "Manager", time: nomeTimeSelecionado, escudo: meuTime.escudo, pais: paisSelecionado, divisao: divisaoSelecionada },
            recursos: { dinheiro: orcamentoInicial, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { tutorial: true },
            financas: { saldo: orcamentoInicial, historico: [{ texto: "Orçamento Inicial", valor: orcamentoInicial, tipo: "entrada", rodada: 0 }] },
            rodadaAtual: 1,
            mundo: mundo, 
            times: ligaJogada.times,
            calendario: ligaJogada.calendario,
            classificacao: ligaJogada.tabela, 
            mensagens: [] 
        };

        this.salvarJogo(estadoInicial);
        if(window.Engine.Contratos) window.Engine.Contratos.enviarBoasVindas(estadoInicial);
        else this.Sistema.novaMensagem("Bem-vindo", `Você assumiu o comando do ${nomeTimeSelecionado}.`, "geral");
    },

    // =========================================================================
    // 4. ATUALIZAÇÃO (SIMULAÇÃO)
    // =========================================================================
    atualizarTabela: function(estado) {
        if(!estado) estado = this.carregarJogo();

        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const liga = estado.mundo[p][d];
                
                liga.tabela.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });

                liga.calendario.forEach((rod, idx) => {
                    const numeroRodada = idx + 1;
                    
                    rod.jogos.forEach(jogo => {
                        const timeUser = estado.info.time;
                        const ehJogoUser = (jogo.mandante === timeUser || jogo.visitante === timeUser);
                        
                        // SIMULAÇÃO CPU (Se ainda não foi jogado e a rodada já passou)
                        if (!jogo.jogado && !ehJogoUser && numeroRodada < estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        if (jogo.jogado) {
                            this._computarTabela(liga.tabela, jogo);
                            this._computarArtilharia(liga.times, jogo);
                        }
                    });
                });
                liga.tabela.sort((a,b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg || b.gp - a.gp);
            }
        }

        const p = estado.info.pais;
        const d = estado.info.divisao;
        estado.classificacao = estado.mundo[p][d].tabela;
        estado.times = estado.mundo[p][d].times;

        // Fim de rodada
        const rodadaJogada = estado.rodadaAtual - 1;
        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            this._processarRecuperacaoElencos(estado);
            const jogoUser = estado.calendario[rodadaJogada-1].jogos.find(j => j.mandante === estado.info.time || j.visitante === estado.info.time);
            if(jogoUser) {
                const souMandante = jogoUser.mandante === estado.info.time;
                const nomeAdv = souMandante ? jogoUser.visitante : jogoUser.mandante;
                const timeAdv = estado.times.find(t => t.nome === nomeAdv) || {forca: 60};
                if(this.Sistema) this.Sistema.processarFinancas(estado, souMandante, timeAdv);
            }
            estado.recursos.ultimaRodadaProcessada = rodadaJogada;
        }

        this.salvarJogo(estado);
        return estado.classificacao;
    },

    // =========================================================================
    // 5. MÉTODOS AUXILIARES
    // =========================================================================
    
    _simularJogoCPU: function(liga, jogo) {
        const tC = liga.times.find(t => t.nome === jogo.mandante) || {forca:60, elenco: []};
        const tF = liga.times.find(t => t.nome === jogo.visitante) || {forca:60, elenco: []};
        
        const forcaCasa = (tC.forca || 60) + 5 + (Math.random() * 10);
        const forcaFora = (tF.forca || 60) + (Math.random() * 10);
        
        const diff = forcaCasa - forcaFora;
        let gc=0, gf=0;

        if(diff > 15) { gc = Math.floor(Math.random()*4)+1; gf = Math.floor(Math.random()*1); }
        else if(diff > 5) { gc = Math.floor(Math.random()*3)+1; gf = Math.floor(Math.random()*2); }
        else if(diff < -15) { gc = Math.floor(Math.random()*1); gf = Math.floor(Math.random()*4)+1; }
        else if (diff < -5) { gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*3)+1; }
        else { gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*2); }
        
        jogo.placarCasa = gc; 
        jogo.placarFora = gf; 
        
        // --- NOVO: Gera e SALVA os gols agora, para sempre ---
        jogo.eventos = [];
        this._gerarGolsDaPartida(tC, gc, jogo, 'casa');
        this._gerarGolsDaPartida(tF, gf, jogo, 'fora');
        
        // Ordena eventos por minuto
        jogo.eventos.sort((a,b) => a.minuto - b.minuto);

        jogo.jogado = true;
    },

    // Função auxiliar para criar os gols
    _gerarGolsDaPartida: function(timeObj, qtdGols, jogoObj, lado) {
        if(qtdGols <= 0 || !timeObj.elenco || timeObj.elenco.length === 0) return;

        // Pool de artilheiros (Atacantes tem mais chance)
        let pool = [];
        timeObj.elenco.forEach(j => {
            if(j.pos === 'ATA') { pool.push(j); pool.push(j); pool.push(j); } // 3x chance
            else if(j.pos === 'MEI') { pool.push(j); pool.push(j); } // 2x chance
            else { pool.push(j); } // Zagueiro/Goleiro 1x chance
        });

        for(let i=0; i < qtdGols; i++) {
            const autor = pool[Math.floor(Math.random() * pool.length)];
            const minuto = Math.floor(Math.random() * 90) + 1;
            
            jogoObj.eventos.push({
                minuto: minuto,
                autor: autor.nome,
                time: timeObj.nome,
                lado: lado, // 'casa' ou 'fora'
                tipo: 'gol'
            });
        }
    },

    _computarTabela: function(tab, jogo) {
        const c = tab.find(t=>t.nome===jogo.mandante);
        const f = tab.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return;
        const gc = parseInt(jogo.placarCasa);
        const gf = parseInt(jogo.placarFora);
        c.j++; f.j++; c.gp+=gc; f.gp+=gf; c.gc+=gf; f.gc+=gc; c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        if(gc > gf) { c.v++; c.pts+=3; f.d++; }
        else if (gf > gc) { f.v++; f.pts+=3; c.d++; }
        else { c.e++; f.e++; c.pts++; f.pts++; }
    },

    _computarArtilharia: function(times, jogo) {
        if(jogo.artilhariaComputada) return;
        
        // Agora lê dos eventos SALVOS, não sorteia de novo
        if(jogo.eventos && jogo.eventos.length > 0) {
            jogo.eventos.forEach(evento => {
                if(evento.tipo === 'gol') {
                    const time = times.find(t => t.nome === evento.time);
                    if(time) {
                        const jogador = time.elenco.find(j => j.nome === evento.autor);
                        if(jogador) {
                            jogador.gols = (jogador.gols || 0) + 1;
                        }
                    }
                }
            });
        }
        jogo.artilhariaComputada = true;
    },

    _processarRecuperacaoElencos: function(estado) {
        const timeUser = estado.times.find(t => t.nome === estado.info.time);
        if(timeUser) {
            timeUser.elenco.forEach(j => {
                if(j.status === 'Lesionado' && j.rodadasFora > 0) {
                    j.rodadasFora--;
                    if(j.rodadasFora <= 0) {
                        j.status = 'Apto';
                        this.Sistema.novaMensagem("DM", `${j.nome} recuperado.`, "dm");
                    }
                }
            });
        }
    },

    // =========================================================================
    // 6. GETTERS
    // =========================================================================
    getTabelaLiga: function(p, d) {
        const s = this.carregarJogo();
        return (s && s.mundo && s.mundo[p]) ? s.mundo[p][d].tabela : [];
    },
    
    getArtilhariaLiga: function(p, d) {
        const s = this.carregarJogo();
        if(!s || !s.mundo[p]) return [];
        let lista = [];
        s.mundo[p][d].times.forEach(t => {
            t.elenco.forEach(j => {
                if(j.gols > 0) lista.push({ nome: j.nome, time: t.nome, gols: j.gols, pos: j.pos, forca: j.forca }); 
            });
        });
        return lista.sort((a,b) => b.gols - a.gols).slice(0, 20); 
    }
};
