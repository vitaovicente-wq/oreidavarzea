// ARQUIVO: engine.js

const Engine = {
    
    // --- 1. INICIALIZAÇÃO DO JOGO ---

    novoJogo: function(pais, divisao, nomeTimeSelecionado) {
        console.log(`⚽ Iniciando nova campanha: ${nomeTimeSelecionado} (${divisao})`);

        // A) Verifica dependências
        if (typeof CalendarioSystem === 'undefined') {
            alert("ERRO CRÍTICO: O arquivo calendario.js não foi carregado.");
            throw new Error("Missing CalendarioSystem");
        }

        // B) Carrega os times do Banco de Dados
        let timesDaLiga = [];
        if (window.Database && window.Database.brasil && window.Database.brasil[divisao]) {
            // Clona para não estragar o original
            timesDaLiga = JSON.parse(JSON.stringify(window.Database.brasil[divisao]));
        } else {
            console.warn("⚠️ Database não encontrado. Gerando times genéricos.");
            timesDaLiga = this._gerarTimesGenericos(divisao);
        }

        // C) Gera o Calendário de Jogos (Turno e Returno)
        const calendarioGerado = CalendarioSystem.gerarCampeonato(timesDaLiga);

        // D) Cria a estrutura inicial da Tabela de Classificação
        const classificacaoInicial = timesDaLiga.map(t => ({
            nome: t.nome,
            escudo: t.escudo || null,
            pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
        }));

        // E) Monta o objeto do Save
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
                dinheiro: 5000000, // 5 Milhões iniciais
                moral: 100
            },
            rodadaAtual: 1,
            times: timesDaLiga,
            calendario: calendarioGerado,
            tabela: classificacaoInicial
        };

        // F) Salva e finaliza
        this.salvarJogo(estadoDoJogo);
        console.log("✅ Jogo salvo com sucesso! Pronto para ir ao Dashboard.");
    },

    // --- 2. SISTEMA DE SAVE / LOAD ---

    salvarJogo: function(estado) {
        localStorage.setItem('brfutebol_save', JSON.stringify(estado));
    },

    carregarJogo: function() {
        const saveJson = localStorage.getItem('brfutebol_save');
        if (!saveJson) return null;
        return JSON.parse(saveJson);
    },

    // --- 3. LÓGICA DE SIMULAÇÃO E TABELA ---

    // Função para atualizar a tabela baseada nos jogos que já aconteceram
    atualizarTabela: function(estadoJogo) {
        // Zera a tabela para recalcular do zero (evita erros de soma)
        estadoJogo.tabela.forEach(t => {
            t.pts = 0; t.j = 0; t.v = 0; t.e = 0; t.d = 0; t.gp = 0; t.gc = 0; t.sg = 0;
        });

        // Percorre todas as rodadas e jogos
        estadoJogo.calendario.forEach(rodada => {
            rodada.jogos.forEach(jogo => {
                if (jogo.jogado) {
                    this._computarJogoNaTabela(estadoJogo.tabela, jogo);
                }
            });
        });

        // Ordena a tabela (Pontos > Vitórias > Saldo > Gols Pró)
        estadoJogo.tabela.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.v !== a.v) return b.v - a.v;
            if (b.sg !== a.sg) return b.sg - a.sg;
            return b.gp - a.gp;
        });

        this.salvarJogo(estadoJogo);
        return estadoJogo.tabela;
    },

    // Função auxiliar que soma os pontos de um jogo específico
    _computarJogoNaTabela: function(tabela, jogo) {
        const timeCasa = tabela.find(t => t.nome === jogo.mandante);
        const timeFora = tabela.find(t => t.nome === jogo.visitante);

        if (!timeCasa || !timeFora) return; // Segurança

        const golsCasa = parseInt(jogo.placarCasa);
        const golsFora = parseInt(jogo.placarFora);

        // Atualiza jogos e gols
        timeCasa.j++; timeCasa.gp += golsCasa; timeCasa.gc += golsFora; timeCasa.sg = timeCasa.gp - timeCasa.gc;
        timeFora.j++; timeFora.gp += golsFora; timeFora.gc += golsCasa; timeFora.sg = timeFora.gp - timeFora.gc;

        // Distribui pontos
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

    // --- 4. FUNÇÕES AUXILIARES ---

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

// Exportar para garantir compatibilidade
window.Engine = Engine;
