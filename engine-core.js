// ARQUIVO: engine-core.js
// VERSÃO: WORLD SIMULATION (Universo Expandido Real + Artilharia + Finanças + Lesão)

window.Engine = {
    // --- SISTEMA ---
    Sistema: {
        novaMensagem: function(titulo, corpo, tipo, remetente="Sistema") {
            const game = window.Engine.carregarJogo();
            if(!game) return; 
            if(!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({
                id: Date.now() + Math.random(),
                rodada: game.rodadaAtual,
                remetente: remetente, titulo: titulo, corpo: corpo, tipo: tipo, lida: false
            });
            window.Engine.salvarJogo(game);
        },
        
        processarFinancas: function(g, mand, adv) {
            const registrar = (txt, val, tp) => {
                g.financas.historico.push({ texto: txt, valor: val, tipo: tp, rodada: g.rodadaAtual });
            };

            // Bilheteria
            if(mand && window.Engine.Estadios) {
                const r = window.Engine.Estadios.calcularBilheteria(adv);
                g.recursos.dinheiro += r.rendaTotal;
                registrar('Bilheteria', r.rendaTotal, 'entrada');
            } 
            
            // Custos Mensais (a cada 4 rodadas)
            if(g.rodadaAtual % 4 === 0) {
                if(g.contratos.patrocinio) {
                    g.recursos.dinheiro += g.contratos.patrocinio.mensal;
                    registrar('Patrocínio', g.contratos.patrocinio.mensal, 'entrada');
                }
                if(g.contratos.tv) {
                    g.recursos.dinheiro += g.contratos.tv.fixo;
                    registrar('Cota TV', g.contratos.tv.fixo, 'entrada');
                }
                // Salários (busca o elenco no mundo)
                let folha = 0;
                const meuTime = window.Engine._getMeuTimeDoMundo(g);
                if(meuTime) meuTime.elenco.forEach(j => folha += (j.salario || 10000));
                
                g.recursos.dinheiro -= folha;
                registrar('Salários', -folha, 'saida');
            }
            
            g.recursos.dinheiro -= 50000; // Custo Operacional
            registrar('Custos Operacionais', -50000, 'saida');
        }
    },

    // --- SAVE & LOAD ---
    salvarJogo: function(estado) { localStorage.setItem('brfutebol_save', JSON.stringify(estado)); },
    carregarJogo: function() { const s = localStorage.getItem('brfutebol_save'); return s ? JSON.parse(s) : null; },
    
    // Auxiliar para achar o time do jogador dentro da estrutura gigante do mundo
    _getMeuTimeDoMundo: function(estado) {
        const p = estado.info.pais;
        const d = estado.info.divisao;
        if(estado.mundo[p] && estado.mundo[p][d]) {
            return estado.mundo[p][d].times.find(t => t.nome === estado.info.time);
        }
        return null;
    },

    // --- INICIALIZAÇÃO (CARREGA O MUNDO TODO) ---
    novoJogo: function(paisSelecionado, divisaoSelecionada, nomeTimeSelecionado) {
        console.log(`🌍 Iniciando Universo Global...`);
        
        if (typeof CalendarioSystem === 'undefined') { alert("Erro: calendario.js"); return; }

        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        // ESTRUTURA DO MUNDO
        // estado.mundo['brasil']['serieA'] = { times: [], calendario: [], tabela: [] }
        const mundo = {};

        // 1. Varre o Database e cria todas as ligas
        for (const p in window.Database) {
            mundo[p] = {};
            for (const div in window.Database[p]) {
                // Clona os times
                const timesRaw = JSON.parse(JSON.stringify(window.Database[p][div]));
                
                // Inicializa jogadores de todos os times
                timesRaw.forEach(t => {
                    if (!t.elenco) t.elenco = [];
                    t.elenco.forEach((j, i) => {
                        if (!j.uid) j.uid = `${p}_${div}_${t.nome.substring(0,3)}_${i}`;
                        j.contrato = "31/12/2026";
                        if (!j.salario) j.salario = (j.forca || 60) * 1500;
                        j.jogos=0; j.gols=0; j.status="Apto"; j.rodadasFora=0;
                    });
                });

                // Gera Calendário e Tabela para esta liga
                const calendario = CalendarioSystem.gerarCampeonato(timesRaw);
                const tabela = timesRaw.map(t => ({ 
                    nome: t.nome, escudo: t.escudo, forca: t.forca,
                    pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 
                }));

                mundo[p][div] = {
                    times: timesRaw,
                    calendario: calendario,
                    tabela: tabela
                };
                console.log(`✅ Liga Carregada: ${p} - ${div}`);
            }
        }

        // Configuração Inicial do Jogador
        // Encontra o time escolhido para definir orçamento
        const ligaJogada = mundo[paisSelecionado][divisaoSelecionada];
        const meuTime = ligaJogada.times.find(t => t.nome === nomeTimeSelecionado);
        
        // Cálculo de Orçamento
        let somaOvr = 0;
        if(meuTime.elenco.length > 0) meuTime.elenco.forEach(j => somaOvr += j.forca);
        const mediaOvr = meuTime.elenco.length > 0 ? Math.floor(somaOvr / meuTime.elenco.length) : 60;
        const fatorMoeda = (paisSelecionado === 'brasil') ? 1 : 5;
        
        let orcamento = 2000000;
        if (mediaOvr > 90) orcamento = 15000000 * fatorMoeda;
        else if (mediaOvr > 80) orcamento = 10000000 * fatorMoeda;
        else if (mediaOvr > 70) orcamento = 6000000 * fatorMoeda;
        else if (mediaOvr > 65) orcamento = 3500000 * fatorMoeda;

        const estado = {
            info: { 
                tecnico: localStorage.getItem('brfutebol_tecnico')||"Manager", 
                time: nomeTimeSelecionado, 
                escudo: meuTime.escudo, 
                pais: paisSelecionado, 
                divisao: divisaoSelecionada, 
                dataInicio: new Date().getTime() 
            },
            recursos: { dinheiro: orcamento, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false, patroEnviado: false, tvEnviado: false, treinoAtual: 'balanceado' },
            financas: { saldo: orcamento, historico: [{ texto: "Aporte Inicial", valor: orcamento, tipo: "entrada", rodada: 0 }] },
            rodadaAtual: 1,
            mundo: mundo, // O GRANDE OBJETO GLOBAL
            jogadoresStatus: {},
            mensagens: [] 
        };

        this.salvarJogo(estado);
        
        setTimeout(() => {
            if(window.Engine && window.Engine.Contratos) {
                window.Engine.Contratos.enviarBoasVindas(window.Engine.carregarJogo());
            }
        }, 200);
    },

    // --- ATUALIZAÇÃO GLOBAL (PROCESSA O MUNDO) ---
    atualizarTabela: function(estado) {
        // Varre TODOS os países e TODAS as divisões
        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const liga = estado.mundo[p][d];
                
                // 1. Zera a tabela para recalcular (garante integridade)
                liga.tabela.forEach(t => { 
                    t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; 
                });

                // 2. Processa Calendário
                liga.calendario.forEach((rod, idxRodada) => {
                    const numeroRodada = idxRodada + 1;
                    
                    // Só processa se a rodada já aconteceu ou é a atual
                    // Mas para a Engine Match, ela processa o jogo atual quando o user clica
                    // Aqui vamos simular APENAS se o jogo já tiver flag de 'jogado' OU se for CPU x CPU da rodada atual que precisa ser simulado agora
                    
                    rod.jogos.forEach(jogo => {
                        // Se é jogo do usuário, ele é jogado manualmente na tela de match
                        // Se é CPU vs CPU da rodada atual e ainda não foi jogado, simula agora
                        const timeUser = estado.info.time;
                        const ehJogoUser = (jogo.mandante === timeUser || jogo.visitante === timeUser);
                        
                        // Simula CPU x CPU da rodada atual (ou passadas que falharam)
                        if (!jogo.jogado && !ehJogoUser && numeroRodada <= estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        // Se já foi jogado (pelo user ou pela CPU acima), computa na tabela
                        if (jogo.jogado) {
                            this._computarPontos(liga.tabela, jogo);
                            this._processarArtilharia(liga.times, jogo);
                        }
                    });
                });

                // 3. Ordena Tabela
                liga.tabela.sort((a,b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp);
            }
        }

        // --- EVENTOS DO JOGADOR (SÓ NA LIGA DELE) ---
        const rodadaJogada = estado.rodadaAtual - 1;
        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            
            // Finanças e Eventos só rodam para o time do usuário
            const ligaUser = estado.mundo[estado.info.pais][estado.info.divisao];
            const jogoUser = ligaUser.calendario[rodadaJogada-1].jogos.find(j => j.mandante === estado.info.time || j.visitante === estado.info.time);
            
            if(jogoUser) {
                const mandante = jogoUser.mandante === estado.info.time;
                const adv = mandante ? jogoUser.visitante : jogoUser.mandante;
                
                // Para calcular bilheteria, precisamos do objeto 'time' do adversário pra ver força
                const timeAdv = ligaUser.times.find(t => t.nome === adv) || {forca:60};
                if(this.Sistema) this.Sistema.processarFinancas(estado, mandante, timeAdv);
            }

            this._processarRecuperacaoElencos(estado); // Só recupera lesão do time do user por enquanto pra economizar loop
            
            if(this.Eventos) this.Eventos.processarEventosRodada(estado);
            if(this.Mercado) {
                this.Mercado.atualizarListaTransferencias(estado);
                this.Mercado.simularDispensasCPU(estado);
            }
            if(this.Contratos) {
                this.Contratos.processarVencimentos(estado);
                if (!estado.flags.patroEnviado && !estado.contratos.patrocinio) this.Contratos.liberarOfertasPatrocinio();
                if (!estado.flags.tvEnviado && !estado.contratos.tv) this.Contratos.liberarOfertasTV();
            }

            estado.recursos.ultimaRodadaProcessada = rodadaJogada;
        }

        this.salvarJogo(estado);
        // Retorna a tabela da liga do usuário para compatibilidade
        return estado.mundo[estado.info.pais][estado.info.divisao].tabela;
    },

    // SIMULAÇÃO RÁPIDA (CPU vs CPU)
    _simularJogoCPU: function(liga, jogo) {
        const timeC = liga.times.find(t => t.nome === jogo.mandante) || {forca:60};
        const timeF = liga.times.find(t => t.nome === jogo.visitante) || {forca:60};

        // Fator Casa + Aleatório + Diferença de Força
        const forcaC = timeC.forca + 5 + (Math.random() * 10);
        const forcaF = timeF.forca + (Math.random() * 10);

        let gc = 0, gf = 0;
        
        // Lógica simples de placar baseada na diferença
        const diff = forcaC - forcaF;
        
        if (diff > 15) { gc = Math.floor(Math.random()*4)+1; gf = Math.floor(Math.random()*1); }
        else if (diff > 5) { gc = Math.floor(Math.random()*3)+1; gf = Math.floor(Math.random()*2); }
        else if (diff < -15) { gc = Math.floor(Math.random()*1); gf = Math.floor(Math.random()*4)+1; }
        else if (diff < -5) { gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*3)+1; }
        else { gc = Math.floor(Math.random()*3); gf = Math.floor(Math.random()*3); } // Empate provável

        jogo.placarCasa = gc;
        jogo.placarFora = gf;
        jogo.jogado = true;
    },

    // COMPUTAR PONTOS NA TABELA
    _computarPontos: function(tabela, jogo) {
        const c = tabela.find(t=>t.nome===jogo.mandante); 
        const f = tabela.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return; // Erro de integridade
        
        const gc=parseInt(jogo.placarCasa); 
        const gf=parseInt(jogo.placarFora);
        
        c.j++; f.j++; c.gp+=gc; f.gp+=gf; c.gc+=gf; f.gc+=gc; c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        if(gc>gf){c.v++; c.pts+=3; f.d++;} else if(gf>gc){f.v++; f.pts+=3; c.d++;} else{c.e++; f.e++; c.pts++; f.pts++;}
    },

    // DISTRIBUIR GOLS (ARTILHARIA GLOBAL)
    _processarArtilharia: function(listaTimes, jogo) {
        if(jogo.artilhariaComputada) return;

        const distribuir = (nomeTime, qtdGols) => {
            if(qtdGols <= 0) return;
            const time = listaTimes.find(t => t.nome === nomeTime);
            if(!time || !time.elenco.length) return; // Times sem elenco (genéricos) não contam artilharia individual

            // Filtrar apenas atacantes e meias para terem mais chance
            const ofensivos = time.elenco.filter(j => j.pos === 'ATA' || j.pos === 'MEI');
            const pool = ofensivos.length > 0 ? ofensivos : time.elenco;

            for(let i=0; i<qtdGols; i++) {
                // Sorteio ponderado pela força
                const chutador = pool[Math.floor(Math.random() * pool.length)];
                chutador.gols = (chutador.gols || 0) + 1;
            }
        };

        distribuir(jogo.mandante, parseInt(jogo.placarCasa));
        distribuir(jogo.visitante, parseInt(jogo.placarFora));
        jogo.artilhariaComputada = true;
    },

    // Recuperação de Lesões (Apenas time do usuário para performance)
    _processarRecuperacaoElencos: function(estado) {
        const timeUser = this._getMeuTimeDoMundo(estado);
        if(!timeUser) return;

        timeUser.elenco.forEach(jogador => {
            if (jogador.status === "Lesionado" && jogador.rodadasFora > 0) {
                jogador.rodadasFora--;
                if (jogador.rodadasFora <= 0) {
                    jogador.status = "Apto";
                    if (this.Sistema) this.Sistema.novaMensagem("Alta Médica", `<p>O jogador <b>${jogador.nome}</b> recebeu alta.</p>`, "dm", "DM");
                }
            }
        });
    },
    
    // Atalhos para compatibilidade com outros arquivos
    getMeuTime: function() { 
        const s = this.carregarJogo(); 
        return s ? this._getMeuTimeDoMundo(s) : null; 
    },
    
    // Método para a tela de classificação pegar qualquer tabela
    getTabelaLiga: function(pais, divisao) {
        const s = this.carregarJogo();
        if(s && s.mundo && s.mundo[pais] && s.mundo[pais][divisao]) {
            return s.mundo[pais][divisao].tabela;
        }
        return [];
    },

    // Método para pegar artilharia de uma liga
    getArtilhariaLiga: function(pais, divisao) {
        const s = this.carregarJogo();
        if(!s || !s.mundo[pais] || !s.mundo[pais][divisao]) return [];
        
        let lista = [];
        s.mundo[pais][divisao].times.forEach(t => {
            if(t.elenco) t.elenco.forEach(j => {
                if(j.gols > 0) lista.push({ nome: j.nome, time: t.nome, gols: j.gols });
            });
        });
        return lista;
    },

    // Atalhos antigos que outros arquivos chamam (wrapper)
    encontrarTime: function(nome) {
        const s = this.carregarJogo();
        // Procura no mundo todo (custoso, mas necessário pra compatibilidade)
        for(let p in s.mundo) {
            for(let d in s.mundo[p]) {
                const t = s.mundo[p][d].times.find(x => x.nome === nome);
                if(t) return t;
            }
        }
        return { nome: nome, elenco: [] };
    },

    data: { getDataAtual: function(r) { return `Rodada ${r}`; } }
};
