<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caixa de Entrada - BRFutebol</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet">

    <script src="database.js"></script>
    <script src="calendario.js"></script>
    <script src="engine-core.js"></script>     
    <script src="engine-match.js"></script>    
    <script src="engine-mercado.js"></script>  
    <script src="engine-contratos.js"></script>
    <script src="engine-eventos.js"></script>

    <style>
        :root { 
            --bg-dark: #0f1216; 
            --sidebar-bg: #161b22; 
            --card-bg: #1e2329; 
            --neon-green: #00ff88; 
            --text-main: #ffffff; 
            --text-muted: #8b949e; 
            --border: #30363d; 
            --red: #ff4757; 
        }
        
        * { box-sizing: border-box; }

        body { 
            font-family: 'Inter', sans-serif; 
            background-color: var(--bg-dark); 
            color: var(--text-main); 
            margin: 0; 
            display: flex; 
            height: 100vh; 
            overflow: hidden; 
        }
        
        /* SIDEBAR */
        .sidebar { width: 250px; background: var(--sidebar-bg); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .logo { font-family: 'Rajdhani', sans-serif; font-size: 2rem; font-weight: 900; margin-bottom: 20px; color: #fff; text-transform: uppercase; }
        .logo span { color: var(--neon-green); }
        .menu-btn { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: var(--text-muted); text-decoration: none; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .menu-btn:hover, .menu-btn.active { background: rgba(0, 255, 136, 0.1); color: var(--neon-green); }
        .menu-btn.logout { margin-top: auto; color: var(--red); }

        /* ÁREA PRINCIPAL */
        .main-content { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
        .header-title { display: flex; justify-content: space-between; align-items: center; }
        .header-title h2 { font-family:'Rajdhani'; margin:0; font-size: 2rem; }

        /* LISTA DE MENSAGENS */
        .msg-list { display: flex; flex-direction: column; gap: 10px; }
        .msg-item { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; transition: 0.2s; }
        .msg-item:hover { border-color: #555; }
        
        /* Estado Não Lido */
        .msg-item.unread { border-left: 4px solid var(--neon-green); background: #262c33; }
        .msg-item.unread .msg-title { color: #fff; }
        .msg-item.unread .msg-header { font-weight: bold; }

        /* Cabeçalho da Mensagem (Clicável) */
        .msg-header { padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .msg-info { display: flex; flex-direction: column; gap: 2px; }
        .msg-sender { font-size: 0.75rem; color: var(--neon-green); text-transform: uppercase; letter-spacing: 1px; }
        .msg-title { font-size: 1.1rem; color: #ddd; transition: 0.2s; }
        .msg-meta { font-size: 0.8rem; color: #666; background: #111; padding: 4px 8px; border-radius: 4px; }

        /* Corpo da Mensagem (Conteúdo Rico) */
        .msg-body { 
            padding: 25px; 
            background: #121519; 
            display: none; 
            border-top: 1px solid #333; 
            animation: fadeIn 0.3s ease;
            color: #ccc;
            line-height: 1.6;
        }
        .msg-item.open .msg-body { display: block; }
        .msg-item.open { border-color: var(--neon-green); background: #1e2329; }

        /* --- ESTILOS ESPECÍFICOS PARA O CONTEÚDO DOS E-MAILS (HTML GERADO PELA ENGINE) --- */
        .email-container { font-family: 'Georgia', serif; }
        .btn-action { 
            font-family: 'Rajdhani', sans-serif; 
            text-transform: uppercase; 
            transition: transform 0.2s, opacity 0.2s; 
        }
        .btn-action:hover:not(:disabled) { transform: scale(1.02); filter: brightness(1.1); }
        .btn-action:disabled { cursor: not-allowed; filter: grayscale(1); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f1216; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
    </style>
</head>
<body>

    <nav class="sidebar">
        <div class="logo">BR<span>FUTEBOL</span></div>
        <a class="menu-btn" href="dashboard.html">📊 Visão Geral</a>
        <a class="menu-btn" href="escalacao.html">👕 Escalação</a>
        <a class="menu-btn" href="mercado.html">🔄 Mercado</a>
        <a class="menu-btn" href="calendario.html">📅 Calendário</a>
        <a class="menu-btn" href="classificacao.html">🏆 Classificação</a>
        <a class="menu-btn" href="estadio.html">🏟️ Estádio</a>
        <a class="menu-btn" href="financeiro.html">💰 Finanças</a>
        <a class="menu-btn active" href="mensagens.html">📩 Mensagens <span id="badge-msg"></span></a>
        <a class="menu-btn logout" href="index.html" onclick="localStorage.clear()">✖ Sair</a>
    </nav>

    <main class="main-content">
        <div class="header-title">
            <h2>Caixa de Entrada</h2>
            <div id="status-feed" style="font-size:0.9rem; color:var(--neon-green); height:20px;"></div>
        </div>
        
        <div id="lista-mensagens" class="msg-list">
            </div>
    </main>

    <script>
        window.onload = function() {
            if(typeof Engine === 'undefined') {
                document.getElementById('lista-mensagens').innerHTML = "<div style='padding:20px; color:red;'>Erro: Engine não carregada. Verifique os arquivos JS.</div>";
                return;
            }
            renderizar();
        };

        function renderizar() {
            const game = Engine.carregarJogo();
            const container = document.getElementById('lista-mensagens');
            container.innerHTML = "";

            if(!game || !game.mensagens || game.mensagens.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:60px; color:#444; border:2px dashed #333; border-radius:10px;">
                    <h3 style="margin:0;">Nenhuma mensagem</h3>
                    <p>Sua caixa de entrada está vazia.</p>
                </div>`;
                return;
            }

            // Ordena por ID decrescente (mais recentes primeiro)
            const msgs = game.mensagens.sort((a,b) => b.id - a.id);

            msgs.forEach(msg => {
                const item = document.createElement('div');
                item.className = `msg-item ${msg.lida ? '' : 'unread'}`;
                item.id = `msg-${msg.id}`; // ID único para o DOM

                // Badge do Tipo
                let tipoLabel = "Geral";
                if(msg.tipo === 'boas_vindas') tipoLabel = "Diretoria";
                if(msg.tipo === 'patrocinio_oferta') tipoLabel = "Comercial";
                if(msg.tipo === 'tv_oferta') tipoLabel = "Jurídico";
                if(msg.tipo === 'dm') tipoLabel = "Médico";
                if(msg.tipo === 'negociacao') tipoLabel = "Mercado";

                item.innerHTML = `
                    <div class="msg-header" onclick="lerMensagem(${msg.id})">
                        <div class="msg-info">
                            <div class="msg-sender">${msg.remetente || tipoLabel}</div>
                            <div class="msg-title">${msg.titulo}</div>
                        </div>
                        <div class="msg-meta">Rodada ${msg.rodada}</div>
                    </div>
                    <div class="msg-body">${msg.corpo}</div>
                `;
                container.appendChild(item);
            });
        }

        function lerMensagem(id) {
            const el = document.getElementById(`msg-${id}`);
            const wasOpen = el.classList.contains('open');
            
            // Fecha todas as outras para focar na atual
            document.querySelectorAll('.msg-item').forEach(div => div.classList.remove('open'));
            
            if(!wasOpen) {
                // Abre a mensagem clicada
                el.classList.add('open');
                el.classList.remove('unread');
                
                // Processa a leitura no backend (Engine)
                const game = Engine.carregarJogo();
                const msgIndex = game.mensagens.findIndex(m => m.id == id);
                
                if(msgIndex !== -1 && !game.mensagens[msgIndex].lida) {
                    game.mensagens[msgIndex].lida = true;
                    Engine.salvarJogo(game);
                    
                    // Verifica Gatilhos de Eventos (Narrativa Sequencial)
                    verificarGatilhos(game.mensagens[msgIndex]);
                }
            }
        }

        function verificarGatilhos(msg) {
            // Lógica para liberar a próxima mensagem da sequência
            let novidade = false;

            if (msg.tipo === 'boas_vindas') {
                if(Engine.Contratos && Engine.Contratos.liberarOfertasPatrocinio) {
                    Engine.Contratos.liberarOfertasPatrocinio();
                    novidade = true;
                    notificar("Novas propostas comerciais recebidas.");
                }
            } 
            else if (msg.tipo === 'patrocinio_oferta') {
                if(Engine.Contratos && Engine.Contratos.liberarOfertasTV) {
                    Engine.Contratos.liberarOfertasTV();
                    novidade = true;
                    notificar("Emissoras de TV entraram em contato.");
                }
            }

            if (novidade) {
                // Atualiza a lista após um pequeno delay para dar sensação de "chegando e-mail"
                setTimeout(() => {
                    renderizar();
                    // Reabre a mensagem que o usuário estava lendo para não perder o foco
                    const current = document.getElementById(`msg-${msg.id}`);
                    if(current) current.classList.add('open');
                }, 1500);
            }
        }

        function notificar(texto) {
            const box = document.getElementById('status-feed');
            box.innerText = "🔔 " + texto;
            setTimeout(() => { box.innerText = ""; }, 4000);
        }
    </script>
</body>
</html>
