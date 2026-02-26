/* ══════════════════════════════════════════
   IBZ AI — MAIN JS
   Typed text, particles, scroll animations,
   counter animation, FAQ accordion, form UX
   ══════════════════════════════════════════ */

'use strict';

// NAVBAR SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// TYPED TEXT EFFECT
(function initTyped() {
    const el = document.getElementById('typed-el');
    if (!el) return;
    const phrases = [
        'Automatizaci\u00f3n con IA',
        'Agentes Aut\u00f3nomos',
        'Flujos Inteligentes',
        'M\u00e1s Ventas en Piloto Autom\u00e1tico',
        'Tu Empresa en el Futuro',
    ];
    let pIdx = 0, cIdx = 0, deleting = false;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.after(cursor);

    function tick() {
        const phrase = phrases[pIdx];
        el.textContent = deleting ? phrase.slice(0, cIdx--) : phrase.slice(0, cIdx++);
        let delay = deleting ? 40 : 80;
        if (!deleting && cIdx > phrase.length) { deleting = true; delay = 1800; }
        else if (deleting && cIdx < 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; cIdx = 0; delay = 400; }
        setTimeout(tick, delay);
    }
    tick();
})();

// PARTICLE CANVAS
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = 60;
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    function rand(a, b) { return Math.random() * (b - a) + a; }
    class Particle {
        constructor() { this.reset(); }
        reset() { this.x = rand(0, W); this.y = rand(0, H); this.r = rand(1, 2.5); this.opacity = rand(0.2, 0.6); this.vx = rand(-0.3, 0.3); this.vy = rand(-0.5, -0.1); }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(99,102,241,${this.opacity})`; ctx.fill(); }
        update() { this.x += this.vx; this.y += this.vy; if (this.y < -4 || this.x < -4 || this.x > W + 4) this.reset(); }
    }
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
            }
        }
        requestAnimationFrame(loop);
    }
    loop();
})();

// COUNTER ANIMATION
(function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let observed = new Set();
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || observed.has(entry.target)) return;
            observed.add(entry.target);
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const duration = 1600, start = performance.now();
            function frame(now) {
                const t = Math.min((now - start) / duration, 1);
                el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
                if (t < 1) requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        });
    }, { threshold: 0.5 });
    counters.forEach(el => io.observe(el));
})();

// SCROLL REVEAL
(function initScrollReveal() {
    const targets = ['.service-card', '.result-card', '.testimonial-card', '.process-step', '.pain-col', '.faq-item'];
    document.querySelectorAll(targets.join(',')).forEach((el, i) => {
        el.classList.add('animate-in');
        el.style.transitionDelay = `${(i % 6) * 60}ms`;
    });
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
    document.querySelectorAll('.animate-in').forEach(el => io.observe(el));
    // Fallback: reveal all after 800ms
    setTimeout(() => { document.querySelectorAll('.animate-in:not(.visible)').forEach(el => el.classList.add('visible')); }, 800);
})();

// FAQ ACCORDION
(function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-question').forEach(b => { b.setAttribute('aria-expanded', 'false'); const ans = b.nextElementSibling; if (ans) ans.classList.remove('open'); });
            if (!isOpen) { btn.setAttribute('aria-expanded', 'true'); const answer = btn.nextElementSibling; if (answer) answer.classList.add('open'); }
        });
    });
})();

// CONTACT FORM
(function initForm() {
    const form = document.getElementById('contact-form');
    const submit = document.getElementById('form-submit');
    const btnTxt = document.getElementById('btn-text');
    const btnLdr = document.getElementById('btn-loading');
    const success = document.getElementById('form-success');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;
        form.querySelectorAll('[required]').forEach(input => {
            if (!input.value.trim()) { input.style.borderColor = 'var(--error)'; valid = false; input.addEventListener('input', () => { input.style.borderColor = ''; }, { once: true }); }
        });
        if (!valid) return;
        submit.disabled = true; btnTxt.style.display = 'none'; btnLdr.style.display = 'inline';
        await new Promise(r => setTimeout(r, 1500));
        form.style.display = 'none'; success.style.display = 'block';
    });
})();

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});
