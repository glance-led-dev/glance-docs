/**
 * Home Automation LED panel — Cloudflare Worker / Pages Function
 *
 * Responds to EVERY request with a single 192x32 PNG image showing pseudo
 * (random) smart-home data: alarm status + clock, indoor/outdoor climate,
 * door/window/garage sensors, and energy (draw / solar / today's usage).
 * If the alarm is armed and a sensor is open, the status escalates to ALERT.
 *
 * Optional: ?seed=123 for reproducible data, ?tz=America/Chicago for the
 * clock (default America/New_York).
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
  red:    [255, 50, 50],
  green:  [0, 255, 80],
  yellow: [255, 170, 0],
  orange: [255, 140, 0],
  cyan:   [80, 200, 255],
  blue:   [100, 180, 255],
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
  house: [  // 7x7 house
    '...X...',
    '..XXX..',
    '.XXXXX.',
    'XXXXXXX',
    '.XX.XX.',
    '.XX.XX.',
    '.XXXXX.',
  ],
  lock: [   // 5x7 padlock
    '.XXX.',
    'X...X',
    'X...X',
    'XXXXX',
    'XX.XX',
    'XX.XX',
    'XXXXX',
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
  drop: [   // 5x6 water drop
    '..X..',
    '..X..',
    '.XXX.',
    'XXXXX',
    'XXXXX',
    '.XXX.',
  ],
  door: [   // 4x7 door with knob
    'XXXX',
    'X..X',
    'X..X',
    'X.XX',
    'X..X',
    'X..X',
    'XXXX',
  ],
  window: [ // 5x5 window panes
    'XXXXX',
    'X.X.X',
    'XXXXX',
    'X.X.X',
    'XXXXX',
  ],
  garage: [ // 6x6 garage
    '.XXXX.',
    'XXXXXX',
    'X....X',
    'X.XX.X',
    'X....X',
    'X.XX.X',
  ],
  bolt: [   // 4x6 lightning bolt
    '..XX',
    '.XX.',
    'XXXX',
    '.XX.',
    'XX..',
    'X...',
  ],
  sun: [    // 5x5 sun
    'X.X.X',
    '.XXX.',
    'XXXXX',
    '.XXX.',
    'X.X.X',
  ],
  chart: [  // 5x5 mini bar chart
    '....X',
    '..X.X',
    '..X.X',
    'X.X.X',
    'XXXXX',
  ],
};

// ---------------------------------------------------------------------------
// Panel drawing
// ---------------------------------------------------------------------------

const outdoorColor = (f) => (f < 50 ? C.blue : f < 85 ? C.green : C.orange);

function localTimeText(tz) {
  try {
    const s = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
    // "3:46 PM" (possibly with a narrow no-break space) -> "3:46P"
    return s.replace(/\s*(AM|PM)/, (_, ap) => ap[0]);
  } catch {
    return '12:00P';
  }
}

function drawHomePanel(rand, timeText) {
  const p = new Panel();

  // Pseudo data
  const tempIn = rand.int(66, 78);
  const tempOut = rand.int(34, 96);
  const humidity = rand.int(28, 72);
  const powerKw = rand.float(0.3, 4.8, 2);
  const solarKw = rand.float(0.0, 6.2, 1);
  const todayKwh = rand.float(4.0, 38.0, 1);

  const doorOpen = rand.int(1, 10) <= 2;
  const windowOpen = rand.int(1, 10) <= 2;
  const garageOpen = rand.int(1, 10) <= 3;

  const armed = rand.int(0, 1) === 1;
  const anyOpen = doorOpen || windowOpen || garageOpen;
  const alarmStatus = armed && anyOpen ? 'ALERT' : armed ? 'ARMED' : 'DISARMED';

  // Header: house + HOME | lock + alarm status (center) | time (right)
  p.icon(2, 2, ICON.house, C.orange);
  p.text('HOME', 12, 1, C.white);

  const timeX = rightX(timeText, 190);
  p.text(timeText, timeX, 1, C.gray);

  const statusColor = { ARMED: C.green, DISARMED: C.gray, ALERT: C.red }[alarmStatus];
  const homeEnd = 12 + textW('HOME');
  const statusW = 5 + 3 + textW(alarmStatus); // lock + gap + text
  const statusX = homeEnd + Math.floor((timeX - homeEnd - statusW) / 2);
  p.icon(statusX, 1, ICON.lock, statusColor);
  p.text(alarmStatus, statusX + 8, 1, statusColor);

  p.hline(0, 191, 9, C.dkgray);

  const rowYs = [10, 17, 24];

  // Column 1 (x 0-54): climate — IN / OUT / HUM
  p.icon(3, rowYs[0] + 1, ICON.therm, C.orange);
  p.text('IN', 9, rowYs[0], C.gray);
  const inText = tempIn + 'F';
  p.text(inText, rightX(inText, 54), rowYs[0], C.white);

  p.icon(3, rowYs[1] + 1, ICON.therm, C.blue);
  p.text('OUT', 9, rowYs[1], C.gray);
  const outText = tempOut + 'F';
  p.text(outText, rightX(outText, 54), rowYs[1], outdoorColor(tempOut));

  p.icon(2, rowYs[2] + 1, ICON.drop, C.cyan);
  p.text('HUM', 9, rowYs[2], C.gray);
  const humText = humidity + '%';
  p.text(humText, rightX(humText, 54), rowYs[2], C.cyan);

  p.vline(58, 11, 31, C.dkgray);

  // Column 2 (x 62-122): security — DOOR / WNDW / GARAGE
  const sensors = [
    [ICON.door, 'DOOR', doorOpen, 1],
    [ICON.window, 'WNDW', windowOpen, 2],
    [ICON.garage, 'GARAGE', garageOpen, 1],
  ];
  sensors.forEach(([icon, label, open, iconDy], i) => {
    const y = rowYs[i];
    const state = open ? 'OPEN' : 'OK';
    p.icon(62, y + iconDy, icon, C.gray);
    p.text(label, 70, y, C.gray);
    p.text(state, rightX(state, 122), y, open ? C.red : C.green);
  });

  p.vline(126, 11, 31, C.dkgray);

  // Column 3 (x 130-190): energy — PWR / SOL / TDY
  p.icon(131, rowYs[0] + 1, ICON.bolt, C.yellow);
  p.text('PWR', 138, rowYs[0], C.gray);
  const pwrText = powerKw.toFixed(2) + 'KW';
  p.text(pwrText, rightX(pwrText, 190), rowYs[0], C.yellow);

  p.icon(131, rowYs[1] + 2, ICON.sun, C.green);
  p.text('SOL', 138, rowYs[1], C.gray);
  const solText = solarKw.toFixed(1) + 'KW';
  p.text(solText, rightX(solText, 190), rowYs[1], C.green);

  p.icon(131, rowYs[2] + 2, ICON.chart, C.blue);
  p.text('TDY', 138, rowYs[2], C.gray);
  const tdyText = Math.round(todayKwh) + 'KWH';
  p.text(tdyText, rightX(tdyText, 190), rowYs[2], C.white);

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

    const timeText = localTimeText(url.searchParams.get('tz') || 'America/New_York');
    const panel = drawHomePanel(makeRand(mulberry32(seed)), timeText);

    return new Response(await encodePNG(panel), {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    });
  },
};
