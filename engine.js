// ARQUIVO: engine.js (V11.4 - CORREÇÃO DEFINITIVA DE FLUXO DE MENSAGENS)

const Engine = {
    
    // --- 1. INICIALIZAÇÃO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando: ${nomeTimeSelecionado}`);

        if (typeof CalendarioSystem === 'undefined') { alert("ERRO: calendario.js ausente."); return; }

        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        const DATA_FIM_PADRAO = "31/12/2026";
        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
            t.elenco.forEach((j, i) => {
                if (!j.uid) j.uid = `start_${t.nome.substring(0,3)}_${i}_${Date.now()}`;
                j.contrato = DATA_FIM_PADRAO;
                if (!j.salario) j.salario = (j.forca || 60) * 1500;
                j.jogos = 0; j.gols = 0; j.status = "Apto"; j.rodadasFora = 0;
            });
        });

        const calendario = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacao = timesDaLiga.map(t => ({ nome: t.nome, escudo: t.escudo, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 }));
        
        // Orçamento Dinâmico
        const meuTime = timesDaLiga.find(t => t.nome === nomeTimeSelecionado);
        let somaOvr = 0;
        if(meuTime && meuTime.elenco.length > 0) meuTime.elenco.forEach(j => somaOvr += j.forca);
        const mediaOvr = meuTime.elenco.length > 0 ? Math.floor(somaOvr / meuTime.elenco.length) : 60;
        
        let orcamento = 2000000;
        if (mediaOvr > 90) orcamento = 10000000;
        else if (mediaOvr > 80) orcamento = 8000000;
        else if (mediaOvr > 70) orcamento = 5000000;
        else if (mediaOvr > 65) orcamento = 3000000;

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
        this.Contratos.enviarBoasVindas(estado); // Envia a primeira msg
    },

    // --- 2. SISTEMA DE EVENTOS ---
    Eventos: {
        db: {
            intros: ["Más notícias,", "Infelizmente,", "Relatório do DM:", "Atenção professor,"],
            lesoes: ["sentiu a coxa", "torceu o tornozelo", "travou as costas", "machucou o joelho"],
            causas: ["no treino", "descendo do ônibus", "sozinho", "na academia"],
            tempos: [1, 2, 3, 5, 10], 
            mercado_intro: ["Chegou proposta.", "O telefone tocou.", "Email do exterior.", "Oferta na mesa."],
            compradores: ["Al-Hilal", "Benfica", "River Plate", "Flamengo", "Real Madrid", "Ajax"],
            argumentos: ["Querem pagar a multa.", "O jogador quer ir.", "É muito dinheiro."],
            reclamacoes: ["quer aumento", "brigou no treino", "chegou atrasado", "foi visto na balada"],
            humores: ["Furioso", "Chateado", "Desmotivado"]
        },

        processarEventosRodada: function(game) {
            const chanceLesao = 0.30; 
            const chanceProposta = 0.20; 
            const chanceProblema = 0.15; 

            if(Math.random() < chanceLesao) this.gerarLesao(game);
            if(Math.random() < chanceProposta) this.gerarPropostaCompra(game);
            if(Math.random() < chanceProblema) this.gerarProblemaVestiario(game);
        },

        gerarLesao: function(game) {
            const time = Engine.encontrarTime(game.info.time);
            const disp = time.elenco.filter(j => j.status !== "Lesionado");
            if(disp.length === 0) return;

            const alvo = disp[Math.floor(Math.random() * disp.length)];
            const tempo = this.db.tempos[Math.floor(Math.random() * this.db.tempos.length)];
            
            // Aplica no objeto
            const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
            time.elenco[idx].status = "Lesionado";
            time.elenco[idx].rodadasFora = tempo;
            
            // Salva no game global
            const tIdx = game.times.findIndex(t => t.nome === game.info.time);
            game.times[tIdx] = time;
            Engine.salvarJogo(game);

            const html = `<p><b>${alvo.nome}</b> se machucou. Fora por <b>${tempo} rodadas</b>.</p>
            <button onclick="Engine.Eventos.infiltrarJogador('${alvo.uid}')" style="width:100%; padding:10px; background:#d63031; color:white; border:none; margin-top:10px;">💉 Infiltrar (Risco)</button>`;
            Engine.sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm');
        },

        gerarPropostaCompra: function(game) {
            const time = Engine.encontrarTime(game.info.time);
            if(time.elenco.length===0) return;
            const alvo = time.elenco[Math.floor(Math.random()*time.elenco.length)];
            const comprador = this.db.compradores[Math.floor(Math.random()*this.db.compradores.length)];
            const oferta = Math.floor((alvo.valor||alvo.forca*80000) * (0.8 + Math.random()));

            const html = `<p>O <b>${comprador}</b> ofereceu <b>R$ ${oferta.toLocaleString()}</b> pelo ${alvo.nome}.</p>
            <button onclick='Engine.Eventos.venderJogador("${alvo.uid}", ${oferta})' style="width:100%; padding:10px; background:#00b894; color:white; border:none; margin-top:10px;">VENDER</button>`;
            Engine.sistema.novaMensagem(`Proposta: ${alvo.nome}`, html, 'negociacao');
        },

        gerarProblemaVestiario: function(game) {
            const time = Engine.encontrarTime(game.info.time);
            if(time.elenco.length===0) return;
            const alvo = time.elenco[Math.floor(Math.random()*time.elenco.length)];
            const prob = this.db.reclamacoes[Math.floor(Math.random()*this.db.reclamacoes.length)];
            
            const html = `<p><b>${alvo.nome}</b> ${prob}. O clima pesou.</p>
            <button onclick="alert('Multado!')" style="width:100%; padding:10px; background:#d63031; color:white; border:none; margin-top:10px;">Multar</button>`;
            Engine.sistema.novaMensagem(`Clima Tenso: ${alvo.nome}`, html, 'alerta');
        },

        venderJogador: function(uid, valor) {
            const game = Engine.carregarJogo();
            const tIdx = game.times.findIndex(t => t.nome === game.info.time);
            const jog = game.times[tIdx].elenco.find(j => j.uid === uid);
            if(jog) {
                game.recursos.dinheiro += valor;
                game.financas.historico.push({texto:`Venda ${jog.nome}`, valor:valor, tipo:'entrada'});
                game.times[tIdx].elenco = game.times[tIdx].elenco.filter(j => j.uid !== uid);
                Engine.salvarJogo(game);
                alert("Vendido!");
                location.reload();
            }
        },
        infiltrarJogador: function(uid) {
            const game = Engine.carregarJogo();
            const tIdx = game.times.findIndex(t => t.nome === game.info.time);
            const elenco = game.times[tIdx].elenco;
            const idx = elenco.findIndex(j => j.uid === uid);
            if(idx !== -1) {
                if(Math.random() > 0.5) {
                    elenco[idx].status = "Apto"; elenco[idx].rodadasFora = 0; alert("Funcionou! Ele joga.");
                } else {
                    elenco[idx].rodadasFora += 2; alert("Piorou a lesão!");
                }
                game.times[tIdx].elenco = elenco;
                Engine.salvarJogo(game);
            }
        }
    },

    // --- 3. CONTRATOS E MENSAGENS (CORREÇÃO ATÔMICA) ---
    Contratos: {
        enviarBoasVindas: function(game) {
            // Este usa o sistema normal pois é inicialização
            const html = `Olá <b>${game.info.tecnico}</b>. Bem-vindo.<br>Verifique as propostas de Patrocínio e TV na sua caixa de entrada.`;
            Engine.sistema.novaMensagem("Memorando #001: Boas Vindas", html, 'boas_vindas');
        },

        liberarOfertasPatrocinio: function() {
            // CORREÇÃO: Carrega, Modifica e Salva TUDO DE UMA VEZ
            const game = Engine.carregarJogo();
            if(game.flags.patroEnviado) return;

            const base = Math.floor(game.recursos.dinheiro * 0.15);
            const p1 = {id:1, empresa:"Banco Nacional", mensal:base*1.2, luvas:base*2, desc:"Estável"};
            const p2 = {id:2, empresa:"BetWin365", mensal:base*0.8, luvas:base*8, desc:"Agressivo"};
            const p3 = {id:3, empresa:"NeoTech", mensal:base, luvas:base*4, desc:"Equilibrado"};

            // Prepara HTML seguro (sem aspas duplas soltas)
            const html = `
                <p>Precisamos fechar o Patrocínio Master:</p>
                <div style="background:#111; padding:10px; margin-bottom:5px; border:1px solid #444;">
                    <b>${p1.empresa}</b> (${p1.desc})<br>Mensal: ${p1.mensal.toLocaleString()} | Luvas: ${p1.luvas.toLocaleString()}<br>
                    <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p1)}, this)' style="margin-top:5px; cursor:pointer;">Assinar</button>
                </div>
                <div style="background:#111; padding:10px; margin-bottom:5px; border:1px solid #444;">
                    <b>${p2.empresa}</b> (${p2.desc})<br>Mensal: ${p2.mensal.toLocaleString()} | Luvas: ${p2.luvas.toLocaleString()}<br>
                    <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p2)}, this)' style="margin-top:5px; cursor:pointer;">Assinar</button>
                </div>
                <div style="background:#111; padding:10px; margin-bottom:5px; border:1px solid #444;">
                    <b>${p3.empresa}</b> (${p3.desc})<br>Mensal: ${p3.mensal.toLocaleString()} | Luvas: ${p3.luvas.toLocaleString()}<br>
                    <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p3)}, this)' style="margin-top:5px; cursor:pointer;">Assinar</button>
                </div>
            `;

            // INSERÇÃO MANUAL E ATÔMICA
            if(!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({
                id: Date.now(),
                rodada: game.rodadaAtual,
                titulo: "URGENTE: Patrocínio Master",
                corpo: html,
                tipo: 'patrocinio_oferta',
                lida: false
            });
            
            game.flags.patroEnviado = true; // Marca flag JUNTOS
            Engine.salvarJogo(game);
        },

        liberarOfertasTV: function() {
            const game = Engine.carregarJogo();
            if(game.flags.tvEnviado) return;

            const base = Math.floor(game.recursos.dinheiro * 0.10);
            const t1 = {id:'tv1', emissora:"Rede Nacional", fixo:base*1.5, desc:"Cota Fixa"};
            const t2 = {id:'tv2', emissora:"StreamSports", fixo:base*0.5, desc:"Variável"};

            const html = `
                <p>Ofertas de Transmissão:</p>
                <div style="background:#111; padding:10px; margin-bottom:5px; border:1px solid #444;">
                    <b>${t1.emissora}</b> (${t1.desc})<br>Fixo: ${t1.fixo.toLocaleString()}<br>
                    <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t1)}, this)' style="margin-top:5px; cursor:pointer;">Fechar</button>
                </div>
                <div style="background:#111; padding:10px; margin-bottom:5px; border:1px solid #444;">
                    <b>${t2.emissora}</b> (${t2.desc})<br>Fixo: ${t2.fixo.toLocaleString()}<br>
                    <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t2)}, this)' style="margin-top:5px; cursor:pointer;">Fechar</button>
                </div>
            `;

            // INSERÇÃO MANUAL E ATÔMICA
            if(!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({
                id: Date.now(),
                rodada: game.rodadaAtual,
                titulo: "Direitos de TV",
                corpo: html,
                tipo: 'tv_oferta',
                lida: false
            });

            game.flags.tvEnviado = true;
            Engine.salvarJogo(game);
        },

        assinarPatrocinio: function(p, btn) {
            const g = Engine.carregarJogo();
            if(g.contratos.patrocinio) { alert("Já tem!"); return; }
            g.contratos.patrocinio = p; g.recursos.dinheiro += p.luvas;
            g.financas.historico.push({texto:`Luvas ${p.empresa}`, valor:p.luvas, tipo:'entrada'});
            Engine.salvarJogo(g); 
            btn.parentNode.innerHTML = `<span style="color:#00ff88">✅ ASSINADO</span>`;
            alert("Fechado!");
        },
        assinarTV: function(t, btn) {
            const g = Engine.carregarJogo();
            if(g.contratos.tv) { alert("Já tem!"); return; }
            g.contratos.tv = t; 
            Engine.salvarJogo(g); 
            btn.parentNode.innerHTML = `<span style="color:#00ff88">✅ ASSINADO</span>`;
            alert("Fechado!");
        }
    },

    // --- 4. SISTEMA BASE ---
    encontrarTime: function(nome) {
        const s = this.carregarJogo();
        return s.times.find(t => t.nome === nome) || {nome, elenco:[]};
    },
    salvarJogo: function(s) { localStorage.setItem('brfutebol_save', JSON.stringify(s)); },
    carregarJogo: function() { return JSON.parse(localStorage.getItem('brfutebol_save')); },

    // --- 5. ATUALIZAÇÃO ---
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
            
            // Lógica de processamento de rodada
            if(jogo && jogo.jogado && estado.recursos.ultimaRodadaProcessada !== estado.rodadaAtual) {
                const mandante = jogo.mandante === estado.info.time;
                const adv = mandante ? jogo.visitante : jogo.mandante;
                
                this.sistema.processarFinancas(estado, mandante, adv);
                this.Eventos.processarEventosRodada(estado);
                this.Mercado.atualizarLista(estado);
                this.Mercado.simularCPU(estado);
                
                estado.recursos.ultimaRodadaProcessada = estado.rodadaAtual;
            }
        }
        this.salvarJogo(estado);
        return tab;
    },

    _computar: function(tab, jogo) {
        const c = tab.find(t=>t.nome===jogo.mandante); const f = tab.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return;
        const gc=parseInt(jogo.placarCasa); const gf=parseInt(jogo.placarFora);
        c.j++; f.j++; c.gp+=gc; f.gp+=gf; c.gc+=gf; f.gc+=gc; c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        if(gc>gf){c.v++; c.pts+=3; f.d++;} else if(gf>gc){f.v++; f.pts+=3; c.d++;} else{c.e++; f.e++; c.pts++; f.pts++;}
    },

    simularJogoCPU: function(jogo) {
        jogo.jogado = true;
        jogo.placarCasa = Math.floor(Math.random()*3); jogo.placarFora = Math.floor(Math.random()*2);
        if(Math.random()>0.6) jogo.placarCasa++; if(Math.random()>0.7) jogo.placarFora++;
        jogo.eventos = []; // Eventos de jogo simplificados
    },

    estadios: {
        db: { "Padrao": {cap:15000}, "Corinthians": {cap:49000}, "Flamengo": {cap:78000} },
        calc: function(adv, game) {
            const cap = (this.db[game.info.time] || this.db["Padrao"]).cap;
            const renda = cap * 20; // Simplificado para teste
            return { rendaTotal: renda };
        },
        calcularBilheteria: function(adv) { return this.calc(adv, Engine.carregarJogo()); }
    },

    Mercado: {
        getAgentesLivres: function() { return JSON.parse(localStorage.getItem('brfutebol_livres') || '[]'); },
        getListaTransferencias: function() { return JSON.parse(localStorage.getItem('brfutebol_transferencias') || '[]'); },
        avaliarTransferencia: function(j, t) {
            return { valorPedido: j.valor, aceitaEmprestimo: true, aceitaTroca: true, postura: 'neutra', paciencia: 4, alvosTroca: [] };
        },
        atualizarLista: function(game) {
            let l = this.getListaTransferencias();
            if(Math.random()>0.7 && l.length<20) {
                const t = game.times.find(x => x.nome !== game.info.time);
                if(t && t.elenco.length>0) l.push({...t.elenco[0], valor:t.elenco[0].forca*20000, clube:t.nome});
            }
            localStorage.setItem('brfutebol_transferencias', JSON.stringify(l));
        },
        simularCPU: function(game) {
            // Lógica de demissão da CPU
        },
        removerJogador: function(uid, tipo) {
            let k = tipo==='livre'?'brfutebol_livres':'brfutebol_transferencias';
            let l = JSON.parse(localStorage.getItem(k)||'[]');
            l = l.filter(j=>j.uid!==uid);
            localStorage.setItem(k, JSON.stringify(l));
        }
    },

    sistema: {
        novaMensagem: function(t, c, tipo) {
            const g = Engine.carregarJogo();
            if(!g.mensagens) g.mensagens=[];
            g.mensagens.unshift({id:Date.now(), rodada:g.rodadaAtual, titulo:t, corpo:c, tipo, lida:false});
            Engine.salvarJogo(g);
        },
        processarFinancas: function(g, mand, adv) {
            if(mand) {
                const r = Engine.estadios.calc(adv, g);
                g.recursos.dinheiro += r.rendaTotal;
                g.financas.historico.push({texto:'Bilheteria', valor:r.rendaTotal, tipo:'entrada'});
            }
            if(g.rodadaAtual%4===0) {
                if(g.contratos.patrocinio) {
                    g.recursos.dinheiro += g.contratos.patrocinio.mensal;
                    g.financas.historico.push({texto:'Patrocínio', valor:g.contratos.patrocinio.mensal, tipo:'entrada'});
                }
                let folha = 0;
                const time = g.times.find(t=>t.nome===g.info.time);
                if(time) time.elenco.forEach(j=>folha+=j.salario);
                g.recursos.dinheiro -= folha;
                g.financas.historico.push({texto:'Salários', valor:-folha, tipo:'saida'});
            }
        }
    },
    data: { getDataAtual: function(r) { return `Rodada ${r}`; } }
};
window.Engine = Engine;
