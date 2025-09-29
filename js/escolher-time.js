// Lista de times de exemplo
const times = {
  reis: [{ id:1,name:'Rei do Bairro',desc:'Time lendário'}],
  deuses: [{ id:2,name:'Deus da Cidade',desc:'Time forte da cidade'}],
  gigantes: [{ id:3,name:'Gigantes do Bairro',desc:'Disponível para escolha'}]
};

function renderTimes() {
  ['reis','deuses','gigantes'].forEach(tier=>{
    const container = document.getElementById(tier+'Grid');
    container.innerHTML = '';
    times[tier].forEach(t=>{
      const div = document.createElement('div');
      div.className = 'team-card';
      div.innerHTML = `<strong>${t.name}</strong><p>${t.desc}</p>`;
      div.onclick = () => selectTeam(t);
      container.appendChild(div);
    });
  });
}

function selectTeam(time) {
  localStorage.setItem('userData', JSON.stringify({teamId: time.id, teamName: time.name}));
  alert(`Você escolheu: ${time.name}`);
  window.location.href = 'temporada.html';
}

renderTimes();

// Modal de detalhes
const modal = document.getElementById('teamDetailModal');
const closeModal = document.getElementById('teamDetailModalClose');
closeModal.onclick = () => modal.style.display='none';
window.onclick = (e)=>{if(e.target==modal) modal.style.display='none';};
