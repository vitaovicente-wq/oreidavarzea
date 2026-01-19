// ARQUIVO: engine-estadio.js
// ATUALIZADO: Capacidades Reais + Correção Automática de Save

Engine.Estadios = {
    // BANCO DE DADOS REAL (Nome + Capacidade)
    dbEstadios: {
        "Corinthians": { nome: "Neo Química Arena", cap: 47605 },
        "Palmeiras": { nome: "Allianz Parque", cap: 43713 },
        "São Paulo": { nome: "Morumbi", cap: 66795 },
        "Santos": { nome: "Vila Belmiro", cap: 16068 },
        "Flamengo": { nome: "Maracanã", cap: 78838 },
        "Fluminense": { nome: "Maracanã", cap: 78838 },
        "Vasco": { nome: "São Januário", cap: 21880 },
        "Botafogo": { nome: "Nilton Santos", cap: 44661 },
        "Grêmio": { nome: "Arena do Grêmio", cap: 55662 },
        "Internacional": { nome: "Beira-Rio", cap: 50128 },
        "Atlético-MG": { nome: "Arena MRV", cap: 46000 },
        "Cruzeiro": { nome: "Mineirão", cap: 61846 },
        "Bahia": { nome: "Fonte Nova", cap: 50025 },
        "Vitória": { nome: "Barradão", cap: 30618 },
        "Fortaleza": { nome: "Castelão", cap: 63903 },
        "Ceará": { nome: "Castelão", cap: 63903 },
        "Athletico-PR": { nome: "Ligga Arena", cap: 42372 },
        "Coritiba": { nome: "Couto Pereira", cap: 40502 },
        "Sport": { nome: "Ilha do Retiro", cap: 26418 },
        "Santa Cruz": { nome: "Arruda", cap: 60044 },
        "Náutico": { nome: "Aflitos", cap: 22856 },
        "Goiás": { nome: "Serrinha", cap: 14525 },
        "Vila Nova": { nome: "OBA", cap: 11788 },
        "Paysandu": { nome: "Curuzu", cap: 16200 },
        "Remo": { nome: "Baenão", cap: 13792 },
        "Bragantino": { nome: "Nabi Abi Chedid", cap: 17022 },
        "Chapecoense": { nome: "Arena Condá", cap: 20089 }
    },

    getEstadio: function() {
        const game = Engine.carregarJogo();
        const timeNome = game.info.time;
        
        // Dados reais do DB (se existir)
        const realData = this.dbEstadios[timeNome];

        // 1. CRIAÇÃO SE NÃO EXISTIR
        if (!game.estadio) {
            const timeObj = game.times.find(t => t.nome === timeNome);
            const forca = timeObj ? timeObj.forca : 60;

            game.estadio = {
                nome: realData ? realData.nome : "Estádio Municipal",
                capacidade: realData ? realData.cap : this._definirCapacidadeGenerica(forca),
                precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 },
                nivel: 1
            };
            Engine.salvarJogo(game);
        } 
        
        // 2. CORREÇÃO AUTOMÁTICA (Se o save tiver capacidade errada, corrige agora)
        else if (realData) {
            // Se o nome ou capacidade estiverem diferentes do real, atualiza
            if (game.estadio.nome !== realData.nome || game.estadio.capacidade !== realData.cap) {
                console.log(`🏟️ Corrigindo estádio para dados reais: ${realData.nome} (${realData.cap})`);
                game.estadio.nome = realData.nome;
                game.estadio.capacidade = realData.cap;
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

    calcularBilheteria: function(adversario) {
        const game = Engine.carregarJogo();
        const est = this.getEstadio();
        const moral = game.recursos.moral || 50;
        const forcaAdv = adversario.forca || 60; 
        
        // Lógica de Ocupação
        let interesseBase = (moral * 0.6) + (forcaAdv * 0.4);
        const fatorPreco = 40 / (est.precos.geral || 40); 
        
        let ocupacaoPercent = (interesseBase * fatorPreco) + (Math.random() * 10);
        
        if(ocupacaoPercent > 100) ocupacaoPercent = 100;
        if(ocupacaoPercent < 5) ocupacaoPercent = 5;

        const publicoTotal = Math.floor(est.capacidade * (ocupacaoPercent / 100));
        
        // Distribuição Setorial Fixa para Simplificar
        const pGeral = Math.floor(publicoTotal * 0.60);
        const pCadeiras = Math.floor(publicoTotal * 0.35);
        const pVip = Math.floor(publicoTotal * 0.05);
        const pCarros = Math.floor(publicoTotal * 0.20); 

        const renda = (pGeral * est.precos.geral) + 
                      (pCadeiras * est.precos.cadeiras) + 
                      (pVip * est.precos.vip) +
                      (pCarros * est.precos.estacionamento);

        return {
            publicoTotal: publicoTotal,
            rendaTotal: renda,
            ocupacao: Math.floor(ocupacaoPercent)
        };
    },

    salvarPrecos: function(tempPrecos) {
        this._tempPrecos = tempPrecos;
    },

    // Fallback apenas para times que não estão na lista real
    _definirCapacidadeGenerica: function(forca) {
        if (forca >= 85) return 45000 + Math.floor(Math.random() * 5000); 
        if (forca >= 75) return 30000 + Math.floor(Math.random() * 5000); 
        return 10000 + Math.floor(Math.random() * 5000); 
    }
};

// Hack para simulação
const originalGetEstadio = Engine.Estadios.getEstadio;
Engine.Estadios.getEstadio = function() {
    const est = originalGetEstadio.call(Engine.Estadios);
    if (Engine.Estadios._tempPrecos) {
        return { ...est, precos: Engine.Estadios._tempPrecos };
    }
    return est;
};
