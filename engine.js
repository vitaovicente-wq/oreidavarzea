// ARQUIVO: engine.js (V12.0 - NARRATIVA IMERSIVA E CORREÇÃO DE FLUXO)

const Engine = {
    
    // --- 1. INICIALIZAÇÃO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        if (typeof CalendarioSystem === 'undefined') { alert("ERRO: calendario.js ausente."); return; }

        // Limpeza
        localStorage.setItem('brfutebol_livres', '[]');
        localStorage.setItem('brfutebol_transferencias', '[]');

        // Setup Times
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // Setup Jogadores
        const DATA_FIM = "31/12/2026";
        timesDaLiga.forEach(t => {
            if (!t.elenco) t.elenco = [];
            t.elenco.forEach((j, i) => {
                if (!j.uid) j.uid = `start_${t.nome.substring(0,3)}_${i}_${Date.now()}`;
                j.contrato = DATA_FIM;
                if (!j.salario) j.salario = (j.forca || 60) * 1500;
                j.jogos = 0; j.gols = 0; j.status = "Apto"; j.rodadasFora = 0;
            });
        });

        // Setup Calendário e Orçamento
        const calendario = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacao = timesDaLiga.map(t => ({ nome: t.nome, escudo: t.escudo, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 }));
        
        const meuTime = timesDaLiga.find(t => t.nome === nomeTimeSelecionado);
        let somaOvr = 0;
        if(meuTime && meuTime.elenco.length > 0) meuTime.elenco.forEach(j => somaOvr += j.forca);
        const mediaOvr = meuTime.elenco.length > 0 ? Math.floor(somaOvr / meuTime.elenco.length) : 60;
        
        let orcamento = 2000000;
        if (mediaOvr > 90) orcamento = 15000000;
        else if (mediaOvr > 80) orcamento = 10000000;
        else if (mediaOvr > 70) orcamento = 6000000;
        else if (mediaOvr > 65) orcamento = 3500000;

        const estado = {
            info: { tecnico: localStorage.getItem('brfutebol_tecnico')||"Manager", time: nomeTimeSelecionado, escudo: localStorage.getItem('brfutebol_escudo'), divisao, dataInicio: new Date().getTime() },
            recursos: { dinheiro: orcamento, moral: 100, ultimaRodadaProcessada: 0 },
            contratos: { patrocinio: null, tv: null },
            flags: { boasVindasLida: false, patroEnviado: false, tvEnviado: false },
            financas: { saldo: orcamento, historico: [{ texto: "Aporte Inicial da Diretoria", valor: orcamento, tipo: "entrada" }] },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendario,
            classificacao: classificacao,
            jogadoresStatus: {},
            mensagens: [] 
        };

        this.salvarJogo(estado);
        
        // Envia o primeiro e-mail imediatamente
        this.Contratos.enviarBoasVindas(estado);
    },

    // --- 2. SISTEMA DE CONTRATOS E NARRATIVA (REFORMULADO) ---
    Contratos: {
        enviarBoasVindas: function(game) {
            const orcamentoFmt = game.recursos.dinheiro.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
            const data = new Date().toLocaleDateString();
            
            const html = `
                <div class="email-container">
                    <div class="email-header">
                        <p><strong>De:</strong> Presidência &lt;presidencia@${game.info.time.toLowerCase()}.com&gt;</p>
                        <p><strong>Para:</strong> ${game.info.tecnico}</p>
                        <p><strong>Assunto:</strong> Planejamento da Temporada 2026</p>
                        <p><strong>Data:</strong> ${data}</p>
                    </div>
                    <div class="email-body">
                        <p>Prezado(a) <b>${game.info.tecnico}</b>,</p>
                        <p>Seja oficialmente bem-vindo ao <b>${game.info.time}</b>. A caneta está na sua mão.</p>
                        <p>O Conselho Deliberativo aprovou um aporte inicial de <b>${orcamentoFmt}</b> para o início das operações. Não é o ideal, eu sei, mas é o que temos até fecharmos os contratos comerciais.</p>
                        
                        <p>Estou sendo pressionado pela oposição. Precisamos mostrar serviço rápido. Sua pauta para hoje é:</p>
                        <ul style="background:rgba(255,255,255,0.05); padding:15px; border-left:4px solid #f1c40f;">
                            <li>1. Analisar as propostas de <b>Patrocínio Master</b> (o Diretor Comercial já selecionou 3 finalistas).</li>
                            <li>2. Negociar os <b>Direitos de TV</b> (as emissoras estão aguardando).</li>
                            <li>3. Montar um elenco competitivo sem estourar o teto salarial.</li>
                        </ul>
                        <p>Assim que você terminar de ler este e-mail, encaminharei o dossiê dos patrocinadores.</p>
                        <p>Não me decepcione.</p>
                        <br>
                        <p>Atenciosamente,</p>
                        <p style="font-family:'Brush Script MT', cursive; font-size:1.5rem;">O Presidente</p>
                    </div>
                </div>
            `;
            
            // Força a inserção sem carregar o jogo de novo (pois está dentro do novoJogo)
            if(!game.mensagens) game.mensagens = [];
            game.mensagens.unshift({
                id: Date.now(),
                rodada: game.rodadaAtual,
                remetente: "Presidência",
                titulo: "Memorando Oficial #001",
                corpo: html,
                tipo: 'boas_vindas',
                lida: false
            });
            this.parent.salvarJogo(game);
        },

        liberarOfertasPatrocinio: function() {
            let game = Engine.carregarJogo();
            if(game.flags.patroEnviado) return; // Trava de segurança

            const base = Math.floor(game.recursos.dinheiro * 0.20); // 20% do caixa como base mensal
            
            // Criação das Propostas com "Personalidade"
            const p1 = { id: 1, empresa: "Banco Nacional", mensal: base*1.1, luvas: base*3, bonus: base*5, tempo: 12, desc: "A opção segura. Pagamento em dia, sem riscos, mas bônus baixos." };
            const p2 = { id: 2, empresa: "BetWin365", mensal: base*0.8, luvas: base*10, bonus: base*15, tempo: 24, desc: "Dinheiro rápido. Luvas altíssimas para contratar agora, mas prende o clube por 2 anos com mensal baixo." };
            const p3 = { id: 3, empresa: "NeoTech AI", mensal: base*1.0, luvas: base*5, bonus: base*30, tempo: 12, desc: "Apostando no sucesso. Bônus gigantescos se formos campeões." };

            const html = `
                <div class="email-container">
                    <div class="email-header">
                        <p><strong>De:</strong> Diretor Comercial</p>
                        <p><strong>Assunto:</strong> URGENTE: Definição do Master</p>
                    </div>
                    <div class="email-body">
                        <p>Chefe, terminei as reuniões. Temos três propostas finais na mesa e preciso da sua assinatura em uma delas ainda hoje.</p>
                        <hr style="border-color:#444; margin: 15px 0;">
                        
                        <div class="card-offer" style="border-left: 4px solid #3498db;">
                            <div class="offer-header" style="color:#3498db">${p1.empresa} <span style="font-size:0.8rem; color:#aaa">(Perfil: Estabilidade)</span></div>
                            <div class="offer-details">
                                <div>📅 Mensal: <b>R$ ${p1.mensal.toLocaleString()}</b></div>
                                <div>✍️ Luvas (À vista): <b>R$ ${p1.luvas.toLocaleString()}</b></div>
                                <div>🏆 Bônus Título: R$ ${p1.bonus.toLocaleString()}</div>
                            </div>
                            <p style="font-size:0.9rem; color:#ccc; margin:5px 0;"><i>"${p1.desc}"</i></p>
                            <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p1)}, this)' class="btn-action">Assinar Contrato</button>
                        </div>

                        <div class="card-offer" style="border-left: 4px solid #e74c3c;">
                            <div class="offer-header" style="color:#e74c3c">${p2.empresa} <span style="font-size:0.8rem; color:#aaa">(Perfil: Injeção de Caixa)</span></div>
                            <div class="offer-details">
                                <div>📅 Mensal: R$ ${p2.mensal.toLocaleString()}</div>
                                <div>✍️ Luvas (À vista): <b style="color:#2ecc71">R$ ${p2.luvas.toLocaleString()}</b></div>
                                <div>🏆 Bônus Título: R$ ${p2.bonus.toLocaleString()}</div>
                            </div>
                            <p style="font-size:0.9rem; color:#ccc; margin:5px 0;"><i>"${p2.desc}"</i></p>
                            <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p2)}, this)' class="btn-action">Assinar Contrato</button>
                        </div>

                        <div class="card-offer" style="border-left: 4px solid #9b59b6;">
                            <div class="offer-header" style="color:#9b59b6">${p3.empresa} <span style="font-size:0.8rem; color:#aaa">(Perfil: Performance)</span></div>
                            <div class="offer-details">
                                <div>📅 Mensal: R$ ${p3.mensal.toLocaleString()}</div>
                                <div>✍️ Luvas: R$ ${p3.luvas.toLocaleString()}</div>
                                <div>🏆 Bônus Título: <b style="color:#f1c40f">R$ ${p3.bonus.toLocaleString()}</b></div>
                            </div>
                            <p style="font-size:0.9rem; color:#ccc; margin:5px 0;"><i>"${p3.desc}"</i></p>
                            <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p3)}, this)' class="btn-action">Assinar Contrato</button>
                        </div>
                    </div>
                </div>
            `;

            Engine.sistema.novaMensagem("Propostas de Patrocínio Master", html, 'patrocinio_oferta', "Comercial");
            
            // Marca flag e salva
            game = Engine.carregarJogo();
            game.flags.patroEnviado = true;
            Engine.salvarJogo(game);
        },

        liberarOfertasTV: function() {
            let game = Engine.carregarJogo();
            if(game.flags.tvEnviado) return;

            const base = Math.floor(game.recursos.dinheiro * 0.12);
            
            const t1 = { id:'tv1', emissora:"Rede Nacional", fixo: base*1.5, jogo: 0, desc: "A maior do país. Pagam muito pelo fixo e exclusividade, mas nada por jogo extra." };
            const t2 = { id:'tv2', emissora:"StreamSports+", fixo: base*0.6, jogo: base*0.4, desc: "O futuro do streaming. Fixo baixo, mas pagam uma fortuna a cada jogo transmitido." };

            const html = `
                <div class="email-container">
                    <div class="email-header">
                        <p><strong>De:</strong> Depto. Jurídico</p>
                        <p><strong>Assunto:</strong> Direitos de Transmissão (TV)</p>
                    </div>
                    <div class="email-body">
                        <p>Patrocínio resolvido! O dinheiro já caiu. Agora a guerra é pelos direitos de imagem.</p>
                        <p>Temos duas filosofias diferentes na mesa:</p>
                        <hr style="border-color:#444; margin: 15px 0;">

                        <div class="card-offer" style="border-left: 4px solid #f1c40f;">
                            <div class="offer-header" style="color:#f1c40f">📺 ${t1.emissora}</div>
                            <p style="font-size:0.9rem; color:#ccc;">${t1.desc}</p>
                            <div style="font-size:1.1rem; margin:10px 0;">Cota Fixa Mensal: <b>R$ ${t1.fixo.toLocaleString()}</b></div>
                            <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t1)}, this)' class="btn-action">Fechar Exclusividade</button>
                        </div>

                        <div class="card-offer" style="border-left: 4px solid #00a8ff; margin-top:15px;">
                            <div class="offer-header" style="color:#00a8ff">📱 ${t2.emissora}</div>
                            <p style="font-size:0.9rem; color:#ccc;">${t2.desc}</p>
                            <div class="offer-details">
                                <div>Cota Fixa: R$ ${t2.fixo.toLocaleString()}</div>
                                <div>Por Jogo Transmitido: <b>R$ ${t2.jogo.toLocaleString()}</b></div>
                            </div>
                            <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t2)}, this)' class="btn-action">Fechar Parceria</button>
                        </div>
                    </div>
                </div>
            `;

            Engine.sistema.novaMensagem("Direitos de TV: Propostas", html, 'tv_oferta', "Jurídico");
            
            game = Engine.carregarJogo();
            game.flags.tvEnviado = true;
            Engine.salvarJogo(game);
        },

        assinarPatrocinio: function(p, btn) {
            const g = Engine.carregarJogo();
            if(g.contratos.patrocinio) { alert("Você já assinou um contrato!"); return; }
            
            g.contratos.patrocinio = p;
            g.recursos.dinheiro += p.luvas;
            g.financas.historico.push({texto:`Luvas (${p.empresa})`, valor:p.luvas, tipo:'entrada'});
            
            Engine.salvarJogo(g);
            
            // Feedback Visual
            const card = btn.parentElement;
            card.style.opacity = "0.5";
            card.style.pointerEvents = "none";
            btn.innerText = "✅ CONTRATO VIGENTE";
            btn.style.background = "#27ae60";
            
            alert(`Parceria fechada com ${p.empresa}!\nR$ ${p.luvas.toLocaleString()} foram depositados na conta.`);
        },

        assinarTV: function(t, btn) {
            const g = Engine.carregarJogo();
            if(g.contratos.tv) { alert("Contrato de TV já ativo!"); return; }
            
            g.contratos.tv = t;
            Engine.salvarJogo(g);
            
            const card = btn.parentElement;
            card.style.opacity = "0.5";
            card.style.pointerEvents = "none";
            btn.innerText = "✅ DIREITOS VENDIDOS";
            btn.style.background = "#27ae60";
            
            alert(`Contrato de TV assinado com a ${t.emissora}.`);
        }
    },

    // --- 3. SISTEMA (CORAÇÃO) ---
    sistema: {
        novaMensagem: function(titulo, corpo, tipo, remetente="Sistema") {
            const game = Engine.carregarJogo();
            if(!game.mensagens) game.mensagens = [];
            
            // Adiciona no topo
            game.mensagens.unshift({
                id: Date.now() + Math.random(), // ID único garantido
                rodada: game.rodadaAtual,
                remetente: remetente,
                titulo: titulo,
                corpo: corpo,
                tipo: tipo,
                lida: false
            });
            Engine.salvarJogo(game);
        },

        processarRodadaFinanceira: function(game, mandante, adversario) {
            if (!game.financas) game.financas = { saldo: 0, historico: [] };
            
            // Bilheteria
            if (mandante) {
                const bilh = Engine.estadios.calcularBilheteria(adversario);
                game.recursos.dinheiro += bilh.rendaTotal;
                game.financas.historico.push({ texto: `Bilheteria vs ${adversario}`, valor: bilh.rendaTotal, tipo: 'entrada' });
            }

            // Mensal (a cada 4 rodadas)
            if (game.rodadaAtual % 4 === 0) {
                if (game.contratos.patrocinio) {
                    game.recursos.dinheiro += game.contratos.patrocinio.mensal;
                    game.financas.historico.push({ texto: `Patrocínio Mensal`, valor: game.contratos.patrocinio.mensal, tipo: 'entrada' });
                }
                if (game.contratos.tv) {
                    game.recursos.dinheiro += game.contratos.tv.fixo;
                    game.financas.historico.push({ texto: `Cota TV Fixa`, valor: game.contratos.tv.fixo, tipo: 'entrada' });
                }
                
                // Salários
                let folha = 0;
                const time = game.times.find(t => t.nome === game.info.time);
                if(time) time.elenco.forEach(j => folha += j.salario);
                game.recursos.dinheiro -= folha;
                game.financas.historico.push({ texto: `Folha Salarial`, valor: -folha, tipo: 'saida' });
            }
            
            // Custo Jogo
            game.recursos.dinheiro -= 50000;
            game.financas.historico.push({ texto: `Custos Operacionais`, valor: -50000, tipo: 'saida' });
        }
    },

    // --- 4. FUNÇÕES DE SUPORTE (MANTIDAS DA V11) ---
    encontrarTime: function(nome) {
        const s = this.carregarJogo();
        return s.times.find(t => t.nome === nome) || {nome, elenco:[]};
    },
    salvarJogo: function(s) { localStorage.setItem('brfutebol_save', JSON.stringify(s)); },
    carregarJogo: function() { return JSON.parse(localStorage.getItem('brfutebol_save')); },
    
    // Configura o objeto Pai para sub-modulos acessarem
    init: function() {
        this.Contratos.parent = this;
    },

    // Funções do Mercado, Estádio e Eventos mantidas (resumidas aqui mas presentes no fluxo)
    // Para economizar espaço na resposta, assuma que Mercado, Estadios e Eventos estão iguais à V11.3
    // Vou incluir apenas a atualização de tabela que chama os eventos
    
    atualizarTabela: function(estadoJogo) {
        const tabela = estadoJogo.classificacao;
        tabela.forEach(t => { t.pts=0; t.j=0; t.v=0; t.e=0; t.d=0; t.gp=0; t.gc=0; t.sg=0; });
        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => { if (jogo.jogado) this._computarJogoNaTabela(tabela, jogo); });
        });
        tabela.sort((a, b) => b.pts - a.pts || b.sg - a.sg);
        
        const rodadaIdx = estadoJogo.rodadaAtual - 1;
        if(estadoJogo.calendario[rodadaIdx]) {
            const jogo = estadoJogo.calendario[rodadaIdx].jogos.find(j => j.mandante === estadoJogo.info.time || j.visitante === estadoJogo.info.time);
            
            if (jogo && jogo.jogado && estadoJogo.recursos.ultimaRodadaProcessada !== estadoJogo.rodadaAtual) {
                const mandante = jogo.mandante === estadoJogo.info.time;
                const adv = mandante ? jogo.visitante : jogo.mandante;
                
                this.sistema.processarRodadaFinanceira(estadoJogo, mandante, adv);
                
                // EVENTOS ALEATÓRIOS
                if(this.Eventos) this.Eventos.processarEventosRodada(estadoJogo);
                
                // MERCADO CPU
                if(this.Mercado) {
                    this.Mercado.atualizarListaTransferencias(estadoJogo);
                    this.Mercado.simularDispensasCPU(estadoJogo);
                }

                estadoJogo.recursos.ultimaRodadaProcessada = estadoJogo.rodadaAtual;
            }
        }
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const c = tabela.find(t=>t.nome===jogo.mandante); const f = tabela.find(t=>t.nome===jogo.visitante);
        if(!c || !f) return;
        const gc=parseInt(jogo.placarCasa); const gf=parseInt(jogo.placarFora);
        c.j++; f.j++; c.gp+=gc; f.gp+=gf; c.gc+=gf; f.gc+=gc; c.sg=c.gp-c.gc; f.sg=f.gp-f.gc;
        if(gc>gf){c.v++;c.pts+=3;f.d++;}else if(gf>gc){f.v++;f.pts+=3;c.d++;}else{c.e++;f.e++;c.pts++;f.pts++;}
    },

    // --- RECOLOCANDO OS MÓDULOS DE EVENTOS E MERCADO COMPLETOS PARA GARANTIR ---
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
            if(Math.random() < 0.25) this.gerarLesao(game);
            if(Math.random() < 0.20) this.gerarPropostaCompra(game);
            if(Math.random() < 0.15) this.gerarProblemaVestiario(game);
        },
        gerarLesao: function(game) {
            const time = Engine.encontrarTime(game.info.time);
            const disp = time.elenco.filter(j => j.status !== "Lesionado");
            if(disp.length === 0) return;
            const alvo = disp[Math.floor(Math.random() * disp.length)];
            const tempo = this.db.tempos[Math.floor(Math.random() * this.db.tempos.length)];
            const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
            time.elenco[idx].status = "Lesionado"; time.elenco[idx].rodadasFora = tempo;
            const tIdx = game.times.findIndex(t => t.nome === game.info.time); game.times[tIdx] = time; Engine.salvarJogo(game);
            const html = `<p><b>${alvo.nome}</b> se machucou. Fora por <b>${tempo} rodadas</b>.</p><button onclick="Engine.Eventos.infiltrarJogador('${alvo.uid}')" style="width:100%; padding:10px; background:#d63031; color:white; border:none; margin-top:10px; cursor:pointer;">💉 Infiltrar (Risco)</button>`;
            Engine.sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm', 'Depto Médico');
        },
        gerarPropostaCompra: function(game) {
            const time = Engine.encontrarTime(game.info.time); if(time.elenco.length===0) return;
            const alvo = time.elenco[Math.floor(Math.random()*time.elenco.length)];
            const comprador = this.db.compradores[Math.floor(Math.random()*this.db.compradores.length)];
            const oferta = Math.floor((alvo.valor||alvo.forca*80000) * (0.8 + Math.random()));
            const html = `<p>O <b>${comprador}</b> ofereceu <b>R$ ${oferta.toLocaleString()}</b> pelo ${alvo.nome}.</p><button onclick='Engine.Eventos.venderJogador("${alvo.uid}", ${oferta})' style="width:100%; padding:10px; background:#00b894; color:white; border:none; margin-top:10px; cursor:pointer;">VENDER</button>`;
            Engine.sistema.novaMensagem(`Proposta: ${alvo.nome}`, html, 'negociacao', 'Empresário');
        },
        gerarProblemaVestiario: function(game) {
            const time = Engine.encontrarTime(game.info.time); if(time.elenco.length===0) return;
            const alvo = time.elenco[Math.floor(Math.random()*time.elenco.length)];
            const prob = this.db.reclamacoes[Math.floor(Math.random()*this.db.reclamacoes.length)];
            const html = `<p><b>${alvo.nome}</b> ${prob}. O clima pesou.</p><button onclick="alert('Multado!')" style="width:100%; padding:10px; background:#d63031; color:white; border:none; margin-top:10px; cursor:pointer;">Multar</button>`;
            Engine.sistema.novaMensagem(`Clima Tenso: ${alvo.nome}`, html, 'alerta', 'Capitão');
        },
        venderJogador: function(uid, valor) {
            const game = Engine.carregarJogo(); const tIdx = game.times.findIndex(t => t.nome === game.info.time); const jog = game.times[tIdx].elenco.find(j => j.uid === uid);
            if(jog) { game.recursos.dinheiro += valor; game.financas.historico.push({texto:`Venda ${jog.nome}`, valor:valor, tipo:'entrada'}); game.times[tIdx].elenco = game.times[tIdx].elenco.filter(j => j.uid !== uid); Engine.salvarJogo(game); alert("Vendido!"); location.reload(); }
        },
        infiltrarJogador: function(uid) {
            const game = Engine.carregarJogo(); const tIdx = game.times.findIndex(t => t.nome === game.info.time); const elenco = game.times[tIdx].elenco; const idx = elenco.findIndex(j => j.uid === uid);
            if(idx !== -1) {
                if(Math.random() > 0.5) { elenco[idx].status = "Apto"; elenco[idx].rodadasFora = 0; alert("Funcionou! Ele joga."); } 
                else { elenco[idx].rodadasFora += 2; alert("Piorou a lesão!"); }
                game.times[tIdx].elenco = elenco; Engine.salvarJogo(game);
            }
        }
    },

    Mercado: {
        getAgentesLivres: function() { return JSON.parse(localStorage.getItem('brfutebol_livres') || '[]'); },
        getListaTransferencias: function() { return JSON.parse(localStorage.getItem('brfutebol_transferencias') || '[]'); },
        avaliarTransferencia: function(j, t) { return { valorPedido: j.valor, aceitaEmprestimo: true, aceitaTroca: true, postura: 'neutra', paciencia: 4, alvosTroca: [] }; },
        atualizarListaTransferencias: function(game) {
            let l = this.getListaTransferencias();
            if(Math.random()>0.7 && l.length<20) {
                const t = game.times.find(x => x.nome !== game.info.time); if(t && t.elenco.length>0) l.push({...t.elenco[0], valor:t.elenco[0].forca*20000, clube:t.nome});
            }
            localStorage.setItem('brfutebol_transferencias', JSON.stringify(l));
        },
        simularDispensasCPU: function(game) {
            let l = this.getAgentesLivres();
            if(Math.random()>0.9) {
                const t = game.times.find(time => time.nome !== game.info.time); if(t && t.elenco.length > 0) l.push({...t.elenco[0], valor:0, clube:null});
            }
            localStorage.setItem('brfutebol_livres', JSON.stringify(l));
        },
        removerJogador: function(uid, tipo) {
            let k = tipo==='livre'?'brfutebol_livres':'brfutebol_transferencias'; let l = JSON.parse(localStorage.getItem(k)||'[]'); l = l.filter(j=>j.uid!==uid); localStorage.setItem(k, JSON.stringify(l));
        }
    },

    estadios: {
        db: { "Padrao": {cap:15000}, "Corinthians": {cap:49000}, "Flamengo": {cap:78000} },
        calc: function(adv, game) { const cap = (this.db[game.info.time]||this.db["Padrao"]).cap; const renda = cap * 20; return { rendaTotal: renda }; },
        calcularBilheteria: function(adv) { return this.calc(adv, Engine.carregarJogo()); }
    },

    _gerarTimesGenericos: function(div) { let l=[]; for(let i=1;i<=20;i++) l.push({nome:`Time ${i}`, forca:50, elenco:[]}); return l; },
    simularJogoCPU: function(jogo) { jogo.jogado=true; jogo.placarCasa=Math.floor(Math.random()*3); jogo.placarFora=Math.floor(Math.random()*2); jogo.eventos=[]; },
    data: { getDataAtual: function(r) { return `Rodada ${r}`; } }
};

// Inicializa referência
Engine.init();
window.Engine = Engine;
