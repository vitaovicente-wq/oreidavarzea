// ARQUIVO: engine.js

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---
    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando: ${nomeTimeSelecionado}`);

        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO: calendario.js não carregado.");
            return;
        }

        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
        });

        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome, escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        const estadoDoJogo = {
            info: {
                tecnico: localStorage.getItem('brfutebol_tecnico') || "Manager",
                time: nomeTimeSelecionado,
                escudo: localStorage.getItem('brfutebol_escudo'),
                divisao: divisao
            },
            recursos: { dinheiro: 5000000, moral: 100 },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            classificacao: classificacaoInicial,
            jogadoresStatus: {} 
        };

        this.salvarJogo(estadoDoJogo);
    },

    // --- 2. SISTEMA DE BUSCA ---
    encontrarTime: function(nomeTime) {
        const save = this.carregarJogo();
        if (!save || !save.times) return { nome: nomeTime, forca: 0, elenco: [] };
        return save.times.find(t => t.nome === nomeTime) || { nome: nomeTime, forca: 0, elenco: [] };
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
        return saveJson ? JSON.parse(saveJson) : null;
    },

    // --- 4. ATUALIZAÇÃO DA TABELA ---
    atualizarTabela: function(estadoJogo) {
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

        tabela.sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg || b.gp - a.gp);
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

    // --- 5. SIMULAÇÃO CPU ---
    simularJogoCPU: function(jogo) {
        jogo.jogado = true;
        jogo.placarCasa = Math.floor(Math.random() * 3);
        jogo.placarFora = Math.floor(Math.random() * 2);
        if(Math.random() > 0.6) jogo.placarCasa++;
        if(Math.random() > 0.7) jogo.placarFora++;

        jogo.eventos = []; 

        const timeCasa = this.encontrarTime(jogo.mandante);
        for(let i=0; i<jogo.placarCasa; i++) {
            jogo.eventos.push(this._gerarGolSimulado(timeCasa, jogo.mandante));
        }

        const timeFora = this.encontrarTime(jogo.visitante);
        for(let i=0; i<jogo.placarFora; i++) {
            jogo.eventos.push(this._gerarGolSimulado(timeFora, jogo.visitante));
        }
        
        jogo.eventos.sort((a,b) => a.min - b.min);
    },

    _gerarGolSimulado: function(timeObj, nomeTime) {
        let nomeJog = "Atacante";
        
        if(timeObj.elenco && timeObj.elenco.length > 0) {
            // CORREÇÃO: Filtra goleiros ('GOL') para não fazerem gol
            const artilheiros = timeObj.elenco.filter(j => j.pos !== 'GOL');
            
            // Se houver jogadores de linha, sorteia um. Se não, sorteia qualquer um (raro)
            const pool = artilheiros.length > 0 ? artilheiros : timeObj.elenco;
            const sorteado = pool[Math.floor(Math.random() * pool.length)];
            nomeJog = sorteado.nome;
        } else {
            nomeJog = "Camisa " + (Math.floor(Math.random() * 10) + 2); // 2 a 11
        }

        return {
            min: Math.floor(Math.random() * 90) + 1,
            time: nomeTime,
            jogador: nomeJog,
            tipo: 'gol'
        };
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
