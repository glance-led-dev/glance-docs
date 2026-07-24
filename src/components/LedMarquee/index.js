import React, {useEffect, useRef} from 'react';

// A slim simulated LED ticker that scrolls text across the homepage hero.
// The whole message is pre-rendered once to an offscreen dot-matrix strip
// (including the glow pass), then each animation frame just blits a window
// of it — no per-frame dot drawing, so scrolling costs almost nothing.
// Honors prefers-reduced-motion by showing a static frame.

// Standard 5x7 column font, LSB = top row. Only the glyphs the messages use.
const FONT = {
  A: [0x7c, 0x12, 0x11, 0x12, 0x7c],
  B: [0x7f, 0x49, 0x49, 0x49, 0x36],
  C: [0x3e, 0x41, 0x41, 0x41, 0x22],
  D: [0x7f, 0x41, 0x41, 0x22, 0x1c],
  E: [0x7f, 0x49, 0x49, 0x49, 0x41],
  F: [0x7f, 0x09, 0x09, 0x09, 0x01],
  G: [0x3e, 0x41, 0x49, 0x49, 0x7a],
  H: [0x7f, 0x08, 0x08, 0x08, 0x7f],
  I: [0x00, 0x41, 0x7f, 0x41, 0x00],
  K: [0x7f, 0x08, 0x14, 0x22, 0x41],
  L: [0x7f, 0x40, 0x40, 0x40, 0x40],
  N: [0x7f, 0x04, 0x08, 0x10, 0x7f],
  O: [0x3e, 0x41, 0x41, 0x41, 0x3e],
  P: [0x7f, 0x09, 0x09, 0x09, 0x06],
  R: [0x7f, 0x09, 0x19, 0x29, 0x46],
  S: [0x46, 0x49, 0x49, 0x49, 0x31],
  T: [0x01, 0x01, 0x7f, 0x01, 0x01],
  U: [0x3f, 0x40, 0x40, 0x40, 0x3f],
  W: [0x3f, 0x40, 0x38, 0x40, 0x3f],
  Y: [0x07, 0x08, 0x70, 0x08, 0x07],
  '.': [0x00, 0x60, 0x60, 0x00, 0x00],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
};

const ROWS = 13; // 7-row font + margins; a slim ticker strip
const TEXT_Y = 3;
const SPEED = 26; // LED columns per second

// [text, color] pairs, joined with breathing room between them.
const MESSAGES = [
  ['BUILD APPS FOR YOUR GLANCE.', '#2bff6e'],
  ['CLOCKS. TICKERS. ALERTS. FUN.', '#e6e9e7'],
  ['WRITE IT. SEE IT. SHARE IT.', '#2bff6e'],
];

function textColumns() {
  // Flatten the messages into [columnBits, color] with 1-col letter spacing
  // and a gap between messages.
  const cols = [];
  for (const [text, color] of MESSAGES) {
    for (const ch of text) {
      const glyph = FONT[ch] ?? FONT[' '];
      for (const bits of glyph) {
        cols.push([bits, color]);
      }
      cols.push([0, color]);
    }
    for (let i = 0; i < 10; i++) {
      cols.push([0, color]);
    }
  }
  return cols;
}

function buildStrip(cell) {
  const cols = textColumns();
  const strip = document.createElement('canvas');
  strip.width = cols.length * cell;
  strip.height = ROWS * cell;
  const ctx = strip.getContext('2d');
  const radius = cell * 0.42;

  const passes = [
    {blur: cell * 0.9, alpha: 0.5, r: radius * 1.25, litOnly: true},
    {blur: 0, alpha: 1, r: radius, litOnly: false},
  ];
  for (const pass of passes) {
    ctx.save();
    ctx.globalAlpha = pass.alpha;
    if (pass.blur > 0) {
      if (typeof ctx.filter !== 'string') {
        ctx.restore();
        continue;
      }
      ctx.filter = `blur(${pass.blur}px)`;
      ctx.globalCompositeOperation = 'lighter';
    }
    for (let x = 0; x < cols.length; x++) {
      const [bits, color] = cols[x];
      for (let y = 0; y < ROWS; y++) {
        const lit = y >= TEXT_Y && y < TEXT_Y + 7 && bits & (1 << (y - TEXT_Y));
        if (pass.litOnly && !lit) {
          continue;
        }
        ctx.fillStyle = lit ? color : 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.arc(x * cell + cell / 2, y * cell + cell / 2, pass.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  return strip;
}

export default function LedMarquee({ariaLabel = 'LED ticker'}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.parentElement.clientWidth - 20;
    const cell = Math.max(4, Math.round((6 * dpr)));
    const viewCols = Math.max(24, Math.floor((cssWidth * dpr) / cell));
    canvas.width = viewCols * cell;
    canvas.height = ROWS * cell;
    canvas.style.width = `${canvas.width / dpr}px`;

    const strip = buildStrip(cell);
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
      return undefined;
    }

    let raf;
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
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
  );
}
