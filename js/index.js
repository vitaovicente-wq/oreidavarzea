// Habilita botão Continuar Carreira se houver progresso
const btnContinue = document.getElementById('btnContinueGame');
if (localStorage.getItem('userData')) btnContinue.disabled = false;
