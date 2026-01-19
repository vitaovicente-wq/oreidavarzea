// ARQUIVO: engine-contratos.js
// NARRATIVA: Profunda (Contexto de Time, Jogadores e Objetivos)

Engine.Contratos = {
    _processando: false,

    // --- 1. BOAS VINDAS (IA NARRATIVA) ---
    enviarBoasVindas: function(game) {
        const meuTime = game.times.find(t => t.nome === game.info.time);
        const elenco = meuTime.elenco || [];
        const forcaMedia = meuTime.forca || 60;
        const div = game.info.divisao;

        // 1. Acha o Craque para citar no e-mail
        let craque = { nome: "o elenco", forca: 0 };
        if (elenco.length > 0) {
            craque = elenco.reduce((p, c) => (p.forca > c.forca) ? p : c);
        }

        // 2. Define o Tom da Conversa
        let tom = {};
        
        if (div === 'serieA') {
            if (forcaMedia >= 80) {
                // PERFIL: GIGANTE
                tom.assunto = "Planejamento: Hegemonia Nacional";
                tom.intro = "Não vou dourar a pílula: investimos milhões neste elenco. A imprensa diz que somos favoritos, e a torcida não aceita menos que taças.";
                tom.meta = "🏆 <b>Obrigação:</b> Vaga direta na Libertadores ou Título.";
                tom.elenco = `⭐ <b>Referência Técnica:</b> <b>${craque.nome}</b> é um dos melhores do país. O time deve jogar por ele, mas cobre liderança.`;
                tom.aviso = "Se terminarmos fora do G4, considere sua posição em risco.";
            } else if (forcaMedia >= 74) {
                // PERFIL: TRADIÇÃO / MEIO TABELA
                tom.assunto = "Planejamento: Retomada de Confiança";
                tom.intro = "Temos camisa, temos história, mas precisamos de regularidade. O clube viveu anos de oscilação e queremos estabilidade.";
                tom.meta = "🌎 <b>Meta Realista:</b> Vaga na Sul-Americana (Top 12). Sonhar com Libertadores é possível, mas não perca o foco.";
                tom.elenco = `🔄 <b>Gestão:</b> Temos bons nomes como <b>${craque.nome}</b>, mas o elenco é curto. Evite lesões.`;
                tom.aviso = "Afastar o risco de rebaixamento cedo é crucial para a saúde financeira.";
            } else {
                // PERFIL: LUTADOR (Z4)
                tom.assunto = "Planejamento: Operação de Guerra";
                tom.intro = "Serei brutalmente honesto: somos cotados para cair. O orçamento é curto e a pressão será insana. Precisamos de um milagreiro.";
                tom.meta = "🛡️ <b>Meta Única:</b> 45 Pontos. Permanecer na Série A é o nosso título.";
                tom.elenco = `⚔️ <b>Vestiário:</b> <b>${craque.nome}</b> é o único com qualidade técnica superior. O resto terá que compensar na raça.`;
                tom.aviso = "Cada ponto em casa vale ouro. Não invente moda tática.";
            }
        } else {
            // PERFIL: SÉRIES B, C, D
            tom.assunto = "Planejamento: O Caminho do Acesso";
            tom.intro = "Nossa torcida não aguenta mais esta divisão. O lugar deste clube não é aqui. A cidade respira o acesso.";
            tom.meta = "📈 <b>Obrigação:</b> Subir de divisão (G4).";
            tom.elenco = `💎 <b>Destaque:</b> <b>${craque.nome}</b> sobra tecnicamente nesta liga. Proteja-o dos zagueiros adversários.`;
            tom.aviso = "O fracasso não é uma opção. O clube depende do acesso para não falir.";
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

                <div style="background:#1a1d21; border-left:4px solid #3498db; padding:15px; margin:20px 0; border-radius:0 6px 6px 0;">
                    <h4 style="margin:0 0 10px 0; color:#3498db;">📋 DIRETRIZES ESTRATÉGICAS</h4>
                    <ul style="margin:0; padding-left:20px; list-style-type:circle;">
                        <li style="margin-bottom:8px;">${tom.meta}</li>
                        <li style="margin-bottom:8px;">${tom.elenco}</li>
                        <li>💰 <b>Finanças:</b> O caixa inicial é de <b>${game.recursos.dinheiro.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</b>. Use para luvas ou salários, mas não estoure o teto.</li>
                    </ul>
                </div>

                <p>${tom.aviso}</p>
                <p>O Diretor Comercial apresentará as propostas de patrocínio a seguir. Analise com a mentalidade de um gestor.</p>

                <br>
                <p style="font-style:italic; color:#888;">Atenciosamente,</p>
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
            {id:1, nome:"Banco Nacional", mensal:base*1.2, luvas:base*1.5, bonus:0, duracao:38, desc:"<b>Perfil:</b> Conservador. <br>Paga salário em dia, mas não premia sucesso.", tipo:"financeiro"},
            {id:2, nome:"BetWin365", mensal:base*0.8, luvas:base*5.0, bonus:base*10.0, duracao:38, desc:"<b>Perfil:</b> Apostador. <br>Mensal baixo, mas te deixa rico se for campeão.", tipo:"bet"},
            {id:3, nome:"NeoTech AI", mensal:base*0.5, luvas:base*2.0, bonus:base*25.0, duracao:38, desc:"<b>Perfil:</b> Unicórnio. <br>Fixo horrível. Bônus de título surreal.", tipo:"tech"},
            {id:4, nome:"EnergiaBR", mensal:base*1.1, luvas:base*0.5, bonus:base*2.0, duracao:76, desc:"<b>Perfil:</b> Burocrático. <br>Contrato longo (2 anos). Estabilidade total.", tipo:"estatal"},
            {id:5, nome:"MegaLoja", mensal:base*0.7, luvas:base*8.0, bonus:base*1.0, duracao:19, desc:"<b>Perfil:</b> Varejo Imediato. <br>Luvas gigantes AGORA, mas acaba no meio do ano.", tipo:"varejo"},
            {id:6, nome:"BitMarket", mensal:base*1.3, luvas:base*3.0, bonus:base*5.0, duracao:38, desc:"<b>Perfil:</b> Volátil. <br>Valores acima da média, mas pagam em cripto (risco).", tipo:"crypto"},
            {id:7, nome:"FlyHigh", mensal:base*1.0, luvas:base*2.0, bonus:base*8.0, duracao:38, desc:"<b>Perfil:</b> Global. <br>Marca de grife. Equilibra mensal e bônus.", tipo:"aereo"}
        ];

        let html = `
            <p>Diretoria, filtrei o mercado. Temos 7 propostas firmes na mesa.</p>
            <p>Se você precisa de dinheiro <b>AGORA</b> para contratar, olhe para a <b>MegaLoja</b> ou a <b>BetWin</b>. Se está pensando em pagar as contas o ano todo sem sustos, vá de <b>Banco Nacional</b>.</p>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:15px; margin-top:20px;">`;
        
        props.forEach(p => {
            let cor = p.tipo==='bet'?'#e74c3c':(p.tipo==='financeiro'?'#2ecc71':(p.tipo==='tech'?'#9b59b6':'#444'));
            
            html += `
            <div style="background:#15191d; border:1px solid #333; border-top:3px solid ${cor}; padding:15px; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="font-weight:bold; font-size:1.1rem; color:#fff;">${p.nome}</div>
                        <div style="font-size:0.7rem; background:#333; padding:3px 8px; border-radius:4px; color:#fff;">${p.duracao} Rodadas</div>
                    </div>
                    <div style="font-size:0.85rem; color:#aaa; margin-bottom:15px; min-height:40px;">${p.desc}</div>
                    <div style="background:#0f1216; padding:10px; border-radius:6px; margin-bottom:15px; font-size:0.9rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>Luvas (À vista):</span> <span style="color:#2ecc71; font-weight:bold;">R$ ${(p.luvas/1000000).toFixed(1)}M</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>Mensal:</span> <span style="color:#fff;">R$ ${(p.mensal/1000000).toFixed(1)}M</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-top:1px solid #333; padding-top:5px;">
                            <span style="color:${p.bonus > 0 ? '#f1c40f' : '#444'};">🏆 Bônus Título:</span> 
                            <span style="color:${p.bonus > 0 ? '#f1c40f' : '#444'}; font-weight:bold;">${p.bonus > 0 ? 'R$ '+(p.bonus/1000000).toFixed(1)+'M' : '-'}</span>
                        </div>
                    </div>
                </div>
                <button onclick='Engine.Contratos.assinarPatrocinio(${JSON.stringify(p)}, this)' class="btn-action" style="width:100%; padding:12px; background:${cor}; color:#fff; font-weight:bold; cursor:pointer; border:none; border-radius:4px; transition:0.2s;">ASSINAR CONTRATO</button>
            </div>`;
        });
        html += `</div>`;

        Engine.Sistema.novaMensagem("Dossiê: Patrocínio Master", html, 'patrocinio_oferta', "Depto. Comercial");
        const g2 = Engine.carregarJogo(); g2.flags.patroEnviado = true; Engine.salvarJogo(g2);
    },

    // --- 3. TV ---
    liberarOfertasTV: function() {
        const game = Engine.carregarJogo();
        if(game.flags.tvEnviado) return;

        const base = Math.floor(game.recursos.dinheiro * 0.12);
        const tvs = [
            {id:'t1', emissora:"Rede Nacional", fixo:base*2.0, jogo:0, duracao:38, desc:"<b>Aberta.</b> <br>Fixo Garantido. Ideal para times que aparecem pouco."},
            {id:'t2', emissora:"Cabo Sports", fixo:base*1.0, jogo:base*0.3, duracao:38, desc:"<b>Fechada.</b> <br>Híbrido. Bom para times de meio de tabela."},
            {id:'t3', emissora:"StreamMax", fixo:base*0.2, jogo:base*1.0, duracao:38, desc:"<b>Digital.</b> <br>Paga por jogo. Se o time for longe nas copas, paga muito."},
            {id:'t4', emissora:"Consórcio Global", fixo:base*1.3, jogo:base*0.1, duracao:76, desc:"<b>Internacional.</b> <br>Contrato longo de 2 anos. Segurança a longo prazo."}
        ];

        let html = `<p>Com o Master definido, vamos à TV. O mercado está dividido:</p>
        <div style="display:grid; gap:10px; margin-top:15px;">`;
        
        tvs.forEach(t => {
            html += `
            <div style="background:#222; padding:15px; border-left:4px solid #fff; display:grid; grid-template-columns: 1fr auto; gap:15px; align-items:center;">
                <div>
                    <div style="font-weight:bold; font-size:1.1rem;">${t.emissora}</div>
                    <div style="font-size:0.85rem; color:#aaa; margin-bottom:5px;">${t.desc}</div>
                    <div style="font-size:0.9rem;">
                        Fixo: <b>R$ ${(t.fixo/1000000).toFixed(1)}M</b> | 
                        Por Jogo: <b style="color:#2ecc71">R$ ${(t.jogo/1000000).toFixed(2)}M</b>
                    </div>
                </div>
                <button onclick='Engine.Contratos.assinarTV(${JSON.stringify(t)}, this)' class="btn-action" style="padding:10px 20px; cursor:pointer; background:#fff; color:#000; border:none; font-weight:bold; border-radius:4px;">ASSINAR</button>
            </div>`;
        });
        html += `</div>`;

        Engine.Sistema.novaMensagem("Leilão: Direitos de TV", html, 'tv_oferta', "Depto. Jurídico");
        const g2 = Engine.carregarJogo(); g2.flags.tvEnviado = true; Engine.salvarJogo(g2);
    },

    // --- AÇÕES ---
    assinarPatrocinio: function(p, btn) {
        if(this._processando) return; this._processando = true;
        const g = Engine.carregarJogo();
        if(g.contratos.patrocinio) { alert("Já existe um contrato ativo!"); this._processando=false; return; }
        g.contratos.patrocinio = p; g.recursos.dinheiro += p.luvas;
        g.financas.historico.push({texto:`Luvas (${p.nome})`, valor:p.luvas, tipo:'entrada'});
        Engine.salvarJogo(g); 
        
        const todos = btn.closest('.email-container') ? btn.closest('.email-container').querySelectorAll('button') : document.querySelectorAll('.btn-action');
        todos.forEach(b => { b.disabled=true; b.style.opacity=0.2; });
        btn.parentElement.style.opacity=1; btn.style.opacity=1; btn.style.background="#2ecc71"; btn.innerHTML="✅ CONTRATO VIGENTE";
        
        alert(`Sucesso! ${p.nome} é o novo patrocinador.`);
        this._processando = false;
    },

    assinarTV: function(t, btn) {
        if(this._processando) return; this._processando = true;
        const g = Engine.carregarJogo();
        if(g.contratos.tv) { alert("Já existe contrato de TV!"); this._processando=false; return; }
        g.contratos.tv = t; 
        Engine.salvarJogo(g); 
        
        const todos = btn.closest('.email-container') ? btn.closest('.email-container').querySelectorAll('button') : document.querySelectorAll('.btn-action');
        todos.forEach(b => { b.disabled=true; b.style.opacity=0.2; });
        btn.style.opacity=1; btn.style.background="#2ecc71"; btn.innerHTML="✅ DIREITOS VENDIDOS";
        
        alert(`Direitos de TV fechados com ${t.emissora}.`);
        this._processando = false;
    },

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
