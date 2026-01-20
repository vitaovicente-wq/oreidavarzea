// ARQUIVO: engine-core.js
// VERSÃO: COMPLETA (Finanças + Treino + Lesão + Artilharia + PAÍSES)

window.Engine = {
    // --- SISTEMA (Prioridade Alta) ---
    Sistema: {
        novaMensagem: function(titulo, corpo, tipo, remetente="Sistema") {
            console.log(`📩 Enviando mensagem: ${titulo}`);
            
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
            
            window.Engine.salvarJogo(game);
            console.log("✅ Mensagem salva no disco.");
        },
        
        processarFinancas: function(g, mand, adv) {
            // Registrar com DATA (Rodada)
            const registrar = (txt, val, tp) => {
                g.financas.historico.push({
                    texto: txt, 
                    valor: val, 
                    tipo: tp, 
                    rodada: g.rodadaAtual
                });
            };

            // Bilheteria (Se houver módulo de estádio)
            if(mand && window.Engine.Estadios) {
                const r = window.Engine.Estadios.calcularBilheteria(adv);
                g.recursos.dinheiro += r.rendaTotal;
                registrar('Bilheteria', r.rendaTotal, 'entrada');
            } 
            
            // Custos Mensais (A cada 4 rodadas)
            if(g.rodadaAtual % 4 === 0) {
                if(g.contratos.patrocinio) {
                    g.recursos.dinheiro += g.contratos.patrocinio.mensal;
                    registrar('Patrocínio', g.contratos.patrocinio.mensal, 'entrada');
                }
                if(g.contratos.tv) {
                    g.recursos.dinheiro += g.contratos.tv.fixo;
                    registrar('Cota TV', g.contratos.tv.fixo, 'entrada');
                }
                
                let folha = 0;
                const time = g.times.find(t => t.nome === g.info.time);
                if(time) time.elenco.forEach(j => folha += (j.salario || 10000));
                
                g.recursos.dinheiro -= folha;
                registrar('Salários', -folha, 'saida');
            }
            
            // Custo por jogo
            g.recursos.dinheiro -= 50000;
            registrar('Custos Operacionais', -50000, 'saida');
        }
    },

    // --- SAVE & LOAD ---
    salvarJogo: function(estado) { 
        localStorage.setItem('brfutebol_save', JSON.stringify(estado)); 
    },
    
    carregarJogo: function() { 
        const s = localStorage.getItem('brfutebol_save'); 
        return s ? JSON.parse(s) : null; 
    },
    
    encontrarTime: function(nome) { 
        const s = this.carregarJogo(); 
        if (!s) return { nome: nome, elenco: [] };
        return s.times.find(t => t.nome === nome) || {nome, elenco:[]}; 
    },
    
    getMeuTime: function() { 
        const s = this.carregarJogo(); 
        return s ? this.encontrarTime(s.info.time) : null; 
    },

    // --- INICIALIZAÇÃO (ATUALIZADA COM PAÍS) ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando Core: ${nomeTimeSelecionado} [${pais}]`);
        
        if (typeof CalendarioSystem === 'undefined') { 
            alert("ERRO CRÍTICO: calendario.js não carregado."); 
            return; 
        }

        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        // Carrega Times do PAÍS CORRETO
        let timesDaLiga = [];
        if (window.Database && window.Database[pais] && window.Database[pais][divisao]) {
            // Clona para não alterar o original
            timesDaLiga = JSON.parse(JSON.stringify(window.Database[pais][divisao]));
        } else {
            console.warn("Liga não encontrada, gerando genéricos...");
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // Configura Jogadores
        const DATA_FIM = "31/12/2026";
        timesDaLiga.forEach(t => {
            if (!t.elenco) t.elenco = [];
            t.elenco.forEach((j, i) => {
                if (!j.uid) j.uid = `start_${t.nome.substring(0,3)}_${i}_${Date.now()}`;
                j.contrato = DATA_FIM;
                if (!j.salario) j.salario = (j.forca || 60) * 1500;
                j.jogos=0; j.gols=0; j.status="Apto"; j.rodadasFora=0;
            });
        });

        // Gera Calendário
        const calendario = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacao = timesDaLiga.map(t => ({ nome: t.nome, escudo: t.escudo, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 }));
        
        // Orçamento
        const meuTime = timesDaLiga.find(t => t.nome === nomeTimeSelecionado);
        let somaOvr = 0;
        if(meuTime && meuTime.elenco.length > 0) meuTime.elenco.forEach(j => somaOvr += j.forca);
        const mediaOvr = meuTime.elenco.length > 0 ? Math.floor(somaOvr / meuTime.elenco.length) : 60;
        
        // Ajuste de Orçamento por País (Europa é mais rica)
        const fatorMoeda = (pais === 'brasil') ? 1 : 5;
        let orcamento = 2000000;
        
        if (mediaOvr > 90) orcamento = 15000000 * fatorMoeda;
        else if (mediaOvr > 80) orcamento = 10000000 * fatorMoeda;
        else if (mediaOvr > 70) orcamento = 6000000 * fatorMoeda;
        else if (mediaOvr > 65) orcamento = 3500000 * fatorMoeda;

        // Estado Inicial
        const estado = {
            info: { 
                tecnico: localStorage.getItem('brfutebol_tecnico')||"Manager", 
                time: nomeTimeSelecionado, 
                escudo: localStorage.getItem('brfutebol_escudo'), 
                pais: pais, // Salva o país
                divisao: divisao, 
                dataInicio: new Date().getTime() 
            },
            recursos: { dinheiro: orcamento, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false, patroEnviado: false, tvEnviado: false, treinoAtual: 'balanceado' },
            financas: { saldo: orcamento, historico: [{ texto: "Aporte Inicial", valor: orcamento, tipo: "entrada", rodada: 0 }] },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendario,
            classificacao: classificacao,
            jogadoresStatus: {},
            mensagens: [] 
        };

        this.salvarJogo(estado);
        
        // Proteção envio mensagem
        setTimeout(() => {
            if(window.Engine && window.Engine.Contratos) {
                const saveAtual = window.Engine.carregarJogo();
                window.Engine.Contratos.enviarBoasVindas(saveAtual);
            }
        }, 200);
    },

    // --- ATUALIZAÇÃO DE RODADA ---
    atualizarTabela: function(estado) {
        // 1. Recalcula tabela
        const tab = estado.classificacao;
        tab.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });
        
        // Processa todos os jogos jogados
        estado.calendario.forEach(rod => {
            rod.jogos.forEach(jogo => { 
                if(jogo.jogado) {
                    this._computar(tab, jogo); 
                    // Distribui os gols para os jogadores
                    this._processarArtilharia(estado, jogo);
                }
            });
        });
        
        tab.sort((a,b) => b.pts - a.pts || b.sg - a.sg);

        // 2. Eventos da Rodada
        const rodadaJogada = estado.rodadaAtual - 1;

        if(rodadaJogada > 0 && estado.recursos.ultimaRodadaProcessada < rodadaJogada) {
            
            // A. Recuperação de Lesões
            this._processarRecuperacaoElencos(estado);

            const indexArray = rodadaJogada - 1;
            
            if(estado.calendario[indexArray]) {
                const jogo = estado.calendario[indexArray].jogos.find(j => j.mandante === estado.info.time || j.visitante === estado.info.time);
                
                if(jogo) {
                    const mandante = jogo.mandante === estado.info.time;
                    const adv = mandante ? jogo.visitante : jogo.mandante;
                    
                    // B. Finanças
                    if(this.Sistema) this.Sistema.processarFinancas(estado, mandante, adv);
                }

                // C. Eventos Aleatórios
                if(this.Eventos) this.Eventos.processarEventosRodada(estado);
                
                // D. Mercado
                if(this.Mercado) {
                    this.Mercado.atualizarListaTransferencias(estado);
                    this.Mercado.simularDispensasCPU(estado);
                }
                
                // E. Contratos
                if(this.Contratos && this.Contratos.processarVencimentos) {
                    this.Contratos.processarVencimentos(estado);
                    if (!estado.flags.patroEnviado && !estado.contratos.patrocinio) this.Contratos.liberarOfertasPatrocinio();
                    if (!estado.flags.tvEnviado && !estado.contratos.tv) this.Contratos.liberarOfertasTV();
                }

                estado.recursos.ultimaRodadaProcessada = rodadaJogada;
            }
        }

        // 3. Sincronização de Mensagens
        const versaoDisco = this.carregarJogo();
        if(versaoDisco && versaoDisco.mensagens && versaoDisco.mensagens.length > estado.mensagens.length) {
            console.log("🔄 Sincronizando mensagens do disco...");
            estado.mensagens = versaoDisco.mensagens;
        }

        this.salvarJogo(estado);
        return tab;
    },

    // Distribui gols para os jogadores
    _processarArtilharia: function(estado, jogo) {
        if(jogo.artilhariaComputada) return;

        const distribuir = (nomeTime, qtdGols) => {
            if(qtdGols <= 0) return;
            const time = estado.times.find(t => t.nome === nomeTime);
            if(!time) return;

            const aptos = time.elenco.filter(j => j.status !== 'Lesionado');
            if(aptos.length === 0) return;

            for(let i=0; i < qtdGols; i++) {
                let totalForca = 0;
                aptos.forEach(j => totalForca += (j.forca || 50));
                
                let random = Math.random() * totalForca;
                let cursor = 0;
                let artilheiro = aptos[0];

                for(const j of aptos) {
                    cursor += (j.forca || 50);
                    if(cursor >= random) {
                        artilheiro = j;
                        break;
                    }
                }
                artilheiro.gols = (artilheiro.gols || 0) + 1;
            }
        };

        distribuir(jogo.mandante, parseInt(jogo.placarCasa));
        distribuir(jogo.visitante, parseInt(jogo.placarFora));

        jogo.artilhariaComputada = true;
    },

    // Recuperação de Lesões
    _processarRecuperacaoElencos: function(estado) {
        estado.times.forEach(time => {
            time.elenco.forEach(jogador => {
                if (jogador.status === "Lesionado" && jogador.rodadasFora > 0) {
                    jogador.rodadasFora--;
                    if (jogador.rodadasFora <= 0) {
                        jogador.status = "Apto";
                        jogador.rodadasFora = 0;
                        if (time.nome === estado.info.time && this.Sistema) {
                            this.Sistema.novaMensagem("Alta Médica", `<p>O jogador <b>${jogador.nome}</b> recebeu alta do Dr. Tairo.</p>`, "dm", "DM");
                        }
                    }
                }
            });
        });
    },

    _computar: function(tab, jogo) {
        const c = tab.find(t=>t.nome===jogo.mandante); 
        const f = tab.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return;
        
        const gc=parseInt(jogo.placarCasa); 
        const gf=parseInt(jogo.placarFora);
        
        c.j++; f.j++; c.gp+=gc; f.gp+=gf; c.gc+=gf; f.gc+=gc; c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        if(gc>gf){c.v++; c.pts+=3; f.d++;} else if(gf>gc){f.v++; f.pts+=3; c.d++;} else{c.e++; f.e++; c.pts++; f.pts++;}
    },

    _gerarTimesGenericos: function(div) { 
        let l=[]; 
        for(let i=1;i<=20;i++) l.push({nome:`Time ${i}`, forca:50, elenco:[]}); 
        return l; 
    },
    
    data: { getDataAtual: function(r) { return `Rodada ${r}`; } }
};
