// ARQUIVO: engine-estadio.js
// ATUALIZADO: Nomes Reais + Correção de Cálculo

Engine.Estadios = {
    // Lista de Estádios Reais para mapeamento automático
    dbEstadios: {
        "Corinthians": "Neo Química Arena", "Palmeiras": "Allianz Parque", "São Paulo": "Morumbi",
        "Santos": "Vila Belmiro", "Flamengo": "Maracanã", "Fluminense": "Maracanã",
        "Vasco": "São Januário", "Botafogo": "Nilton Santos", "Grêmio": "Arena do Grêmio",
        "Internacional": "Beira-Rio", "Atlético-MG": "Arena MRV", "Cruzeiro": "Mineirão",
        "Bahia": "Fonte Nova", "Vitória": "Barradão", "Fortaleza": "Castelão",
        "Ceará": "Castelão", "Athletico-PR": "Ligga Arena", "Coritiba": "Couto Pereira",
        "Sport": "Ilha do Retiro", "Santa Cruz": "Arruda", "Náutico": "Aflitos",
        "Goiás": "Serrinha", "Vila Nova": "OBA", "Paysandu": "Curuzu", "Remo": "Baenão"
    },

    getEstadio: function() {
        const game = Engine.carregarJogo();
        const timeNome = game.info.time;
        
        // Se não tiver estádio salvo, cria um novo
        if (!game.estadio) {
            // Tenta achar o nome real na lista, senão usa genérico
            const nomeReal = this.dbEstadios[timeNome] || "Estádio Municipal";
            const timeObj = game.times.find(t => t.nome === timeNome);
            const forca = timeObj ? timeObj.forca : 60;

            game.estadio = {
                nome: nomeReal,
                capacidade: this._definirCapacidade(forca),
                precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 },
                nivel: 1
            };
            Engine.salvarJogo(game);
        } else {
            // CORREÇÃO RETROATIVA: Se já salvou com nome genérico, tenta corrigir agora
            if(game.estadio.nome === "Estádio Municipal" && this.dbEstadios[timeNome]) {
                game.estadio.nome = this.dbEstadios[timeNome];
                Engine.salvarJogo(game);
            }
        }
        return game.estadio;
    },

    salvarConfig: function(novosPrecos) {
        const game = Engine.carregarJogo();
        if (!game.estadio) this.getEstadio(); 

        game.estadio.precos = novosPrecos;
        Engine.salvarJogo(game);
        console.log("🏟️ Configurações de estádio salvas.");
    },

    // AQUI ESTAVA O ERRO DA ESTIMATIVA
    calcularBilheteria: function(adversario) {
        const game = Engine.carregarJogo();
        const est = this.getEstadio();
        const moral = game.recursos.moral || 50;
        
        // Se for simulação de tela (objeto simples), usa força padrão
        const forcaAdv = adversario.forca || 60; 
        
        // Fator de Interesse (0.1 a 1.2)
        // Moral conta muito, Força do adversário conta também
        let interesseBase = (moral * 0.6) + (forcaAdv * 0.4);
        
        // Fator Preço (Se estiver muito caro, público cai)
        // Preço base de referência: 40 reais. Se for 80, interesse cai.
        const fatorPreco = 40 / (est.precos.geral || 40); 
        
        let ocupacaoPercent = (interesseBase * fatorPreco) + (Math.random() * 10);
        
        // Trava entre 5% e 100%
        if(ocupacaoPercent > 100) ocupacaoPercent = 100;
        if(ocupacaoPercent < 5) ocupacaoPercent = 5;

        const publicoTotal = Math.floor(est.capacidade * (ocupacaoPercent / 100));
        
        // Distribuição Setorial
        const pGeral = Math.floor(publicoTotal * 0.60);
        const pCadeiras = Math.floor(publicoTotal * 0.35);
        const pVip = Math.floor(publicoTotal * 0.05);
        const pCarros = Math.floor(publicoTotal * 0.20); // 20% vão de carro

        // Renda
        const renda = (pGeral * est.precos.geral) + 
                      (pCadeiras * est.precos.cadeiras) + 
                      (pVip * est.precos.vip) +
                      (pCarros * est.precos.estacionamento);

        return {
            publicoTotal: publicoTotal, // <--- CORRIGIDO: O nome agora bate com o HTML
            rendaTotal: renda,
            ocupacao: Math.floor(ocupacaoPercent)
        };
    },

    salvarPrecos: function(tempPrecos) {
        // Função auxiliar para salvar temporariamente na memória para cálculo
        // Não salva no disco, apenas para a Engine usar no cálculo imediato
        this._tempPrecos = tempPrecos;
    },

    _definirCapacidade: function(forca) {
        if (forca >= 85) return 45000 + Math.floor(Math.random() * 5000); 
        if (forca >= 75) return 30000 + Math.floor(Math.random() * 5000); 
        return 10000 + Math.floor(Math.random() * 5000); 
    }
};

// Hack para usar preços temporários da tela de simulação
const originalGetEstadio = Engine.Estadios.getEstadio;
Engine.Estadios.getEstadio = function() {
    const est = originalGetEstadio.call(Engine.Estadios);
    if (Engine.Estadios._tempPrecos) {
        return { ...est, precos: Engine.Estadios._tempPrecos };
    }
    return est;
};
