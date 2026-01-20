// ARQUIVO: engine-core.js
// VERSÃO: WORLD SYSTEM (Mundo Real + Artilharia + Finanças + Correções)

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
                
                // Salários (Pega do elenco atual)
                let folha = 0;
                const meuTime = window.Engine.encontrarTime(g.info.time);
                if(meuTime && meuTime.elenco) meuTime.elenco.forEach(j => folha += (j.salario || 10000));
                
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
    
    // Busca time em qualquer lugar (compatibilidade)
    encontrarTime: function(nome) { 
        const s = this.carregarJogo(); 
        if (!s) return { nome: nome, elenco: [] };
        
        // Tenta na liga atual primeiro (mais rápido)
        if (s.times) {
            const t = s.times.find(x => x.nome === nome);
            if (t) return t;
        }
        
        // Se tiver mundo expandido, procura lá
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
    
    getMeuTime: function() { 
        const s = this.carregarJogo(); 
        return s ? this.encontrarTime(s.info.time) : null; 
    },

    // --- INICIALIZAÇÃO (NOVO JOGO GLOBAL) ---
    novoJogo: function(paisSelecionado, divisaoSelecionada, nomeTimeSelecionado) {
        console.log(`🌍 Iniciando Universo Global: ${nomeTimeSelecionado} [${paisSelecionado}]`);
        
        if (typeof CalendarioSystem === 'undefined') { alert("Erro: calendario.js ausente"); return; }

        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        // 1. ESTRUTURA DO MUNDO
        const mundo = {};

        // Varre o Database e cria todas as ligas reais
        for (const p in window.Database) {
            mundo[p] = {};
            for (const div in window.Database[p]) {
                // Clona os times do DB
                const timesRaw = JSON.parse(JSON.stringify(window.Database[p][div]));
                
                // Inicializa jogadores
                timesRaw.forEach(t => {
                    if (!t.elenco) t.elenco = [];
                    t.elenco.forEach((j, i) => {
                        if (!j.uid) j.uid = `${p}_${div}_${t.nome.substring(0,3)}_${i}_${Date.now()}`;
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
            }
        }

        // 2. Configura o Jogador
        // Pega a liga escolhida
        if (!mundo[paisSelecionado] || !mundo[paisSelecionado][divisaoSelecionada]) {
            alert("Erro Fatal: Liga não encontrada no Database. Verifique o arquivo database.js");
            return;
        }

        const ligaDoJogador = mundo[paisSelecionado][divisaoSelecionada];
        const meuTime = ligaDoJogador.times.find(t => t.nome === nomeTimeSelecionado);
        
        if (!meuTime) {
            alert("Erro Fatal: Time não encontrado na liga.");
            return;
        }

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
            
            mundo: mundo, // O UNIVERSO INTEIRO
            times: ligaDoJogador.times, // ATALHO para a liga atual (evita quebrar outras telas)
            calendario: ligaDoJogador.calendario, // ATALHO calendário atual
            classificacao: ligaDoJogador.tabela, // ATALHO tabela atual
            
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

    // --- ATUALIZAÇÃO GLOBAL (SIMULA O MUNDO) ---
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
                    
                    rod.jogos.forEach(jogo => {
                        // Se for jogo do usuário, só conta se já foi jogado
                        const timeUser = estado.info.time;
                        const ehJogoUser = (jogo.mandante === timeUser || jogo.visitante === timeUser);
                        
                        // SIMULAÇÃO: Se for CPU x CPU de uma rodada que JÁ PASSOU ou é AGORA, simula
                        if (!jogo.jogado && !ehJogoUser && numeroRodada <= estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        // Computa pontos e gols
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

        // --- EVENTOS DA EQUIPE DO JOGADOR ---
        const rodadaJogada = estado.rodadaAtual - 1;
        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            
            // Finanças (apenas jogos do usuário)
            const jogoUser = estado.calendario[rodadaJogada-1].jogos.find(j => j.mandante === estado.info.time || j.visitante === estado.info.time);
            if(jogoUser) {
                const mandante = jogoUser.mandante === estado.info.time;
                const adv = mandante ? jogoUser.visitante : jogoUser.mandante;
                const timeAdv = estado.times.find(t => t.nome === adv) || {forca:60};
                if(this.Sistema) this.Sistema.processarFinancas(estado, mandante, timeAdv);
            }

            this._processarRecuperacaoElencos(estado); // Lesões
            
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

        // Sincroniza Atalhos (Garante que estado.classificacao = estado.mundo[pais][div].tabela)
        const p = estado.info.pais; 
        const d = estado.info.divisao;
        estado.classificacao = estado.mundo[p][d].tabela;
        estado.calendario = estado.mundo[p][d].calendario;
        estado.times = estado.mundo[p][d].times;

        this.salvarJogo(estado);
        return estado.classificacao;
    },

    // SIMULAÇÃO RÁPIDA (CPU vs CPU)
    _simularJogoCPU: function(liga, jogo) {
        const timeC = liga.times.find(t => t.nome === jogo.mandante) || {forca:60};
        const timeF = liga.times.find(t => t.nome === jogo.visitante) || {forca:60};

        // Fator Casa + Aleatório + Diferença de Força
        const forcaC = (timeC.forca || 60) + 5 + (Math.random() * 10);
        const forcaF = (timeF.forca || 60) + (Math.random() * 10);

        let gc = 0, gf = 0;
        const diff = forcaC - forcaF;
        
        if (diff > 15) { gc = Math.floor(Math.random()*4)+1; gf = Math.floor(Math.random()*1); }
        else if (diff > 5) { gc = Math.floor(Math.random()*3)+1; gf = Math.floor(Math.random()*2); }
        else if (diff < -15) { gc = Math.floor(Math.random()*1); gf = Math.floor(Math.random()*4)+1; }
        else if (diff < -5) { gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*3)+1; }
        else { gc = Math.floor(Math.random()*3); gf = Math.floor(Math.random()*3); } 

        jogo.placarCasa = gc;
        jogo.placarFora = gf;
        jogo.jogado = true;
    },

    // COMPUTAR PONTOS
    _computarPontos: function(tabela, jogo) {
        const c = tabela.find(t=>t.nome===jogo.mandante); 
        const f = tabela.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return; 
        
        const gc=parseInt(jogo.placarCasa); 
        const gf=parseInt(jogo.placarFora);
        
        c.j++; f.j++; c.gp+=gc; f.gp+=gf; c.gc+=gf; f.gc+=gc; c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        if(gc>gf){c.v++; c.pts+=3; f.d++;} else if(gf>gc){f.v++; f.pts+=3; c.d++;} else{c.e++; f.e++; c.pts++; f.pts++;}
    },

    // ARTILHARIA
    _processarArtilharia: function(listaTimes, jogo) {
        if(jogo.artilhariaComputada) return;

        const distribuir = (nomeTime, qtdGols) => {
            if(qtdGols <= 0) return;
            const time = listaTimes.find(t => t.nome === nomeTime);
            if(!time || !time.elenco || !time.elenco.length) return; 

            const aptos = time.elenco.filter(j => j.status !== 'Lesionado');
            if(aptos.length === 0) return;

            for(let i=0; i < qtdGols; i++) {
                // Sorteio ponderado pela Força (Craques fazem mais gols)
                let totalForca = 0;
                aptos.forEach(j => totalForca += (j.forca || 50));
                let random = Math.random() * totalForca;
                let cursor = 0;
                let artilheiro = aptos[0];

                for(const j of aptos) {
                    cursor += (j.forca || 50);
                    if(cursor >= random) { artilheiro = j; break; }
                }
                artilheiro.gols = (artilheiro.gols || 0) + 1;
            }
        };

        distribuir(jogo.mandante, parseInt(jogo.placarCasa));
        distribuir(jogo.visitante, parseInt(jogo.placarFora));
        jogo.artilhariaComputada = true;
    },

    // RECUPERAÇÃO DE LESÃO (Apenas elenco do usuário para performance)
    _processarRecuperacaoElencos: function(estado) {
        const timeUser = estado.times.find(t => t.nome === estado.info.time);
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

    // MÉTODOS DE ACESSO GLOBAL (Para a tela de Classificação)
    getTabelaLiga: function(pais, divisao) {
        const s = this.carregarJogo();
        if(s && s.mundo && s.mundo[pais] && s.mundo[pais][divisao]) {
            return s.mundo[pais][divisao].tabela;
        }
        return [];
    },

    getArtilhariaLiga: function(pais, divisao) {
        const s = this.carregarJogo();
        if(!s || !s.mundo || !s.mundo[pais] || !s.mundo[pais][divisao]) return [];
        
        let lista = [];
        s.mundo[pais][divisao].times.forEach(t => {
            if(t.elenco) t.elenco.forEach(j => {
                if(j.gols > 0) lista.push({ nome: j.nome, time: t.nome, gols: j.gols });
            });
        });
        return lista;
    },

    data: { getDataAtual: function(r) { return `Rodada ${r}`; } }
};
