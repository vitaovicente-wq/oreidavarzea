const Engine = {
    // ... (mantém o código de carregar/salvar jogo igual, apenas adicionei a lógica abaixo) ...

    novoJogo: function(pais, liga, timeNome) {
        const db = Database[pais][liga];
        const meuTime = db.find(t => t.nome === timeNome);
        
        // Gera atributos para o time do jogador na hora
        meuTime.elenco.forEach(j => this.gerarAtributos(j));

        const calendario = this.gerarCalendario(db);

        const jogo = {
            meuTime: timeNome,
            liga: liga,
            pais: pais,
            semanaAtual: 1,
            dinheiro: 10000000,
            calendarioUsuario: calendario,
            tabela: db.map(t => ({ nome: t.nome, p:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 }))
        };
        this.salvarJogo(jogo);
        return jogo;
    },

    carregarJogo: function() {
        const json = localStorage.getItem('brfutebol_save');
        if(!json) return null;
        const jogo = JSON.parse(json);
        
        // Garante que os atributos existam ao carregar
        const time = this.encontrarTime(jogo, jogo.meuTime);
        if(time) {
            time.elenco.forEach(j => this.gerarAtributos(j));
        }
        return jogo;
    },

    salvarJogo: function(jogo) {
        localStorage.setItem('brfutebol_save', JSON.stringify(jogo));
    },

    encontrarTime: function(jogo, nomeTime) {
        // Recarrega do Database para garantir integridade, mas preserva dados salvos se houver
        const db = Database[jogo.pais][jogo.liga];
        return db.find(t => t.nome === nomeTime);
    },

    // --- NOVA FUNÇÃO: GERADOR DE ATRIBUTOS ---
    gerarAtributos: function(jogador) {
        // Se já tem, não gera de novo
        if(jogador.atributos) return jogador.atributos;

        const ovr = jogador.forca;
        const pos = jogador.pos;
        let attr = {};

        // Variação aleatória (-3 a +3) para não ficarem todos iguais
        const r = () => Math.floor(Math.random() * 7) - 3;

        if (pos === 'GOL') {
            attr = {
                'PON': Math.min(99, ovr + r()),      // Ponte
                'REF': Math.min(99, ovr + 2 + r()),  // Reflexo
                'MAN': Math.min(99, ovr - 2 + r()),  // Mãos
                'REP': Math.min(99, ovr - 5 + r()),  // Reposição
                'POS': Math.min(99, ovr + r()),      // Posicionamento
                'FIS': Math.min(99, ovr - 10 + r())  // Físico
            };
        } else {
            // Base para linha
            let base = { VEL: ovr, FIN: ovr, PAS: ovr, DRI: ovr, DEF: ovr, FIS: ovr };

            // Modificadores por posição
            switch(pos) {
                case 'ZAG':
                    base.DEF += 12; base.FIS += 10; base.FIN -= 35; base.DRI -= 25; base.PAS -= 10; base.VEL -= 5;
                    break;
                case 'LE':
                case 'LD':
                    base.VEL += 10; base.DRI += 5; base.DEF += 2; base.FIN -= 25; base.FIS -= 5;
                    break;
                case 'VOL':
                    base.DEF += 10; base.PAS += 5; base.FIS += 8; base.FIN -= 20; base.VEL -= 10; base.DRI -= 5;
                    break;
                case 'MEI':
                    base.PAS += 12; base.DRI += 10; base.FIN += 2; base.DEF -= 15; base.FIS -= 10;
                    break;
                case 'ATA': // Pontas e Atacantes
                    base.FIN += 12; base.VEL += 5; base.DRI += 5; base.DEF -= 45; base.PAS -= 5;
                    break;
            }

            // Aplica variação e limites (1-99)
            attr = {};
            for (let key in base) {
                attr[key] = Math.max(1, Math.min(99, base[key] + r()));
            }
        }

        jogador.atributos = attr;
        return attr;
    },

    // ... (restante das funções como gerarCalendario, simularPlacar, etc mantidas) ...
    gerarCalendario: function(times) {
        // (Copie sua função gerarCalendario antiga aqui se ela não estiver na classe Engine ainda)
        // Se precisar eu mando ela de novo
        let rodadas = [];
        // ... lógica simples de rodada ...
        for(let i=0; i<10; i++) {
            rodadas.push({ nome: `Rodada ${i+1}`, jogos: [] });
        }
        return rodadas;
    },
    
    processarSemana: function(jogo) {
        jogo.semanaAtual++;
        this.salvarJogo(jogo);
    },

    simularPlacarRapido: function(t1, t2) {
        const diff = t1.forca - t2.forca;
        let g1 = Math.floor(Math.random() * 3);
        let g2 = Math.floor(Math.random() * 3);
        if(diff > 5) g1 += 1;
        if(diff < -5) g2 += 1;
        return { gc: g1, gf: g2 };
    }
};
