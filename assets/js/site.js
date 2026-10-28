/**
 * 梦澄工作室 · 站点脚本
 * 导航状态、移动端菜单、星空、声波与首屏文字扫光。
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createRandom(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function initSiteNav() {
  const nav = document.querySelector('[data-site-nav]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-menu-panel]');

  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !panel) return;

  let lastFocused = null;

  const focusables = () =>
    Array.from(panel.querySelectorAll('a[href], button:not([disabled])')).filter(
      (el) => el.offsetParent !== null,
    );

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';

    if (open) {
      lastFocused = document.activeElement;
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
        focusables()[0]?.focus();
      });
    } else {
      panel.classList.remove('is-open');
      lastFocused?.focus();
    }
  };

  const onKeydown = (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === 'Tab' && !panel.hidden) {
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(panel.hasAttribute('hidden'));
  });

  panel.querySelector('[data-menu-close]')?.addEventListener('click', () => {
    setOpen(false);
  });

  document.addEventListener('keydown', onKeydown);

  panel.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) {
      setOpen(false);
    }
  });

  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches && !panel.hidden) setOpen(false);
  });
}

function initStarfield() {
  const container = document.querySelector('[data-starfield]');
  if (!container || container.children.length > 0) return;

  const random = createRandom(20261029);
  const eases = ['ease-in-out', 'ease-out', 'ease-in', 'cubic-bezier(0.4, 0, 0.6, 1)'];
  const fragment = document.createDocumentFragment();

  const makeDot = (index, isStar) => {
    const size = isStar ? 7 + random() * 15 : 1.2 + random() * 2.4;
    const scale = isStar ? 1 - (size - 7) / 22 : 1;
    const peak = isStar
      ? (0.3 + random() * 0.3) * (0.55 + scale * 0.45)
      : 0.18 + random() * 0.24;
    const floor = peak * (0.32 + random() * 0.25);
    const dot = document.createElement('span');
    dot.className = isStar ? 'starfield__dot is-star' : 'starfield__dot is-dust';
    dot.style.cssText = [
      `--x:${(random() * 100).toFixed(2)}%`,
      `--y:${(random() * 100).toFixed(2)}%`,
      `--size:${size.toFixed(2)}px`,
      `--dur:${(isStar ? 6 + random() * 12 : 10 + random() * 14).toFixed(2)}s`,
      `--delay:${(-random() * 18).toFixed(2)}s`,
      `--peak:${peak.toFixed(3)}`,
      `--floor:${floor.toFixed(3)}`,
      `--ease:${eases[Math.floor(random() * eases.length)]}`,
      `--dx:${((random() * 2 - 1) * (1.5 + random() * 6)).toFixed(2)}vmin`,
      `--dy:${((random() * 2 - 1) * (1.5 + random() * 6)).toFixed(2)}vmin`,
      `--ddur:${(32 + random() * 48).toFixed(2)}s`,
      `--ddelay:${(-random() * 80).toFixed(2)}s`,
    ].join(';');
    dot.dataset.index = String(index);
    fragment.appendChild(dot);
  };

  for (let i = 0; i < 32; i += 1) makeDot(i, true);
  for (let i = 0; i < 38; i += 1) makeDot(i, false);

  const shooting = [
    { x: 8, y: 16, len: 16, angle: 24, sx: 34, sy: 15, dur: 19, delay: 3 },
    { x: 62, y: 8, len: 12, angle: 28, sx: 26, sy: 14, dur: 27, delay: 13 },
  ];

  shooting.forEach((item) => {
    const star = document.createElement('span');
    star.className = 'starfield__shooting';
    star.style.cssText = [
      `--x:${item.x}vw`,
      `--y:${item.y}vh`,
      `--len:${item.len}vw`,
      `--angle:${item.angle}deg`,
      `--shoot-x:${item.sx}vw`,
      `--shoot-y:${item.sy}vh`,
      `--shoot-dur:${item.dur}s`,
      `--shoot-delay:${item.delay}s`,
    ].join(';');
    fragment.appendChild(star);
  });

  container.appendChild(fragment);
}

function initSpectrum() {
  const spectrum = document.querySelector('[data-spectrum]');
  if (!spectrum || spectrum.children.length > 0) return;

  const random = createRandom(265604149);
  const eases = ['ease-in-out', 'ease-out', 'ease-in', 'cubic-bezier(0.4, 0, 0.6, 1)'];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 64; i += 1) {
    const bar = document.createElement('span');
    bar.className = 'spectrum__bar';
    const middle = 1 - Math.abs(i - 31.5) / 40;
    const height = 12 + random() * 46 + middle * 40;
    bar.style.cssText = [
      `--h:${height.toFixed(1)}%`,
      `--dur:${(1.8 + random() * 3.4).toFixed(2)}s`,
      `--delay:${(-random() * 4).toFixed(2)}s`,
      `--ease:${eases[Math.floor(random() * eases.length)]}`,
    ].join(';');
    fragment.appendChild(bar);
  }

  spectrum.appendChild(fragment);
}

function initSpotlight() {
  const hero = document.querySelector('[data-hero]');
  if (!hero || reduceMotion) return;

  const targets = Array.from(hero.querySelectorAll('[data-spotlight]'));
  if (targets.length === 0) return;

  let frame = 0;
  let x = 0;
  let y = 0;

  const paint = () => {
    frame = 0;
    targets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--mx', `${x - rect.left}px`);
      element.style.setProperty('--my', `${y - rect.top}px`);
    });
  };

  const reset = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    targets.forEach((element) => {
      element.style.setProperty('--mx', '50%');
      element.style.setProperty('--my', '50%');
    });
  };

  hero.addEventListener(
    'pointermove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    },
    { passive: true },
  );

  hero.addEventListener('pointerleave', reset);
}

initSiteNav();
initStarfield();
initSpectrum();
initSpotlight();
