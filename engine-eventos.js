// ARQUIVO: engine-eventos.js
// VERSÃO: DIAGNÓSTICO (100% DE CHANCE + LOGS)
// Use esta versão para garantir que o sistema está funcionando.

Engine.Eventos = {
    // ⚠️ PROBABILIDADES EM 1.0 (100%) PARA TESTE
    chances: {
        lesao: 1.0,          // Vai acontecer TODA rodada
        proposta: 0.0,       // Desligado
        crise: 1.0,          // Vai acontecer TODA rodada
        midia: 1.0           // Vai acontecer TODA rodada
    },

    db: {
        lesoes: [
            { texto: "sentiu uma fisgada na posterior", gravidade: 2, tipo: "Muscular" },
            { texto: "torceu o tornozelo", gravidade: 3, tipo: "Trauma" }
        ],
        midia_win: ["A torcida está cantando!", "Elogios na TV."],
        midia_lose: ["Protestos no CT.", "Críticas no jornal."]
    },

    // --- PROCESSAMENTO COM LOGS DE DEPURAÇÃO ---
    processarEventosRodada: function(game) {
        console.log("⚡ ENGINE EVENTOS: Iniciando processamento da rodada...");
        
        let eventosGerados = 0;

        // Tenta gerar Lesão
        if(Math.random() <= this.chances.lesao) {
            console.log("   -> Tentando gerar Lesão...");
            this.gerarLesao(game);
            eventosGerados++;
        }

        // Tenta gerar Crise
        if(Math.random() <= this.chances.crise) {
            console.log("   -> Tentando gerar Crise...");
            this.gerarProblemaVestiario(game);
            eventosGerados++;
        }

        // Tenta gerar Mídia
        if(Math.random() <= this.chances.midia) {
            console.log("   -> Tentando gerar Mídia...");
            this.gerarEventoMidia(game);
            eventosGerados++;
        }

        console.log(`⚡ ENGINE EVENTOS: Fim. Total gerado: ${eventosGerados}`);
    },

    // 1. LESÕES
    gerarLesao: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const aptos = time.elenco.filter(j => j.status !== "Lesionado");
        
        if(aptos.length > 0) {
            const alvo = aptos[Math.floor(Math.random() * aptos.length)];
            const lesao = this.db.lesoes[Math.floor(Math.random() * this.db.lesoes.length)];
            
            // Aplica
            const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
            time.elenco[idx].status = "Lesionado";
            time.elenco[idx].rodadasFora = lesao.gravidade;
            
            // Salva antes de mandar msg
            Engine.salvarJogo(game); 

            const html = `<p>O jogador <b>${alvo.nome}</b> ${lesao.texto}. Fora por ${lesao.gravidade} rodadas.</p>`;
            Engine.Sistema.novaMensagem(`DM TESTE: ${alvo.nome}`, html, 'dm', 'Dr. Teste');
            console.log("   ✅ SUCESSO: Lesão criada para " + alvo.nome);
        } else {
            console.log("   ⚠️ AVISO: Ninguém disponível para lesionar.");
        }
    },

    // 2. CRISE
    gerarProblemaVestiario: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const alvo = time.elenco[0]; // Pega o primeiro só pra testar

        const html = `<p><b>${alvo.nome}</b> reclamou do treino (Teste de Crise).</p>`;
        Engine.Sistema.novaMensagem(`CRISE TESTE: ${alvo.nome}`, html, 'alerta', 'Capitão');
        console.log("   ✅ SUCESSO: Crise criada.");
    },

    // 3. MÍDIA
    gerarEventoMidia: function(game) {
        const html = `<p>Notícia de teste da imprensa gerada com sucesso.</p>`;
        Engine.Sistema.novaMensagem("MÍDIA TESTE", html, 'info', 'Imprensa');
        console.log("   ✅ SUCESSO: Mídia criada.");
    },

    // Funções auxiliares vazias para evitar erro se forem chamadas
    venderJogador: function() {},
    infiltrarJogador: function() {}
};
