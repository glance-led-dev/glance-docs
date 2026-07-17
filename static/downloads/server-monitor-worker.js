/**
 * Server Monitor LED panel — Cloudflare Worker / Pages Function
 *
 * Responds to EVERY request with a single 192x32 PNG image showing pseudo
 * (random) server health data: hostname, uptime, load average, CPU/MEM/DSK
 * usage meters, network TX/RX rates and core temperature.
 *
 * Optional: ?seed=123 for reproducible data.
 *
 * Deploy: upload this folder to Cloudflare Pages (drag & drop) — _worker.js
 * is picked up automatically — or run `wrangler deploy` in this folder.
 */

const W = 192;
const H = 32;

// ---------------------------------------------------------------------------
// 4x6 bitmap font, 5px advance, glyph top at y+1 (same metrics as GD font 1).
// Each glyph is 6 hex nibbles, one row each, bit 3 = left pixel.
// ---------------------------------------------------------------------------

const FONT_HEX = {
  A: '69F999', B: 'E9E99E', C: '698896', D: 'E9999E', E: 'F8E88F',
  F: 'F8E888', G: '698B97', H: '99F999', I: '722227', J: '311196',
  K: '9ACCA9', L: '88888F', M: '9FF999', N: '9DDBB9', O: '699996',
  P: 'E99E88', Q: '6999B7', R: 'E9EA99', S: '694296', T: 'F44444',
  U: '999996', V: '9999A4', W: '999FF9', X: '996699', Y: '996444',
  Z: 'F1248F',
  0: '69BD96', 1: '262227', 2: '69248F', 3: 'E16196', 4: '26AF22',
  5: 'F8E196', 6: '68E996', 7: 'F12244', 8: '696996', 9: '699716',
  '.': '000066', ':': '060060', '-': '00F000', '%': '912489',
  ' ': '000000',
};
const FONT = {};
for (const [ch, hex] of Object.entries(FONT_HEX)) {
  FONT[ch] = [...hex].map((c) => parseInt(c, 16));
}

const textW = (s) => s.length * 5;
const rightX = (s, rightEdge) => rightEdge - textW(s);

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const C = {
  white:  [255, 255, 255],
  gray:   [140, 140, 140],
  dkgray: [50, 50, 50],
  dim:    [46, 46, 46],
  red:    [255, 50, 50],
  green:  [0, 255, 80],
  yellow: [255, 170, 0],
  cyan:   [80, 200, 255],
};

// ---------------------------------------------------------------------------
// Tiny pixel canvas
// ---------------------------------------------------------------------------

class Panel {
  constructor(w = W, h = H) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 3); // RGB, starts black
  }

  set(x, y, [r, g, b]) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.px[i] = r;
    this.px[i + 1] = g;
    this.px[i + 2] = b;
  }

  fillRect(x, y, w, h, c) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) this.set(x + dx, y + dy, c);
  }

  hline(x1, x2, y, c) { this.fillRect(x1, y, x2 - x1 + 1, 1, c); }
  vline(x, y1, y2, c) { this.fillRect(x, y1, 1, y2 - y1 + 1, c); }

  icon(x, y, rows, c) {
    rows.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++)
        if (row[dx] === 'X') this.set(x + dx, y + dy, c);
    });
  }

  text(str, x, y, c) {
    for (const ch of String(str).toUpperCase()) {
      const glyph = FONT[ch] || FONT[' '];
      for (let ry = 0; ry < 6; ry++) {
        const bits = glyph[ry];
        for (let bx = 0; bx < 4; bx++)
          if (bits & (8 >> bx)) this.set(x + bx, y + 1 + ry, c);
      }
      x += 5;
    }
  }
}

// ---------------------------------------------------------------------------
// Seedable RNG (mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const makeRand = (rng) => ({
  int: (min, max) => min + Math.floor(rng() * (max - min + 1)),
  float: (min, max, dec = 1) => +(min + rng() * (max - min)).toFixed(dec),
  pick: (arr) => arr[Math.floor(rng() * arr.length)],
});

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const ICON = {
  chip: [   // 7x7 server/chip
    'XXXXXXX',
    'X.....X',
    'X.XX..X',
    'XXXXXXX',
    'X.....X',
    'X.XX..X',
    'XXXXXXX',
  ],
  up: [     // 5x6 up arrow
    '..X..',
    '.XXX.',
    'XXXXX',
    '..X..',
    '..X..',
    '..X..',
  ],
  down: [   // 5x6 down arrow
    '..X..',
    '..X..',
    '..X..',
    'XXXXX',
    '.XXX.',
    '..X..',
  ],
  therm: [  // 3x7 thermometer
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    'XXX',
    'XXX',
    '.X.',
  ],
};

// ---------------------------------------------------------------------------
// Panel drawing
// ---------------------------------------------------------------------------

// Segmented VU-style meter: `count` segments, 3px wide + 1px gap, `h` tall.
function drawMeter(p, x, y, count, h, pct) {
  let lit = Math.round((count * pct) / 100);
  if (pct > 0 && lit === 0) lit = 1;
  for (let i = 0; i < count; i++) {
    const sx = x + i * 4;
    let col = C.dim;
    if (i < lit) {
      const frac = i / count;
      col = frac < 0.55 ? C.green : frac < 0.85 ? C.yellow : C.red;
    }
    p.fillRect(sx, y, 3, h, col);
  }
}

const usageColor = (pct) => (pct < 60 ? C.green : pct < 85 ? C.yellow : C.red);
const fmtRate = (v) => (v >= 10 ? String(Math.round(v)) : v.toFixed(1)) + 'M';

function drawServerPanel(rand) {
  const p = new Panel();

  // Pseudo data
  const hostname = rand.pick(['WEB-01', 'APP-02', 'DB-01', 'CACHE-1', 'NODE-04', 'SRV-01']);
  const cpu = rand.int(4, 97);
  const mem = rand.int(22, 94);
  const dsk = rand.int(28, 96);
  const tempC = rand.int(38, 82);
  const netTx = rand.float(0.2, 45.0);
  const netRx = rand.float(0.5, 380.0);
  const cores = rand.pick([4, 8, 16]);
  const load = +((cpu / 100) * cores * rand.float(0.7, 1.15, 2)).toFixed(2);
  const upDays = rand.int(0, 148);
  const upHours = rand.int(0, 23);
  const uptime = upDays > 0
    ? `UP ${upDays}D ${upHours}H`
    : `UP ${upHours}H ${rand.int(1, 59)}M`;

  // Header: chip icon + hostname | uptime (center) | load avg (right)
  const worst = Math.max(cpu, mem, dsk);
  let statusColor = C.green;
  if (worst >= 85 || tempC >= 75) statusColor = C.yellow;
  if (worst >= 95 || tempC >= 80) statusColor = C.red;

  p.icon(2, 2, ICON.chip, statusColor);
  p.text(hostname, 12, 1, C.white);

  const loadText = 'LD ' + load.toFixed(2);
  const loadRatio = load / cores;
  const loadColor = loadRatio < 0.7 ? C.green : loadRatio < 1.0 ? C.yellow : C.red;
  const loadX = rightX(loadText, 190);
  p.text(loadText, loadX, 1, loadColor);

  const hostEnd = 12 + textW(hostname);
  const upX = hostEnd + Math.floor((loadX - hostEnd - textW(uptime)) / 2);
  p.text(uptime, upX, 1, C.gray);

  p.hline(0, 191, 9, C.dkgray);

  // Body left: CPU / MEM / DSK segmented meters
  const rowYs = [10, 17, 24];
  const rows = [['CPU', cpu], ['MEM', mem], ['DSK', dsk]];
  rows.forEach(([label, pct], i) => {
    const y = rowYs[i];
    p.text(label, 2, y, C.gray);
    drawMeter(p, 19, y + 2, 16, 5, pct);
    const pctText = pct + '%';
    p.text(pctText, rightX(pctText, 105), y, usageColor(pct));
  });

  p.vline(110, 11, 31, C.dkgray);

  // Body right: network TX/RX + core temp
  const tempColor = tempC < 60 ? C.green : tempC < 75 ? C.yellow : C.red;

  p.icon(115, rowYs[0] + 1, ICON.up, C.green);
  p.text('TX', 123, rowYs[0], C.gray);
  const txText = fmtRate(netTx);
  p.text(txText, rightX(txText, 190), rowYs[0], C.green);

  p.icon(115, rowYs[1] + 1, ICON.down, C.cyan);
  p.text('RX', 123, rowYs[1], C.gray);
  const rxText = fmtRate(netRx);
  p.text(rxText, rightX(rxText, 190), rowYs[1], C.cyan);

  p.icon(116, rowYs[2] + 1, ICON.therm, tempColor);
  p.text('TMP', 123, rowYs[2], C.gray);
  const tempText = tempC + 'C';
  p.text(tempText, rightX(tempText, 190), rowYs[2], tempColor);

  return p;
}

// ---------------------------------------------------------------------------
// PNG encoder (RGB, 8-bit) using CompressionStream('deflate')
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++)
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

async function deflate(data) {
  const cs = new CompressionStream('deflate'); // zlib wrapper, as PNG expects
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}

function pngChunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

async function encodePNG(panel) {
  const { w, h, px } = panel;

  // Raw scanlines, each prefixed with filter byte 0
  const stride = w * 3;
  const raw = new Uint8Array((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    raw.set(px.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }

  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, w);
  dv.setUint32(4, h);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: truecolor RGB
  const idat = await deflate(raw);

  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const chunks = [sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', new Uint8Array(0))];
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

// ---------------------------------------------------------------------------
// Worker entry — every request returns the 192x32 PNG
// ---------------------------------------------------------------------------

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const seedParam = url.searchParams.get('seed');
    const seed = seedParam !== null ? parseInt(seedParam, 10) || 0 : (Math.random() * 0xffffffff) | 0;

    const panel = drawServerPanel(makeRand(mulberry32(seed)));

    return new Response(await encodePNG(panel), {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    });
  },
};
