const database = {
    brasil: [
        { nome: "Flamengo", forca: 85, escudo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg", orcamento: "R$ 1.2 Bi" },
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
