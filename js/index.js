document.addEventListener('DOMContentLoaded', () => {
    const btnContinueGame = document.getElementById('btnContinueGame');
    if (localStorage.getItem('seasonData')) {
        btnContinueGame.disabled = false;
    }
    document.getElementById('btnNewGame').addEventListener('click', () => {
        // Limpa o jogo antigo ANTES de ir para a tela de escolha
        localStorage.clear(); 
    });
});
