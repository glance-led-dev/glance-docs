import React, {useEffect, useRef, useState} from 'react';

// The named palette from gdn/colors.py, shown as glowing chips on a black
// panel. Click a chip to copy the name — the exact string you pass as
// color="..." in app.star. Aliases (grey/darkgrey/midgrey) aren't repeated.
const PALETTE = [
  ['white', [255, 255, 255]],
  ['red', [255, 0, 0]],
  ['green', [0, 220, 70]],
  ['puregreen', [0, 255, 0]],
  ['blue', [0, 90, 255]],
  ['yellow', [255, 220, 80]],
  ['orange', [255, 140, 0]],
  ['cyan', [0, 220, 220]],
  ['magenta', [255, 0, 200]],
  ['amber', [255, 191, 0]],
  ['pink', [255, 105, 180]],
  ['purple', [117, 33, 249]],
  ['skyblue', [120, 220, 255]],
  ['gray', [150, 150, 150]],
  ['midgray', [80, 80, 80]],
  ['darkgray', [40, 40, 40]],
  ['black', [0, 0, 0]],
];

const hex = ([r, g, b]) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

function Chip({name, rgb}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard unavailable (http, permissions) — the chip is still a reference.
    }
  };

  const [r, g, b] = rgb;
  const bright = r + g + b > 60;
  return (
    <button
      type="button"
      className="colorChip"
      onClick={copy}
      title={`${hex(rgb)} — click to copy "${name}"`}>
      <span
        className="colorChip__dot"
        style={{
          background: `rgb(${r},${g},${b})`,
          boxShadow: bright ? `0 0 14px rgba(${r},${g},${b},0.55)` : 'none',
          border: bright ? 'none' : '1px solid #333',
        }}
      />
      <span className="colorChip__name">{copied ? 'copied!' : name}</span>
      <span className="colorChip__hex">{hex(rgb)}</span>
    </button>
  );
}

export default function ColorSwatches() {
  return (
    <div className="colorGrid" role="list" aria-label="Named panel colors">
      {PALETTE.map(([name, rgb]) => (
        <Chip key={name} name={name} rgb={rgb} />
      ))}
    </div>
  );
}
