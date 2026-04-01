const bots = [
  { id: 'b1', name: 'Research Bot', desc: 'Web kaynaklarını tarar ve özet üretir.', status: 'running', progress: 72 },
  { id: 'b2', name: 'Planner Bot', desc: 'Görev planı çıkarır ve sıraya alır.', status: 'idle', progress: 35 },
  { id: 'b3', name: 'Monitor Bot', desc: 'Sistem durumunu anlık takip eder.', status: 'running', progress: 88 },
  { id: 'b4', name: 'Publisher Bot', desc: 'İçerikleri yayına hazırlar.', status: 'error', progress: 20 },
  { id: 'b5', name: 'Memory Bot', desc: 'Önemli notları indeksler.', status: 'running', progress: 61 },
  { id: 'b6', name: 'Notify Bot', desc: 'Bildirimleri ve uyarıları yönetir.', status: 'idle', progress: 43 }
];

const statusMap = {
  running: { text: 'RUNNING', cls: 'running' },
  idle: { text: 'IDLE', cls: 'idle' },
  error: { text: 'ERROR', cls: 'error' }
};

const el = {
  grid: document.getElementById('botGrid'),
  total: document.getElementById('totalCount'),
  active: document.getElementById('activeCount'),
  clock: document.getElementById('clock'),
  running: document.getElementById('runningKpi'),
  idle: document.getElementById('idleKpi'),
  error: document.getElementById('errorKpi'),
  refresh: document.getElementById('refreshBtn')
};

function cardTemplate(bot) {
  const st = statusMap[bot.status] || statusMap.idle;
  return `
    <article class="bot-card">
      <div class="bot-top">
        <h4 class="bot-name">${bot.name}</h4>
        <span class="status-pill ${st.cls}"><span class="dot"></span>${st.text}</span>
      </div>
      <p class="bot-desc">${bot.desc}</p>
      <div class="progress"><div class="bar" style="width:${bot.progress}%"></div></div>
    </article>
  `;
}

function render() {
  el.grid.innerHTML = bots.map(cardTemplate).join('');

  const running = bots.filter(b => b.status === 'running').length;
  const idle = bots.filter(b => b.status === 'idle').length;
  const error = bots.filter(b => b.status === 'error').length;

  el.total.textContent = bots.length;
  el.active.textContent = running;
  el.running.textContent = running;
  el.idle.textContent = idle;
  el.error.textContent = error;
}

function tickClock() {
  const now = new Date();
  el.clock.textContent = now.toLocaleTimeString('tr-TR', { hour12: false });
}

function animateData() {
  for (const b of bots) {
    if (b.status === 'running') b.progress = Math.min(100, b.progress + Math.floor(Math.random() * 8));
    if (b.status === 'idle') b.progress = Math.max(5, b.progress - Math.floor(Math.random() * 3));
    if (b.status === 'error') b.progress = Math.max(0, b.progress - Math.floor(Math.random() * 2));

    if (b.progress >= 100 && b.status === 'running') {
      b.status = 'idle';
      b.progress = 45;
    }
  }

  if (Math.random() > 0.82) {
    const randomBot = bots[Math.floor(Math.random() * bots.length)];
    const states = ['running', 'idle', 'error'];
    randomBot.status = states[Math.floor(Math.random() * states.length)];
  }

  render();
}

el.refresh.addEventListener('click', () => {
  animateData();
  el.refresh.textContent = 'Yenilendi ✓';
  setTimeout(() => (el.refresh.textContent = 'Yenile'), 1200);
});

render();
tickClock();
setInterval(tickClock, 1000);
setInterval(animateData, 3500);
