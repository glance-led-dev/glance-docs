import React, {useEffect, useRef} from 'react';

// The homepage hero ticker: one continuous simulated LED strip, 32 LEDs tall
// (real panel height), that scrolls the tagline followed by actual app
// renders from the docs, pixel for pixel. Everything is composited once into
// an offscreen strip (dots + glow), then each frame blits a sliding window,
// so the animation is effectively free. Honors prefers-reduced-motion by
// showing a static frame.

// Standard 5x7 column font, LSB = top row; drawn doubled (10x14) on the
// 32-row strip. Only the glyphs the tagline uses.
const FONT = {
  A: [0x7c, 0x12, 0x11, 0x12, 0x7c],
  C: [0x3e, 0x41, 0x41, 0x41, 0x22],
  E: [0x7f, 0x49, 0x49, 0x49, 0x41],
  F: [0x7f, 0x09, 0x09, 0x09, 0x01],
  G: [0x3e, 0x41, 0x49, 0x49, 0x7a],
  K: [0x7f, 0x08, 0x14, 0x22, 0x41],
  L: [0x7f, 0x40, 0x40, 0x40, 0x40],
  M: [0x7f, 0x02, 0x0c, 0x02, 0x7f],
  N: [0x7f, 0x04, 0x08, 0x10, 0x7f],
  O: [0x3e, 0x41, 0x41, 0x41, 0x3e],
  P: [0x7f, 0x09, 0x09, 0x09, 0x06],
  R: [0x7f, 0x09, 0x19, 0x29, 0x46],
  S: [0x46, 0x49, 0x49, 0x49, 0x31],
  U: [0x3f, 0x40, 0x40, 0x40, 0x3f],
  Y: [0x07, 0x08, 0x70, 0x08, 0x07],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
};

const ROWS = 32; // native panel height — app renders scroll through 1:1
const TEXT_TOP = 9; // vertically centers the doubled 10x14 tagline
const SPEED = 30; // LED columns per second
const GAP = 6; // blank columns between segments — keep the apps close together
const OFF_LUMA = 10;

// The tagline, then real apps we've made — renders scroll through pixel
// for pixel, edges trimmed so there's no dead black space between them.
const SEGMENTS = [
  {text: 'MAKE APPS FOR YOUR GLANCE', color: '#2bff6e'},
  {src: '/img/apps/go-gators/sign.png'},
  {src: '/img/examples/game-night.png'},
  {src: '/img/examples/btc.png'},
  {src: '/img/apps/local-fires/status.png'},
  {src: '/img/apps/asteroids-near-us/neo.png'},
  {src: '/img/apps/now-playing/movie_1.png'},
  {src: '/img/apps/moon-phase/moon.png'},
];

const emptyCol = () => new Array(ROWS).fill(null);

// Each strip column is an array of 32 colors (null = unlit).
function textColumns(text, color) {
  const cols = [];
  for (const ch of text) {
    const glyph = FONT[ch] ?? FONT[' '];
    for (const bits of glyph) {
      const col = emptyCol();
      for (let y = 0; y < 7; y++) {
        if (bits & (1 << y)) {
          col[TEXT_TOP + y * 2] = color;
          col[TEXT_TOP + y * 2 + 1] = color;
        }
      }
      cols.push(col, [...col]); // doubled horizontally
    }
    cols.push(emptyCol(), emptyCol());
  }
  return cols;
}

function imageColumns(img) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h || h > ROWS) {
    return []; // not a native panel render — leave it out
  }
  const probe = document.createElement('canvas');
  probe.width = w;
  probe.height = h;
  const ctx = probe.getContext('2d', {willReadFrequently: true});
  ctx.drawImage(img, 0, 0);
  let data;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return [];
  }
  const top = Math.floor((ROWS - h) / 2);
  const cols = [];
  for (let x = 0; x < w; x++) {
    const col = emptyCol();
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (r + g + b > OFF_LUMA * 3) {
        col[top + y] = `rgb(${r},${g},${b})`;
      }
    }
    cols.push(col);
  }
  // Trim fully-dark edge columns so renders butt up close in the scroll.
  const isBlank = (col) => col.every((c) => !c);
  while (cols.length && isBlank(cols[0])) {
    cols.shift();
  }
  while (cols.length && isBlank(cols[cols.length - 1])) {
    cols.pop();
  }
  return cols;
}

function buildStrip(columns, cell) {
  const strip = document.createElement('canvas');
  strip.width = columns.length * cell;
  strip.height = ROWS * cell;
  const ctx = strip.getContext('2d');
  const radius = cell * 0.42;

  // Draw every lit dot sharp, once, on its own layer. The glow is then a
  // single blurred stamp of that whole layer — blurring per dot instead
  // takes seconds for a strip this size and delays the first frame.
  const lit = document.createElement('canvas');
  lit.width = strip.width;
  lit.height = strip.height;
  const litCtx = lit.getContext('2d');

  for (let x = 0; x < columns.length; x++) {
    for (let y = 0; y < ROWS; y++) {
      const color = columns[x][y];
      const target = color ? litCtx : ctx;
      target.fillStyle = color || 'rgba(255,255,255,0.05)';
      target.beginPath();
      target.arc(x * cell + cell / 2, y * cell + cell / 2, radius, 0, Math.PI * 2);
      target.fill();
    }
  }

  if (typeof ctx.filter === 'string') {
    ctx.save();
    ctx.filter = `blur(${cell * 0.9}px)`;
    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(lit, 0, 0);
    ctx.restore();
  }
  ctx.drawImage(lit, 0, 0);
  return strip;
}

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

export default function LedMarquee({ariaLabel = 'LED ticker'}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    let cancelled = false;
    let raf;

    (async () => {
      const images = await Promise.all(
        SEGMENTS.map((seg) => (seg.src ? loadImage(seg.src) : null)),
      );
      const columns = [];
      SEGMENTS.forEach((seg, i) => {
        if (seg.text) {
          columns.push(...textColumns(seg.text, seg.color));
        } else if (images[i]) {
          columns.push(...imageColumns(images[i]));
        }
        for (let g = 0; g < GAP; g++) {
          columns.push(emptyCol());
        }
      });
      if (cancelled || columns.length === 0) {
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.parentElement.clientWidth - 20;
      const cell = Math.max(3, Math.round(5 * dpr));
      const viewCols = Math.max(32, Math.floor((cssWidth * dpr) / cell));
      canvas.width = viewCols * cell;
      canvas.height = ROWS * cell;
      canvas.style.width = `${canvas.width / dpr}px`;

      const strip = buildStrip(columns, cell);
      const ctx = canvas.getContext('2d');
      const stripCols = strip.width / cell;

      const paint = (ledOffset) => {
        const px = (ledOffset % stripCols) * cell;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Two blits cover the wrap-around seam.
        ctx.drawImage(strip, -px, 0);
        ctx.drawImage(strip, strip.width - px, 0);
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        paint(0);
        return;
      }

      let last = -1;
      const start = performance.now();
      const tick = (now) => {
        const offset = Math.floor(((now - start) / 1000) * SPEED);
        if (offset !== last) {
          last = offset;
          paint(offset);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
}
