// ARQUIVO: engine-core.js
// VERSÃO: WORLD SYSTEM V5.0 (Database Sync + Auto-Repair)
// DESCRIÇÃO: Prioriza os jogadores do database.js antes de gerar aleatórios.

window.Engine = {
    // =========================================================================
    // BANCO DE NOMES (Fallback apenas se o Database falhar)
    // =========================================================================
    NomesDB: {
        nomes: ["Gabriel", "Lucas", "Matheus", "Pedro", "Leonardo", "Felipe", "Bruno", "Daniel", "Thiago", "Rafael"],
        sobrenomes: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"]
    },

    _gerarNomeAleatorio: function() {
        const n = this.NomesDB.nomes[Math.floor(Math.random() * this.NomesDB.nomes.length)];
        const s = this.NomesDB.sobrenomes[Math.floor(Math.random() * this.NomesDB.sobrenomes.length)];
        return `${n} ${s}`;
    },

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

    // Busca o time original no arquivo database.js (para restaurar elencos perdidos)
    _buscarTimeOriginal: function(nomeBusca) {
        if(typeof window.Database === 'undefined') return null;
        for(let p in window.Database) {
            for(let d in window.Database[p]) {
                const t = window.Database[p][d].find(x => x.nome === nomeBusca);
                if(t) return t;
            }
        }
        return null;
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
                    // Processa inicialização
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
    // 4. ATUALIZAÇÃO E AUTO-REPAIR (SYNC COM DATABASE)
    // =========================================================================
    atualizarTabela: function(estado) {
        if(!estado) estado = this.carregarJogo();

        // 1. LIMPEZA E IMPORTAÇÃO DO DATABASE REAL (Auto-Fix)
        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const times = estado.mundo[p][d].times;
                
                times.forEach(t => {
                    // SE O TIME ESTIVER VAZIO OU COM GENÉRICOS
                    // Tenta buscar no DATABASE ORIGINAL
                    const precisaFix = (!t.elenco || t.elenco.length === 0 || t.elenco.some(j => j.nome.includes("Atacante") || j.nome.includes("Genérico")));
                    
                    if(precisaFix) {
                        const original = this._buscarTimeOriginal(t.nome);
                        
                        // Achou no Database real? Importa!
                        if(original && original.elenco && original.elenco.length > 0) {
                            // Clona o elenco original para o save
                            t.elenco = JSON.parse(JSON.stringify(original.elenco));
                            
                            // Re-aplica atributos de jogo
                            t.elenco.forEach((j, i) => {
                                j.uid = `${t.nome.substring(0,3).toUpperCase()}_${i}`;
                                j.contrato = "31/12/2026";
                                if(!j.salario) j.salario = Math.floor((j.forca || 60) * 1250); 
                                j.gols = 0; // Zera stats para não bugar
                                j.status = "Apto";
                            });
                        } 
                        // Se NÃO achou no database (realmente vazio), aí sim usa gerador
                        else if (!t.elenco || t.elenco.length === 0) {
                            t.elenco = [];
                            for(let k=0; k<15; k++) {
                                t.elenco.push({
                                    nome: this._gerarNomeAleatorio(),
                                    pos: k < 2 ? "GOL" : k < 6 ? "DEF" : k < 11 ? "MEI" : "ATA",
                                    forca: Math.floor(Math.random() * 20) + 60,
                                    salario: 10000,
                                    gols: 0
                                });
                            }
                        }
                    }
                });
            }
        }

        // Zera artilharia global antes de recalcular
        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                estado.mundo[p][d].times.forEach(t => {
                    if(t.elenco) t.elenco.forEach(j => j.gols = 0);
                });
            }
        }

        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const liga = estado.mundo[p][d];
                
                liga.tabela.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });

                liga.calendario.forEach((rod, idx) => {
                    const numeroRodada = idx + 1;
                    
                    rod.jogos.forEach(jogo => {
                        const timeUser = estado.info.time;
                        const ehJogoUser = (jogo.mandante === timeUser || jogo.visitante === timeUser);
                        
                        // Simula quem ainda não jogou
                        if (!jogo.jogado && !ehJogoUser && numeroRodada < estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        // AUTO-REPAIR DE GOLS
                        if (jogo.jogado && (!jogo.eventos || jogo.eventos.length === 0)) {
                            const gc = parseInt(jogo.placarCasa);
                            const gf = parseInt(jogo.placarFora);
                            if (gc > 0 || gf > 0) {
                                jogo.eventos = [];
                                const tC = liga.times.find(t => t.nome === jogo.mandante);
                                const tF = liga.times.find(t => t.nome === jogo.visitante);
                                if(tC) this._gerarGolsDaPartida(tC, gc, jogo, 'casa');
                                if(tF) this._gerarGolsDaPartida(tF, gf, jogo, 'fora');
                            }
                        }

                        // Computa
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
        
        jogo.eventos = [];
        this._gerarGolsDaPartida(tC, gc, jogo, 'casa');
        this._gerarGolsDaPartida(tF, gf, jogo, 'fora');
        jogo.eventos.sort((a,b) => a.minuto - b.minuto);

        jogo.jogado = true;
    },

    _gerarGolsDaPartida: function(timeObj, qtdGols, jogoObj, lado) {
        if(qtdGols <= 0) return;
        
        let pool = [];
        if(timeObj && timeObj.elenco && timeObj.elenco.length > 0) {
            timeObj.elenco.forEach(j => {
                if(j.pos === 'ATA') { pool.push(j); pool.push(j); pool.push(j); }
                else if(j.pos === 'MEI') { pool.push(j); pool.push(j); }
                else { pool.push(j); }
            });
        }

        for(let i=0; i < qtdGols; i++) {
            let nomeAutor = "";
            
            if(pool.length > 0) {
                const sortudo = pool[Math.floor(Math.random() * pool.length)];
                nomeAutor = sortudo.nome;
            } else {
                // Último caso: Se o database falhar e o time estiver vazio
                nomeAutor = `Atacante ${timeObj.nome.split(' ')[0]}`; 
            }

            const minuto = Math.floor(Math.random() * 90) + 1;
            
            jogoObj.eventos.push({
                minuto: minuto,
                autor: nomeAutor,
                time: timeObj.nome || "Time",
                lado: lado,
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
        if(!jogo.eventos) return;
        
        jogo.eventos.forEach(evento => {
            if(evento.tipo === 'gol') {
                const time = times.find(t => t.nome === evento.time);
                if(time) {
                    if(!time.elenco) time.elenco = [];
                    
                    let jogador = time.elenco.find(j => j.nome === evento.autor);
                    
                    // Se não achou (ex: bug antigo), tenta criar, mas prioriza o database
                    if(!jogador) {
                        // Tenta achar no database primeiro
                        const original = window.Engine._buscarTimeOriginal(time.nome);
                        if(original && original.elenco) {
                             const real = original.elenco.find(r => r.nome === evento.autor);
                             if(real) {
                                 // Importa o real
                                 jogador = JSON.parse(JSON.stringify(real));
                                 time.elenco.push(jogador);
                             }
                        }
                    }

                    if(jogador) {
                        jogador.gols = (jogador.gols || 0) + 1;
                    }
                }
            }
        });
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

    getTabelaLiga: function(p, d) {
        const s = this.carregarJogo();
        return (s && s.mundo && s.mundo[p]) ? s.mundo[p][d].tabela : [];
    },
    
    getArtilhariaLiga: function(p, d) {
        const s = this.carregarJogo();
        if(!s || !s.mundo[p]) return [];
        let lista = [];
        
        s.mundo[p][d].times.forEach(t => {
            if(t.elenco) {
                t.elenco.forEach(j => {
                    if(j.gols > 0) lista.push({ nome: j.nome, time: t.nome, gols: j.gols, pos: j.pos, forca: j.forca }); 
                });
            }
        });
        return lista.sort((a,b) => b.gols - a.gols).slice(0, 20); 
    }
};
