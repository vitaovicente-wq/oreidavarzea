O Rei da Várzea — Protótipo
Este é um protótipo de um jogo de gerenciamento de time de futebol de várzea, implementado em um único arquivo HTML. O objetivo é simular a experiência de um "manager", onde o jogador deve montar e escalar um time de futebol com recursos limitados.

Funcionalidades do Protótipo
O jogo é dividido em três telas principais, cada uma com um conjunto de funcionalidades:

Tela 1: Cadastro
Objetivo: Início do jogo e coleta de dados básicos do usuário.

Campos:

Nome do seu time

Seu nome

Cidade

Validação: O botão para a próxima tela ("Contratar jogadores") só é habilitado quando todos os campos são preenchidos.

Tela 2: Mercado de Jogadores
Objetivo: Gerenciar a contratação de jogadores para o seu elenco.

Recursos:

Dinheiro em caixa: Começa com R$ 5.000,00.

Tabela de jogadores: Exibe 42 jogadores fictícios com seus atributos (Nome, Posição, Pé, Idade e Salário).

Contratação: O jogador pode selecionar até 22 atletas para o seu elenco. Cada contratação subtrai o salário do jogador do seu dinheiro em caixa.

Regras de contratação:

Não é possível contratar mais de 22 jogadores.

O jogador não pode contratar um atleta se não tiver saldo suficiente em caixa.

Avanço de tela: O botão "Escalar time" é habilitado apenas quando 22 jogadores são contratados.

Tela 3: Escalação
Objetivo: Montar o time titular com os jogadores contratados.

Funcionalidades:

Campo de jogo: Representação visual de um campo de futebol com 11 posições para escalação (GK, LB, CB1, CB2, RB, DM, CM1, CM2, LW, ST, RW).

Banco de reservas: Exibe os jogadores contratados.

Drag & Drop: O jogador pode arrastar um jogador do banco de reservas para uma das posições no campo.

Gerenciamento:

Um clique em um jogador no campo o remove da posição, mandando-o de volta para o banco.

É possível voltar para o mercado de jogadores para ajustar o elenco.

Estrutura do Código
O código HTML é auto-contido em um único arquivo, utilizando CSS incorporado (<style>) para o layout e JavaScript incorporado (<script>) para a lógica do jogo.

HTML: Define a estrutura de três divs que atuam como as telas do jogo, controladas por JavaScript para serem exibidas ou ocultadas.

CSS: Estiliza os elementos para criar uma interface simples e responsiva, com destaque para o campo de futebol e os cartões dos jogadores.

JavaScript:

Gerencia a navegação entre as telas.

Controla a lógica de contratação, incluindo o limite de jogadores e o saldo do caixa.

Gera os dados fictícios dos jogadores com base em distribuições predefinidas de posições e pés dominantes.

Implementa a funcionalidade de arrastar e soltar (Drag & Drop) para a escalação do time.
