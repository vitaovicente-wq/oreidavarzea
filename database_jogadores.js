const database = {
    brasil: [
        { nome: "Flamengo", forca: 85, escudo: "data:image/png;base64,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", orcamento: "R$ 1.2 Bi" },
        { nome: "Palmeiras", forca: 84, escudo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg", orcamento: "R$ 1 Bi" },
        { nome: "Atlético-MG", forca: 82, escudo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Atl%C3%A9tico_Mineiro_logo.svg", orcamento: "R$ 800 Mi" },
        { nome: "São Paulo", forca: 80, escudo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Sao_Paulo_Futebol_Clube.svg", orcamento: "R$ 600 Mi" },
        { nome: "Corinthians", forca: 79, escudo: "https://upload.wikimedia.org/wikipedia/pt/b/b4/Corinthians_simbolo.png", orcamento: "R$ 700 Mi" },
        { nome: "Fluminense", forca: 78, escudo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fluminense_FC_escudo.png", orcamento: "R$ 400 Mi" },
        { nome: "Grêmio", forca: 78, escudo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Gremio_Logo.svg/1200px-Gremio_Logo.svg.png", orcamento: "R$ 500 Mi" },
        { nome: "Internacional", forca: 78, escudo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg", orcamento: "R$ 450 Mi" },
        { nome: "Botafogo", forca: 81, escudo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Botafogo_de_Futebol_e_Regatas_logo.svg", orcamento: "R$ 900 Mi" },
        { nome: "Vasco", forca: 75, escudo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Vasco_da_Gama_logo.svg", orcamento: "R$ 300 Mi" },
        { nome: "Cruzeiro", forca: 76, escudo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Cruzeiro_Esporte_Clube_%28logo%29.svg", orcamento: "R$ 350 Mi" },
        { nome: "Bahia", forca: 76, escudo: "https://upload.wikimedia.org/wikipedia/pt/2/2c/Esporte_Clube_Bahia_logo.png", orcamento: "R$ 400 Mi" },
        { nome: "Fortaleza", forca: 77, escudo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Fortaleza_Esporte_Clube_logo.svg", orcamento: "R$ 250 Mi" },
        { nome: "Athletico-PR", forca: 77, escudo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Club_Athletico_Paranaense_2019.svg", orcamento: "R$ 300 Mi" }
    ],
    espanha: [
        { nome: "Real Madrid", forca: 92, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png", orcamento: "€ 800 Mi" },
        { nome: "Barcelona", forca: 89, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png", orcamento: "€ 700 Mi" },
        { nome: "Atlético Madrid", forca: 85, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png", orcamento: "€ 400 Mi" },
        { nome: "Sevilla", forca: 80, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png", orcamento: "€ 200 Mi" }
    ],
    inglaterra: [
        { nome: "Man City", forca: 94, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png", orcamento: "£ 900 Mi" },
        { nome: "Liverpool", forca: 90, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png", orcamento: "£ 800 Mi" },
        { nome: "Arsenal", forca: 89, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png", orcamento: "£ 750 Mi" },
        { nome: "Chelsea", forca: 86, escudo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png", orcamento: "£ 600 Mi" }
    ],
    argentina: [
        { nome: "River Plate", forca: 82, escudo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_River_Plate.png", orcamento: "US$ 100 Mi" },
        { nome: "Boca Juniors", forca: 80, escudo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Escudo_del_Club_Atl%C3%A9tico_Boca_Juniors_2012.svg", orcamento: "US$ 90 Mi" },
        { nome: "Racing", forca: 76, escudo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Escudo_de_Racing_Club_2014.svg", orcamento: "US$ 50 Mi" },
        { nome: "Independiente", forca: 75, escudo: "https://upload.wikimedia.org/wikipedia/commons/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg", orcamento: "US$ 40 Mi" }
    ]
};

// Database de jogadores reais (Opcional)
const PlayersDB = {
    "Flamengo": [
        { nome: "Rossi", pos: "GOL", forca: 78 },
        { nome: "Léo Pereira", pos: "ZAG", forca: 80 },
        { nome: "David Luiz", pos: "ZAG", forca: 77 },
        { nome: "Ayrton Lucas", pos: "LE", forca: 79 },
        { nome: "Pulgar", pos: "VOL", forca: 81 },
        { nome: "De La Cruz", pos: "MEI", forca: 85, carac: "Maestro" },
        { nome: "Arrascaeta", pos: "MEI", forca: 87, carac: "Construtor" },
        { nome: "Pedro", pos: "ATA", forca: 86, carac: "Artilheiro" },
        { nome: "Bruno Henrique", pos: "ATA", forca: 82, carac: "Veloz" }
    ]
};
