document.addEventListener('DOMContentLoaded', () => {
    const btnContinueGame = document.getElementById('btnContinueGame');
    const btnNewGame = document.getElementById('btnNewGame');
    const newGameForm = document.getElementById('newGameForm');
    const userNameInput = document.getElementById('userName');
    const cityNameInput = document.getElementById('cityName');
    const btnStartGame = document.getElementById('btnStartGame');
    const linkStartGame = document.getElementById('linkStartGame');

    if (localStorage.getItem('seasonData')) {
        btnContinueGame.disabled = false;
    }

    btnNewGame.addEventListener('click', () => {
        newGameForm.style.display = 'block';
        btnNewGame.style.display = 'none';
        btnContinueGame.style.display = 'none';
    });
    
    function validateNewGameForm() {
        const userName = userNameInput.value.trim();
        const cityName = cityNameInput.value.trim();
        btnStartGame.disabled = !(userName && cityName);
    }
    userNameInput.addEventListener('input', validateNewGameForm);
    cityNameInput.addEventListener('input', validateNewGameForm);

    linkStartGame.addEventListener('click', (event) => {
        if (btnStartGame.disabled) {
            event.preventDefault();
            return;
        }

        const teamNames = [ "Tsunami da ZL", "Galácticos do Grajaú", "Ajax da Vila Sônia", "Real Madruga", "Mulekes da Vila", "Fúria do Capão Redondo", "EC Beira-Rio", "Juventus da Mooca", "Parma da Augusta", "Boca do Lixo FC" ];
        const newTeamName = teamNames[Math.floor(Math.random() * teamNames.length)];

        const userData = {
            userName: userNameInput.value.trim(),
            cityName: cityNameInput.value.trim(),
            teamName: newTeamName
        };
        localStorage.setItem('userData', JSON.stringify(userData));

        localStorage.removeItem('seasonData');
        localStorage.removeItem('varzeaUniverse');
        localStorage.removeItem('elencoDoTime');
        localStorage.removeItem('financasDoTime');
        localStorage.removeItem('teamHistory');
        localStorage.removeItem('teamStats');
        localStorage.removeItem('zapMessages');
        localStorage.removeItem('escalacaoFinal');
        localStorage.removeItem('formacaoAtual');
        localStorage.removeItem('treinoRealizado');
        localStorage.removeItem('lastMatchResult');
        localStorage.removeItem('currentMatchInfo');
        localStorage.removeItem('matchInProgress');
    });
});
