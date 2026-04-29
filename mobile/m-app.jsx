// Mobile app shell — top bar + screens + tab bar inside a phone frame
const { useState, useEffect } = React;

// Extend i18n with mobile-only labels
const M_I18N_EXTRA = {
  en: { tabs: { home: "Home", convert: "Convert", guides: "Guides", faq: "FAQ", settings: "More" } },
  pt: { tabs: { home: "Início", convert: "Converter", guides: "Guias", faq: "FAQ", settings: "Mais" } },
};

const MobileApp = ({ hasNotch = false }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("comicpdf-m-theme") || "light");
  const [lang, setLang] = useState(() => localStorage.getItem("comicpdf-m-lang") || "en");
  const [tab, setTab] = useState("home");
  const [stack, setStack] = useState([]); // sub-screens
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("comicpdf-m-theme", theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem("comicpdf-m-lang", lang); }, [lang]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  const baseT = window.I18N[lang];
  const t = { ...baseT, tabs: M_I18N_EXTRA[lang].tabs };

  const top = stack[stack.length - 1];
  const navigate = (entry) => setStack(s => [...s, entry]);
  const back = () => setStack(s => s.slice(0, -1));
  const switchTab = (newTab) => { setTab(newTab); setStack([]); };
  const openConvert = () => { setTab("convert"); setStack([]); };

  // Top-bar config
  let topTitle = "";
  let topBack = null;
  if (top) {
    if (top.name === "guide") topTitle = top.id === "cbz" ? t.nav.cbz : top.id === "cbr" ? t.nav.cbr : t.nav.how;
    else if (top.name === "info") topTitle = top.id === "privacy" ? t.nav.privacy : top.id === "terms" ? t.nav.terms : (lang === "pt" ? "Sobre" : "About");
    topBack = back;
  } else {
    topTitle = tab === "home"
      ? <span>{t.brand}<span style={{ color: "var(--red)" }}>.</span><span style={{ fontSize: 11, fontFamily: "var(--font-mono)", marginLeft: 4, color: "var(--muted)", letterSpacing: "0.1em" }}>MOBILE</span></span>
      : tab === "convert" ? (lang === "pt" ? "Converter" : "Convert")
      : tab === "guides" ? (lang === "pt" ? "Guias" : "Guides")
      : tab === "faq" ? "FAQ"
      : (lang === "pt" ? "Mais" : "More");
  }

  // Body
  let body;
  if (top?.name === "guide") body = <MGuideDetail id={top.id} t={t} lang={lang} onBack={back}/>;
  else if (top?.name === "info") body = <MInfoDetail id={top.id} lang={lang}/>;
  else if (tab === "home") body = <MHomeScreen t={t} lang={lang} onTab={switchTab} onOpenConvert={openConvert}/>;
  else if (tab === "convert") body = <MConvertScreen t={t} lang={lang} setToast={setToast}/>;
  else if (tab === "guides") body = <MGuidesScreen t={t} lang={lang} navigate={navigate}/>;
  else if (tab === "faq") body = <MFAQScreen t={t} lang={lang}/>;
  else body = <MSettingsScreen t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} navigate={navigate}/>;

  return (
    <div className={"app-shell" + (hasNotch ? " has-notch" : "")} style={hasNotch ? { paddingTop: 54 } : undefined}>
      <TopBar title={topTitle} onBack={topBack} lang={lang} theme={theme} setTheme={setTheme}/>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div className="dots-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
        <div style={{ position: "relative", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {body}
        </div>
        {toast && <div className="m-toast">{toast}</div>}
      </div>
      <TabBar tab={tab} setTab={switchTab} t={t}/>
    </div>
  );
};

// ===== Mount =====
// Render inside the phone frame stage. We use the iOS frame component.
const Stage = () => {
  const [device, setDevice] = useState("iphone"); // iphone | bare

  return (
    <div className="frame-stage">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)" }}>
            ComicPDF<span style={{ color: "var(--red)" }}>.</span>Mobile
          </div>
          <span className="m-chip m-chip-yellow">PROTOTYPE</span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button className={"m-chip" + (device === "iphone" ? " m-chip-red" : "")} onClick={() => setDevice("iphone")}>iPhone</button>
          <button className={"m-chip" + (device === "bare" ? " m-chip-red" : "")} onClick={() => setDevice("bare")}>Bare 375</button>
        </div>

        {device === "iphone" ? (
          <div style={{
            width: 402, height: 874, borderRadius: 48,
            position: "relative", overflow: "hidden",
            background: "#000",
            boxShadow: "0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)",
            padding: 8,
          }}>
            <div style={{
              position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
              width: 126, height: 37, borderRadius: 24, background: "#000", zIndex: 50,
              pointerEvents: "none",
            }}/>
            <div style={{ width: "100%", height: "100%", borderRadius: 42, overflow: "hidden", background: "var(--paper)" }}>
              <MobileApp hasNotch={true}/>
            </div>
          </div>
        ) : (
          <div style={{
            width: 390, height: 780,
            border: "3px solid var(--ink)",
            borderRadius: 32,
            overflow: "hidden",
            background: "var(--paper)",
            boxShadow: "10px 10px 0 var(--ink)",
          }}>
            <MobileApp/>
          </div>
        )}

        <div className="mono muted" style={{ fontSize: 12, textAlign: "center", maxWidth: 420 }}>
          ↑ Drop a real .cbz on the Convert screen — it actually converts to PDF in-browser.
        </div>
      </div>
    </div>
  );
};

const isMobile = window.matchMedia("(max-width: 600px)").matches;
ReactDOM.createRoot(document.getElementById("root")).render(
  isMobile ? <MobileApp/> : <Stage/>
);
