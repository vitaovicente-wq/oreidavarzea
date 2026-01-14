// database_jogadores.js
// BANCO DE DADOS FINAL 2026 (Séries A, B, C e D)

const database = {
    brasil: {
        // --- SÉRIE A (ELITE 2026) ---
        serieA: [
            {
                id: "botafogo", nome: "Botafogo", escudo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/6086.png&scale=crop&cquality=40&location=origin&w=64&h=64", forca: 86, orcamento: "R$ 950 Mi", destaque: "Luiz Henrique",
                elenco: [
             [
            { nome: "John", pos: "GOL", forca: 81, idade: 30, carac: "Reflexo" },
            { nome: "Gatito Fernández", pos: "GOL", forca: 76, idade: 38, carac: "Liderança" },
            { nome: "Raul", pos: "GOL", forca: 74, idade: 29, carac: "Segurança" },
            { nome: "Vitinho", pos: "LD", forca: 78, idade: 26, carac: "Velocidade" },
            { nome: "Mateo Ponte", pos: "LD", forca: 76, idade: 23, carac: "Cruzamento" },
            { nome: "Bastos", pos: "ZAG", forca: 80, idade: 34, carac: "Antecipação" },
            { nome: "Alexander Barboza", pos: "ZAG", forca: 81, idade: 31, carac: "Liderança" },
            { nome: "Lucas Halter", pos: "ZAG", forca: 77, idade: 26, carac: "Força" },
            { nome: "Jefferson Maciel", pos: "ZAG", forca: 70, idade: 22, carac: "Velocidade" },
            { nome: "Alex Telles", pos: "LE", forca: 82, idade: 33, carac: "Cruzamento" },
            { nome: "Cuiabano", pos: "LE", forca: 79, idade: 23, carac: "Arrancada" },
            { nome: "Hugo", pos: "LE", forca: 75, idade: 24, carac: "Apoio" },
            { nome: "Marçal", pos: "LE", forca: 76, idade: 37, carac: "Defesa" },
            { nome: "Gregore", pos: "VOL", forca: 80, idade: 32, carac: "Desarme" },
            { nome: "Marlon Freitas", pos: "VOL", forca: 81, idade: 31, carac: "Passe" },
            { nome: "Allan", pos: "VOL", forca: 79, idade: 35, carac: "Visão" },
            { nome: "Danilo Barbosa", pos: "VOL", forca: 77, idade: 30, carac: "Infiltração" },
            { nome: "Tchê Tchê", pos: "VOL", forca: 77, idade: 33, carac: "Resistência" },
            { nome: "Kauê", pos: "VOL", forca: 73, idade: 23, carac: "Agilidade" },
            { nome: "Thiago Almada", pos: "MEI", forca: 85, idade: 24, carac: "Drible" },
            { nome: "Eduardo", pos: "MEI", forca: 76, idade: 36, carac: "Finalização" },
            { nome: "Luiz Henrique", pos: "ATA", forca: 86, idade: 25, carac: "Habilidade" },
            { nome: "Savarino", pos: "ATA", forca: 83, idade: 29, carac: "Visão" },
            { nome: "Igor Jesus", pos: "ATA", forca: 83, idade: 25, carac: "Pivô" },
            { nome: "Tiquinho Soares", pos: "ATA", forca: 79, idade: 35, carac: "Finalização" },
            { nome: "Júnior Santos", pos: "ATA", forca: 78, idade: 31, carac: "Explosão" },
            { nome: "Matheus Martins", pos: "ATA", forca: 79, idade: 22, carac: "Agilidade" },
            { nome: "Jeffinho", pos: "ATA", forca: 78, idade: 26, carac: "Drible" },
            { nome: "Matheus Nascimento", pos: "ATA", forca: 74, idade: 22, carac: "Técnica" },
            { nome: "Yarlen", pos: "ATA", forca: 70, idade: 20, carac: "Drible" },
            { nome: "Sapata", pos: "ATA", forca: 69, idade: 23, carac: "Chute" }
              ]
            },
            {
                id: "palmeiras", nome: "Palmeiras", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/2029.png", forca: 85, orcamento: "R$ 1 Bi", destaque: "Estêvão",
                elenco: [
                    { nome: "Weverton", pos: "GOL", forca: 82, idade: 37, carac: "Segurança" },
                    { nome: "Rocha", pos: "LD", forca: 75, idade: 36, carac: "Liderança" },
                    { nome: "Gustavo Gómez", pos: "ZAG", forca: 83, idade: 32, carac: "Liderança" },
                    { nome: "Murilo", pos: "ZAG", forca: 81, idade: 28, carac: "Força" },
                    { nome: "Piquerez", pos: "LE", forca: 80, idade: 26, carac: "Chute" },
                    { nome: "Aníbal Moreno", pos: "VOL", forca: 80, idade: 26, carac: "Desarme" },
                    { nome: "Zé Rafael", pos: "VOL", forca: 78, idade: 32, carac: "Raça" },
                    { nome: "Veiga", pos: "MEI", forca: 83, idade: 30, carac: "Decisão" },
                    { nome: "Felipe Anderson", pos: "ATA", forca: 81, idade: 32, carac: "Técnica" },
                    { nome: "Estêvão", pos: "ATA", forca: 84, idade: 18, carac: "Velocidade" },
                    { nome: "Flaco López", pos: "ATA", forca: 80, idade: 24, carac: "Cabeceio" },
                    { nome: "Maurício", pos: "MEI", forca: 79, idade: 24, carac: "Passe" },
                    { nome: "Dudu", pos: "ATA", forca: 79, idade: 33, carac: "Drible" },
                    { nome: "Rony", pos: "ATA", forca: 77, idade: 30, carac: "Rústico" }
                ]
            },
            {
                id: "flamengo", nome: "Flamengo", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/600.png", forca: 86, orcamento: "R$ 1.1 Bi", destaque: "Pedro",
                elenco: [
                    { nome: "Rossi", pos: "GOL", forca: 80, idade: 29, carac: "Reflexo" },
                    { nome: "Wesley", pos: "LD", forca: 77, idade: 21, carac: "Arrancada" },
                    { nome: "Léo Ortiz", pos: "ZAG", forca: 82, idade: 29, carac: "Passe" },
                    { nome: "Léo Pereira", pos: "ZAG", forca: 81, idade: 29, carac: "Desarme" },
                    { nome: "Ayrton Lucas", pos: "LE", forca: 79, idade: 28, carac: "Velocidade" },
                    { nome: "Pulgar", pos: "VOL", forca: 79, idade: 31, carac: "Marcação" },
                    { nome: "De La Cruz", pos: "MEI", forca: 85, idade: 28, carac: "Dinâmica" },
                    { nome: "Arrascaeta", pos: "MEI", forca: 86, idade: 31, carac: "Mágica" },
                    { nome: "Gerson", pos: "MEI", forca: 84, idade: 28, carac: "Controle" },
                    { nome: "Bruno Henrique", pos: "ATA", forca: 80, idade: 34, carac: "Velocidade" },
                    { nome: "Pedro", pos: "ATA", forca: 87, idade: 28, carac: "Finalização" },
                    { nome: "Alcaraz", pos: "MEI", forca: 79, idade: 22, carac: "Chute" },
                    { nome: "Gabigol", pos: "ATA", forca: 80, idade: 29, carac: "Decisão" },
                    { nome: "Michael", pos: "ATA", forca: 78, idade: 29, carac: "Drible" }
                ]
            },
            {
                id: "fortaleza", nome: "Fortaleza", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6271.png", forca: 82, orcamento: "R$ 450 Mi", destaque: "Lucero",
                elenco: [
                    { nome: "João Ricardo", pos: "GOL", forca: 80, idade: 36, carac: "Segurança" },
                    { nome: "Tinga", pos: "LD", forca: 77, idade: 31, carac: "Liderança" },
                    { nome: "Kuscevic", pos: "ZAG", forca: 77, idade: 29, carac: "Força" },
                    { nome: "Cardona", pos: "ZAG", forca: 76, idade: 26, carac: "Velocidade" },
                    { nome: "Bruno Pacheco", pos: "LE", forca: 76, idade: 33, carac: "Apoio" },
                    { nome: "Hércules", pos: "VOL", forca: 79, idade: 24, carac: "Força" },
                    { nome: "Pochettino", pos: "MEI", forca: 79, idade: 29, carac: "Passe" },
                    { nome: "Marinho", pos: "ATA", forca: 77, idade: 35, carac: "Potência" },
                    { nome: "Moisés", pos: "ATA", forca: 77, idade: 28, carac: "Arrancada" },
                    { nome: "Lucero", pos: "ATA", forca: 82, idade: 33, carac: "Finalização" },
                    { nome: "Yago Pikachu", pos: "ATA", forca: 78, idade: 33, carac: "Chute" }
                ]
            },
            {
                id: "internacional", nome: "Internacional", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/1966.png", forca: 83, orcamento: "R$ 600 Mi", destaque: "Alan Patrick",
                elenco: [
                    { nome: "Rochet", pos: "GOL", forca: 81, idade: 32, carac: "Liderança" },
                    { nome: "Bruno Gomes", pos: "LD", forca: 75, idade: 23, carac: "Resistência" },
                    { nome: "Vitão", pos: "ZAG", forca: 78, idade: 25, carac: "Técnica" },
                    { nome: "Mercado", pos: "ZAG", forca: 76, idade: 38, carac: "Experiência" },
                    { nome: "Bernabei", pos: "LE", forca: 78, idade: 24, carac: "Apoio" },
                    { nome: "Fernando", pos: "VOL", forca: 79, idade: 37, carac: "Posicionamento" },
                    { nome: "Thiago Maia", pos: "VOL", forca: 77, idade: 28, carac: "Passe" },
                    { nome: "Alan Patrick", pos: "MEI", forca: 83, idade: 34, carac: "Maestro" },
                    { nome: "Wesley", pos: "ATA", forca: 79, idade: 26, carac: "Drible" },
                    { nome: "Borré", pos: "ATA", forca: 81, idade: 29, carac: "Raça" },
                    { nome: "Valencia", pos: "ATA", forca: 80, idade: 35, carac: "Finalização" }
                ]
            },
            {
                id: "saopaulo", nome: "São Paulo", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/2026.png", forca: 81, orcamento: "R$ 550 Mi", destaque: "Lucas Moura",
                elenco: [
                    { nome: "Rafael", pos: "GOL", forca: 79, idade: 35, carac: "Segurança" },
                    { nome: "Rafinha", pos: "LD", forca: 74, idade: 39, carac: "Liderança" },
                    { nome: "Arboleda", pos: "ZAG", forca: 81, idade: 33, carac: "Desarme" },
                    { nome: "Alan Franco", pos: "ZAG", forca: 79, idade: 28, carac: "Raça" },
                    { nome: "Welington", pos: "LE", forca: 76, idade: 24, carac: "Velocidade" },
                    { nome: "Luiz Gustavo", pos: "VOL", forca: 77, idade: 37, carac: "Posicionamento" },
                    { nome: "Bobadilla", pos: "VOL", forca: 76, idade: 24, carac: "Chute" },
                    { nome: "Lucas Moura", pos: "MEI", forca: 84, idade: 32, carac: "Arrancada" },
                    { nome: "Luciano", pos: "ATA", forca: 80, idade: 32, carac: "Finalização" },
                    { nome: "Ferreirinha", pos: "ATA", forca: 78, idade: 27, carac: "Drible" },
                    { nome: "Calleri", pos: "ATA", forca: 82, idade: 31, carac: "Brigador" },
                    { nome: "Alisson", pos: "VOL", forca: 77, idade: 31, carac: "Motor" }
                ]
            },
            {
                id: "corinthians", nome: "Corinthians", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/874.png", forca: 80, orcamento: "R$ 750 Mi", destaque: "Memphis Depay",
                elenco: [
                    { nome: "Hugo Souza", pos: "GOL", forca: 79, idade: 26, carac: "Reflexo" },
                    { nome: "Fagner", pos: "LD", forca: 74, idade: 36, carac: "Cruzamento" },
                    { nome: "André Ramalho", pos: "ZAG", forca: 80, idade: 33, carac: "Liderança" },
                    { nome: "Gustavo Henrique", pos: "ZAG", forca: 75, idade: 32, carac: "Cabeceio" },
                    { nome: "Matheus Bidu", pos: "LE", forca: 75, idade: 26, carac: "Chute" },
                    { nome: "José Martínez", pos: "VOL", forca: 77, idade: 30, carac: "Marcação" },
                    { nome: "Alex Santana", pos: "VOL", forca: 76, idade: 30, carac: "Força" },
                    { nome: "Rodrigo Garro", pos: "MEI", forca: 84, idade: 27, carac: "Mágica" },
                    { nome: "Carrillo", pos: "MEI", forca: 78, idade: 34, carac: "Drible" },
                    { nome: "Memphis Depay", pos: "ATA", forca: 86, idade: 31, carac: "Craque" },
                    { nome: "Yuri Alberto", pos: "ATA", forca: 81, idade: 24, carac: "Finalização" },
                    { nome: "Talles Magno", pos: "ATA", forca: 77, idade: 23, carac: "Drible" },
                    { nome: "Romero", pos: "ATA", forca: 76, idade: 32, carac: "Raça" }
                ]
            },
            {
                id: "bahia", nome: "Bahia", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/1046.png", forca: 79, orcamento: "R$ 700 Mi", destaque: "Everton Ribeiro",
                elenco: [
                    { nome: "Marcos Felipe", pos: "GOL", forca: 77, idade: 29, carac: "Reflexo" },
                    { nome: "Santiago Arias", pos: "LD", forca: 79, idade: 33, carac: "Apoio" },
                    { nome: "Gabriel Xavier", pos: "ZAG", forca: 77, idade: 24, carac: "Velocidade" },
                    { nome: "Kanu", pos: "ZAG", forca: 75, idade: 28, carac: "Liderança" },
                    { nome: "Luciano Juba", pos: "LE", forca: 76, idade: 25, carac: "Chute" },
                    { nome: "Caio Alexandre", pos: "VOL", forca: 78, idade: 26, carac: "Passe" },
                    { nome: "Jean Lucas", pos: "VOL", forca: 77, idade: 27, carac: "Dinâmica" },
                    { nome: "Cauly", pos: "MEI", forca: 80, idade: 29, carac: "Drible" },
                    { nome: "Everton Ribeiro", pos: "MEI", forca: 82, idade: 36, carac: "Maestro" },
                    { nome: "Thaciano", pos: "ATA", forca: 77, idade: 30, carac: "Polivalente" },
                    { nome: "Lucho Rodríguez", pos: "ATA", forca: 77, idade: 22, carac: "Chute" },
                    { nome: "Biel", pos: "ATA", forca: 76, idade: 24, carac: "Velocidade" }
                ]
            },
            {
                id: "cruzeiro", nome: "Cruzeiro", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/2030.png", forca: 80, orcamento: "R$ 650 Mi", destaque: "Matheus Pereira",
                elenco: [
                    { nome: "Cássio", pos: "GOL", forca: 80, idade: 38, carac: "Segurança" },
                    { nome: "William", pos: "LD", forca: 81, idade: 30, carac: "Cruzamento" },
                    { nome: "Zé Ivaldo", pos: "ZAG", forca: 77, idade: 28, carac: "Força" },
                    { nome: "João Marcelo", pos: "ZAG", forca: 76, idade: 24, carac: "Velocidade" },
                    { nome: "Marlon", pos: "LE", forca: 78, idade: 28, carac: "Apoio" },
                    { nome: "Lucas Romero", pos: "VOL", forca: 76, idade: 30, carac: "Raça" },
                    { nome: "Walace", pos: "VOL", forca: 77, idade: 30, carac: "Força" },
                    { nome: "Matheus Henrique", pos: "VOL", forca: 79, idade: 27, carac: "Dinâmica" },
                    { nome: "Matheus Pereira", pos: "MEI", forca: 84, idade: 29, carac: "Mágica" },
                    { nome: "Kaio Jorge", pos: "ATA", forca: 77, idade: 23, carac: "Finalização" },
                    { nome: "Gabriel Veron", pos: "ATA", forca: 76, idade: 22, carac: "Explosão" }
                ]
            },
            {
                id: "vasco", nome: "Vasco", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3454.png", forca: 77, orcamento: "R$ 450 Mi", destaque: "Coutinho",
                elenco: [
                    { nome: "Léo Jardim", pos: "GOL", forca: 80, idade: 30, carac: "Milagreiro" },
                    { nome: "Paulo Henrique", pos: "LD", forca: 75, idade: 28, carac: "Velocidade" },
                    { nome: "João Victor", pos: "ZAG", forca: 77, idade: 26, carac: "Velocidade" },
                    { nome: "Léo", pos: "ZAG", forca: 73, idade: 29, carac: "Passe" },
                    { nome: "Lucas Piton", pos: "LE", forca: 78, idade: 24, carac: "Cruzamento" },
                    { nome: "Hugo Moura", pos: "VOL", forca: 75, idade: 27, carac: "Marcação" },
                    { nome: "Mateus Carvalho", pos: "VOL", forca: 74, idade: 23, carac: "Raça" },
                    { nome: "Payet", pos: "MEI", forca: 80, idade: 38, carac: "Técnica" },
                    { nome: "Philippe Coutinho", pos: "MEI", forca: 81, idade: 33, carac: "Visão" },
                    { nome: "Vegetti", pos: "ATA", forca: 81, idade: 36, carac: "Cabeceio" },
                    { nome: "Adson", pos: "ATA", forca: 75, idade: 24, carac: "Drible" },
                    { nome: "Emerson R.", pos: "ATA", forca: 74, idade: 24, carac: "Velocidade" }
                ]
            },
            {
                id: "atleticomg", nome: "Atlético-MG", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/1045.png", forca: 82, orcamento: "R$ 700 Mi", destaque: "Hulk",
                elenco: [
                    { nome: "Everson", pos: "GOL", forca: 79, idade: 34, carac: "Reflexo" },
                    { nome: "Saravia", pos: "LD", forca: 75, idade: 32, carac: "Velocidade" },
                    { nome: "Battaglia", pos: "ZAG", forca: 79, idade: 33, carac: "Desarme" },
                    { nome: "Junior Alonso", pos: "ZAG", forca: 80, idade: 32, carac: "Passe" },
                    { nome: "Guilherme Arana", pos: "LE", forca: 82, idade: 28, carac: "Apoio" },
                    { nome: "Otávio", pos: "VOL", forca: 78, idade: 31, carac: "Marcação" },
                    { nome: "Gustavo Scarpa", pos: "MEI", forca: 82, idade: 31, carac: "Chute" },
                    { nome: "Bernard", pos: "MEI", forca: 76, idade: 32, carac: "Drible" },
                    { nome: "Paulinho", pos: "ATA", forca: 81, idade: 24, carac: "Movimentação" },
                    { nome: "Hulk", pos: "ATA", forca: 84, idade: 38, carac: "Força" },
                    { nome: "Deyverson", pos: "ATA", forca: 77, idade: 34, carac: "Decisivo" }
                ]
            },
            {
                id: "fluminense", nome: "Fluminense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/1961.png", forca: 79, orcamento: "R$ 500 Mi", destaque: "Thiago Silva",
                elenco: [
                    { nome: "Fábio", pos: "GOL", forca: 78, idade: 44, carac: "Experiência" },
                    { nome: "Samuel Xavier", pos: "LD", forca: 74, idade: 35, carac: "Apoio" },
                    { nome: "Thiago Silva", pos: "ZAG", forca: 84, idade: 40, carac: "Liderança" },
                    { nome: "Ignácio", pos: "ZAG", forca: 75, idade: 28, carac: "Velocidade" },
                    { nome: "Diogo Barbosa", pos: "LE", forca: 73, idade: 32, carac: "Apoio" },
                    { nome: "Facundo Bernal", pos: "VOL", forca: 77, idade: 21, carac: "Passe" },
                    { nome: "Martinelli", pos: "VOL", forca: 76, idade: 23, carac: "Resistência" },
                    { nome: "Ganso", pos: "MEI", forca: 80, idade: 35, carac: "Visão" },
                    { nome: "Jhon Arias", pos: "MEI", forca: 83, idade: 27, carac: "Drible" },
                    { nome: "Kevin Serna", pos: "ATA", forca: 77, idade: 27, carac: "Velocidade" },
                    { nome: "Cano", pos: "ATA", forca: 79, idade: 37, carac: "Finalização" },
                    { nome: "Kauã Elias", pos: "ATA", forca: 76, idade: 19, carac: "Promessa" }
                ]
            },
            {
                id: "gremio", nome: "Grêmio", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6273.png", forca: 78, orcamento: "R$ 550 Mi", destaque: "Soteldo",
                elenco: [
                    { nome: "Marchesín", pos: "GOL", forca: 77, idade: 37, carac: "Reflexo" },
                    { nome: "João Pedro", pos: "LD", forca: 75, idade: 28, carac: "Apoio" },
                    { nome: "Kannemann", pos: "ZAG", forca: 77, idade: 34, carac: "Raça" },
                    { nome: "Jemerson", pos: "ZAG", forca: 76, idade: 32, carac: "Velocidade" },
                    { nome: "Reinaldo", pos: "LE", forca: 75, idade: 35, carac: "Chute" },
                    { nome: "Villasanti", pos: "VOL", forca: 80, idade: 28, carac: "Motor" },
                    { nome: "Pepê", pos: "VOL", forca: 75, idade: 27, carac: "Passe" },
                    { nome: "Cristaldo", pos: "MEI", forca: 79, idade: 28, carac: "Passe" },
                    { nome: "Monsalve", pos: "MEI", forca: 77, idade: 21, carac: "Técnica" },
                    { nome: "Soteldo", pos: "ATA", forca: 80, idade: 28, carac: "Drible" },
                    { nome: "Braithwaite", pos: "ATA", forca: 81, idade: 34, carac: "Inteligência" }
                ]
            },
            {
                id: "santos", nome: "Santos", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/2063.png", forca: 81, orcamento: "R$ 600 Mi", destaque: "Neymar Jr",
                elenco: [
                    { nome: "João Paulo", pos: "GOL", forca: 78, idade: 29, carac: "Reflexo" },
                    { nome: "JP Chermont", pos: "LD", forca: 75, idade: 19, carac: "Promessa" },
                    { nome: "Gil", pos: "ZAG", forca: 76, idade: 37, carac: "Experiência" },
                    { nome: "Jair", pos: "ZAG", forca: 76, idade: 20, carac: "Velocidade" },
                    { nome: "Escobar", pos: "LE", forca: 74, idade: 28, carac: "Apoio" },
                    { nome: "João Schmidt", pos: "VOL", forca: 77, idade: 31, carac: "Passe" },
                    { nome: "Diego Pituca", pos: "VOL", forca: 77, idade: 32, carac: "Liderança" },
                    { nome: "Giuliano", pos: "MEI", forca: 77, idade: 34, carac: "Técnica" },
                    { nome: "Otero", pos: "MEI", forca: 75, idade: 32, carac: "Chute" },
                    { nome: "Neymar Jr", pos: "MEI", forca: 88, idade: 34, carac: "Gênio" },
                    { nome: "Guilherme", pos: "ATA", forca: 77, idade: 29, carac: "Drible" },
                    { nome: "Wendel Silva", pos: "ATA", forca: 75, idade: 24, carac: "Força" }
                ]
            },
            {
                id: "bragantino", nome: "Bragantino", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10003.png", forca: 76, orcamento: "R$ 350 Mi", destaque: "Cleiton",
                elenco: [
                    { nome: "Cleiton", pos: "GOL", forca: 79, idade: 27, carac: "Reflexo" },
                    { nome: "Hurtado", pos: "LD", forca: 74, idade: 23, carac: "Apoio" },
                    { nome: "Pedro Henrique", pos: "ZAG", forca: 75, idade: 29, carac: "Força" },
                    { nome: "Luan Cândido", pos: "ZAG", forca: 76, idade: 24, carac: "Chute" },
                    { nome: "Juninho Capixaba", pos: "LE", forca: 77, idade: 27, carac: "Velocidade" },
                    { nome: "Jadsom", pos: "VOL", forca: 76, idade: 23, carac: "Passe" },
                    { nome: "Lucas Evangelista", pos: "MEI", forca: 78, idade: 29, carac: "Dinâmica" },
                    { nome: "Lincoln", pos: "MEI", forca: 74, idade: 26, carac: "Técnica" },
                    { nome: "Mosquera", pos: "ATA", forca: 76, idade: 23, carac: "Drible" },
                    { nome: "Eduardo Sasha", pos: "ATA", forca: 77, idade: 33, carac: "Finalização" },
                    { nome: "Borbas", pos: "ATA", forca: 76, idade: 22, carac: "Raça" }
                ]
            },
            {
                id: "vitoria", nome: "Vitória", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3456.png", forca: 74, orcamento: "R$ 150 Mi", destaque: "Matheuzinho",
                elenco: [
                    { nome: "Lucas Arcanjo", pos: "GOL", forca: 76, idade: 26, carac: "Reflexo" },
                    { nome: "Cáceres", pos: "LD", forca: 72, idade: 29, carac: "Marcação" },
                    { nome: "Wagner Leonardo", pos: "ZAG", forca: 76, idade: 25, carac: "Liderança" },
                    { nome: "Neris", pos: "ZAG", forca: 71, idade: 33, carac: "Força" },
                    { nome: "Lucas Esteves", pos: "LE", forca: 74, idade: 25, carac: "Velocidade" },
                    { nome: "Willian Oliveira", pos: "VOL", forca: 74, idade: 32, carac: "Cabeceio" },
                    { nome: "Luan", pos: "VOL", forca: 73, idade: 26, carac: "Passe" },
                    { nome: "Matheuzinho", pos: "MEI", forca: 77, idade: 27, carac: "Drible" },
                    { nome: "Osvaldo", pos: "ATA", forca: 74, idade: 38, carac: "Cruzamento" },
                    { nome: "Janderson", pos: "ATA", forca: 73, idade: 26, carac: "Velocidade" },
                    { nome: "Alerrandro", pos: "ATA", forca: 75, idade: 25, carac: "Finalização" }
                ]
            },
            {
                id: "juventude", nome: "Juventude", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3452.png", forca: 73, orcamento: "R$ 120 Mi", destaque: "Nenê",
                elenco: [
                    { nome: "Gabriel", pos: "GOL", forca: 75, idade: 32, carac: "Reflexo" },
                    { nome: "João Lucas", pos: "LD", forca: 73, idade: 27, carac: "Velocidade" },
                    { nome: "Danilo Boza", pos: "ZAG", forca: 73, idade: 27, carac: "Força" },
                    { nome: "Zé Marcos", pos: "ZAG", forca: 72, idade: 27, carac: "Marcação" },
                    { nome: "Alan Ruschel", pos: "LE", forca: 74, idade: 35, carac: "Liderança" },
                    { nome: "Jadson", pos: "VOL", forca: 74, idade: 31, carac: "Resistência" },
                    { nome: "Jean Carlos", pos: "MEI", forca: 75, idade: 33, carac: "Chute" },
                    { nome: "Nenê", pos: "MEI", forca: 74, idade: 44, carac: "Bola Parada" },
                    { nome: "Lucas Barbosa", pos: "ATA", forca: 74, idade: 24, carac: "Cabeceio" },
                    { nome: "Gilberto", pos: "ATA", forca: 72, idade: 36, carac: "Finalização" }
                ]
            },
            {
                id: "mirassol", nome: "Mirassol", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/19001.png", forca: 73, orcamento: "R$ 100 Mi", destaque: "Muralha",
                elenco: [
                    { nome: "Alex Muralha", pos: "GOL", forca: 74, idade: 35, carac: "Experiência" },
                    { nome: "Lucas Ramon", pos: "LD", forca: 71, idade: 31, carac: "Apoio" },
                    { nome: "João Victor", pos: "ZAG", forca: 73, idade: 27, carac: "Força" },
                    { nome: "Luiz Otávio", pos: "ZAG", forca: 72, idade: 32, carac: "Liderança" },
                    { nome: "Zeca", pos: "LE", forca: 73, idade: 30, carac: "Cruzamento" },
                    { nome: "Neto Moura", pos: "VOL", forca: 74, idade: 28, carac: "Passe" },
                    { nome: "Danielzinho", pos: "VOL", forca: 73, idade: 30, carac: "Dinâmica" },
                    { nome: "Gabriel", pos: "MEI", forca: 74, idade: 35, carac: "Técnica" },
                    { nome: "Chico Kim", pos: "MEI", forca: 73, idade: 34, carac: "Drible" },
                    { nome: "Fernandinho", pos: "ATA", forca: 72, idade: 28, carac: "Velocidade" },
                    { nome: "Dellatorre", pos: "ATA", forca: 76, idade: 33, carac: "Finalização" }
                ]
            },
            {
                id: "sport", nome: "Sport", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6006.png", forca: 75, orcamento: "R$ 150 Mi", destaque: "Lucas Lima",
                elenco: [
                    { nome: "Caíque França", pos: "GOL", forca: 75, idade: 29, carac: "Segurança" },
                    { nome: "Pedro Lima", pos: "LD", forca: 74, idade: 19, carac: "Promessa" },
                    { nome: "Luciano Castán", pos: "ZAG", forca: 74, idade: 35, carac: "Liderança" },
                    { nome: "Chico", pos: "ZAG", forca: 73, idade: 26, carac: "Força" },
                    { nome: "Felipinho", pos: "LE", forca: 72, idade: 27, carac: "Apoio" },
                    { nome: "Felipe", pos: "VOL", forca: 74, idade: 30, carac: "Marcação" },
                    { nome: "Fabrício Domínguez", pos: "VOL", forca: 75, idade: 27, carac: "Dinâmica" },
                    { nome: "Lucas Lima", pos: "MEI", forca: 77, idade: 34, carac: "Passe" },
                    { nome: "Tití Ortiz", pos: "MEI", forca: 74, idade: 30, carac: "Chute" },
                    { nome: "Barletta", pos: "ATA", forca: 74, idade: 23, carac: "Velocidade" },
                    { nome: "Gustavo Coutinho", pos: "ATA", forca: 75, idade: 26, carac: "Finalização" }
                ]
            },
            {
                id: "ceara", nome: "Ceará", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6272.png", forca: 75, orcamento: "R$ 130 Mi", destaque: "Erick Pulga",
                elenco: [
                    { nome: "Richard", pos: "GOL", forca: 74, idade: 33, carac: "Reflexo" },
                    { nome: "Raí Ramos", pos: "LD", forca: 72, idade: 30, carac: "Força" },
                    { nome: "David Ricardo", pos: "ZAG", forca: 74, idade: 22, carac: "Velocidade" },
                    { nome: "Matheus Felipe", pos: "ZAG", forca: 73, idade: 26, carac: "Impulsão" },
                    { nome: "Matheus Bahia", pos: "LE", forca: 73, idade: 25, carac: "Apoio" },
                    { nome: "Richardson", pos: "VOL", forca: 74, idade: 33, carac: "Marcação" },
                    { nome: "Lourenço", pos: "MEI", forca: 75, idade: 27, carac: "Chute" },
                    { nome: "Lucas Mugni", pos: "MEI", forca: 74, idade: 33, carac: "Passe" },
                    { nome: "Erick Pulga", pos: "ATA", forca: 78, idade: 24, carac: "Drible" },
                    { nome: "Saulo Mineiro", pos: "ATA", forca: 75, idade: 27, carac: "Velocidade" },
                    { nome: "Aylon", pos: "ATA", forca: 74, idade: 32, carac: "Movimentação" }
                ]
            }
        ],

        // --- SÉRIE B (ACESSO 2026) ---
        serieB: [
            {
                id: "athleticopr", nome: "Athletico-PR", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/1967.png", forca: 77, orcamento: "R$ 300 Mi", destaque: "Fernandinho",
                elenco: [
                    { nome: "Mycael", pos: "GOL", forca: 75, idade: 21, carac: "Reflexo" },
                    { nome: "Léo Linck", pos: "GOL", forca: 73, idade: 24, carac: "Altura" },
                    { nome: "Cuello", pos: "LD", forca: 75, idade: 25, carac: "Raça" },
                    { nome: "Thiago Heleno", pos: "ZAG", forca: 76, idade: 36, carac: "Força" },
                    { nome: "Gamarra", pos: "ZAG", forca: 74, idade: 24, carac: "Antecipação" },
                    { nome: "Esquivel", pos: "LE", forca: 75, idade: 29, carac: "Marcação" },
                    { nome: "Gabriel", pos: "VOL", forca: 75, idade: 32, carac: "Raça" },
                    { nome: "Fernandinho", pos: "VOL", forca: 79, idade: 40, carac: "Experiência" },
                    { nome: "Erick", pos: "VOL", forca: 76, idade: 28, carac: "Passe" },
                    { nome: "Zapelli", pos: "MEI", forca: 77, idade: 22, carac: "Drible" },
                    { nome: "Nikão", pos: "MEI", forca: 75, idade: 32, carac: "Chute" },
                    { nome: "Canobbio", pos: "ATA", forca: 78, idade: 26, carac: "Velocidade" },
                    { nome: "Mastriani", pos: "ATA", forca: 77, idade: 31, carac: "Cabeceio" },
                    { nome: "Pablo", pos: "ATA", forca: 74, idade: 32, carac: "Finalização" }
                ]
            },
            {
                id: "criciuma", nome: "Criciúma", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6274.png", forca: 73, orcamento: "R$ 80 Mi", destaque: "Bolasie",
                elenco: [
                    { nome: "Gustavo", pos: "GOL", forca: 74, idade: 32, carac: "Segurança" },
                    { nome: "Claudinho", pos: "LD", forca: 71, idade: 24, carac: "Apoio" },
                    { nome: "Rodrigo", pos: "ZAG", forca: 73, idade: 33, carac: "Liderança" },
                    { nome: "Wilker Ángel", pos: "ZAG", forca: 72, idade: 31, carac: "Força" },
                    { nome: "Marcelo Hermes", pos: "LE", forca: 73, idade: 30, carac: "Chute" },
                    { nome: "Barreto", pos: "VOL", forca: 72, idade: 29, carac: "Marcação" },
                    { nome: "Newton", pos: "VOL", forca: 73, idade: 25, carac: "Força" },
                    { nome: "Fellipe Mateus", pos: "MEI", forca: 74, idade: 34, carac: "Passe" },
                    { nome: "Matheusinho", pos: "MEI", forca: 73, idade: 27, carac: "Drible" },
                    { nome: "Bolasie", pos: "ATA", forca: 76, idade: 35, carac: "Drible" },
                    { nome: "Felipe Vizeu", pos: "ATA", forca: 72, idade: 28, carac: "Finalização" }
                ]
            },
            {
                id: "atleticogo", nome: "Atlético-GO", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/1044.png", forca: 72, orcamento: "R$ 70 Mi", destaque: "Luiz Fernando",
                elenco: [
                    { nome: "Ronaldo", pos: "GOL", forca: 74, idade: 28, carac: "Reflexo" },
                    { nome: "Maguinho", pos: "LD", forca: 71, idade: 33, carac: "Raça" },
                    { nome: "Adriano Martins", pos: "ZAG", forca: 72, idade: 27, carac: "Força" },
                    { nome: "Alix Vinicius", pos: "ZAG", forca: 74, idade: 25, carac: "Velocidade" },
                    { nome: "Guilherme Romão", pos: "LE", forca: 73, idade: 27, carac: "Apoio" },
                    { nome: "Baralhas", pos: "VOL", forca: 73, idade: 26, carac: "Marcação" },
                    { nome: "Rhaldney", pos: "VOL", forca: 72, idade: 26, carac: "Dinâmica" },
                    { nome: "Shaylon", pos: "MEI", forca: 75, idade: 27, carac: "Passe" },
                    { nome: "Luiz Fernando", pos: "ATA", forca: 76, idade: 28, carac: "Finalização" },
                    { nome: "Janderson", pos: "ATA", forca: 72, idade: 26, carac: "Velocidade" }
                ]
            },
            {
                id: "cuiaba", nome: "Cuiabá", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/19000.png", forca: 73, orcamento: "R$ 90 Mi", destaque: "Pitta",
                elenco: [
                    { nome: "Walter", pos: "GOL", forca: 77, idade: 37, carac: "Posicionamento" },
                    { nome: "Matheus Alexandre", pos: "LD", forca: 72, idade: 25, carac: "Velocidade" },
                    { nome: "Marllon", pos: "ZAG", forca: 73, idade: 32, carac: "Liderança" },
                    { nome: "Alan Empereur", pos: "ZAG", forca: 74, idade: 30, carac: "Técnica" },
                    { nome: "Ramon", pos: "LE", forca: 71, idade: 24, carac: "Apoio" },
                    { nome: "Lucas Mineiro", pos: "VOL", forca: 72, idade: 28, carac: "Força" },
                    { nome: "Denilson", pos: "VOL", forca: 74, idade: 23, carac: "Marcação" },
                    { nome: "Max", pos: "MEI", forca: 73, idade: 24, carac: "Chute" },
                    { nome: "Clayson", pos: "ATA", forca: 74, idade: 29, carac: "Drible" },
                    { nome: "Derik Lacerda", pos: "ATA", forca: 73, idade: 25, carac: "Velocidade" },
                    { nome: "Isidro Pitta", pos: "ATA", forca: 76, idade: 25, carac: "Raça" }
                ]
            },
            {
                id: "goias", nome: "Goiás", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3453.png", forca: 74, orcamento: "R$ 60 Mi", destaque: "Tadeu",
                elenco: [
                    { nome: "Tadeu", pos: "GOL", forca: 77, idade: 33, carac: "Milagreiro" },
                    { nome: "Diego", pos: "LD", forca: 71, idade: 25, carac: "Defesa" },
                    { nome: "Messias", pos: "ZAG", forca: 73, idade: 30, carac: "Cabeceio" },
                    { nome: "Lucas Ribeiro", pos: "ZAG", forca: 72, idade: 26, carac: "Força" },
                    { nome: "Sander", pos: "LE", forca: 73, idade: 34, carac: "Cruzamento" },
                    { nome: "Marcão", pos: "VOL", forca: 72, idade: 34, carac: "Força" },
                    { nome: "Rafael Gava", pos: "MEI", forca: 73, idade: 31, carac: "Passe" },
                    { nome: "Galhardo", pos: "MEI", forca: 75, idade: 33, carac: "Finalização" },
                    { nome: "Paulo Baya", pos: "ATA", forca: 73, idade: 25, carac: "Chute" },
                    { nome: "Edu", pos: "ATA", forca: 72, idade: 32, carac: "Finalização" }
                ]
            },
            {
                id: "coritiba", nome: "Coritiba", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3451.png", forca: 73, orcamento: "R$ 65 Mi", destaque: "Robson",
                elenco: [
                    { nome: "Gabriel", pos: "GOL", forca: 73, idade: 32, carac: "Segurança" },
                    { nome: "Natanael", pos: "LD", forca: 73, idade: 23, carac: "Velocidade" },
                    { nome: "Benevenuto", pos: "ZAG", forca: 72, idade: 29, carac: "Força" },
                    { nome: "Bruno Melo", pos: "ZAG", forca: 71, idade: 32, carac: "Bola Aérea" },
                    { nome: "Jamerson", pos: "LE", forca: 73, idade: 26, carac: "Apoio" },
                    { nome: "Sebastián Gómez", pos: "VOL", forca: 75, idade: 28, carac: "Passe" },
                    { nome: "Matheus Frizzo", pos: "MEI", forca: 74, idade: 26, carac: "Chute" },
                    { nome: "Robson", pos: "ATA", forca: 76, idade: 33, carac: "Raça" },
                    { nome: "Figueiredo", pos: "ATA", forca: 72, idade: 23, carac: "Chute" },
                    { nome: "Leandro Damião", pos: "ATA", forca: 72, idade: 35, carac: "Pivô" }
                ]
            },
            {
                id: "americamg", nome: "América-MG", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/2025.png", forca: 73, orcamento: "R$ 55 Mi", destaque: "Juninho",
                elenco: [
                    { nome: "Elias", pos: "GOL", forca: 71, idade: 29, carac: "Reflexo" },
                    { nome: "Mateus Henrique", pos: "LD", forca: 71, idade: 22, carac: "Apoio" },
                    { nome: "Éder", pos: "ZAG", forca: 73, idade: 30, carac: "Liderança" },
                    { nome: "Ricardo Silva", pos: "ZAG", forca: 72, idade: 32, carac: "Força" },
                    { nome: "Marlon", pos: "LE", forca: 72, idade: 31, carac: "Cruzamento" },
                    { nome: "Juninho", pos: "VOL", forca: 76, idade: 37, carac: "Motor" },
                    { nome: "Alê", pos: "MEI", forca: 74, idade: 34, carac: "Passe" },
                    { nome: "Benítez", pos: "MEI", forca: 75, idade: 30, carac: "Visão" },
                    { nome: "Moisés", pos: "MEI", forca: 73, idade: 37, carac: "Passe" },
                    { nome: "Renato Marques", pos: "ATA", forca: 73, idade: 21, carac: "Finalização" }
                ]
            },
            {
                id: "avai", nome: "Avaí", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3455.png", forca: 71, orcamento: "R$ 40 Mi", destaque: "Vagner Love",
                elenco: [
                    { nome: "César", pos: "GOL", forca: 72, idade: 29, carac: "Segurança" },
                    { nome: "Marcos Vinícius", pos: "LD", forca: 70, idade: 27, carac: "Apoio" },
                    { nome: "Tiago Pagnussat", pos: "ZAG", forca: 71, idade: 34, carac: "Força" },
                    { nome: "Vilar", pos: "ZAG", forca: 70, idade: 24, carac: "Velocidade" },
                    { nome: "Mário Sérgio", pos: "LE", forca: 71, idade: 30, carac: "Cruzamento" },
                    { nome: "Judson", pos: "VOL", forca: 72, idade: 31, carac: "Marcação" },
                    { nome: "Giovanni", pos: "MEI", forca: 73, idade: 30, carac: "Técnica" },
                    { nome: "Hygor", pos: "ATA", forca: 71, idade: 32, carac: "Velocidade" },
                    { nome: "Vagner Love", pos: "ATA", forca: 72, idade: 40, carac: "Finalização" }
                ]
            },
            { id: "vilanova", nome: "Vila Nova", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10006.png", forca: 71, elenco: [{nome:"Dênis Jr", pos:"GOL", forca:73, idade:27, carac:"Reflexo"}, {nome:"Alesson", pos:"ATA", forca:74, idade:25, carac:"Velocidade"}] },
            { id: "novorizontino", nome: "Novorizontino", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/17495.png", forca: 72, elenco: [{nome:"Jordi", pos:"GOL", forca:74, idade:31, carac:"Altura"}, {nome:"Lucca", pos:"ATA", forca:72, idade:21, carac:"Chute"}] },
            { id: "paysandu", nome: "Paysandu", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3450.png", forca: 70, elenco: [{nome:"Nicolas", pos:"ATA", forca:73, idade:35, carac:"Cabeceio"}] },
            { id: "operario", nome: "Operário-PR", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10419.png", forca: 70, elenco: [{nome:"Rafael Santos", pos:"GOL", forca:71, idade:35, carac:"Segurança"}] },
            { id: "amazonas", nome: "Amazonas", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/20763.png", forca: 70, elenco: [{nome:"Sassá", pos:"ATA", forca:73, idade:31, carac:"Força"}] },
            { id: "chapecoense", nome: "Chapecoense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10007.png", forca: 69, elenco: [{nome:"Matheus Cavichioli", pos:"GOL", forca:72, idade:38, carac:"Experiência"}] },
            { id: "crb", nome: "CRB", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6276.png", forca: 70, elenco: [{nome:"Anselmo Ramon", pos:"ATA", forca:74, idade:36, carac:"Pivô"}] },
            { id: "botafogosp", nome: "Botafogo-SP", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6277.png", forca: 69, elenco: [] },
            // SUBIRAM DA C
            { id: "voltaredonda", nome: "Volta Redonda", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6005.png", forca: 68, elenco: [] },
            { id: "athletic", nome: "Athletic Club", escudo: "https://upload.wikimedia.org/wikipedia/pt/9/90/Athletic_Club_%28MG%29.png", forca: 69, elenco: [] },
            { id: "ferroviaria", nome: "Ferroviária", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/7735.png", forca: 68, elenco: [] },
            { id: "remo", nome: "Remo", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6275.png", forca: 70, elenco: [] }
        ],

        // --- SÉRIE C (2026) ---
        serieC: [
            // REBAIXADOS DA B
            { id: "pontepreta", nome: "Ponte Preta", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3457.png", forca: 69, elenco: [{nome:"Pedro Rocha", pos:"GOL", forca:71, idade:26, carac:"Reflexo"}, {nome:"Elvis", pos:"MEI", forca:73, idade:34, carac:"Passe"}] },
            { id: "guarani", nome: "Guarani", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6008.png", forca: 69, elenco: [{nome:"Vladimir", pos:"GOL", forca:70, idade:35, carac:"Experiência"}, {nome:"Caio Dantas", pos:"ATA", forca:72, idade:32, carac:"Finalização"}] },
            { id: "ituano", nome: "Ituano", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/7740.png", forca: 68, elenco: [] },
            { id: "brusque", nome: "Brusque", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/17496.png", forca: 68, elenco: [] },
            
            // PERMANECERAM
            { id: "nautico", nome: "Náutico", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3449.png", forca: 69, elenco: [{nome:"Patrick Allan", pos:"MEI", forca:71, idade:28, carac:"Chute"}] },
            { id: "figueirense", nome: "Figueirense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3448.png", forca: 68, elenco: [] },
            { id: "csa", nome: "CSA", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10418.png", forca: 68, elenco: [] },
            { id: "confianca", nome: "Confiança", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10417.png", forca: 67, elenco: [] },
            { id: "londrina", nome: "Londrina", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10413.png", forca: 68, elenco: [] },
            { id: "botafogopb", nome: "Botafogo-PB", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10009.png", forca: 69, elenco: [] },
            { id: "saobernardo", nome: "São Bernardo", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13760.png", forca: 69, elenco: [] },
            { id: "ypiranga", nome: "Ypiranga-RS", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13766.png", forca: 68, elenco: [] },
            { id: "tombense", nome: "Tombense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13768.png", forca: 68, elenco: [] },
            { id: "caxias", nome: "Caxias", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3462.png", forca: 67, elenco: [] },
            { id: "floresta", nome: "Floresta", escudo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Floresta_Esporte_Clube_logo.svg", forca: 66, elenco: [] },
            { id: "abc", nome: "ABC", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6007.png", forca: 68, elenco: [] },

            // SUBIRAM DA D
            { id: "retro", nome: "Retrô", escudo: "https://upload.wikimedia.org/wikipedia/pt/e/e0/Retr%C3%B4_Futebol_Clube_Brasil.png", forca: 68, elenco: [] },
            { id: "anapolis", nome: "Anápolis", escudo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Anapolis_Futebol_Clube.svg", forca: 67, elenco: [] },
            { id: "maringa", nome: "Maringá", escudo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Maring%C3%A1_Futebol_Clube.svg", forca: 68, elenco: [] },
            { id: "itabaiana", nome: "Itabaiana", escudo: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Associa%C3%A7%C3%A3o_Ol%C3%ADmpica_de_Itabaiana_logo.svg", forca: 67, elenco: [] }
        ],

        // --- SÉRIE D (2026 - SELEÇÃO) ---
        serieD: [
            // REBAIXADOS DA C
            { id: "sampaiocorrea", nome: "Sampaio Corrêa", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6278.png", forca: 67, elenco: [{nome:"Pimentinha", pos:"ATA", forca:70, idade:37, carac:"Drible"}] },
            { id: "ferroviario", nome: "Ferroviário", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10008.png", forca: 66, elenco: [] },
            { id: "aparecidense", nome: "Aparecidense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13759.png", forca: 66, elenco: [] },
            { id: "saojose", nome: "São José-RS", escudo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/EC_S%C3%A3o_Jos%C3%A9.svg", forca: 65, elenco: [] },

            // TRADICIONAIS
            { id: "santacruz", nome: "Santa Cruz", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6002.png", forca: 68, elenco: [{nome:"Gilvan", pos:"ZAG", forca:69, idade:31, carac:"Força"}] },
            { id: "portuguesa", nome: "Portuguesa", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3458.png", forca: 67, elenco: [] },
            { id: "americarj", nome: "America-RJ", escudo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/America_Football_Club.svg", forca: 66, elenco: [] },
            { id: "treze", nome: "Treze", escudo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Treze_Futebol_Clube_logo.svg", forca: 66, elenco: [] },
            { id: "riverpi", nome: "River-PI", escudo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/River_Atl%C3%A9tico_Clube.svg", forca: 65, elenco: [] }
        ]
    }
};

// --- COMPATIBILIDADE ---
if (typeof window !== 'undefined') {
    window.Database = database;
    window.database = database;
}
