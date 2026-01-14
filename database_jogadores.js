// database_jogadores.js
// BANCO DE DADOS FINAL 2026 (Atualizado conforme PDF)

const database = {
    brasil: {
        // --- SÉRIE A (ELITE 2026 - 20 Times conforme PDF) ---
        serieA: [
            {
                id: "botafogo", nome: "Botafogo", escudo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/6086.png&scale=crop&cquality=40&location=origin&w=64&h=64", forca: 86, orcamento: "R$ 950 Mi", destaque: "Luiz Henrique",
                elenco: [
                    { nome: "Neto", pos: "GOL", forca: 82, idade: 37, carac: "Experiência" },
                    { nome: "John", pos: "GOL", forca: 80, idade: 30, carac: "Reflexo" },
                    { nome: "Raul", pos: "GOL", forca: 75, idade: 29, carac: "Segurança" },
                    { nome: "Vitinho", pos: "LD", forca: 79, idade: 27, carac: "Velocidade" },
                    { nome: "Mateo Ponte", pos: "LD", forca: 77, idade: 23, carac: "Cruzamento" },
                    { nome: "Alexander Barboza", pos: "ZAG", forca: 81, idade: 31, carac: "Liderança" },
                    { nome: "Bastos", pos: "ZAG", forca: 79, idade: 35, carac: "Antecipação" },
                    { nome: "Lucas Halter", pos: "ZAG", forca: 76, idade: 26, carac: "Força" },
                    { nome: "Kaio", pos: "ZAG", forca: 75, idade: 29, carac: "Marcação" },
                    { nome: "Alex Telles", pos: "LE", forca: 81, idade: 34, carac: "Técnica" },
                    { nome: "Marçal", pos: "LE", forca: 76, idade: 37, carac: "Defesa" },
                    { nome: "Gregore", pos: "VOL", forca: 80, idade: 32, carac: "Desarme" },
                    { nome: "Allan", pos: "VOL", forca: 79, idade: 35, carac: "Passe" },
                    { nome: "Danilo", pos: "VOL", forca: 81, idade: 25, carac: "Dinâmica" },
                    { nome: "Tchê Tchê", pos: "VOL", forca: 77, idade: 34, carac: "Resistência" },
                    { nome: "Savarino", pos: "MEI", forca: 83, idade: 30, carac: "Visão" },
                    { nome: "Eduardo", pos: "MEI", forca: 76, idade: 36, carac: "Finalização" },
                    { nome: "Luiz Henrique", pos: "ATA", forca: 85, idade: 25, carac: "Habilidade" },
                    { nome: "Joaquín Correa", pos: "ATA", forca: 82, idade: 32, carac: "Drible" },
                    { nome: "Arthur Cabral", pos: "ATA", forca: 83, idade: 28, carac: "Finalização" },
                    { nome: "Igor Jesus", pos: "ATA", forca: 82, idade: 25, carac: "Pivô" },
                    { nome: "Tiquinho Soares", pos: "ATA", forca: 78, idade: 35, carac: "Finalização" },
                    { nome: "Júnior Santos", pos: "ATA", forca: 78, idade: 31, carac: "Explosão" },
                    { nome: "Matheus Martins", pos: "ATA", forca: 79, idade: 23, carac: "Agilidade" },
                    { nome: "Lucas Villalba", pos: "ATA", forca: 77, idade: 24, carac: "Velocidade" },
                    { nome: "Jeffinho", pos: "ATA", forca: 78, idade: 27, carac: "Drible" }
                   ]
            },
            {
                id: "palmeiras", nome: "Palmeiras", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/2029.png", forca: 85, orcamento: "R$ 1 Bi", destaque: "Estêvão",
                elenco: [
                    { nome: "Carlos Miguel", pos: "GOL", forca: 81, idade: 27, carac: "Envergadura" },
                    { nome: "Weverton", pos: "GOL", forca: 80, idade: 38, carac: "Liderança" },
                    { nome: "Marcelo Lomba", pos: "GOL", forca: 74, idade: 39, carac: "Experiência" },
                    { nome: "Mateus", pos: "GOL", forca: 72, idade: 24, carac: "Reflexo" },
                    { nome: "Agustín Giay", pos: "LD", forca: 79, idade: 22, carac: "Apoio" },
                    { nome: "Mayke", pos: "LD", forca: 76, idade: 33, carac: "Velocidade" },
                    { nome: "Marcos Rocha", pos: "LD", forca: 74, idade: 37, carac: "Passe" },
                    { nome: "Gustavo Gómez", pos: "ZAG", forca: 83, idade: 33, carac: "Liderança" },
                    { nome: "Murilo", pos: "ZAG", forca: 81, idade: 29, carac: "Força" },
                    { nome: "Vitor Reis", pos: "ZAG", forca: 80, idade: 20, carac: "Antecipação" },
                    { nome: "Naves", pos: "ZAG", forca: 77, idade: 24, carac: "Passe" },
                    { nome: "Michel", pos: "ZAG", forca: 74, idade: 23, carac: "Velocidade" },
                    { nome: "Piquerez", pos: "LE", forca: 83, idade: 28, carac: "Chute de Longe" },
                    { nome: "Vanderlan", pos: "LE", forca: 78, idade: 23, carac: "Velocidade" },
                    { nome: "Caio Paulista", pos: "LE", forca: 76, idade: 28, carac: "Drible" },
                    { nome: "Aníbal Moreno", pos: "VOL", forca: 82, idade: 27, carac: "Desarme" },
                    { nome: "Richard Ríos", pos: "VOL", forca: 80, idade: 26, carac: "Drible" },
                    { nome: "Zé Rafael", pos: "VOL", forca: 78, idade: 33, carac: "Raça" },
                    { nome: "Gabriel Menino", pos: "VOL", forca: 77, idade: 25, carac: "Chute de Longe" },
                    { nome: "Fabinho", pos: "VOL", forca: 76, idade: 24, carac: "Marcação" },
                    { nome: "Raphael Veiga", pos: "MEI", forca: 84, idade: 31, carac: "Decisão" },
                    { nome: "Maurício", pos: "MEI", forca: 80, idade: 25, carac: "Passe" },
                    { nome: "Rômulo", pos: "MEI", forca: 75, idade: 24, carac: "Visão" },
                    { nome: "Jhon Jhon", pos: "MEI", forca: 73, idade: 23, carac: "Drible" },
                    { nome: "Felipe Anderson", pos: "ATA", forca: 82, idade: 33, carac: "Técnica" },
                    { nome: "Flaco López", pos: "ATA", forca: 81, idade: 25, carac: "Cabeceio" },
                    { nome: "Dudu", pos: "ATA", forca: 79, idade: 34, carac: "Ídolo" },
                    { nome: "Rony", pos: "ATA", forca: 77, idade: 31, carac: "Rústico" },
                    { nome: "Lázaro", pos: "ATA", forca: 76, idade: 24, carac: "Finalização" },
                    { nome: "Bruno Rodrigues", pos: "ATA", forca: 76, idade: 29, carac: "Drible" },
                    { nome: "Luighi", pos: "ATA", forca: 75, idade: 20, carac: "Promessa" }
                ]
            },
            {
                id: "flamengo", nome: "Flamengo", escudo: "https://s.sde.globo.com/media/organizations/2018/04/10/Flamengo-2018.svg", forca: 86, orcamento: "R$ 1.1 Bi", destaque: "Pedro",
                elenco: [
                    { nome: "Agustín Rossi", pos: "GOL", forca: 82, idade: 30, carac: "Reflexo" },
                    { nome: "Andrew", pos: "GOL", forca: 76, idade: 24, carac: "Agilidade" }, // Contratado do Gil Vicente
                    { nome: "Dyogo Alves", pos: "GOL", forca: 73, idade: 22, carac: "Pegador de Pênalti" },
                    { nome: "Emerson Royal", pos: "LD", forca: 80, idade: 27, carac: "Força" }, // Reforço de peso
                    { nome: "Varela", pos: "LD", forca: 76, idade: 33, carac: "Equilíbrio" },
                    { nome: "Wesley", pos: "LD", forca: 77, idade: 22, carac: "Arrancada" },
                    { nome: "Léo Ortiz", pos: "ZAG", forca: 83, idade: 30, carac: "Passe Longo" },
                    { nome: "Léo Pereira", pos: "ZAG", forca: 81, idade: 30, carac: "Técnica" },
                    { nome: "Danilo", pos: "ZAG", forca: 82, idade: 34, carac: "Polivalente" }, // Ex-Juventus/Seleção
                    { nome: "Cleiton", pos: "ZAG", forca: 78, idade: 28, carac: "Velocidade" }, // Ex-Bragantino
                    { nome: "Vitão", pos: "ZAG", forca: 79, idade: 26, carac: "Antecipação" }, // Ex-Inter
                    { nome: "Ayrton Lucas", pos: "LE", forca: 81, idade: 29, carac: "Velocidade" },
                    { nome: "Alex Sandro", pos: "LE", forca: 79, idade: 35, carac: "Experiência" },
                    { nome: "Matías Viña", pos: "LE", forca: 78, idade: 28, carac: "Cruzamento" },
                    { nome: "Erick Pulgar", pos: "VOL", forca: 80, idade: 32, carac: "Passe" },
                    { nome: "Jorginho", pos: "VOL", forca: 82, idade: 34, carac: "Maestro" }, // Ex-Arsenal/Itália
                    { nome: "Allan", pos: "VOL", forca: 77, idade: 29, carac: "Marcação" },
                    { nome: "Evertton Araújo", pos: "VOL", forca: 75, idade: 23, carac: "Força" },
                    { nome: "Arrascaeta", pos: "MEI", forca: 86, idade: 32, carac: "Mágica" },
                    { nome: "De La Cruz", pos: "MEI", forca: 85, idade: 29, carac: "Dinâmica" },
                    { nome: "Saúl", pos: "MEI", forca: 81, idade: 31, carac: "Box-to-Box" }, // Saúl Ñíguez
                    { nome: "Jorge Carrascal", pos: "MEI", forca: 79, idade: 28, carac: "Drible" }, // Ex-River/CSKA
                    { nome: "Lorran", pos: "MEI", forca: 76, idade: 20, carac: "Promessa" },
                    { nome: "Pedro", pos: "ATA", forca: 87, idade: 29, carac: "Finalização" },
                    { nome: "Samuel Lino", pos: "ATA", forca: 83, idade: 26, carac: "Habilidade" }, // Ex-Atlético Madrid
                    { nome: "Bruno Henrique", pos: "ATA", forca: 79, idade: 35, carac: "Velocidade" },
                    { nome: "Luiz Araújo", pos: "ATA", forca: 79, idade: 30, carac: "Chute de Longe" },
                    { nome: "Gonzalo Plata", pos: "ATA", forca: 78, idade: 25, carac: "Drible" },
                    { nome: "Everton Cebolinha", pos: "ATA", forca: 80, idade: 30, carac: "Drible" },
                    { nome: "Michael", pos: "ATA", forca: 78, idade: 30, carac: "Agilidade" }
                ]
            },
            {
                id: "atleticomg", nome: "Atlético-MG", escudo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg", forca: 82, orcamento: "R$ 700 Mi", destaque: "Hulk",
                elenco: [
                    { nome: "Éverson", pos: "GOL", forca: 80, idade: 35, carac: "Reflexo" },
                    { nome: "Gabriel Delfim", pos: "GOL", forca: 74, idade: 23, carac: "Agilidade" },
                    { nome: "Robert", pos: "GOL", forca: 68, idade: 20, carac: "Promessa" },
                    { nome: "Renan Lodi", pos: "LE", forca: 82, idade: 27, carac: "Cruzamento" },
                    { nome: "Natanael", pos: "LD", forca: 77, idade: 24, carac: "Velocidade" },
                    { nome: "Luís Gustavo", pos: "LD", forca: 70, idade: 22, carac: "Apoio" },
                    { nome: "Kauã Pascini", pos: "LE", forca: 69, idade: 21, carac: "Defesa" },
                    { nome: "Júnior Alonso", pos: "ZAG", forca: 81, idade: 33, carac: "Liderança" },
                    { nome: "Lyanco", pos: "ZAG", forca: 79, idade: 29, carac: "Força" },
                    { nome: "Vitão", pos: "ZAG", forca: 79, idade: 26, carac: "Técnica" },
                    { nome: "Vitor Hugo", pos: "ZAG", forca: 76, idade: 34, carac: "Experiência" },
                    { nome: "Ivan Román", pos: "ZAG", forca: 75, idade: 19, carac: "Antecipação" },
                    { nome: "Pedro Oliveira", pos: "ZAG", forca: 67, idade: 20, carac: "Velocidade" },
                    { nome: "Gustavo Scarpa", pos: "MEI", forca: 83, idade: 32, carac: "Chute de Longe" },
                    { nome: "Maycon", pos: "VOL", forca: 80, idade: 28, carac: "Maestro" },
                    { nome: "Alan Franco", pos: "VOL", forca: 78, idade: 27, carac: "Dinâmica" },
                    { nome: "Alexsander", pos: "VOL", forca: 77, idade: 22, carac: "Polivalente" },
                    { nome: "Gabriel Menino", pos: "VOL", forca: 78, idade: 25, carac: "Chute" },
                    { nome: "Bernard", pos: "MEI", forca: 77, idade: 33, carac: "Drible" },
                    { nome: "Igor Gomes", pos: "MEI", forca: 76, idade: 27, carac: "Movimentação" },
                    { nome: "Patrick", pos: "MEI", forca: 75, idade: 33, carac: "Força" },
                    { nome: "Cissé", pos: "VOL", forca: 76, idade: 24, carac: "Marcação" },
                    { nome: "Mateus Iseppe", pos: "MEI", forca: 74, idade: 19, carac: "Habilidade" },
                    { nome: "Igor Toledo", pos: "VOL", forca: 68, idade: 20, carac: "Passe" },
                    { nome: "Índio", pos: "MEI", forca: 67, idade: 21, carac: "Agilidade" },
                    { nome: "Hulk", pos: "ATA", forca: 83, idade: 39, carac: "Potência" },
                    { nome: "Dudu", pos: "ATA", forca: 79, idade: 34, carac: "Ídolo" },
                    { nome: "Rony", pos: "ATA", forca: 79, idade: 30, carac: "Rústico" },
                    { nome: "Júnior Santos", pos: "ATA", forca: 78, idade: 31, carac: "Explosão" },
                    { nome: "Alan Minda", pos: "ATA", forca: 78, idade: 23, carac: "Velocidade" },
                    { nome: "Reinier", pos: "ATA", forca: 77, idade: 24, carac: "Finalização" },
                    { nome: "Biel", pos: "ATA", forca: 77, idade: 24, carac: "Drible" },
                    { nome: "Cuello", pos: "ATA", forca: 76, idade: 26, carac: "Raça" },
                    { nome: "Cadu", pos: "ATA", forca: 75, idade: 21, carac: "Cabeceio" },
                    { nome: "Murillo", pos: "ATA", forca: 70, idade: 20, carac: "Promessa" },
                    { nome: "Caio Maia", pos: "ATA", forca: 68, idade: 21, carac: "Velocidade" },
                    { nome: "Cauã Soares", pos: "ATA", forca: 67, idade: 19, carac: "Chute" }
                ]
            },
            {
                id: "internacional", nome: "Internacional", escudo: "https://s.sde.globo.com/media/organizations/2018/03/11/internacional.svg", forca: 83, orcamento: "R$ 600 Mi", destaque: "Alan Patrick",
                elenco: [
                    { nome: "Sergio Rochet", pos: "GOL", forca: 81, idade: 33, carac: "Liderança" },
                    { nome: "Ivan", pos: "GOL", forca: 75, idade: 29, carac: "Reflexo" },
                    { nome: "Anthoni", pos: "GOL", forca: 71, idade: 24, carac: "Envergadura" },
                    { nome: "Kauan Jesus", pos: "GOL", forca: 68, idade: 22, carac: "Promessa" },
                    { nome: "Bernabei", pos: "LE", forca: 79, idade: 26, carac: "Apoio" },
                    { nome: "Braian Aguirre", pos: "LD", forca: 77, idade: 26, carac: "Equilíbrio" },
                    { nome: "Alan Benítez", pos: "LD", forca: 75, idade: 32, carac: "Velocidade" },
                    { nome: "Vitão", pos: "ZAG", forca: 79, idade: 26, carac: "Técnica" },
                    { nome: "Gabriel Mercado", pos: "ZAG", forca: 76, idade: 39, carac: "Experiência" },
                    { nome: "Clayton Sampaio", pos: "ZAG", forca: 74, idade: 26, carac: "Força" },
                    { nome: "Victor Gabriel", pos: "ZAG", forca: 71, idade: 22, carac: "Velocidade" },
                    { nome: "Juninho", pos: "ZAG", forca: 70, idade: 23, carac: "Antecipação" },
                    { nome: "Alan Patrick", pos: "MEI", forca: 83, idade: 35, carac: "Maestro" },
                    { nome: "Thiago Maia", pos: "VOL", forca: 78, idade: 29, carac: "Passe" },
                    { nome: "Bruno Tabata", pos: "MEI", forca: 77, idade: 29, carac: "Chute de Longe" },
                    { nome: "Bruno Henrique", pos: "VOL", forca: 76, idade: 36, carac: "Dinâmica" },
                    { nome: "Gustavo Prado", pos: "MEI", forca: 75, idade: 21, carac: "Drible" },
                    { nome: "Ronaldo", pos: "VOL", forca: 74, idade: 29, carac: "Marcação" },
                    { nome: "Alan Rodríguez", pos: "MEI", forca: 73, idade: 25, carac: "Técnica" },
                    { nome: "Richard", pos: "VOL", forca: 73, idade: 26, carac: "Força" },
                    { nome: "Rafael Borré", pos: "ATA", forca: 82, idade: 31, carac: "Raça" },
                    { nome: "Johan Carbonero", pos: "ATA", forca: 78, idade: 27, carac: "Velocidade" },
                    { nome: "Vitinho", pos: "ATA", forca: 72, idade: 23, carac: "Habilidade" }
                ]
            },
            {
                id: "saopaulo", nome: "São Paulo", escudo: "data:image/png;base64,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", forca: 81, orcamento: "R$ 550 Mi", destaque: "Lucas Moura",
                elenco: [
                    { nome: "Rafael", pos: "GOL", forca: 79, idade: 36, carac: "Segurança" },
                    { nome: "Carlos Coronel", pos: "GOL", forca: 78, idade: 29, carac: "Reflexo" },
                    { nome: "Young", pos: "GOL", forca: 72, idade: 24, carac: "Envergadura" },
                    { nome: "Felipe Preis", pos: "GOL", forca: 66, idade: 20, carac: "Promessa" },
                    { nome: "Wendell", pos: "LE", forca: 80, idade: 32, carac: "Apoio" },
                    { nome: "Cédric", pos: "LD", forca: 79, idade: 34, carac: "Cruzamento" },
                    { nome: "Enzo Díaz", pos: "LE", forca: 77, idade: 30, carac: "Raça" },
                    { nome: "Maik", pos: "LD", forca: 72, idade: 26, carac: "Velocidade" },
                    { nome: "Rafael Tolói", pos: "ZAG", forca: 81, idade: 35, carac: "Liderança" },
                    { nome: "Robert Arboleda", pos: "ZAG", forca: 80, idade: 34, carac: "Antecipação" },
                    { nome: "Alan Franco", pos: "ZAG", forca: 79, idade: 29, carac: "Passe" },
                    { nome: "Nahuel Ferraresi", pos: "ZAG", forca: 78, idade: 27, carac: "Técnica" },
                    { nome: "Sabino", pos: "ZAG", forca: 75, idade: 29, carac: "Bola Aérea" },
                    { nome: "João Moreira", pos: "ZAG", forca: 74, idade: 21, carac: "Polivalente" }, // Listado como Zagueiro
                    { nome: "Hugo", pos: "ZAG", forca: 65, idade: 19, carac: "Base" },
                    { nome: "Nicolas", pos: "ZAG", forca: 64, idade: 18, carac: "Força" },
                    { nome: "Pablo Maia", pos: "VOL", forca: 81, idade: 24, carac: "Chute de Longe" },
                    { nome: "Marcos Antônio", pos: "VOL", forca: 79, idade: 25, carac: "Dinâmica" },
                    { nome: "Damián Bobadilla", pos: "VOL", forca: 78, idade: 24, carac: "Infiltração" },
                    { nome: "Alisson", pos: "VOL", forca: 78, idade: 32, carac: "Motor" },
                    { nome: "Gonzalo Tapia", pos: "MEI", forca: 78, idade: 23, carac: "Velocidade" },
                    { nome: "Danielzinho", pos: "MEI", forca: 75, idade: 31, carac: "Passe" },
                    { nome: "Luan", pos: "VOL", forca: 75, idade: 26, carac: "Marcação" },
                    { nome: "Rodriguinho", pos: "MEI", forca: 74, idade: 22, carac: "Drible" },
                    { nome: "Felipe Negrucci", pos: "VOL", forca: 70, idade: 21, carac: "Passe" },
                    { nome: "Pedro Ferreira", pos: "MEI", forca: 68, idade: 20, carac: "Técnica" },
                    { nome: "Lucas Moura", pos: "ATA", forca: 83, idade: 33, carac: "Arrancada" },
                    { nome: "Jonathan Calleri", pos: "ATA", forca: 82, idade: 32, carac: "Pivô" },
                    { nome: "Luciano", pos: "ATA", forca: 80, idade: 33, carac: "Decisão" },
                    { nome: "Ferreira", pos: "ATA", forca: 79, idade: 28, carac: "Drible" },
                    { nome: "André Silva", pos: "ATA", forca: 76, idade: 28, carac: "Finalização" },
                    { nome: "Ryan Francisco", pos: "ATA", forca: 74, idade: 19, carac: "Matador" },
                    { nome: "Paulo Sérgio", pos: "ATA", forca: 72, idade: 36, carac: "Experiência" },
                    { nome: "Lucca Marques", pos: "ATA", forca: 69, idade: 21, carac: "Velocidade" }
                ]
            },
            {
                id: "corinthians", nome: "Corinthians", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/874.png", forca: 80, orcamento: "R$ 750 Mi", destaque: "Memphis Depay",
                elenco: [
                    { nome: "Hugo Souza", pos: "GOL", forca: 85, idade: 27, carac: "Reflexo" },
                    { nome: "Matheus Donelli", pos: "GOL", forca: 74, idade: 24, carac: "Agilidade" },
                    { nome: "Felipe Longo", pos: "GOL", forca: 70, idade: 21, carac: "Promessa" },
                    { nome: "Kauê", pos: "GOL", forca: 67, idade: 20, carac: "Envergadura" },
                    { nome: "Matheuzinho", pos: "LD", forca: 77, idade: 25, carac: "Apoio" },
                    { nome: "João Vitor Jacaré", pos: "LD", forca: 73, idade: 22, carac: "Velocidade" },
                    { nome: "Matheus Bidu", pos: "LE", forca: 76, idade: 27, carac: "Chute" },
                    { nome: "Hugo", pos: "LE", forca: 75, idade: 28, carac: "Defesa" },
                    { nome: "André Ramalho", pos: "ZAG", forca: 80, idade: 34, carac: "Liderança" },
                    { nome: "Félix Torres", pos: "ZAG", forca: 78, idade: 29, carac: "Velocidade" },
                    { nome: "Gabriel Paulista", pos: "ZAG", forca: 77, idade: 35, carac: "Raça" },
                    { nome: "Cacá", pos: "ZAG", forca: 76, idade: 27, carac: "Impulsão" },
                    { nome: "Gustavo Henrique", pos: "ZAG", forca: 75, idade: 33, carac: "Bola Aérea" },
                    { nome: "João Pedro", pos: "ZAG", forca: 71, idade: 22, carac: "Força" },
                    { nome: "Rodrigo Garro", pos: "MEI", forca: 84, idade: 28, carac: "Mágica" },
                    { nome: "André Carrillo", pos: "MEI", forca: 79, idade: 34, carac: "Drible" },
                    { nome: "Raniele", pos: "VOL", forca: 78, idade: 29, carac: "Desarme" },
                    { nome: "José Martínez", pos: "VOL", forca: 79, idade: 31, carac: "Raça" }, 
                    { nome: "Breno Bidon", pos: "VOL", forca: 78, idade: 21, carac: "Visão" },
                    { nome: "Charles", pos: "VOL", forca: 76, idade: 30, carac: "Resistência" },
                    { nome: "André", pos: "VOL", forca: 75, idade: 24, carac: "Marcação" },
                    { nome: "Ryan", pos: "VOL", forca: 73, idade: 22, carac: "Raça" },
                    { nome: "Dieguinho", pos: "MEI", forca: 72, idade: 19, carac: "Habilidade" }, 
                    { nome: "Memphis Depay", pos: "ATA", forca: 90, idade: 32, carac: "Craque" },
                    { nome: "Yuri Alberto", pos: "ATA", forca: 82, idade: 25, carac: "Finalização" },
                    { nome: "Pedro Raul", pos: "ATA", forca: 77, idade: 29, carac: "Pivô" },
                    { nome: "Kayke", pos: "ATA", forca: 74, idade: 21, carac: "Velocidade" },
                    { nome: "Gui Negão", pos: "ATA", forca: 73, idade: 19, carac: "Finalização" },
                    { nome: "Vitinho", pos: "ATA", forca: 71, idade: 20, carac: "Drible" }
                ]
            },
            {
                id: "bahia", nome: "Bahia", escudo: "https://s.sde.globo.com/media/organizations/2018/03/11/bahia.svg", forca: 79, orcamento: "R$ 700 Mi", destaque: "Everton Ribeiro",
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
                    { nome: "Lucho Rodríguez", pos: "ATA", forca: 77, idade: 22, carac: "Chute" }
                ]
            },
            {
                id: "cruzeiro", nome: "Cruzeiro", escudo: "https://s.sde.globo.com/media/organizations/2021/02/13/cruzeiro_2021.svg", forca: 80, orcamento: "R$ 650 Mi", destaque: "Matheus Pereira",
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
                    { nome: "Adson", pos: "ATA", forca: 75, idade: 24, carac: "Drible" }
                ]
            },
            {
                id: "fluminense", nome: "Fluminense", escudo: "https://s.sde.globo.com/media/organizations/2018/03/11/fluminense.svg", forca: 79, orcamento: "R$ 500 Mi", destaque: "Thiago Silva",
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
                id: "santos", nome: "Santos", escudo: "https://s.sde.globo.com/media/organizations/2018/03/12/santos.svg", forca: 81, orcamento: "R$ 600 Mi", destaque: "Neymar Jr",
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
                id: "athleticopr", nome: "Athletico-PR", escudo: "https://s.sde.globo.com/media/organizations/2026/01/07/Athletico-PR.svg", forca: 77, orcamento: "R$ 300 Mi", destaque: "Fernandinho",
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
                id: "bragantino", nome: "Bragantino", escudo: "https://s.sde.globo.com/media/organizations/2021/06/28/bragantino.svg", forca: 76, orcamento: "R$ 350 Mi", destaque: "Cleiton",
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
                id: "vitoria", nome: "Vitória", escudo: "https://s.sde.globo.com/media/organizations/2025/12/18/Vitoria_2025.svg", forca: 74, orcamento: "R$ 150 Mi", destaque: "Matheuzinho",
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
                id: "mirassol", nome: "Mirassol", escudo: "https://s.sde.globo.com/media/organizations/2024/08/20/mirassol-novo-svg-71690.svg", forca: 73, orcamento: "R$ 100 Mi", destaque: "Muralha",
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
                id: "coritiba", nome: "Coritiba", escudo: "https://s.sde.globo.com/media/organizations/2018/03/11/coritiba.svg", forca: 73, orcamento: "R$ 65 Mi", destaque: "Robson",
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
                id: "chapecoense", nome: "Chapecoense", escudo: "https://s.sde.globo.com/media/organizations/2021/06/21/CHAPECOENSE-2018.svg", forca: 72, orcamento: "R$ 60 Mi", destaque: "Matheus Cavichioli",
                elenco: [
                    { nome: "Matheus Cavichioli", pos: "GOL", forca: 73, idade: 38, carac: "Experiência" },
                    { nome: "Bruno Leonardo", pos: "ZAG", forca: 72, idade: 28, carac: "Liderança" },
                    { nome: "Mancha", pos: "LE", forca: 71, idade: 24, carac: "Apoio" },
                    { nome: "Foguinho", pos: "VOL", forca: 72, idade: 32, carac: "Raça" },
                    { nome: "Giovanni Augusto", pos: "MEI", forca: 73, idade: 35, carac: "Passe" },
                    { nome: "Mário Sérgio", pos: "ATA", forca: 74, idade: 28, carac: "Finalização" }
                ]
            },
            {
                id: "remo", nome: "Remo", escudo: "https://s.sde.globo.com/media/organizations/2021/02/25/Remo-PA.svg", forca: 71, orcamento: "R$ 55 Mi", destaque: "Pedro Vitor",
                elenco: [
                    { nome: "Marcelo Rangel", pos: "GOL", forca: 72, idade: 36, carac: "Reflexo" },
                    { nome: "Ligger", pos: "ZAG", forca: 71, idade: 36, carac: "Experiência" },
                    { nome: "Bruno Silva", pos: "VOL", forca: 72, idade: 38, carac: "Força" },
                    { nome: "Pavani", pos: "MEI", forca: 73, idade: 28, carac: "Chute" },
                    { nome: "Pedro Vitor", pos: "ATA", forca: 74, idade: 26, carac: "Drible" },
                    { nome: "Ytalo", pos: "ATA", forca: 73, idade: 37, carac: "Finalização" }
                ]
            }
        ],

        // --- SÉRIE B (ACESSO 2026 - 20 Times conforme PDF) ---
        serieB: [
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
                    { nome: "Isidro Pitta", pos: "ATA", forca: 76, idade: 25, carac: "Raça" }
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
            { id: "athletic", nome: "Athletic Club", escudo: "https://upload.wikimedia.org/wikipedia/pt/9/90/Athletic_Club_%28MG%29.png", forca: 69, elenco: [] },
            { id: "botafogosp", nome: "Botafogo-SP", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6277.png", forca: 69, elenco: [] },
            { id: "crb", nome: "CRB", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6276.png", forca: 70, elenco: [{nome:"Anselmo Ramon", pos:"ATA", forca:74, idade:36, carac:"Pivô"}] },
            { id: "londrina", nome: "Londrina", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10413.png", forca: 68, elenco: [] },
            { id: "nautico", nome: "Náutico", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3449.png", forca: 69, elenco: [{nome:"Patrick Allan", pos:"MEI", forca:71, idade:28, carac:"Chute"}] },
            { id: "novorizontino", nome: "Novorizontino", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/17495.png", forca: 72, elenco: [{nome:"Jordi", pos:"GOL", forca:74, idade:31, carac:"Altura"}, {nome:"Lucca", pos:"ATA", forca:72, idade:21, carac:"Chute"}] },
            { id: "operario", nome: "Operário-PR", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10419.png", forca: 70, elenco: [{nome:"Rafael Santos", pos:"GOL", forca:71, idade:35, carac:"Segurança"}] },
            { id: "pontepreta", nome: "Ponte Preta", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3457.png", forca: 69, elenco: [{nome:"Pedro Rocha", pos:"GOL", forca:71, idade:26, carac:"Reflexo"}, {nome:"Elvis", pos:"MEI", forca:73, idade:34, carac:"Passe"}] },
            { id: "saobernardo", nome: "São Bernardo", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13760.png", forca: 69, elenco: [] },
            { id: "vilanova", nome: "Vila Nova", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10006.png", forca: 71, elenco: [{nome:"Dênis Jr", pos:"GOL", forca:73, idade:27, carac:"Reflexo"}, {nome:"Alesson", pos:"ATA", forca:74, idade:25, carac:"Velocidade"}] }
        ],

        // --- SÉRIE C (2026 - conforme PDF) ---
        serieC: [
            // Rebaixados da B (no PDF) ou times que ficaram
            { id: "amazonas", nome: "Amazonas", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/20763.png", forca: 70, elenco: [{nome:"Sassá", pos:"ATA", forca:73, idade:31, carac:"Força"}] },
            { id: "anapolis", nome: "Anápolis", escudo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Anapolis_Futebol_Clube.svg", forca: 67, elenco: [] },
            { id: "barra", nome: "Barra-SC", escudo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Barra_Futebol_Clube.svg/1200px-Barra_Futebol_Clube.svg.png", forca: 66, elenco: [] },
            { id: "botafogopb", nome: "Botafogo-PB", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10009.png", forca: 69, elenco: [] },
            { id: "brusque", nome: "Brusque", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/17496.png", forca: 68, elenco: [] },
            { id: "caxias", nome: "Caxias", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3462.png", forca: 67, elenco: [] },
            { id: "confianca", nome: "Confiança", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10417.png", forca: 67, elenco: [] },
            { id: "ferroviaria", nome: "Ferroviária", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/7735.png", forca: 68, elenco: [] },
            { id: "figueirense", nome: "Figueirense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3448.png", forca: 68, elenco: [] },
            { id: "floresta", nome: "Floresta", escudo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Floresta_Esporte_Clube_logo.svg", forca: 66, elenco: [] },
            { id: "guarani", nome: "Guarani", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6008.png", forca: 69, elenco: [{nome:"Vladimir", pos:"GOL", forca:70, idade:35, carac:"Experiência"}, {nome:"Caio Dantas", pos:"ATA", forca:72, idade:32, carac:"Finalização"}] },
            { id: "interlimeira", nome: "Inter de Limeira", escudo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/AA_Internacional_Limeira.png", forca: 66, elenco: [] },
            { id: "itabaiana", nome: "Itabaiana", escudo: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Associa%C3%A7%C3%A3o_Ol%C3%ADmpica_de_Itabaiana_logo.svg", forca: 67, elenco: [] },
            { id: "ituano", nome: "Ituano", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/7740.png", forca: 68, elenco: [] },
            { id: "maranhao", nome: "Maranhão", escudo: "https://upload.wikimedia.org/wikipedia/pt/2/2c/Maranhao_Atletico_Clube.png", forca: 65, elenco: [] },
            { id: "maringa", nome: "Maringá", escudo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Maring%C3%A1_Futebol_Clube.svg", forca: 68, elenco: [] },
            { id: "paysandu", nome: "Paysandu", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3450.png", forca: 70, elenco: [{nome:"Nicolas", pos:"ATA", forca:73, idade:35, carac:"Cabeceio"}] },
            { id: "santacruz", nome: "Santa Cruz", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6002.png", forca: 69, elenco: [{nome:"Gilvan", pos:"ZAG", forca:69, idade:31, carac:"Força"}] },
            { id: "voltaredonda", nome: "Volta Redonda", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6005.png", forca: 68, elenco: [] },
            { id: "ypiranga", nome: "Ypiranga-RS", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13766.png", forca: 68, elenco: [] }
        ],

        // --- SÉRIE D (2026 - SELEÇÃO CONFORME PDF) ---
        serieD: [
            { id: "abc", nome: "ABC", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6007.png", forca: 68, elenco: [] },
            { id: "aguasanta", nome: "Água Santa", escudo: "https://upload.wikimedia.org/wikipedia/commons/3/36/EC_%C3%81gua_Santa.png", forca: 66, elenco: [] },
            { id: "americarj", nome: "America-RJ", escudo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/America_Football_Club.svg", forca: 66, elenco: [] },
            { id: "americarn", nome: "América-RN", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6270.png", forca: 67, elenco: [] },
            { id: "aparecidense", nome: "Aparecidense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13759.png", forca: 66, elenco: [] },
            { id: "asa", nome: "ASA", escudo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Agremia%C3%A7%C3%A3o_Sportiva_Arapiraquense.svg", forca: 65, elenco: [] },
            { id: "brasilpelotas", nome: "Brasil de Pelotas", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10416.png", forca: 66, elenco: [] },
            { id: "brasiliense", nome: "Brasiliense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3461.png", forca: 66, elenco: [] },
            { id: "csa", nome: "CSA", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10418.png", forca: 68, elenco: [] },
            { id: "ferroviario", nome: "Ferroviário", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/10008.png", forca: 66, elenco: [] },
            { id: "gama", nome: "Gama", escudo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sociedade_Esportiva_do_Gama_Logo.svg", forca: 65, elenco: [] },
            { id: "joinville", nome: "Joinville", escudo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Joinville_Esporte_Clube_logo.svg", forca: 65, elenco: [] },
            { id: "madureira", nome: "Madureira", escudo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Madureira_Esporte_Clube_logo.svg", forca: 64, elenco: [] },
            { id: "portuguesa", nome: "Portuguesa", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/3458.png", forca: 67, elenco: [] },
            { id: "retro", nome: "Retrô", escudo: "https://upload.wikimedia.org/wikipedia/pt/e/e0/Retr%C3%B4_Futebol_Clube_Brasil.png", forca: 68, elenco: [] }, // Nota: Retrô listado na D no PDF pág 7, apesar de ter subido na vida real, segui o PDF
            { id: "sampaiocorrea", nome: "Sampaio Corrêa", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/6278.png", forca: 67, elenco: [{nome:"Pimentinha", pos:"ATA", forca:70, idade:37, carac:"Drible"}] },
            { id: "saojose", nome: "São José-RS", escudo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/EC_S%C3%A3o_Jos%C3%A9.svg", forca: 65, elenco: [] },
            { id: "tombense", nome: "Tombense", escudo: "https://a.espncdn.com/i/teamlogos/soccer/500/13768.png", forca: 68, elenco: [] },
            { id: "treze", nome: "Treze", escudo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Treze_Futebol_Clube_logo.svg", forca: 66, elenco: [] },
            { id: "xvpiracicaba", nome: "XV de Piracicaba", escudo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Esporte_Clube_XV_de_Novembro_%28Piracicaba%29_logo.png", forca: 65, elenco: [] }
        ]
    }
};

// --- COMPATIBILIDADE ---
if (typeof window !== 'undefined') {
    window.Database = database;
    window.database = database;
}
