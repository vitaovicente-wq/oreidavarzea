// ARQUIVO: engine.js

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---

    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando nova campanha: ${nomeTimeSelecionado} (${divisao})`);

        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO CRÍTICO: O arquivo calendario.js não foi carregado.");
            throw new Error("Missing CalendarioSystem");
        }

        // Carrega os times (com proteção se o banco falhar)
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // Garante que TODOS os times tenham elenco (para não dar erro de forEach)
        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
        });

        // Gera Calendário e Tabela
        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome,
            escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        // Monta o Save (Usando 'classificacao' para compatibilidade)
        const estadoDoJogo = {
            info: {
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Treinador",
                time: nomeTimeSelecionado,
                escudo: localStorage.getItem('brfutebol_escudo'),
                pais: pais,
                divisao: divisao
            },
            recursos: { dinheiro: 5000000, moral: 100 },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            classificacao: classificacaoInicial // Nome corrigido aqui
        };

        this.salvarJogo(estadoDoJogo);
    },

    // --- 2. SISTEMA DE BUSCA ---

    encontrarTime: function(nomeTime) {
        const save = this.carregarJogo();
        if (!save || !save.times) return { nome: nomeTime, forca: 0, elenco: [] };
        
        const time = save.times.find(t => t.nome === nomeTime);
        // Retorna o time ou um objeto vazio seguro com array de elenco vazio
        return time || { nome: nomeTime, forca: 0, elenco: [] };
    },

    getMeuTime: function() {
        const save = this.carregarJogo();
        if (!save) return null;
        return this.encontrarTime(save.info.time);
    },

    // --- 3. SAVE / LOAD ---

    salvarJogo: function(estado) {
        localStorage.setItem('brfutebol_save', JSON.stringify(estado));
    },

    carregarJogo: function() {
        const saveJson = localStorage.getItem('brfutebol_save');
        if (!saveJson) return null;
        return JSON.parse(saveJson);
    },

    // --- 4. ATUALIZAÇÃO DA TABELA ---

    atualizarTabela: function(estadoJogo) {
        // Usa 'classificacao' para manter compatibilidade
        const tabela = estadoJogo.classificacao || estadoJogo.tabela;

        tabela.forEach(t => {
            t.pts = 0; t.j = 0; t.v = 0; t.e = 0; t.d = 0; t.gp = 0; t.gc = 0; t.sg = 0;
        });

        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => {
                if (jogo.jogado) {
                    this._computarJogoNaTabela(tabela, jogo);
                }
            });
        });

        tabela.sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg);
        
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);
        if (!timeCasa || !timeFora) return;

        const gc = parseInt(jogo.placarCasa);
        const gf = parseInt(jogo.placarFora);

        timeCasa.j++; timeCasa.gp += gc; timeCasa.gc += gf; timeCasa.sg = timeCasa.gp - timeCasa.gc;
        timeFora.j++; timeFora.gp += gf; timeFora.gc += gc; timeFora.sg = timeFora.gp - timeFora.gc;

        if (gc > gf) { timeCasa.v++; timeCasa.pts += 3; timeFora.d++; }
        else if (gf > gc) { timeFora.v++; timeFora.pts += 3; timeCasa.d++; }
        else { timeCasa.e++; timeCasa.pts++; timeFora.e++; timeFora.pts++; }
    },

    _gerarTimesGenericos: function(div) {
        let lista = [];
        for (let i = 1; i <= 20; i++) {
            lista.push({ nome: `Time ${i}`, forca: 50, elenco: [] });
        }
        return lista;
    }
};
window.Engine = Engine;
