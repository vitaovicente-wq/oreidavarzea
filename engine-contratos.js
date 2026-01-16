// ARQUIVO: engine-contratos.js
// Responsável por: Fluxo de Contratos Iniciais e Mensagens de Boas Vindas

Engine.Contratos = {
    enviarBoasVindas: function(game) {
        const corpo = `
            <div class="email-container">
                <p>Prezado(a) <b>${game.info.tecnico}</b>,</p>
                <p>Bem-vindo ao <b>${game.info.time}</b>. O orçamento inicial é de <b>${game.recursos.dinheiro.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</b>.</p>
                <p>Prioridades:</p>
                <ul><li>Analisar Patrocínios</li><li>Fechar TV</li><li>Montar Elenco</li></ul>
                <p>Ass: <i>O Presidente</i></p>
            </div>
        `;
        // Inserção direta para garantir
        if(!game.mensagens) game.mensagens = [];
        game.mensagens.unshift({id: Date.now(), rodada: 1, remetente: "Presidência", titulo: "Memorando #001", corpo: corpo, tipo: 'boas_vindas', lida: false});
        Engine.salvarJogo(game);
    },

    liberarOfertasPatrocinio: function() {
        const game = Engine.carregarJogo();
        if(game.flags.patroEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.15);
        const p1 = {id:1, empresa:"Banco Nacional", mensal:base*1.2, luvas:base*2, desc:"Seguro"};
        const p2 = {id:2, empresa:"BetWin365", mensal:base*0.8, luvas:base*8, desc:"Agressivo"};

        const html = `
            <p>Propostas de Patrocínio na mesa:</p>
            <div style="background:#222; padding:10px; margin-bottom:10px;">
                <b>${p1.empresa}</b> (${p1.desc})<br>Mensal: ${p1.mensal.toLocaleString()}<br>
                <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p1)}, this)' class="btn-action">Assinar</button>
            </div>
            <div style="background:#222; padding:10px;">
                <b>${p2.empresa}</b> (${p2.desc})<br>Mensal: ${p2.mensal.toLocaleString()}<br>
                <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p2)}, this)' class="btn-action">Assinar</button>
            </div>
        `;
        
        Engine.Sistema.novaMensagem("URGENTE: Patrocínio Master", html, 'patrocinio_oferta', "Comercial");
        
        // Salva flag
        const g2 = Engine.carregarJogo();
        g2.flags.patroEnviado = true;
        Engine.salvarJogo(g2);
    },

    liberarOfertasTV: function() {
        const game = Engine.carregarJogo();
        if(game.flags.tvEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.10);
        const t1 = {id:'tv1', emissora:"Rede Nacional", fixo:base*1.5, desc:"Fixo Alto"};
        
        const html = `
            <p>Proposta de TV:</p>
            <div style="background:#222; padding:10px;">
                <b>${t1.emissora}</b> (${t1.desc})<br>Fixo: ${t1.fixo.toLocaleString()}<br>
                <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t1)}, this)' class="btn-action">Fechar Contrato</button>
            </div>
        `;

        Engine.Sistema.novaMensagem("Direitos de TV", html, 'tv_oferta', "Jurídico");
        
        const g2 = Engine.carregarJogo();
        g2.flags.tvEnviado = true;
        Engine.salvarJogo(g2);
    },

    assinarPatrocinio: function(p, btn) {
        const g = Engine.carregarJogo();
        if(g.contratos.patrocinio) { alert("Já assinado!"); return; }
        g.contratos.patrocinio = p; g.recursos.dinheiro += p.luvas;
        g.financas.historico.push({texto:`Luvas ${p.empresa}`, valor:p.luvas, tipo:'entrada'});
        Engine.salvarJogo(g); btn.parentNode.innerHTML="✅ ASSINADO"; alert("Fechado!");
    },
    assinarTV: function(t, btn) {
        const g = Engine.carregarJogo();
        if(g.contratos.tv) { alert("Já assinado!"); return; }
        g.contratos.tv = t; Engine.salvarJogo(g); btn.parentNode.innerHTML="✅ ASSINADO"; alert("Fechado!");
    }
};
