const LIVE_API = localStorage.getItem('MURATTIY_API') || 'https://murattiy-live-api.murattiylive.workers.dev';

const bots = [
  { id: 'b1', name: 'Research Bot', desc: 'Web kaynaklarını tarar ve özet üretir.', status: 'running', progress: 72, task: 'ana sayfayı tarıyor' },
  { id: 'b2', name: 'Planner Bot', desc: 'Görev planı çıkarır ve sıraya alır.', status: 'idle', progress: 35, task: 'ayarları kontrol ediyor' },
  { id: 'b3', name: 'Monitor Bot', desc: 'Sistem durumunu anlık takip eder.', status: 'running', progress: 88, task: 'log analizi yapıyor' }
];

const statusMap = {
  running: { text: 'RUNNING', cls: 'running' },
  idle: { text: 'IDLE', cls: 'idle' },
  error: { text: 'ERROR', cls: 'error' }
};

const demoTasks = ['ana sayfa', 'rapor', 'ayarlar', 'profil', 'ürünler', 'bildirim'];

const el = {
  grid: document.getElementById('botGrid'),
  total: document.getElementById('totalCount'),
  active: document.getElementById('activeCount'),
  clock: document.getElementById('clock'),
  running: document.getElementById('runningKpi'),
  idle: document.getElementById('idleKpi'),
  error: document.getElementById('errorKpi'),
  refresh: document.getElementById('refreshBtn'),
  terminal: document.getElementById('terminalLog'),
  roam: document.getElementById('roamLayer')
};

let roamActors = [];
const MIN_VISUAL_BOTS = 6;

function cardTemplate(bot) {
  const st = statusMap[bot.status] || statusMap.idle;
  return `
    <article class="bot-card">
      <div class="bot-top">
        <h4 class="bot-name">${bot.name}</h4>
        <span class="status-pill ${st.cls}"><span class="dot"></span>${st.text}</span>
      </div>
      <p class="bot-desc">${bot.task || bot.desc || 'beklemede'}</p>
      <div class="progress"><div class="bar" style="width:${bot.progress || 0}%"></div></div>
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
  el.clock.textContent = new Date().toLocaleTimeString('tr-TR', { hour12: false });
}

function terminalPush(text) {
  if (!el.terminal) return;
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.innerHTML = `<span class="terminal-prompt">$</span> ${text}`;
  el.terminal.appendChild(line);
  while (el.terminal.children.length > 24) el.terminal.removeChild(el.terminal.firstChild);
  el.terminal.scrollTop = el.terminal.scrollHeight;
}

function getAnchors() {
  const selectors = ['.topbar', '.hero', '.terminal-chat', '.bots-section', '.footer'];
  const anchors = [];

  selectors.forEach(sel => {
    const n = document.querySelector(sel);
    if (!n) return;
    const r = n.getBoundingClientRect();
    anchors.push({
      name: sel,
      x: Math.max(24, Math.min(window.innerWidth - 24, r.left + r.width / 2)),
      y: Math.max(24, Math.min(window.innerHeight - 24, r.top + r.height / 2))
    });
  });

  for (let i = 0; i < 6; i++) {
    anchors.push({
      name: `rand-${i}`,
      x: 40 + Math.random() * (window.innerWidth - 80),
      y: 60 + Math.random() * (window.innerHeight - 120)
    });
  }
  return anchors;
}

function pickTargetByTask(task, anchors) {
  const t = (task || '').toLowerCase();
  if (t.includes('rapor')) return anchors.find(a => a.name.includes('bots')) || anchors[0];
  if (t.includes('ayar')) return anchors.find(a => a.name.includes('topbar')) || anchors[0];
  if (t.includes('profil')) return anchors.find(a => a.name.includes('hero')) || anchors[0];
  if (t.includes('bildirim')) return anchors.find(a => a.name.includes('terminal')) || anchors[0];
  return anchors[Math.floor(Math.random() * anchors.length)];
}

function syncRoamBots() {
  const visualBots = [];
  const count = Math.max(MIN_VISUAL_BOTS, bots.length);
  for (let i = 0; i < count; i++) {
    const base = bots[i % Math.max(1, bots.length)] || { id: 'main', name: 'Main', status: 'idle', task: 'beklemede' };
    visualBots.push({ ...base, visualId: `${base.id}-${i}` });
  }

  const existing = new Map(roamActors.map(a => [a.botId, a]));
  const next = [];

  for (let i = 0; i < visualBots.length; i++) {
    const b = visualBots[i];
    let actor = existing.get(b.visualId);
    if (!actor) {
      const n = document.createElement('div');
      n.className = `roam-bot ${b.status || 'idle'}`;
      n.textContent = '';
      n.dataset.task = b.task || 'beklemede';
      el.roam.appendChild(n);

      actor = {
        botId: b.visualId,
        node: n,
        x: 50 + Math.random() * (window.innerWidth - 100),
        y: 80 + Math.random() * (window.innerHeight - 160),
        tx: 0,
        ty: 0,
        task: b.task || 'beklemede',
        status: b.status || 'idle',
        speed: 0.03
      };
    }

    actor.task = b.task || 'beklemede';
    actor.status = b.status || 'idle';
    actor.node.className = `roam-bot ${actor.status}`;
    actor.node.dataset.task = actor.task;
    next.push(actor);
  }

  roamActors.forEach(a => {
    if (!next.find(n => n.botId === a.botId)) a.node.remove();
  });

  roamActors = next;
  assignNewTargets();
}

function assignNewTargets() {
  const anchors = getAnchors();
  roamActors.forEach(a => {
    const pick = pickTargetByTask(a.task, anchors);
    a.tx = pick.x;
    a.ty = pick.y;
    a.speed = a.status === 'running' ? 0.06 : a.status === 'error' ? 0.03 : 0.04;
  });
}

function roamFrame() {
  roamActors.forEach(a => {
    a.x += (a.tx - a.x) * a.speed;
    a.y += (a.ty - a.y) * a.speed;

    if (Math.abs(a.tx - a.x) < 8 && Math.abs(a.ty - a.y) < 8) {
      const anchors = getAnchors();
      const pick = pickTargetByTask(a.task, anchors);
      a.tx = pick.x;
      a.ty = pick.y;
    }

    a.node.style.left = `${a.x}px`;
    a.node.style.top = `${a.y}px`;
  });

  requestAnimationFrame(roamFrame);
}

function applyLiveState(payload) {
  if (!payload?.bots || !Array.isArray(payload.bots)) return;
  bots.splice(0, bots.length, ...payload.bots.slice(0, 10).map((b, i) => ({
    id: b.id || `bot-${i}`,
    name: b.name || `Bot ${i + 1}`,
    desc: b.task || 'canlı görev',
    task: b.task || 'canlı görev',
    status: ['running', 'idle', 'error'].includes(b.status) ? b.status : 'idle',
    progress: Number.isFinite(Number(b.progress)) ? Number(b.progress) : 0
  })));

  render();
  syncRoamBots();
}

async function pollLive() {
  try {
    const r = await fetch(`${LIVE_API}/state?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error('state not ok');
    const s = await r.json();
    applyLiveState(s);
    terminalPush(`live state alındı (${bots.length} bot)`);
  } catch {
    terminalPush('live api erişilemedi, demo akış');
    bots.forEach(b => {
      b.task = demoTasks[Math.floor(Math.random() * demoTasks.length)] + ' geziyor';
      if (b.status === 'running') b.progress = Math.min(100, b.progress + 4);
    });
    render();
    syncRoamBots();
  }
}

el.refresh.addEventListener('click', () => {
  pollLive();
  el.refresh.textContent = 'Yenilendi ✓';
  setTimeout(() => (el.refresh.textContent = 'Yenile'), 1200);
});

window.addEventListener('resize', assignNewTargets);

render();
syncRoamBots();
roamFrame();
tickClock();
setInterval(tickClock, 1000);
terminalPush(`live api: ${LIVE_API}`);
pollLive();
setInterval(pollLive, 5000);
