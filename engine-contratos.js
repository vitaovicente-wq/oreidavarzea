// ARQUIVO: engine-contratos.js
// Responsável por: Contratos, Negociações e Travas de Segurança

Engine.Contratos = {
    _processando: false, // Trava de segurança contra cliques duplos

    // --- 1. MENSAGEM INICIAL ---
    enviarBoasVindas: function(game) {
        const meuTime = game.times.find(t => t.nome === game.info.time);
        const elenco = meuTime.elenco || [];
        let destaque = "o elenco";
        
        if(elenco.length > 0) {
            const craque = elenco.reduce((p, c) => (p.forca > c.forca) ? p : c);
            destaque = craque.nome;
        }

        const div = game.info.divisao;
        let msgTitulo = "Metas da Temporada";
        let msgTexto = "Precisamos organizar a casa.";

        if(div === 'serieA') {
            msgTitulo = "Planejamento de Elite";
            msgTexto = `Estamos na vitrine. A torcida exige que <b>${destaque}</b> lidere o time rumo às vitórias. Evite o Z4 a todo custo.`;
        } else {
            msgTitulo = "Projeto Acesso";
            msgTexto = `Nossa realidade hoje é dura, mas o objetivo é subir. Use <b>${destaque}</b> como referência técnica.`;
        }

        const html = `
            <div class="email-container">
                <div style="border-bottom:1px solid #444; margin-bottom:10px; padding-bottom:10px;">
                    <div style="font-size:0.8rem; color:#888;">DE: PRESIDÊNCIA</div>
                    <div style="font-size:1.1rem; font-weight:bold; color:#fff;">${msgTitulo}</div>
                </div>
                <p>${msgTexto}</p>
                <div style="background:#222; padding:10px; border-left:3px solid #f1c40f; margin:15px 0;">
                    <ul style="margin:0; padding-left:15px; color:#ccc;">
                        <li>💰 <b>Finanças:</b> Defina Patrocínio e TV hoje.</li>
                        <li>🏆 <b>Campo:</b> Cumpra a expectativa da diretoria.</li>
                    </ul>
                </div>
                <p>O Diretor Comercial enviará as propostas a seguir.</p>
            </div>
        `;

        if(!game.mensagens) game.mensagens = [];
        game.mensagens.unshift({ id: Date.now(), rodada: 1, remetente: "Presidência", titulo: "Memorando Oficial #001", corpo: html, tipo: 'boas_vindas', lida: false });
        Engine.salvarJogo(game);
    },

    // --- 2. PATROCÍNIOS ---
    liberarOfertasPatrocinio: function() {
        const game = Engine.carregarJogo();
        if(game.flags.patroEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.18);
        const props = [
            {id:1, nome:"Banco Nacional", mensal:base*1.2, luvas:base*1.5, bonus:0, duracao:38, desc:"Seguro. Mensal alto, zero bônus.", tipo:"financeiro"},
            {id:2, nome:"BetWin365", mensal:base*0.8, luvas:base*5.0, bonus:base*10.0, duracao:38, desc:"Risco. Bônus alto por título.", tipo:"bet"},
            {id:3, nome:"NeoTech AI", mensal:base*0.5, luvas:base*2.0, bonus:base*25.0, duracao:38, desc:"Performance pura.", tipo:"tech"},
            {id:4, nome:"EnergiaBR", mensal:base*1.1, luvas:base*0.5, bonus:base*2.0, duracao:76, desc:"Longo Prazo (2 Anos).", tipo:"estatal"},
            {id:5, nome:"MegaLoja", mensal:base*0.7, luvas:base*8.0, bonus:base*1.0, duracao:19, desc:"Emergência. Luvas altas, contrato curto.", tipo:"varejo"},
            {id:6, nome:"BitMarket", mensal:base*1.3, luvas:base*3.0, bonus:base*5.0, duracao:38, desc:"Volátil. Valores altos.", tipo:"crypto"},
            {id:7, nome:"FlyHigh", mensal:base*1.0, luvas:base*2.0, bonus:base*8.0, duracao:38, desc:"Prestígio Internacional.", tipo:"aereo"}
        ];

        let html = `<p>Escolha o Master. Cuidado com a duração.</p><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:10px;">`;
        
        props.forEach(p => {
            let cor = p.tipo==='bet'?'#e74c3c':(p.tipo==='financeiro'?'#2ecc71':'#444');
            html += `
            <div style="background:#1a1d21; border-top:3px solid ${cor}; padding:10px; border-radius:5px;">
                <div style="font-weight:bold;">${p.nome}</div>
                <div style="font-size:0.8rem; color:#aaa; margin-bottom:5px;">${p.duracao} Rodadas</div>
                <div style="font-size:0.8rem;">Luvas: <span style="color:#2ecc71">R$ ${(p.luvas/1000000).toFixed(1)}M</span></div>
                <div style="font-size:0.8rem;">Mensal: <span>R$ ${(p.mensal/1000000).toFixed(1)}M</span></div>
                <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p)}, this)' class="btn-action" style="width:100%; margin-top:10px; background:${cor}; color:#fff; border:none; padding:8px; cursor:pointer;">ASSINAR</button>
            </div>`;
        });
        html += `</div>`;

        Engine.Sistema.novaMensagem("Propostas de Patrocínio", html, 'patrocinio_oferta', "Comercial");
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
            {id:'t4', emissora:"Global", fixo:base*1.3, jogo:base*0.1, duracao:76, desc:"Internacional. 2 Anos."}
        ];

        let html = `<p>Direitos de Transmissão:</p><div style="display:flex; flex-direction:column; gap:10px;">`;
        tvs.forEach(t => {
            html += `
            <div style="background:#222; padding:10px; border-left:4px solid #fff; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-weight:bold;">${t.emissora}</div>
                    <div style="font-size:0.8rem;">Fixo: R$ ${(t.fixo/1000000).toFixed(1)}M | Por Jogo: R$ ${(t.jogo/1000000).toFixed(2)}M</div>
                </div>
                <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t)}, this)' class="btn-action" style="padding:5px 15px; cursor:pointer;">Assinar</button>
            </div>`;
        });
        html += `</div>`;

        Engine.Sistema.novaMensagem("Propostas de TV", html, 'tv_oferta', "Jurídico");
        const g2 = Engine.carregarJogo(); g2.flags.tvEnviado = true; Engine.salvarJogo(g2);
    },

    // --- AÇÕES COM TRAVA E FEEDBACK ---
    assinarPatrocinio: function(p, btn) {
        if(this._processando) return; // Trava física
        this._processando = true;

        const g = Engine.carregarJogo();
        if(g.contratos.patrocinio) { 
            alert("Erro: Você já possui um patrocinador ativo.");
            this._processando = false;
            return; 
        }

        // Salva
        g.contratos.patrocinio = p;
        g.recursos.dinheiro += p.luvas;
        g.financas.historico.push({texto:`Luvas (${p.nome})`, valor:p.luvas, tipo:'entrada'});
        Engine.salvarJogo(g);

        // Feedback Visual no HTML
        const container = btn.closest('.email-container') || btn.parentElement.parentElement;
        container.innerHTML = `
            <div style="background:#2ecc71; color:#fff; padding:20px; text-align:center; border-radius:8px;">
                <h3 style="margin:0;">✅ CONTRATO ASSINADO!</h3>
                <p>Parceria fechada com <b>${p.nome}</b>.</p>
                <p>Luvas de <b>R$ ${p.luvas.toLocaleString()}</b> creditadas.</p>
            </div>
        `;
        
        this._processando = false;
    },

    assinarTV: function(t, btn) {
        if(this._processando) return;
        this._processando = true;

        const g = Engine.carregarJogo();
        if(g.contratos.tv) { 
            alert("Erro: Contrato de TV já ativo.");
            this._processando = false;
            return; 
        }

        g.contratos.tv = t;
        Engine.salvarJogo(g);

        const container = btn.closest('.email-container') || btn.parentElement.parentElement;
        container.innerHTML = `
            <div style="background:#2ecc71; color:#fff; padding:20px; text-align:center; border-radius:8px;">
                <h3 style="margin:0;">✅ DIREITOS VENDIDOS!</h3>
                <p>Transmissão exclusiva: <b>${t.emissora}</b>.</p>
                <p>Duração: ${t.duracao} Rodadas.</p>
            </div>
        `;

        this._processando = false;
    },

    processarVencimentos: function(game) {
        // Lógica de vencimento mantida (igual à anterior)
        // ... (código resumido pois já está no V14 e funciona)
        if(game.contratos.patrocinio) {
            game.contratos.patrocinio.duracao--;
            if(game.contratos.patrocinio.duracao <= 0) {
                Engine.Sistema.novaMensagem("Fim de Contrato", `Acabou o contrato com ${game.contratos.patrocinio.nome}.`, "info", "Jurídico");
                game.contratos.patrocinio = null; game.flags.patroEnviado = false; Engine.salvarJogo(game);
            }
        }
        if(game.contratos.tv) {
            game.contratos.tv.duracao--;
            if(game.contratos.tv.duracao <= 0) {
                Engine.Sistema.novaMensagem("Fim de Contrato", `Acabou o contrato com ${game.contratos.tv.emissora}.`, "info", "Jurídico");
                game.contratos.tv = null; game.flags.tvEnviado = false; Engine.salvarJogo(game);
            }
        }
    }
};
