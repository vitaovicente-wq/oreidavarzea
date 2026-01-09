// ARQUIVO: calendario.js

const CalendarioSystem = {
    
    // Gera todos os jogos do campeonato (Turno e Returno)
    gerarCampeonato: function(times) {
        if (times.length % 2 !== 0) {
            // Se for ímpar, adiciona um time "Folga" (fantasma)
            times.push({ nome: "Folga", isGhost: true });
        }

        const numTimes = times.length;
        const numRodadas = (numTimes - 1) * 2; // Turno e Returno
        const jogosPorRodada = numTimes / 2;
        
        let rodadas = [];
        let timesTemp = [...times]; // Cópia para manipular

        // Algoritmo Round-Robin para gerar o Turno
        for (let r = 0; r < numTimes - 1; r++) {
            let rodadaAtual = { numero: r + 1, jogos: [] };
            
            for (let i = 0; i < jogosPorRodada; i++) {
                const timeCasa = timesTemp[i];
                const timeFora = timesTemp[numTimes - 1 - i];

                // Só cria o jogo se nenhum dos dois for "Folga"
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

            // Rotaciona os times (mantém o primeiro fixo e gira os outros)
            timesTemp.splice(1, 0, timesTemp.pop());
        }

        // Gerar Returno (Inverte mandante e visitante)
        const totalTurno = rodadas.length;
        for (let r = 0; r < totalTurno; r++) {
            let rodadaTurno = rodadas[r];
            let rodadaReturno = {
                numero: totalTurno + r + 1,
                jogos: []
            };

            rodadaTurno.jogos.forEach(jogo => {
                rodadaReturno.jogos.push({
                    mandante: jogo.visitante, // Inverte
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

// Se precisar usar no Node.js ou testes
if (typeof module !== 'undefined') module.exports = CalendarioSystem;
