// ARQUIVO: engine-eventos.js
// Responsável por: Eventos Aleatórios (Lesões, Propostas, Crises)

Engine.Eventos = {
    db: {
        intros: ["Más notícias,", "Infelizmente,", "Relatório do DM:", "Atenção professor,"],
        lesoes: ["sentiu a coxa", "torceu o tornozelo", "travou as costas", "machucou o joelho"],
        tempos: [1, 2, 3, 5, 10], 
        compradores: ["Al-Hilal", "Benfica", "River Plate", "Flamengo", "Real Madrid", "Ajax"],
        reclamacoes: ["quer aumento", "brigou no treino", "chegou atrasado", "foi visto na balada"]
    },

    processarEventosRodada: function(game) {
        // Probabilidades altas para teste
        if(Math.random() < 0.40) this.gerarLesao(game);
        if(Math.random() < 0.30) this.gerarPropostaCompra(game);
        if(Math.random() < 0.20) this.gerarProblemaVestiario(game);
    },

    gerarLesao: function(game) {
        const time = Engine.encontrarTime(game.info.time);
        const disp = time.elenco.filter(j => j.status !== "Lesionado");
        if(disp.length === 0) return;

        const alvo = disp[Math.floor(Math.random() * disp.length)];
        const tempo = this.db.tempos[Math.floor(Math.random() * this.db.tempos.length)];
        
        // Aplica e Salva
        const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
        time.elenco[idx].status = "Lesionado"; 
        time.elenco[idx].rodadasFora = tempo;
        
        const tIdx = game.times.findIndex(t => t.nome === game.info.time);
        game.times[tIdx] = time;
        Engine.salvarJogo(game);

        const html = `<p><b>${alvo.nome}</b> se machucou. Fora por <b>${tempo} rodadas</b>.</p>
        <button onclick="Engine.Eventos.infiltrarJogador('${alvo.uid}')" class="btn-action" style="background:#d63031;">💉 Infiltrar (Risco)</button>`;
        Engine.Sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm', 'Depto Médico');
    },

    gerarPropostaCompra: function(game) {
        const time = Engine.encontrarTime(game.info.time);
        if(time.elenco.length===0) return;
        const alvo = time.elenco[Math.floor(Math.random()*time.elenco.length)];
        const comprador = this.db.compradores[Math.floor(Math.random()*this.db.compradores.length)];
        const oferta = Math.floor((alvo.valor||alvo.forca*80000) * (0.9 + Math.random()));

        const html = `<p>O <b>${comprador}</b> ofereceu <b>R$ ${oferta.toLocaleString()}</b> pelo ${alvo.nome}.</p>
        <button onclick='Engine.Eventos.venderJogador("${alvo.uid}", ${oferta})' class="btn-action" style="background:#00b894;">VENDER</button>`;
        Engine.Sistema.novaMensagem(`Proposta: ${alvo.nome}`, html, 'negociacao', 'Empresário');
    },

    gerarProblemaVestiario: function(game) {
        const time = Engine.encontrarTime(game.info.time);
        if(time.elenco.length===0) return;
        const alvo = time.elenco[Math.floor(Math.random()*time.elenco.length)];
        const prob = this.db.reclamacoes[Math.floor(Math.random()*this.db.reclamacoes.length)];
        
        const html = `<p><b>${alvo.nome}</b> ${prob}. O clima pesou.</p>
        <button onclick="alert('Multado!')" class="btn-action" style="background:#d63031;">Multar</button>`;
        Engine.Sistema.novaMensagem(`Clima Tenso: ${alvo.nome}`, html, 'alerta', 'Capitão');
    },

    venderJogador: function(uid, valor) {
        const game = Engine.carregarJogo();
        const tIdx = game.times.findIndex(t => t.nome === game.info.time);
        const jog = game.times[tIdx].elenco.find(j => j.uid === uid);
        if(jog) {
            game.recursos.dinheiro += valor;
            game.financas.historico.push({texto:`Venda ${jog.nome}`, valor:valor, tipo:'entrada'});
            game.times[tIdx].elenco = game.times[tIdx].elenco.filter(j => j.uid !== uid);
            Engine.salvarJogo(game);
            alert("Vendido!");
            location.reload();
        }
    },
    infiltrarJogador: function(uid) {
        const game = Engine.carregarJogo();
        const tIdx = game.times.findIndex(t => t.nome === game.info.time);
        const elenco = game.times[tIdx].elenco;
        const idx = elenco.findIndex(j => j.uid === uid);
        if(idx !== -1) {
            if(Math.random() > 0.5) { elenco[idx].status = "Apto"; elenco[idx].rodadasFora = 0; alert("Funcionou! Ele joga."); } 
            else { elenco[idx].rodadasFora += 2; alert("Piorou a lesão!"); }
            game.times[tIdx].elenco = elenco;
            Engine.salvarJogo(game);
        }
    }
};
