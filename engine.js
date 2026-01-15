// ARQUIVO: engine.js (V10.2 - CORREÇÃO DE SINTAXE E INICIALIZAÇÃO)

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

        // 3. Configura Jogadores Iniciais
        const DATA_FIM_PADRAO = "31/12/2026";
        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
            t.elenco.forEach((jogador, idx) => {
                if (!jogador.uid) jogador.uid = `start_${t.nome.substring(0,3)}_${idx}_${Date.now()}`;
                jogador.contrato = DATA_FIM_PADRAO;
                if (!jogador.salario) jogador.salario = (jogador.forca || 60) * 1500;
                jogador.jogos = 0;
                jogador.gols = 0;
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
                rodadaFinanceiraProcessada: false 
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

    // --- 2. SISTEMA DE CONTRATOS E MENSAGENS AVANÇADO ---
    Contratos: {
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
            const game = Engine.carregarJogo();
            if(game.flags.patroEnviado) return;

            const baseVal = Math.floor(game.recursos.dinheiro * 0.15); 
            
            const p1 = { id: 1, empresa: "Banco Nacional", mensal: Math.floor(baseVal * 1.2), luvas: Math.floor(baseVal * 2), bonusTitulo: Math.floor(baseVal * 5), duracao: 12, desc: "Pagamento mensal alto e garantido." };
            const p2 = { id: 2, empresa: "BetWin365", mensal: Math.floor(baseVal * 0.7), luvas: Math.floor(baseVal * 8), bonusTitulo: Math.floor(baseVal * 20), duracao: 24, desc: "Luvas altíssimas agora. Mensal baixo." };
            const p3 = { id: 3, empresa: "NeoTech Systems", mensal: Math.floor(baseVal), luvas: Math.floor(baseVal * 4), bonusTitulo: Math.floor(baseVal * 8), duracao: 12, desc: "Proposta equilibrada." };

            // Importante: .replace(/"/g, '&quot;') evita quebra de HTML
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
                        <div style="margin:10px 0;">
                            <div>💰 Mensal: <b>R$ ${p1.mensal.toLocaleString()}</b></div>
                            <div>📝 Luvas: <b>R$ ${p1.luvas.toLocaleString()}</b></div>
                        </div>
                        <button onclick="Engine.Contratos.assinarPatrocinio(${strP1}, this)" class="btn-email">Assinar com ${p1.empresa}</button>
                    </div>

                    <div style="background:#1a1a1a; padding:15px; border-radius:5px; margin-bottom:15px; border-left:4px solid #e74c3c;">
                        <h3 style="margin:0; color:#e74c3c;">Opção B: ${p2.empresa}</h3>
                        <p style="font-size:0.9rem; color:#aaa; margin-top:5px;"><i>"${p2.desc}"</i></p>
                        <div style="margin:10px 0;">
                            <div>💰 Mensal: R$ ${p2.mensal.toLocaleString()}</div>
                            <div>📝 Luvas: <b style="color:#00ff88">R$ ${p2.luvas.toLocaleString()}</b></div>
                        </div>
                        <button onclick="Engine.Contratos.assinarPatrocinio(${strP2}, this)" class="btn-email">Assinar com ${p2.empresa}</button>
                    </div>

                    <div style="background:#1a1a1a; padding:15px; border-radius:5px; border-left:4px solid #9b59b6;">
                        <h3 style="margin:0; color:#9b59b6;">Opção C: ${p3.empresa}</h3>
                        <p style="font-size:0.9rem; color:#aaa; margin-top:5px;"><i>"${p3.desc}"</i></p>
                        <div style="margin:10px 0;">
                            <div>💰 Mensal: R$ ${p3.mensal.toLocaleString()}</div>
                            <div>📝 Luvas: R$ ${p3.luvas.toLocaleString()}</div>
                        </div>
                        <button onclick="Engine.Contratos.assinarPatrocinio(${strP3}, this)" class="btn-email">Assinar com ${p3.empresa}</button>
                    </div>
                </div>
            `;

            Engine.sistema.novaMensagem("URGENTE: Definição de Patrocínio Master", html, 'patrocinio_oferta');
            game.flags.patroEnviado = true;
            Engine.salvarJogo(game);
        },

        liberarOfertasTV: function() {
            const game = Engine.carregarJogo();
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
            pai.innerHTML = `<div style="padding:20px; text-align:center; background:#111; color:#00ff88; border:1px solid #00ff88;">
                <h3>✅ CONTRATO ASSINADO</h3>
                <p>A <b>${proposta.empresa}</b> é nossa nova parceira!</p>
                <p>Recebemos R$ ${proposta.luvas.toLocaleString()} de luvas.</p>
            </div>`;
            
            alert(`Parceria fechada!`);
        },

        assinarTV: function(proposta, btnElement) {
            const game = Engine.carregarJogo();
            if(game.contratos.tv) { alert("Já assinado!"); return; }
            
            game.contratos.tv = proposta;
            Engine.salvarJogo(game);
            
            const pai = btnElement.parentElement.parentElement;
            pai.innerHTML = `<div style="padding:20px; text-align:center; background:#111; color:#f1c40f; border:1px solid #f1c40f;">
                <h3>✅ DIREITOS VENDIDOS</h3>
                <p>Transmissões exclusivas na <b>${proposta.emissora}</b>.</p>
            </div>`;
            
            alert(`Contrato de TV assinado.`);
        }
    },

    // --- 3. SISTEMA DE BUSCA ---
    encontrarTime: function(nomeTime) {
        const save = this.carregarJogo();
        if (!save || !save.times) return { nome: nomeTime, forca: 0, elenco: [] };
        return save.times.find(t => t.nome === nomeTime) || { nome: nomeTime, forca: 0, elenco: [] };
    },

    getMeuTime: function() {
        const save = this.carregarJogo();
        if (!save) return null;
        return this.encontrarTime(save.info.time);
    },

    // --- 4. SAVE / LOAD ---
    salvarJogo: function(estado) {
        localStorage.setItem('brfutebol_save', JSON.stringify(estado));
    },

    carregarJogo: function() {
        const saveJson = localStorage.getItem('brfutebol_save');
        return saveJson ? JSON.parse(saveJson) : null;
    },

    // --- 5. ATUALIZAÇÃO DA TABELA ---
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
            if (jogoPlayer && jogoPlayer.jogado && !estadoJogo.recursos.rodadaFinanceiraProcessada) {
                const isMandante = jogoPlayer.mandante === estadoJogo.info.time;
                const adversario = isMandante ? jogoPlayer.visitante : jogoPlayer.mandante;
                
                this.sistema.processarRodadaFinanceira(estadoJogo, isMandante, adversario);
                this.sistema.gerarPropostaTransferencia(); 
                this.Mercado.atualizarListaTransferencias(estadoJogo); 
                this.Mercado.simularDispensasCPU(estadoJogo);       
                estadoJogo.recursos.rodadaFinanceiraProcessada = true;
            }
        }
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);
        if (!timeCasa || !timeFora) return;
        const gc = parseInt(jogo.placarCasa);
        const gf = parseInt(jogo.placarFora);
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
        db: { "Padrao": { nome: "Estádio Municipal", cap: 15000 }, "Corinthians": { nome: "Neo Química Arena", cap: 49000 }, "Flamengo": { nome: "Maracanã", cap: 78000 } },
        getEstadio: function() {
            const game = Engine.carregarJogo();
            const timeNome = game.info.time;
            const dadosBase = this.db[timeNome] || this.db["Padrao"];
            const config = game.estadio || { precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 }, manutencao: 100 };
            return { ...dadosBase, ...config };
        },
        calcularBilheteria: function(adversarioNome) {
            const game = Engine.carregarJogo();
            const estadio = this.getEstadio();
            const moral = game.recursos.moral || 50; 
            let demandaBase = moral / 100; 
            const capGeral = Math.floor(estadio.cap * 0.50);
            const pubGeral = Math.floor(Math.min(capGeral, capGeral * demandaBase));
            const renda = pubGeral * estadio.precos.geral; 
            return { publico: pubGeral, rendaTotal: renda };
        }
    },

    // --- 8. MERCADO ---
    Mercado: {
        getAgentesLivres: function() { return JSON.parse(localStorage.getItem('brfutebol_livres') || '[]'); },
        getListaTransferencias: function() { return JSON.parse(localStorage.getItem('brfutebol_transferencias') || '[]'); },
        
        avaliarTransferencia: function(jogador, meuTime) {
            const necessidade = Math.floor(Math.random() * 100);
            let valorBase = jogador.valor;
            let postura = 'neutra';
            if (jogador.forca > 80) { valorBase *= 1.3; postura = 'dura'; } 
            else if (necessidade > 70) { valorBase *= 0.85; postura = 'flexivel'; }
            const alvosTroca = meuTime.elenco.filter(j => j.pos === jogador.pos).slice(0, 3);
            return { valorPedido: Math.floor(valorBase), aceitaEmprestimo: jogador.forca < 75, aceitaTroca: true, postura, paciencia: 4, alvosTroca };
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

    // --- 9. SISTEMA FINANCEIRO E MENSAGENS ---
    sistema: {
        novaMensagem: function(titulo, corpo, tipo = 'info', acao = null) {
            const game = Engine.carregarJogo();
            if (!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({ id: Date.now(), rodada: game.rodadaAtual, titulo, corpo, tipo, lida: false, acao });
            Engine.salvarJogo(game);
        },

        processarRodadaFinanceira: function(game, mandante, adversario) {
            if (!game.financas) game.financas = { saldo: 0, historico: [] };
            
            if (mandante) {
                const bilheteria = Engine.estadios.calcularBilheteria(adversario);
                game.recursos.dinheiro += bilheteria.rendaTotal;
                game.financas.historico.push({ texto: `Bilheteria vs ${adversario}`, valor: bilheteria.rendaTotal, tipo: 'entrada' });
            }

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
            const game = Engine.carregarJogo();
            if(Math.random() > 0.15) return;
            const meuTime = Engine.encontrarTime(game.info.time);
            if(meuTime.elenco.length > 0) {
                const jog = meuTime.elenco[Math.floor(Math.random()*meuTime.elenco.length)];
                Engine.sistema.novaMensagem("Proposta", `Oferta por ${jog.nome}`, 'proposta', { uid: jog.uid, valor: jog.forca * 80000 });
            }
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
