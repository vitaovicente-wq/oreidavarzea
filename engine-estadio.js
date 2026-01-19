// ARQUIVO: engine-estadio.js
// Responsável por: Gerenciar preços, capacidade e cálculo de renda

Engine.Estadios = {
    // Retorna os dados do estádio atual
    getEstadio: function() {
        const game = Engine.carregarJogo();
        const time = game.times.find(t => t.nome === game.info.time);
        
        // Se não tiver dados salvos, cria padrão
        if (!game.estadio) {
            game.estadio = {
                nome: time.estadio || "Estádio Municipal",
                capacidade: this._definirCapacidade(time.forca),
                precos: { geral: 40, cadeiras: 80, vip: 250 }, // Preços padrão
                nivel: 1
            };
            Engine.salvarJogo(game);
        }
        return game.estadio;
    },

    // Salva as alterações feitas na tela de Estádio
    salvarConfig: function(novosPrecos) {
        const game = Engine.carregarJogo();
        if (!game.estadio) this.getEstadio(); // Garante que existe

        game.estadio.precos = novosPrecos;
        Engine.salvarJogo(game);
        console.log("🏟️ Preços do estádio atualizados.");
    },

    // Chamado pelo engine-core.js para calcular quanto dinheiro entra
    calcularBilheteria: function(adversario) {
        const game = Engine.carregarJogo();
        const est = this.getEstadio();
        const moral = game.recursos.moral;
        
        // Fator de Lotação (Baseado na Moral + Força do Adversário)
        let interesse = (moral / 2) + (adversario.forca / 2); // 0 a 100
        
        // Aleatoriedade do dia (Chuva, transito, etc)
        interesse = interest * (0.8 + Math.random() * 0.4); 

        // Limita entre 10% e 100% de ocupação
        if (interesse > 100) interesse = 100;
        if (interesse < 10) interesse = 10;

        const publicoTotal = Math.floor(est.capacidade * (interesse / 100));
        
        // Distribuição do Público (Geral enche mais)
        const pGeral = Math.floor(publicoTotal * 0.60);
        const pCadeiras = Math.floor(publicoTotal * 0.35);
        const pVip = Math.floor(publicoTotal * 0.05);

        // Renda
        const renda = (pGeral * est.precos.geral) + 
                      (pCadeiras * est.precos.cadeiras) + 
                      (pVip * est.precos.vip);

        return {
            publico: publicoTotal,
            rendaTotal: renda
        };
    },

    // Função interna para definir tamanho do estádio baseado na força do time
    _definirCapacidade: function(forca) {
        if (forca >= 85) return 45000 + Math.floor(Math.random() * 10000); // GIGANTE
        if (forca >= 75) return 30000 + Math.floor(Math.random() * 10000); // MÉDIO
        return 10000 + Math.floor(Math.random() * 10000); // PEQUENO
    }
};
