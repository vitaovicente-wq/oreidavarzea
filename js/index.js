// Habilita o botão "Continuar Carreira" se houver progresso salvo
const btnContinue = document.getElementById('btnContinueGame');
if (localStorage.getItem('userData')) btnContinue.disabled = false;
