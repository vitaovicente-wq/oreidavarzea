// ARQUIVO: engine-core.js
// VERSÃO: RESTORED STABLE + GOAL FIX
// DESCRIÇÃO: Código original restaurado. Adicionada apenas a gravação de nomes nos gols.

window.Engine = {
    // =========================================================================
    // 1. SISTEMA (Original mantido)
    // =========================================================================
    Sistema: {
        novaMensagem: function(titulo, corpo, tipo, remetente="Sistema") {
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
            
            // Limite de segurança para não pesar o save
            if(game.mensagens.length > 50) game.mensagens.pop();
            
            window.Engine.salvarJogo(game);
        },
        
        processarFinancas: function(g, mand, adv) {
            const registrar = (txt, val, tp) => {
                g.financas.historico.push({ texto: txt, valor: val, tipo: tp, rodada: g.rodadaAtual });
            };

            // Bilheteria
            if(mand) {
                let renda = 0;
                if(window.Engine.Estadios) {
                    const r = window.Engine.Estadios.calcularBilheteria(adv);
                    renda = r.rendaTotal;
                } else {
                    renda = 50000; // Valor base simples se não tiver estádio
                }
                g.recursos.dinheiro += renda;
                registrar('Bilheteria', renda, 'entrada');
            } 
            
            // Custos Mensais (a cada 4 rodadas)
            if(g.rodadaAtual % 4 === 0) {
                let folha = 0;
                const time = window.Engine.encontrarTime(g.info.time);
                if(time && time.elenco) time.elenco.forEach(j => folha += (j.salario || 10000));
                
                g.recursos.dinheiro -= folha;
                registrar('Salários', -folha, 'saida');
            }
            
            g.recursos.dinheiro -= 50000; 
            registrar('Custos Operacionais', -50000, 'saida');
        }
    },

    // =========================================================================
    // 2. SAVE & LOAD (Original com Correção de Referência)
    // =========================================================================
    salvarJogo: function(estado) { 
        // Salva uma cópia limpa para evitar referências circulares
        const save = { ...estado };
        delete save.times;
        delete save.calendario;
        delete save.classificacao;
        localStorage.setItem('brfutebol_save', JSON.stringify(save)); 
    },

    carregarJogo: function() { 
        const s = localStorage.getItem('brfutebol_save'); 
        if(!s) return null;
        
        const game = JSON.parse(s);
        
        // Reconecta os atalhos (Vital para o calendário funcionar)
        if (game.mundo && game.info) {
            const p = game.info.pais;
            const d = game.info.divisao;
            if(game.mundo[p] && game.mundo[p][d]) {
                game.times = game.mundo[p][d].times;
                game.calendario = game.mundo[p][d].calendario;
                game.classificacao = game.mundo[p][d].tabela;
            }
        }
        return game; 
    },
    
    // Busca universal
    encontrarTime: function(nome) { 
        const s = this.carregarJogo(); 
        if (!s) return { nome: nome, elenco: [] };
        if (s.mundo) {
            for(let p in s.mundo) {
                for(let d in s.mundo[p]) {
                    const t = s.mundo[p][d].times.find(x => x.nome === nome);
                    if(t) return t;
                }
            }
        }
        return { nome: nome, elenco: [] }; 
    },

    // =========================================================================
    // 3. INICIALIZAÇÃO (Lógica Financeira Original Restaurada)
    // =========================================================================
    novoJogo: function(paisSelecionado, divisaoSelecionada, nomeTimeSelecionado) {
        console.log(`🌍 Iniciando: ${nomeTimeSelecionado} [${paisSelecionado}]`);
        if (typeof CalendarioSystem === 'undefined') { alert("Erro: calendario.js"); return; }

        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        const mundo = {};

        // 1. Cria o Mundo
        for (const p in window.Database) {
            mundo[p] = {};
            for (const div in window.Database[p]) {
                const timesRaw = JSON.parse(JSON.stringify(window.Database[p][div]));
                timesRaw.forEach(t => {
                    if (!t.elenco) t.elenco = [];
                    t.elenco.forEach((j, i) => {
                        j.uid = `${p}_${div}_${t.nome.substring(0,3)}_${i}`;
                        j.contrato = "31/12/2026";
                        if(!j.salario) j.salario = (j.forca || 60) * 1500;
                        j.jogos=0; j.gols=0; j.status="Apto"; j.rodadasFora=0;
                    });
                });

                const calendario = CalendarioSystem.gerarCampeonato(timesRaw);
                const tabela = timesRaw.map(t => ({ 
                    nome: t.nome, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 
                }));

                mundo[p][div] = { times: timesRaw, calendario: calendario, tabela: tabela };
            }
        }

        // 2. Define Atalhos
        const ligaJogada = mundo[paisSelecionado][divisaoSelecionada];
        const meuTime = ligaJogada.times.find(t => t.nome === nomeTimeSelecionado);
        
        // RESTAURADO: Lógica original de dinheiro
        let orcamento = 2000000; 
        if (meuTime.forca > 80) orcamento = 10000000;

        const estado = {
            info: { tecnico: localStorage.getItem('brfutebol_tecnico')||"Manager", time: nomeTimeSelecionado, escudo: meuTime.escudo, pais: paisSelecionado, divisao: divisaoSelecionada },
            recursos: { dinheiro: orcamento, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false },
            financas: { saldo: orcamento, historico: [{ texto: "Inicial", valor: orcamento, tipo: "entrada", rodada: 0 }] },
            rodadaAtual: 1,
            
            mundo: mundo,
            times: ligaJogada.times,
            calendario: ligaJogada.calendario,
            classificacao: ligaJogada.tabela, 
            mensagens: [] 
        };

        this.salvarJogo(estado);
        if(window.Engine.Contratos) window.Engine.Contratos.enviarBoasVindas(estado);
    },

    // =========================================================================
    // 4. ATUALIZAÇÃO (Original + Fix de Gols)
    // =========================================================================
    atualizarTabela: function(estado) {
        if(!estado) estado = this.carregarJogo();

        // Varre CADA liga do mundo e recalcula
        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const liga = estado.mundo[p][d];
                
                // 1. Zera a tabela desta liga
                liga.tabela.forEach(t => { 
                    t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; 
                });

                // Zera gols dos jogadores para recalcular limpo da artilharia
                liga.times.forEach(t => {
                    if(t.elenco) t.elenco.forEach(j => j.gols = 0);
                });

                // 2. Lê o calendário desta liga
                liga.calendario.forEach((rod, idx) => {
                    const numeroRodada = idx + 1;
                    
                    rod.jogos.forEach(jogo => {
                        const timeUser = estado.info.time;
                        const ehJogoUser = (jogo.mandante === timeUser || jogo.visitante === timeUser);
                        
                        // Simula CPU x CPU (CORRIGIDO: usa < para jogos passados)
                        if (!jogo.jogado && !ehJogoUser && numeroRodada < estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        // Se foi jogado (pelo user ou CPU), conta ponto
                        if (jogo.jogado) {
                            // Se o jogo não tiver eventos (ex: save antigo), gera agora para não ficar vazio
                            if(!jogo.eventos || jogo.eventos.length === 0) {
                                const gc = parseInt(jogo.placarCasa);
                                const gf = parseInt(jogo.placarFora);
                                if(gc > 0 || gf > 0) {
                                    jogo.eventos = [];
                                    const tC = liga.times.find(t => t.nome === jogo.mandante);
                                    const tF = liga.times.find(t => t.nome === jogo.visitante);
                                    if(tC) this._gerarEventosGol(tC, gc, jogo, 'casa');
                                    if(tF) this._gerarEventosGol(tF, gf, jogo, 'fora');
                                }
                            }

                            this._computar(liga.tabela, jogo);
                            this._processarArtilharia(liga.times, jogo);
                        }
                    });
                });

                // 3. Ordena
                liga.tabela.sort((a,b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp);
            }
        }

        // Sincroniza os atalhos
        const p = estado.info.pais;
        const d = estado.info.divisao;
        estado.classificacao = estado.mundo[p][d].tabela;
        estado.calendario = estado.mundo[p][d].calendario;
        estado.times = estado.mundo[p][d].times;

        // Processos de fim de rodada
        const rodadaJogada = estado.rodadaAtual - 1;
        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            this._processarRecuperacaoElencos(estado);
            
            const jogoUser = estado.calendario[rodadaJogada-1].jogos.find(j => j.mandante === estado.info.time || j.visitante === estado.info.time);
            if(jogoUser) {
                const mandante = jogoUser.mandante === estado.info.time;
                const advNome = mandante ? jogoUser.visitante : jogoUser.mandante;
                const timeAdv = estado.times.find(t => t.nome === advNome) || {forca:60};
                if(this.Sistema) this.Sistema.processarFinancas(estado, mandante, timeAdv);
            }
            
            estado.recursos.ultimaRodadaProcessada = rodadaJogada;
        }

        this.salvarJogo(estado);
        return estado.classificacao;
    },

    // =========================================================================
    // 5. AUXILIARES
    // =========================================================================
    _simularJogoCPU: function(liga, jogo) {
        const tC = liga.times.find(t => t.nome === jogo.mandante) || {forca:60};
        const tF = liga.times.find(t => t.nome === jogo.visitante) || {forca:60};
        
        const diff = (tC.forca || 60) - (tF.forca || 60) + 5; 
        let gc=0, gf=0;

        if(diff > 10) { gc = Math.floor(Math.random()*3)+1; gf = Math.floor(Math.random()*1); }
        else if(diff < -10) { gc = Math.floor(Math.random()*1); gf = Math.floor(Math.random()*3)+1; }
        else { gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*2); }

        jogo.placarCasa = gc; 
        jogo.placarFora = gf; 
        
        // NOVO: Gera e salva os nomes dos goleadores
        jogo.eventos = [];
        this._gerarEventosGol(tC, gc, jogo, 'casa');
        this._gerarEventosGol(tF, gf, jogo, 'fora');
        
        jogo.jogado = true;
    },

    // NOVO: Função para criar eventos de gol
    _gerarEventosGol: function(time, qtd, jogo, lado) {
        if(qtd <= 0) return;
        
        let pool = [];
        if(time && time.elenco && time.elenco.length > 0) {
             // Prioriza atacantes
             pool = time.elenco.filter(j => j.pos === 'ATA' || j.pos === 'MEI');
             if(pool.length === 0) pool = time.elenco;
        } else {
             // Fallback se o time estiver vazio
             pool = [{nome: `Atacante ${time.nome}`}];
        }

        for(let i=0; i<qtd; i++) {
            const autor = pool[Math.floor(Math.random() * pool.length)].nome;
            jogo.eventos.push({
                minuto: Math.floor(Math.random() * 90) + 1,
                autor: autor,
                time: time.nome,
                lado: lado,
                tipo: 'gol'
            });
        }
    },

    _computar: function(tab, jogo) {
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

    _processarArtilharia: function(times, jogo) {
        // Se não tiver eventos gravados, sai
        if(!jogo.eventos) return;
        
        jogo.eventos.forEach(evt => {
            if(evt.tipo === 'gol') {
                const time = times.find(t => t.nome === evt.time);
                if(time && time.elenco) {
                    // Busca pelo nome exato gravado no evento
                    const jogador = time.elenco.find(j => j.nome === evt.autor);
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
                        if(this.Sistema) this.Sistema.novaMensagem("DM", `O jogador ${j.nome} está recuperado.`, "dm");
                    }
                }
            });
        }
    },

    // Métodos de Acesso Externo
    getTabelaLiga: function(p, d) {
        const s = this.carregarJogo();
        return (s && s.mundo && s.mundo[p]) ? s.mundo[p][d].tabela : [];
    },
    getArtilhariaLiga: function(p, d) {
        const s = this.carregarJogo();
        if(!s || !s.mundo[p]) return [];
        let l = [];
        s.mundo[p][d].times.forEach(t => {
            if(t.elenco) t.elenco.forEach(j => { 
                if(j.gols>0) l.push({nome:j.nome, time:t.nome, gols:j.gols}); 
            }); 
        });
        return l.sort((a,b) => b.gols - a.gols).slice(0, 20);
    }
};
