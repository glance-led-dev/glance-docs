import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';

// Renders a native-resolution panel screenshot (1 image pixel = 1 LED) as a
// simulated LED matrix: round dots on black, faint unlit dots for structure,
// and a soft glow pass for lit pixels. The plain <img> stays in the DOM until
// the canvas has painted (and for SEO/noscript), then hands over.
//
// Screenshots in /static/img are stored at panel resolution (128x32, 192x32),
// so no downsampling happens here — anything that isn't a native capture
// should keep the plain .led styling instead of using this component.

const OFF_LUMA = 10; // pixels darker than this render as unlit dots

function drawPanel(canvas, img, cssWidth) {
  const dpr = window.devicePixelRatio || 1;
  const cols = img.naturalWidth;
  const rows = img.naturalHeight;
  if (!cols || !rows) {
    return false;
  }

  // Integer device pixels per LED keeps the dot grid crisp.
  const cell = Math.max(2, Math.floor((cssWidth * dpr) / cols));
  canvas.width = cols * cell;
  canvas.height = rows * cell;
  canvas.style.width = `${canvas.width / dpr}px`;

  const probe = document.createElement('canvas');
  probe.width = cols;
  probe.height = rows;
  const probeCtx = probe.getContext('2d', {willReadFrequently: true});
  probeCtx.drawImage(img, 0, 0);
  let data;
  try {
    data = probeCtx.getImageData(0, 0, cols, rows).data;
  } catch {
    return false; // tainted canvas (cross-origin image) — keep the <img>
  }

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radius = cell * 0.42;

  // Lit dots go sharp onto their own layer; the glow is one blurred stamp
  // of that layer (per-dot blur is what made first paint slow). Unlit dots
  // draw straight onto the panel.
  const lit = document.createElement('canvas');
  lit.width = canvas.width;
  lit.height = canvas.height;
  const litCtx = lit.getContext('2d');

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const isLit = r + g + b > OFF_LUMA * 3;
      const target = isLit ? litCtx : ctx;
      target.fillStyle = isLit
        ? `rgb(${r},${g},${b})`
        : 'rgba(255,255,255,0.055)';
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
  return true;
}

export default function LedImage({className, width, style, alt = '', ...imgProps}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) {
      return undefined;
    }
    let cancelled = false;
    const render = () => {
      if (cancelled) {
        return;
      }
      // Fill the container, like the .led img { width: 100% } rule the
      // canvas replaces (the chrome padding is already inside clientWidth).
      const cssWidth =
        canvas.parentElement.clientWidth - 16 ||
        Number(width) ||
        img.naturalWidth * 3;
      if (drawPanel(canvas, img, cssWidth)) {
        setReady(true);
      }
    };
    if (img.complete && img.naturalWidth) {
      render();
    } else {
      img.addEventListener('load', render);
    }
    return () => {
      cancelled = true;
      img.removeEventListener('load', render);
    };
  }, [width]);

  return (
    <span className={clsx('ledPanel', className)} style={style}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="ledPanel__canvas"
        style={{display: ready ? 'block' : 'none'}}
      />
      {/* Source of truth for pixels; visible until the canvas takes over. */}
      <img
        ref={imgRef}
        alt={alt}
        {...imgProps}
        style={{display: ready ? 'none' : 'block'}}
      />
    </span>
  );
}
