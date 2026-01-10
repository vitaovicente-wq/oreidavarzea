<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BRFutebol - Calendário</title>
    <script src="engine.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg-dark: #0f1216;
            --sidebar-bg: #161b22;
            --card-bg: #1e2329;
            --neon-green: #00ff88;
            --text-main: #ffffff;
            --text-muted: #8b949e;
            --border: #30363d;
            --gold: #f1c40f;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-main);
            margin: 0; padding: 0;
            display: flex; height: 100vh; overflow: hidden;
        }

        /* SIDEBAR */
        .sidebar {
            width: 250px; background: var(--sidebar-bg);
            border-right: 1px solid var(--border);
            padding: 20px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;
        }
        .logo {
            font-family: 'Rajdhani', sans-serif; font-size: 2rem; font-weight: 900;
            margin-bottom: 20px; color: #fff; text-transform: uppercase; letter-spacing: 2px;
        }
        .logo span { color: var(--neon-green); }
        .menu-btn {
            display: flex; align-items: center; gap: 12px; padding: 12px;
            border-radius: 8px; color: var(--text-muted); text-decoration: none;
            font-weight: 600; transition: 0.2s; cursor: pointer;
        }
        .menu-btn:hover, .menu-btn.active { background: rgba(0, 255, 136, 0.1); color: var(--neon-green); }
        .menu-btn.logout { margin-top: auto; color: #ff4757; }

        /* MAIN CONTENT */
        .main-content {
            flex: 1; padding: 30px; overflow-y: auto;
            display: flex; flex-direction: column; gap: 20px;
        }

        /* HEADER DE NAVEGAÇÃO */
        .round-nav {
            display: flex; justify-content: space-between; align-items: center;
            background: var(--card-bg); padding: 15px 30px; border-radius: 12px;
            border: 1px solid var(--border); margin-bottom: 10px;
        }
        .round-title { font-family: 'Rajdhani'; font-size: 1.8rem; font-weight: 700; text-transform: uppercase; }
        .nav-btn {
            background: #0d1117; border: 1px solid var(--border); color: #fff;
            padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;
            transition: 0.2s;
        }
        .nav-btn:hover { background: var(--neon-green); color: #000; }

        /* LISTA DE JOGOS */
        .match-list { display: flex; flex-direction: column; gap: 10px; }
        
        .match-card {
            display: flex; align-items: center; justify-content: space-between;
            background: var(--card-bg); padding: 15px 25px; border-radius: 10px;
            border: 1px solid var(--border); transition: 0.2s; position: relative;
        }
        /* Efeito de hover apenas se o jogo já foi jogado */
        .match-card.played { cursor: pointer; }
        .match-card.played:hover { background: #252b33; border-color: var(--neon-green); }
        .match-card.played::after {
            content: 'VER DETALHES 👁️';
            position: absolute; right: 10px; top: 5px;
            font-size: 0.6rem; color: var(--neon-green); font-weight: 700; opacity: 0; transition: 0.2s;
        }
        .match-card.played:hover::after { opacity: 1; }

        .team-side { display: flex; align-items: center; gap: 15px; width: 40%; }
        .team-side.away { justify-content: flex-end; }
        
        .team-logo { width: 40px; height: 40px; object-fit: contain; }
        .team-name { font-weight: 700; font-size: 1rem; }
        
        .score-board {
            font-family: 'Rajdhani'; font-weight: 800; font-size: 1.5rem;
            background: #0d1117; padding: 5px 20px; border-radius: 8px;
            min-width: 100px; text-align: center; border: 1px solid var(--border);
        }
        .score-board.pending { color: #555; font-size: 1rem; padding: 8px; }

        /* MODAL DETALHES */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            display: none; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-card {
            background: #161b22; border: 1px solid var(--border); border-radius: 12px;
            width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }
        .modal-header {
            background: linear-gradient(180deg, #1e2329 0%, #161b22 100%);
            padding: 20px; text-align: center; border-bottom: 1px solid var(--border);
        }
        .modal-score-big { font-family: 'Rajdhani'; font-size: 3rem; font-weight: 900; color: #fff; margin: 10px 0; }
        .modal-teams { display: flex; justify-content: space-around; align-items: center; }
        .modal-team-col { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .modal-logo { width: 60px; height: 60px; object-fit: contain; }
        
        .modal-body { padding: 20px; }
        .detail-section { margin-bottom: 20px; }
        .detail-title { 
            font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; 
            border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px; font-weight: 700;
        }
        .goal-list { display: flex; flex-direction: column; gap: 5px; }
        .goal-item { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 5px; background: rgba(255,255,255,0.03); border-radius: 4px; }
        .goal-time { color: var(--neon-green); font-weight: 700; width: 40px; }
        
        .btn-close {
            display: block; width: 100%; padding: 15px; background: transparent;
            border: none; border-top: 1px solid var(--border); color: #888;
            cursor: pointer; font-weight: 700; transition: 0.2s;
        }
        .btn-close:hover { background: #222; color: #fff; }

    </style>
</head>
<body>

    <nav class="sidebar">
        <div class="logo">BR<span>FUTEBOL</span></div>
        <a class="menu-btn" href="dashboard.html">📊 Visão Geral</a>
        <a class="menu-btn" href="escalacao.html">👕 Escalação</a>
        <a class="menu-btn active">📅 Calendário</a>
        <a class="menu-btn" onclick="alert('Em breve')">💰 Transferências</a>
        <a class="menu-btn logout" href="index.html">✖ Sair</a>
    </nav>

    <main class="main-content">
        
        <div class="round-nav">
            <button class="nav-btn" onclick="mudarRodada(-1)">❮ ANTERIOR</button>
            <div class="round-title" id="round-display">Rodada 1</div>
            <button class="nav-btn" onclick="mudarRodada(1)">PRÓXIMA ❯</button>
        </div>

        <div class="match-list" id="match-container">
            </div>

    </main>

    <div id="match-modal" class="modal-overlay" onclick="fecharModal(event)">
        <div class="modal-card">
            <div class="modal-header">
                <div style="font-size:0.8rem; color:#888; text-transform:uppercase;">Resumo da Partida</div>
                <div class="modal-teams">
                    <div class="modal-team-col">
                        <img id="mod-home-logo" class="modal-logo" src="">
                        <span id="mod-home-name" style="font-weight:bold">Casa</span>
                    </div>
                    <div class="modal-score-big">
                        <span id="mod-score-h">0</span> - <span id="mod-score-a">0</span>
                    </div>
                    <div class="modal-team-col">
                        <img id="mod-away-logo" class="modal-logo" src="">
                        <span id="mod-away-name" style="font-weight:bold">Fora</span>
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <div class="detail-title">⚽ Gols & Eventos</div>
                    <div class="goal-list" id="mod-goals-list">
                        </div>
                </div>
                <div class="detail-section">
                    <div class="detail-title">📝 Escalações Iniciais (Simulação)</div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.8rem; color:#ccc;">
                        <div id="mod-lineup-h"></div>
                        <div id="mod-lineup-a" style="text-align:right;"></div>
                    </div>
                </div>
            </div>
            <button class="btn-close" onclick="fecharModal()">FECHAR</button>
        </div>
    </div>

    <script>
        const DEFAULT_SHIELD = "https://cdn-icons-png.flaticon.com/512/53/53283.png";
        let gameState = null;
        let rodadaVisualizada = 1;

        window.onload = function() {
            gameState = Engine.carregarJogo();
            if (!gameState) {
                alert("Sem jogo salvo!");
                window.location.href = 'index.html';
                return;
            }
            // Inicia visualizando a rodada atual do save
            rodadaVisualizada = gameState.rodadaAtual || 1;
            // Se já acabou o campeonato, mostra a última
            if (rodadaVisualizada > gameState.calendario.length) {
                rodadaVisualizada = gameState.calendario.length;
            }
            renderizarRodada();
        };

        function mudarRodada(delta) {
            const nova = rodadaVisualizada + delta;
            if (nova >= 1 && nova <= gameState.calendario.length) {
                rodadaVisualizada = nova;
                renderizarRodada();
            }
        }

        function renderizarRodada() {
            document.getElementById('round-display').innerText = `RODADA ${rodadaVisualizada}`;
            const container = document.getElementById('match-container');
            container.innerHTML = '';

            const rodadaDados = gameState.calendario[rodadaVisualizada - 1];
            if (!rodadaDados) return;

            rodadaDados.jogos.forEach((jogo, index) => {
                // Busca dados dos times (Escudos)
                const timeCasa = Engine.encontrarTime(jogo.mandante) || { escudo: DEFAULT_SHIELD };
                const timeFora = Engine.encontrarTime(jogo.visitante) || { escudo: DEFAULT_SHIELD };

                // Monta o placar
                let placarHTML = `<div class="score-board pending">VS</div>`;
                let classeJogado = "";
                let clickAction = "";

                if (jogo.jogado) {
                    placarHTML = `<div class="score-board">${jogo.placarCasa} - ${jogo.placarFora}</div>`;
                    classeJogado = "played";
                    // Passamos o índice do jogo para saber qual abrir
                    clickAction = `onclick="abrirDetalhes(${index})"`;
                }

                const card = `
                    <div class="match-card ${classeJogado}" ${clickAction}>
                        <div class="team-side">
                            <img src="${timeCasa.escudo || DEFAULT_SHIELD}" class="team-logo" onerror="this.src='${DEFAULT_SHIELD}'">
                            <span class="team-name">${jogo.mandante}</span>
                        </div>
                        
                        ${placarHTML}
                        
                        <div class="team-side away">
                            <span class="team-name">${jogo.visitante}</span>
                            <img src="${timeFora.escudo || DEFAULT_SHIELD}" class="team-logo" onerror="this.src='${DEFAULT_SHIELD}'">
                        </div>
                    </div>
                `;
                container.innerHTML += card;
            });
        }

        // --- SISTEMA DE DETALHES ---

        function abrirDetalhes(gameIndex) {
            const jogo = gameState.calendario[rodadaVisualizada - 1].jogos[gameIndex];
            if (!jogo.jogado) return; // Não abre se não jogou

            const timeCasa = Engine.encontrarTime(jogo.mandante);
            const timeFora = Engine.encontrarTime(jogo.visitante);

            // Preenche Header
            document.getElementById('mod-home-name').innerText = jogo.mandante;
            document.getElementById('mod-away-name').innerText = jogo.visitante;
            document.getElementById('mod-home-logo').src = timeCasa.escudo || DEFAULT_SHIELD;
            document.getElementById('mod-away-logo').src = timeFora.escudo || DEFAULT_SHIELD;
            document.getElementById('mod-score-h').innerText = jogo.placarCasa;
            document.getElementById('mod-score-a').innerText = jogo.placarFora;

            // Gera Súmula (Se não existir salva, gera uma aleatória baseada no placar)
            // Isso é um truque para o jogo parecer mais rico mesmo sem salvar tudo
            const gols = gerarSúmula(jogo);
            
            const listaGols = document.getElementById('mod-goals-list');
            listaGols.innerHTML = '';
            if (gols.length === 0) {
                listaGols.innerHTML = '<div style="text-align:center; color:#666;">0 - 0 (Sem gols)</div>';
            } else {
                gols.forEach(gol => {
                    listaGols.innerHTML += `
                        <div class="goal-item">
                            <div><span class="goal-time">${gol.min}'</span> ⚽ ${gol.jogador}</div>
                            <div style="font-weight:bold; color:#888">${gol.time}</div>
                        </div>
                    `;
                });
            }

            // Escalações Fake (apenas para visual)
            document.getElementById('mod-lineup-h').innerHTML = gerarEscalacaoTexto(timeCasa);
            document.getElementById('mod-lineup-a').innerHTML = gerarEscalacaoTexto(timeFora);

            document.getElementById('match-modal').style.display = 'flex';
        }

        // Gera lista de gols baseada no placar (Simulação visual)
        function gerarSúmula(jogo) {
            let eventos = [];
            
            // Gols Casa
            for(let i=0; i<jogo.placarCasa; i++) {
                eventos.push({ 
                    min: Math.floor(Math.random() * 90) + 1, 
                    time: jogo.mandante, 
                    jogador: "Atacante " + (Math.floor(Math.random()*3)+9)
                });
            }
            // Gols Fora
            for(let i=0; i<jogo.placarFora; i++) {
                eventos.push({ 
                    min: Math.floor(Math.random() * 90) + 1, 
                    time: jogo.visitante, 
                    jogador: "Atacante " + (Math.floor(Math.random()*3)+9)
                });
            }
            // Ordena por minuto
            return eventos.sort((a,b) => a.min - b.min);
        }

        function gerarEscalacaoTexto(timeObj) {
            // Se tiver elenco real, usa nomes. Se não, gera genéricos
            if (timeObj && timeObj.elenco && timeObj.elenco.length > 0) {
                // Pega os 11 primeiros
                return timeObj.elenco.slice(0, 11).map(j => `<div>${j.nome}</div>`).join('');
            } else {
                let html = "";
                ['GOL','LD','ZAG','ZAG','LE','VOL','VOL','MEI','ATA','ATA','ATA'].forEach(pos => {
                    html += `<div>Jogador ${pos}</div>`;
                });
                return html;
            }
        }

        function fecharModal(e) {
            if (!e || e.target.id === 'match-modal' || e.target.classList.contains('btn-close')) {
                document.getElementById('match-modal').style.display = 'none';
            }
        }
    </script>
</body>
</html>
