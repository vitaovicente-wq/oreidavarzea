document.addEventListener('DOMContentLoaded', () => {
    const btnContinueGame = document.getElementById('btnContinueGame');
    if (localStorage.getItem('seasonData')) {
        btnContinueGame.disabled = false;
    }
});
