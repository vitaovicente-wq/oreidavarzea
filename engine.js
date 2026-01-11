// ARQUIVO: engine.js

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---

    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando nova campanha: ${nomeTimeSelecionado} (${divisao})`);

        // Verificação de Segurança
        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO CRÍTICO: O arquivo calendario.js não foi carregado.");
            throw new Error("Missing CalendarioSystem");
        }

        // 1. Carrega os times (Prioridade: Banco de Dados > Genérico)
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            // Clona para não alterar o banco original
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // 2. Proteção: Garante que TODOS os times tenham array de elenco
        timesDaLiga.forEach(t => {
            if (!t.elenco || !Array.isArray(t.elenco)) t.elenco = [];
        });

        // 3. Gera o Calendário (Todos contra Todos)
        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);

        // 4. Inicializa a Tabela de Classificação Zerada
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome,
            escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        // 5. Monta o Objeto de Save Principal
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
            classificacao: classificacaoInicial,
            jogadoresStatus: {} // Para guardar cansaço/lesões
        };

        // Salva no navegador
        this.salvarJogo(estadoDoJogo);
    },

    // --- 2. SISTEMA DE BUSCA E LEITURA ---

    encontrarTime: function(nomeTime) {
        const save = this.carregarJogo();
        // Retorna time vazio seguro se der erro
        if (!save || !save.times) return { nome: nomeTime, forca: 50, elenco: [] };
        
        const time = save.times.find(t => t.nome === nomeTime);
        return time || { nome: nomeTime, forca: 50, elenco: [] };
    },

    getMeuTime: function() {
        const save = this.carregarJogo();
        if (!save) return null;
        return this.encontrarTime(save.info.time);
    },

    // --- 3. PERSISTÊNCIA (SAVE/LOAD) ---

    salvarJogo: function(estado) {
        localStorage.setItem('brfutebol_save', JSON.stringify(estado));
    },

    carregarJogo: function() {
        const saveJson = localStorage.getItem('brfutebol_save');
        if (!saveJson) return null;
        return JSON.parse(saveJson);
    },

    // --- 4. ATUALIZAÇÃO DA TABELA (PROCESSAMENTO) ---

    atualizarTabela: function(estadoJogo) {
        // Usa 'classificacao' (fallback para 'tabela' se for save antigo)
        const tabela = estadoJogo.classificacao || estadoJogo.tabela;

        // Reseta os pontos para recalcular tudo (evita bugs de soma duplicada)
        tabela.forEach(t => {
            t.pts = 0; t.j = 0; t.v = 0; t.e = 0; t.d = 0; t.gp = 0; t.gc = 0; t.sg = 0;
        });

        // Percorre todas as rodadas e soma os jogos JÁ REALIZADOS
        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => {
                if (jogo.jogado) {
                    this._computarJogoNaTabela(tabela, jogo);
                }
            });
        });

        // Ordena: Pontos > Vitórias > Saldo > Gols Pró
        tabela.sort((a, b) => b.pts - a.pts || b.v - a.v || b.sg - a.sg || b.gp - a.gp);
        
        this.salvarJogo(estadoJogo);
        return tabela;
    },

    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);
        
        // Se o time sumiu do save (raro), ignora
        if (!timeCasa || !timeFora) return;

        const gc = parseInt(jogo.placarCasa);
        const gf = parseInt(jogo.placarFora);

        // Atualiza stats
        timeCasa.j++; timeCasa.gp += gc; timeCasa.gc += gf; timeCasa.sg = timeCasa.gp - timeCasa.gc;
        timeFora.j++; timeFora.gp += gf; timeFora.gc += gc; timeFora.sg = timeFora.gp - timeFora.gc;

        // Pontuação
        if (gc > gf) { 
            timeCasa.v++; timeCasa.pts += 3; timeFora.d++; 
        } else if (gf > gc) { 
            timeFora.v++; timeFora.pts += 3; timeCasa.d++; 
        } else { 
            timeCasa.e++; timeCasa.pts++; timeFora.e++; timeFora.pts++; 
        }
    },

    // --- 5. SIMULAÇÃO DE JOGOS DA CPU (NOVA LÓGICA) ---
    // Essa função é chamada pelo partida.html ao encerrar a rodada

    simularJogoCPU: function(jogo) {
        jogo.jogado = true;
        
        // 1. Define Placar (Aleatório com leve vantagem pra casa)
        jogo.placarCasa = Math.floor(Math.random() * 3); // 0 a 2
        jogo.placarFora = Math.floor(Math.random() * 2); // 0 a 1
        // Chance extra de gol
        if(Math.random() > 0.6) jogo.placarCasa++;
        if(Math.random() > 0.7) jogo.placarFora++;

        // 2. GERA A SÚMULA REAL (O PULO DO GATO)
        jogo.eventos = []; 

        const timeCasaObj = this.encontrarTime(jogo.mandante);
        const timeForaObj = this.encontrarTime(jogo.visitante);

        // Gera autores dos gols mandante
        for(let i=0; i<jogo.placarCasa; i++) {
            jogo.eventos.push(this._gerarGolSimulado(timeCasaObj, jogo.mandante));
        }

        // Gera autores dos gols visitante
        for(let i=0; i<jogo.placarFora; i++) {
            jogo.eventos.push(this._gerarGolSimulado(timeForaObj, jogo.visitante));
        }
        
        // Ordena eventos por minuto para ficar bonito
        jogo.eventos.sort((a,b) => a.min - b.min);
    },

    _gerarGolSimulado: function(timeObj, nomeTime) {
        let nomeJog = "Atacante Desconhecido";
        
        if(timeObj.elenco && timeObj.elenco.length > 0) {
            // Tenta pegar atacantes ou meias para serem artilheiros
            const ofensivos = timeObj.elenco.filter(j => j.pos === 'ATA' || j.pos === 'MEI');
            
            if(ofensivos.length > 0) {
                const sorteado = ofensivos[Math.floor(Math.random() * ofensivos.length)];
                nomeJog = sorteado.nome;
            } else {
                // Se só tiver zagueiro, qualquer um serve
                const sorteado = timeObj.elenco[Math.floor(Math.random() * timeObj.elenco.length)];
                nomeJog = sorteado.nome;
            }
        } else {
            // Se o time for genérico sem elenco criado
            nomeJog = "Camisa " + (Math.floor(Math.random() * 11) + 1);
        }

        return {
            min: Math.floor(Math.random() * 90) + 1,
            time: nomeTime,
            jogador: nomeJog,
            tipo: 'gol'
        };
    },

    // --- 6. UTILITÁRIOS ---

    _gerarTimesGenericos: function(div) {
        let lista = [];
        for (let i = 1; i <= 20; i++) {
            lista.push({ 
                nome: `Time ${div.toUpperCase()} ${i}`, 
                forca: 50, 
                elenco: [],
                escudo: "https://cdn-icons-png.flaticon.com/512/53/53283.png" 
            });
        }
        return lista;
    }
};

// Exporta para o navegador
window.Engine = Engine;
