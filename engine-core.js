// ARQUIVO: engine-core.js
// VERSÃO: WORLD SYSTEM V9.1 (Artilharia Distribuída Fix)
// DESCRIÇÃO: Corrige o bug que acumulava gols de nomes desconhecidos em um único jogador.

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
                let renda = (g.info.divisao === 'D1' ? 500000 : 100000); 
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
    
    // =========================================================================
    // 3. INICIALIZAÇÃO
    // =========================================================================
    novoJogo: function(paisSelecionado, divisaoSelecionada, nomeTimeSelecionado) {
        if (typeof window.Database === 'undefined') { alert("Erro: database.js não carregado"); return; }
        if (typeof CalendarioSystem === 'undefined') { alert("Erro: calendario.js não carregado"); return; }

        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        const mundo = {};

        for (const p in window.Database) {
            mundo[p] = {};
            for (const div in window.Database[p]) {
                const timesRaw = JSON.parse(JSON.stringify(window.Database[p][div]));
                
                timesRaw.forEach(t => {
                    if (!t.elenco) t.elenco = [];
                    // Preenche elenco vazio apenas para não travar
                    if (t.elenco.length === 0) {
                        for(let k=0; k<15; k++) t.elenco.push({nome: `Jogador ${k+1}`, pos: "GEN", forca: 60});
                    }
                    
                    t.elenco.forEach((j, i) => {
                        j.uid = `${p}_${div}_${t.nome}_${i}`;
                        j.contrato = "31/12/2026";
                        if(!j.salario) j.salario = 10000;
                        j.jogos = 0; 
                        j.gols = 0; 
                        j.status = "Apto"; 
                    });
                });

                const calendario = CalendarioSystem.gerarCampeonato(timesRaw);
                const tabela = timesRaw.map(t => ({ nome: t.nome, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 }));
                mundo[p][div] = { times: timesRaw, calendario: calendario, tabela: tabela };
            }
        }

        const ligaJogada = mundo[paisSelecionado][divisaoSelecionada];
        const meuTime = ligaJogada.times.find(t => t.nome === nomeTimeSelecionado);
        
        const estadoInicial = {
            info: { tecnico: "Manager", time: nomeTimeSelecionado, escudo: meuTime.escudo, pais: paisSelecionado, divisao: divisaoSelecionada },
            recursos: { dinheiro: 2000000, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { tutorial: true },
            financas: { saldo: 2000000, historico: [] },
            rodadaAtual: 1,
            mundo: mundo, 
            times: ligaJogada.times,
            calendario: ligaJogada.calendario,
            classificacao: ligaJogada.tabela, 
            mensagens: [] 
        };

        this.salvarJogo(estadoInicial);
        if(window.Engine.Contratos) window.Engine.Contratos.enviarBoasVindas(estadoInicial);
    },

    // =========================================================================
    // 4. ATUALIZAÇÃO
    // =========================================================================
    atualizarTabela: function(estado) {
        if(!estado) estado = this.carregarJogo();

        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const liga = estado.mundo[p][d];
                
                // 1. Zera estatísticas
                liga.tabela.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });
                liga.times.forEach(t => { if(t.elenco) t.elenco.forEach(j => j.gols = 0); });

                // 2. Processa jogos
                liga.calendario.forEach((rod, idx) => {
                    const numeroRodada = idx + 1;
                    
                    rod.jogos.forEach(jogo => {
                        const ehJogoUser = (jogo.mandante === estado.info.time || jogo.visitante === estado.info.time);
                        
                        // Simula passado
                        if (!jogo.jogado && !ehJogoUser && numeroRodada < estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        // Repair de Gols
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

        // Atalhos e Finalização
        const p = estado.info.pais;
        const d = estado.info.divisao;
        estado.classificacao = estado.mundo[p][d].tabela;
        estado.times = estado.mundo[p][d].times;

        const rodadaJogada = estado.rodadaAtual - 1;
        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            const timeUser = estado.times.find(t => t.nome === estado.info.time);
            if(timeUser) {
                timeUser.elenco.forEach(j => {
                    if(j.status === 'Lesionado' && j.rodadasFora > 0) {
                        j.rodadasFora--;
                        if(j.rodadasFora <= 0) j.status = 'Apto';
                    }
                });
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
        const tC = liga.times.find(t => t.nome === jogo.mandante);
        const tF = liga.times.find(t => t.nome === jogo.visitante);
        if(!tC || !tF) return;

        const diff = (tC.forca || 60) - (tF.forca || 60) + 5; 
        let gc=0, gf=0;

        if(diff > 10) { gc = Math.floor(Math.random()*3)+1; gf = Math.floor(Math.random()*1); }
        else if(diff < -10) { gc = Math.floor(Math.random()*1); gf = Math.floor(Math.random()*3)+1; }
        else { gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*2); }
        
        jogo.placarCasa = gc; 
        jogo.placarFora = gf; 
        jogo.jogado = true;
        
        jogo.eventos = [];
        this._gerarGolsDaPartida(tC, gc, jogo, 'casa');
        this._gerarGolsDaPartida(tF, gf, jogo, 'fora');
    },

    _gerarGolsDaPartida: function(timeObj, qtdGols, jogoObj, lado) {
        if(qtdGols <= 0) return;
        
        let pool = [];
        if (timeObj.elenco && timeObj.elenco.length > 0) {
            lista = timeObj.elenco;
        } else {
            lista = [{nome: "Desconhecido"}]; 
        }

        for(let i=0; i < qtdGols; i++) {
            const autor = lista[Math.floor(Math.random() * lista.length)].nome;
            jogoObj.eventos.push({
                minuto: Math.floor(Math.random() * 90) + 1,
                autor: autor,
                time: timeObj.nome,
                lado: lado,
                tipo: 'gol'
            });
        }
    },

    _computarTabela: function(tab, jogo) {
        const c = tab.find(t=>t.nome === jogo.mandante);
        const f = tab.find(t=>t.nome === jogo.visitante);
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
        
        jogo.eventos.forEach(evt => {
            if(evt.tipo === 'gol') {
                const time = times.find(t => t.nome === evt.time);
                if(time && time.elenco && time.elenco.length > 0) {
                    
                    // Normaliza strings para evitar erro de espaço/caps lock
                    const nomeEvento = evt.autor.trim().toLowerCase();
                    
                    // 1. Tenta achar exato
                    let jogador = time.elenco.find(j => j.nome.trim().toLowerCase() === nomeEvento);
                    
                    // 2. CORREÇÃO DE BUG (Aqui estava o erro):
                    // Se não achar o jogador, sorteia ALGUÉM DO ELENCO (não apenas o primeiro)
                    if (!jogador) {
                        const candidatos = time.elenco.filter(j => j.pos === 'ATA' || j.pos === 'MEI');
                        const pool = candidatos.length > 0 ? candidatos : time.elenco;
                        
                        // Sorteia um novo "pai" para o gol órfão
                        jogador = pool[Math.floor(Math.random() * pool.length)];
                        
                        // Atualiza o evento para fixar o erro
                        evt.autor = jogador.nome;
                    }

                    if(jogador) {
                        jogador.gols = (jogador.gols || 0) + 1;
                    }
                }
            }
        });
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
