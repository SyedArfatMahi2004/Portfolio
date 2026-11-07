// ---------- Timeline navigation (playhead follows scroll; drag to scrub) ----------
const chapters = [
  ['Intro', '#top'], ['Story', '#story'], ['Skills', '#skills'],
  ['Work', '#work'], ['Certificates', '#certs'], ['Contact', '#contact']
];
const bar = document.getElementById('bar'), ph = document.getElementById('ph'), now = document.getElementById('now');
document.getElementById('yr').textContent = new Date().getFullYear();
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
const startOf = id => document.querySelector(id).offsetTop;

function buildClips() {
  bar.querySelectorAll('.clip').forEach(c => c.remove());
  const total = maxScroll() || 1;
  chapters.forEach(([name, id], i) => {
    const s = Math.min(startOf(id) / total, 1);
    const e = i < chapters.length - 1 ? Math.min(startOf(chapters[i + 1][1]) / total, 1) : 1;
    const c = document.createElement('div');
    c.className = 'clip'; c.textContent = name;
    c.style.left = s * 100 + '%'; c.style.width = Math.max(e - s, 0.02) * 100 + '%';
    bar.prepend(c);
  });
}
function update() {
  ph.style.left = scrollY / (maxScroll() || 1) * 100 + '%';
  let a = 0;
  chapters.forEach(([, id], i) => { if (scrollY + innerHeight * 0.4 >= startOf(id)) a = i; });
  now.textContent = chapters[a][0];
  bar.querySelectorAll('.clip').forEach((c, i) => c.classList.toggle('on', chapters.length - 1 - i === a));
}
function scrub(e) {
  const r = bar.getBoundingClientRect();
  scrollTo({ top: Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * maxScroll(), behavior: 'auto' });
}
bar.addEventListener('pointerdown', e => { bar.setPointerCapture(e.pointerId); scrub(e); bar.onpointermove = scrub; });
bar.addEventListener('pointerup', () => { bar.onpointermove = null; });
addEventListener('scroll', update, { passive: true });
addEventListener('resize', () => { buildClips(); update(); });
addEventListener('load', () => { buildClips(); update(); });
buildClips(); update();

// ---------- Scroll reveal (staggered) ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 90 + 'ms';
  io.observe(el);
});

// ---------- Typing role text ----------
const roles = ['web developer', 'video editor', 'social media marketer', 'CS student'];
const out = document.getElementById('type');
let r = 0, ch = 0, del = false;
(function tick() {
  const word = roles[r];
  out.textContent = word.slice(0, ch);
  if (!del && ch === word.length) { del = true; return setTimeout(tick, 1400); }
  if (del && ch === 0) { del = false; r = (r + 1) % roles.length; }
  ch += del ? -1 : 1;
  setTimeout(tick, del ? 40 : 85);
})();

// ---------- Cursor glow + card tilt ----------
if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  const glow = document.getElementById('glow');
  addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const b = el.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
