// ARQUIVO: engine-estadio.js
// ATUALIZADO: Aluguel por Temporada/Jogos + Abas Independentes

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

    // Estádios Neutros
    dbNeutros: [
        { id: 'pacaembu', nome: "Estádio do Pacaembu", cap: 37730, aluguel: 150000, infra: "Média" },
        { id: 'barueri', nome: "Arena Barueri", cap: 31452, aluguel: 80000, infra: "Baixa" },
        { id: 'manegarrincha', nome: "Mané Garrincha", cap: 72788, aluguel: 250000, infra: "Alta" },
        { id: 'kleberandrade', nome: "Kleber Andrade", cap: 21000, aluguel: 50000, infra: "Média" }
    ],

    getEstadio: function() {
        const game = Engine.carregarJogo();
        const timeNome = game.info.time;
        
        if (!game.estadio) {
            this._criarEstadioInicial(game, timeNome);
        } else if (!game.estadio.setores) {
            // Migração legado
            const cap = game.estadio.capacidade;
            game.estadio.setores = {
                geral: Math.floor(cap * 0.60),
                cadeiras: Math.floor(cap * 0.35),
                vip: Math.floor(cap * 0.05),
                estacionamento: Math.floor(cap * 0.10)
            };
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

    // --- REFORMA ---
    calcularOrcamento: function(adicoes) {
        const custoAssento = 1000; 
        const custoVaga = 500;

        let custoTotal = 
            (adicoes.geral * custoAssento) +
            (adicoes.cadeiras * custoAssento * 1.5) +
            (adicoes.vip * custoAssento * 3.0) +
            (adicoes.estacionamento * custoVaga);

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

        game.recursos.dinheiro -= orcamento.custo;
        game.financas.historico.push({
            texto: "Obras no Estádio",
            valor: -orcamento.custo,
            tipo: "saida",
            rodada: game.rodadaAtual
        });

        // Aplica expansão
        game.estadio.setores.geral += parseInt(adicoes.geral);
        game.estadio.setores.cadeiras += parseInt(adicoes.cadeiras);
        game.estadio.setores.vip += parseInt(adicoes.vip);
        game.estadio.setores.estacionamento += parseInt(adicoes.estacionamento);
        
        game.estadio.capacidade = game.estadio.setores.geral + game.estadio.setores.cadeiras + game.estadio.setores.vip;

        // Inicia Obras
        game.estadio.emObras = true;
        game.estadio.rodadasObras = orcamento.tempo;
        
        // Se não tiver aluguel, avisa para alugar
        if(!game.estadio.alugado) {
            game.estadio.alugado = { nome: "Campo de Treino (Improvisado)", capacidade: 2000, custoPorJogo: 0, jogosRestantes: orcamento.tempo };
        }

        Engine.salvarJogo(game);
        return { sucesso: true, msg: `Reforma iniciada! Duração: ${orcamento.tempo} rodadas.` };
    },

    // --- ALUGUEL ---
    listarEstadiosDisponiveis: function() {
        const game = Engine.carregarJogo();
        let disponiveis = [];

        // 1. Neutros
        this.dbNeutros.forEach(n => {
            disponiveis.push({ ...n, tipo: 'neutro', dono: 'Governo' });
        });

        // 2. Clubes (Simplificado)
        const timesGrandes = ["Corinthians", "Palmeiras", "São Paulo", "Flamengo", "Maracanã"];
        timesGrandes.forEach(t => {
            if (t !== game.info.time && this.dbEstadios[t]) {
                const dados = this.dbEstadios[t];
                disponiveis.push({
                    id: t.toLowerCase().replace(/ /g,''),
                    nome: dados.nome,
                    cap: dados.cap,
                    aluguel: 350000, 
                    tipo: 'clube',
                    dono: t,
                    infra: "Alta"
                });
            }
        });

        return disponiveis;
    },

    assinarAluguel: function(estadioAlvo, duracaoJogos) {
        const game = Engine.carregarJogo();
        
        // Taxa de assinatura (10% do valor total do contrato)
        const valorContrato = estadioAlvo.aluguel * duracaoJogos;
        const taxaAssinatura = Math.floor(valorContrato * 0.10);

        if (game.recursos.dinheiro < taxaAssinatura) {
            return { sucesso: false, msg: `Precisa de R$ ${taxaAssinatura.toLocaleString()} para taxa de assinatura.` };
        }

        // Paga Taxa
        game.recursos.dinheiro -= taxaAssinatura;
        game.financas.historico.push({ texto: "Taxa Aluguel Estádio", valor: -taxaAssinatura, tipo: "saida", rodada: game.rodadaAtual });

        game.estadio.alugado = {
            nome: estadioAlvo.nome,
            capacidade: estadioAlvo.cap,
            custoPorJogo: estadioAlvo.aluguel,
            jogosRestantes: parseInt(duracaoJogos)
        };

        Engine.salvarJogo(game);
        return { sucesso: true, msg: `Alugado: ${estadioAlvo.nome} por ${duracaoJogos} jogos em casa.` };
    },

    // --- BILHETERIA COM LÓGICA DE CONTRATO ---
    calcularBilheteria: function(adversario) {
        const game = Engine.carregarJogo();
        const est = this.getEstadio(); 
        
        // Verifica qual estádio usar
        let capacidadeUso = est.capacidade;
        let custoAluguel = 0;
        let nomeEstadioUso = est.nome;
        let isAlugado = false;

        // Se estiver em obras OU tiver contrato ativo, joga fora
        if (est.alugado) {
            capacidadeUso = est.alugado.capacidade;
            custoAluguel = est.alugado.custoPorJogo || 0;
            nomeEstadioUso = est.alugado.nome;
            isAlugado = true;
        }

        // Lógica de Lotação
        const moral = game.recursos.moral || 50;
        const forcaAdv = adversario.forca || 60; 
        let interesseBase = (moral * 0.6) + (forcaAdv * 0.4);
        const fatorPreco = 40 / (est.precos.geral || 40); 
        let ocupacaoPercent = (interesseBase * fatorPreco) + (Math.random() * 10);
        if(ocupacaoPercent > 100) ocupacaoPercent = 100;
        if(ocupacaoPercent < 5) ocupacaoPercent = 5;

        const publicoTotal = Math.floor(capacidadeUso * (ocupacaoPercent / 100));
        
        const pGeral = Math.floor(publicoTotal * 0.60);
        const pCadeiras = Math.floor(publicoTotal * 0.35);
        const pVip = Math.floor(publicoTotal * 0.05);
        const pCarros = Math.floor(publicoTotal * 0.20); 

        const rendaBruta = (pGeral * est.precos.geral) + 
                           (pCadeiras * est.precos.cadeiras) + 
                           (pVip * est.precos.vip) +
                           (pCarros * est.precos.estacionamento);

        // Processa Pagamento do Aluguel e Fim de Contrato
        if(isAlugado && custoAluguel > 0) {
            game.recursos.dinheiro -= custoAluguel;
            game.financas.historico.push({
                texto: `Aluguel (${nomeEstadioUso})`,
                valor: -custoAluguel,
                tipo: "saida",
                rodada: game.rodadaAtual
            });

            // Desconta 1 jogo do contrato
            game.estadio.alugado.jogosRestantes--;
            
            // Se acabou o contrato
            if(game.estadio.alugado.jogosRestantes <= 0) {
                // Se ainda está em obra, renova num campo podre automaticamente
                if(game.estadio.emObras) {
                    game.estadio.alugado = { nome: "Campo de Treino", capacidade: 2000, custoPorJogo: 0, jogosRestantes: 5 };
                    if(window.Engine.Sistema) window.Engine.Sistema.novaMensagem("Contrato Encerrado", `O aluguel do ${nomeEstadioUso} acabou, mas seu estádio ainda está em obras. Jogaremos no CT.`, "alerta", "Logística");
                } else {
                    // Se não está em obra, volta pra casa
                    game.estadio.alugado = null;
                    if(window.Engine.Sistema) window.Engine.Sistema.novaMensagem("Volta pra Casa", `O aluguel acabou. Voltamos a mandar jogos no nosso estádio!`, "info", "Logística");
                }
            }
            Engine.salvarJogo(game);
        }

        return {
            publicoTotal: publicoTotal,
            rendaTotal: rendaBruta,
            ocupacao: Math.floor(ocupacaoPercent),
            estadioUsado: nomeEstadioUso
        };
    },

    salvarConfig: function(p) { 
        const g = Engine.carregarJogo(); g.estadio.precos = p; Engine.salvarJogo(g); 
    },
    salvarPrecos: function(t) { this._tempPrecos = t; }
};

const originalGetEstadio = Engine.Estadios.getEstadio;
Engine.Estadios.getEstadio = function() {
    const est = originalGetEstadio.call(Engine.Estadios);
    if (Engine.Estadios._tempPrecos) return { ...est, precos: Engine.Estadios._tempPrecos };
    return est;
};
