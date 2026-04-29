// Main app shell — header, footer, router, theme/lang
const { useState, useEffect } = React;

const ROUTES = [
  { path: "/", key: "converter", label: (t) => t.nav.converter },
  { path: "/cbz-to-pdf", key: "cbz", label: (t) => t.nav.cbz },
  { path: "/cbr-to-pdf", key: "cbr", label: (t) => t.nav.cbr },
  { path: "/how-it-works", key: "how", label: (t) => t.nav.how },
  { path: "/faq", key: "faq", label: (t) => t.nav.faq },
];

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("comicpdf-theme") || "light");
  const [lang, setLang] = useState(() => localStorage.getItem("comicpdf-lang") || "en");
  const [route, setRoute] = useState(() => location.hash.replace("#", "") || "/");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("comicpdf-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("comicpdf-lang", lang);
  }, [lang]);

  useEffect(() => {
    const onHash = () => setRoute(location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (path) => {
    location.hash = path;
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const t = window.I18N[lang];

  let pageEl;
  switch (route) {
    case "/cbz-to-pdf": pageEl = <CBZGuidePage t={t} lang={lang} navigate={navigate}/>; break;
    case "/cbr-to-pdf": pageEl = <CBRGuidePage t={t} lang={lang} navigate={navigate}/>; break;
    case "/how-it-works": pageEl = <HowItWorksPage t={t} lang={lang}/>; break;
    case "/faq": pageEl = <FAQPage t={t} lang={lang}/>; break;
    case "/privacy": pageEl = <PrivacyPage lang={lang}/>; break;
    case "/terms": pageEl = <TermsPage lang={lang}/>; break;
    default: pageEl = <HomePage t={t} lang={lang} navigate={navigate}/>;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <PageBackdrop/>
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteHeader t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} route={route} navigate={navigate}/>
        <main>{pageEl}</main>
        <SiteFooter t={t} lang={lang} navigate={navigate}/>
      </div>
    </div>
  );
};

const SiteHeader = ({ t, lang, setLang, theme, setTheme, route, navigate }) => (
  <header className="site-header">
    <div className="site-header-inner">
      <a className="brand" onClick={(e) => { e.preventDefault(); navigate("/"); }} href="#/">
        <LogoMark size={36}/>
        <span>
          {t.brand}<span style={{ color: "var(--red)" }}>.</span>
          <span style={{ fontSize: 13, marginLeft: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", color: "var(--muted)" }}>
            {t.brandSub}
          </span>
        </span>
      </a>

      <nav className="nav">
        {ROUTES.map(r => (
          <a key={r.path} href={"#" + r.path}
            onClick={(e) => { e.preventDefault(); navigate(r.path); }}
            className={"nav-link" + (route === r.path ? " active" : "")}>
            {r.label(t)}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <div className="seg" style={{ boxShadow: "2px 2px 0 var(--ink)" }}>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "pt" ? "active" : ""} onClick={() => setLang("pt")}>PT</button>
        </div>
        <button className="btn btn-paper btn-sm icon-btn" onClick={() => setTheme(theme === "light" ? "dark" : "light")} title="Toggle theme">
          <Icon name={theme === "light" ? "moon" : "sun"} size={16}/>
        </button>
      </div>
    </div>
  </header>
);

const SiteFooter = ({ t, lang, navigate }) => (
  <footer className="site-footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <LogoMark size={36}/>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>
              {t.brand}<span style={{ color: "var(--yellow)" }}>.</span>{t.brandSub}
            </div>
          </div>
          <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 320 }}>{t.footer.blurb}</p>
          <div className="mono" style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
            {t.footer.domain}
          </div>
        </div>

        <div>
          <div className="footer-heading">{t.footer.tools}</div>
          <a className="footer-link" href="#/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>{t.nav.converter}</a>
          <a className="footer-link" href="#/cbz-to-pdf" onClick={(e) => { e.preventDefault(); navigate("/cbz-to-pdf"); }}>{t.nav.cbz}</a>
          <a className="footer-link" href="#/cbr-to-pdf" onClick={(e) => { e.preventDefault(); navigate("/cbr-to-pdf"); }}>{t.nav.cbr}</a>
        </div>
        <div>
          <div className="footer-heading">{t.footer.learn}</div>
          <a className="footer-link" href="#/how-it-works" onClick={(e) => { e.preventDefault(); navigate("/how-it-works"); }}>{t.nav.how}</a>
          <a className="footer-link" href="#/faq" onClick={(e) => { e.preventDefault(); navigate("/faq"); }}>{t.nav.faq}</a>
        </div>
        <div>
          <div className="footer-heading">{t.footer.legal}</div>
          <a className="footer-link" href="#/privacy" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>{t.nav.privacy}</a>
          <a className="footer-link" href="#/terms" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>{t.nav.terms}</a>
        </div>
      </div>

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1.5px solid color-mix(in oklab, var(--paper) 30%, transparent)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, opacity: 0.7 }}>
        <span className="mono">{t.footer.copy}</span>
        <span className="mono">v0.9.0 · {lang === "pt" ? "navegador" : "browser-only"}</span>
      </div>
    </div>
  </footer>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
