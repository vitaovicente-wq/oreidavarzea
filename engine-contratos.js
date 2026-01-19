Engine.Contratos = {
    enviarBoasVindas: function(game) {
        // Cria a mensagem simples
        if(!game.mensagens) game.mensagens = [];
        game.mensagens.unshift({
            id: Date.now(),
            rodada: 1,
            remetente: "Teste",
            titulo: "Funciona!",
            corpo: "Se você está lendo isso, o arquivo carregou.",
            tipo: "boas_vindas",
            lida: false
        });
        Engine.salvarJogo(game);
        console.log("MENSAGEM DE TESTE CRIADA");
    },
    // Funções vazias para não dar erro
    liberarOfertasPatrocinio: function() {},
    liberarOfertasTV: function() {},
    processarVencimentos: function() {},
    assinarPatrocinio: function() {},
    assinarTV: function() {}
};
