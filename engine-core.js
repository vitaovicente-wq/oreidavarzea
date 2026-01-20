// ARQUIVO: engine-core.js
// VERSÃO: WORLD SYSTEM V2 (Correção de Pontuação + Universo Global)

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
                // ... (lógica de salários mantida simplificada para economizar espaço visual) ...
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

    // --- SAVE & LOAD ---
    salvarJogo: function(estado) { localStorage.setItem('brfutebol_save', JSON.stringify(estado)); },
    carregarJogo: function() { const s = localStorage.getItem('brfutebol_save'); return s ? JSON.parse(s) : null; },
    
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

    // --- INICIALIZAÇÃO ---
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

        // 2. Define Atalhos para a Liga do Jogador
        const ligaJogada = mundo[paisSelecionado][divisaoSelecionada];
        const meuTime = ligaJogada.times.find(t => t.nome === nomeTimeSelecionado);
        
        let orcamento = 2000000; // Lógica simplificada
        if (meuTime.forca > 80) orcamento = 10000000;

        const estado = {
            info: { tecnico: localStorage.getItem('brfutebol_tecnico')||"Manager", time: nomeTimeSelecionado, escudo: meuTime.escudo, pais: paisSelecionado, divisao: divisaoSelecionada },
            recursos: { dinheiro: orcamento, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false },
            financas: { saldo: orcamento, historico: [{ texto: "Inicial", valor: orcamento, tipo: "entrada", rodada: 0 }] },
            rodadaAtual: 1,
            
            mundo: mundo, // O MUNDO INTEIRO
            
            // ATALHOS CRÍTICOS (Para funcionar nas outras telas)
            // Eles apontam para o MESMO objeto da memória do mundo
            times: ligaJogada.times,
            calendario: ligaJogada.calendario,
            classificacao: ligaJogada.tabela, 
            
            mensagens: [] 
        };

        this.salvarJogo(estado);
        if(window.Engine.Contratos) window.Engine.Contratos.enviarBoasVindas(this.carregarJogo());
    },

    // --- CORAÇÃO DO JOGO: ATUALIZAR TUDO ---
    atualizarTabela: function(estado) {
        // Varre CADA liga do mundo e recalcula
        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const liga = estado.mundo[p][d];
                
                // 1. Zera a tabela desta liga
                liga.tabela.forEach(t => { 
                    t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; 
                });

                // 2. Lê o calendário desta liga
                liga.calendario.forEach((rod, idx) => {
                    const numeroRodada = idx + 1;
                    
                    rod.jogos.forEach(jogo => {
                        // Simula CPU x CPU se for rodada passada e não jogou
                        const timeUser = estado.info.time;
                        const ehJogoUser = (jogo.mandante === timeUser || jogo.visitante === timeUser);
                        
                        // Se não foi jogado e é rodada velha/atual, a CPU joga agora
                        if (!jogo.jogado && !ehJogoUser && numeroRodada <= estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        // Se foi jogado (pelo user ou CPU), conta ponto
                        if (jogo.jogado) {
                            this._computar(liga.tabela, jogo);
                            this._processarArtilharia(liga.times, jogo);
                        }
                    });
                });

                // 3. Ordena
                liga.tabela.sort((a,b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp);
            }
        }

        // Sincroniza os atalhos do save para a liga atual do jogador
        const p = estado.info.pais;
        const d = estado.info.divisao;
        estado.classificacao = estado.mundo[p][d].tabela;
        estado.calendario = estado.mundo[p][d].calendario;
        estado.times = estado.mundo[p][d].times;

        // Processos de fim de rodada do jogador (Lesão, $$)
        const rodadaJogada = estado.rodadaAtual - 1;
        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            this._processarRecuperacaoElencos(estado);
            
            // Finanças do jogo específico da rodada
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

    // Auxiliares
    _simularJogoCPU: function(liga, jogo) {
        const tC = liga.times.find(t => t.nome === jogo.mandante) || {forca:60};
        const tF = liga.times.find(t => t.nome === jogo.visitante) || {forca:60};
        
        // Simulação baseada em força
        const diff = (tC.forca || 60) - (tF.forca || 60) + 5; // +5 vantagem casa
        let gc=0, gf=0;

        if(diff > 10) { gc = Math.floor(Math.random()*3)+1; gf = Math.floor(Math.random()*1); }
        else if(diff < -10) { gc = Math.floor(Math.random()*1); gf = Math.floor(Math.random()*3)+1; }
        else { gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*2); }

        jogo.placarCasa = gc; 
        jogo.placarFora = gf; 
        jogo.jogado = true;
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
        if(jogo.artilhariaComputada) return;
        
        const distribuir = (nomeTime, qtd) => {
            const time = times.find(t => t.nome === nomeTime);
            if(!time || !time.elenco.length) return;
            const pool = time.elenco.filter(j => j.pos === 'ATA' || j.pos === 'MEI');
            const cobradores = pool.length ? pool : time.elenco;
            
            for(let i=0; i<qtd; i++) {
                const j = cobradores[Math.floor(Math.random() * cobradores.length)];
                j.gols = (j.gols || 0) + 1;
            }
        };
        distribuir(jogo.mandante, parseInt(jogo.placarCasa));
        distribuir(jogo.visitante, parseInt(jogo.placarFora));
        jogo.artilhariaComputada = true;
    },

    _processarRecuperacaoElencos: function(estado) {
        // Recupera apenas do time do jogador para performance
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
        s.mundo[p][d].times.forEach(t => t.elenco.forEach(j => { if(j.gols>0) l.push({nome:j.nome, time:t.nome, gols:j.gols}); }));
        return l;
    }
};
