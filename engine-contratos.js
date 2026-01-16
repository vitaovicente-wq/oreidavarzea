// ARQUIVO: engine-contratos.js
// Responsável por: Propostas, Assinaturas e Gestão de Validade

Engine.Contratos = {
    
    // --- LÓGICA DE TEMPO (NOVO) ---
    processarVencimentos: function(game) {
        let mudouAlgo = false;

        // 1. Processa Patrocínio
        if (game.contratos.patrocinio) {
            game.contratos.patrocinio.duracao--; // Tira 1 rodada
            
            // Se acabou
            if (game.contratos.patrocinio.duracao <= 0) {
                // Manda e-mail avisando
                const html = `<p>O contrato com a <b>${game.contratos.patrocinio.nome}</b> encerrou hoje.</p><p>Não estamos mais recebendo verba mensal. O Depto. Comercial já está buscando novos parceiros. Aguarde novas propostas na próxima rodada.</p>`;
                Engine.Sistema.novaMensagem("Fim de Contrato: Patrocínio Master", html, "info", "Jurídico");
                
                // Remove o contrato e reseta a flag para receber novas propostas
                game.contratos.patrocinio = null;
                game.flags.patroEnviado = false; 
                mudouAlgo = true;
            }
        }

        // 2. Processa TV
        if (game.contratos.tv) {
            game.contratos.tv.duracao--;
            
            if (game.contratos.tv.duracao <= 0) {
                const html = `<p>Os direitos de transmissão com a <b>${game.contratos.tv.emissora}</b> expiraram.</p><p>Estamos sem cobertura de TV. Precisamos fechar um novo acordo urgente.</p>`;
                Engine.Sistema.novaMensagem("Fim de Contrato: TV", html, "info", "Jurídico");
                
                game.contratos.tv = null;
                game.flags.tvEnviado = false;
                mudouAlgo = true;
            }
        }

        if(mudouAlgo) Engine.salvarJogo(game);
    },

    // --- MENSAGENS E PROPOSTAS ---

    enviarBoasVindas: function(game) {
        const corpo = `
            <div class="email-container">
                <p>Prezado(a) <b>${game.info.tecnico}</b>,</p>
                <p>O Conselho aprovou o orçamento inicial de <b>${game.recursos.dinheiro.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</b>.</p>
                <div style="background:#222; padding:15px; border-left:4px solid #f1c40f; margin:15px 0;">
                    <strong>📝 PRIORIDADES:</strong>
                    <ul style="margin-top:5px; color:#ccc;">
                        <li><b>Patrocínio:</b> Defina quem estampará nossa camisa. Atenção à duração dos contratos!</li>
                        <li><b>TV:</b> Garanta as cotas de transmissão.</li>
                    </ul>
                </div>
                <p>Atenciosamente,<br><i>Conselho de Administração</i></p>
            </div>
        `;
        
        if(!game.mensagens) game.mensagens = [];
        game.mensagens.unshift({ id: Date.now(), rodada: 1, remetente: "Presidência", titulo: "Memorando Oficial #001", corpo: corpo, tipo: 'boas_vindas', lida: false });
        Engine.salvarJogo(game);
    },

    liberarOfertasPatrocinio: function() {
        const game = Engine.carregarJogo();
        if(game.flags.patroEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.18);

        // PROPOSTAS COM DURAÇÃO (38 Rodadas = 1 Temporada Completa)
        const propostas = [
            { id: 1, tipo: "financeiro", nome: "Banco Nacional", mensal: base*1.0, luvas: base*2.0, bonus: base*1.0, duracao: 38, desc: "Contrato padrão de 1 temporada (38 rodadas)." },
            { id: 2, tipo: "bet", nome: "BetWin365", mensal: base*0.6, luvas: base*8.0, bonus: base*5.0, duracao: 19, desc: "Contrato curto (19 rodadas/1 turno). Muita grana agora, mas acaba rápido." }, // Curto
            { id: 3, tipo: "estatal", nome: "EnergiaBR", mensal: base*1.4, luvas: base*1.0, bonus: base*0.5, duracao: 76, desc: "Longo prazo (2 temporadas). Garante estabilidade por muito tempo." }, // Longo
            { id: 4, tipo: "tech", nome: "NeoTech AI", mensal: base*0.8, luvas: base*3.0, bonus: base*15.0, duracao: 38, desc: "1 Temporada. Focado em bônus por título." },
            { id: 5, tipo: "varejo", nome: "MegaLoja", mensal: base*0.9, luvas: base*3.5, bonus: base*2.0, duracao: 38, desc: "1 Temporada. Valores equilibrados." },
            { id: 6, tipo: "crypto", nome: "BitMarket", mensal: base*1.1, luvas: base*5.0, bonus: base*8.0, duracao: 38, desc: "1 Temporada. Pagamento agressivo." },
            { id: 7, tipo: "aereo", nome: "FlyHigh", mensal: base*1.2, luvas: base*1.5, bonus: base*3.0, duracao: 38, desc: "1 Temporada. Marca de prestígio." }
        ];

        let cardsHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:15px; margin-top:20px;">`;
        propostas.forEach(p => {
            let corBorda = "#444";
            if(p.tipo === 'bet') corBorda = "#e74c3c"; 
            if(p.tipo === 'estatal') corBorda = "#f1c40f"; 
            if(p.tipo === 'financeiro') corBorda = "#3498db";

            cardsHtml += `
                <div style="background:#1a1d21; border:1px solid #333; border-top:3px solid ${corBorda}; padding:15px; border-radius:6px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="font-weight:bold; font-size:1.1rem; color:#fff; margin-bottom:5px;">${p.nome}</div>
                        <div style="font-size:0.8rem; color:#888; margin-bottom:10px; min-height:40px;">"${p.desc}"</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; font-size:0.9rem; margin-bottom:10px; background:#111; padding:8px; border-radius:4px;">
                            <div style="color:#aaa;">Mensal:</div> <div style="color:#fff; text-align:right;">${(p.mensal/1000000).toFixed(1)}M</div>
                            <div style="color:#aaa;">Luvas:</div> <div style="color:#2ecc71; text-align:right;">${(p.luvas/1000000).toFixed(1)}M</div>
                            <div style="color:#aaa;">Duração:</div> <div style="color:#fff; text-align:right;">${p.duracao} Rodadas</div>
                        </div>
                    </div>
                    <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p)}, this)' class="btn-action" style="background:#333; border:1px solid #555;">Assinar</button>
                </div>
            `;
        });
        cardsHtml += `</div>`;

        const html = `
            <p>Recebemos as propostas finais. Atenção à <b>Duração</b>: contratos curtos (19 rodadas) exigem renovação rápida, contratos longos (76 rodadas) garantem renda mas prendem o clube.</p>
            ${cardsHtml}
        `;
        
        Engine.Sistema.novaMensagem("URGENTE: Patrocínio Master", html, 'patrocinio_oferta', "Depto. Comercial");
        
        const g2 = Engine.carregarJogo();
        g2.flags.patroEnviado = true;
        Engine.salvarJogo(g2);
    },

    liberarOfertasTV: function() {
        const game = Engine.carregarJogo();
        if(game.flags.tvEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.12);
        
        // TV sempre 38 rodadas (padrão da liga)
        const t1 = { id:'tv1', emissora:"Rede Nacional", fixo: base*1.8, jogo: 0, duracao: 38, desc: "Cota fixa alta. Contrato de 1 temporada." };
        const t2 = { id:'tv2', emissora:"Cabo Sports", fixo: base*1.0, jogo: base*0.2, duracao: 38, desc: "Fixo + Variável. Contrato de 1 temporada." };
        const t3 = { id:'tv3', emissora:"StreamMax", fixo: base*0.4, jogo: base*0.8, duracao: 38, desc: "Focado no digital. Contrato de 1 temporada." };
        const t4 = { id:'tv4', emissora:"Consórcio Global", fixo: base*1.2, jogo: base*0.1, duracao: 76, desc: "Contrato longo de 2 temporadas (76 rodadas)." };

        const html = `
            <p>Seguem as ofertas de TV. A maioria é para a temporada atual (38 rodadas), mas o Consórcio Global oferece um contrato de longo prazo.</p>
            <hr style="border-color:#333; margin:15px 0;">
            
            <div style="display:grid; gap:10px;">
                ${[t1,t2,t3,t4].map(t => `
                    <div style="background:#222; padding:15px; border-left:4px solid #fff; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:bold;">${t.emissora}</div>
                            <div style="font-size:0.8rem; color:#aaa;">${t.desc}</div>
                            <div style="font-size:0.8rem; margin-top:5px;">Fixo: R$ ${(t.fixo/1000000).toFixed(1)}M | Duração: <b>${t.duracao} Rodadas</b></div>
                        </div>
                        <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t)}, this)' class="btn-action" style="width:auto; padding:5px 15px;">Assinar</button>
                    </div>
                `).join('')}
            </div>
        `;

        Engine.Sistema.novaMensagem("Leilão dos Direitos de TV", html, 'tv_oferta', "Depto. Jurídico");
        
        const g2 = Engine.carregarJogo();
        g2.flags.tvEnviado = true;
        Engine.salvarJogo(g2);
    },

    assinarPatrocinio: function(p, btn) {
        const g = Engine.carregarJogo();
        if(g.contratos.patrocinio) { alert("Contrato já assinado!"); return; }
        
        g.contratos.patrocinio = p; // Salva o objeto COM a duração
        g.recursos.dinheiro += p.luvas;
        g.financas.historico.push({texto:`Luvas (${p.nome})`, valor:p.luvas, tipo:'entrada'});
        
        Engine.salvarJogo(g); 
        
        const todosBotoes = btn.closest('.email-container').querySelectorAll('button');
        todosBotoes.forEach(b => { b.disabled = true; b.style.opacity = 0.3; b.innerText = "---"; });
        btn.parentElement.style.opacity = 1; btn.style.opacity = 1; btn.style.background = "#27ae60"; btn.innerText = "✅ VIGENTE";
        
        alert(`Assinado com ${p.nome}!\nDuração: ${p.duracao} rodadas.`);
    },

    assinarTV: function(t, btn) {
        const g = Engine.carregarJogo();
        if(g.contratos.tv) { alert("Contrato já assinado!"); return; }
        
        g.contratos.tv = t; 
        Engine.salvarJogo(g); 
        
        const todosBotoes = btn.closest('.email-container').querySelectorAll('button');
        todosBotoes.forEach(b => { b.disabled = true; b.style.opacity = 0.3; });
        btn.style.opacity = 1; btn.style.background = "#27ae60"; btn.innerText = "✅ FECHADO";
        
        alert(`Direitos de TV vendidos para ${t.emissora}.\nDuração: ${t.duracao} rodadas.`);
    }
};
