// ARQUIVO: engine.js (V11.3 - CONTEÚDO COMPLETO + CORREÇÃO DE LOOP)

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando: ${nomeTimeSelecionado}`);

        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO: calendario.js não carregado.");
            return;
        }

        // 1. Limpa o mercado antigo (Começa vazio - Realista)
        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        // 2. Carrega Times
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // 3. Configura Jogadores Iniciais (Contratos, Status, etc)
        const DATA_FIM_PADRAO = "31/12/2026";
        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
            t.elenco.forEach((jogador, idx) => {
                if (!jogador.uid) jogador.uid = `start_${t.nome.substring(0,3)}_${idx}_${Date.now()}`;
                jogador.contrato = DATA_FIM_PADRAO;
                if (!jogador.salario) jogador.salario = (jogador.forca || 60) * 1500;
                jogador.jogos = 0;
                jogador.gols = 0;
                jogador.status = "Apto"; // Status novo para o sistema de lesões
                jogador.rodadasFora = 0;
            });
        });

        // 4. Gera Calendário e Tabela
        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome, escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        // --- CÁLCULO DE ORÇAMENTO BASEADO NO OVR ---
        const meuTimeTemp = timesDaLiga.find(t => t.nome === nomeTimeSelecionado);
        let somaOvr = 0;
        if(meuTimeTemp && meuTimeTemp.elenco.length > 0) {
            meuTimeTemp.elenco.forEach(j => somaOvr += j.forca);
        }
        const mediaOvr = meuTimeTemp.elenco.length > 0 ? Math.floor(somaOvr / meuTimeTemp.elenco.length) : 60;
        
        let orcamentoInicial = 2000000;
        if (mediaOvr > 90) orcamentoInicial = 10000000;
        else if (mediaOvr > 80) orcamentoInicial = 8000000;
        else if (mediaOvr > 70) orcamentoInicial = 5000000;
        else if (mediaOvr > 65) orcamentoInicial = 3000000;
        else orcamentoInicial = 2000000;

        const dataInicio = new Date('2026-01-01T12:00:00').getTime();

        // 5. Cria o Estado Inicial do Save
        const estadoDoJogo = {
            info: {
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Manager",
                time: nomeTimeSelecionado,
                escudo: localStorage.getItem('brfutebol_escudo'),
                divisao: divisao,
                dataInicio: dataInicio
            },
            recursos: { 
                dinheiro: orcamentoInicial, 
                moral: 100,
                // CORREÇÃO DE LOOP: Usamos número da rodada para controle
                ultimaRodadaProcessada: 0 
            },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false, patroEnviado: false, tvEnviado: false },
            financas: {
                saldo: orcamentoInicial,
                historico: [{ texto: "Aporte da Diretoria", valor: orcamentoInicial, tipo: "entrada" }]
            },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            classificacao: classificacaoInicial,
            jogadoresStatus: {},
            mensagens: [] 
        };

        this.salvarJogo(estadoDoJogo);

        // 6. GERA APENAS O E-MAIL DE BOAS VINDAS
        this.Contratos.enviarBoasVindas(estadoDoJogo);
    },

    // --- 2. SISTEMA DE EVENTOS ALEATÓRIOS ---
    Eventos: {
        db: {
            intros: ["Más notícias,", "Infelizmente,", "Relatório do DM:", "Urgente:", "Atenção professor,", "Problemas à vista,"],
            lesoes: ["sentiu uma fisgada na coxa", "torceu o tornozelo", "reclamou de dores lombares", "teve uma contusão no joelho", "machucou o pé", "sentiu o adutor"],
            causas: ["durante o treino tático", "ao descer do ônibus", "escorregando no banho", "numa dividida no treino", "levantando peso na academia", "tentando dominar uma bola"],
            tempos: [1, 2, 3, 5, 10], 
            
            mercado_intro: ["Chegou um fax.", "O telefone tocou.", "Email do exterior.", "Representantes chegaram no CT.", "Oferta na mesa."],
            compradores: ["Al-Hilal (ARA)", "Benfica (POR)", "River Plate (ARG)", "Flamengo (BRA)", "Um time da China", "Real Madrid (ESP)", "Ajax (HOL)"],
            argumentos: ["O jogador quer ir.", "A oferta é irrecusável.", "Eles pagam a multa.", "O empresário está forçando.", "É a chance da vida dele."],
            
            reclamacoes: ["está insatisfeito com o banco", "quer aumento salarial", "brigou com um companheiro", "chegou atrasado no treino", "foi visto na balada"],
            humores: ["Furioso", "Decepcionado", "Irritado", "Desmotivado", "Apático"]
        },

        processarEventosRodada: function(game) {
            // Chance de eventos por rodada
            const chanceLesao = 0.25; 
            const chanceProposta = 0.20; 
            const chanceProblema = 0.15; 

            if(Math.random() < chanceLesao) this.gerarLesao(game);
            if(Math.random() < chanceProposta) this.gerarPropostaCompra(game);
            if(Math.random() < chanceProblema) this.gerarProblemaVestiario(game);
        },

        gerarLesao: function(game) {
            const meuTime = Engine.encontrarTime(game.info.time);
            // Filtra quem não está lesionado
            const disponiveis = meuTime.elenco.filter(j => j.status !== "Lesionado");
            if(disponiveis.length === 0) return;

            const alvo = disponiveis[Math.floor(Math.random() * disponiveis.length)];
            const intro = this.db.intros[Math.floor(Math.random() * this.db.intros.length)];
            const lesao = this.db.lesoes[Math.floor(Math.random() * this.db.lesoes.length)];
            const causa = this.db.causas[Math.floor(Math.random() * this.db.causas.length)];
            const tempo = this.db.tempos[Math.floor(Math.random() * this.db.tempos.length)];

            // Aplica lesão no objeto jogador
            const idx = meuTime.elenco.findIndex(j => j.uid === alvo.uid);
            if(idx !== -1) {
                meuTime.elenco[idx].status = "Lesionado";
                meuTime.elenco[idx].rodadasFora = tempo;
                
                // Salva a alteração no time
                const tIdx = game.times.findIndex(t => t.nome === game.info.time);
                game.times[tIdx] = meuTime;
                Engine.salvarJogo(game);
            }

            const html = `
                <div style="font-family:'Georgia'; color:#FF9999;">
                    <p>${intro}</p>
                    <p>O atleta <b>${alvo.nome}</b> ${lesao} ${causa}.</p>
                    <p>O Dr. informa que o tempo de recuperação estimado é de <b>${tempo} rodada(s)</b>.</p>
                    <hr style="border-color:#555">
                    <p style="font-size:0.9rem">Opções do DM:</p>
                    <button onclick="alert('Tratamento conservador iniciado.')" style="width:100%; padding:8px; margin-bottom:5px; background:#444; border:none; color:#fff; cursor:pointer;">Tratamento Conservador (Seguro)</button>
                    <button onclick="Engine.Eventos.infiltrarJogador('${alvo.uid}')" style="width:100%; padding:8px; background:#d63031; border:none; color:#fff; cursor:pointer;">💉 Infiltrar (Arriscado)</button>
                </div>
            `;
            Engine.sistema.novaMensagem(`DM: ${alvo.nome} lesionado`, html, 'dm');
        },

        gerarPropostaCompra: function(game) {
            const meuTime = Engine.encontrarTime(game.info.time);
            if(meuTime.elenco.length === 0) return;
            const alvo = meuTime.elenco[Math.floor(Math.random() * meuTime.elenco.length)];
            
            const comprador = this.db.compradores[Math.floor(Math.random() * this.db.compradores.length)];
            const intro = this.db.mercado_intro[Math.floor(Math.random() * this.db.mercado_intro.length)];
            const argumento = this.db.argumentos[Math.floor(Math.random() * this.db.argumentos.length)];
            
            // Valor da oferta (Variável entre 80% e 150% do valor base)
            const valorBase = alvo.valor || (alvo.forca * 80000);
            const fator = 0.8 + Math.random() * 0.7;
            const oferta = Math.floor(valorBase * fator);

            const html = `
                <div style="font-family:'Georgia'; color:#a29bfe;">
                    <p>${intro}</p>
                    <p>O <b>${comprador}</b> oficializou uma proposta pelo nosso atleta <b>${alvo.nome}</b>.</p>
                    <p>Valores na mesa: <b style="font-size:1.2rem; color:#00ff88">R$ ${oferta.toLocaleString()}</b>.</p>
                    <p><i>"${argumento}"</i> - disse o agente.</p>
                    <hr style="border-color:#555">
                    <button onclick='Engine.Eventos.venderJogador("${alvo.uid}", ${oferta})' style="width:100%; padding:10px; margin-bottom:5px; background:#00b894; border:none; color:#fff; font-weight:bold; cursor:pointer;">ACEITAR OFERTA (Vender)</button>
                    <button onclick="alert('Proposta recusada. O jogador ficou chateado.')" style="width:100%; padding:10px; background:#d63031; border:none; color:#fff; cursor:pointer;">RECUSAR (Segurar Jogador)</button>
                </div>
            `;
            Engine.sistema.novaMensagem(`Proposta por ${alvo.nome}`, html, 'negociacao');
        },

        gerarProblemaVestiario: function(game) {
            const meuTime = Engine.encontrarTime(game.info.time);
            if(meuTime.elenco.length === 0) return;
            const alvo = meuTime.elenco[Math.floor(Math.random() * meuTime.elenco.length)];
            
            const problema = this.db.reclamacoes[Math.floor(Math.random() * this.db.reclamacoes.length)];
            const humor = this.db.humores[Math.floor(Math.random() * this.db.humores.length)];

            const html = `
                <div style="font-family:'Georgia'; color:#ffeaa7;">
                    <p>Problemas no vestiário, professor.</p>
                    <p><b>${alvo.nome}</b> ${problema}. O clima pesou.</p>
                    <p>Estado emocional do atleta: <b>${humor}</b>.</p>
                    <hr style="border-color:#555">
                    <button onclick="alert('Você multou o jogador. O elenco não gostou, mas a disciplina foi mantida.')" style="width:100%; padding:8px; margin-bottom:5px; background:#d63031; border:none; color:#fff; cursor:pointer;">Aplicar Multa</button>
                    <button onclick="alert('Você conversou e acalmou os ânimos.')" style="width:100%; padding:8px; background:#0984e3; border:none; color:#fff; cursor:pointer;">Conversar em Particular</button>
                </div>
            `;
            Engine.sistema.novaMensagem(`Clima Tenso: ${alvo.nome}`, html, 'alerta');
        },

        venderJogador: function(uid, valor) {
            const game = Engine.carregarJogo();
            const timeIdx = game.times.findIndex(t => t.nome === game.info.time);
            const jogador = game.times[timeIdx].elenco.find(j => j.uid === uid);
            
            if(jogador) {
                game.recursos.dinheiro += valor;
                game.financas.historico.push({ texto: `Venda: ${jogador.nome}`, valor: valor, tipo: 'entrada' });
                // Remove do elenco
                game.times[timeIdx].elenco = game.times[timeIdx].elenco.filter(j => j.uid !== uid);
                Engine.salvarJogo(game);
                alert(`Negócio fechado! ${jogador.nome} foi vendido. R$ ${valor.toLocaleString()} entraram no caixa.`);
                location.reload();
            } else {
                alert("Jogador não encontrado (talvez já vendido).");
            }
        },

        infiltrarJogador: function(uid) {
            const game = Engine.carregarJogo();
            const timeIdx = game.times.findIndex(t => t.nome === game.info.time);
            const elenco = game.times[timeIdx].elenco;
            const idx = elenco.findIndex(j => j.uid === uid);

            if(idx !== -1) {
                if(Math.random() > 0.5) {
                    elenco[idx].status = "Apto";
                    elenco[idx].rodadasFora = 0;
                    alert("Sucesso! A infiltração funcionou e ele vai pro jogo.");
                } else {
                    elenco[idx].rodadasFora += 2;
                    alert("Deu ruim! A lesão agravou. Mais 2 rodadas fora.");
                }
                game.times[timeIdx].elenco = elenco;
                Engine.salvarJogo(game);
            }
        }
    },

    // --- 3. SISTEMA DE CONTRATOS E MENSAGENS ---
    Contratos: {
        empresas: ["Hyper", "Ultra", "Neo", "Global", "Royal", "King", "Super", "Mega", "Iron", "Alpha"],
        setores: ["Bet", "Bank", "Motors", "Energy", "Foods", "Tech", "Airlines", "Beer", "Seguros", "Pharma"],
        tv: ["Rede Esportiva", "Cabo Sports", "StreamMax", "TV Nacional", "PlayGol"],

        enviarBoasVindas: function(game) {
            const corpo = `
                <div style="font-family:'Georgia', serif; color:#ddd;">
                    <p>Prezado(a) <b>${game.info.tecnico}</b>,</p>
                    <p>É com grande expectativa que assino sua contratação. O Conselho Deliberativo aprovou seu nome, mas saiba que a paciência por aqui é curta.</p>
                    <p>Liberamos um aporte inicial de <b>${game.recursos.dinheiro.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</b>. Use com sabedoria.</p>
                    <p><b>Suas prioridades imediatas (Checklist):</b></p>
                    <ul style="background:#222; padding:15px; border-left:3px solid #f1c40f;">
                        <li>☐ Analisar as propostas de Patrocínio Master.</li>
                        <li>☐ Fechar os Direitos de TV.</li>
                        <li>☐ Avaliar o elenco atual.</li>
                    </ul>
                    <p>Assim que você terminar de ler este memorando, mandarei meu diretor comercial apresentar as ofertas de patrocínio.</p>
                    <p>Atenciosamente,<br><i>O Presidente</i></p>
                </div>
            `;
            Engine.sistema.novaMensagem("Memorando Oficial #001: Início dos Trabalhos", corpo, 'boas_vindas');
        },

        liberarOfertasPatrocinio: function() {
            // Recarrega o jogo para garantir estado atual
            let game = Engine.carregarJogo();
            if(game.flags.patroEnviado) return;

            const baseVal = Math.floor(game.recursos.dinheiro * 0.15); 
            
            const p1 = { id: 1, empresa: "Banco Nacional", mensal: Math.floor(baseVal * 1.2), luvas: Math.floor(baseVal * 2), bonusTitulo: Math.floor(baseVal * 5), duracao: 12, desc: "Pagamento mensal alto e garantido." };
            const p2 = { id: 2, empresa: "BetWin365", mensal: Math.floor(baseVal * 0.7), luvas: Math.floor(baseVal * 8), bonusTitulo: Math.floor(baseVal * 20), duracao: 24, desc: "Luvas altíssimas agora. Mensal baixo." };
            const p3 = { id: 3, empresa: "NeoTech Systems", mensal: Math.floor(baseVal), luvas: Math.floor(baseVal * 4), bonusTitulo: Math.floor(baseVal * 8), duracao: 12, desc: "Proposta equilibrada." };

            const strP1 = JSON.stringify(p1).replace(/"/g, '&quot;');
            const strP2 = JSON.stringify(p2).replace(/"/g, '&quot;');
            const strP3 = JSON.stringify(p3).replace(/"/g, '&quot;');

            let html = `
                <div style="font-family:'Georgia', serif;">
                    <p>Chefe, consegui três reuniões. Precisamos decidir <b>hoje</b> quem estampará nossa camisa.</p>
                    <hr style="border-color:#444">
                    <div style="background:#1a1a1a; padding:15px; border-radius:5px; margin-bottom:15px; border-left:4px solid #3498db;">
                        <h3 style="margin:0; color:#3498db;">Opção A: ${p1.empresa}</h3>
                        <p style="font-size:0.9rem; color:#aaa; margin-top:5px;"><i>"${p1.desc}"</i></p>
                        <div style="margin:10px 0;"><div>💰 Mensal: <b>R$ ${p1.mensal.toLocaleString()}</b></div><div>📝 Luvas: <b>R$ ${p1.luvas.toLocaleString()}</b></div></div>
                        <button onclick="Engine.Contratos.assinarPatrocinio(${strP1}, this)" class="btn-email">Assinar com ${p1.empresa}</button>
                    </div>
                    <div style="background:#1a1a1a; padding:15px; border-radius:5px; margin-bottom:15px; border-left:4px solid #e74c3c;">
                        <h3 style="margin:0; color:#e74c3c;">Opção B: ${p2.empresa}</h3>
                        <p style="font-size:0.9rem; color:#aaa; margin-top:5px;"><i>"${p2.desc}"</i></p>
                        <div style="margin:10px 0;"><div>💰 Mensal: R$ ${p2.mensal.toLocaleString()}</div><div>📝 Luvas: <b style="color:#00ff88">R$ ${p2.luvas.toLocaleString()}</b></div></div>
                        <button onclick="Engine.Contratos.assinarPatrocinio(${strP2}, this)" class="btn-email">Assinar com ${p2.empresa}</button>
                    </div>
                    <div style="background:#1a1a1a; padding:15px; border-radius:5px; border-left:4px solid #9b59b6;">
                        <h3 style="margin:0; color:#9b59b6;">Opção C: ${p3.empresa}</h3>
                        <p style="font-size:0.9rem; color:#aaa; margin-top:5px;"><i>"${p3.desc}"</i></p>
                        <div style="margin:10px 0;"><div>💰 Mensal: R$ ${p3.mensal.toLocaleString()}</div><div>📝 Luvas: R$ ${p3.luvas.toLocaleString()}</div></div>
                        <button onclick="Engine.Contratos.assinarPatrocinio(${strP3}, this)" class="btn-email">Assinar com ${p3.empresa}</button>
                    </div>
                </div>
            `;

            Engine.sistema.novaMensagem("URGENTE: Definição de Patrocínio Master", html, 'patrocinio_oferta');
            
            game = Engine.carregarJogo(); 
            game.flags.patroEnviado = true;
            Engine.salvarJogo(game);
        },

        liberarOfertasTV: function() {
            let game = Engine.carregarJogo();
            if(game.flags.tvEnviado) return;

            const baseCota = Math.floor(game.recursos.dinheiro * 0.10);

            const t1 = { id: 'tv1', emissora: "Rede Nacional", fixo: Math.floor(baseCota * 1.5), porJogo: 0, desc: "Cota Fixa Alta" };
            const t2 = { id: 'tv2', emissora: "StreamSports+", fixo: Math.floor(baseCota * 0.5), porJogo: Math.floor(baseCota * 0.3), desc: "Variável por jogo" };

            const strT1 = JSON.stringify(t1).replace(/"/g, '&quot;');
            const strT2 = JSON.stringify(t2).replace(/"/g, '&quot;');

            let html = `
                <div style="font-family:'Georgia', serif;">
                    <p>Patrocínio resolvido. Agora a briga é com as TVs.</p>
                    <hr style="border-color:#444">
                    <div style="background:#1a1a1a; padding:15px; margin-bottom:15px; border-radius:5px;">
                        <strong style="color:#f1c40f; font-size:1.1rem;">📺 ${t1.emissora}</strong>
                        <p style="font-size:0.9rem; color:#aaa;">${t1.desc}</p>
                        <div>• Cota Fixa Mensal: <b>R$ ${t1.fixo.toLocaleString()}</b></div>
                        <button onclick="Engine.Contratos.assinarTV(${strT1}, this)" class="btn-email">Fechar com Rede Nacional</button>
                    </div>
                    <div style="background:#1a1a1a; padding:15px; border-radius:5px;">
                        <strong style="color:#00a8ff; font-size:1.1rem;">📱 ${t2.emissora}</strong>
                        <p style="font-size:0.9rem; color:#aaa;">${t2.desc}</p>
                        <div>• Cota Fixa: R$ ${t2.fixo.toLocaleString()}</div>
                        <div>• Por Jogo: <b>R$ ${t2.porJogo.toLocaleString()}</b></div>
                        <button onclick="Engine.Contratos.assinarTV(${strT2}, this)" class="btn-email">Fechar com StreamSports</button>
                    </div>
                </div>
            `;

            Engine.sistema.novaMensagem("Direitos de Transmissão: Propostas", html, 'tv_oferta');
            
            game = Engine.carregarJogo();
            game.flags.tvEnviado = true;
            Engine.salvarJogo(game);
        },

        assinarPatrocinio: function(proposta, btnElement) {
            const game = Engine.carregarJogo();
            if(game.contratos.patrocinio) { alert("Já assinado!"); return; }
            
            game.contratos.patrocinio = proposta;
            game.recursos.dinheiro += proposta.luvas;
            game.financas.historico.push({ texto: `Luvas (${proposta.empresa})`, valor: proposta.luvas, tipo: 'entrada' });
            
            Engine.salvarJogo(game);
            
            const pai = btnElement.parentElement.parentElement;
            pai.innerHTML = `<div style="padding:20px; text-align:center; background:#111; color:#00ff88; border:1px solid #00ff88;"><h3>✅ CONTRATO ASSINADO</h3><p>A <b>${proposta.empresa}</b> é nossa nova parceira!</p><p>Recebemos R$ ${proposta.luvas.toLocaleString()} de luvas.</p></div>`;
            alert(`Parceria fechada!`);
        },

        assinarTV: function(proposta, btnElement) {
            const game = Engine.carregarJogo();
            if(game.contratos.tv) { alert("Já assinado!"); return; }
            game.contratos.tv = proposta;
            Engine.salvarJogo(game);
            const pai = btnElement.parentElement.parentElement;
            pai.innerHTML = `<div style="padding:20px; text-align:center; background:#111; color:#f1c40f; border:1px solid #f1c40f;"><h3>✅ DIREITOS VENDIDOS</h3><p>Transmissões exclusivas na <b>${proposta.emissora}</b>.</p></div>`;
            alert(`Contrato de TV assinado.`);
        }
    },

    // --- 4. SISTEMA DE BUSCA E SAVE ---
    encontrarTime: function(nomeTime) {
        const save = this.carregarJogo();
        if (!save || !save.times) return { nome: nomeTime, forca: 0, elenco: [] };
        return save.times.find(t => t.nome === nomeTime) || { nome: nomeTime, forca: 0, elenco: [] };
    },
    getMeuTime: function() { const save = this.carregarJogo(); if (!save) return null; return this.encontrarTime(save.info.time); },
    salvarJogo: function(estado) { localStorage.setItem('brfutebol_save', JSON.stringify(estado)); },
    carregarJogo: function() { const saveJson = localStorage.getItem('brfutebol_save'); return saveJson ? JSON.parse(saveJson) : null; },

    // --- 5. ATUALIZAÇÃO DA TABELA, FINANÇAS E EVENTOS ---
    atualizarTabela: function(estadoJogo) {
        const tabela = estadoJogo.classificacao || estadoJogo.tabela;
        tabela.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });

        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => { if (jogo.jogado) this._computarJogoNaTabela(tabela, jogo); });
        });
        tabela.sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg || b.gp - a.gp);
        
        const rodadaIdx = estadoJogo.rodadaAtual - 1;
        if(estadoJogo.calendario[rodadaIdx]) {
            const jogoPlayer = estadoJogo.calendario[rodadaIdx].jogos.find(j => j.mandante === estadoJogo.info.time || j.visitante === estadoJogo.info.time);
            
            // CORREÇÃO CRÍTICA DE LOOP (V11.3): Checa o número da rodada em vez de booleano
            if (jogoPlayer && jogoPlayer.jogado && estadoJogo.recursos.ultimaRodadaProcessada !== estadoJogo.rodadaAtual) {
                
                const isMandante = jogoPlayer.mandante === estadoJogo.info.time;
                const adversario = isMandante ? jogoPlayer.visitante : jogoPlayer.mandante;
                
                // Processa o financeiro
                this.sistema.processarRodadaFinanceira(estadoJogo, isMandante, adversario);
                
                // CHAMA OS EVENTOS ALEATÓRIOS AQUI (LESÕES, OFERTAS)
                this.Eventos.processarEventosRodada(estadoJogo);

                // Movimenta Mercado da CPU
                this.Mercado.atualizarListaTransferencias(estadoJogo); 
                this.Mercado.simularDispensasCPU(estadoJogo);       
                
                // Marca esta rodada como processada
                estadoJogo.recursos.ultimaRodadaProcessada = estadoJogo.rodadaAtual;
            }
        }
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);
        if (!timeCasa || !timeFora) return;
        const gc = parseInt(jogo.placarCasa); const gf = parseInt(jogo.placarFora);
        timeCasa.j++; timeCasa.gp+=gc; timeCasa.gc+=gf; timeCasa.sg = timeCasa.gp - timeCasa.gc;
        timeFora.j++; timeFora.gp+=gf; timeFora.gc+=gc; timeFora.sg = timeFora.gp - timeFora.gc;
        if (gc > gf) { timeCasa.v++; timeCasa.pts+=3; timeFora.d++; }
        else if (gf > gc) { timeFora.v++; timeFora.pts+=3; timeCasa.d++; }
        else { timeCasa.e++; timeCasa.pts++; timeFora.e++; timeFora.pts++; }
    },

    // --- 6. SIMULAÇÃO CPU ---
    simularJogoCPU: function(jogo) {
        jogo.jogado = true;
        jogo.placarCasa = Math.floor(Math.random() * 3);
        jogo.placarFora = Math.floor(Math.random() * 2);
        if(Math.random() > 0.6) jogo.placarCasa++;
        if(Math.random() > 0.7) jogo.placarFora++;
        jogo.eventos = []; 
        const timeCasa = this.encontrarTime(jogo.mandante);
        for(let i=0; i<jogo.placarCasa; i++) jogo.eventos.push(this._gerarGolSimulado(timeCasa, jogo.mandante));
        const timeFora = this.encontrarTime(jogo.visitante);
        for(let i=0; i<jogo.placarFora; i++) jogo.eventos.push(this._gerarGolSimulado(timeFora, jogo.visitante));
        jogo.eventos.sort((a,b) => a.min - b.min);
    },

    _gerarGolSimulado: function(timeObj, nomeTime) {
        let nomeJog = "Atacante";
        if(timeObj.elenco && timeObj.elenco.length > 0) {
            const pool = timeObj.elenco.filter(j => j.pos !== 'GOL');
            const sorteado = (pool.length>0 ? pool : timeObj.elenco)[Math.floor(Math.random() * (pool.length>0 ? pool.length : timeObj.elenco.length))];
            nomeJog = sorteado.nome;
        } else { nomeJog = "Camisa " + (Math.floor(Math.random() * 10) + 2); }
        return { min: Math.floor(Math.random() * 90) + 1, time: nomeTime, jogador: nomeJog, tipo: 'gol' };
    },

    _gerarTimesGenericos: function(div) {
        let lista = [];
        for (let i = 1; i <= 20; i++) lista.push({ nome: `Time ${i}`, forca: 50, elenco: [] });
        return lista;
    },

    // --- 7. ESTÁDIO ---
    estadios: {
        db: {
            "Corinthians": { nome: "Neo Química Arena", cap: 49205 },
            "Palmeiras": { nome: "Allianz Parque", cap: 43713 },
            "São Paulo": { nome: "MorumBIS", cap: 66795 },
            "Santos": { nome: "Vila Belmiro", cap: 16068 },
            "Bragantino": { nome: "Nabi Abi Chedid", cap: 17022 },
            "Ponte Preta": { nome: "Moisés Lucarelli", cap: 17728 },
            "Flamengo": { nome: "Maracanã", cap: 78838 },
            "Fluminense": { nome: "Maracanã", cap: 78838 },
            "Vasco": { nome: "São Januário", cap: 21880 },
            "Botafogo": { nome: "Nilton Santos", cap: 44661 },
            "Atlético-MG": { nome: "Arena MRV", cap: 46000 },
            "Cruzeiro": { nome: "Mineirão", cap: 61846 },
            "Grêmio": { nome: "Arena do Grêmio", cap: 55662 },
            "Internacional": { nome: "Beira-Rio", cap: 50842 },
            "Bahia": { nome: "Arena Fonte Nova", cap: 47907 },
            "Vitória": { nome: "Barradão", cap: 30618 },
            "Fortaleza": { nome: "Arena Castelão", cap: 63903 },
            "Ceará": { nome: "Arena Castelão", cap: 63903 },
            "Sport": { nome: "Arena de Pernambuco", cap: 44300 },
            "Athletico-PR": { nome: "Ligga Arena", cap: 42372 },
            "Coritiba": { nome: "Couto Pereira", cap: 40502 },
            "Padrao": { nome: "Estádio Municipal", cap: 15000 }
        },
        getEstadio: function() {
            const game = Engine.carregarJogo();
            const timeNome = game.info.time;
            const dadosBase = this.db[timeNome] || this.db["Padrao"];
            const config = game.estadio || { precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 }, manutencao: 100 };
            return { ...dadosBase, ...config };
        },
        salvarPrecos: function(novosPrecos) {
            const game = Engine.carregarJogo();
            if(!game.estadio) game.estadio = {};
            game.estadio.precos = novosPrecos;
            Engine.salvarJogo(game);
        },
        calcularBilheteria: function(adversarioNome) {
            const game = Engine.carregarJogo();
            const estadio = this.getEstadio();
            const moral = game.recursos.moral || 50; 
            
            let demandaBase = moral / 100; 
            const grandes = ["Corinthians", "Flamengo", "Palmeiras", "São Paulo", "Vasco", "Grêmio", "Internacional", "Atlético-MG", "Cruzeiro", "Santos"];
            if (grandes.includes(adversarioNome)) demandaBase *= 1.4; 

            const capGeral = Math.floor(estadio.cap * 0.50);
            const capCadeiras = Math.floor(estadio.cap * 0.40);
            const capVip = Math.floor(estadio.cap * 0.10);

            const fatorFase = 1 + ((moral - 50) / 200);
            const justo = { geral: 40 * fatorFase, cadeiras: 90 * fatorFase, vip: 280 * fatorFase };

            const calcOcupacao = (cap, preco, ref) => {
                let atratividade = ref / preco; 
                let taxaOcupacao = demandaBase * atratividade;
                taxaOcupacao *= (0.9 + Math.random() * 0.2); 
                return Math.floor(Math.max(0, Math.min(cap * taxaOcupacao, cap)));
            };

            const pubGeral = calcOcupacao(capGeral, estadio.precos.geral, justo.geral);
            const pubCadeiras = calcOcupacao(capCadeiras, estadio.precos.cadeiras, justo.cadeiras);
            const pubVip = calcOcupacao(capVip, estadio.precos.vip, justo.vip);
            
            const publicoTotal = pubGeral + pubCadeiras + pubVip;
            const carros = Math.floor(publicoTotal * 0.2);
            const rendaPark = carros * estadio.precos.estacionamento;

            const rendaIngressos = (pubGeral * estadio.precos.geral) + 
                                   (pubCadeiras * estadio.precos.cadeiras) + 
                                   (pubVip * estadio.precos.vip);

            return {
                publico: publicoTotal,
                rendaTotal: rendaIngressos + rendaPark,
                detalhes: { pubGeral, pubCadeiras, pubVip, carros }
            };
        }
    },

    // --- 8. MERCADO (VERSÃO COMPLETA IA) ---
    Mercado: {
        getAgentesLivres: function() { return JSON.parse(localStorage.getItem('brfutebol_livres') || '[]'); },
        getListaTransferencias: function() { return JSON.parse(localStorage.getItem('brfutebol_transferencias') || '[]'); },
        
        avaliarTransferencia: function(jogador, meuTime) {
            const necessidadeFinanceira = Math.floor(Math.random() * 100);
            let valorBase = jogador.valor;
            let postura = 'neutra';
            
            if (jogador.forca > 80) { valorBase *= 1.3; postura = 'dura'; } 
            else if (necessidadeFinanceira > 70) { valorBase *= 0.85; postura = 'flexivel'; }

            const alvosTroca = meuTime.elenco.filter(j => 
                (j.pos === jogador.pos && j.forca >= jogador.forca - 5) || 
                (j.idade < 23 && j.forca > 70)
            ).slice(0, 3); 

            return {
                valorPedido: Math.floor(valorBase),
                aceitaEmprestimo: jogador.forca < 75 || necessidadeFinanceira > 80,
                aceitaTroca: true,
                postura: postura,
                paciencia: 4, 
                alvosTroca: alvosTroca
            };
        },

        atualizarListaTransferencias: function(game) {
            let lista = this.getListaTransferencias();
            if(Math.random() > 0.7) { 
                const timesCPU = game.times.filter(t => t.nome !== game.info.time);
                const timeAleatorio = timesCPU[Math.floor(Math.random() * timesCPU.length)];
                if(timeAleatorio && timeAleatorio.elenco.length > 18) {
                    const jogador = timeAleatorio.elenco[Math.floor(Math.random() * timeAleatorio.elenco.length)];
                    if (!lista.find(j => j.uid === jogador.uid) && jogador.forca < 85) {
                        const valorMercado = Math.floor(Math.pow(jogador.forca, 3) * 18);
                        lista.push({ ...jogador, valor: valorMercado, clube: timeAleatorio.nome });
                    }
                }
            }
            if (lista.length > 20) lista.shift();
            localStorage.setItem('brfutebol_transferencias', JSON.stringify(lista));
        },

        simularDispensasCPU: function(game) {
            let livres = this.getAgentesLivres();
            if (Math.random() > 0.85) { 
                const timesCPU = game.times.filter(t => t.nome !== game.info.time);
                const timeAleatorio = timesCPU[Math.floor(Math.random() * timesCPU.length)];
                if (timeAleatorio && timeAleatorio.elenco.length > 22) {
                    const candidatos = timeAleatorio.elenco.filter(j => j.forca < 70);
                    if (candidatos.length > 0) {
                        const dispensado = candidatos[Math.floor(Math.random() * candidatos.length)];
                        timeAleatorio.elenco = timeAleatorio.elenco.filter(j => j.uid !== dispensado.uid);
                        livres.push({ ...dispensado, valor: 0, clube: null, carac: "Dispensado" });
                        Engine.sistema.novaMensagem("Jogador Dispensado", `O ${timeAleatorio.nome} rescindiu com ${dispensado.nome}.`, 'info');
                    }
                }
            }
            localStorage.setItem('brfutebol_livres', JSON.stringify(livres));
        },

        removerJogador: function(uid, tipo) {
            let lista = tipo === 'livre' ? this.getAgentesLivres() : this.getListaTransferencias();
            lista = lista.filter(j => j.uid !== uid);
            localStorage.setItem(tipo === 'livre' ? 'brfutebol_livres' : 'brfutebol_transferencias', JSON.stringify(lista));
        }
    },

    // --- 9. MENSAGENS E FINANÇAS ---
    sistema: {
        novaMensagem: function(titulo, corpo, tipo = 'info', acao = null) {
            const game = Engine.carregarJogo();
            if (!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({ id: Date.now(), rodada: game.rodadaAtual, titulo, corpo, tipo, lida: false, acao });
            Engine.salvarJogo(game);
        },

        processarRodadaFinanceira: function(game, mandante, adversario) {
            if (!game.financas) game.financas = { saldo: 0, historico: [] };
            
            // 1. Bilheteria
            if (mandante) {
                const bilheteria = Engine.estadios.calcularBilheteria(adversario);
                game.recursos.dinheiro += bilheteria.rendaTotal;
                game.financas.historico.push({ texto: `Bilheteria vs ${adversario}`, valor: bilheteria.rendaTotal, tipo: 'entrada' });
            }

            // 2. Pagamento Mensal
            if (game.rodadaAtual % 4 === 0) {
                if (game.contratos && game.contratos.patrocinio) {
                    const val = game.contratos.patrocinio.mensal;
                    game.recursos.dinheiro += val;
                    game.financas.historico.push({ texto: `Patrocínio Master`, valor: val, tipo: 'entrada' });
                }
                if (game.contratos && game.contratos.tv) {
                    const val = game.contratos.tv.fixo;
                    game.recursos.dinheiro += val;
                    game.financas.historico.push({ texto: `Cota de TV`, valor: val, tipo: 'entrada' });
                }

                let folha = 0;
                const meuTime = game.times.find(t => t.nome === game.info.time);
                if(meuTime && meuTime.elenco) meuTime.elenco.forEach(j => folha += j.salario);
                
                game.recursos.dinheiro -= folha;
                game.financas.historico.push({ texto: `Folha Salarial`, valor: -folha, tipo: 'saida' });
            }

            const custo = 50000; 
            game.recursos.dinheiro -= custo;
            game.financas.historico.push({ texto: `Custos Jogo`, valor: -custo, tipo: 'saida' });
        },

        gerarPropostaTransferencia: function() {
            // Placeholder para manter compatibilidade, mas a lógica real está em Eventos.gerarPropostaCompra
        },
        
        aceitarVenda: function(msgId) {
            const game = Engine.carregarJogo();
            const msg = game.mensagens.find(m => m.id === msgId);
            if(msg && !msg.acao.processada) {
                game.recursos.dinheiro += msg.acao.valor;
                msg.acao.processada = true;
                Engine.salvarJogo(game);
                alert("Vendido!");
            }
        }
    },

    data: {
        getDataAtual: function(rodada) {
            return `Rodada ${rodada}`;
        }
    }
};
window.Engine = Engine;
