<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendário da Temporada</title>
    <script src="engine.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f1216; color: #fff; margin: 0; display: flex; flex-direction: column; height: 100vh; }
        header { padding: 20px; background: #161b22; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; }
        h1 { margin: 0; font-family: 'Rajdhani'; text-transform: uppercase; color: #00ff88; }
        .back-btn { background: #333; color: #fff; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        
        .calendar-container { flex: 1; overflow-y: auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        
        .round-card { background: #1e2329; border: 1px solid #333; border-radius: 8px; padding: 15px; }
        .round-card.current { border-color: #00ff88; box-shadow: 0 0 15px rgba(0, 255, 136, 0.1); }
        .round-header { font-family: 'Rajdhani'; font-weight: 700; color: #888; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; }
        .match-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.9rem; }
        .match-row.my-match { background: rgba(0, 255, 136, 0.1); border-radius: 4px; padding: 5px; font-weight: bold; color: #fff; }
        .score { font-weight: bold; color: #f1c40f; }
        .pending { color: #444; font-size: 0.8rem; }
    </style>
</head>
<body>
    <header>
        <button class="back-btn" onclick="window.location.href='dashboard.html'">❮ VOLTAR</button>
        <h1>Calendário</h1>
        <div style="font-weight:bold;">Temporada 2026</div>
    </header>

    <div class="calendar-container" id="calendar-list">
        </div>

    <script>
        window.onload = function() {
            const gameState = Engine.carregarJogo();
            if(!gameState) window.location.href='index.html';

            const container = document.getElementById('calendar-list');
            const meuTime = gameState.meuTime;

            gameState.calendario.forEach((rodada, index) => {
                const numRodada = index + 1;
                const div = document.createElement('div');
                div.className = 'round-card' + (numRodada === gameState.rodada ? ' current' : '');
                
                let html = `<div class="round-header"><span>RODADA ${numRodada}</span> ${numRodada === gameState.rodada ? '<span style="color:#00ff88">ATUAL</span>' : ''}</div>`;
                
                rodada.forEach(jogo => {
                    const isMe = (jogo.casa === meuTime || jogo.fora === meuTime);
                    const placar = (jogo.placarCasa !== null) 
                        ? `<span class="score">${jogo.placarCasa} x ${jogo.placarFora}</span>` 
                        : `<span class="pending">v</span>`;
                    
                    html += `
                        <div class="match-row ${isMe ? 'my-match' : ''}">
                            <span style="text-align:right; flex:1">${jogo.casa.substring(0,12)}</span>
                            <span style="width:50px; text-align:center">${placar}</span>
                            <span style="text-align:left; flex:1">${jogo.fora.substring(0,12)}</span>
                        </div>
                    `;
                });
                
                div.innerHTML = html;
                container.appendChild(div);
            });

            // Scrollar para a rodada atual
            setTimeout(() => {
                const current = document.querySelector('.current');
                if(current) current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        };
    </script>
</body>
</html>
