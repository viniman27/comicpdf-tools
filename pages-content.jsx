// Content pages: How it works, CBZ guide, CBR guide, FAQ, Privacy, Terms

const PageHeader = ({ kicker, title, sub }) => (
  <header style={{ paddingTop: 56, paddingBottom: 32, borderBottom: "2.5px solid var(--ink)", marginBottom: 40 }}>
    <div className="container-narrow">
      <div className="eyebrow muted">{kicker}</div>
      <h1 className="display-lg" style={{ marginTop: 10, marginBottom: 14 }}>{title}</h1>
      {sub && <p style={{ fontSize: 19, color: "var(--ink-2)", maxWidth: 640 }}>{sub}</p>}
    </div>
  </header>
);

const Prose = ({ children }) => (
  <div className="container-narrow" style={{ fontSize: 17, lineHeight: 1.7 }}>
    {children}
  </div>
);

const ProseH2 = ({ children }) => (
  <h2 className="display-md" style={{ marginTop: 48, marginBottom: 14 }}>{children}</h2>
);
const ProseH3 = ({ children }) => (
  <h3 style={{ marginTop: 28, marginBottom: 8, fontFamily: "var(--font-display)", fontSize: 22 }}>{children}</h3>
);
const ProseP = ({ children }) => (
  <p style={{ marginTop: 14, color: "var(--ink-2)" }}>{children}</p>
);

// ============================================================
// HOW IT WORKS
// ============================================================
const HowItWorksPage = ({ t, lang }) => (
  <div className="page">
    <PageHeader
      kicker={lang === "pt" ? "EXPLICAÇÃO TÉCNICA" : "UNDER THE HOOD"}
      title={lang === "pt" ? "Como o ComicPDF funciona" : "How ComicPDF works"}
      sub={lang === "pt"
        ? "Sem servidores. Sem upload. Apenas JavaScript no seu navegador, lendo o arquivo direto do disco."
        : "No servers. No upload. Just JavaScript in your browser reading the file straight from disk."}
    />
    <Prose>
      <ProseH2>{lang === "pt" ? "O que é um arquivo CBZ" : "What's a CBZ file"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Um arquivo .cbz é simplesmente um ZIP com imagens em ordem. O nome significa “Comic Book ZIP”. As imagens dentro são geralmente JPEG ou PNG, nomeadas em sequência (page001.jpg, page002.jpg…)."
          : "A .cbz file is just a ZIP archive holding images in order. The name stands for “Comic Book ZIP”. Images inside are usually JPEG or PNG, named in sequence (page001.jpg, page002.jpg…)."}
      </ProseP>
      <ProseP>
        {lang === "pt"
          ? "Como o navegador já sabe ler ZIP via JavaScript (com a biblioteca JSZip), conseguimos abrir o arquivo, ordenar as imagens, e montar o PDF — tudo localmente."
          : "Since the browser already speaks ZIP through JavaScript (via the JSZip library), we can open the archive, sort the images, and stitch the PDF — all locally."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "O que é um arquivo CBR" : "What's a CBR file"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Um arquivo .cbr usa compressão RAR em vez de ZIP. RAR é proprietário e mais difícil de ler no navegador. Por isso o suporte a CBR aqui é marcado como beta."
          : "A .cbr file uses RAR compression instead of ZIP. RAR is proprietary and harder to read in the browser. That's why CBR support here is marked beta."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Os 4 passos" : "The 4 steps"}</ProseH2>
      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {[
          { n: "01", title: lang === "pt" ? "Você solta o arquivo" : "You drop the file", body: lang === "pt" ? "O navegador recebe o arquivo via API File. Nada de fetch ou upload." : "The browser receives the file via the File API. No fetch, no upload." },
          { n: "02", title: lang === "pt" ? "Descompactamos na memória" : "We unzip in memory", body: lang === "pt" ? "JSZip lê os bytes do arquivo. Cada imagem vira um Blob." : "JSZip reads the file bytes. Each image becomes a Blob." },
          { n: "03", title: lang === "pt" ? "Montamos páginas" : "We compose pages", body: lang === "pt" ? "pdf-lib cria um PDF novo. Cada imagem vira uma página." : "pdf-lib creates a new PDF. Each image becomes a page." },
          { n: "04", title: lang === "pt" ? "Você baixa" : "You download", body: lang === "pt" ? "Geramos um Blob com o PDF e disparamos o download direto pelo navegador." : "We make a Blob of the PDF and trigger the download directly through the browser." },
        ].map(s => (
          <div key={s.n} className="panel" style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center" }}>
            <div className="display-md" style={{ color: "var(--red)", minWidth: 52 }}>{s.n}</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{s.title}</div>
              <div className="muted" style={{ marginTop: 4, fontSize: 15 }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      <ProseH2>{lang === "pt" ? "Limitações honestas" : "Honest limitations"}</ProseH2>
      <ul style={{ paddingLeft: 18, marginTop: 14, color: "var(--ink-2)" }}>
        <li style={{ marginTop: 6 }}>{lang === "pt" ? "Arquivos muito grandes (vários GB) podem estourar a memória do navegador." : "Very large files (multi-GB) may exhaust browser memory."}</li>
        <li style={{ marginTop: 6 }}>{lang === "pt" ? "Suporte a CBR/RAR é experimental." : "CBR/RAR support is experimental."}</li>
        <li style={{ marginTop: 6 }}>{lang === "pt" ? "Imagens corrompidas dentro do arquivo são puladas." : "Corrupted images inside the archive are skipped."}</li>
        <li style={{ marginTop: 6 }}>{lang === "pt" ? "PDFs podem ser grandes — não recomprimimos imagens por padrão." : "PDFs may be large — we don't re-compress images by default."}</li>
      </ul>

      <div className="ad-slot" style={{ marginTop: 64 }}>
        <div>Advertisement</div>
        <strong>728×90 leaderboard</strong>
      </div>
    </Prose>
  </div>
);

// ============================================================
// CBZ → PDF GUIDE
// ============================================================
const CBZGuidePage = ({ t, lang, navigate }) => (
  <div className="page">
    <PageHeader
      kicker={lang === "pt" ? "GUIA" : "GUIDE"}
      title={lang === "pt" ? "Como converter CBZ para PDF" : "How to convert CBZ to PDF"}
      sub={lang === "pt"
        ? "Um guia passo a passo. Funciona em qualquer navegador moderno — Chrome, Firefox, Safari, Edge."
        : "A step-by-step guide. Works in any modern browser — Chrome, Firefox, Safari, Edge."}
    />
    <Prose>
      <ProseH2>{lang === "pt" ? "O que é um arquivo CBZ?" : "What is a CBZ file?"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "CBZ significa Comic Book ZIP. É a maneira mais comum de empacotar quadrinhos digitais: um ZIP com as páginas em imagem, ordenadas por nome de arquivo."
          : "CBZ stands for Comic Book ZIP. It's the most common way to package digital comics: a ZIP with the page images sorted by filename."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Passo a passo" : "Step by step"}</ProseH2>
      <ol style={{ paddingLeft: 22, color: "var(--ink-2)", marginTop: 16 }}>
        {[
          lang === "pt" ? "Abra o ComicPDF Tools no seu navegador." : "Open ComicPDF Tools in your browser.",
          lang === "pt" ? "Arraste um arquivo .cbz na área de drop, ou clique em “Escolher arquivo”." : "Drag a .cbz file onto the drop zone, or click “Choose comic file”.",
          lang === "pt" ? "Aguarde a leitura. Você verá quantas páginas foram detectadas." : "Wait for the file to be read. You'll see how many pages were detected.",
          lang === "pt" ? "Escolha tamanho da página (Original / A4 / Carta), ajuste e margem." : "Pick page size (Original / A4 / Letter), fit, and margin.",
          lang === "pt" ? "Clique em “Converter para PDF”. A barra de progresso mostra o que está acontecendo." : "Click “Convert to PDF”. The progress bar shows what's happening.",
          lang === "pt" ? "Quando terminar, clique em “Baixar PDF”. O arquivo aparece na sua pasta de downloads." : "When it's done, click “Download PDF”. The file lands in your Downloads folder.",
        ].map((step, i) => (
          <li key={i} style={{ marginTop: 12, paddingLeft: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", marginRight: 8, color: "var(--red)" }}>{String(i + 1).padStart(2, "0")}.</span>
            {step}
          </li>
        ))}
      </ol>

      <ProseH2>{lang === "pt" ? "Configurações recomendadas" : "Recommended settings"}</ProseH2>
      <div className="panel" style={{ padding: 20, marginTop: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ borderBottom: "2.5px solid var(--ink)" }}>
              <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-display)" }}>{lang === "pt" ? "Cenário" : "Use case"}</th>
              <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-display)" }}>{lang === "pt" ? "Tamanho" : "Size"}</th>
              <th style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--font-display)" }}>{lang === "pt" ? "Ajuste" : "Fit"}</th>
            </tr>
          </thead>
          <tbody>
            {[
              [lang === "pt" ? "Leitura no celular/tablet" : "Reading on phone/tablet", "Original", lang === "pt" ? "Caber" : "Fit page"],
              [lang === "pt" ? "Imprimir em A4" : "Printing on A4", "A4", lang === "pt" ? "Caber" : "Fit page"],
              [lang === "pt" ? "Manga em alta-res" : "High-res manga", "Original", lang === "pt" ? "Caber" : "Fit page"],
              [lang === "pt" ? "Padronizar para Kindle" : "Normalize for Kindle", "Letter", lang === "pt" ? "Preencher" : "Fill page"],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: "1.5px solid color-mix(in oklab, var(--ink) 18%, transparent)" }}>
                {row.map((c, j) => <td key={j} style={{ padding: "10px 0", color: j === 0 ? "var(--ink)" : "var(--ink-2)" }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 40 }}>
        <button className="btn btn-red btn-lg" onClick={() => navigate("/")}>
          <Icon name="bolt" size={18}/> {lang === "pt" ? "Ir para o conversor" : "Go to the converter"}
        </button>
      </div>
    </Prose>
  </div>
);

// ============================================================
// CBR → PDF GUIDE
// ============================================================
const CBRGuidePage = ({ t, lang, navigate }) => (
  <div className="page">
    <PageHeader
      kicker={lang === "pt" ? "GUIA · BETA" : "GUIDE · BETA"}
      title={lang === "pt" ? "Como converter CBR para PDF" : "How to convert CBR to PDF"}
      sub={lang === "pt"
        ? "Arquivos .cbr usam RAR. Aqui está o que esperar e como contornar quando der ruim."
        : "CBR files use RAR. Here's what to expect, and how to work around it when things break."}
    />
    <Prose>
      <div className="panel" style={{ padding: 18, background: "var(--yellow)", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Icon name="alert" size={22}/>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
            {lang === "pt" ? "Suporte a CBR é beta" : "CBR support is beta"}
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>
            {lang === "pt"
              ? "Arquivos RAR grandes podem falhar ou consumir muita memória no navegador."
              : "Large RAR files may fail or use a lot of memory in the browser."}
          </div>
        </div>
      </div>

      <ProseH2>{lang === "pt" ? "O que é um arquivo CBR?" : "What is a CBR file?"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "CBR é Comic Book RAR — um arquivo RAR com páginas em imagem dentro. Funcionalmente igual ao CBZ, mas com o formato de compressão da WinRAR."
          : "CBR is Comic Book RAR — a RAR archive with image pages inside. Functionally identical to CBZ, but using WinRAR's compression format."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Plano A: tente direto" : "Plan A: just try it"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Solte o .cbr no conversor. Se o arquivo não for muito grande, ele vai funcionar normalmente como um CBZ."
          : "Drop the .cbr into the converter. If the file isn't too large, it'll work just like a CBZ would."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Plano B: converter para CBZ" : "Plan B: convert to CBZ"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Se falhar, a saída mais simples é trocar o RAR por ZIP no desktop. No 7-Zip ou WinRAR, abra o .cbr, extraia, e re-empacote como ZIP. Renomeie a extensão para .cbz."
          : "If that fails, the simplest workaround is to swap RAR for ZIP on the desktop. In 7-Zip or WinRAR, open the .cbr, extract, and re-pack as ZIP. Rename the extension to .cbz."}
      </ProseP>
      <div className="tag-box" style={{ marginTop: 14 }}>
        <span className="muted">$ </span>
        <span>7z x my-comic.cbr -o./pages</span>
        <br/>
        <span className="muted">$ </span>
        <span>cd pages && 7z a ../my-comic.cbz *</span>
      </div>

      <div style={{ marginTop: 40 }}>
        <button className="btn btn-yellow btn-lg" onClick={() => navigate("/")}>
          <Icon name="bolt" size={18}/> {lang === "pt" ? "Tentar agora" : "Try it now"}
        </button>
      </div>
    </Prose>
  </div>
);

// ============================================================
// FAQ
// ============================================================
const FAQPage = ({ t, lang }) => {
  const items = lang === "pt" ? [
    { q: "Meus arquivos são enviados para algum servidor?", a: "Não. Toda a conversão acontece no seu navegador. Os bytes do .cbz são lidos via API File e processados localmente — nada sai do seu computador." },
    { q: "Posso converter mangás em CBZ?", a: "Sim. Mangás são apenas .cbz com imagens — geralmente em alta resolução. Funciona normalmente; recomendamos manter o tamanho original da imagem para preservar a qualidade." },
    { q: "Por que meu arquivo CBR falhou?", a: "Suporte a RAR no navegador é beta. Para arquivos grandes, recomendamos extrair o RAR no desktop e re-empacotar como ZIP/CBZ — veja o guia de CBR." },
    { q: "Qual é o tamanho máximo de arquivo?", a: "Não há um limite fixo. O limite real é a memória RAM do seu computador. Em geral, arquivos até alguns GB funcionam em máquinas modernas." },
    { q: "Funciona offline?", a: "Sim. Depois de carregar a página uma vez, ela continua funcionando sem internet. Você pode salvar como atalho no celular ou Adicionar à tela inicial." },
    { q: "Posso converter vários arquivos de uma vez?", a: "Na versão atual, um arquivo por vez. Conversão em lote está planejada para uma versão futura." },
    { q: "O PDF gerado fica muito grande. Por quê?", a: "Não recomprimimos as imagens — elas vão para o PDF do mesmo jeito que estavam no CBZ. Se quiser arquivos menores, comprima as imagens antes ou use um compressor de PDF depois." },
    { q: "Há limite de páginas?", a: "Não. Já testamos volumes com mais de 500 páginas. O gargalo é a memória do navegador, não uma trava arbitrária do nosso lado." },
    { q: "Que formatos de imagem são suportados?", a: "JPEG, PNG, WebP, GIF e BMP. PNGs com transparência funcionam, mas podem ficar maiores que JPEG." },
    { q: "Que tipo de cookie é usado?", a: "Apenas os relacionados a publicidade (AdSense, se ativado nesta versão). Não fazemos tracking de uso da ferramenta." },
    { q: "Isso é um projeto de fã?", a: "Sim. O ComicPDF Tools é um projeto feito por um fã, para fãs. Não tem vínculo com editoras, marcas ou publicadoras de quadrinhos." },
  ] : [
    { q: "Are my files uploaded to a server?", a: "No. The whole conversion happens in your browser. The .cbz bytes are read via the File API and processed locally — nothing leaves your computer." },
    { q: "Can I convert manga CBZ files?", a: "Yes. Manga are just .cbz files with images — usually high resolution. Works normally; we recommend keeping the original image size to preserve quality." },
    { q: "Why did my CBR file fail?", a: "RAR support in the browser is beta. For large files, we recommend extracting the RAR on the desktop and re-packing as ZIP/CBZ — see the CBR guide." },
    { q: "What's the maximum file size?", a: "There's no hard cap. The real limit is your computer's RAM. Files up to several GB usually work on modern machines." },
    { q: "Does it work offline?", a: "Yes. After loading the page once, it keeps working without internet. You can save it as a home-screen shortcut on mobile." },
    { q: "Can I convert multiple files at once?", a: "Currently, one file at a time. Batch conversion is planned for a future release." },
    { q: "The output PDF is huge. Why?", a: "We don't re-compress the images — they go into the PDF as they were in the CBZ. For smaller files, compress images first, or run the PDF through a compressor after." },
    { q: "Is there a page limit?", a: "No. We've tested with 500+ pages. The bottleneck is browser memory, not an arbitrary cap on our side." },
    { q: "Which image formats are supported?", a: "JPEG, PNG, WebP, GIF, BMP. Transparent PNGs work but may be larger than JPEG." },
    { q: "What cookies are used?", a: "Only ad-related (AdSense, if enabled in this build). We don't track tool usage." },
    { q: "Is this a fan project?", a: "Yes. ComicPDF Tools is a passion project built by a fan, for fans. It is not affiliated with any comics publisher, brand, or rights holder." },
  ];
  return (
    <div className="page">
      <PageHeader
        kicker="FAQ"
        title={lang === "pt" ? "Perguntas frequentes" : "Frequently asked questions"}
        sub={lang === "pt" ? "Tudo que você quis saber e não teve coragem de perguntar." : "Everything you wanted to know and didn't dare ask."}
      />
      <div className="container-narrow">
        <div className="ad-slot" style={{ marginBottom: 32 }}>
          <div>Advertisement</div><strong>728×90 leaderboard</strong>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((it, i) => <FAQItem key={i} q={it.q} a={it.a} defaultOpen={i === 0}/>)}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PRIVACY
// ============================================================
const PrivacyPage = ({ lang }) => (
  <div className="page">
    <PageHeader
      kicker={lang === "pt" ? "POLÍTICA" : "POLICY"}
      title={lang === "pt" ? "Política de Privacidade" : "Privacy Policy"}
      sub={lang === "pt" ? "Resumo: nós não coletamos seus arquivos. Mas aqui estão os detalhes." : "TL;DR: we don't collect your files. Here are the details anyway."}
    />
    <Prose>
      <p className="muted mono" style={{ fontSize: 13 }}>
        {lang === "pt" ? "Última atualização: 1 de Abril de 2026" : "Last updated: April 1, 2026"}
      </p>

      <ProseH2>{lang === "pt" ? "Seus arquivos" : "Your files"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "O ComicPDF Tools não faz upload dos seus arquivos. A conversão de .cbz/.cbr para PDF acontece inteiramente no seu navegador. Não armazenamos, copiamos, transmitimos ou olhamos para os arquivos que você converte."
          : "ComicPDF Tools does not upload your files. The .cbz/.cbr to PDF conversion happens entirely in your browser. We do not store, copy, transmit, or look at the files you convert."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Anúncios" : "Advertising"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Este site pode usar Google AdSense. O Google e seus parceiros podem usar cookies para servir anúncios baseados nas visitas anteriores do usuário a este site ou outros sites. Você pode desativar a publicidade personalizada nas configurações de anúncios do Google."
          : "This site may use Google AdSense. Google and its partners may use cookies to serve ads based on a user's prior visits to this or other websites. You can opt out of personalized advertising in Google's Ads Settings."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Análise de uso" : "Analytics"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Podemos usar análise agregada e anônima de tráfego (visitas de página, navegador, país) — nunca dados ligados aos arquivos convertidos."
          : "We may use aggregated, anonymous traffic analytics (page views, browser, country) — never anything tied to the files you convert."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Cookies" : "Cookies"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Os únicos cookies definidos por este site são os do nosso provedor de anúncios (se ativos) e preferências locais (tema escuro/claro)."
          : "The only cookies set by this site are those of our advertising provider (if active) and local preferences (dark/light theme)."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Contato" : "Contact"}</ProseH2>
      <ProseP>comicsconv@gmail.com</ProseP>
    </Prose>
  </div>
);

// ============================================================
// TERMS
// ============================================================
const TermsPage = ({ lang }) => (
  <div className="page">
    <PageHeader
      kicker={lang === "pt" ? "TERMOS" : "TERMS"}
      title={lang === "pt" ? "Termos de Uso" : "Terms of Use"}
      sub={lang === "pt" ? "Coisas que esperamos que você saiba antes de usar." : "Things we'd like you to know before using this."}
    />
    <Prose>
      <p className="muted mono" style={{ fontSize: 13 }}>
        {lang === "pt" ? "Última atualização: 1 de Abril de 2026" : "Last updated: April 1, 2026"}
      </p>

      <ProseH2>{lang === "pt" ? "Uso aceitável" : "Acceptable use"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Você concorda em usar o ComicPDF Tools apenas para arquivos próprios ou legalmente obtidos. Você é responsável pelos arquivos que converte."
          : "You agree to use ComicPDF Tools only with files you own or have legal access to. You are responsible for the files you convert."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Sem garantias" : "No warranties"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "A ferramenta é fornecida “como está”. Não garantimos conversão perfeita em todos os arquivos. Sempre mantenha o arquivo original."
          : "The tool is provided “as is”. We don't guarantee perfect conversion of every file. Always keep the original."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Sem armazenamento" : "No storage"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Como descrito na Política de Privacidade, o site não armazena os arquivos que você converte. Tudo acontece localmente no seu navegador."
          : "As stated in the Privacy Policy, the site does not store the files you convert. Everything happens locally in your browser."}
      </ProseP>

      <ProseH2>{lang === "pt" ? "Mudanças" : "Changes"}</ProseH2>
      <ProseP>
        {lang === "pt"
          ? "Estes termos podem mudar. A data no topo reflete a versão atual."
          : "These terms may change. The date at the top reflects the current version."}
      </ProseP>
    </Prose>
  </div>
);

Object.assign(window, {
  HowItWorksPage, CBZGuidePage, CBRGuidePage, FAQPage, PrivacyPage, TermsPage,
});
