// Site pages: Home, How it works, CBZ guide, CBR guide, FAQ, Privacy, Terms
const { useState } = React;

// ============================================================
// HOME
// ============================================================
const HomePage = ({ t, lang, navigate }) => (
  <div className="page">
    <Hero t={t} lang={lang}/>
    <section className="container" style={{ marginTop: 56 }}>
      <Converter t={t} lang={lang}/>
    </section>

    <section className="container" style={{ marginTop: 64 }}>
      <AdSlot/>
    </section>

    <HowItWorksStrip t={t} lang={lang}/>

    <section className="container" style={{ marginTop: 80 }}>
      <FeatureGrid t={t} lang={lang}/>
    </section>

    <section className="container" style={{ marginTop: 80 }}>
      <FAQPreview t={t} lang={lang} navigate={navigate}/>
    </section>

    <section className="container" style={{ marginTop: 64, marginBottom: 32 }}>
      <AdSlot/>
    </section>
  </div>
);

const Hero = ({ t, lang }) => (
  <section style={{ position: "relative", paddingTop: 56, paddingBottom: 24, overflow: "hidden" }}>
    <div className="container" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center" }}>
      <div>
        <div className="chip chip-yellow" style={{ marginBottom: 20 }}>
          <Icon name="lock" size={11}/> {t.hero.eyebrow}
        </div>
        <h1 className="display-xl" style={{ marginBottom: 18 }}>
          {t.hero.title1}{" "}
          <span style={{
            background: "var(--red)",
            color: "var(--paper)",
            padding: "0 14px",
            display: "inline-block",
            transform: "rotate(-2deg)",
            border: "3px solid var(--ink)",
            borderRadius: 8,
            boxShadow: "5px 5px 0 var(--ink)",
          }}>{t.hero.title2}</span>{" "}
          {t.hero.title3}
        </h1>
        <p style={{ fontSize: 19, maxWidth: 540, color: "var(--ink-2)", marginBottom: 28 }}>
          {t.hero.sub}
        </p>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <a href="#converter" className="btn btn-red btn-lg">
            <Icon name="upload" size={20}/> {t.hero.cta}
          </a>
          <span className="mono muted" style={{ fontSize: 13 }}>
            ↓ {t.hero.ctaAlt}
          </span>
        </div>
      </div>

      <HeroVisual t={t}/>
    </div>
  </section>
);

const HeroVisual = ({ t }) => (
  <div style={{ position: "relative", height: 380 }}>
    {/* Comic page stack */}
    <div style={{
      position: "absolute", top: 30, right: 100, width: 220, height: 290,
      background: "var(--paper)", border: "3px solid var(--ink)", borderRadius: 6,
      boxShadow: "8px 8px 0 var(--ink)", transform: "rotate(-6deg)",
      overflow: "hidden",
    }}>
      <ComicPagePlaceholder color="var(--blue)" label="ISSUE 01" pageNo="01"/>
    </div>
    <div style={{
      position: "absolute", top: 60, right: 40, width: 220, height: 290,
      background: "var(--paper)", border: "3px solid var(--ink)", borderRadius: 6,
      boxShadow: "8px 8px 0 var(--ink)", transform: "rotate(4deg)",
      overflow: "hidden",
    }}>
      <ComicPagePlaceholder color="var(--yellow)" label="PAGE 02" pageNo="02"/>
    </div>
    <div style={{
      position: "absolute", top: 40, right: 170, width: 220, height: 290,
      background: "var(--paper)", border: "3px solid var(--ink)", borderRadius: 6,
      boxShadow: "8px 8px 0 var(--ink)", transform: "rotate(-2deg)",
      overflow: "hidden",
    }}>
      <ComicPagePlaceholder color="var(--red)" label="COVER" pageNo="✦"/>
    </div>

    {/* Speech bubble */}
    <div style={{ position: "absolute", bottom: 0, left: 0, transform: "rotate(-3deg)" }}>
      <SpeechBubble>{t.hero.bubble}</SpeechBubble>
    </div>

    {/* Arrow → PDF */}
    <div style={{
      position: "absolute", bottom: 60, right: 0,
      width: 56, height: 72, borderRadius: 4,
      background: "var(--ink)", color: "var(--paper)",
      border: "3px solid var(--ink)",
      display: "grid", placeItems: "center",
      transform: "rotate(8deg)",
      boxShadow: "4px 4px 0 var(--red)",
      fontFamily: "var(--font-display)", fontSize: 14,
    }}>
      PDF
    </div>
  </div>
);

const ComicPagePlaceholder = ({ color, label, pageNo }) => (
  <div style={{ width: "100%", height: "100%", position: "relative", background: "var(--paper-2)" }}>
    <div style={{
      position: "absolute", inset: 12,
      background: color, border: "2.5px solid var(--ink)", borderRadius: 4,
      display: "grid", gridTemplateRows: "1fr 1fr", gap: 6, padding: 6,
    }}>
      <div style={{ background: "var(--paper)", border: "2px solid var(--ink)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(var(--ink) 1.4px, transparent 1.6px)",
          backgroundSize: "8px 8px", opacity: 0.5,
        }}/>
      </div>
      <div style={{ background: "var(--paper)", border: "2px solid var(--ink)", borderRadius: 3, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 32 }}>
        {pageNo}
      </div>
    </div>
    <div style={{
      position: "absolute", top: 6, left: 8,
      fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
      letterSpacing: "0.1em",
    }}>{label}</div>
  </div>
);

// ----- How it works strip on home -----
const HowItWorksStrip = ({ t }) => (
  <section className="container" style={{ marginTop: 100 }}>
    <div style={{ marginBottom: 32, display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
      <div>
        <div className="eyebrow muted">{t.sections.worksKicker}</div>
        <h2 className="display-lg" style={{ marginTop: 8 }}>{t.sections.worksTitle}</h2>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      <StepCard n="01" tone="yellow" title={t.sections.step1Title} body={t.sections.step1Body} icon="upload"/>
      <StepCard n="02" tone="blue" title={t.sections.step2Title} body={t.sections.step2Body} icon="stack"/>
      <StepCard n="03" tone="red" title={t.sections.step3Title} body={t.sections.step3Body} icon="download"/>
    </div>
  </section>
);

const StepCard = ({ n, tone, title, body, icon }) => {
  const bg = tone === "yellow" ? "var(--yellow)" : tone === "blue" ? "var(--blue)" : "var(--red)";
  const fg = tone === "yellow" ? "var(--ink)" : "var(--paper)";
  return (
    <div className="panel" style={{ padding: 24, position: "relative", overflow: "hidden", minHeight: 240 }}>
      <div style={{
        position: "absolute", top: -12, right: -12,
        width: 92, height: 92, borderRadius: "50%",
        background: bg, border: "3px solid var(--ink)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-display)", fontSize: 32, color: fg,
      }}>{n}</div>
      <Icon name={icon} size={28} stroke={2.6}/>
      <h3 className="display-sm" style={{ marginTop: 16, fontSize: 24 }}>{title}</h3>
      <p style={{ marginTop: 10, color: "var(--ink-2)" }}>{body}</p>
    </div>
  );
};

// ----- Feature grid -----
const FeatureGrid = ({ t, lang }) => {
  const items = lang === "pt" ? [
    { icon: "lock", title: "100% Privado", body: "Nenhum byte sai do seu computador. Nenhum servidor, nenhum upload, nenhum cookie de tracking." },
    { icon: "bolt", title: "Rápido como deveria ser", body: "A conversão acontece com a CPU local. Sem fila, sem espera, sem limite de tamanho do servidor." },
    { icon: "globe", title: "Funciona offline", body: "Carregue a página uma vez e ela continua funcionando sem internet. Bom para acervos longos." },
    { icon: "stack", title: "Vários formatos", body: ".cbz, .zip funcionam direto. .cbr/.rar em beta. JPG, PNG, WebP, GIF e BMP suportados." },
    { icon: "comic", title: "Tamanhos flexíveis", body: "Mantenha o tamanho original das imagens, ou padronize tudo em A4 ou Carta com ajuste configurável." },
    { icon: "check", title: "Sem conta, sem custo", body: "Sem cadastro, sem trial, sem upgrade premium. É grátis e fica grátis." },
  ] : [
    { icon: "lock", title: "100% Private", body: "Not a byte leaves your computer. No server, no upload, no tracking cookies." },
    { icon: "bolt", title: "As fast as it should be", body: "Conversion runs on your local CPU. No queue, no wait, no server file-size cap." },
    { icon: "globe", title: "Works offline", body: "Load the page once, then it keeps working without internet. Great for long backlogs." },
    { icon: "stack", title: "Many formats", body: ".cbz and .zip work out of the box. .cbr/.rar in beta. JPG, PNG, WebP, GIF, BMP supported." },
    { icon: "comic", title: "Flexible sizing", body: "Keep image-original page sizes, or normalize everything to A4 or Letter with configurable fit." },
    { icon: "check", title: "No account, no cost", body: "No signup, no trial, no premium upgrade. It's free and stays free." },
  ];
  return (
    <div>
      <div className="eyebrow muted">{lang === "pt" ? "POR QUE LOCAL?" : "WHY LOCAL?"}</div>
      <h2 className="display-lg" style={{ marginTop: 8, marginBottom: 32 }}>
        {lang === "pt" ? "Sem compromissos." : "No tradeoffs."}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {items.map((it, i) => (
          <div key={i} className="panel" style={{ padding: 20, minHeight: 170 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: "var(--paper-2)", border: "2.5px solid var(--ink)",
              display: "grid", placeItems: "center",
            }}>
              <Icon name={it.icon} size={20}/>
            </div>
            <h3 style={{ marginTop: 14, fontSize: 18, fontFamily: "var(--font-display)" }}>{it.title}</h3>
            <p style={{ marginTop: 6, fontSize: 14, color: "var(--ink-2)" }}>{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----- FAQ preview -----
const FAQPreview = ({ t, lang, navigate }) => {
  const items = lang === "pt" ? [
    { q: "Meus arquivos são enviados?", a: "Não. Toda a conversão acontece no seu navegador. Nenhum byte é enviado ao servidor." },
    { q: "É grátis?", a: "Sim. O site é mantido por anúncios em locais discretos." },
    { q: "Funciona com mangás?", a: "Sim — qualquer .cbz com imagens funciona, incluindo mangás em alta resolução." },
    { q: "E se o CBR for muito grande?", a: "Suporte a CBR é beta. Para arquivos grandes recomendamos converter para CBZ primeiro." },
  ] : [
    { q: "Are my files uploaded?", a: "No. The whole conversion happens in your browser. Not a byte is sent to a server." },
    { q: "Is it free?", a: "Yes. The site is supported by unobtrusive ads in safe placements." },
    { q: "Does it work with manga?", a: "Yes — any .cbz with images works, including high-resolution manga." },
    { q: "What if my CBR is huge?", a: "CBR is beta. For large RAR files we recommend converting to CBZ first." },
  ];
  return (
    <div>
      <div className="between" style={{ marginBottom: 24 }}>
        <div>
          <div className="eyebrow muted">FAQ</div>
          <h2 className="display-lg" style={{ marginTop: 8 }}>{t.sections.faqTitle}</h2>
        </div>
        <button className="btn btn-paper btn-sm" onClick={() => navigate("/faq")}>
          {t.sections.faqMore} <Icon name="arrow-right" size={14}/>
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {items.map((it, i) => (
          <FAQItem key={i} q={it.q} a={it.a}/>
        ))}
      </div>
    </div>
  );
};

const FAQItem = ({ q, a, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        all: "unset", cursor: "pointer", display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "16px 20px", width: "100%",
        gap: 16,
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: open ? "var(--red)" : "var(--paper-2)",
          color: open ? "var(--paper)" : "var(--ink)",
          border: "2.5px solid var(--ink)", display: "grid", placeItems: "center",
          flexShrink: 0,
          fontFamily: "var(--font-display)", fontSize: 14,
        }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 18px", color: "var(--ink-2)", fontSize: 15 }}>{a}</div>
      )}
    </div>
  );
};

window.HomePage = HomePage;
window.FAQItem = FAQItem;
