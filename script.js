// v7_dancing_fixed: keep features + Dancing Script + smaller auto-fit photo
const gate = document.getElementById('gate');
const gateForm = document.getElementById('gate-form');
const gatePw = document.getElementById('gate-pw');
const gateMsg = document.getElementById('gate-msg');
const eye = document.getElementById('toggle-eye');
const lock = document.getElementById('lock');
const main = document.getElementById('main');
const dateEl = document.getElementById('date');
const balloons = document.getElementById('balloons');
const flowers = document.getElementById('flowers');
const message = document.getElementById('message');
const confetti = document.getElementById('confettiCanvas');
const ctx = confetti.getContext('2d');

let celebrateCount = 0;
let reductionInterval = null;
const FLOWER_CAP = 28;
const FLOWER_STEADY = 6;
const FLOWER_SPAWN_INITIAL = 10;
const FLOWER_SPAWN_REDUCED = 3;

// Date
const todayIso = new Date().toISOString().slice(0,10);
dateEl.textContent = new Date(todayIso).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });

// Password gate
const PASS = "tiokuuu";
function openGate(){
  lock.classList.add('unlocked');
  setTimeout(()=>{
    gate.style.opacity = '0';
    gate.style.transition = 'opacity .55s ease';
    setTimeout(()=>{ gate.style.display='none'; }, 560);
    main.hidden = false;
    sizeCanvas();
    gentleConfetti();
    spawnBalloons(16);
    spawnFlowers(8);
    message.classList.add('enter'); // entrance animation
  }, 420);
  }
gateForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const ok = gatePw.value.trim() === PASS;
  if(ok){ openGate(); }
  else{
    gateMsg.textContent = "Password salah 🤭";
    gateForm.classList.remove('shake'); void gateForm.offsetWidth; gateForm.classList.add('shake');
    setTimeout(()=> gateMsg.textContent = "", 1500);
  }
});
// Eye toggle
eye.addEventListener('click', ()=>{
  gatePw.type = gatePw.type === 'password' ? 'text' : 'password';
  eye.textContent = gatePw.type === 'password' ? '👁️' : '🙈';
});

// Balloons
function spawnBalloons(n=14){
  for(let i=0;i<n;i++){
    const b = document.createElement('div');
    b.className = 'balloon';
    const left = Math.random()*100;
    const size = 20 + Math.random()*16;
    const dur = 10 + Math.random()*8;
    const delay = Math.random()*-8;
    b.style.left = left + '%';
    b.style.width = size + 'px';
    b.style.height = size*1.3 + 'px';
    b.style.setProperty('--dur', dur+'s');
    b.style.animationDelay = delay + 's, 0s';
    balloons.appendChild(b);
  }
}

// Flowers
const flowerChars = ['❀','✿','✾','❁','🌸','💗'];
function currentFlowerCount(){ return flowers ? flowers.querySelectorAll('.flower').length : 0; }
function spawnFlowers(n=10){
  if(!flowers) return;
  const cur = currentFlowerCount();
  const toAdd = Math.max(0, Math.min(n, FLOWER_CAP - cur));
  for(let i=0;i<toAdd;i++){
    const f = document.createElement('span');
    f.className = 'flower';
    f.textContent = flowerChars[Math.floor(Math.random()*flowerChars.length)];
    f.style.left = (5 + Math.random()*90) + '%';
    f.style.top  = (-10 + Math.random()*5) + '%';
    f.style.setProperty('--dur', (7 + Math.random()*7) + 's');
    f.style.fontSize = (14 + Math.random()*10) + 'px';
    flowers.appendChild(f);
    setTimeout(()=>{ if(f.parentNode) f.parentNode.removeChild(f); }, 15000);
  }
}
function reduceFlowersGradually(){
  if(reductionInterval) return;
  reductionInterval = setInterval(()=>{
    const list = Array.from(flowers.querySelectorAll('.flower'));
    if(list.length <= FLOWER_STEADY){
      clearInterval(reductionInterval);
      reductionInterval = null;
      return;
    }
    const idx = Math.floor(Math.random()*list.length);
    const el = list[idx];
    el.classList.add('fade');
    setTimeout(()=>{ if(el && el.parentNode) el.parentNode.removeChild(el); }, 620);
  }, 350);
}

// Confetti
function sizeCanvas(){ confetti.width = innerWidth; confetti.height = innerHeight }
addEventListener('resize', sizeCanvas, {passive:true});
let pieces = [];
function confettiSpawn(n=160){
  for(let i=0;i<n;i++){
    pieces.push({
      x: Math.random()*confetti.width,
      y: -20 - Math.random()*confetti.height*.25,
      s: 3+Math.random()*4,
      a: Math.random()*Math.PI*2,
      v: 1+Math.random()*2,
      rot: Math.random()*360,
      color: ['#ffb3cf','#ffd6e7','#ffcfe1','#ffe1ec'][Math.floor(Math.random()*4)]
    });
  }
}
function confettiDraw(){
  const w = confetti.width, h = confetti.height;
  ctx.clearRect(0,0,w,h);
  pieces.forEach(p=>{
    p.y += p.v; p.x += Math.sin(p.a)*0.8; p.rot += p.v*6;
    if(p.y > h+20) p.y = -10, p.x = Math.random()*w;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI/180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s*1.6);
    ctx.restore();
  });
  requestAnimationFrame(confettiDraw);
}
confettiDraw();

const btn = document.getElementById('btn-confetti');
btn.addEventListener('click', ()=>{
  celebrateCount++;
  confettiSpawn(200);
  // Subtle flash only (no movement)
  message.classList.remove('flash'); void message.offsetWidth; message.classList.add('flash');

  if(celebrateCount <= 5){
    spawnFlowers(FLOWER_SPAWN_INITIAL);
  } else {
    spawnFlowers(FLOWER_SPAWN_REDUCED);
    reduceFlowersGradually();
  }
});

function gentleConfetti(){ setTimeout(()=> confettiSpawn(120), 400); }


// === Scroll reveal using IntersectionObserver ===
(function(){
  const els = document.querySelectorAll('.scroll-anim');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach(el => el.classList.add('show'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  els.forEach(el => io.observe(el));
})();





// === Birthday cake logic (finalize) ===
(function(){
  let cakeOverlay = document.getElementById('cakeOverlay');
  if(!cakeOverlay){
    const div = document.createElement('div');
    div.className = 'cake-overlay'; div.id = 'cakeOverlay'; div.setAttribute('aria-hidden','true');
    div.innerHTML = `<div class="cake-wrap" role="dialog" aria-label="Kue ulang tahun — klik untuk meniup lilin">
      <div class="cake">
        <div class="cake-layer top"></div>
        <div class="cake-layer mid"></div>
        <div class="cake-layer bottom"></div>
        <div class="plate"></div>
        <div class="candle"><div class="flame"></div></div>
      </div>
      <div class="tip">Klik kuenya untuk “meniup” lilin 🎂</div>
    </div>`;
    document.body.appendChild(div);
    cakeOverlay = div;
  }

  function showCake(){
    cakeOverlay.classList.remove('blow');
    cakeOverlay.classList.add('show');
    cakeOverlay.setAttribute('aria-hidden','false');
  }
  function hideCake(){
    cakeOverlay.classList.add('blow');
    setTimeout(()=>{
      cakeOverlay.classList.remove('show');
      cakeOverlay.setAttribute('aria-hidden','true');
    }, 650);
  }

  window.showCake = showCake;
  window.hideCake = hideCake;

  const btn = document.getElementById('btn-confetti');
  if(btn){ btn.addEventListener('click', ()=> setTimeout(showCake, 60)); }

  document.addEventListener('click', (e)=>{
    const target = e.target;
    const btnLike = target.closest && target.closest('button,.btn');
    const text = (btnLike ? btnLike.textContent : target.textContent) || '';
    if (/rayakan/i.test(text)) setTimeout(showCake, 60);
  }, true);

  cakeOverlay.addEventListener('click', hideCake);
  console.log('[Cake FINAL] overlay:', !!cakeOverlay, 'btn:', !!btn);
})();