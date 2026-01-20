// ARQUIVO: engine-estadio.js
// ATUALIZADO: Reformas, Setores, Aluguéis e Estádios Neutros

Engine.Estadios = {
    // Estádios Reais (Clubes)
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
        "Athletico-PR": { nome: "Ligga Arena", cap: 42372 }
    },

    // Estádios Neutros (Municipais/Governo) - Mais baratos
    dbNeutros: [
        { id: 'pacaembu', nome: "Estádio do Pacaembu", cap: 37730, aluguel: 150000, infra: "Média" },
        { id: 'barueri', nome: "Arena Barueri", cap: 31452, aluguel: 80000, infra: "Baixa" },
        { id: 'manegarrincha', nome: "Mané Garrincha", cap: 72788, aluguel: 250000, infra: "Alta" }
    ],

    getEstadio: function() {
        const game = Engine.carregarJogo();
        const timeNome = game.info.time;
        
        // 1. Inicialização / Migração
        if (!game.estadio) {
            this._criarEstadioInicial(game, timeNome);
        } else if (!game.estadio.setores) {
            // Migração: Se tem capacidade total mas não tem setores, divide agora
            console.log("🛠️ Migrando estádio para sistema de setores...");
            const cap = game.estadio.capacidade;
            game.estadio.setores = {
                geral: Math.floor(cap * 0.60),
                cadeiras: Math.floor(cap * 0.35),
                vip: Math.floor(cap * 0.05),
                estacionamento: Math.floor(cap * 0.10) // Extra
            };
            // Zera status de obra
            game.estadio.emObras = false;
            game.estadio.alugado = null; // Se estiver alugando outro
            Engine.salvarJogo(game);
        }

        return game.estadio;
    },

    _criarEstadioInicial: function(game, timeNome) {
        const realData = this.dbEstadios[timeNome];
        const capTotal = realData ? realData.cap : 20000;
        
        game.estadio = {
            nome: realData ? realData.nome : "Estádio Municipal",
            capacidade: capTotal,
            setores: {
                geral: Math.floor(capTotal * 0.60),
                cadeiras: Math.floor(capTotal * 0.35),
                vip: Math.floor(capTotal * 0.05),
                estacionamento: Math.floor(capTotal * 0.10)
            },
            precos: { geral: 40, cadeiras: 80, vip: 250, estacionamento: 30 },
            emObras: false,
            rodadasObras: 0,
            alugado: null 
        };
        Engine.salvarJogo(game);
    },

    // --- SISTEMA DE REFORMA ---
    
    // Calcula custo: 1000 reais por assento
    calcularOrcamento: function(adicoes) {
        const custoAssento = 1000; 
        const custoVaga = 500; // Estacionamento é mais barato

        let custoTotal = 
            (adicoes.geral * custoAssento) +
            (adicoes.cadeiras * custoAssento * 1.5) + // Cadeira é mais cara
            (adicoes.vip * custoAssento * 3.0) +      // VIP é muito caro
            (adicoes.estacionamento * custoVaga);

        // Tempo: 1 rodada a cada 2.000 lugares adicionados (mínimo 4 rodadas)
        let totalLugares = adicoes.geral + adicoes.cadeiras + adicoes.vip + adicoes.estacionamento;
        let tempo = Math.max(4, Math.ceil(totalLugares / 2000));

        return { custo: custoTotal, tempo: tempo };
    },

    iniciarReforma: function(adicoes) {
        const game = Engine.carregarJogo();
        const orcamento = this.calcularOrcamento(adicoes);

        if (game.recursos.dinheiro < orcamento.custo) {
            return { sucesso: false, msg: "Dinheiro insuficiente." };
        }

        // Paga a obra
        game.recursos.dinheiro -= orcamento.custo;
        game.financas.historico.push({
            texto: "Reforma do Estádio",
            valor: -orcamento.custo,
            tipo: "saida",
            rodada: game.rodadaAtual
        });

        // Atualiza Capacidades
        game.estadio.setores.geral += parseInt(adicoes.geral);
        game.estadio.setores.cadeiras += parseInt(adicoes.cadeiras);
        game.estadio.setores.vip += parseInt(adicoes.vip);
        game.estadio.setores.estacionamento += parseInt(adicoes.estacionamento);
        
        // Recalcula total
        game.estadio.capacidade = game.estadio.setores.geral + game.estadio.setores.cadeiras + game.estadio.setores.vip;

        // Trava o estádio
        game.estadio.emObras = true;
        game.estadio.rodadasObras = orcamento.tempo;
        
        // Força aluguel automático se não tiver
        game.estadio.alugado = { nome: "Campo de Treino (Provisório)", cap: 5000, custo: 0 }; 

        Engine.salvarJogo(game);
        return { sucesso: true, msg: `Obras iniciadas! Fica pronto em ${orcamento.tempo} rodadas.` };
    },

    // --- SISTEMA DE ALUGUEL ---

    listarEstadiosDisponiveis: function() {
        const game = Engine.carregarJogo();
        const rodadaAtual = game.rodadaAtual;
        
        let disponiveis = [];

        // 1. Adiciona Neutros
        this.dbNeutros.forEach(n => {
            disponiveis.push({
                ...n,
                tipo: 'neutro',
                dono: 'Governo'
            });
        });

        // 2. Adiciona Clubes (Lógica simplificada: Cobra caro)
        // Em um sistema v2, checaríamos se o time joga em casa na rodada
        const timesGrandes = ["Corinthians", "Palmeiras", "São Paulo", "Flamengo"];
        
        timesGrandes.forEach(t => {
            if (t !== game.info.time && this.dbEstadios[t]) {
                const dados = this.dbEstadios[t];
                disponiveis.push({
                    id: t.toLowerCase(),
                    nome: dados.nome,
                    cap: dados.cap,
                    aluguel: 400000, // Clubes cobram caro
                    tipo: 'clube',
                    dono: t,
                    infra: "Alta"
                });
            }
        });

        return disponiveis;
    },

    assinarAluguel: function(estadioAlvo) {
        const game = Engine.carregarJogo();
        
        // Cobra aluguel antecipado de 1 jogo
        if (game.recursos.dinheiro < estadioAlvo.aluguel) {
            return { sucesso: false, msg: "Sem dinheiro para o aluguel." };
        }

        game.estadio.alugado = {
            nome: estadioAlvo.nome,
            capacidade: estadioAlvo.cap,
            custoPorJogo: estadioAlvo.aluguel
        };

        Engine.salvarJogo(game);
        return { sucesso: true, msg: `Contrato assinado com ${estadioAlvo.nome}.` };
    },

    // --- BILHETERIA (MODIFICADO PARA USAR SETORES E ALUGUEL) ---
    calcularBilheteria: function(adversario) {
        const game = Engine.carregarJogo();
        const est = this.getEstadio(); // Pega estádio ou o alugado
        
        // Se estiver em obra, usa os dados do ALUGADO
        let capacidadeUso = est.capacidade;
        let custoAluguel = 0;
        let nomeEstadioUso = est.nome;

        if (est.emObras && est.alugado) {
            capacidadeUso = est.alugado.capacidade;
            custoAluguel = est.alugado.custoPorJogo || 0;
            nomeEstadioUso = est.alugado.nome;
        }

        // Lógica de Lotação
        const moral = game.recursos.moral || 50;
        const forcaAdv = adversario.forca || 60; 
        
        let interesseBase = (moral * 0.6) + (forcaAdv * 0.4);
        const fatorPreco = 40 / (est.precos.geral || 40); 
        let ocupacaoPercent = (interesseBase * fatorPreco) + (Math.random() * 10);
        
        if(ocupacaoPercent > 100) ocupacaoPercent = 100;
        if(ocupacaoPercent < 5) ocupacaoPercent = 5;

        // Limita pela capacidade do estádio (seja o próprio ou alugado)
        const publicoTotal = Math.floor(capacidadeUso * (ocupacaoPercent / 100));
        
        // Distribuição Fixa (Simplificada para estádios alugados que não temos os setores exatos)
        const pGeral = Math.floor(publicoTotal * 0.60);
        const pCadeiras = Math.floor(publicoTotal * 0.35);
        const pVip = Math.floor(publicoTotal * 0.05);
        const pCarros = Math.floor(publicoTotal * 0.15); // Estacionamento menor em aluguel

        // Renda Bruta
        const rendaBruta = (pGeral * est.precos.geral) + 
                           (pCadeiras * est.precos.cadeiras) + 
                           (pVip * est.precos.vip) +
                           (pCarros * est.precos.estacionamento);

        // Desconta Aluguel na hora do jogo
        const rendaLiquida = rendaBruta - custoAluguel;
        
        // Se pagou aluguel, registra no histórico
        if(custoAluguel > 0) {
            game.recursos.dinheiro -= custoAluguel;
            game.financas.historico.push({
                texto: `Aluguel (${nomeEstadioUso})`,
                valor: -custoAluguel,
                tipo: "saida",
                rodada: game.rodadaAtual
            });
            Engine.salvarJogo(game);
        }

        return {
            publicoTotal: publicoTotal,
            rendaTotal: rendaBruta, // Retorna bruta para exibir, o desconto foi interno
            ocupacao: Math.floor(ocupacaoPercent),
            estadioUsado: nomeEstadioUso
        };
    },

    salvarConfig: function(novosPrecos) {
        const game = Engine.carregarJogo();
        game.estadio.precos = novosPrecos;
        Engine.salvarJogo(game);
    },
    
    salvarPrecos: function(t) { this._tempPrecos = t; }
};
