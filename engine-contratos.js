// ARQUIVO: engine-contratos.js
// Responsável por: Narrativa Inicial, Objetivos Dinâmicos e Negociações

Engine.Contratos = {
    
    // --- 1. BOAS VINDAS DINÂMICA (IA NARRATIVA) ---
    enviarBoasVindas: function(game) {
        // 1. Analisa o Time
        const meuTime = game.times.find(t => t.nome === game.info.time);
        const elenco = meuTime.elenco || [];
        
        // Acha o Craque (Maior OVR)
        let craque = { nome: "o elenco", forca: 0 };
        if(elenco.length > 0) {
            craque = elenco.reduce((prev, current) => (prev.forca > current.forca) ? prev : current);
        }

        // Define Expectativa Baseada na Força e Divisão
        let tituloEmail = "Diretrizes 2026";
        let textoContexto = "";
        let metaTabela = "";
        let metaElenco = "";
        const div = game.info.divisao;
        const forcaMedia = meuTime.forca || 60;

        // Lógica de Objetivos
        if (div === 'serieA') {
            if (forcaMedia >= 80) {
                tituloEmail = "Planejamento: Obsessão pela América";
                textoContexto = "Nossa torcida não aceita menos que protagonismo. O investimento foi alto e a cobrança será proporcional.";
                metaTabela = "🏆 <b>Objetivo Mínimo:</b> Vaga direta na Libertadores (G4) ou Título.";
                metaElenco = `⭐ <b>Gestão de Estrelas:</b> ${craque.nome} é o pilar do time. Mantenha-o motivado e o time jogará por ele.`;
            } else if (forcaMedia >= 74) {
                tituloEmail = "Planejamento: Consolidação na Elite";
                textoContexto = "Somos um time competitivo, mas precisamos ter os pés no chão. Um passo em falso e a crise se instala.";
                metaTabela = "🌎 <b>Objetivo Mínimo:</b> Classificação para a Sul-Americana (Top 12).";
                metaElenco = `🔄 <b>Renovação:</b> O elenco é envelhecido. Precisamos baixar a média de idade e vender veteranos caros.`;
            } else {
                tituloEmail = "Planejamento: Operação Salva-Ano";
                textoContexto = "Serei franco: a imprensa já nos coloca como rebaixados. Sua missão é provar que estão errados.";
                metaTabela = "🛡️ <b>Objetivo Mínimo:</b> Permanência na Série A (45 pontos). Nada mais importa.";
                metaElenco = `⚔️ <b>Espírito de Luta:</b> Precisamos de guerreiros. Se ${craque.nome} não correr, coloque no banco.`;
            }
        } else {
            // Séries B, C, D
            tituloEmail = "Planejamento: O Caminho do Acesso";
            textoContexto = "Este clube é grande demais para esta divisão. O lugar do nosso escudo não é aqui.";
            metaTabela = "📈 <b>Objetivo Único:</b> O Acesso (G4). Subir é obrigação.";
            metaElenco = `💎 <b>Valorização:</b> ${craque.nome} está muito acima desta divisão. Use-o para garantir pontos fáceis.`;
        }

        // Constrói o HTML Rico
        const html = `
            <div class="email-container">
                <div style="border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:15px;">
                    <div style="font-size:0.8rem; color:#888;">DE: CONSELHO DELIBERATIVO</div>
                    <div style="font-size:0.8rem; color:#888;">PARA: ${game.info.tecnico.toUpperCase()}</div>
                    <div style="font-size:1.1rem; color:#fff; font-weight:bold; margin-top:5px;">ASSUNTO: ${tituloEmail}</div>
                </div>

                <p>Prezado(a),</p>
                <p>${textoContexto}</p>
                <p>Para que sua permanência seja garantida no cargo até dezembro, estabelecemos as seguintes metas mandatórias:</p>

                <div style="background:rgba(255,255,255,0.05); padding:15px; border-left:4px solid ${forcaMedia > 75 ? '#f1c40f' : '#e74c3c'}; margin:20px 0;">
                    <ul style="margin:0; padding-left:15px; line-height:1.8;">
                        <li>${metaTabela}</li>
                        <li>${metaElenco}</li>
                        <li>💰 <b>Finanças:</b> Não feche o ano no vermelho. O teto orçamentário é sagrado.</li>
                    </ul>
                </div>

                <p>A seguir, o Diretor Comercial apresentará as propostas de patrocínio. Escolha com sabedoria: algumas pagam bem se formos campeões, outras garantem o salário do dia a dia.</p>
                
                <p>Bom trabalho.</p>
                <br>
                <p style="font-family:'Brush Script MT', cursive; font-size:1.4rem; color:#888;">O Presidente</p>
            </div>
        `;
        
        if(!game.mensagens) game.mensagens = [];
        game.mensagens.unshift({
            id: Date.now(), 
            rodada: 1, 
            remetente: "Presidência", 
            titulo: "CONFIDENCIAL: Metas da Temporada", 
            corpo: html, 
            tipo: 'boas_vindas', 
            lida: false
        });
        Engine.salvarJogo(game);
    },

    // --- 2. PATROCÍNIOS COM BÔNUS DE TÍTULO ---
    liberarOfertasPatrocinio: function() {
        const game = Engine.carregarJogo();
        if(game.flags.patroEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.18);

        // CONFIGURAÇÃO DAS PROPOSTAS (7 OPÇÕES)
        const propostas = [
            // Opção 1: O Banco (Seguro, Sem Bônus)
            { id: 1, tipo: "financeiro", nome: "Banco Nacional", mensal: base*1.2, luvas: base*1.5, bonus: 0, duracao: 38, 
              desc: "A escolha conservadora. Mensalidade alta e garantida para pagar a folha, mas <b>ZERO bônus</b> por conquistas." },
            
            // Opção 2: A Bet (Risco Médio, Bônus Alto)
            { id: 2, tipo: "bet", nome: "BetWin365", mensal: base*0.8, luvas: base*5.0, bonus: base*10.0, duracao: 38, 
              desc: "Pagamento mensal baixo, mas oferecem um <b>prêmio milionário</b> se levantarmos a taça." },
            
            // Opção 3: A Tech (Performance Pura)
            { id: 3, tipo: "tech", nome: "NeoTech AI", mensal: base*0.5, luvas: base*2.0, bonus: base*25.0, duracao: 38, 
              desc: "Contrato de risco. O fixo mal paga a luz, mas o bônus de título transformaria o clube na maior potência do país." },
            
            // Opção 4: A Estatal (Longo Prazo)
            { id: 4, tipo: "estatal", nome: "EnergiaBR", mensal: base*1.1, luvas: base*0.5, bonus: base*2.0, duracao: 76, 
              desc: "Contrato amarrado de <b>2 temporadas</b> (76 rodadas). Estabilidade total, mas difícil de rescindir." },
            
            // Opção 5: Varejo (Curto Prazo/Emergência)
            { id: 5, tipo: "varejo", nome: "MegaLoja", mensal: base*0.7, luvas: base*8.0, bonus: base*1.0, duracao: 19, 
              desc: "Apenas 1 Turno (19 rodadas). Luvas gigantescas para contratar reforços AGORA, mas depois ficamos sem renda." },
            
            // Opção 6: Crypto (Volátil)
            { id: 6, tipo: "crypto", nome: "BitMarket", mensal: base*1.3, luvas: base*3.0, bonus: base*5.0, duracao: 38, 
              desc: "Valores acima do mercado, pagamento em cripto (simulado). Exigem exclusividade na camisa." },
            
            // Opção 7: Aérea (Prestígio)
            { id: 7, tipo: "aereo", nome: "FlyHigh", mensal: base*1.0, luvas: base*2.0, bonus: base*8.0, duracao: 38, 
              desc: "Marca global. Equilibra bem mensalidade e bônus de performance." }
        ];

        let cardsHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:15px; margin-top:20px;">`;
        
        propostas.forEach(p => {
            let corTema = "#444";
            if(p.tipo === 'bet') corTema = "#e74c3c"; 
            if(p.tipo === 'financeiro') corTema = "#2ecc71";
            if(p.tipo === 'tech') corTema = "#9b59b6";
            if(p.tipo === 'estatal') corTema = "#f1c40f";

            // Cálculo visual para o usuário
            const totalGarantido = (p.mensal * (p.duracao > 38 ? 38 : p.duracao)) + p.luvas;
            const potencialTotal = totalGarantido + p.bonus;

            cardsHtml += `
                <div style="background:#15191d; border:1px solid #333; border-top:3px solid ${corTema}; padding:15px; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="font-weight:bold; font-size:1.1rem; color:#fff;">${p.nome}</div>
                        <div style="font-size:0.7rem; background:#333; padding:2px 6px; border-radius:4px; color:#aaa;">${p.duracao} Rodadas</div>
                    </div>
                    
                    <div style="font-size:0.85rem; color:#999; height:45px; overflow:hidden; margin-bottom:15px;">${p.desc}</div>
                    
                    <div style="background:#0f1216; padding:10px; border-radius:6px; margin-bottom:15px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:5px;">
                            <span style="color:#aaa;">Luvas (À vista):</span>
                            <span style="color:#2ecc71;">R$ ${(p.luvas/1000000).toFixed(1)}M</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:5px;">
                            <span style="color:#aaa;">Mensal:</span>
                            <span style="color:#fff;">R$ ${(p.mensal/1000000).toFixed(1)}M</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem; border-top:1px solid #333; padding-top:5px;">
                            <span style="color:${p.bonus > 0 ? '#f1c40f' : '#444'}; font-weight:bold;">🏆 Bônus Título:</span>
                            <span style="color:${p.bonus > 0 ? '#f1c40f' : '#444'}; font-weight:bold;">${p.bonus > 0 ? 'R$ ' + (p.bonus/1000000).toFixed(1) + 'M' : '---'}</span>
                        </div>
                    </div>

                    <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p)}, this)' class="btn-action" style="width:100%; padding:10px; background:${corTema}; color:#000; border:none; font-weight:bold; cursor:pointer;">ASSINAR CONTRATO</button>
                </div>
            `;
        });
        cardsHtml += `</div>`;

        const html = `
            <p>Diretoria, selecionei as 7 melhores ofertas do mercado. O cenário é complexo:</p>
            <ul style="color:#ccc; margin-bottom:15px;">
                <li>Se você confia no título, a <b>NeoTech</b> e a <b>BetWin</b> podem dobrar nosso faturamento com os bônus.</li>
                <li>Se prefere segurança para não atrasar salários, o <b>Banco Nacional</b> é a melhor opção.</li>
                <li>Se precisa de dinheiro HOJE para contratar, a <b>MegaLoja</b> paga luvas absurdas, mas o contrato acaba no meio do ano.</li>
            </ul>
            ${cardsHtml}
        `;
        
        Engine.Sistema.novaMensagem("Dossiê Comercial: Patrocínio Master", html, 'patrocinio_oferta', "Diretor Comercial");
        
        const g2 = Engine.carregarJogo();
        g2.flags.patroEnviado = true;
        Engine.salvarJogo(g2);
    },

    // --- 3. DIREITOS DE TV (4 OPÇÕES) ---
    liberarOfertasTV: function() {
        const game = Engine.carregarJogo();
        if(game.flags.tvEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.12);
        
        const t1 = { id:'tv1', emissora:"Rede Nacional", fixo: base*2.0, jogo: 0, duracao: 38, desc: "Fixo Garantido. Ideal para times pequenos que aparecem pouco na TV." };
        const t2 = { id:'tv2', emissora:"Cabo Sports", fixo: base*1.0, jogo: base*0.3, duracao: 38, desc: "Híbrido. Paga bem se o time for bem e tiver jogos transmitidos." };
        const t3 = { id:'tv3', emissora:"StreamMax", fixo: base*0.2, jogo: base*1.0, duracao: 38, desc: "Performance Pura. Paga uma fortuna por jogo, mas o fixo é zero. Alto risco." };
        const t4 = { id:'tv4', emissora:"Consórcio Global", fixo: base*1.3, jogo: base*0.1, duracao: 76, desc: "Longo Prazo (2 Anos). Prende o clube por um valor médio." };

        const html = `
            <p>Com o Master definido, vamos à TV. Aqui a decisão depende da sua expectativa de campanha:</p>
            <p>Se formos longe nas copas e brigarmos no topo, o modelo da <b>StreamMax</b> paga muito mais. Se brigarmos para não cair, a <b>Rede Nacional</b> é a única que garante as contas.</p>
            <hr style="border-color:#333; margin:15px 0;">
            
            <div style="display:grid; gap:10px;">
                ${[t1,t2,t3,t4].map(t => `
                    <div style="background:#15191d; padding:15px; border-left:4px solid #fff; display:grid; grid-template-columns: 1fr auto; gap:15px; align-items:center;">
                        <div>
                            <div style="font-weight:bold; font-size:1.1rem;">${t.emissora}</div>
                            <div style="font-size:0.85rem; color:#aaa; margin-bottom:5px;">${t.desc}</div>
                            <div style="font-size:0.9rem;">
                                Fixo: <b>R$ ${(t.fixo/1000000).toFixed(1)}M</b> | 
                                Por Jogo: <b style="color:#2ecc71">R$ ${(t.jogo/1000000).toFixed(2)}M</b>
                            </div>
                        </div>
                        <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t)}, this)' class="btn-action" style="padding:10px 20px; background:#fff; color:#000; border:none; font-weight:bold; cursor:pointer;">ASSINAR</button>
                    </div>
                `).join('')}
            </div>
        `;

        Engine.Sistema.novaMensagem("Negociação de Mídia (TV)", html, 'tv_oferta', "Depto. Jurídico");
        
        const g2 = Engine.carregarJogo();
        g2.flags.tvEnviado = true;
        Engine.salvarJogo(g2);
    },

    // --- PROCESSAMENTO E AÇÕES ---
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
    },

    assinarPatrocinio: function(p, btn) {
        const g = Engine.carregarJogo();
        if(g.contratos.patrocinio) { alert("Já existe um contrato ativo!"); return; }
        g.contratos.patrocinio = p; g.recursos.dinheiro += p.luvas;
        g.financas.historico.push({texto:`Luvas (${p.nome})`, valor:p.luvas, tipo:'entrada'});
        Engine.salvarJogo(g); 
        
        // Visual
        const todos = btn.closest('.email-container').querySelectorAll('button');
        todos.forEach(b => { b.disabled=true; b.style.opacity=0.2; });
        btn.style.opacity=1; btn.innerText="CONTRATADO"; btn.style.background="#2ecc71";
        alert(`Parceria fechada com ${p.nome}!`);
    },

    assinarTV: function(t, btn) {
        const g = Engine.carregarJogo();
        if(g.contratos.tv) { alert("Já existe um contrato de TV!"); return; }
        g.contratos.tv = t; 
        Engine.salvarJogo(g); 
        
        const todos = btn.closest('.email-container').querySelectorAll('button');
        todos.forEach(b => { b.disabled=true; b.style.opacity=0.2; });
        btn.style.opacity=1; btn.innerText="FECHADO"; btn.style.background="#2ecc71";
        alert(`Direitos vendidos para ${t.emissora}.`);
    }
};
