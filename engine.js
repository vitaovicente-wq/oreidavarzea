const Engine = {
    // --- CONFIGURAÇÕES ---
    configCompeticoes: {
        brasil: { nome: "Brasileirão", cont: "Libertadores" },
        argentina: { nome: "Liga Profesional", cont: "Libertadores" },
        espanha: { nome: "La Liga", cont: "Champions League" },
        inglaterra: { nome: "Premier League", cont: "Champions League" }
    },

    // --- 1. SETUP ---
    novoJogo: function(paisUsuario, divisao, timeJogador) {
        const gameState = {
            paisUsuario: paisUsuario,
            meuTime: timeJogador,
            ano: 2026,
            semanaAtual: 1,
            mundo: {}, 
            calendarioUsuario: []
        };

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
        t.pais = pais; // Importante para o mercado saber de onde é
        this.definirFuncoesAutomaticas(t);
        return t;
    },

    // --- 2. SISTEMA DE NEGOCIAÇÃO (NOVO!) ---

    calcularValorPasse: function(jog) {
        let base = Math.pow(jog.forca, 3);
        let fatorIdade = jog.idade < 23 ? 1.4 : (jog.idade > 31 ? 0.7 : 1);
        let valor = Math.floor(base * 35 * fatorIdade); 
        return Math.floor(valor / 10000) * 10000;
    },

    // A IA DECIDE SE ACEITA A OFERTA
    processarProposta: function(gameState, nomeTimeVendedor, idJogador, valorOferta) {
        const vendedor = this.encontrarTime(gameState, nomeTimeVendedor);
        const comprador = this.encontrarTime(gameState, gameState.meuTime);
        const jogador = vendedor.elenco.find(j => j.id === idJogador);

        if (!vendedor || !comprador || !jogador) return { sucesso: false, msg: "Erro de dados." };

        // 1. Validação Financeira
        if (comprador.financas.caixa < valorOferta) {
            return { sucesso: false, msg: "Seu clube não tem dinheiro suficiente em caixa." };
        }

        // 2. Análise da IA
        const valorMercado = this.calcularValorPasse(jogador);
        
        // Fator: Importância no time (é o craque?)
        const ordenado = [...vendedor.elenco].sort((a,b) => b.forca - a.forca);
        const rank = ordenado.findIndex(j => j.id === idJogador);
        const isCraque = (rank <= 2); // Top 3 do time
        
        // Fator: Tamanho do elenco (não pode vender se tiver poucos)
        if (vendedor.elenco.length <= 16) {
            return { sucesso: false, msg: `O ${vendedor.nome} recusou. O elenco deles está muito curto.` };
        }

        // Lógica de Preço
        let pedidoMinimo = valorMercado;
        if (isCraque) pedidoMinimo = valorMercado * 1.4; // Pede 40% a mais se for craque
        else pedidoMinimo = valorMercado * 1.05; // Pede 5% a mais no mínimo

        // Rivalidade (Se for do mesmo país, cobra mais caro)
        if (vendedor.pais === comprador.pais) pedidoMinimo *= 1.15;

        // Decisão
        if (valorOferta >= pedidoMinimo) {
            // FECHOU NEGÓCIO!
            this.transferirJogador(comprador, vendedor, jogador, valorOferta);
            this.salvarJogo(gameState);
            return { sucesso: true, msg: `PROPOSTA ACEITA! ${jogador.nome} assinou com seu time.` };
        } else {
            // RECUSOU
            const diferenca = 1 - (valorOferta / pedidoMinimo);
            if (diferenca < 0.15) return { sucesso: false, msg: `O ${vendedor.nome} pede um pouco mais. Estão quase aceitando.` };
            if (diferenca < 0.40) return { sucesso: false, msg: `Proposta recusada. O valor está abaixo do esperado.` };
            return { sucesso: false, msg: `O presidente do ${vendedor.nome} riu da sua oferta. Valor muito baixo.` };
        }
    },

    transferirJogador: function(comprador, vendedor, jogador, valor) {
        // Financeiro
        comprador.financas.caixa -= valor;
        comprador.financas.despesas.transferencias = (comprador.financas.despesas.transferencias || 0) + valor;
        
        // O PC ganha dinheiro (simulado)
        if (!vendedor.financas) this.inicializarFinancas(vendedor);
        vendedor.financas.caixa += valor;

        // Move Jogador
        vendedor.elenco = vendedor.elenco.filter(j => j.id !== jogador.id);
        
        // Ajusta contrato novo
        jogador.salario = Math.floor(jogador.forca * 1800); // Salário aumenta na transferência
        comprador.elenco.push(jogador);
    },

    venderJogadorUsuario: function(gameState, idJogador) {
        const meuTime = this.encontrarTime(gameState, gameState.meuTime);
        const jogador = meuTime.elenco.find(j => j.id === idJogador);
        
        if (!jogador) return { sucesso: false };

        const valorVenda = Math.floor(this.calcularValorPasse(jogador) * 0.85); // Venda rápida = 85% do valor
        
        meuTime.financas.caixa += valorVenda;
        meuTime.elenco = meuTime.elenco.filter(j => j.id !== idJogador);
        
        this.salvarJogo(gameState);
        return { sucesso: true, valor: valorVenda, nome: jogador.nome };
    },

    // --- 3. PROCESSAMENTO (Mantido igual) ---
    processarSemana: function(gameState) {
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
        gameState.semanaAtual++;
        this.construirCalendarioUsuario(gameState);
        this.salvarJogo(gameState);
        return { fim: false };
    },

    // --- AUXILIARES (Padrão) ---
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
    gerarCalendarioPontosCorridos: function(times) { 
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
    inicializarFinancas: function(t) { t.financas={caixa:20000000,moeda:"R$",receitas:{tv:5000000,bilheteria:0},despesas:{folhaSalarial:0}}; let f=0; t.elenco.forEach(p=>{p.salario=p.forca*1000;f+=p.salario}); t.financas.despesas.folhaSalarial=f*13; },
    definirFuncoesAutomaticas: function(t){ if(t.elenco.length>0){t.funcoes.capitao=t.elenco[0].id;t.funcoes.penalti=t.elenco[0].id;t.funcoes.falta=t.elenco[0].id;t.funcoes.escanteio=t.elenco[0].id;} },
    distribuirGols: function(t,q){ for(let i=0;i<q;i++){const a=t.elenco[Math.floor(Math.random()*Math.min(11,t.elenco.length))];if(a)a.gols++;} },
    formatarDinheiro: function(v,m){ return (m||"R$")+" "+(v||0).toLocaleString(); },
    salvarJogo: function(s){ localStorage.setItem('brfutebol_save',JSON.stringify(s)); },
    carregarJogo: function(){ return JSON.parse(localStorage.getItem('brfutebol_save')); },
    getClassificacao: function(gameState, pais) { return [...gameState.mundo[pais].times].sort((a,b)=>{if(b.stats.p!==a.stats.p)return b.stats.p-a.stats.p;return b.stats.s-a.stats.s}); }
};
