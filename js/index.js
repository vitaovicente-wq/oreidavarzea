const teamNameInput = document.getElementById('teamName');
const userNameInput = document.getElementById('userName');
const cityNameInput = document.getElementById('cityName');
const btnToTela2 = document.getElementById('btnToTela2');
const linkTela2 = document.getElementById('linkTela2');

function validateForm() {
    const teamName = teamNameInput.value.trim();
    const userName = userNameInput.value.trim();
    const cityName = cityNameInput.value.trim();
    btnToTela2.disabled = !(teamName && userName && cityName);
}

teamNameInput.addEventListener('input', validateForm);
userNameInput.addEventListener('input', validateForm);
cityNameInput.addEventListener('input', validateForm);

linkTela2.addEventListener('click', function(event) {
    if (btnToTela2.disabled) {
      event.preventDefault();
      return;
    }

    // Salva os novos dados do usuário
    const userData = {
      teamName: teamNameInput.value.trim(),
      userName: userNameInput.value.trim(),
      cityName: cityNameInput.value.trim()
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    // Limpa todos os dados da temporada e do time anterior para começar um jogo novo do zero
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
