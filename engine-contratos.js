// ARQUIVO: engine-contratos.js
// Responsável por: Contratos, Negociações e Travas de Segurança

Engine.Contratos = {
    _processando: false, // Trava de segurança contra cliques duplos

    // --- 1. MENSAGEM INICIAL (CONTEXTUALIZADA) ---
    enviarBoasVindas: function(game) {
        const meuTime = game.times.find(t => t.nome === game.info.time);
        const elenco = meuTime.elenco || [];
        const forcaMedia = meuTime.forca || 60;
        const div = game.info.divisao;

        // 1. Identifica o Craque
        let craque = { nome: "o elenco", forca: 0 };
        if (elenco.length > 0) {
            craque = elenco.reduce((p, c) => (p.forca > c.forca) ? p : c);
        }

        // 2. Define Contexto Narrativo
        let tom = {};
        
        if (div === 'serieA') {
            if (forcaMedia >= 80) {
                tom.assunto = "Planejamento: Hegemonia Nacional";
                tom.intro = "Não vou dourar a pílula: investimos milhões. A imprensa diz que somos favoritos, e a torcida não aceita menos que taças.";
                tom.meta = "🏆 <b>Obrigação:</b> Vaga direta na Libertadores ou Título.";
                tom.elenco = `⭐ <b>Liderança:</b> <b>${craque.nome}</b> é a referência técnica.`;
                tom.aviso = "Se terminarmos fora do G4, considere sua posição em risco.";
            } else if (forcaMedia >= 74) {
                tom.assunto = "Planejamento: Retomada de Confiança";
                tom.intro = "Temos camisa e história, mas precisamos de regularidade.";
                tom.meta = "🌎 <b>Meta Realista:</b> Vaga na Sul-Americana (Top 12).";
                tom.elenco = `🔄 <b>Gestão:</b> Temos bons nomes como <b>${craque.nome}</b>, mas o elenco é curto.`;
                tom.aviso = "Afastar o risco de rebaixamento cedo é crucial.";
            } else {
                tom.assunto = "Planejamento: Operação de Guerra";
                tom.intro = "Serei brutalmente honesto: somos cotados para cair. A pressão será insana.";
                tom.meta = "🛡️ <b>Meta Única:</b> 45 Pontos. Permanecer na Série A.";
                tom.elenco = `⚔️ <b>Vestiário:</b> <b>${craque.nome}</b> é o único com qualidade técnica superior.`;
                tom.aviso = "Cada ponto em casa vale ouro.";
            }
        } else {
            tom.assunto = "Planejamento: O Caminho do Acesso";
            tom.intro = "Nossa torcida não aguenta mais esta divisão. O lugar deste clube não é aqui.";
            tom.meta = "📈 <b>Obrigação:</b> Subir de divisão (G4).";
            tom.elenco = `💎 <b>Destaque:</b> <b>${craque.nome}</b> sobra tecnicamente nesta liga.`;
            tom.aviso = "O fracasso não é uma opção.";
        }

        const html = `
            <div class="email-container" style="font-family:'Georgia', serif; line-height:1.6; color:#ddd;">
                <div style="border-bottom:2px solid #f1c40f; padding-bottom:15px; margin-bottom:20px;">
                    <div style="font-family:'Rajdhani'; font-weight:bold; color:#f1c40f; font-size:1.2rem; letter-spacing:2px;">CONFIDENCIAL: DIRETORIA DE FUTEBOL</div>
                    <div style="display:grid; grid-template-columns: auto 1fr; gap:10px; margin-top:10px; font-size:0.9rem; color:#aaa;">
                        <b>DE:</b> Presidente do Conselho
                        <b>PARA:</b> ${game.info.tecnico}
                        <b>DATA:</b> ${new Date().toLocaleDateString()}
                    </div>
                    <div style="margin-top:10px; font-size:1.1rem; color:#fff; font-weight:bold;">${tom.assunto}</div>
                </div>
                <p>Prezado(a),</p>
                <p>${tom.intro}</p>
                <div style="background:#1a1d21; border-left:4px solid #3498db; padding:15px; margin:20px 0;">
                    <h4 style="margin:0 0 10px 0; color:#3498db;">📋 DIRETRIZES ESTRATÉGICAS</h4>
                    <ul style="margin:0; padding-left:20px; list-style-type:circle;">
                        <li style="margin-bottom:8px;">${tom.meta}</li>
                        <li style="margin-bottom:8px;">${tom.elenco}</li>
                        <li>💰 <b>Finanças:</b> Caixa inicial de <b>${game.recursos.dinheiro.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</b>.</li>
                    </ul>
                </div>
                <p>${tom.aviso}</p>
                <p>O Diretor Comercial apresentará as propostas de patrocínio a seguir.</p>
                <br>
                <p style="font-family:'Brush Script MT', cursive; font-size:1.5rem;">A Presidência</p>
            </div>
        `;

        if(!game.mensagens) game.mensagens = [];
        game.mensagens.unshift({ id: Date.now(), rodada: 1, remetente: "Presidência", titulo: "Memorando #001: Diretrizes", corpo: html, tipo: 'boas_vindas', lida: false });
        Engine.salvarJogo(game);
    },

    // --- 2. PATROCÍNIOS ---
    liberarOfertasPatrocinio: function() {
        const game = Engine.carregarJogo();
        if(game.flags.patroEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.18);
        const props = [
            {id:1, nome:"Banco Nacional", mensal:base*1.2, luvas:base*1.5, bonus:0, duracao:38, desc:"Conservador. Salário em dia.", tipo:"financeiro"},
            {id:2, nome:"BetWin365", mensal:base*0.8, luvas:base*5.0, bonus:base*10.0, duracao:38, desc:"Apostador. Bônus alto.", tipo:"bet"},
            {id:3, nome:"NeoTech AI", mensal:base*0.5, luvas:base*2.0, bonus:base*25.0, duracao:38, desc:"Unicórnio. Bônus surreal.", tipo:"tech"},
            {id:4, nome:"EnergiaBR", mensal:base*1.1, luvas:base*0.5, bonus:base*2.0, duracao:76, desc:"Estatal. Longo Prazo.", tipo:"estatal"},
            {id:5, nome:"MegaLoja", mensal:base*0.7, luvas:base*8.0, bonus:base*1.0, duracao:19, desc:"Varejo. Luvas AGORA.", tipo:"varejo"},
            {id:6, nome:"BitMarket", mensal:base*1.3, luvas:base*3.0, bonus:base*5.0, duracao:38, desc:"Volátil. Cripto.", tipo:"crypto"},
            {id:7, nome:"FlyHigh", mensal:base*1.0, luvas:base*2.0, bonus:base*8.0, duracao:38, desc:"Global. Grife.", tipo:"aereo"}
        ];

        let html = `<p>Diretoria, filtrei o mercado. Temos 7 propostas.</p><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:15px; margin-top:20px;">`;
        
        props.forEach(p => {
            let cor = p.tipo==='bet'?'#e74c3c':(p.tipo==='financeiro'?'#2ecc71':(p.tipo==='tech'?'#9b59b6':'#444'));
            html += `
            <div style="background:#15191d; border-top:3px solid ${cor}; padding:15px; border-radius:8px;">
                <div style="font-weight:bold; font-size:1.1rem; color:#fff;">${p.nome}</div>
                <div style="font-size:0.8rem; color:#aaa; margin-bottom:5px;">${p.duracao} Rodadas</div>
                <div style="font-size:0.85rem; color:#aaa; margin-bottom:10px;">${p.desc}</div>
                <div style="font-size:0.9rem;">Luvas: <span style="color:#2ecc71;">R$ ${(p.luvas/1000000).toFixed(1)}M</span></div>
                <div style="font-size:0.9rem;">Mensal: <span>R$ ${(p.mensal/1000000).toFixed(1)}M</span></div>
                <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p)}, this)' class="btn-action" style="width:100%; margin-top:10px; background:${cor}; color:#fff; border:none; padding:8px; cursor:pointer;">ASSINAR</button>
            </div>`;
        });
        html += `</div>`;

        Engine.Sistema.novaMensagem("Dossiê Comercial", html, 'patrocinio_oferta', "Comercial");
        const g2 = Engine.carregarJogo(); g2.flags.patroEnviado = true; Engine.salvarJogo(g2);
    },

    // --- 3. TV ---
    liberarOfertasTV: function() {
        const game = Engine.carregarJogo();
        if(game.flags.tvEnviado) return;
        const base = Math.floor(game.recursos.dinheiro * 0.12);
        const tvs = [
            {id:'t1', emissora:"Rede Nacional", fixo:base*2.0, jogo:0, duracao:38, desc:"Aberta. Fixo Garantido."},
            {id:'t2', emissora:"Cabo Sports", fixo:base*1.0, jogo:base*0.3, duracao:38, desc:"Fechada. Híbrido."},
            {id:'t3', emissora:"StreamMax", fixo:base*0.2, jogo:base*1.0, duracao:38, desc:"Digital. Ganha por jogo."},
            {id:'t4', emissora:"Consórcio Global", fixo:base*1.3, jogo:base*0.1, duracao:76, desc:"Internacional. 2 Anos."}
        ];
        let html = `<p>Direitos de TV:</p><div style="display:grid; gap:10px;">`;
        tvs.forEach(t => {
            html += `
            <div style="background:#222; padding:15px; border-left:4px solid #fff; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-weight:bold;">${t.emissora}</div>
                    <div style="font-size:0.8rem;">Fixo: R$ ${(t.fixo/1000000).toFixed(1)}M</div>
                </div>
                <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t)}, this)' class="btn-action" style="padding:5px 15px; cursor:pointer;">Assinar</button>
            </div>`;
        });
        html += `</div>`;
        Engine.Sistema.novaMensagem("Leilão de TV", html, 'tv_oferta', "Jurídico");
        const g2 = Engine.carregarJogo(); g2.flags.tvEnviado = true; Engine.salvarJogo(g2);
    },

    // --- AÇÕES ---
    assinarPatrocinio: function(p, btn) {
        if(this._processando) return; this._processando = true;
        const g = Engine.carregarJogo();
        if(g.contratos.patrocinio) { alert("Já existe contrato!"); this._processando=false; return; }
        g.contratos.patrocinio = p; g.recursos.dinheiro += p.luvas;
        g.financas.historico.push({texto:`Luvas (${p.nome})`, valor:p.luvas, tipo:'entrada'});
        Engine.salvarJogo(g); 
        btn.parentElement.innerHTML = `<div style="background:#2ecc71; color:#fff; padding:10px; text-align:center;">✅ ASSINADO: ${p.nome}</div>`;
        alert(`Assinado com ${p.nome}!`);
        this._processando = false;
    },

    assinarTV: function(t, btn) {
        if(this._processando) return; this._processando = true;
        const g = Engine.carregarJogo();
        if(g.contratos.tv) { alert("Já existe TV!"); this._processando=false; return; }
        g.contratos.tv = t; 
        Engine.salvarJogo(g); 
        btn.parentElement.innerHTML = `<div style="background:#2ecc71; color:#fff; padding:10px; text-align:center;">✅ FECHADO: ${t.emissora}</div>`;
        alert(`TV Fechada com ${t.emissora}!`);
        this._processando = false;
    },

    processarVencimentos: function(game) {
        let mudou = false;
        if (game.contratos.patrocinio) {
            game.contratos.patrocinio.duracao--;
            if (game.contratos.patrocinio.duracao <= 0) {
                Engine.Sistema.novaMensagem("Fim de Contrato", `Acabou o patrocínio.`, "info", "Jurídico");
                game.contratos.patrocinio = null; game.flags.patroEnviado = false; mudou = true;
            }
        }
        if (game.contratos.tv) {
            game.contratos.tv.duracao--;
            if (game.contratos.tv.duracao <= 0) {
                Engine.Sistema.novaMensagem("Fim de Contrato", `Acabou a TV.`, "info", "Jurídico");
                game.contratos.tv = null; game.flags.tvEnviado = false; mudou = true;
            }
        }
        if(mudou) Engine.salvarJogo(game);
    }
};
