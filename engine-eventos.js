// ARQUIVO: engine-eventos.js
// Responsável por: O Caos (Lesões, Crises e Mídia) - Transferências DESATIVADAS

Engine.Eventos = {
    // Configuração de Probabilidades (0.0 a 1.0)
    chances: {
        lesao: 0.30,         // 30% de chance por rodada
        proposta: 0.0,       // 0% (DESATIVADO TEMPORARIAMENTE)
        crise: 0.15,         // 15% de chance
        midia: 0.20          // 20% de chance (Coletivas/Torcida)
    },

    db: {
        lesoes: [
            { texto: "sentiu uma fisgada na posterior da coxa", gravidade: 2, tipo: "Muscular" },
            { texto: "sofreu uma torção no tornozelo após dividida", gravidade: 4, tipo: "Trauma" },
            { texto: "relatou desconforto no joelho", gravidade: 1, tipo: "Leve" },
            { texto: "teve uma ruptura de ligamento no treino", gravidade: 12, tipo: "Grave" }
        ],
        // Compradores mantidos no banco de dados para uso futuro
        compradores: ["Al-Hilal (ARA)", "Benfica (POR)", "River Plate (ARG)", "Flamengo (BRA)", "Ajax (HOL)", "Boca Juniors (ARG)", "Zenit (RUS)"],
        midia_win: ["A torcida está eufórica com a sequência.", "Jornalistas elogiam seu esquema tático.", "Sócios pedem a renovação do seu contrato."],
        midia_lose: ["Muros do CT foram pichados.", "Jornalista famoso pediu sua demissão ao vivo.", "Torcida organizada protestou no aeroporto."]
    },

    // --- FUNÇÃO PRINCIPAL CHAMADA PELO CORE ---
    processarEventosRodada: function(game) {
        // Roda os dados para cada tipo de evento
        if(Math.random() < this.chances.lesao) this.gerarLesao(game);
        
        // TEMPORARIAMENTE DESATIVADO
        // if(Math.random() < this.chances.proposta) this.gerarPropostaCompra(game);
        
        if(Math.random() < this.chances.crise) this.gerarProblemaVestiario(game);
        if(Math.random() < this.chances.midia) this.gerarEventoMidia(game);
    },

    // 1. LESÕES (COM OPÇÃO DE INFILTRAÇÃO)
    gerarLesao: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const aptos = time.elenco.filter(j => j.status !== "Lesionado");
        if(aptos.length === 0) return;

        const alvo = aptos[Math.floor(Math.random() * aptos.length)];
        const lesao = this.db.lesoes[Math.floor(Math.random() * this.db.lesoes.length)];
        const tempo = lesao.gravidade;

        // Aplica a lesão
        const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
        time.elenco[idx].status = "Lesionado";
        time.elenco[idx].rodadasFora = tempo;
        Engine.salvarJogo(game);

        const html = `
            <div style="font-family:'Inter', sans-serif;">
                <p>Relatório médico pós-rodada:</p>
                <div style="background:#2d1b1b; border-left:4px solid #e74c3c; padding:15px; margin:10px 0;">
                    <strong style="color:#e74c3c; font-size:1.1rem;">${alvo.nome}</strong><br>
                    <span style="color:#ccc;">${lesao.texto}.</span><br><br>
                    Diagnóstico: <b>${lesao.tipo}</b><br>
                    Tempo estimado: <b style="color:#fff;">${tempo} Rodadas</b>
                </div>
                <p>O DM sugere repouso total, mas podemos tentar acelerar a recuperação com infiltrações (risco de agravar).</p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <button onclick="alert('Jogador mantido no DM.')" class="btn-action" style="background:#444; color:#fff; border:none; padding:10px;">Respeitar DM</button>
                    <button onclick="Engine.Eventos.infiltrarJogador('${alvo.uid}')" class="btn-action" style="background:#c0392b; color:#fff; border:none; padding:10px;">💉 Infiltrar (Risco)</button>
                </div>
            </div>
        `;
        Engine.Sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm', 'Dr. Marcio (Médico)');
    },

    // 2. PROPOSTAS DE VENDA (CÓDIGO MANTIDO, MAS NÃO CHAMADO)
    gerarPropostaCompra: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        if(time.elenco.length === 0) return;
        
        const alvo = time.elenco[Math.floor(Math.random() * time.elenco.length)];
        const comprador = this.db.compradores[Math.floor(Math.random() * this.db.compradores.length)];
        
        let valorBase = alvo.valor || (alvo.forca * 100000); 
        const oferta = Math.floor(valorBase * (0.9 + Math.random() * 0.4));

        const html = `
            <p>Recebemos um contato oficial do <b>${comprador}</b>.</p>
            <p>Eles têm interesse imediato no atleta <b>${alvo.nome}</b> (OVR ${alvo.forca}).</p>
            
            <div style="background:#15191d; border:1px solid #333; padding:15px; text-align:center; border-radius:8px; margin:15px 0;">
                <div style="font-size:0.8rem; color:#888;">VALOR OFERECIDO</div>
                <div style="font-size:1.8rem; font-weight:bold; color:#2ecc71;">R$ ${oferta.toLocaleString()}</div>
                <div style="font-size:0.8rem; color:#aaa; margin-top:5px;">Pagamento à vista</div>
            </div>

            <p>O jogador balançou com a proposta salarial. A decisão é sua.</p>
            <button onclick='Engine.Eventos.venderJogador("${alvo.uid}", ${oferta})' class="btn-action" style="width:100%; background:#27ae60; color:#fff; padding:12px; border:none; font-weight:bold; cursor:pointer;">ACEITAR E VENDER</button>
        `;
        Engine.Sistema.novaMensagem(`Proposta: ${alvo.nome}`, html, 'negociacao', 'Diretor de Futebol');
    },

    // 3. PROBLEMAS DE VESTIÁRIO (CRISE)
    gerarProblemaVestiario: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        if(time.elenco.length === 0) return;
        const alvo = time.elenco[Math.floor(Math.random() * time.elenco.length)];

        const html = `
            <p>Clima tenso no vestiário hoje.</p>
            <p><b>${alvo.nome}</b> reclamou publicamente da falta de minutos ou do esquema tático. Isso está afetando a moral do grupo.</p>
            <div style="background:#222; border-left:4px solid #f39c12; padding:10px; color:#ddd; font-style:italic;">
                "Se continuar assim, prefiro ser negociado."
            </div>
            <p>Precisamos intervir.</p>
            <button onclick="alert('Você multou o jogador em 10% do salário. A moral caiu, mas a disciplina subiu.')" class="btn-action" style="background:#d35400; color:#fff; border:none; padding:10px;">Aplicar Multa</button>
        `;
        Engine.Sistema.novaMensagem(`Indisciplina: ${alvo.nome}`, html, 'alerta', 'Capitão do Time');
    },

    // 4. MÍDIA E TORCIDA (FLAVOR TEXT)
    gerarEventoMidia: function(game) {
        const faseBoa = game.recursos.moral > 60;
        const lista = faseBoa ? this.db.midia_win : this.db.midia_lose;
        const manchete = lista[Math.floor(Math.random() * lista.length)];
        
        const html = `
            <p>Resumo da imprensa esportiva hoje:</p>
            <h3 style="color:${faseBoa ? '#2ecc71' : '#e74c3c'}">"${manchete}"</h3>
            <p>Isso reflete diretamente na nossa moral e na venda de ingressos para o próximo jogo.</p>
        `;
        Engine.Sistema.novaMensagem("Giro de Notícias", html, 'info', 'Assessoria de Imprensa');
    },

    // --- AÇÕES DO USUÁRIO ---
    venderJogador: function(uid, valor) {
        const game = Engine.carregarJogo();
        const tIdx = game.times.findIndex(t => t.nome === game.info.time);
        const jog = game.times[tIdx].elenco.find(j => j.uid === uid);
        
        if(jog) {
            game.recursos.dinheiro += valor;
            game.financas.historico.push({texto:`Venda ${jog.nome}`, valor:valor, tipo:'entrada'});
            game.times[tIdx].elenco = game.times[tIdx].elenco.filter(j => j.uid !== uid);
            Engine.salvarJogo(game);
            alert(`Negócio Fechado!\n${jog.nome} deixou o clube.\nR$ ${valor.toLocaleString()} entraram no caixa.`);
            window.location.reload();
        }
    },

    infiltrarJogador: function(uid) {
        const game = Engine.carregarJogo();
        const tIdx = game.times.findIndex(t => t.nome === game.info.time);
        const elenco = game.times[tIdx].elenco;
        const idx = elenco.findIndex(j => j.uid === uid);
        
        if(idx !== -1) {
            if(Math.random() > 0.5) { 
                elenco[idx].status = "Apto"; 
                elenco[idx].rodadasFora = 0; 
                alert("Sucesso! O jogador reagiu bem e vai para o jogo."); 
            } else { 
                elenco[idx].rodadasFora += 3; 
                alert("Deu errado! A lesão agravou. +3 Rodadas fora."); 
            }
            game.times[tIdx].elenco = elenco;
            Engine.salvarJogo(game);
        }
    }
};
