/* ==========================================================================
   Bloom & Quill - main.js
   Vanilla JS only. Sections:
   1. Custom cursor
   2. Hamburger nav
   3. Scroll reveal (IntersectionObserver)
   4. Rose sketch draw-on-load animation
   5. Ambient falling petals (canvas)
   6. Accordion (care notes)
   7. Bouquet builder (blooms page)
   8. Sketchbook lightbox gallery + filters
   9. Doodle pad (sketch a flower)
   10. Contact form validation + ink preview
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Custom cursor ---------- */
  (function initCursor(){
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if(!dot || !ring) return;
    let ringX = 0, ringY = 0, targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX; targetY = e.clientY;
      dot.style.left = targetX + 'px';
      dot.style.top = targetY + 'px';
    });

    function animateRing(){
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .bloom-card, .gallery figure, .chip, .swatch').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
  })();

  /* ---------- 2. Hamburger nav ---------- */
  (function initNav(){
    const btn = document.querySelector('.hamburger');
    const links = document.querySelector('.nav-links');
    if(!btn || !links) return;
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      btn.classList.remove('is-open');
    }));
  })();

  /* ---------- 3. Scroll reveal ---------- */
  (function initReveal(){
    const targets = document.querySelectorAll('.reveal, .ink-divider');
    if(!('IntersectionObserver' in window) || !targets.length){
      targets.forEach(t => t.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    targets.forEach(t => io.observe(t));
  })();

  /* ---------- 4. Rose sketch draw-on-load ---------- */
  (function initRoseSketch(){
    const svg = document.getElementById('rose-sketch');
    if(!svg) return;
    const paths = svg.querySelectorAll('path');
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect(); // force reflow
      p.style.transition = `stroke-dashoffset 1.4s ease ${i * 0.12}s`;
      requestAnimationFrame(() => { p.style.strokeDashoffset = 0; });
    });
  })();

  /* ---------- 5. Ambient falling petals ---------- */
  (function initPetals(){
    const canvas = document.getElementById('petal-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, petals = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function Petal(){
      this.x = Math.random() * w;
      this.y = Math.random() * -h;
      this.r = 4 + Math.random() * 5;
      this.speed = 0.4 + Math.random() * 0.8;
      this.drift = Math.random() * 1 - 0.5;
      this.spin = Math.random() * Math.PI;
      this.spinSpeed = (Math.random() - 0.5) * 0.02;
      this.hue = Math.random() > 0.5 ? '173,90,66' : '171,135,71';
      this.opacity = 0.25 + Math.random() * 0.35;
    }
    Petal.prototype.step = function(){
      this.y += this.speed;
      this.x += this.drift;
      this.spin += this.spinSpeed;
      if(this.y > h + 10){ this.y = -10; this.x = Math.random() * w; }
    };
    Petal.prototype.draw = function(){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.spin);
      ctx.fillStyle = `rgba(${this.hue},${this.opacity})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.r, this.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const count = Math.min(34, Math.floor(w / 30));
    for(let i = 0; i < count; i++) petals.push(new Petal());

    function loop(){
      ctx.clearRect(0, 0, w, h);
      petals.forEach(p => { p.step(); p.draw(); });
      requestAnimationFrame(loop);
    }
    if(!reduceMotion) loop();
    else { petals.forEach(p => p.draw()); }
  })();

  /* ---------- 6. Accordion ---------- */
  (function initAccordion(){
    document.querySelectorAll('.acc-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.acc-item');
        const panel = item.querySelector('.acc-panel');
        const isOpen = item.classList.contains('is-open');

        item.closest('.accordion').querySelectorAll('.acc-item.is-open').forEach(other => {
          if(other !== item){
            other.classList.remove('is-open');
            other.querySelector('.acc-panel').style.maxHeight = null;
            other.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
          }
        });

        if(isOpen){
          item.classList.remove('is-open');
          panel.style.maxHeight = null;
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();

  /* ---------- 7. Bouquet builder ---------- */
  (function initBuilder(){
    const cards = document.querySelectorAll('.bloom-card');
    const panel = document.querySelector('.builder-panel');
    if(!cards.length || !panel) return;

    const toggleBtn = document.querySelector('.builder-toggle');
    const countBadge = document.querySelector('.builder-count');
    const trayEl = document.querySelector('.tray-list');
    const totalEl = document.querySelector('.tray-total-amount');
    const visualEl = document.querySelector('.bouquet-visual');
    const noteEl = document.querySelector('.bouquet-note');
    const emblems = ['\u{1F339}', '\u{1F337}', '\u{1F33A}', '\u{1F33B}', '\u{1F340}'];

    const notes = [
      "gathered at first light, still holding the dew.",
      "an arrangement for someone who notices small things.",
      "wrapped in brown paper and a little bit of quiet.",
      "picked the way you'd choose words for a letter.",
      "every stem chosen like a line in a poem."
    ];

    let bouquet = JSON.parse(sessionStorage.getItem('bq-bouquet') || '[]');

    function save(){ sessionStorage.setItem('bq-bouquet', JSON.stringify(bouquet)); }

    function syncCardStates(){
      cards.forEach(card => {
        const id = card.dataset.id;
        const btn = card.querySelector('.add-btn');
        const inTray = bouquet.some(b => b.id === id);
        btn.classList.toggle('is-added', inTray);
        btn.textContent = inTray ? '\u2713' : '+';
      });
    }

    function render(){
      countBadge.textContent = bouquet.length;
      countBadge.style.display = bouquet.length ? 'flex' : 'none';

      if(!bouquet.length){
        trayEl.innerHTML = '<p class="empty-tray">Your bouquet is still empty - pick a few blooms.</p>';
        visualEl.innerHTML = '';
        totalEl.textContent = 'Rs 0';
        noteEl.textContent = '';
        syncCardStates();
        return;
      }

      trayEl.innerHTML = bouquet.map(item => `
        <div class="tray-item" data-id="${item.id}">
          <span>${item.name} \u2014 Rs ${item.price}</span>
          <button type="button" aria-label="Remove ${item.name}">\u2715</button>
        </div>
      `).join('');

      visualEl.innerHTML = bouquet.map((_, i) =>
        `<span style="transform: rotate(${(i - bouquet.length / 2) * 8}deg)">${emblems[i % emblems.length]}</span>`
      ).join('');

      const total = bouquet.reduce((sum, i) => sum + i.price, 0);
      totalEl.textContent = 'Rs ' + total.toLocaleString();

      const noteIndex = (bouquet.length + total) % notes.length;
      noteEl.textContent = '"' + notes[noteIndex] + '"';

      trayEl.querySelectorAll('.tray-item button').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('.tray-item').dataset.id;
          bouquet = bouquet.filter(b => b.id !== id);
          save(); render();
        });
      });

      syncCardStates();
    }

    cards.forEach(card => {
      const btn = card.querySelector('.add-btn');
      btn.addEventListener('click', () => {
        const id = card.dataset.id;
        const exists = bouquet.some(b => b.id === id);
        if(exists){
          bouquet = bouquet.filter(b => b.id !== id);
        } else {
          bouquet.push({
            id,
            name: card.dataset.name,
            price: Number(card.dataset.price)
          });
          panel.classList.add('is-open');
        }
        save(); render();
      });
    });

    toggleBtn.addEventListener('click', () => panel.classList.toggle('is-open'));
    document.addEventListener('click', (e) => {
      if(!panel.contains(e.target) && !toggleBtn.contains(e.target)){
        panel.classList.remove('is-open');
      }
    });

    render();
  })();

  /* ---------- 8. Filters (blooms page) ---------- */
  (function initFilters(){
    const chips = document.querySelectorAll('.chip[data-filter]');
    const cards = document.querySelectorAll('.bloom-card');
    if(!chips.length) return;
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const filter = chip.dataset.filter;
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.tag === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  })();

  /* ---------- 9. Sketchbook lightbox ---------- */
  (function initLightbox(){
    const figures = Array.from(document.querySelectorAll('.gallery figure'));
    const lightbox = document.querySelector('.lightbox');
    if(!figures.length || !lightbox) return;

    const filterChips = document.querySelectorAll('.chip[data-gallery-filter]');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const f = chip.dataset.galleryFilter;
        figures.forEach(fig => {
          fig.style.display = (f === 'all' || fig.dataset.season === f) ? '' : 'none';
        });
      });
    });

    const imgEl = lightbox.querySelector('img');
    const capEl = lightbox.querySelector('figcaption');
    let current = 0;

    function visibleFigures(){
      return figures.filter(f => f.style.display !== 'none');
    }

    function open(index){
      const vis = visibleFigures();
      current = index;
      const fig = vis[current];
      imgEl.src = fig.querySelector('img').src;
      imgEl.alt = fig.querySelector('img').alt;
      capEl.textContent = fig.querySelector('figcaption').textContent;
      lightbox.classList.add('is-open');
    }
    function close(){ lightbox.classList.remove('is-open'); }
    function step(dir){
      const vis = visibleFigures();
      current = (current + dir + vis.length) % vis.length;
      open(current);
    }

    figures.forEach((fig, i) => {
      fig.addEventListener('click', () => open(visibleFigures().indexOf(fig)));
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', () => step(-1));
    lightbox.querySelector('.lightbox-nav.next').addEventListener('click', () => step(1));
    lightbox.addEventListener('click', (e) => { if(e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if(!lightbox.classList.contains('is-open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowRight') step(1);
      if(e.key === 'ArrowLeft') step(-1);
    });
  })();

  /* ---------- 10. Doodle pad ---------- */
  (function initDoodle(){
    const canvas = document.getElementById('doodle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let color = getComputedStyle(document.documentElement).getPropertyValue('--rose-deep').trim() || '#8a3f2d';

    function fitCanvas(){
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const prev = document.createElement('canvas');
      prev.width = canvas.width; prev.height = canvas.height;
      prev.getContext('2d').drawImage(canvas, 0, 0);

      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.scale(ratio, ratio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = color;
    }
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    function pos(e){
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      return { x: point.clientX - rect.left, y: point.clientY - rect.top };
    }

    function start(e){
      drawing = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      e.preventDefault();
    }
    function move(e){
      if(!drawing) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      e.preventDefault();
    }
    function end(){ drawing = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);

    document.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('is-active'));
        sw.classList.add('is-active');
        color = sw.dataset.color;
        ctx.strokeStyle = color;
      });
    });

    const clearBtn = document.getElementById('doodle-clear');
    if(clearBtn){
      clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }
    const saveBtn = document.getElementById('doodle-save');
    if(saveBtn){
      saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'my-bloom-sketch.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  })();

  /* ---------- 11. Contact form validation + ink preview ---------- */
  (function initContactForm(){
    const form = document.getElementById('contact-form');
    if(!form) return;

    const nameField = form.querySelector('#c-name');
    const emailField = form.querySelector('#c-email');
    const msgField = form.querySelector('#c-message');
    const previewBody = document.getElementById('preview-body');
    const previewSign = document.getElementById('preview-sign');
    const successBox = document.querySelector('.form-success');

    function setState(field, valid, message){
      const wrap = field.closest('.field');
      wrap.classList.toggle('is-invalid', !valid);
      wrap.classList.toggle('is-valid', valid && field.value.trim() !== '');
      wrap.querySelector('.error-msg').textContent = valid ? '' : message;
    }

    function validateName(){
      const ok = nameField.value.trim().length >= 2;
      setState(nameField, ok, 'Tell us what to call you \u2014 at least 2 letters.');
      return ok;
    }
    function validateEmail(){
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim());
      setState(emailField, ok, 'That doesn\u2019t look like a full email address yet.');
      return ok;
    }
    function validateMessage(){
      const ok = msgField.value.trim().length >= 10;
      setState(msgField, ok, 'A few more words \u2014 tell us about the occasion.');
      return ok;
    }

    nameField.addEventListener('input', validateName);
    emailField.addEventListener('input', validateEmail);
    msgField.addEventListener('input', () => {
      validateMessage();
      previewBody.textContent = msgField.value.trim() || 'Your note will appear here, written out in ink\u2026';
    });
    nameField.addEventListener('input', () => {
      previewSign.textContent = nameField.value.trim() ? '\u2014 ' + nameField.value.trim() : '';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const validName = validateName();
      const validEmail = validateEmail();
      const validMsg = validateMessage();

      if(validName && validEmail && validMsg){
        successBox.classList.add('is-shown');
        successBox.textContent = 'Thank you, ' + nameField.value.trim() + ' \u2014 your note has been pressed between our pages. We\u2019ll write back soon.';
        form.reset();
        previewBody.textContent = 'Your note will appear here, written out in ink\u2026';
        previewSign.textContent = '';
        form.querySelectorAll('.field').forEach(f => f.classList.remove('is-valid', 'is-invalid'));
      } else {
        successBox.classList.remove('is-shown');
      }
    });
  })();

});
