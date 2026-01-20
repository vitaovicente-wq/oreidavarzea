// ARQUIVO: engine-core.js
// VERSÃO: WORLD SYSTEM V2 (Final Stable)
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
            
            // Adiciona no topo da lista (unshift)
            game.mensagens.unshift({
                id: Date.now() + Math.random(),
                rodada: game.rodadaAtual,
                remetente: remetente,
                titulo: titulo,
                corpo: corpo,
                tipo: tipo, // 'dm', 'transferencia', 'financas', 'geral'
                lida: false
            });
            
            // Limita histórico a 50 mensagens para não pesar o save
            if(game.mensagens.length > 50) game.mensagens.pop();

            window.Engine.salvarJogo(game);
        },
        
        processarFinancas: function(g, ehMandante, timeAdversario) {
            const registrar = (txt, val, tp) => {
                g.financas.historico.push({ 
                    texto: txt, 
                    valor: val, 
                    tipo: tp, // 'entrada' ou 'saida'
                    rodada: g.rodadaAtual 
                });
            };

            // 1. Bilheteria (Se for mandante)
            if(ehMandante) {
                let renda = 0;
                // Tenta usar o módulo avançado de Estádios, se existir
                if(window.Engine.Estadios) {
                    const r = window.Engine.Estadios.calcularBilheteria(timeAdversario);
                    renda = r.rendaTotal;
                } else {
                    // Fallback simples se não tiver módulo de estádio
                    renda = (g.info.divisao === 'D1' ? 500000 : 100000); 
                }
                
                g.recursos.dinheiro += renda;
                registrar('Bilheteria', renda, 'entrada');
            } 
            
            // 2. Salários (Cobradas a cada 4 rodadas - Simulação Mensal)
            if(g.rodadaAtual % 4 === 0) {
                let folhaSalarial = 0;
                // Pega o time do jogador atualizado
                const timeUser = window.Engine.encontrarTime(g.info.time);
                
                if(timeUser && timeUser.elenco) {
                    timeUser.elenco.forEach(j => {
                        folhaSalarial += (j.salario || 15000);
                    });
                }
                
                g.recursos.dinheiro -= folhaSalarial;
                registrar('Salários do Elenco', -folhaSalarial, 'saida');
            }

            // 3. Custos Operacionais por jogo
            const custoOp = (g.info.divisao === 'D1') ? 50000 : 15000;
            g.recursos.dinheiro -= custoOp; 
            registrar('Custos Operacionais', -custoOp, 'saida');
        }
    },

    // =========================================================================
    // 2. SAVE & LOAD (PERSISTÊNCIA)
    // =========================================================================
    salvarJogo: function(estado) { 
        try {
            localStorage.setItem('brfutebol_save', JSON.stringify(estado)); 
        } catch (e) {
            console.error("Erro ao salvar (Quota excedida?):", e);
            alert("Erro crítico: Não foi possível salvar. Espaço cheio.");
        }
    },

    carregarJogo: function() { 
        const s = localStorage.getItem('brfutebol_save'); 
        return s ? JSON.parse(s) : null; 
    },
    
    // Busca universal (Essencial para transferências globais)
    encontrarTime: function(nomeBusca) { 
        const s = this.carregarJogo(); 
        if (!s || !s.mundo) return { nome: nomeBusca, elenco: [] };
        
        // Varredura profunda no objeto Mundo
        for(let p in s.mundo) {
            for(let d in s.mundo[p]) {
                const t = s.mundo[p][d].times.find(x => x.nome === nomeBusca);
                if(t) return t;
            }
        }
        return { nome: nomeBusca, elenco: [] }; // Retorno seguro se não achar
    },

    // =========================================================================
    // 3. INICIALIZAÇÃO (NOVO JOGO)
    // =========================================================================
    novoJogo: function(paisSelecionado, divisaoSelecionada, nomeTimeSelecionado) {
        console.log(`🌍 Engine: Criando Universo... [${nomeTimeSelecionado}]`);

        // Verificações de Dependência
        if (typeof window.Database === 'undefined') { alert("Erro Fatal: database.js não carregado."); return; }
        if (typeof CalendarioSystem === 'undefined') { alert("Erro Fatal: calendario.js não carregado."); return; }

        // Limpa lixos de saves antigos
        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        const mundo = {};

        // --- CONSTRUÇÃO DO MUNDO (Loop Global) ---
        for (const p in window.Database) {
            mundo[p] = {};
            for (const div in window.Database[p]) {
                // Clona os times para não alterar o Database original
                const timesRaw = JSON.parse(JSON.stringify(window.Database[p][div]));
                
                // Gera atributos dos jogadores se não existirem
                timesRaw.forEach(t => {
                    if (!t.elenco) t.elenco = [];
                    t.elenco.forEach((j, i) => {
                        j.uid = `${p}_${div}_${t.nome.substring(0,3).toUpperCase()}_${i}`; // ID Único
                        j.contrato = "31/12/2026";
                        if(!j.salario) j.salario = Math.floor((j.forca || 60) * 1250); // Fórmula Salarial
                        j.jogos=0; j.gols=0; j.assist=0; 
                        j.status="Apto"; j.rodadasFora=0;
                        j.moral = 100;
                    });
                });

                // Gera Calendário e Tabela Zerada para ESTA liga
                const calendario = CalendarioSystem.gerarCampeonato(timesRaw);
                const tabela = timesRaw.map(t => ({ 
                    nome: t.nome, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 
                }));

                mundo[p][div] = { times: timesRaw, calendario: calendario, tabela: tabela };
            }
        }

        // --- CONFIGURAÇÃO DO JOGADOR ---
        const ligaJogada = mundo[paisSelecionado][divisaoSelecionada];
        const meuTime = ligaJogada.times.find(t => t.nome === nomeTimeSelecionado);
        
        let orcamentoInicial = (meuTime.forca > 75) ? 15000000 : 2000000;

        const estadoInicial = {
            info: { 
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Manager", 
                time: nomeTimeSelecionado, 
                escudo: meuTime.escudo, 
                pais: paisSelecionado, 
                divisao: divisaoSelecionada 
            },
            recursos: { 
                dinheiro: orcamentoInicial, 
                moral: 100, 
                ultimaRodadaProcessada: 0 
            },
            contratos: { patrocinio: null, tv: null },
            flags: { tutorial: true },
            financas: { 
                saldo: orcamentoInicial, 
                historico: [{ texto: "Orçamento Inicial", valor: orcamentoInicial, tipo: "entrada", rodada: 0 }] 
            },
            rodadaAtual: 1,
            
            mundo: mundo, // O UNIVERSO INTEIRO AQUI
            
            // ATALHOS CRÍTICOS (Apontam para dentro do mundo)
            times: ligaJogada.times,
            calendario: ligaJogada.calendario,
            classificacao: ligaJogada.tabela, 
            
            mensagens: [] 
        };

        this.salvarJogo(estadoInicial);
        
        // Boas vindas
        if(window.Engine.Contratos) window.Engine.Contratos.enviarBoasVindas(estadoInicial);
        else this.Sistema.novaMensagem("Bem-vindo", `Você assumiu o comando do ${nomeTimeSelecionado}. Boa sorte na temporada!`, "geral");
    },

    // =========================================================================
    // 4. CORAÇÃO DA SIMULAÇÃO (ATUALIZAÇÃO)
    // =========================================================================
    atualizarTabela: function(estado) {
        if(!estado) estado = this.carregarJogo();

        // Itera sobre TODAS as ligas do mundo
        for (const p in estado.mundo) {
            for (const d in estado.mundo[p]) {
                const liga = estado.mundo[p][d];
                
                // 1. Reinicia estatísticas da tabela
                liga.tabela.forEach(t => { 
                    t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; 
                });

                // 2. Processa jogos até a rodada atual
                liga.calendario.forEach((rod, idx) => {
                    const numeroRodada = idx + 1;
                    
                    rod.jogos.forEach(jogo => {
                        const timeUser = estado.info.time;
                        // Verifica se é jogo do usuário
                        const ehJogoUser = (jogo.mandante === timeUser || jogo.visitante === timeUser);
                        
                        // SIMULAÇÃO DA CPU:
                        // Se não foi jogado, não é jogo do usuário, e a rodada já passou ou é agora
                        if (!jogo.jogado && !ehJogoUser && numeroRodada <= estado.rodadaAtual) {
                            this._simularJogoCPU(liga, jogo);
                        }

                        // COMPUTAR PONTOS (Se já tiver placar)
                        if (jogo.jogado) {
                            this._computarTabela(liga.tabela, jogo);
                            this._computarArtilharia(liga.times, jogo);
                        }
                    });
                });

                // 3. Ordenação da Tabela (Pontos > Vitórias > SG > GP)
                liga.tabela.sort((a,b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg || b.gp - a.gp);
            }
        }

        // --- PÓS-PROCESSAMENTO DA RODADA DO JOGADOR ---
        
        // Atualiza os ponteiros (atalhos) caso tenha mudado algo
        const p = estado.info.pais;
        const d = estado.info.divisao;
        estado.classificacao = estado.mundo[p][d].tabela;
        estado.times = estado.mundo[p][d].times;

        // Lógica de "Fim de Rodada" (só roda uma vez quando a rodada vira)
        const rodadaJogada = estado.rodadaAtual - 1;
        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            
            // 1. Recuperação Física/Lesão
            this._processarRecuperacaoElencos(estado);
            
            // 2. Finanças do jogo
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
    // 5. MÉTODOS AUXILIARES (SIMULAÇÃO)
    // =========================================================================
    
    // Simula partida entre dois times da CPU
    _simularJogoCPU: function(liga, jogo) {
        const tC = liga.times.find(t => t.nome === jogo.mandante) || {forca:60};
        const tF = liga.times.find(t => t.nome === jogo.visitante) || {forca:60};
        
        // Fator Aleatório + Força + Vantagem Casa (5 pts)
        const forcaCasa = (tC.forca || 60) + 5 + (Math.random() * 10);
        const forcaFora = (tF.forca || 60) + (Math.random() * 10);
        
        const diff = forcaCasa - forcaFora;
        let gc=0, gf=0;

        // Lógica de placar baseada na diferença
        if(diff > 15) { // Massacre casa
            gc = Math.floor(Math.random()*4)+1; gf = Math.floor(Math.random()*1); 
        } else if(diff > 5) { // Vitória casa
            gc = Math.floor(Math.random()*3)+1; gf = Math.floor(Math.random()*2);
        } else if(diff < -15) { // Massacre fora
            gc = Math.floor(Math.random()*1); gf = Math.floor(Math.random()*4)+1;
        } else if (diff < -5) { // Vitória fora
            gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*3)+1;
        } else { // Equilíbrio/Empate
            gc = Math.floor(Math.random()*2); gf = Math.floor(Math.random()*2);
        }

        // Evita empates em mata-mata (se implementarmos copa futuramente)
        // Por enquanto, aceita empate.
        
        jogo.placarCasa = gc; 
        jogo.placarFora = gf; 
        jogo.jogado = true;
    },

    // Soma os pontos na tabela
    _computarTabela: function(tab, jogo) {
        const c = tab.find(t=>t.nome===jogo.mandante);
        const f = tab.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return;

        const gc = parseInt(jogo.placarCasa);
        const gf = parseInt(jogo.placarFora);

        c.j++; f.j++; 
        c.gp+=gc; f.gp+=gf; 
        c.gc+=gf; f.gc+=gc; 
        c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        
        if(gc > gf) { c.v++; c.pts+=3; f.d++; }
        else if (gf > gc) { f.v++; f.pts+=3; c.d++; }
        else { c.e++; f.e++; c.pts++; f.pts++; }
    },

    // Distribui gols aleatoriamente para jogadores de ataque/meio
    _computarArtilharia: function(times, jogo) {
        if(jogo.artilhariaComputada) return;
        
        const distribuir = (nomeTime, qtd) => {
            if(qtd <= 0) return;
            const time = times.find(t => t.nome === nomeTime);
            if(!time || !time.elenco.length) return;
            
            // Preferência para Atacantes (peso 3) e Meias (peso 1)
            let pool = [];
            time.elenco.forEach(j => {
                if(j.pos === 'ATA') { pool.push(j); pool.push(j); pool.push(j); }
                else if(j.pos === 'MEI') { pool.push(j); }
            });
            // Se não tiver atacante/meia, usa todo mundo
            if(pool.length === 0) pool = time.elenco;

            for(let i=0; i<qtd; i++) {
                const sortudo = pool[Math.floor(Math.random() * pool.length)];
                sortudo.gols = (sortudo.gols || 0) + 1;
            }
        };
        
        distribuir(jogo.mandante, parseInt(jogo.placarCasa));
        distribuir(jogo.visitante, parseInt(jogo.placarFora));
        jogo.artilhariaComputada = true;
    },

    // Recupera lesionados (apenas do time do jogador para performance)
    _processarRecuperacaoElencos: function(estado) {
        const timeUser = estado.times.find(t => t.nome === estado.info.time);
        if(timeUser) {
            timeUser.elenco.forEach(j => {
                if(j.status === 'Lesionado' && j.rodadasFora > 0) {
                    j.rodadasFora--;
                    if(j.rodadasFora <= 0) {
                        j.status = 'Apto';
                        this.Sistema.novaMensagem("Departamento Médico", `O atleta ${j.nome} recuperou-se da lesão e está pronto para jogar.`, "dm");
                    }
                }
            });
        }
    },

    // =========================================================================
    // 6. GETTERS (USO NO FRONT-END)
    // =========================================================================
    getTabelaLiga: function(p, d) {
        const s = this.carregarJogo();
        return (s && s.mundo && s.mundo[p]) ? s.mundo[p][d].tabela : [];
    },
    
    getArtilhariaLiga: function(p, d) {
        const s = this.carregarJogo();
        if(!s || !s.mundo[p]) return [];
        let lista = [];
        
        // Varre todos os times daquela divisão
        s.mundo[p][d].times.forEach(t => {
            t.elenco.forEach(j => {
                if(j.gols > 0) lista.push({
                    nome: j.nome, 
                    time: t.nome, 
                    gols: j.gols,
                    pos: j.pos,
                    forca: j.forca
                }); 
            });
        });
        
        // Ordena por gols
        return lista.sort((a,b) => b.gols - a.gols).slice(0, 20); // Top 20
    }
};
