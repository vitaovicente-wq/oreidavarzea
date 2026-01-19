// ARQUIVO: engine-eventos.js
// NARRATIVA: Rica
// PROBABILIDADE: 100% (Modo Teste - Depois baixamos)

Engine.Eventos = {
    // ⚠️ 100% DE CHANCE PARA VER A MENSAGEM CHEGAR AGORA
    chances: {
        lesao: 1.0,         
        proposta: 0.0,       
        crise: 1.0,         
        midia: 1.0          
    },

    db: {
        lesoes: [
            { texto: "sentiu uma fisgada na posterior da coxa", gravidade: 2, tipo: "Muscular" },
            { texto: "sofreu uma torção no tornozelo", gravidade: 4, tipo: "Trauma" },
            { texto: "relatou desconforto no joelho", gravidade: 1, tipo: "Leve" }
        ],
        midia_win: ["A torcida está eufórica!", "Jornalistas elogiam a tática."],
        midia_lose: ["Muros pichados.", "Torcida protesta."]
    },

    processarEventosRodada: function(game) {
        // Sequencial para garantir
        if(Math.random() <= this.chances.lesao) this.gerarLesao(game);
        if(Math.random() <= this.chances.crise) this.gerarProblemaVestiario(game);
        if(Math.random() <= this.chances.midia) this.gerarEventoMidia(game);
    },

    gerarLesao: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const aptos = time.elenco.filter(j => j.status !== "Lesionado");
        
        if(aptos.length > 0) {
            const alvo = aptos[Math.floor(Math.random() * aptos.length)];
            const lesao = this.db.lesoes[Math.floor(Math.random() * this.db.lesoes.length)];
            
            // 1. Aplica lesão
            const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
            time.elenco[idx].status = "Lesionado";
            time.elenco[idx].rodadasFora = lesao.gravidade;
            Engine.salvarJogo(game); // Salva estado machucado

            // 2. Envia mensagem
            const html = `
                <div style="font-family:'Inter', sans-serif;">
                    <p>Boletim Médico:</p>
                    <div style="background:#2d1b1b; border-left:4px solid #e74c3c; padding:15px; margin:10px 0;">
                        <strong style="color:#e74c3c;">${alvo.nome}</strong><br>
                        <span style="color:#ccc;">${lesao.texto}.</span><br>
                        Tempo: <b>${lesao.gravidade} Rodadas</b>
                    </div>
                    <p>Iniciando tratamento.</p>
                </div>
            `;
            Engine.Sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm', 'Dr. Marcio');
        }
    },

    gerarProblemaVestiario: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        if(time.elenco.length > 0) {
            const alvo = time.elenco[0];
            const html = `<p><b>${alvo.nome}</b> reclamou do treino.</p>`;
            Engine.Sistema.novaMensagem(`Crise: ${alvo.nome}`, html, 'alerta', 'Capitão');
        }
    },

    gerarEventoMidia: function(game) {
        const html = `<p>Notícia da imprensa gerada com sucesso.</p>`;
        Engine.Sistema.novaMensagem("Notícia", html, 'info', 'Imprensa');
    },

    infiltrarJogador: function() {}
};
