const LIVE_API = localStorage.getItem('MURATTIY_API') || '';

const bots = [
  { id: 'b1', name: 'Research Bot', desc: 'Web kaynaklarını tarar ve özet üretir.', status: 'running', progress: 72, task: 'ana sayfayı tarıyor' },
  { id: 'b2', name: 'Planner Bot', desc: 'Görev planı çıkarır ve sıraya alır.', status: 'idle', progress: 35, task: 'ayarları kontrol ediyor' },
  { id: 'b3', name: 'Monitor Bot', desc: 'Sistem durumunu anlık takip eder.', status: 'running', progress: 88, task: 'log analizi yapıyor' },
  { id: 'b4', name: 'Publisher Bot', desc: 'İçerikleri yayına hazırlar.', status: 'error', progress: 20, task: 'hata düzeltiyor' },
  { id: 'b5', name: 'Memory Bot', desc: 'Önemli notları indeksler.', status: 'running', progress: 61, task: 'veri topluyor' },
  { id: 'b6', name: 'Notify Bot', desc: 'Bildirimleri ve uyarıları yönetir.', status: 'idle', progress: 43, task: 'rapor sayfasına geçti' }
];

const statusMap = {
  running: { text: 'RUNNING', cls: 'running' },
  idle: { text: 'IDLE', cls: 'idle' },
  error: { text: 'ERROR', cls: 'error' }
};

const taskPool = [
  'ana sayfayı tarıyor', 'ürünleri geziyor', 'rapor sayfasına geçti',
  'ayarları kontrol ediyor', 'veri topluyor', 'log analizi yapıyor', 'hata düzeltiyor'
];

const mapNodes = [
  { name: 'Ana Sayfa', x: 14, y: 20 },
  { name: 'Ürünler', x: 40, y: 36 },
  { name: 'Raporlar', x: 68, y: 24 },
  { name: 'Ayarlar', x: 84, y: 54 },
  { name: 'Bildirim', x: 58, y: 74 },
  { name: 'Profil', x: 24, y: 70 }
];

const el = {
  grid: document.getElementById('botGrid'),
  total: document.getElementById('totalCount'),
  active: document.getElementById('activeCount'),
  clock: document.getElementById('clock'),
  running: document.getElementById('runningKpi'),
  idle: document.getElementById('idleKpi'),
  error: document.getElementById('errorKpi'),
  refresh: document.getElementById('refreshBtn'),
  arena: document.getElementById('stageArena'),
  stageSub: document.getElementById('stageSub'),
  terminal: document.getElementById('terminalLog')
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

function tickClock() { el.clock.textContent = new Date().toLocaleTimeString('tr-TR', { hour12: false }); }

function terminalPush(text) {
  if (!el.terminal) return;
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.innerHTML = `<span class="terminal-prompt">$</span> ${text}`;
  el.terminal.appendChild(line);
  while (el.terminal.children.length > 24) el.terminal.removeChild(el.terminal.firstChild);
  el.terminal.scrollTop = el.terminal.scrollHeight;
}

function applyLiveState(payload) {
  if (!payload?.bots || !Array.isArray(payload.bots)) return;
  bots.splice(0, bots.length, ...payload.bots.map((b, i) => ({
    id: b.id || `bot-${i}`,
    name: b.name || `Bot ${i + 1}`,
    desc: b.task || 'canlı görev',
    status: ['running', 'idle', 'error'].includes(b.status) ? b.status : 'idle',
    progress: Number.isFinite(Number(b.progress)) ? Number(b.progress) : 0,
    task: b.task || 'çalışıyor'
  })));
  render();
  terminalPush(`live update alındı (${new Date().toLocaleTimeString('tr-TR')})`);
}

function animateData() {
  for (const b of bots) {
    if (b.status === 'running') b.progress = Math.min(100, b.progress + Math.floor(Math.random() * 8));
    if (b.status === 'idle') b.progress = Math.max(5, b.progress - Math.floor(Math.random() * 3));
    if (b.status === 'error') b.progress = Math.max(0, b.progress - Math.floor(Math.random() * 2));
    if (b.progress >= 100 && b.status === 'running') { b.status = 'idle'; b.progress = 45; }
  }
  if (Math.random() > 0.82) {
    const r = bots[Math.floor(Math.random() * bots.length)];
    r.status = ['running', 'idle', 'error'][Math.floor(Math.random() * 3)];
    r.task = taskPool[Math.floor(Math.random() * taskPool.length)];
  }
  render();
}

function toPixel(arena, point) { return { x: (point.x / 100) * arena.clientWidth, y: (point.y / 100) * arena.clientHeight }; }

function setupMapNodes() {
  mapNodes.forEach((p) => {
    const n = document.createElement('div');
    n.className = 'map-node';
    n.style.left = `${p.x}%`;
    n.style.top = `${p.y}%`;
    n.textContent = p.name;
    el.arena.appendChild(n);
  });
}

function setupMiniBots() {
  setupMapNodes();
  const mini = bots.map((b, i) => {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'mini-bot';
    nodeEl.textContent = i + 1;
    nodeEl.dataset.task = b.task || taskPool[Math.floor(Math.random() * taskPool.length)];
    el.arena.appendChild(nodeEl);
    const from = mapNodes[i % mapNodes.length];
    const to = mapNodes[(i + 2) % mapNodes.length];
    const start = toPixel(el.arena, from);
    const end = toPixel(el.arena, to);
    return { bot: b, node: nodeEl, from, to, x: start.x, y: start.y, tx: end.x, ty: end.y, speed: 0.014 + Math.random() * 0.01, progress: Math.random() * 0.6, pathTick: 0 };
  });

  function pickNextTarget(m) {
    let next = mapNodes[Math.floor(Math.random() * mapNodes.length)];
    while (next === m.to) next = mapNodes[Math.floor(Math.random() * mapNodes.length)];
    m.from = m.to; m.to = next;
    const fromPx = toPixel(el.arena, m.from);
    const toPx = toPixel(el.arena, m.to);
    m.x = fromPx.x; m.y = fromPx.y; m.tx = toPx.x; m.ty = toPx.y; m.progress = 0;
    m.node.dataset.task = `${next.name} → ${(m.bot.task || taskPool[Math.floor(Math.random() * taskPool.length)])}`;
    m.node.classList.add('hop'); setTimeout(() => m.node.classList.remove('hop'), 320);
  }

  function frame() {
    for (const m of mini) {
      m.progress += m.speed;
      if (m.progress >= 1) pickNextTarget(m);
      m.x = m.x + (m.tx - m.x) * 0.045;
      m.y = m.y + (m.ty - m.y) * 0.045;
      m.pathTick++;
      if (m.pathTick > 200) { m.pathTick = 0; m.node.dataset.task = `${m.to.name} → ${(m.bot.task || taskPool[Math.floor(Math.random() * taskPool.length)])}`; }
      m.node.style.left = `${m.x}px`;
      m.node.style.top = `${m.y}px`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  setInterval(() => {
    const actor = mini[Math.floor(Math.random() * mini.length)];
    el.stageSub.textContent = `${actor.bot.name} web sitede geziyor: ${actor.node.dataset.task}`;
  }, 1300);
}

async function startLiveMode() {
  try {
    terminalPush(`live api bağlanıyor: ${LIVE_API}`);
    const r = await fetch(`${LIVE_API}/state`, { cache: 'no-store' });
    const s = await r.json();
    applyLiveState(s);

    const es = new EventSource(`${LIVE_API}/events`);
    es.addEventListener('snapshot', (e) => applyLiveState(JSON.parse(e.data)));
    es.addEventListener('update', (e) => applyLiveState(JSON.parse(e.data)));
    es.addEventListener('error', () => terminalPush('live bağlantıda kesinti')); 
  } catch {
    terminalPush('live api erişilemedi, demo moda geçildi');
    startDemoMode();
  }
}

function startDemoMode() {
  terminalPush('demo chat servisi başlatıldı');
  setInterval(() => {
    const b = bots[Math.floor(Math.random() * bots.length)];
    terminalPush(`${b.name}: ${statusMap[b.status].text} | ${Math.round(b.progress)}% | ${b.task || taskPool[Math.floor(Math.random() * taskPool.length)]}`);
  }, 1600);
  setInterval(animateData, 3500);
}

el.refresh.addEventListener('click', () => {
  animateData();
  terminalPush('manuel yenileme tetiklendi');
  el.refresh.textContent = 'Yenilendi ✓';
  setTimeout(() => (el.refresh.textContent = 'Yenile'), 1200);
});

render();
setupMiniBots();
tickClock();
setInterval(tickClock, 1000);
if (LIVE_API) startLiveMode(); else startDemoMode();
