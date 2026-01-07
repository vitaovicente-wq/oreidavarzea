const Engine = {
    // --- CONFIGURAÇÕES ---
    configCompeticoes: {
        brasil: { nome: "Brasileirão", cont: "Libertadores" },
        argentina: { nome: "Liga Profesional", cont: "Libertadores" },
        espanha: { nome: "La Liga", cont: "Champions League" },
        inglaterra: { nome: "Premier League", cont: "Champions League" }
    },

    // --- 1. SETUP DO JOGO ---
    novoJogo: function(paisUsuario, divisao, timeJogador) {
        const gameState = {
            paisUsuario: paisUsuario,
            meuTime: timeJogador,
            ano: 2026,
            semanaAtual: 1,
            mundo: {}, 
            calendarioUsuario: [],
            mercado: [] // Lista de jogadores à venda
        };

        // Inicializa Mundo
        Object.keys(database).forEach(pais => {
            let timesRaw = Array.isArray(database[pais]) ? database[pais] : (database[pais].primeira || database[pais].serieA);
            if (timesRaw && timesRaw.length > 0) {
                const timesProcessados = JSON.parse(JSON.stringify(timesRaw)).map(t => this.inicializarTime(t, pais));
                const calendarioLiga = this.gerarCalendarioPontosCorridos(timesProcessados);
                gameState.mundo[pais] = {
                    times: timesProcessados,
                    calendario: calendarioLiga,
                    tabela: []
                };
            }
        });

        this.construirCalendarioUsuario(gameState);
        
        // Gera o mercado inicial
        this.atualizarMercado(gameState);

        const meuTimeObj = this.encontrarTime(gameState, timeJogador);
        if (meuTimeObj) this.inicializarFinancas(meuTimeObj);

        this.salvarJogo(gameState);
        return gameState;
    },

    inicializarTime: function(t, pais) {
        t.stats = { p:0, j:0, v:0, e:0, d:0, gp:0, gc:0, s:0 };
        t.elenco = this.gerarElenco(t.nome, t.forca || 60);
        t.forca = this.calcularForcaElenco(t.elenco);
        t.moral = 100;
        t.funcoes = { capitao: null, penalti: null, falta: null, escanteio: null };
        this.definirFuncoesAutomaticas(t);
        return t;
    },

    // --- 2. SISTEMA DE MERCADO (NOVO!) ---

    atualizarMercado: function(gameState) {
        // Limpa lista antiga ou mantém alguns? Vamos renovar 100% para simplificar
        gameState.mercado = [];
        
        // Pega 15 jogadores aleatórios do mundo (exceto do usuário)
        const todosPaises = Object.keys(gameState.mundo);
        
        for(let i=0; i<15; i++) {
            const paisRand = todosPaises[Math.floor(Math.random() * todosPaises.length)];
            const liga = gameState.mundo[paisRand];
            const timeRand = liga.times[Math.floor(Math.random() * liga.times.length)];
            
            // Não pega do time do jogador
            if (timeRand.nome === gameState.meuTime) continue;

            const jogadorRand = timeRand.elenco[Math.floor(Math.random() * timeRand.elenco.length)];
            
            // Evita duplicatas
            if (!gameState.mercado.find(j => j.id === jogadorRand.id)) {
                // Clona o objeto para adicionar preço sem alterar o original ainda
                const jogVenda = JSON.parse(JSON.stringify(jogadorRand));
                jogVenda.timeOrigem = timeRand.nome;
                jogVenda.paisOrigem = paisRand;
                jogVenda.valorMercado = this.calcularValorPasse(jogVenda);
                
                gameState.mercado.push(jogVenda);
            }
        }
    },

    calcularValorPasse: function(jog) {
        // Fórmula: (Força^3) * Fator Idade
        // Ex: Força 80 -> 512.000 * 20 = ~10 Milhões
        let base = Math.pow(jog.forca, 3);
        let fatorIdade = 1;
        
        if (jog.idade < 23) fatorIdade = 1.5; // Jovens valem mais
        else if (jog.idade > 32) fatorIdade = 0.6; // Velhos valem menos
        
        // Ajuste monetário para ficar realista (R$)
        let valor = Math.floor(base * 30 * fatorIdade); 
        
        // Arredonda para ficar bonito (ex: 10.500.000)
        return Math.floor(valor / 10000) * 10000;
    },

    comprarJogador: function(gameState, idJogador) {
        const jogVenda = gameState.mercado.find(j => j.id === idJogador);
        const meuTime = this.encontrarTime(gameState, gameState.meuTime);

        if (!jogVenda || !meuTime) return { sucesso: false, msg: "Erro ao processar." };

        if (meuTime.financas.caixa < jogVenda.valorMercado) {
            return { sucesso: false, msg: "Dinheiro insuficiente!" };
        }

        // 1. Desconta Grana
        meuTime.financas.caixa -= jogVenda.valorMercado;
        meuTime.financas.despesas.transferencias = (meuTime.financas.despesas.transferencias || 0) + jogVenda.valorMercado;

        // 2. Remove do time original (Global)
        const timeOrigem = this.encontrarTime(gameState, jogVenda.timeOrigem);
        if (timeOrigem) {
            timeOrigem.elenco = timeOrigem.elenco.filter(j => j.id !== idJogador);
            // Compensa time origem (opcional, mas bom pra realismo)
            if(timeOrigem.financas) timeOrigem.financas.caixa += jogVenda.valorMercado;
        }

        // 3. Adiciona ao meu time
        // Limpa propriedades temporárias de venda
        delete jogVenda.timeOrigem;
        delete jogVenda.paisOrigem;
        delete jogVenda.valorMercado;
        
        // Recalcula salário para o novo contrato
        jogVenda.salario = jogVenda.forca * 1500; 
        
        meuTime.elenco.push(jogVenda);
        
        // 4. Remove do Mercado
        gameState.mercado = gameState.mercado.filter(j => j.id !== idJogador);

        this.salvarJogo(gameState);
        return { sucesso: true, msg: `Contratado! ${jogVenda.nome} agora é do ${meuTime.nome}.` };
    },

    venderJogadorUsuario: function(gameState, idJogador) {
        const meuTime = this.encontrarTime(gameState, gameState.meuTime);
        const jogador = meuTime.elenco.find(j => j.id === idJogador);
        
        if (!jogador) return { sucesso: false };

        // Venda imediata simplificada (para o "mercado externo")
        // Valor um pouco abaixo do mercado para ser instantâneo
        const valorVenda = Math.floor(this.calcularValorPasse(jogador) * 0.8);
        
        meuTime.financas.caixa += valorVenda;
        meuTime.financas.receitas.transferencias = (meuTime.financas.receitas.transferencias || 0) + valorVenda;
        
        // Remove do elenco
        meuTime.elenco = meuTime.elenco.filter(j => j.id !== idJogador);
        
        this.salvarJogo(gameState);
        return { sucesso: true, valor: valorVenda, nome: jogador.nome };
    },

    // --- 3. SIMULAÇÃO E PROCESSAMENTO ---

    processarSemana: function(gameState) {
        // ... (Mantém a lógica de simular jogos anterior) ...
        // Vou resumir a função aqui para não ficar gigante, 
        // mas você deve manter a lógica de simularPlacarRapido que já fizemos
        
        const semanaReal = gameState.semanaAtual - 1;
        Object.keys(gameState.mundo).forEach(pais => {
            const liga = gameState.mundo[pais];
            if (liga.calendario[semanaReal]) {
                liga.calendario[semanaReal].forEach(jogo => {
                    if (jogo.golsCasa !== undefined) return;
                    const tC = this.encontrarTimeNoPais(gameState, pais, jogo.casa);
                    const tF = this.encontrarTimeNoPais(gameState, pais, jogo.fora);
                    if (tC && tF) {
                        const r = this.simularPlacarRapido(tC, tF);
                        jogo.golsCasa = r.gc; jogo.golsFora = r.gf;
                        if(jogo.comp === 'LIGA') this.computarJogo(tC, tF, r.gc, r.gf);
                        this.distribuirGols(tC, r.gc); this.distribuirGols(tF, r.gf);
                    }
                });
            }
        });

        // ATUALIZA MERCADO SEMANALMENTE
        // Remove alguns não vendidos e adiciona novos
        if (gameState.semanaAtual % 2 === 0) { // A cada 2 semanas renova
            this.atualizarMercado(gameState);
        }

        gameState.semanaAtual++;
        this.construirCalendarioUsuario(gameState);
        this.salvarJogo(gameState);
        return { fim: false };
    },

    // --- AUXILIARES (Mantidos) ---
    simularPlacarRapido: function(tC, tF) {
        const fC = tC.forca + 5; const fF = tF.forca; const diff = fC - fF;
        let lC = 1.3+(diff/30), lF = 1.0-(diff/30);
        if(lC<0.1)lC=0.1; if(lF<0.1)lF=0.1;
        const getG=(l)=>{let L=Math.exp(-l),p=1,k=0;do{k++;p*=Math.random()}while(p>L);return k-1};
        return { gc: getG(lC), gf: getG(lF) };
    },
    computarJogo: function(tC, tF, gc, gf) {
        const up=(t,gp,gc_a)=>{t.stats.j++;t.stats.gp+=gp;t.stats.gc+=gc_a;t.stats.s=t.stats.gp-t.stats.gc;if(gp>gc_a){t.stats.v++;t.stats.p+=3}else if(gp===gc_a){t.stats.e++;t.stats.p+=1}else t.stats.d++};
        up(tC,gc,gf); up(tF,gf,gc);
    },
    encontrarTime: function(gameState, nome) {
        if(!gameState || !gameState.mundo) return null;
        for(let p in gameState.mundo) { const t=gameState.mundo[p].times.find(x=>x.nome===nome); if(t)return t; } return null;
    },
    encontrarTimeNoPais: function(gameState, pais, nome) { return gameState.mundo[pais].times.find(t=>t.nome===nome); },
    
    // Funções de Elenco, Finanças e Tática mantidas iguais...
    gerarCalendarioPontosCorridos: function(times) { /* Copiar do anterior */ 
        if (times.length % 2 !== 0) times.push({ nome: "Folga", fantasma: true });
        const n = times.length; const rodadas = []; const jogosPorRodada = n / 2;
        let indices = times.map((_, i) => i);
        for (let r = 0; r < n - 1; r++) {
            let rodada = [];
            for (let i = 0; i < jogosPorRodada; i++) {
                const t1 = indices[i]; const t2 = indices[n - 1 - i];
                if (!times[t1].fantasma && !times[t2].fantasma) {
                    if (r % 2 === 0) rodada.push({ casa: times[t1].nome, fora: times[t2].nome });
                    else rodada.push({ casa: times[t2].nome, fora: times[t1].nome });
                }
            }
            rodadas.push(rodada); indices.splice(1, 0, indices.pop());
        }
        const returno = rodadas.map(r => r.map(j => ({ casa: j.fora, fora: j.casa })));
        return [...rodadas, ...returno];
    },
    construirCalendarioUsuario: function(gameState) {
        const ligaUser = gameState.mundo[gameState.paisUsuario];
        gameState.calendarioUsuario = [];
        ligaUser.calendario.forEach((rod, i) => {
            gameState.calendarioUsuario.push({ semana: i+1, tipo: 'LIGA', nome: `Rodada ${i+1}`, jogos: rod });
        });
    },
    gerarElenco: function(nome, forcaBase) {
        if(typeof PlayersDB!=='undefined' && PlayersDB[nome]) return PlayersDB[nome].map((j,i)=>({id:nome+i,nome:j.nome,pos:j.pos,forca:j.forca,carac:j.carac||"Normal",gols:0,idade:25,energia:100}));
        let e=[]; const p=["GOL","ZAG","MEI","ATA"];
        for(let i=0;i<20;i++){ let pos=p[i%4]; if(i<2)pos="GOL"; e.push({id:nome+i,nome:`Jog ${i} ${nome.substring(0,3)}`,pos:pos,forca:Math.max(40,forcaBase+Math.floor(Math.random()*10)-5),carac:"Normal",gols:0,idade:20+Math.floor(Math.random()*10),energia:100}); }
        return e;
    },
    calcularForcaElenco: function(e) { const t=e.slice(0,11); let s=0; t.forEach(p=>s+=p.forca); return Math.floor(s/Math.max(1,t.length)); },
    inicializarFinancas: function(t) { t.financas={caixa:15000000,moeda:"R$",receitas:{tv:5000000,bilheteria:0},despesas:{folhaSalarial:0}}; let f=0; t.elenco.forEach(p=>{p.salario=p.forca*1000;f+=p.salario}); t.financas.despesas.folhaSalarial=f*13; },
    definirFuncoesAutomaticas: function(t){ if(t.elenco.length>0){t.funcoes.capitao=t.elenco[0].id;t.funcoes.penalti=t.elenco[0].id;t.funcoes.falta=t.elenco[0].id;t.funcoes.escanteio=t.elenco[0].id;} },
    distribuirGols: function(t,q){ for(let i=0;i<q;i++){const a=t.elenco[Math.floor(Math.random()*Math.min(11,t.elenco.length))];if(a)a.gols++;} },
    formatarDinheiro: function(v,m){ return (m||"R$")+" "+(v||0).toLocaleString(); },
    salvarJogo: function(s){ localStorage.setItem('brfutebol_save',JSON.stringify(s)); },
    carregarJogo: function(){ return JSON.parse(localStorage.getItem('brfutebol_save')); },
    getClassificacao: function(gameState, pais) { return [...gameState.mundo[pais].times].sort((a,b)=>{if(b.stats.p!==a.stats.p)return b.stats.p-a.stats.p;return b.stats.s-a.stats.s}); }
};
