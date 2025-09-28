document.addEventListener('DOMContentLoaded', () => {
    const btnContinueGame = document.getElementById('btnContinueGame');
    if (localStorage.getItem('seasonData')) {
        btnContinueGame.disabled = false;
    }
    document.getElementById('btnNewGame').addEventListener('click', () => {
        localStorage.clear(); 
    });
});
