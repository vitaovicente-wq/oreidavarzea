<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caixa de Entrada - BRFutebol</title>
    <script src="engine.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root { --bg-dark: #0f1216; --sidebar-bg: #161b22; --card-bg: #1e2329; --neon-green: #00ff88; --text-main: #ffffff; --text-muted: #8b949e; --border: #30363d; --red: #ff4757; }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg-dark); color: var(--text-main); margin: 0; display: flex; height: 100vh; overflow: hidden; }
        .sidebar { width: 250px; background: var(--sidebar-bg); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .logo { font-family: 'Rajdhani', sans-serif; font-size: 2rem; font-weight: 900; margin-bottom: 20px; color: #fff; text-transform: uppercase; }
        .logo span { color: var(--neon-green); }
        .menu-btn { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: var(--text-muted); text-decoration: none; font-weight: 600; cursor: pointer; }
        .menu-btn:hover, .menu-btn.active { background: rgba(0, 255, 136, 0.1); color: var(--neon-green); }
        .menu-btn.logout { margin-top: auto; color: var(--red); }
        .main-content { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
        
        /* Mensagens */
        .msg-list { display: flex; flex-direction: column; gap: 10px; }
        .msg-item { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 20px; cursor: pointer; transition: 0.2s; }
        .msg-item:hover { border-color: var(--neon-green); transform: translateX(5px); }
        .msg-item.unread { border-left: 4px solid var(--neon-green); background: #262c33; }
        .msg-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .msg-title { font-weight: 700; font-size: 1.1rem; color: #fff; }
        .msg-date { font-size: 0.8rem; color: #888; }
        .msg-type { font-size: 0.7rem; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: #333; margin-left: 10px; }
        .msg-body { font-size: 0.95rem; color: #ddd; line-height: 1.6; display: none; margin-top: 15px; border-top: 1px solid #444; padding-top: 15px; }
        .msg-item.open .msg-body { display: block; }
        
        .btn-email { background: #3498db; color: #fff; border: none; padding: 10px 15px; cursor: pointer; width: 100%; margin-top: 10px; border-radius: 4px; font-weight: bold; }
        .btn-email:hover { background: #2980b9; }
    </style>
</head>
<body>
    <nav class="sidebar">
        <div class="logo">BR<span>FUTEBOL</span></div>
        <a class="menu-btn" href="painel.html">📊 Visão Geral</a>
        <a class="menu-btn" href="escalacao.html">👕 Escalação</a>
        <a class="menu-btn" href="mercado.html">🔄 Mercado</a>
        <a class="menu-btn" href="calendario.html">📅 Calendário</a>
        <a class="menu-btn" href="classificacao.html">🏆 Classificação</a>
        <a class="menu-btn" href="estadio.html">🏟️ Estádio</a>
        <a class="menu-btn" href="financeiro.html">💰 Finanças</a>
        <a class="menu-btn active" href="mensagens.html">📩 Mensagens <span id="badge-msg"></span></a>
        <a class="menu-btn logout" href="index.html">✖ Sair</a>
    </nav>

    <main class="main-content">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="font-family:'Rajdhani'; margin:0;">Caixa de Entrada</h2>
            <button onclick="location.reload()" style="background:none; border:1px solid #444; color:#888; padding:5px 10px; cursor:pointer; border-radius:4px;">🔄 Atualizar</button>
        </div>
        <div id="lista-mensagens" class="msg-list"></div>
    </main>

    <script>
        window.onload = function() {
            const game = Engine.carregarJogo();
            const container = document.getElementById('lista-mensagens');
            container.innerHTML = "";

            if(!game.mensagens || game.mensagens.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:40px; color:#666;"><h3>Caixa de Entrada Vazia</h3></div>`;
                return;
            }

            game.mensagens.forEach(msg => {
                const div = document.createElement('div');
                div.className = `msg-item ${msg.lida ? '' : 'unread'}`;
                
                // Badge de tipo (opcional, ajuda a identificar)
                let typeLabel = "";
                if(msg.tipo === 'patrocinio_oferta') typeLabel = `<span class="msg-type" style="color:#3498db">Comercial</span>`;
                if(msg.tipo === 'tv_oferta') typeLabel = `<span class="msg-type" style="color:#f1c40f">Mídia</span>`;
                if(msg.tipo === 'boas_vindas') typeLabel = `<span class="msg-type" style="color:#e74c3c">Diretoria</span>`;

                div.innerHTML = `
                    <div class="msg-header" onclick='lerMensagem(${JSON.stringify(msg).replace(/'/g, "&apos;")}, this)'>
                        <div><span class="msg-title">${msg.titulo}</span> ${typeLabel}</div>
                        <div class="msg-date">Rodada ${msg.rodada}</div>
                    </div>
                    <div class="msg-body">${msg.corpo}</div>
                `;
                container.appendChild(div);
            });
        };

        function lerMensagem(msg, element) {
            const parent = element.parentElement;
            
            // Lógica de Acordeão (Fecha outros, abre este)
            const wasOpen = parent.classList.contains('open');
            document.querySelectorAll('.msg-item').forEach(m => m.classList.remove('open'));
            
            if(!wasOpen) {
                parent.classList.add('open');
                parent.classList.remove('unread');

                const game = Engine.carregarJogo();
                const targetMsg = game.mensagens.find(m => m.id === msg.id);
                
                if(targetMsg && !targetMsg.lida) {
                    targetMsg.lida = true;
                    // Salva que leu
                    Engine.salvarJogo(game);
                    
                    // --- GATILHO DE FLUXO (AQUI ESTÁ A MÁGICA) ---
                    // Se leu "Boas Vindas", libera o Patrocínio
                    if(msg.tipo === 'boas_vindas') {
                        Engine.Contratos.liberarOfertasPatrocinio();
                        setTimeout(() => location.reload(), 1500); // Recarrega para mostrar o novo email
                    }
                    // Se leu "Patrocínio", libera a TV (depois de um delay maior pra simular tempo)
                    else if(msg.tipo === 'patrocinio_oferta') {
                        // Só libera TV se já tiver assinado? Não, vamos liberar a proposta logo.
                        Engine.Contratos.liberarOfertasTV();
                        // Não recarrega automatico aqui pra dar tempo de assinar o patrocínio primeiro
                    }
                }
            }
        }
    </script>
</body>
</html>
