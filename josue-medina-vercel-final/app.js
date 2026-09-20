const audio = document.querySelector('#audio');
const list = document.querySelector('#trackList');
const empty = document.querySelector('#emptyState');
const count = document.querySelector('#songCount');
const search = document.querySelector('#searchInput');
const fileInput = document.querySelector('#fileInput');
const tracks = [
  { title: 'Trendy', artist: 'Álbum Trendy', category: 'Trendy', youtube: 'r_54UgWC6LI' },
  { title: 'Danger', artist: 'Álbum Trendy', category: 'Trendy', youtube: '6j7W_Bc3xL0' },
  { title: 'Indispensable', artist: 'Álbum Trendy', category: 'Trendy', youtube: 'vSO3efL5Ksg' },
  { title: 'Salmo 23', artist: 'Álbum Trendy', category: 'Trendy', youtube: 'GpRMSQvZ4Eo' },
  { title: 'Vitamina', artist: 'Álbum Trendy', category: 'Trendy', youtube: '5ng3-66KygE' },
  { title: 'Quién dijo que no', artist: 'Sencillos', category: 'Sencillos', youtube: 'W0OT9VwO-D0' },
  { title: 'Rey', artist: 'Sencillos', category: 'Sencillos', youtube: 'j9gCCRbFYvc' },
  { title: '24/7', artist: 'Sencillos', category: 'Sencillos', youtube: '40s-13KHiXE' },
  { title: 'Promesas', artist: 'Sencillos', category: 'Sencillos', youtube: 'T3jutloGs10' },
  { title: 'Yo no sé', artist: 'Sencillos', category: 'Sencillos', youtube: 'bmPK02LvyTI' },
  { title: 'Tu hijo soy', artist: 'Sencillos', category: 'Sencillos', youtube: 'ykj_8OjdUUg' },
]; 
let activeFilter = 'all';
const favorites = new Set(JSON.parse(localStorage.getItem('medina-favorites') || '[]'));
let current = -1;

const demo = [
  { title: 'Volver a empezar', artist: 'Josué Medina · Demo', duration: '3:42' },
  { title: 'Luz en el camino', artist: 'Josué Medina · Demo', duration: '4:08' },
  { title: 'Todo va a estar bien', artist: 'Josué Medina · Demo', duration: '3:16' },
];

function formatTime(value) { if (!Number.isFinite(value)) return '0:00'; const m = Math.floor(value / 60); const s = Math.floor(value % 60).toString().padStart(2, '0'); return `${m}:${s}`; }
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2500); }
function draw() {
  const query = search.value.toLowerCase().trim();
  const visible = tracks.map((t, i) => ({ ...t, index: i })).filter(t => (activeFilter === 'all' || (activeFilter === 'favorites' ? favorites.has(t.index) : t.category === activeFilter)) && `${t.title} ${t.artist}`.toLowerCase().includes(query));
  list.innerHTML = visible.map((t, n) => `<article class="track ${t.index === current ? 'current' : ''}"><span class="track-num">${String(n + 1).padStart(2, '0')}</span><div class="track-cover" ${t.youtube ? `style="background-image:url('https://i.ytimg.com/vi/${t.youtube}/hqdefault.jpg')"` : ''}>${t.youtube ? '' : '♫'}</div><div class="track-info"><strong>${escapeHtml(t.title)}</strong><span>${escapeHtml(t.artist)}</span></div><span class="track-duration">${t.duration || '—'}</span><button class="favorite ${favorites.has(t.index) ? 'saved' : ''}" aria-label="Favorito" data-favorite="${t.index}">${favorites.has(t.index) ? '♥' : '♡'}</button><button aria-label="Reproducir" data-play="${t.index}">▶</button></article>`).join('');
  count.textContent = visible.length;
  empty.hidden = tracks.length > 0;
  list.querySelectorAll('[data-play]').forEach(btn => btn.addEventListener('click', () => play(Number(btn.dataset.play))));
  list.querySelectorAll('[data-favorite]').forEach(btn => btn.addEventListener('click', () => { const i = Number(btn.dataset.favorite); favorites.has(i) ? favorites.delete(i) : favorites.add(i); localStorage.setItem('medina-favorites', JSON.stringify([...favorites])); draw(); }));
}
function escapeHtml(value) { return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;' }[c])); }
function play(index) { const t = tracks[index]; if (!t) return; current = index; document.querySelector('#nowTitle').textContent = t.title; document.querySelector('#nowArtist').textContent = t.artist; if (t.youtube) { toast('Cargando canción…'); document.querySelector('#ytFrame').src = `https://www.youtube.com/embed/${t.youtube}?autoplay=1&rel=0`; document.querySelector('#ytModal').hidden = false; } else if (t.url) { audio.src = t.url; audio.play().catch(() => {}); } draw(); document.querySelector('#playBtn').textContent = 'Ⅱ'; }
function addFiles(files) { [...files].filter(file => file.type.startsWith('audio/')).forEach(file => tracks.push({ title: file.name.replace(/\.[^/.]+$/, ''), artist: 'Tu biblioteca', url: URL.createObjectURL(file), duration: '—' })); draw(); if (tracks.length) toast(`${files.length} canción${files.length === 1 ? '' : 'es'} agregada${files.length === 1 ? '' : 's'}`); }
search.addEventListener('input', draw);
document.querySelector('#playBtn').addEventListener('click', () => { if (current < 0 && tracks.length) return play(0); if (audio.paused) { audio.play(); document.querySelector('#playBtn').textContent = 'Ⅱ'; } else { audio.pause(); document.querySelector('#playBtn').textContent = '▶'; } });
document.querySelector('#nextBtn').addEventListener('click', () => tracks.length && play((current + 1) % tracks.length));
document.querySelector('#prevBtn').addEventListener('click', () => tracks.length && play((current - 1 + tracks.length) % tracks.length));
audio.addEventListener('timeupdate', () => { document.querySelector('#currentTime').textContent = formatTime(audio.currentTime); document.querySelector('#progressBar').value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0; });
audio.addEventListener('loadedmetadata', () => document.querySelector('#duration').textContent = formatTime(audio.duration));
document.querySelector('#progressBar').addEventListener('input', e => { if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration; });
audio.addEventListener('ended', () => tracks.length && play((current + 1) % tracks.length));
document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => { activeFilter = btn.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === btn)); draw(); }));
document.addEventListener('keydown', e => { if (e.code === 'Space' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); document.querySelector('#playBtn').click(); } });
document.querySelector('#shareHeroBtn').addEventListener('click', share);
document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => { document.querySelector('#ytFrame').src = ''; document.querySelector('#ytModal').hidden = true; }));
async function share() { const url = window.location.href.split('#')[0] + '#medina-music'; try { await navigator.clipboard.writeText(url); toast('Enlace copiado. Publicá esta carpeta para compartirla.'); } catch { toast(url); } }
document.querySelector('#shareBtn').addEventListener('click', share); document.querySelector('#sharePanelBtn').addEventListener('click', share);
let installPrompt;
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; document.querySelector('#installBtn').hidden = false; });
document.querySelector('#installBtn').addEventListener('click', async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; document.querySelector('#installBtn').hidden = true; });
window.addEventListener('appinstalled', () => { document.querySelector('#installBtn').hidden = true; toast('Aplicación instalada'); });
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('service-worker.js').catch(() => {});
draw();
