// Mobile screens — Home, Guides, FAQ, Settings
const { useState } = React;

// ===== Home screen =====
const MHomeScreen = ({ t, lang, onTab, onOpenConvert }) => (
  <div className="page-scroll" style={{ display: "grid", gap: 16 }}>
    {/* Hero */}
    <div className="m-panel" style={{ position: "relative", overflow: "visible", padding: 20 }}>
      <div className="m-halftone-strip" style={{ top: -30, right: -30 }}/>
      <span className="m-chip m-chip-yellow"><MIcon name="lock" size={11}/> {lang === "pt" ? "PRIVACIDADE" : "PRIVACY"}</span>
      <h1 className="m-display-xl" style={{ marginTop: 14, lineHeight: 1.1 }}>
        <span style={{ display: "block" }}>{lang === "pt" ? "Quadrinhos" : "Comics"}</span>
        <span style={{
          background: "var(--red)", color: "var(--paper)",
          padding: "2px 12px", display: "inline-block",
          marginTop: 6,
          transform: "rotate(-2deg)",
          border: "2.5px solid var(--ink)", borderRadius: 8,
          boxShadow: "3px 3px 0 var(--ink)",
          whiteSpace: "nowrap",
        }}>→ PDF</span>
      </h1>
      <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 12, marginBottom: 16 }}>
        {t.hero.sub}
      </p>
      <button className="m-btn m-btn-red" onClick={onOpenConvert}>
        <MIcon name="upload" size={18}/> {t.hero.cta}
      </button>
      <div style={{ marginTop: 14, marginBottom: -8 }}>
        <span className="m-speech">{t.hero.bubble}</span>
      </div>
    </div>

    {/* Quick stats / proof */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {[
        { v: "0B", l: lang === "pt" ? "uploads" : "uploads", c: "yellow" },
        { v: "100%", l: lang === "pt" ? "local" : "local", c: "red" },
        { v: "$0", l: lang === "pt" ? "custo" : "cost", c: "blue" },
      ].map((s, i) => (
        <div key={i} style={{
          background: s.c === "yellow" ? "var(--yellow)" : s.c === "red" ? "var(--red)" : "var(--blue)",
          color: s.c === "yellow" ? "var(--ink)" : "var(--paper)",
          border: "2.5px solid var(--ink)", borderRadius: 10, padding: "10px 8px",
          textAlign: "center", boxShadow: "2px 2px 0 var(--ink)",
        }}>
          <div className="m-display-md">{s.v}</div>
          <div className="m-eyebrow" style={{ fontSize: 9, opacity: 0.85, marginTop: 2 }}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* Ad slot — between hero and content per AdSense-safe layout */}
    <MAd size="banner" note={lang === "pt" ? "Longe do botão de download." : "Far from convert/download buttons."}/>

    {/* How it works mini */}
    <div>
      <div className="m-eyebrow muted" style={{ marginBottom: 6 }}>{t.sections.worksKicker}</div>
      <h2 className="m-display-lg" style={{ marginBottom: 12 }}>{t.sections.worksTitle}</h2>
      <div style={{ display: "grid", gap: 10 }}>
        <MStep n="01" tone="yellow" title={t.sections.step1Title} body={t.sections.step1Body} icon="upload"/>
        <MStep n="02" tone="blue" title={t.sections.step2Title} body={t.sections.step2Body} icon="stack"/>
        <MStep n="03" tone="red" title={t.sections.step3Title} body={t.sections.step3Body} icon="download"/>
      </div>
    </div>

    {/* Why local */}
    <div>
      <h2 className="m-display-lg" style={{ marginBottom: 12 }}>
        {lang === "pt" ? "Sem compromissos" : "No tradeoffs"}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { i: "lock", t: lang === "pt" ? "Privado" : "Private", d: lang === "pt" ? "Tudo no seu telefone" : "All on your phone" },
          { i: "bolt", t: lang === "pt" ? "Rápido" : "Fast", d: lang === "pt" ? "CPU local, sem fila" : "Local CPU, no queue" },
          { i: "globe", t: lang === "pt" ? "Offline" : "Offline", d: lang === "pt" ? "Funciona sem net" : "Works without net" },
          { i: "check", t: lang === "pt" ? "Grátis" : "Free", d: lang === "pt" ? "Sempre grátis" : "Always free" },
        ].map((it, i) => (
          <div key={i} style={{ background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: 10, padding: 12, boxShadow: "3px 3px 0 var(--ink)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--paper-2)", border: "2px solid var(--ink)", display: "grid", placeItems: "center" }}>
              <MIcon name={it.i} size={16}/>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, marginTop: 8 }}>{it.t}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{it.d}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Big CTA */}
    <button className="m-btn m-btn-red m-btn-lg" onClick={onOpenConvert}>
      <MIcon name="bolt" size={20}/> {lang === "pt" ? "Começar a converter" : "Start converting"}
    </button>

    <MAd size="rect" note={t.sections.adNote}/>
  </div>
);

const MStep = ({ n, tone, title, body, icon }) => {
  const bg = tone === "yellow" ? "var(--yellow)" : tone === "blue" ? "var(--blue)" : "var(--red)";
  const fg = tone === "yellow" ? "var(--ink)" : "var(--paper)";
  return (
    <div className="m-step">
      <div className="m-step-n" style={{ background: bg, color: fg }}>{n}</div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MIcon name={icon} size={16}/>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{title}</div>
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{body}</div>
      </div>
    </div>
  );
};

// ===== Convert screen =====
const MConvertScreen = ({ t, lang, setToast }) => (
  <div className="page-scroll">
    <MConverter t={t} lang={lang} setToast={setToast}/>
  </div>
);

// ===== Guides screen =====
const MGuidesScreen = ({ t, lang, navigate }) => (
  <div className="page-scroll" style={{ display: "grid", gap: 14 }}>
    <h2 className="m-display-lg">{lang === "pt" ? "Guias" : "Guides"}</h2>

    <button className="m-list-row" style={{ borderRadius: 12, border: "2.5px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", background: "var(--paper)" }}
      onClick={() => navigate({ name: "guide", id: "cbz" })}>
      <div className="row-icon" style={{ background: "var(--blue)", color: "var(--paper)" }}><MIcon name="file" size={18}/></div>
      <div>
        <div className="row-title">{t.nav.cbz}</div>
        <div className="row-sub">{lang === "pt" ? "Passo a passo, configurações" : "Step-by-step, settings"}</div>
      </div>
      <MIcon name="chevron-right" size={18}/>
    </button>

    <button className="m-list-row" style={{ borderRadius: 12, border: "2.5px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", background: "var(--paper)" }}
      onClick={() => navigate({ name: "guide", id: "cbr" })}>
      <div className="row-icon" style={{ background: "var(--yellow)" }}><MIcon name="alert" size={18}/></div>
      <div>
        <div className="row-title">{t.nav.cbr} <span className="m-chip m-chip-yellow" style={{ marginLeft: 4, padding: "2px 6px", fontSize: 8 }}>BETA</span></div>
        <div className="row-sub">{lang === "pt" ? "RAR no navegador, plano B" : "RAR in browser, plan B"}</div>
      </div>
      <MIcon name="chevron-right" size={18}/>
    </button>

    <button className="m-list-row" style={{ borderRadius: 12, border: "2.5px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", background: "var(--paper)" }}
      onClick={() => navigate({ name: "guide", id: "how" })}>
      <div className="row-icon" style={{ background: "var(--red)", color: "var(--paper)" }}><MIcon name="info" size={18}/></div>
      <div>
        <div className="row-title">{t.nav.how}</div>
        <div className="row-sub">{lang === "pt" ? "Por dentro do conversor" : "Under the hood"}</div>
      </div>
      <MIcon name="chevron-right" size={18}/>
    </button>

    <MAd size="banner"/>

    <h3 className="m-display-md" style={{ marginTop: 8 }}>
      {lang === "pt" ? "Configurações populares" : "Popular settings"}
    </h3>
    <div className="m-panel">
      {[
        [lang === "pt" ? "Celular/tablet" : "Phone/tablet", "Original", "fit"],
        [lang === "pt" ? "Imprimir A4" : "Print A4", "A4", "fit"],
        [lang === "pt" ? "Manga" : "Manga", "Original", "fit"],
        [lang === "pt" ? "Kindle" : "Kindle", "Letter", "fill"],
      ].map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? "1.5px solid color-mix(in oklab, var(--ink) 18%, transparent)" : "none" }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{r[0]}</span>
          <span className="m-chip">{r[1]}</span>
          <span className="m-chip">{r[2]}</span>
        </div>
      ))}
    </div>
  </div>
);

// ===== Single guide =====
const MGuideDetail = ({ id, t, lang, onBack }) => (
  <div className="page-scroll" style={{ display: "grid", gap: 14 }}>
    {id === "cbz" && (
      <React.Fragment>
        <div className="m-eyebrow muted">{lang === "pt" ? "GUIA" : "GUIDE"}</div>
        <h1 className="m-display-lg">{lang === "pt" ? "CBZ → PDF" : "CBZ → PDF"}</h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14 }}>
          {lang === "pt" ? "CBZ é só um ZIP com imagens em ordem. Aqui está como converter." : "CBZ is just a ZIP of ordered images. Here's how to convert."}
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {(lang === "pt" ? [
            "Toque em Converter na barra inferior.",
            "Escolha um arquivo .cbz do seu telefone.",
            "Confira páginas detectadas.",
            "Toque em Opções para ajustar tamanho/margem.",
            "Toque em Converter para PDF.",
            "Quando terminar, baixe ou compartilhe.",
          ] : [
            "Tap Convert in the bottom bar.",
            "Pick a .cbz file from your phone.",
            "Check the detected pages count.",
            "Tap Options to tweak size/margins.",
            "Tap Convert to PDF.",
            "When done, download or share.",
          ]).map((step, i) => (
            <div key={i} className="m-step">
              <div className="m-step-n" style={{ background: "var(--paper-2)" }}>{String(i+1).padStart(2,"0")}</div>
              <div style={{ alignSelf: "center", fontSize: 14 }}>{step}</div>
            </div>
          ))}
        </div>
      </React.Fragment>
    )}
    {id === "cbr" && (
      <React.Fragment>
        <div className="m-eyebrow muted">{lang === "pt" ? "GUIA · BETA" : "GUIDE · BETA"}</div>
        <h1 className="m-display-lg">CBR → PDF</h1>
        <div className="m-panel" style={{ background: "var(--yellow)", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <MIcon name="alert" size={20}/>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>
              {lang === "pt" ? "Suporte beta" : "Beta support"}
            </div>
            <div style={{ fontSize: 13, marginTop: 2 }}>
              {lang === "pt" ? "RAR grandes podem falhar no celular." : "Large RAR files may fail on mobile."}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-2)" }}>
          {lang === "pt" ? "Se falhar, abra o .cbr no desktop, extraia, e re-empacote como .cbz." : "If it fails, open the .cbr on desktop, extract, and re-pack as .cbz."}
        </p>
      </React.Fragment>
    )}
    {id === "how" && (
      <React.Fragment>
        <div className="m-eyebrow muted">{lang === "pt" ? "POR DENTRO" : "UNDER THE HOOD"}</div>
        <h1 className="m-display-lg">{t.sections.worksTitle}</h1>
        <div style={{ display: "grid", gap: 10 }}>
          <MStep n="01" tone="yellow" title={t.sections.step1Title} body={t.sections.step1Body} icon="upload"/>
          <MStep n="02" tone="blue" title={t.sections.step2Title} body={t.sections.step2Body} icon="stack"/>
          <MStep n="03" tone="red" title={t.sections.step3Title} body={t.sections.step3Body} icon="download"/>
        </div>
        <h3 className="m-display-md" style={{ marginTop: 12 }}>{lang === "pt" ? "Limitações" : "Limitations"}</h3>
        <ul style={{ paddingLeft: 18, color: "var(--ink-2)", fontSize: 14 }}>
          {(lang === "pt" ? [
            "Arquivos enormes podem estourar a memória.",
            "Suporte a CBR é experimental.",
            "Imagens corrompidas são puladas.",
          ] : [
            "Huge files may exhaust memory.",
            "CBR support is experimental.",
            "Corrupted images are skipped.",
          ]).map((x, i) => <li key={i} style={{ marginTop: 6 }}>{x}</li>)}
        </ul>
      </React.Fragment>
    )}
    <MAd size="banner"/>
  </div>
);

// ===== FAQ screen =====
const MFAQScreen = ({ t, lang }) => {
  const items = lang === "pt" ? [
    { q: "Meus arquivos são enviados?", a: "Não. Tudo acontece no seu navegador, no seu telefone." },
    { q: "É grátis?", a: "Sim. Mantido por anúncios em locais discretos." },
    { q: "Funciona com mangás?", a: "Sim, qualquer .cbz com imagens funciona." },
    { q: "Por que meu CBR falhou?", a: "Suporte a RAR é beta. Tente converter para CBZ no desktop primeiro." },
    { q: "Tem limite de tamanho?", a: "Não há trava nossa. O limite é a memória do seu telefone." },
    { q: "Funciona offline?", a: "Sim. Carregue uma vez e adicione à tela inicial." },
    { q: "Posso converter vários?", a: "Por enquanto, um por vez. Em breve em lote." },
    { q: "Por que o PDF é grande?", a: "Não recomprimimos as imagens — elas vão como estão." },
  ] : [
    { q: "Are my files uploaded?", a: "No. Everything happens in your browser on your phone." },
    { q: "Is it free?", a: "Yes. Supported by unobtrusive ads." },
    { q: "Does it work with manga?", a: "Yes, any .cbz with images works." },
    { q: "Why did my CBR fail?", a: "RAR is beta. Try converting to CBZ on desktop first." },
    { q: "Is there a size limit?", a: "No cap from us. The limit is your phone's memory." },
    { q: "Does it work offline?", a: "Yes. Load once and add to home screen." },
    { q: "Can I convert several?", a: "One at a time for now. Batch coming soon." },
    { q: "Why is the PDF big?", a: "We don't re-compress images — they go in as-is." },
  ];
  return (
    <div className="page-scroll" style={{ display: "grid", gap: 12 }}>
      <h2 className="m-display-lg">FAQ</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: -4 }}>
        {lang === "pt" ? "As perguntas que mais nos fazem." : "The questions we hear the most."}
      </p>
      <MAd size="banner"/>
      {items.map((it, i) => <MFAQItem key={i} q={it.q} a={it.a} defaultOpen={i === 0}/>)}
    </div>
  );
};

const MFAQItem = ({ q, a, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="m-faq-row">
      <button className="m-faq-q" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className="plus">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="m-faq-a">{a}</div>}
    </div>
  );
};

// ===== Settings screen =====
const MSettingsScreen = ({ t, lang, setLang, theme, setTheme, navigate }) => (
  <div className="page-scroll" style={{ display: "grid", gap: 14 }}>
    <h2 className="m-display-lg">{lang === "pt" ? "Configurações" : "Settings"}</h2>

    <div className="m-list">
      <div className="m-list-row" style={{ cursor: "default" }}>
        <div className="row-icon"><MIcon name="globe" size={16}/></div>
        <div>
          <div className="row-title">{lang === "pt" ? "Idioma" : "Language"}</div>
          <div className="row-sub">{lang === "en" ? "English" : "Português"}</div>
        </div>
        <div className="m-seg" style={{ minWidth: 100 }}>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "pt" ? "active" : ""} onClick={() => setLang("pt")}>PT</button>
        </div>
      </div>
      <div className="m-list-row" style={{ cursor: "default" }}>
        <div className="row-icon"><MIcon name={theme === "light" ? "sun" : "moon"} size={16}/></div>
        <div>
          <div className="row-title">{lang === "pt" ? "Tema" : "Theme"}</div>
          <div className="row-sub">{theme === "light" ? (lang === "pt" ? "Claro" : "Light") : (lang === "pt" ? "Escuro" : "Dark")}</div>
        </div>
        <div className="m-seg" style={{ minWidth: 110 }}>
          <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>☀</button>
          <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>☾</button>
        </div>
      </div>
    </div>

    <div className="m-eyebrow muted" style={{ marginTop: 8 }}>
      {lang === "pt" ? "INFORMAÇÕES" : "INFO"}
    </div>
    <div className="m-list">
      <button className="m-list-row" onClick={() => navigate({ name: "info", id: "privacy" })}>
        <div className="row-icon"><MIcon name="lock" size={16}/></div>
        <div><div className="row-title">{t.nav.privacy}</div></div>
        <MIcon name="chevron-right" size={16}/>
      </button>
      <button className="m-list-row" onClick={() => navigate({ name: "info", id: "terms" })}>
        <div className="row-icon"><MIcon name="info" size={16}/></div>
        <div><div className="row-title">{t.nav.terms}</div></div>
        <MIcon name="chevron-right" size={16}/>
      </button>
      <button className="m-list-row" onClick={() => navigate({ name: "info", id: "about" })}>
        <div className="row-icon"><MIcon name="comic" size={16}/></div>
        <div>
          <div className="row-title">{lang === "pt" ? "Sobre" : "About"}</div>
          <div className="row-sub mono">v0.9.0 · browser-only</div>
        </div>
        <MIcon name="chevron-right" size={16}/>
      </button>
    </div>

    <div className="m-panel" style={{ background: "var(--ink)", color: "var(--paper)", textAlign: "center", padding: 22 }}>
      <MLogo size={36}/>
      <div className="m-display-md" style={{ marginTop: 10, color: "var(--paper)" }}>
        ComicPDF<span style={{ color: "var(--yellow)" }}>.</span>Mobile
      </div>
      <div className="mono" style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
        {t.footer.domain}
      </div>
    </div>
  </div>
);

const MInfoDetail = ({ id, lang }) => {
  const isPT = lang === "pt";
  let title, body;
  if (id === "privacy") {
    title = isPT ? "Privacidade" : "Privacy";
    body = isPT
      ? "Não fazemos upload dos seus arquivos. A conversão acontece 100% no seu telefone. Podemos usar Google AdSense em locais seguros, e os cookies do parceiro de anúncios podem ser definidos no navegador. Sem analytics ligado a arquivos."
      : "We don't upload your files. Conversion happens 100% on your phone. We may use Google AdSense in safe placements, and the ad partner's cookies may be set in the browser. No analytics tied to files.";
  } else if (id === "terms") {
    title = isPT ? "Termos" : "Terms";
    body = isPT
      ? "Use a ferramenta apenas com arquivos próprios ou legalmente obtidos. Sem garantias de conversão perfeita. Sem armazenamento — tudo local."
      : "Use the tool only with files you own or legally obtained. No warranties of perfect conversion. No storage — all local.";
  } else {
    title = isPT ? "Sobre" : "About";
    body = isPT
      ? "ComicPDF Tools é uma ferramenta gratuita feita para leitores. Sem servidor, sem upload, sem conta. Versão mobile pensada para uso no telefone."
      : "ComicPDF Tools is a free tool made for readers. No server, no upload, no account. Mobile version built for phone-first use.";
  }
  return (
    <div className="page-scroll" style={{ display: "grid", gap: 14 }}>
      <div className="m-eyebrow muted">{isPT ? "INFO" : "INFO"}</div>
      <h1 className="m-display-lg">{title}</h1>
      <p style={{ color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
};

Object.assign(window, { MHomeScreen, MConvertScreen, MGuidesScreen, MGuideDetail, MFAQScreen, MSettingsScreen, MInfoDetail });
