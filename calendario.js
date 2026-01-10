// ARQUIVO: calendario.js

const CalendarioSystem = {
    
    // Função principal que gera o campeonato inteiro
    gerarCampeonato: function(times) {
        // Se o número de times for ímpar, adiciona um time "Fantasma" para a folga
        if (times.length % 2 !== 0) {
            times.push({ nome: "Folga", isGhost: true });
        }

        const numTimes = times.length;
        const jogosPorRodada = numTimes / 2;
        let rodadas = [];
        
        // Cria uma cópia da lista para manipular sem estragar a original
        let timesTemp = [...times];

        // --- PARTE 1: GERAR O TURNO (Round-Robin) ---
        for (let r = 0; r < numTimes - 1; r++) {
            let rodadaAtual = { 
                numero: r + 1, 
                jogos: [] 
            };
            
            for (let i = 0; i < jogosPorRodada; i++) {
                const timeCasa = timesTemp[i];
                const timeFora = timesTemp[numTimes - 1 - i];

                // Só cria o jogo se nenhum dos dois for o time "Folga"
                if (!timeCasa.isGhost && !timeFora.isGhost) {
                    rodadaAtual.jogos.push({
                        mandante: timeCasa.nome,
                        visitante: timeFora.nome,
                        placarCasa: null,
                        placarFora: null,
                        jogado: false
                    });
                }
            }
            rodadas.push(rodadaAtual);

            // Rotaciona os times (mantém o primeiro fixo e gira os outros no sentido horário)
            timesTemp.splice(1, 0, timesTemp.pop());
        }

        // --- PARTE 2: GERAR O RETURNO (Inverter mandos) ---
        const totalTurno = rodadas.length;
        
        for (let r = 0; r < totalTurno; r++) {
            let rodadaTurno = rodadas[r];
            let rodadaReturno = {
                numero: totalTurno + r + 1,
                jogos: []
            };

            rodadaTurno.jogos.forEach(jogo => {
                rodadaReturno.jogos.push({
                    mandante: jogo.visitante, // Inverte: quem visitou agora recebe
                    visitante: jogo.mandante, // Inverte
                    placarCasa: null,
                    placarFora: null,
                    jogado: false
                });
            });

            rodadas.push(rodadaReturno);
        }

        return rodadas;
    }
};

// Exporta para que o engine.js consiga enxergar este arquivo
window.CalendarioSystem = CalendarioSystem;
