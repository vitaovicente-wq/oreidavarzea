// ARQUIVO: engine-core.js
// Responsável por: Inicialização, Save/Load e Loop Principal

window.Engine = {
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

    // --- INICIALIZAÇÃO DO NOVO JOGO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando Core: ${nomeTimeSelecionado}`);
        
        if (typeof CalendarioSystem === 'undefined') { 
            alert("ERRO CRÍTICO: calendario.js não carregado."); 
            return; 
        }

        // Limpa dados antigos
        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        // Carrega Times
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
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
        
        // Define Orçamento
        const meuTime = timesDaLiga.find(t => t.nome === nomeTimeSelecionado);
        let somaOvr = 0;
        if(meuTime && meuTime.elenco.length > 0) meuTime.elenco.forEach(j => somaOvr += j.forca);
        const mediaOvr = meuTime.elenco.length > 0 ? Math.floor(somaOvr / meuTime.elenco.length) : 60;
        
        let orcamento = 2000000;
        if (mediaOvr > 90) orcamento = 15000000;
        else if (mediaOvr > 80) orcamento = 10000000;
        else if (mediaOvr > 70) orcamento = 6000000;
        else if (mediaOvr > 65) orcamento = 3500000;

        // Cria Estado Inicial
        const estado = {
            info: { tecnico: localStorage.getItem('brfutebol_tecnico')||"Manager", time: nomeTimeSelecionado, escudo: localStorage.getItem('brfutebol_escudo'), divisao, dataInicio: new Date().getTime() },
            recursos: { dinheiro: orcamento, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false, patroEnviado: false, tvEnviado: false },
            financas: { saldo: orcamento, historico: [{ texto: "Aporte Inicial", valor: orcamento, tipo: "entrada" }] },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendario,
            classificacao: classificacao,
            jogadoresStatus: {},
            mensagens: [] 
        };

        this.salvarJogo(estado);
        
        // --- PROTEÇÃO DE ENVIO DE MENSAGEM ---
        // Espera 100ms para garantir que o engine-contratos.js foi lido pelo navegador
        setTimeout(() => {
            if(window.Engine && window.Engine.Contratos) {
                // Recarrega o jogo para garantir que estamos mexendo no save atualizado
                const saveAtual = window.Engine.carregarJogo();
                window.Engine.Contratos.enviarBoasVindas(saveAtual);
                console.log("✅ E-mail de boas vindas enviado.");
            } else {
                console.error("❌ ERRO: O módulo de Contratos não foi encontrado.");
            }
        }, 100);
    },

    // --- ATUALIZAÇÃO DE RODADA ---
    atualizarTabela: function(estado) {
        const tab = estado.classificacao;
        tab.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });
        
        estado.calendario.forEach(rod => {
            rod.jogos.forEach(jogo => { if(jogo.jogado) this._computar(tab, jogo); });
        });
        
        tab.sort((a,b) => b.pts - a.pts || b.sg - a.sg);

        const rIdx = estado.rodadaAtual - 1;
        if(estado.calendario[rIdx]) {
            const jogo = estado.calendario[rIdx].jogos.find(j => j.mandante === estado.info.time || j.visitante === estado.info.time);
            
            if(jogo && jogo.jogado && estado.recursos.ultimaRodadaProcessada !== estado.rodadaAtual) {
                const mandante = jogo.mandante === estado.info.time;
                const adv = mandante ? jogo.visitante : jogo.mandante;
                
                // Chama módulos apenas se existirem (Segurança)
                if(this.Sistema) this.Sistema.processarFinancas(estado, mandante, adv);
                if(this.Eventos) this.Eventos.processarEventosRodada(estado);
                if(this.Mercado) {
                    this.Mercado.atualizarListaTransferencias(estado);
                    this.Mercado.simularDispensasCPU(estado);
                }
                
                // Processa Vencimentos de Contratos
                if(this.Contratos && this.Contratos.processarVencimentos) {
                    this.Contratos.processarVencimentos(estado);
                    
                    // Dispara renovação se ficou sem
                    if (!estado.flags.patroEnviado && !estado.contratos.patrocinio) {
                        this.Contratos.liberarOfertasPatrocinio();
                    }
                    if (!estado.flags.tvEnviado && !estado.contratos.tv) {
                        this.Contratos.liberarOfertasTV();
                    }
                }

                estado.recursos.ultimaRodadaProcessada = estado.rodadaAtual;
            }
        }
        this.salvarJogo(estado);
        return tab;
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

    Sistema: {
        novaMensagem: function(titulo, corpo, tipo, remetente="Sistema") {
            const game = window.Engine.carregarJogo();
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
        },
        processarFinancas: function(g, mand, adv) {
            if(mand && window.Engine.Estadios) {
                const r = window.Engine.Estadios.calcularBilheteria(adv);
                g.recursos.dinheiro += r.rendaTotal;
                g.financas.historico.push({texto:'Bilheteria', valor:r.rendaTotal, tipo:'entrada'});
            }
            if(g.rodadaAtual%4===0) {
                if(g.contratos.patrocinio) {
                    g.recursos.dinheiro += g.contratos.patrocinio.mensal;
                    g.financas.historico.push({texto:'Patrocínio', valor:g.contratos.patrocinio.mensal, tipo:'entrada'});
                }
                if(g.contratos.tv) {
                    g.recursos.dinheiro += g.contratos.tv.fixo;
                    g.financas.historico.push({texto:'Cota TV', valor:g.contratos.tv.fixo, tipo:'entrada'});
                }
                let folha = 0;
                const time = g.times.find(t=>t.nome===g.info.time);
                if(time) time.elenco.forEach(j=>folha+=j.salario);
                g.recursos.dinheiro -= folha;
                g.financas.historico.push({texto:'Salários', valor:-folha, tipo:'saida'});
            }
            g.recursos.dinheiro -= 50000;
            g.financas.historico.push({texto:'Custos Jogo', valor:-50000, tipo:'saida'});
        }
    },
    
    data: { getDataAtual: function(r) { return `Rodada ${r}`; } }
};
