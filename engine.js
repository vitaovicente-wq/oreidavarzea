const Engine = {
    // --- 1. SETUP E INICIALIZAÇÃO ---
    novoJogo: function(paisUsuario, divisao, timeJogador) {
        const gameState = {
            paisUsuario: paisUsuario,
            meuTime: timeJogador,
            ano: 2026,
            semanaAtual: 1,
            mundo: {}, 
            calendarioUsuario: [],
            mercado: []
        };

        const ligasPais = database[paisUsuario];
        if (ligasPais.serieA) {
            Object.keys(ligasPais).forEach(divNome => {
                this.carregarLiga(gameState, paisUsuario, ligasPais[divNome]);
            });
        } else {
            this.carregarLiga(gameState, paisUsuario, ligasPais);
        }

        this.construirCalendarioUsuario(gameState);
        this.atualizarMercado(gameState);
        
        const meuTimeObj = this.encontrarTime(gameState, timeJogador);
        if (meuTimeObj) this.inicializarFinancas(meuTimeObj);

        this.salvarJogo(gameState);
        return gameState;
    },

    carregarLiga: function(gameState, pais, listaTimes) {
        if (!listaTimes || listaTimes.length === 0) return;
        const timesProcessados = JSON.parse(JSON.stringify(listaTimes)).map(t => this.inicializarTime(t, pais));
        timesProcessados.sort(() => Math.random() - 0.5);
        const calendarioLiga = this.gerarCalendarioPontosCorridos(timesProcessados);
        
        if (!gameState.mundo[pais]) gameState.mundo[pais] = { times: [], calendario: [], tabela: [] };
        gameState.mundo[pais].times.push(...timesProcessados);
        if(gameState.mundo[pais].calendario.length === 0) gameState.mundo[pais].calendario = calendarioLiga;
    },

    inicializarTime: function(t, pais) {
        t.stats = { p:0, j:0, v:0, e:0, d:0, gp:0, gc:0, s:0 };
        if(!t.elenco) t.elenco = this.gerarElenco(t.nome, t.forca || 60);
        
        // Garante atributos vitais
        t.elenco.forEach(j => {
            if (j.saude === undefined) j.saude = 100;
            if (!j.idade) j.idade = 18 + Math.floor(Math.random() * 15);
        });

        t.forca = this.calcularForcaElenco(t.elenco);
        t.moral = 100;
        t.pais = pais;
        t.funcoes = { capitao: null, penalti: null, falta: null, escanteio: null };
        this.definirFuncoesAutomaticas(t);
        return t;
    },

    // --- 2. PROCESSAMENTO DE SEMANA (COM CORREÇÃO DE CANSAÇO) ---

    processarSemana: function(gameState) {
        const semanaReal = gameState.semanaAtual - 1;
        const ligaUser = gameState.mundo[gameState.paisUsuario];
        
        if (!ligaUser.calendario[semanaReal]) return { fim: true, fimTemporada: true };

        // 1. Recuperação (Todos recuperam um pouco pelo descanso da semana)
        this.recuperarFisicoGeral(gameState);

        // 2. Jogos e Desgaste
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
                        this.distribuirGols(tC, r.gc);
                        this.distribuirGols(tF, r.gf);

                        // APLICA CANSAÇO (CORRIGIDO: Só quem jogou)
                        this.aplicarCansacoPosJogo(tC, gameState.meuTime);
                        this.aplicarCansacoPosJogo(tF, gameState.meuTime);
                    }
                });
            }
        });

        if (gameState.semanaAtual % 2 === 0) this.atualizarMercado(gameState);

        gameState.semanaAtual++;
        this.construirCalendarioUsuario(gameState);
        this.salvarJogo(gameState);
        return { fim: false };
    },

    aplicarCansacoPosJogo: function(time, nomeMeuTime) {
        let idsQuemJogou = [];

        // CASO 1: É O TIME DO USUÁRIO?
        // Busca a escalação salva no LocalStorage (definida na tela de tática)
        if (time.nome === nomeMeuTime) {
            const taticasSalvas = localStorage.getItem('brfutebol_formacao');
            if (taticasSalvas) {
                const formacaoObj = JSON.parse(taticasSalvas);
                // Extrai apenas os IDs dos 11 titulares
                idsQuemJogou = Object.values(formacaoObj).filter(id => id !== null);
            }
        }

        // CASO 2: É TIME DA CPU (OU USUÁRIO SEM TÁTICA SALVA)
        // Assume que os 11 melhores (maior força) jogaram
        if (idsQuemJogou.length === 0) {
            const titularesCPU = [...time.elenco].sort((a,b) => b.forca - a.forca).slice(0, 11);
            idsQuemJogou = titularesCPU.map(j => j.id);
        }

        // APLICA O DESGASTE APENAS NOS IDs IDENTIFICADOS
        time.elenco.forEach(jog => {
            if (idsQuemJogou.includes(jog.id)) {
                // Cálculo de Cansaço por Idade
                let perda = 5; // Base
                
                if (jog.idade < 21) perda += 1;       // Muito jovens cansam um pouco
                else if (jog.idade > 29) perda += 3;  // +30 anos cansa mais
                else if (jog.idade > 33) perda += 6;  // +33 anos cansa muito
                
                // Variável aleatória de intensidade do jogo (+0 a +3)
                perda += Math.floor(Math.random() * 4);

                jog.saude -= perda;
                if (jog.saude < 0) jog.saude = 0;
            }
        });
    },

    recuperarFisicoGeral: function(gameState) {
        Object.keys(gameState.mundo).forEach(pais => {
            gameState.mundo[pais].times.forEach(time => {
                time.elenco.forEach(jog => {
                    // Recuperação Semanal (Fisioterapia)
                    let rec = 15; 
                    if (jog.idade > 30) rec = 10; // Velhos recuperam mais devagar
                    if (jog.idade > 34) rec = 8;

                    jog.saude += rec;
                    if (jog.saude > 100) jog.saude = 100;
                });
            });
        });
    },

    // --- DEMAIS FUNÇÕES AUXILIARES (Mantidas) ---
    virarTemporada: function(gameState) {
        Object.keys(gameState.mundo).forEach(pais => {
            const liga = gameState.mundo[pais];
            const classificacao = [...liga.times].sort((a,b) => b.stats.p - a.stats.p);
            classificacao.forEach((time, index) => {
                const premio = Math.floor(50000000 - (index * 2000000));
                if(time.financas) time.financas.caixa += Math.max(1000000, premio);
                time.stats = { p:0, j:0, v:0, e:0, d:0, gp:0, gc:0, s:0 };
                time.elenco.forEach(j => j.saude = 100); // Férias resetam saúde
            });
            liga.times.forEach(time => this.processarEvolucaoElenco(time));
            liga.times.sort(() => Math.random() - 0.5);
            liga.calendario = this.gerarCalendarioPontosCorridos(liga.times);
        });
        gameState.ano++;
        gameState.semanaAtual = 1;
        this.construirCalendarioUsuario(gameState);
        this.salvarJogo(gameState);
        return { ano: gameState.ano };
    },

    processarEvolucaoElenco: function(time) {
        const novosJovens = [];
        time.elenco = time.elenco.filter(jog => {
            jog.idade++;
            if (jog.idade >= 36 && Math.random() < 0.4) { novosJovens.push(this.gerarRegen(time.nome, jog.pos)); return false; }
            if (jog.idade >= 40) { novosJovens.push(this.gerarRegen(time.nome, jog.pos)); return false; }
            let evolucao = 0;
            if (jog.idade <= 21) evolucao = Math.floor(Math.random() * 4);
            else if (jog.idade <= 24) evolucao = Math.floor(Math.random() * 3);
            else if (jog.idade >= 32) evolucao = Math.floor(Math.random() * -3);
            jog.forca += evolucao;
            if (jog.forca > 99) jog.forca = 99; if (jog.forca < 30) jog.forca = 30;
            jog.salario = Math.floor(jog.forca * 1200);
            return true;
        });
        time.elenco = [...time.elenco, ...novosJovens];
        time.forca = this.calcularForcaElenco(time.elenco);
    },

    gerarRegen: function(nomeTime, pos) {
        const nomesRegen = ["Novato", "Júnior", "Neto", "Filho", "Promessa", "Garoto", "Base"];
        const nome = nomesRegen[Math.floor(Math.random() * nomesRegen.length)] + " " + Math.floor(Math.random()*100);
        return { id: `${nomeTime}_regen_${Math.random()}`, nome: nome, pos: pos, forca: Math.floor(Math.random() * 15) + 55, carac: "Normal", gols: 0, idade: 16 + Math.floor(Math.random()*3), salario: 10000, saude: 100 };
    },

    atualizarMercado: function(gs){ gs.mercado=[]; const p=Object.keys(gs.mundo); for(let i=0;i<15;i++){const pr=p[Math.floor(Math.random()*p.length)]; const tr=gs.mundo[pr].times[Math.floor(Math.random()*gs.mundo[pr].times.length)]; if(tr.nome===gs.meuTime)continue; const jr=tr.elenco[Math.floor(Math.random()*tr.elenco.length)]; if(!gs.mercado.find(x=>x.id===jr.id)){const jv=JSON.parse(JSON.stringify(jr)); jv.timeOrigem=tr.nome; jv.paisOrigem=pr; jv.valorMercado=this.calcularValorPasse(jv); gs.mercado.push(jv);}}},
    calcularValorPasse: function(j){ let b=Math.pow(j.forca,3),f=j.idade<23?1.4:(j.idade>31?0.7:1); return Math.floor(b*35*f/10000)*10000; },
    processarProposta: function(gs,nv,id,val){ const v=this.encontrarTime(gs,nv), c=this.encontrarTime(gs,gs.meuTime), j=v.elenco.find(x=>x.id===id); if(c.financas.caixa<val)return{sucesso:false,msg:"Sem dinheiro."}; const vm=this.calcularValorPasse(j); let min=vm*(v.elenco.length<18?2:1.1); if(val>=min){ this.transferirJogador(c,v,j,val); this.salvarJogo(gs); return{sucesso:true,msg:"Aceito!"}; } return{sucesso:false,msg:"Recusado."}; },
    transferirJogador: function(c,v,j,val){ c.financas.caixa-=val; if(!v.financas)this.inicializarFinancas(v); v.financas.caixa+=val; v.elenco=v.elenco.filter(x=>x.id!==j.id); j.salario=Math.floor(j.forca*1800); c.elenco.push(j); },
    venderJogadorUsuario: function(gs,id){ const t=this.encontrarTime(gs,gs.meuTime), j=t.elenco.find(x=>x.id===id); if(!j)return{sucesso:false}; const v=Math.floor(this.calcularValorPasse(j)*0.85); t.financas.caixa+=v; t.elenco=t.elenco.filter(x=>x.id!==id); this.salvarJogo(gs); return{sucesso:true,valor:v}; },
    simularPlacarRapido: function(tC, tF) { const fC = tC.forca + 5; const fF = tF.forca; const diff = fC - fF; let lC = 1.3+(diff/30), lF = 1.0-(diff/30); if(lC<0.1)lC=0.1; if(lF<0.1)lF=0.1; const getG=(l)=>{let L=Math.exp(-l),p=1,k=0;do{k++;p*=Math.random()}while(p>L);return k-1}; return { gc: getG(lC), gf: getG(lF) }; },
    computarJogo: function(tC, tF, gc, gf) { const up=(t,gp,gc_a)=>{t.stats.j++;t.stats.gp+=gp;t.stats.gc+=gc_a;t.stats.s=t.stats.gp-t.stats.gc;if(gp>gc_a){t.stats.v++;t.stats.p+=3}else if(gp===gc_a){t.stats.e++;t.stats.p+=1}else t.stats.d++}; up(tC,gc,gf); up(tF,gf,gc); },
    encontrarTime: function(gs, n) { for(let p in gs.mundo) { const t=gs.mundo[p].times.find(x=>x.nome===n); if(t)return t; } return null; },
    encontrarTimeNoPais: function(gs, p, n) { return gs.mundo[p].times.find(t=>t.nome===n); },
    gerarCalendarioPontosCorridos: function(times) { if (times.length % 2 !== 0) times.push({ nome: "Folga", fantasma: true }); const n = times.length; const rodadas = []; const jogosPorRodada = n / 2; let indices = times.map((_, i) => i); for (let r = 0; r < n - 1; r++) { let rodada = []; for (let i = 0; i < jogosPorRodada; i++) { const t1 = indices[i]; const t2 = indices[n - 1 - i]; if (!times[t1].fantasma && !times[t2].fantasma) { if (r % 2 === 0) rodada.push({ casa: times[t1].nome, fora: times[t2].nome }); else rodada.push({ casa: times[t2].nome, fora: times[t1].nome }); } } rodadas.push(rodada); indices.splice(1, 0, indices.pop()); } const returno = rodadas.map(r => r.map(j => ({ casa: j.fora, fora: j.casa }))); return [...rodadas, ...returno]; },
    construirCalendarioUsuario: function(gs) { const l = gs.mundo[gs.paisUsuario]; gs.calendarioUsuario = []; l.calendario.forEach((rod, i) => { gs.calendarioUsuario.push({ semana: i+1, tipo: 'LIGA', nome: `Rodada ${i+1}`, jogos: rod }); }); },
    gerarElenco: function(nome, forcaBase) { if(typeof PlayersDB!=='undefined' && PlayersDB[nome]) return PlayersDB[nome].map((j,i)=>({id:nome+i,nome:j.nome,pos:j.pos,forca:j.forca,carac:j.carac||"Normal",gols:0,idade:j.idade||25,saude:100})); let e=[]; const p=["GOL","ZAG","MEI","ATA"]; for(let i=0;i<20;i++){ let pos=p[i%4]; if(i<2)pos="GOL"; e.push({id:nome+i,nome:`Jog ${i} ${nome.substring(0,3)}`,pos:pos,forca:Math.max(40,forcaBase+Math.floor(Math.random()*10)-5),carac:"Normal",gols:0,idade:18+Math.floor(Math.random()*15),saude:100}); } return e; },
    calcularForcaElenco: function(e) { const t=e.slice(0,11); let s=0; t.forEach(p=>s+=p.forca); return Math.floor(s/Math.max(1,t.length)); },
    inicializarFinancas: function(t) { t.financas={caixa:20000000,moeda:"R$",receitas:{tv:5000000,bilheteria:0,premios:0,transferencias:0},despesas:{folhaSalarial:0,manutencao:200000,transferencias:0}}; let f=0; t.elenco.forEach(p=>{p.salario=p.forca*1000;f+=p.salario}); t.financas.despesas.folhaSalarial=f*13; },
    definirFuncoesAutomaticas: function(t){ if(t.elenco.length>0){t.funcoes.capitao=t.elenco[0].id;t.funcoes.penalti=t.elenco[0].id;t.funcoes.falta=t.elenco[0].id;t.funcoes.escanteio=t.elenco[0].id;} },
    distribuirGols: function(t,q){ for(let i=0;i<q;i++){const a=t.elenco[Math.floor(Math.random()*Math.min(11,t.elenco.length))];if(a)a.gols++;} },
    formatarDinheiro: function(v,m){ return (m||"R$")+" "+(v||0).toLocaleString(); },
    salvarJogo: function(s){ localStorage.setItem('brfutebol_save',JSON.stringify(s)); },
    carregarJogo: function(){ return JSON.parse(localStorage.getItem('brfutebol_save')); },
    getClassificacao: function(gameState, pais) { return [...gameState.mundo[pais].times].sort((a,b)=>{if(b.stats.p!==a.stats.p)return b.stats.p-a.stats.p;return b.stats.s-a.stats.s}); }
};
