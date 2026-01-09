// ARQUIVO: engine.js

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---

    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando nova campanha: ${nomeTimeSelecionado} (${divisao})`);

        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO CRÍTICO: O arquivo calendario.js não foi carregado.");
            throw new Error("Missing CalendarioSystem");
        }

        // Carrega os times do Banco de Dados
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            console.warn("⚠️ Database não encontrado. Gerando times genéricos.");
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // Gera o Calendário
        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);

        // Estrutura inicial da Tabela
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome,
            escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        // Monta o Save
        const estadoDoJogo = {
            info: {
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Treinador",
                time: nomeTimeSelecionado,
                escudo: localStorage.getItem('brfutebol_escudo'),
                pais: pais,
                divisao: divisao,
                dataInicio: new Date().toLocaleDateString()
            },
            recursos: {
                dinheiro: 5000000, 
                moral: 100
            },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            tabela: classificacaoInicial
        };

        this.salvarJogo(estadoDoJogo);
        console.log("✅ Jogo salvo com sucesso!");
    },

    // --- 2. SISTEMA DE BUSCA (AS FUNÇÕES QUE FALTAVAM) ---

    // Busca um time inteiro pelo nome dentro do save atual
    encontrarTime: function(nomeTime) {
        const save = this.carregarJogo();
        if (!save || !save.times) return null;
        
        // Procura o time na lista salva
        const timeEncontrado = save.times.find(t => t.nome === nomeTime);
        
        // Retorna o time ou um objeto vazio para não travar
        return timeEncontrado || { nome: nomeTime, forca: 0, escudo: "" };
    },

    // Retorna direto o time controlado pelo jogador
    getMeuTime: function() {
        const save = this.carregarJogo();
        if (!save) return null;
        return this.encontrarTime(save.info.time);
    },

    // --- 3. SISTEMA DE SAVE / LOAD ---

    salvarJogo: function(estado) {
        localStorage.setItem('brfutebol_save', JSON.stringify(estado));
    },

    carregarJogo: function() {
        const saveJson = localStorage.getItem('brfutebol_save');
        if (!saveJson) return null;
        return JSON.parse(saveJson);
    },

    // --- 4. LÓGICA DE SIMULAÇÃO E TABELA ---

    atualizarTabela: function(estadoJogo) {
        // Zera a tabela
        estadoJogo.tabela.forEach(t => {
            t.pts = 0; t.j = 0; t.v = 0; t.e = 0; t.d = 0; t.gp = 0; t.gc = 0; t.sg = 0;
        });

        // Recalcula baseado no calendário
        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => {
                if (jogo.jogado) {
                    this._computarJogoNaTabela(estadoJogo.tabela, jogo);
                }
            });
        });

        // Ordena
        estadoJogo.tabela.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.v !== a.v) return b.v - a.v;
            if (b.sg !== a.sg) return b.sg - a.sg;
            return b.gp - a.gp;
        });

        this.salvarJogo(estadoJogo);
        return estadoJogo.tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);

        if (!timeCasa || !timeFora) return; 

        const golsCasa = parseInt(jogo.placarCasa);
        const golsFora = parseInt(jogo.placarFora);

        timeCasa.j++; timeCasa.gp += golsCasa; timeCasa.gc += golsFora; timeCasa.sg = timeCasa.gp - timeCasa.gc;
        timeFora.j++; timeFora.gp += golsFora; timeFora.gc += golsCasa; timeFora.sg = timeFora.gp - timeFora.gc;

        if (golsCasa > golsFora) {
            timeCasa.v++; timeCasa.pts += 3;
            timeFora.d++;
        } else if (golsFora > golsCasa) {
            timeFora.v++; timeFora.pts += 3;
            timeCasa.d++;
        } else {
            timeCasa.e++; timeCasa.pts += 1;
            timeFora.e++; timeFora.pts += 1;
        }
    },

    // --- 5. FUNÇÕES AUXILIARES ---

    _gerarTimesGenericos: function(div) {
        let lista = [];
        for (let i = 1; i <= 20; i++) {
            lista.push({ 
                nome: `Clube ${div.toUpperCase()} ${i}`,
                forca: 60,
                escudo: 'https://cdn-icons-png.flaticon.com/512/53/53283.png',
                elenco: [] 
            });
        }
        return lista;
    }
};

window.Engine = Engine;
