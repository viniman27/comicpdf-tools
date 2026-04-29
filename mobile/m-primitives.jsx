// Mobile primitives — icons, logo, halftone, tab bar, top bar
const { useState, useEffect, useRef, useCallback } = React;

const MIcon = ({ name, size = 22, stroke = 2.5 }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "upload": return <svg {...props}><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>;
    case "download": return <svg {...props}><path d="M12 4v12M6 10l6 6 6-6"/><path d="M4 20h16"/></svg>;
    case "file": return <svg {...props}><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>;
    case "check": return <svg {...props}><path d="M5 12l4 4 10-10"/></svg>;
    case "x": return <svg {...props}><path d="M6 6l12 12M6 18L18 6"/></svg>;
    case "alert": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor"/></svg>;
    case "sun": return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case "moon": return <svg {...props}><path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/></svg>;
    case "lock": return <svg {...props}><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
    case "bolt": return <svg {...props}><path d="M13 3L5 14h6l-1 7 8-11h-6z"/></svg>;
    case "stack": return <svg {...props}><rect x="4" y="4" width="14" height="14" rx="1"/><path d="M8 8h14v14H8z"/></svg>;
    case "arrow-right": return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "arrow-left": return <svg {...props}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case "menu": return <svg {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case "comic": return <svg {...props}><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>;
    case "home": return <svg {...props}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg>;
    case "info": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r="0.6" fill="currentColor"/></svg>;
    case "help": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "chevron-right": return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case "globe": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    default: return null;
  }
};

const MLogo = ({ size = 30 }) => (
  <div className="m-logo" style={{ width: size, height: size }}>
    <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/>
      <rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>
    </svg>
  </div>
);

const TopBar = ({ title, onBack, right, lang, theme, setTheme }) => (
  <div className="topbar">
    {onBack ? (
      <button className="topbar-back" onClick={onBack} aria-label="back"><MIcon name="arrow-left" size={18}/></button>
    ) : (
      <MLogo/>
    )}
    <div className="topbar-title" style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
      {title}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      {right || (
        <button className="topbar-icon-btn" onClick={() => setTheme && setTheme(theme === "light" ? "dark" : "light")}>
          <MIcon name={theme === "light" ? "moon" : "sun"} size={16}/>
        </button>
      )}
    </div>
  </div>
);

const TabBar = ({ tab, setTab, t }) => {
  const items = [
    { id: "home", icon: "home", label: t.tabs?.home || "Home" },
    { id: "convert", icon: "bolt", label: t.tabs?.convert || "Convert" },
    { id: "guides", icon: "stack", label: t.tabs?.guides || "Guides" },
    { id: "faq", icon: "help", label: t.tabs?.faq || "FAQ" },
    { id: "settings", icon: "settings", label: t.tabs?.settings || "Settings" },
  ];
  return (
    <div className="tabbar">
      {items.map(it => (
        <button key={it.id} className={"tab-item" + (tab === it.id ? " active" : "")} onClick={() => setTab(it.id)}>
          <span className="tab-icon"><MIcon name={it.icon} size={18}/></span>
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
};

const Sheet = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <React.Fragment>
      <div className="sheet-backdrop" onClick={onClose}/>
      <div className="sheet">
        <div className="sheet-grab"/>
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="m-display-md">{title}</div>
            <button className="topbar-icon-btn" onClick={onClose}><MIcon name="x" size={16}/></button>
          </div>
        )}
        {children}
      </div>
    </React.Fragment>
  );
};

const MAd = ({ size = "banner", note }) => {
  const labels = {
    banner: "320×100 mobile banner",
    rect: "300×250 rectangle",
    sticky: "320×50 sticky banner",
  };
  return (
    <div className="m-ad" style={{ minHeight: size === "rect" ? 250 : size === "sticky" ? 60 : 100 }}>
      <div>
        <div style={{ opacity: 0.7 }}>Advertisement</div>
        <strong>{labels[size]}</strong>
        {note && <div style={{ marginTop: 4, fontSize: 9, opacity: 0.7 }}>{note}</div>}
      </div>
    </div>
  );
};

const MSeg = ({ value, onChange, options }) => (
  <div className="m-seg">
    {options.map(o => (
      <button key={o.value} className={value === o.value ? "active" : ""} onClick={() => onChange(o.value)}>
        {o.label}
      </button>
    ))}
  </div>
);

Object.assign(window, { MIcon, MLogo, TopBar, TabBar, Sheet, MAd, MSeg });
