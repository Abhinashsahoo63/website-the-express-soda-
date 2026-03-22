/* ============================================================
   THE EXPRESS SODA — shared script.js
   Runs on every page
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* 1. NAVBAR — scroll + active link */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mark active nav link by current page */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  /* 2. HAMBURGER */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(l =>
      l.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      })
    );
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }

  /* 3. SCROLL-REVEAL */
  document.querySelectorAll(
    '.food-card, .info-card, .gallery-item, .section-header, .special-card, .stat-box, .reveal-el'
  ).forEach(el => el.classList.add('reveal'));

  /* Stagger children */
  ['.food-grid .food-card', '.gallery-grid .gallery-item', '.specials-grid .special-card']
    .forEach(sel => document.querySelectorAll(sel).forEach((el, i) => el.dataset.revealDelay = i * 60));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), +(entry.target.dataset.revealDelay || 0));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* 4. MENU CATEGORY TABS */
  const tabs  = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.food-card');
  if (tabs.length) {
    const ks = document.createElement('style');
    ks.textContent = `@keyframes cardIn{from{opacity:0;transform:scale(.9) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}`;
    document.head.appendChild(ks);

    tabs.forEach(btn => btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      let d = 0;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        if (match) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = `cardIn .38s ${d}ms ease both`;
          d += 50;
        } else card.classList.add('hidden');
      });
    }));
  }

  /* 5. ADD BUTTON confetti burst */
  const emojis = ['🍜','🥟','🍔','💪','✨','❤️','🌶️','🔥'];
  document.addEventListener('click', e => {
    if (!e.target.classList.contains('add-btn')) return;
    const r = e.target.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 7; i++) {
      const el = document.createElement('span');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${14+Math.random()*10}px;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:all .8s cubic-bezier(.2,1,.3,1);`;
      document.body.appendChild(el);
      const a = (Math.PI * 2 * i) / 7, dist = 60 + Math.random() * 50;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px))`;
        el.style.opacity = '0';
      }));
      setTimeout(() => el.remove(), 900);
    }
    e.target.style.transform = 'scale(1.4) rotate(90deg)';
    setTimeout(() => e.target.style.transform = '', 250);
  });

  /* 6. GALLERY LIGHTBOX */
  const imgs = document.querySelectorAll('.gallery-item:not(.placeholder) img');
  if (imgs.length) {
    const lb = document.createElement('div'), lbImg = document.createElement('img');
    const lbClose = document.createElement('button');
    lb.id = 'lightbox';
    lb.style.cssText = `display:none;position:fixed;inset:0;background:rgba(0,0,0,.93);backdrop-filter:blur(12px);z-index:9999;align-items:center;justify-content:center;padding:2rem;cursor:zoom-out;`;
    lbImg.style.cssText = `max-width:90vw;max-height:85vh;object-fit:contain;border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.6);`;
    lbClose.textContent = '✕';
    lbClose.style.cssText = `position:absolute;top:1.5rem;right:1.5rem;color:white;font-size:1.5rem;cursor:pointer;background:rgba(255,255,255,.1);border:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;`;
    lb.appendChild(lbImg); lb.appendChild(lbClose);
    document.body.appendChild(lb);
    imgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => { lbImg.src = img.src; lb.style.display = 'flex'; document.body.style.overflow = 'hidden'; });
    });
    const close = () => { lb.style.display = 'none'; document.body.style.overflow = ''; };
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    lbClose.addEventListener('click', close);
    document.addEventListener('keydown', e => e.key === 'Escape' && close());
  }

  /* 7. SMOOTH SCROLL (same-page anchors) */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - (navbar?.offsetHeight||70) - 12, behavior: 'smooth' }); }
    });
  });

});
