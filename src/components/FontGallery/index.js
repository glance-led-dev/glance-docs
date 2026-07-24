import React, {useMemo, useState} from 'react';

// The 37 bundled bitmap fonts as a filterable gallery, sorted by glyph
// height so you scan from tiny to huge. Click a card to copy the name —
// the exact string you pass as font="..." in c.text().
const FONTS = [
  '3x4', '3x7', '4x5', '4x7', '5x5', '5x5b', '5x7', '5x7b', '6x6', '6x8',
  '6x16', '7x10', '7x12', '7x14', '7x16', '8x12', '10x10', '10x14', '10x16',
  '10x16_bold', '16x20', '16x20_bold', '16x24', '16x24_bold', '19x28',
  '19x28_bold', '20x30', '20x30_bold', '20x30_scroll', '22x32', '22x32_bold',
  '24x36', '24x36_bold', 'picopixel', 'scoretext', 'teamabbrev', 'vs',
];

function meta(name) {
  const m = name.match(/^(\d+)x(\d+)(?:_(\w+))?$/);
  if (!m) {
    return {w: null, h: 99, tag: 'special'};
  }
  return {w: Number(m[1]), h: Number(m[2]), tag: m[3] ?? null};
}

function Card({name}) {
  const [copied, setCopied] = useState(false);
  const {w, h, tag} = meta(name);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <button type="button" className="fontCard" onClick={copy} title={`Copy "${name}"`}>
      <span className="fontCard__head">
        <span className="fontCard__name">{copied ? 'copied!' : name}</span>
        <span className="fontCard__chip">
          {w ? `${w}×${h}` : 'custom'}
          {tag && tag !== 'special' ? ` ${tag}` : ''}
        </span>
      </span>
      <span className="fontCard__shot">
        <img src={`/img/fonts/${name}.png`} alt={`${name} font specimen: ABC XYZ 0123`} loading="lazy" />
      </span>
    </button>
  );
}

export default function FontGallery() {
  const [query, setQuery] = useState('');
  const fonts = useMemo(() => {
    const sorted = [...FONTS].sort((a, b) => meta(a).h - meta(b).h || a.localeCompare(b));
    const q = query.trim().toLowerCase();
    return q ? sorted.filter((f) => f.includes(q)) : sorted;
  }, [query]);

  return (
    <div className="fontGallery">
      <input
        type="search"
        className="fontGallery__filter"
        placeholder={`Filter ${FONTS.length} fonts… (e.g. "bold", "16x")`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Filter fonts"
      />
      <div className="fontGallery__grid">
        {fonts.map((name) => (
          <Card key={name} name={name} />
        ))}
      </div>
      {fonts.length === 0 && (
        <p className="fontGallery__empty">No font matches “{query}”.</p>
      )}
    </div>
  );
}
