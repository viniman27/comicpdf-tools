// Shared primitives: icons, halftone backdrops, panel decorations
const { useEffect, useState, useRef, useCallback, useMemo } = React;

// ---------- Icons (simple SVG, only primitive shapes) ----------
const Icon = ({ name, size = 20, stroke = 2.5 }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "upload": return (
      <svg {...props}><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>
    );
    case "download": return (
      <svg {...props}><path d="M12 4v12M6 10l6 6 6-6"/><path d="M4 20h16"/></svg>
    );
    case "file": return (
      <svg {...props}><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>
    );
    case "check": return (
      <svg {...props}><path d="M5 12l4 4 10-10"/></svg>
    );
    case "x": return (
      <svg {...props}><path d="M6 6l12 12M6 18L18 6"/></svg>
    );
    case "alert": return (
      <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor"/></svg>
    );
    case "sun": return (
      <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    );
    case "moon": return (
      <svg {...props}><path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/></svg>
    );
    case "globe": return (
      <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
    );
    case "lock": return (
      <svg {...props}><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
    );
    case "bolt": return (
      <svg {...props}><path d="M13 3L5 14h6l-1 7 8-11h-6z"/></svg>
    );
    case "stack": return (
      <svg {...props}><rect x="4" y="4" width="14" height="14" rx="1"/><path d="M8 8h14v14H8z"/></svg>
    );
    case "arrow-right": return (
      <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    );
    case "arrow-down": return (
      <svg {...props}><path d="M12 5v14M6 13l6 6 6-6"/></svg>
    );
    case "menu": return (
      <svg {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    );
    case "comic": return (
      <svg {...props}><rect x="3" y="3" width="8" height="8" rx="0.5"/><rect x="13" y="3" width="8" height="8" rx="0.5"/><rect x="3" y="13" width="8" height="8" rx="0.5"/><rect x="13" y="13" width="8" height="8" rx="0.5"/></svg>
    );
    default: return null;
  }
};

// ---------- Halftone corner blob (decorative) ----------
const HalftoneCorner = ({ corner = "tr", size = 110, color }) => {
  const style = {
    position: "absolute",
    width: size, height: size,
    pointerEvents: "none",
    backgroundImage: `radial-gradient(${color || "currentColor"} 1.6px, transparent 2px)`,
    backgroundSize: "10px 10px",
    opacity: 0.5,
    maskImage: corner === "tr" ? "radial-gradient(circle at top right, black 0%, transparent 70%)"
      : corner === "tl" ? "radial-gradient(circle at top left, black 0%, transparent 70%)"
      : corner === "bl" ? "radial-gradient(circle at bottom left, black 0%, transparent 70%)"
      : "radial-gradient(circle at bottom right, black 0%, transparent 70%)",
    WebkitMaskImage: corner === "tr" ? "radial-gradient(circle at top right, black 0%, transparent 70%)"
      : corner === "tl" ? "radial-gradient(circle at top left, black 0%, transparent 70%)"
      : corner === "bl" ? "radial-gradient(circle at bottom left, black 0%, transparent 70%)"
      : "radial-gradient(circle at bottom right, black 0%, transparent 70%)",
  };
  if (corner.includes("t")) style.top = 0;
  else style.bottom = 0;
  if (corner.includes("r")) style.right = 0;
  else style.left = 0;
  return <div style={style}/>;
};

// ---------- Speech bubble ----------
const SpeechBubble = ({ children, tail = "bl" }) => (
  <div className="speech">{children}</div>
);

// ---------- Logo mark ----------
const LogoMark = ({ size = 40 }) => (
  <div style={{
    width: size, height: size,
    background: "var(--red)",
    border: "2.5px solid var(--ink)",
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    boxShadow: "2px 2px 0 var(--ink)",
    color: "var(--paper)",
    position: "relative",
    overflow: "hidden",
  }}>
    <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8"/>
      <rect x="13" y="3" width="8" height="8"/>
      <rect x="3" y="13" width="8" height="8"/>
      <rect x="13" y="13" width="8" height="8"/>
    </svg>
  </div>
);

// ---------- Page background — subtle halftone strip ----------
const PageBackdrop = () => (
  <div style={{
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    backgroundImage: "radial-gradient(var(--ink) 0.9px, transparent 1.1px)",
    backgroundSize: "22px 22px",
    opacity: 0.04,
  }}/>
);

// ---------- Ad slot placeholder ----------
const AdSlot = ({ slot = "7526980307" }) => {
  const ref = useRef(null);
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, []);
  return (
    <div style={{ overflow: "hidden", textAlign: "center", minHeight: 90 }}>
      <ins ref={ref} className="adsbygoogle" style={{ display: "block" }}
        data-ad-client="ca-pub-7987917511842847"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

// ---------- ToggleGroup (segmented) ----------
const Seg = ({ value, onChange, options }) => (
  <div className="seg">
    {options.map(opt => (
      <button
        key={opt.value}
        className={value === opt.value ? "active" : ""}
        onClick={() => onChange(opt.value)}
        type="button"
      >
        {opt.label}
      </button>
    ))}
  </div>
);

Object.assign(window, {
  Icon, HalftoneCorner, SpeechBubble, LogoMark, PageBackdrop, AdSlot, Seg,
});
