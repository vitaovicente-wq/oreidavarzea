const headerTitle = document.getElementById('headerTitle');
const nextMatchInfo = document.getElementById('nextMatchInfo');
const linkPlayMatch = document.getElementById('linkPlayMatch');

const userData = JSON.parse(localStorage.getItem('userData')) || {teamName:'O Rei da Várzea'};
headerTitle.textContent = userData.teamName;

// Exemplo de calendário simples
let calendario = [
  {adversario:'Time A', data:'28/09', rodada:1},
  {adversario:'Time B', data:'05/10', rodada:2}
];

function renderNextMatch() {
  if(calendario.length==0){ nextMatchInfo.innerHTML='<p class="muted">Sem partidas.</p>'; return; }
  const proximo = calendario[0];
  nextMatchInfo.innerHTML = `<p>${proximo.data} - vs ${proximo.adversario}</p>`;
}

renderNextMatch();

// Gerar tabelas fictícias de torneio
const torneioTables = document.getElementById('torneioTables');
torneioTables.innerHTML = '<p>Rodada 1: Seu Time vs Time A</p><p>Rodada 2: Seu Time vs Time B</p>';
