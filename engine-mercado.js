// ARQUIVO: engine-mercado.js
// Responsável por: Mercado, Transferências e IA

Engine.Mercado = {
    getAgentesLivres: function() { return JSON.parse(localStorage.getItem('brfutebol_livres') || '[]'); },
    getListaTransferencias: function() { return JSON.parse(localStorage.getItem('brfutebol_transferencias') || '[]'); },
    
    // IA DE NEGOCIAÇÃO COMPLETA
    avaliarTransferencia: function(jogador, meuTime) {
        const necessidade = Math.floor(Math.random() * 100);
        let valorBase = jogador.valor;
        let postura = 'neutra';
        
        if (jogador.forca > 80) { valorBase *= 1.3; postura = 'dura'; } 
        else if (necessidade > 70) { valorBase *= 0.85; postura = 'flexivel'; }

        const alvosTroca = meuTime.elenco.filter(j => 
            (j.pos === jogador.pos && j.forca >= jogador.forca - 5)
        ).slice(0, 3); 

        return {
            valorPedido: Math.floor(valorBase),
            aceitaEmprestimo: jogador.forca < 75,
            aceitaTroca: true,
            postura: postura,
            paciencia: 4, 
            alvosTroca: alvosTroca
        };
    },

    atualizarListaTransferencias: function(game) {
        let lista = this.getListaTransferencias();
        // IA adiciona jogador a venda
        if(Math.random() > 0.6 && lista.length < 25) { 
            const timesCPU = game.times.filter(t => t.nome !== game.info.time);
            const timeAleatorio = timesCPU[Math.floor(Math.random() * timesCPU.length)];
            if(timeAleatorio && timeAleatorio.elenco.length > 18) {
                const jogador = timeAleatorio.elenco[Math.floor(Math.random() * timeAleatorio.elenco.length)];
                if (!lista.find(j => j.uid === jogador.uid) && jogador.forca < 85) {
                    const valor = Math.floor(Math.pow(jogador.forca, 3) * 18);
                    lista.push({ ...jogador, valor: valor, clube: timeAleatorio.nome });
                }
            }
        }
        localStorage.setItem('brfutebol_transferencias', JSON.stringify(lista));
    },

    simularDispensasCPU: function(game) {
        let livres = this.getAgentesLivres();
        if (Math.random() > 0.85) { 
            const timesCPU = game.times.filter(t => t.nome !== game.info.time);
            const time = timesCPU[Math.floor(Math.random() * timesCPU.length)];
            if (time && time.elenco.length > 22) {
                const dispensado = time.elenco.sort((a,b)=>a.forca-b.forca)[0]; // Dispensa o pior
                time.elenco = time.elenco.filter(j => j.uid !== dispensado.uid);
                livres.push({ ...dispensado, valor: 0, clube: null });
                Engine.Sistema.novaMensagem("Mercado", `O ${time.nome} dispensou ${dispensado.nome}.`, 'info');
            }
        }
        localStorage.setItem('brfutebol_livres', JSON.stringify(livres));
    },

    removerJogador: function(uid, tipo) {
        let k = tipo === 'livre' ? 'brfutebol_livres' : 'brfutebol_transferencias';
        let lista = JSON.parse(localStorage.getItem(k) || '[]');
        lista = lista.filter(j => j.uid !== uid);
        localStorage.setItem(k, JSON.stringify(lista));
    }
};
