// ARQUIVO: engine-eventos.js
// NARRATIVA: Profunda e Contextual
// PROBABILIDADE: Ajustada para realismo (não acontece toda hora)

Engine.Eventos = {
    // Chances ajustadas (0.15 = 15%). Não é mais 100%.
    chances: {
        lesao: 0.15,         
        proposta: 0.0,       // Desativado
        crise: 0.10,         
        midia: 0.20          
    },

    db: {
        lesoes: [
            { texto: "sentiu o adutor da coxa ao tentar um sprint defensivo", gravidade: 2, tipo: "Muscular" },
            { texto: "travou o pé no gramado e girou o joelho", gravidade: 6, tipo: "Ligamento" },
            { texto: "sofreu uma pancada forte na canela e saiu de maca", gravidade: 3, tipo: "Trauma" },
            { texto: "reclamou de dores lombares após o aquecimento", gravidade: 1, tipo: "Desgaste" },
            { texto: "teve uma concussão após choque de cabeça", gravidade: 2, tipo: "Protocolo" }
        ],
        fofocas: [
            "foi visto em uma balada na noite anterior ao treino.",
            "está sendo processado por pensão alimentícia.",
            "comprou um carro de R$ 2 milhões e postou nas redes sociais.",
            "está namorando uma influenciadora famosa."
        ],
        elogios: [
            "tem sido o pulmão do time nas últimas partidas.",
            "lidera as estatísticas de desarmes no campeonato.",
            "foi elogiado pelo treinador da Seleção."
        ]
    },

    processarEventosRodada: function(game) {
        // Pega o modificador do treino (se treino pesado, aumenta chance de lesão)
        const modTreino = (window.Engine.Treino) ? window.Engine.Treino.aplicarEfeitos(game) : 0;
        
        // Chance final = Base + Treino
        const chanceLesaoFinal = this.chances.lesao + modTreino;

        if(Math.random() < chanceLesaoFinal) this.gerarLesao(game);
        if(Math.random() < this.chances.crise) this.gerarCrise(game);
        if(Math.random() < this.chances.midia) this.gerarNoticiaImprensa(game);
    },

    // 1. LESÃO (COM DR. TAIRO E INDISPONIBILIDADE)
    gerarLesao: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const aptos = time.elenco.filter(j => j.status !== "Lesionado");
        
        if(aptos.length > 0) {
            const alvo = aptos[Math.floor(Math.random() * aptos.length)];
            const lesao = this.db.lesoes[Math.floor(Math.random() * this.db.lesoes.length)];
            
            // Aplica a indisponibilidade real
            const idx = time.elenco.findIndex(j => j.uid === alvo.uid);
            time.elenco[idx].status = "Lesionado";
            time.elenco[idx].rodadasFora = lesao.gravidade;
            
            Engine.salvarJogo(game);

            const html = `
                <div style="font-family:'Inter', sans-serif;">
                    <p>Relatório do Departamento Médico:</p>
                    <div style="background:#2d1b1b; border-left:4px solid #e74c3c; padding:15px; margin:10px 0;">
                        <strong style="color:#e74c3c;">${alvo.nome}</strong><br>
                        <span style="color:#ccc;">${lesao.texto}.</span><br><br>
                        <small>Diagnóstico Inicial:</small><br>
                        <b>${lesao.tipo}</b> - Previsão: <b style="color:#fff;">${lesao.gravidade} jogos fora</b>.
                    </div>
                    <p>Já iniciamos a fisioterapia intensiva.</p>
                </div>
            `;
            // Dr. Tairo assume o DM
            Engine.Sistema.novaMensagem(`DM: ${alvo.nome}`, html, 'dm', 'Dr. Tairo');
        }
    },

    // 2. CRISE (CONTEXTO DO TREINO)
    gerarCrise: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const capitao = time.elenco.reduce((prev, current) => (prev.forca > current.forca) ? prev : current); // Pega o melhor como capitão
        const treinoAtual = game.flags.treinoAtual || 'balanceado';
        
        let reclamacao = "";
        let titulo = "";

        // Reclamação muda de acordo com o treino
        if (treinoAtual === 'pesado') {
            titulo = "Elenco Desgastado";
            reclamacao = `Professor, o grupo está sentindo a carga. O treino <b>PESADO</b> está matando a gente. Estamos sem pernas pro jogo.`;
        } else if (treinoAtual === 'leve') {
            titulo = "Falta de Intensidade";
            reclamacao = `A gente sente que está perdendo ritmo. Esse treino <b>LEVE</b> demais está deixando o time mole em campo.`;
        } else {
            titulo = "Insatisfação Tática";
            reclamacao = `O grupo não está entendendo sua tática. Precisamos de treinos mais específicos, estamos batendo cabeça.`;
        }

        const html = `
            <p>O capitão <b>${capitao.nome}</b> pediu uma reunião portas fechadas:</p>
            <div style="background:#222; border-left:4px solid #f39c12; padding:15px; font-style:italic;">
                "${reclamacao}"
            </div>
            <p>Ignorar isso pode derrubar sua moral no vestiário.</p>
            <button onclick="alert('Você prometeu rever os treinos. A moral estabilizou.')" class="btn-action" style="width:100%; background:#444; color:#fff; border:none; padding:10px;">Prometer Melhorias</button>
        `;
        Engine.Sistema.novaMensagem(titulo, html, 'alerta', 'Vestiário');
    },

    // 3. IMPRENSA (VARIEDADE)
    gerarNoticiaImprensa: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const jogador = time.elenco[Math.floor(Math.random() * time.elenco.length)];
        const aleatorio = Math.random();
        
        let manchete = "";
        let corpo = "";
        let cor = "#3498db"; // Azul info

        if (aleatorio < 0.4) {
            // Vida Pessoal (Fofoca)
            const fofoca = this.db.fofocas[Math.floor(Math.random() * this.db.fofocas.length)];
            manchete = "Coluna Social: Bastidores";
            corpo = `O atleta <b>${jogador.nome}</b> virou assunto nos sites de fofoca. Fontes dizem que ele ${fofoca}`;
            cor = "#9b59b6"; // Roxo
        } else if (aleatorio < 0.7) {
            // Análise Tática
            manchete = "Análise Tática";
            corpo = `O comentarista Paulo Vinícius criticou a postura do seu time: "Falta compactação. O treinador ${game.info.tecnico} precisa arrumar a cozinha ou vai cair."`;
            cor = "#e74c3c"; // Vermelho
        } else {
            // Elogio
            const elogio = this.db.elogios[Math.floor(Math.random() * this.db.elogios.length)];
            manchete = "Destaque da Rodada";
            corpo = `Olho nele: <b>${jogador.nome}</b> ${elogio} É peça chave no esquema.`;
            cor = "#2ecc71"; // Verde
        }

        const html = `
            <div style="border-bottom:2px solid ${cor}; padding-bottom:10px; margin-bottom:10px;">
                <h3 style="margin:0; color:${cor};">${manchete}</h3>
                <small>Fonte: Portal BR Futebol</small>
            </div>
            <p>${corpo}</p>
        `;
        Engine.Sistema.novaMensagem(manchete, html, 'info', 'Assessoria');
    }
};
