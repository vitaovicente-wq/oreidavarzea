// ARQUIVO: engine-treino.js
// Responsável por: Definir a intensidade e aplicar evolução/desgaste

Engine.Treino = {
    // Níveis: 'leve', 'balanceado', 'pesado'
    intensidade: 'balanceado', 

    setarIntensidade: function(nivel) {
        this.intensidade = nivel;
        const game = Engine.carregarJogo();
        game.flags.treinoAtual = nivel;
        Engine.salvarJogo(game);
        console.log(`💪 Treino alterado para: ${nivel.toUpperCase()}`);
    },

    aplicarEfeitos: function(game) {
        const time = game.times.find(t => t.nome === game.info.time);
        const tipo = game.flags.treinoAtual || 'balanceado';
        
        // Configuração de risco e evolução
        let riscoLesao = 0;
        let ganhoXP = 0;

        if (tipo === 'leve') {
            riscoLesao = -0.10; // Reduz chance de lesão
            ganhoXP = 0.01;     // Ganho mínimo
        } else if (tipo === 'balanceado') {
            riscoLesao = 0;     // Normal
            ganhoXP = 0.05;     // Ganho médio
        } else if (tipo === 'pesado') {
            riscoLesao = 0.20;  // Aumenta muito o risco
            ganhoXP = 0.12;     // Ganho alto de força
        }

        // Aplica pequena evolução (ou não) ao elenco
        time.elenco.forEach(j => {
            if(Math.random() < 0.3) { // 30% do elenco evolui um pouco a cada rodada
                j.forca += ganhoXP;
            }
        });

        return riscoLesao; // Retorna o modificador de risco para o Engine de Eventos usar
    }
};
