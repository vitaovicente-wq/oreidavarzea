// ARQUIVO: engine-eventos.js
// NARRATIVA: Eventos Detalhados (Lesões, Crises, Mídia)
// Transferências: DESATIVADAS (Chance 0.0)

Engine.Eventos = {
    // Probabilidades Equilibradas
    chances: {
        lesao: 0.35,         // 35% de chance
        proposta: 0.0,       // 0% (DESATIVADO)
        crise: 0.25,         // 25% de chance
        midia: 0.30          // 30% de chance
    },

    db: {
        lesoes: [
            { texto: "sentiu uma fisgada na posterior da coxa durante o treino", gravidade: 2, tipo: "Muscular" },
            { texto: "sofreu uma torção feia no tornozelo após uma dividida", gravidade: 4, tipo: "Trauma" },
            { texto: "relatou desconforto no joelho e inchaço", gravidade: 1, tipo: "Leve" },
            { texto: "teve uma ruptura parcial de ligamento (LCA)", gravidade: 10, tipo: "Grave" }
        ],
        midia_win: [
            "A torcida está eufórica com a sequência de vitórias.", 
            "Jornalistas elogiam seu esquema tático na mesa redonda.", 
            "Programa de Sócio-Torcedor bateu recorde de adesão."
        ],
        midia_lose: [
            "Muros do CT foram pichados nesta madrugada.", 
            "Jornalista famoso pediu sua demissão ao vivo na TV.", 
            "Torcida organizada protestou no aeroporto."
        ]
    },

    // --- PROCESSAMENTO ---
    processarEventosRodada: function(game) {
        if(Math.random() < this.chances.lesao) this.gerarLesao(game);
        if(Math.random() < this.chances.crise) this.gerarProblemaVestiario(game);
        if(Math.random() < this.chances.midia) this.gerarEventoMidia(game);
    },

    // 1. LESÕES (COM OPÇÃO DE INFILTRAÇÃO)
    gerarLesao: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const aptos = time.elenco.filter(j => j.status !== "Lesionado");
        
        if(aptos.length > 0) {
            const alvo = aptos[Math.floor(Math.random() * aptos.length)];
            const lesao = this.db.lesoes[Math.floor(Math.random() * this.db.lesoes.length)];
            const tempo = lesao.gravidade;

            const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
            time.elenco[idx].status = "Lesionado";
            time.elenco[idx].rodadasFora = tempo;
            Engine.salvarJogo(game);

            const html = `
                <div style="font-family:'Inter', sans-serif;">
                    <p>Boletim Médico Urgente:</p>
                    <div style="background:#2d1b1b; border-left:4px solid #e74c3c; padding:15px; margin:10px 0;">
                        <strong style="color:#e74c3c; font-size:1.1rem;">${alvo.nome}</strong><br>
                        <span style="color:#ccc;">${lesao.texto}.</span><br><br>
                        Diagnóstico: <b>${lesao.tipo}</b><br>
                        Tempo estimado: <b style="color:#fff;">${tempo} Rodadas</b>
                    </div>
                    <p>O protocolo padrão é repouso, mas podemos arriscar uma infiltração para tê-lo no próximo jogo.</p>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:15px;">
                        <button onclick="alert('Jogador seguirá em tratamento convencional.')" class="btn-action" style="background:#444; color:#fff; border:none; padding:10px; cursor:pointer;">Respeitar DM</button>
                        <button onclick="Engine.Eventos.infiltrarJogador('${alvo.uid}')" class="btn-action" style="background:#c0392b; color:#fff; border:none; padding:10px; cursor:pointer;">💉 Infiltrar (Risco)</button>
                    </div>
                </div>
            `;
            Engine.Sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm', 'Dr. Marcio (Médico)');
        }
    },

    // 2. CRISE
    gerarProblemaVestiario: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        if(time.elenco.length > 0) {
            const alvo = time.elenco[Math.floor(Math.random() * time.elenco.length)];

            const html = `
                <p>Relatório de Inteligência:</p>
                <p>O jogador <b>${alvo.nome}</b> demonstrou insatisfação no treino de hoje. Ele foi visto reclamando com companheiros sobre suas decisões táticas.</p>
                <div style="background:#222; border-left:4px solid #f39c12; padding:10px; color:#ddd; font-style:italic; margin:10px 0;">
                    "O treinador está perdido. Desse jeito não vamos a lugar nenhum."
                </div>
                <p>Isso afetou levemente a moral do elenco. A diretoria sugere uma conversa ou punição.</p>
                <button onclick="alert('Você multou o jogador. A disciplina foi restaurada.')" class="btn-action" style="background:#d35400; color:#fff; border:none; padding:10px; width:100%; cursor:pointer;">Aplicar Multa Disciplinar</button>
            `;
            Engine.Sistema.novaMensagem(`Indisciplina: ${alvo.nome}`, html, 'alerta', 'Capitão do Time');
        }
    },

    // 3. MÍDIA
    gerarEventoMidia: function(game) {
        const faseBoa = game.recursos.moral > 50;
        const lista = faseBoa ? this.db.midia_win : this.db.midia_lose;
        const manchete = lista[Math.floor(Math.random() * lista.length)];
        
        const html = `
            <p>Clipping de Notícias - Manhã:</p>
            <div style="border:1px solid #444; padding:15px; background:#111;">
                <h3 style="color:${faseBoa ? '#2ecc71' : '#e74c3c'}; margin-top:0;">"${manchete}"</h3>
                <small style="color:#666;">FONTE: Portal Esportivo Nacional</small>
            </div>
            <p>O departamento de marketing informa que isso impactará a venda de camisas esta semana.</p>
        `;
        Engine.Sistema.novaMensagem("Giro de Notícias", html, 'info', 'Assessoria de Imprensa');
    },

    // --- AÇÕES ---
    infiltrarJogador: function(uid) {
        const game = Engine.carregarJogo();
        const tIdx = game.times.findIndex(t => t.nome === game.info.time);
        const elenco = game.times[tIdx].elenco;
        const idx = elenco.findIndex(j => j.uid === uid);
        
        if(idx !== -1) {
            if(Math.random() > 0.5) { 
                elenco[idx].status = "Apto"; 
                elenco[idx].rodadasFora = 0; 
                alert("SUCESSO! O jogador reagiu bem à infiltração e vai para o jogo."); 
            } else { 
                elenco[idx].rodadasFora += 3; 
                alert("FALHA! Ocorreu uma reação inflamatória. A lesão piorou (+3 rodadas)."); 
            }
            game.times[tIdx].elenco = elenco;
            Engine.salvarJogo(game);
            window.location.reload();
        }
    }
};
