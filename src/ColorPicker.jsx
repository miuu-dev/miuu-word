import { useState, useRef, useEffect } from 'react';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function normalizeHex(input) {
  let h = String(input).trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h.split('').map((c) => c + c).join('');
  }
  return /^[0-9a-fA-F]{6}$/.test(h) ? `#${h.toUpperCase()}` : null;
}

function hexToHsv(hex) {
  const h = normalizeHex(hex) || '#000000';
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToHex({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Selector de color manual: área de saturación/brillo + barra de tono,
 * y debajo un campo para escribir el valor hexadecimal.
 */
export default function ColorPicker({
  value,
  onChange,
  quickColors = [],
  quickLabel = '',
  hexLabel = 'HEX',
  children,
}) {
  const safeValue = normalizeHex(value) || '#000000';
  const [hsv, setHsv] = useState(() => hexToHsv(safeValue));
  const [text, setText] = useState(safeValue);
  const areaRef = useRef(null);
  const hueRef = useRef(null);

  // Sincroniza cuando el valor cambia desde fuera (botones rápidos, etc.)
  useEffect(() => {
    if (hsvToHex(hsv) !== safeValue) {
      setHsv(hexToHsv(safeValue));
    }
    setText((prev) => (normalizeHex(prev) === safeValue ? prev : safeValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue]);

  const commit = (next) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setText(hex);
    onChange(hex);
  };

  const updateArea = (e) => {
    const rect = areaRef.current.getBoundingClientRect();
    const s = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const v = clamp(1 - (e.clientY - rect.top) / rect.height, 0, 1);
    commit({ ...hsv, s, v });
  };

  const updateHue = (e) => {
    const rect = hueRef.current.getBoundingClientRect();
    const h = clamp((e.clientX - rect.left) / rect.width, 0, 1) * 360;
    commit({ ...hsv, h: h >= 360 ? 359.99 : h });
  };

  const dragProps = (update) => ({
    onPointerDown: (e) => {
      e.preventDefault(); // mantiene el foco/selección del editor
      e.currentTarget.setPointerCapture(e.pointerId);
      update(e);
    },
    onPointerMove: (e) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) update(e);
    },
    onPointerUp: (e) => e.currentTarget.releasePointerCapture(e.pointerId),
  });

  const handleTextChange = (e) => {
    const raw = e.target.value.toUpperCase();
    setText(raw);
    // Solo aplica en vivo cuando está completo (6 dígitos)
    if (/^#?[0-9A-F]{6}$/.test(raw)) {
      const hex = normalizeHex(raw);
      setHsv(hexToHsv(hex));
      onChange(hex);
    }
  };

  const finishText = () => {
    const hex = normalizeHex(text);
    if (hex) {
      setHsv(hexToHsv(hex));
      setText(hex);
      onChange(hex);
    } else {
      setText(safeValue);
    }
  };

  return (
    <div className="cp-root">
      <div
        ref={areaRef}
        className="cp-area"
        style={{ backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }}
        {...dragProps(updateArea)}
      >
        <div className="cp-area-white" />
        <div className="cp-area-black" />
        <div
          className="cp-handle"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
        />
      </div>

      <div ref={hueRef} className="cp-hue" {...dragProps(updateHue)}>
        <div
          className="cp-hue-handle"
          style={{ left: `${(hsv.h / 360) * 100}%` }}
        />
      </div>

      <div className="cp-hex-row">
        <span className="cp-preview" style={{ backgroundColor: safeValue }} />
        <label className="cp-hex-label" htmlFor="cp-hex-input">
          {hexLabel}
        </label>
        <input
          id="cp-hex-input"
          type="text"
          className="cp-hex-input"
          value={text}
          maxLength={7}
          spellCheck={false}
          placeholder="#RRGGBB"
          onChange={handleTextChange}
          onBlur={finishText}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              finishText();
            }
          }}
        />
      </div>

      {quickColors.length > 0 && (
        <div className="cp-quick">
          {quickLabel && <span className="cp-section-label">{quickLabel}</span>}
          <div className="cp-quick-row">
            {quickColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`cp-quick-btn ${safeValue === c.hex.toUpperCase() ? 'selected' : ''}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(c.hex.toUpperCase())}
              />
            ))}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
