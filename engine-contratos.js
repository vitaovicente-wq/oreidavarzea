// ARQUIVO: engine-contratos.js
// Responsável por: Narrativa Inicial, Objetivos Dinâmicos e Negociações

Engine.Contratos = {
    
    // --- 1. BOAS VINDAS DINÂMICA ---
    enviarBoasVindas: function(game) {
        // 1. Analisa o Time e define objetivos
        const meuTime = game.times.find(t => t.nome === game.info.time);
        const elenco = meuTime.elenco || [];
        
        let craque = { nome: "o elenco", forca: 0 };
        if(elenco.length > 0) {
            craque = elenco.reduce((prev, current) => (prev.forca > current.forca) ? prev : current);
        }

        let tituloEmail = "Diretrizes 2026";
        let textoContexto = "";
        let metaTabela = "";
        let metaElenco = "";
        const div = game.info.divisao;
        const forcaMedia = meuTime.forca || 60;

        if (div === 'serieA') {
            if (forcaMedia >= 80) {
                tituloEmail = "Planejamento: Obsessão pela América";
                textoContexto = "Nossa torcida não aceita menos que protagonismo. O investimento foi alto e a cobrança será proporcional.";
                metaTabela = "🏆 <b>Objetivo Mínimo:</b> Vaga direta na Libertadores (G4) ou Título.";
                metaElenco = `⭐ <b>Gestão de Estrelas:</b> ${craque.nome} é o pilar do time.`;
            } else if (forcaMedia >= 74) {
                tituloEmail = "Planejamento: Consolidação na Elite";
                textoContexto = "Somos competitivos, mas precisamos ter os pés no chão.";
                metaTabela = "🌎 <b>Objetivo Mínimo:</b> Sul-Americana (Top 12).";
                metaElenco = `🔄 <b>Renovação:</b> O elenco precisa ser rejuvenescido.`;
            } else {
                tituloEmail = "Planejamento: Operação Salva-Ano";
                textoContexto = "A imprensa já nos coloca como rebaixados. Prove que estão errados.";
                metaTabela = "🛡️ <b>Objetivo Mínimo:</b> Permanência (45 pontos).";
                metaElenco = `⚔️ <b>Espírito:</b> Se ${craque.nome} não correr, coloque no banco.`;
            }
        } else {
            tituloEmail = "Planejamento: O Caminho do Acesso";
            textoContexto = "O lugar do nosso escudo não é aqui.";
            metaTabela = "📈 <b>Objetivo Único:</b> O Acesso (G4).";
            metaElenco = `💎 <b>Destaque:</b> ${craque.nome} sobra nessa divisão.`;
        }

        const html = `
            <div class="email-container">
                <div style="border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:15px;">
                    <div style="font-size:0.8rem; color:#888;">DE: CONSELHO DELIBERATIVO</div>
                    <div style="font-size:0.8rem; color:#888;">PARA: ${game.info.tecnico.toUpperCase()}</div>
                    <div style="font-size:1.1rem; color:#fff; font-weight:bold; margin-top:5px;">ASSUNTO: ${tituloEmail}</div>
                </div>
                <p>Prezado(a),</p>
                <p>${textoContexto}</p>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-left:4px solid ${forcaMedia > 75 ? '#f1c40f' : '#e74c3c'}; margin:20px 0;">
                    <ul style="margin:0; padding-left:15px; line-height:1.8;">
                        <li>${metaTabela}</li>
                        <li>${metaElenco}</li>
                        <li>💰 <b>Finanças:</b> Não feche o ano no vermelho.</li>
                    </ul>
                </div>
                <p>O Diretor Comercial apresentará as propostas de patrocínio a seguir.</p>
                <br><p style="font-family:'Brush Script MT', cursive; font-size:1.4rem; color:#888;">O Presidente</p>
            </div>
        `;
        
        if(!game.mensagens) game.mensagens = [];
        game.mensagens.unshift({ id: Date.now(), rodada: 1, remetente: "Presidência", titulo: "CONFIDENCIAL: Metas da Temporada", corpo: html, tipo: 'boas_vindas', lida: false });
        Engine.salvarJogo(game);
    },

    // --- 2. PATROCÍNIOS ---
    liberarOfertasPatrocinio: function() {
        const game = Engine.carregarJogo();
        if(game.flags.patroEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.18);

        const propostas = [
            { id: 1, tipo: "financeiro", nome: "Banco Nacional", mensal: base*1.2, luvas: base*1.5, bonus: 0, duracao: 38, desc: "Conservador. Mensalidade alta, sem bônus." },
            { id: 2, tipo: "bet", nome: "BetWin365", mensal: base*0.8, luvas: base*5.0, bonus: base*10.0, duracao: 38, desc: "Mensal baixo, mas prêmio milionário por título." },
            { id: 3, tipo: "tech", nome: "NeoTech AI", mensal: base*0.5, luvas: base*2.0, bonus: base*25.0, duracao: 38, desc: "Alto risco. Bônus de título surreal." },
            { id: 4, tipo: "estatal", nome: "EnergiaBR", mensal: base*1.1, luvas: base*0.5, bonus: base*2.0, duracao: 76, desc: "Contrato longo de 2 temporadas (76 rodadas)." },
            { id: 5, tipo: "varejo", nome: "MegaLoja", mensal: base*0.7, luvas: base*8.0, bonus: base*1.0, duracao: 19, desc: "Apenas 1 Turno (19 rodadas). Luvas gigantescas AGORA." },
            { id: 6, tipo: "crypto", nome: "BitMarket", mensal: base*1.3, luvas: base*3.0, bonus: base*5.0, duracao: 38, desc: "Valores acima do mercado, pagamento volátil." },
            { id: 7, tipo: "aereo", nome: "FlyHigh", mensal: base*1.0, luvas: base*2.0, bonus: base*8.0, duracao: 38, desc: "Marca global de prestígio." }
        ];

        let cardsHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:15px; margin-top:20px;">`;
        propostas.forEach(p => {
            let corTema = p.tipo === 'bet' ? "#e74c3c" : (p.tipo === 'financeiro' ? "#2ecc71" : (p.tipo === 'tech' ? "#9b59b6" : "#444"));
            cardsHtml += `
                <div style="background:#15191d; border:1px solid #333; border-top:3px solid ${corTema}; padding:15px; border-radius:8px;">
                    <div style="font-weight:bold; font-size:1.1rem; color:#fff; margin-bottom:5px;">${p.nome}</div>
                    <div style="font-size:0.8rem; color:#aaa; margin-bottom:10px;">${p.duracao} Rodadas | "${p.desc}"</div>
                    <div style="background:#0f1216; padding:10px; border-radius:6px; margin-bottom:10px; font-size:0.9rem;">
                        <div style="display:flex; justify-content:space-between;"><span>Luvas:</span><span style="color:#2ecc71;">R$ ${(p.luvas/1000000).toFixed(1)}M</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Mensal:</span><span style="color:#fff;">R$ ${(p.mensal/1000000).toFixed(1)}M</span></div>
                        <div style="display:flex; justify-content:space-between; border-top:1px solid #333; margin-top:5px; padding-top:5px;"><span>Bônus:</span><span style="color:#f1c40f;">${p.bonus > 0 ? 'R$ '+(p.bonus/1000000).toFixed(1)+'M' : '-'}</span></div>
                    </div>
                    <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p)}, this)' class="btn-action" style="width:100%; padding:10px; background:${corTema}; color:#000; font-weight:bold; cursor:pointer; border:none;">ASSINAR</button>
                </div>
            `;
        });
        cardsHtml += `</div>`;

        const html = `<p>Diretoria, filtrando o mercado, chegamos aos 7 finalistas. Atenção às Luvas (dinheiro agora) vs Mensal (dinheiro depois).</p>${cardsHtml}`;
        Engine.Sistema.novaMensagem("Dossiê Comercial: Patrocínio Master", html, 'patrocinio_oferta', "Diretor Comercial");
        
        const g2 = Engine.carregarJogo(); g2.flags.patroEnviado = true; Engine.salvarJogo(g2);
    },

    // --- 3. TV ---
    liberarOfertasTV: function() {
        const game = Engine.carregarJogo();
        if(game.flags.tvEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.12);
        const t1 = { id:'tv1', emissora:"Rede Nacional", fixo: base*2.0, jogo: 0, duracao: 38, desc: "Fixo Garantido. Ideal para times pequenos." };
        const t2 = { id:'tv2', emissora:"Cabo Sports", fixo: base*1.0, jogo: base*0.3, duracao: 38, desc: "Híbrido. Paga bem se o time aparecer na TV." };
        const t3 = { id:'tv3', emissora:"StreamMax", fixo: base*0.2, jogo: base*1.0, duracao: 38, desc: "Performance. Paga fortuna por jogo, fixo zero." };
        const t4 = { id:'tv4', emissora:"Consórcio Global", fixo: base*1.3, jogo: base*0.1, duracao: 76, desc: "Longo Prazo (2 Anos)." };

        const html = `
            <p>Leilão de TV encerrado. Escolha seu modelo de receita:</p>
            <div style="display:grid; gap:10px; margin-top:15px;">
                ${[t1,t2,t3,t4].map(t => `
                    <div style="background:#222; padding:15px; border-left:4px solid #fff; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:bold;">${t.emissora}</div>
                            <div style="font-size:0.8rem; color:#aaa;">${t.desc}</div>
                            <div style="font-size:0.8rem; margin-top:5px;">Fixo: <b>R$ ${(t.fixo/1000000).toFixed(1)}M</b> | Duração: ${t.duracao}R</div>
                        </div>
                        <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t)}, this)' class="btn-action" style="padding:5px 20px; cursor:pointer;">Assinar</button>
                    </div>
                `).join('')}
            </div>
        `;
        Engine.Sistema.novaMensagem("Negociação de Mídia (TV)", html, 'tv_oferta', "Depto. Jurídico");
        
        const g2 = Engine.carregarJogo(); g2.flags.tvEnviado = true; Engine.salvarJogo(g2);
    },

    // --- AÇÕES COM PROTEÇÃO DE CLIQUE ---
    assinarPatrocinio: function(p, btn) {
        // 1. DESATIVA O BOTÃO IMEDIATAMENTE (Evita clique duplo)
        btn.disabled = true;
        btn.innerHTML = "PROCESSANDO...";

        setTimeout(() => {
            const g = Engine.carregarJogo();
            if(g.contratos.patrocinio) { 
                alert("Já existe um contrato ativo! (Erro de duplo clique ignorado)"); 
                return; 
            }
            
            g.contratos.patrocinio = p; 
            g.recursos.dinheiro += p.luvas;
            g.financas.historico.push({texto:`Luvas (${p.nome})`, valor:p.luvas, tipo:'entrada'});
            Engine.salvarJogo(g); 
            
            // Atualiza UI
            const todos = btn.closest('.email-container').querySelectorAll('button');
            todos.forEach(b => { b.disabled=true; b.style.opacity=0.3; b.innerText="---"; });
            btn.style.opacity=1; btn.style.background="#2ecc71"; btn.style.color="#fff"; btn.innerText="✅ CONTRATADO";
            
            alert(`Parceria fechada com ${p.nome}!\nLuvas: R$ ${p.luvas.toLocaleString()}`);
        }, 100); // Pequeno delay para garantir UI update
    },

    assinarTV: function(t, btn) {
        btn.disabled = true;
        btn.innerHTML = "PROCESSANDO...";

        setTimeout(() => {
            const g = Engine.carregarJogo();
            if(g.contratos.tv) { 
                alert("Já existe contrato de TV!"); 
                return; 
            }
            g.contratos.tv = t; 
            Engine.salvarJogo(g); 
            
            const todos = btn.closest('.email-container').querySelectorAll('button');
            todos.forEach(b => { b.disabled=true; b.style.opacity=0.3; });
            btn.style.opacity=1; btn.style.background="#2ecc71"; btn.innerText="✅ FECHADO";
            
            alert(`Direitos vendidos para ${t.emissora}.`);
        }, 100);
    },

    // --- SISTEMA DE VENCIMENTO ---
    processarVencimentos: function(game) {
        let mudou = false;
        if (game.contratos.patrocinio) {
            game.contratos.patrocinio.duracao--;
            if (game.contratos.patrocinio.duracao <= 0) {
                Engine.Sistema.novaMensagem("Fim de Contrato", `O vínculo com <b>${game.contratos.patrocinio.nome}</b> encerrou. Aguarde novas ofertas.`, "info", "Jurídico");
                game.contratos.patrocinio = null; game.flags.patroEnviado = false; mudou = true;
            }
        }
        if (game.contratos.tv) {
            game.contratos.tv.duracao--;
            if (game.contratos.tv.duracao <= 0) {
                Engine.Sistema.novaMensagem("Fim de Contrato", `O contrato de TV com <b>${game.contratos.tv.emissora}</b> acabou.`, "info", "Jurídico");
                game.contratos.tv = null; game.flags.tvEnviado = false; mudou = true;
            }
        }
        if(mudou) Engine.salvarJogo(game);
    }
};
