let hired = JSON.parse(localStorage.getItem('elencoDoTime')) || [
  {id:1,name:'Jogador 1',pos:'Goleiro',skill:80,health:90,salarioJogo:100,age:25,foot:'Direito',apresentacao:'Seguro no gol'},
  {id:2,name:'Jogador 2',pos:'Atacante',skill:70,health:85,salarioJogo:120,age:24,foot:'Esquerdo',apresentacao:'Rápido e habilidoso'}
];

const pitch = document.getElementById('pitch');
const bench = document.getElementById('bench');
const formationSelect = document.getElementById('formationSelect');
const btnPlayMatch = document.getElementById('btnPlayMatch');
const linkTela4 = document.getElementById('linkTela4');

let formation = formationSelect.value;

// Função simples para desenhar slots
function drawPitch() {
  pitch.innerHTML='';
  hired.forEach(j=>{
    const div = document.createElement('div');
    div.className='position-slot';
    div.dataset.playerId=j.id;
    div.innerHTML=`<strong>${j.name}</strong><div>${j.pos}</div>`;
    div.onclick=()=>alert(`Clicou em ${j.name}`);
    pitch.appendChild(div);
  });
}

function populateBench() {
  bench.innerHTML='';
  hired.forEach(j=>{
    const div=document.createElement('div');
    div.className='player-card';
    div.innerHTML=`<strong>${j.name}</strong> • ${j.pos}`;
    bench.appendChild(div);
  });
}

drawPitch();
populateBench();

// Habilita jogar se tiver pelo menos 11 jogadores
btnPlayMatch.disabled = hired.length<11;
linkTela4.addEventListener('click', e=>{
  if(btnPlayMatch.disabled){ e.preventDefault(); alert("Escale 11 jogadores!"); }
});
formationSelect.onchange = (e)=>{ formation=e.target.value; drawPitch(); };
