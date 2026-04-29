// Mobile converter — same JSZip + pdf-lib pipeline as desktop, mobile UI
const { useState, useRef, useEffect, useCallback } = React;

const M_IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;
function mNatCompare(a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }); }
function mFmtBytes(n) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return n + " B";
  if (n < 1024*1024) return (n/1024).toFixed(1) + " KB";
  if (n < 1024*1024*1024) return (n/1024/1024).toFixed(1) + " MB";
  return (n/1024/1024/1024).toFixed(2) + " GB";
}
function mDetectKind(name) {
  const l = name.toLowerCase();
  if (l.endsWith(".cbz") || l.endsWith(".zip")) return "cbz";
  if (l.endsWith(".cbr") || l.endsWith(".rar")) return "cbr";
  return "unknown";
}
async function mBlobToBytes(blob) { return new Uint8Array(await blob.arrayBuffer()); }
const M_PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };

const MConverter = ({ t, lang, setToast }) => {
  const [stage, setStage] = useState("idle");
  const [file, setFile] = useState(null);
  const [archive, setArchive] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [outputName, setOutputName] = useState("comic.pdf");
  const [pageSize, setPageSize] = useState("original");
  const [fit, setFit] = useState("contain");
  const [margin, setMargin] = useState("none");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBytesLen, setPdfBytesLen] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setStage("idle"); setFile(null); setArchive(null); setError(null);
    setProgress(0); setProgressLabel(""); setPdfBlob(null); setPdfBytesLen(0);
  };

  const handleFile = useCallback(async (f) => {
    if (!f) return;
    reset(); setFile(f);
    setOutputName(f.name.replace(/\.(cbz|cbr|zip|rar)$/i, "") + ".pdf");
    setStage("converting"); setProgress(2); setProgressLabel(t.converter.reading);
    const kind = mDetectKind(f.name);
    try {
      if (kind === "cbz") {
        const zip = await JSZip.loadAsync(f);
        const all = [];
        zip.forEach((p, e) => { if (!e.dir && M_IMAGE_EXT.test(p)) all.push(e); });
        if (!all.length) throw new Error("No images found.");
        all.sort((a,b) => mNatCompare(a.name, b.name));
        setProgressLabel(t.converter.extracting);
        const entries = [];
        for (let i = 0; i < all.length; i++) {
          entries.push({ name: all[i].name, blob: await all[i].async("blob") });
          setProgress(2 + Math.round((i/all.length)*30));
        }
        setArchive({ kind, entries });
        setStage("ready"); setProgress(0); setProgressLabel("");
      } else if (kind === "cbr") {
        throw new Error(t.converter.cbrBeta);
      } else {
        throw new Error("Unsupported file type.");
      }
    } catch (e) {
      console.error(e); setError(e.message || String(e)); setStage("error");
    }
  }, [t]);

  const convertToPdf = async () => {
    if (!archive) return;
    setStage("converting"); setProgress(35); setProgressLabel(t.converter.composing);
    try {
      const { PDFDocument } = PDFLib;
      const pdf = await PDFDocument.create();
      const total = archive.entries.length;
      const marginPx = margin === "small" ? 18 : 0;
      for (let i = 0; i < total; i++) {
        const entry = archive.entries[i];
        const bytes = await mBlobToBytes(entry.blob);
        const lower = entry.name.toLowerCase();
        let img;
        try {
          if (lower.endsWith(".png")) img = await pdf.embedPng(bytes);
          else img = await pdf.embedJpg(bytes);
        } catch (err) { console.warn("skip", entry.name, err); continue; }
        let pw, ph;
        if (pageSize === "original") { pw = img.width + marginPx*2; ph = img.height + marginPx*2; }
        else { [pw, ph] = M_PAGE_SIZES[pageSize]; }
        const page = pdf.addPage([pw, ph]);
        const innerW = pw - marginPx*2, innerH = ph - marginPx*2;
        let dw, dh;
        if (pageSize === "original") { dw = img.width; dh = img.height; }
        else {
          const sx = innerW/img.width, sy = innerH/img.height;
          const s = fit === "cover" ? Math.max(sx,sy) : Math.min(sx,sy);
          dw = img.width*s; dh = img.height*s;
        }
        page.drawImage(img, { x: marginPx + (innerW-dw)/2, y: marginPx + (innerH-dh)/2, width: dw, height: dh });
        setProgress(35 + Math.round((i/total)*60));
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
      }
      setProgress(97); setProgressLabel(t.converter.finalizing);
      const bytes = await pdf.save();
      setPdfBlob(new Blob([bytes], { type: "application/pdf" }));
      setPdfBytesLen(bytes.length);
      setProgress(100); setStage("done");
    } catch (e) {
      console.error(e); setError(e.message || String(e)); setStage("error");
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) { setToast?.("Demo PDF — connect a real file"); return; }
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url; a.download = outputName || "comic.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    setToast?.(lang === "pt" ? "PDF salvo" : "PDF saved");
  };

  // Demo state cycler
  const demo = (target) => {
    const fakeFile = { name: "spider-001.cbz", size: 28_400_000 };
    const fakeEntries = Array.from({ length: 24 }, (_, i) => ({ name: `p${String(i+1).padStart(3,"0")}.jpg` }));
    setFile(fakeFile); setArchive({ kind: "cbz", entries: fakeEntries });
    setOutputName("spider-001.pdf");
    if (target === "ready") { setStage("ready"); setProgress(0); }
    else if (target === "converting") { setStage("converting"); setProgress(62); setProgressLabel(t.converter.composing); }
    else if (target === "done") { setStage("done"); setProgress(100); setPdfBytesLen(31_200_000); }
    else if (target === "error") { setError("Demo: failed to read archive."); setStage("error"); }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {stage === "idle" && (
        <React.Fragment>
          <div className="m-panel" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
            <div className="m-halftone-strip" style={{ top: -20, right: -20 }}/>
            <div style={{ padding: 18 }}>
              <span className="m-chip m-chip-yellow"><MIcon name="lock" size={11}/> {lang === "pt" ? "100% LOCAL" : "100% LOCAL"}</span>
              <div className="m-display-lg" style={{ marginTop: 12 }}>
                {lang === "pt" ? "Solte um quadrinho" : "Drop a comic"}
              </div>
              <p className="muted" style={{ fontSize: 14, marginTop: 6, marginBottom: 0 }}>
                {lang === "pt" ? "Arquivos .cbz/.cbr → PDF, sem deixar o seu telefone." : "Comics .cbz/.cbr → PDF, never leaving your phone."}
              </p>
            </div>
          </div>

          <div className="m-drop" onClick={() => fileInputRef.current?.click()}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: "var(--paper)", border: "3px solid var(--ink)",
              display: "grid", placeItems: "center",
              boxShadow: "4px 4px 0 var(--ink)",
            }}>
              <MIcon name="upload" size={28} stroke={2.8}/>
            </div>
            <div className="m-display-md">{t.converter.drop}</div>
            <div className="muted" style={{ fontSize: 13 }}>{t.converter.dropSub}</div>
            <button className="m-btn m-btn-yellow" style={{ marginTop: 8, width: "auto", paddingLeft: 24, paddingRight: 24 }}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <MIcon name="file" size={18}/> {t.hero.cta}
            </button>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span className="m-chip">.CBZ</span>
              <span className="m-chip">.CBR <strong style={{ marginLeft: 4, fontSize: 8, background: "var(--ink)", color: "var(--paper)", padding: "1px 4px", borderRadius: 3 }}>BETA</strong></span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="m-eyebrow muted" style={{ alignSelf: "center", marginRight: 4 }}>
              {lang === "pt" ? "DEMO:" : "DEMO:"}
            </span>
            <button className="m-chip" onClick={() => demo("ready")}>ready</button>
            <button className="m-chip" onClick={() => demo("converting")}>converting</button>
            <button className="m-chip" onClick={() => demo("done")}>done</button>
            <button className="m-chip" onClick={() => demo("error")}>error</button>
          </div>
        </React.Fragment>
      )}

      {stage === "ready" && archive && (
        <div className="pop-in" style={{ display: "grid", gap: 14 }}>
          <div className="m-panel">
            <div className="m-eyebrow muted">{t.converter.fileSelected}</div>
            <div className="mono" style={{ fontWeight: 700, fontSize: 14, marginTop: 4, wordBreak: "break-all" }}>{file.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <div style={{ background: "var(--red)", color: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: 8, padding: "8px 10px", boxShadow: "2px 2px 0 var(--ink)" }}>
                <div className="m-eyebrow" style={{ fontSize: 9, opacity: 0.85 }}>{t.converter.pages}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 2 }}>{archive.entries.length}</div>
              </div>
              <div style={{ background: "var(--blue)", color: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: 8, padding: "8px 10px", boxShadow: "2px 2px 0 var(--ink)" }}>
                <div className="m-eyebrow" style={{ fontSize: 9, opacity: 0.85 }}>SIZE</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 2 }}>{mFmtBytes(file.size)}</div>
              </div>
            </div>
          </div>

          <button className="m-list-row" style={{ borderRadius: 12, border: "2.5px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", background: "var(--paper)" }}
            onClick={() => setShowOptions(true)}>
            <div className="row-icon"><MIcon name="settings" size={18}/></div>
            <div>
              <div className="row-title">{lang === "pt" ? "Opções" : "Options"}</div>
              <div className="row-sub mono">{pageSize} · {fit} · margin: {margin}</div>
            </div>
            <MIcon name="chevron-right" size={18}/>
          </button>

          <button className="m-btn m-btn-red m-btn-lg" onClick={convertToPdf}>
            <MIcon name="bolt" size={20}/> {t.converter.convert}
          </button>
          <button className="m-btn m-btn-paper m-btn-sm" onClick={reset}>
            <MIcon name="x" size={14}/> {t.converter.reset}
          </button>

          <Sheet open={showOptions} onClose={() => setShowOptions(false)} title={lang === "pt" ? "Opções" : "Options"}>
            <div style={{ display: "grid", gap: 16, marginTop: 4 }}>
              <div>
                <label className="m-field-label">{t.converter.output}</label>
                <input className="m-input mono" value={outputName} onChange={(e) => setOutputName(e.target.value)}/>
              </div>
              <div>
                <label className="m-field-label">{t.converter.pageSize}</label>
                <MSeg value={pageSize} onChange={setPageSize} options={[
                  { value: "original", label: t.converter.pageSizeOpts.original },
                  { value: "a4", label: t.converter.pageSizeOpts.a4 },
                  { value: "letter", label: t.converter.pageSizeOpts.letter },
                ]}/>
              </div>
              <div>
                <label className="m-field-label">{t.converter.fit}</label>
                <MSeg value={fit} onChange={setFit} options={[
                  { value: "contain", label: t.converter.fitOpts.contain },
                  { value: "cover", label: t.converter.fitOpts.cover },
                ]}/>
              </div>
              <div>
                <label className="m-field-label">{t.converter.margin}</label>
                <MSeg value={margin} onChange={setMargin} options={[
                  { value: "none", label: t.converter.marginOpts.none },
                  { value: "small", label: t.converter.marginOpts.small },
                ]}/>
              </div>
              <button className="m-btn m-btn-red" onClick={() => setShowOptions(false)}>
                <MIcon name="check" size={18}/> {lang === "pt" ? "Pronto" : "Done"}
              </button>
            </div>
          </Sheet>
        </div>
      )}

      {stage === "converting" && (
        <div className="pop-in" style={{ display: "grid", gap: 16 }}>
          <div className="m-panel" style={{ display: "grid", gap: 14 }}>
            <div>
              <div className="m-eyebrow muted">{progressLabel || t.converter.converting}</div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 14, marginTop: 4, wordBreak: "break-all" }}>{file?.name}</div>
            </div>
            <div className="m-display-lg" style={{ color: "var(--red)" }}>{Math.round(progress)}%</div>
            <div className="m-progress"><div className="m-progress-fill" style={{ width: progress + "%" }}/></div>
            <div className="mono muted" style={{ fontSize: 11, display: "grid", gap: 4 }}>
              <span>● cpu: this device</span>
              <span>● upload: 0 bytes</span>
              <span>● privacy: 100%</span>
            </div>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="pop-in" style={{ display: "grid", gap: 14 }}>
          <div className="m-panel" style={{ display: "grid", gap: 14, background: "var(--paper)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--green)", border: "3px solid var(--ink)", display: "grid", placeItems: "center", boxShadow: "3px 3px 0 var(--ink)" }}>
                <MIcon name="check" size={28} stroke={3.5}/>
              </div>
              <div>
                <div className="m-eyebrow" style={{ color: "var(--red)" }}>{t.converter.done.toUpperCase()} ✦</div>
                <div className="m-display-md" style={{ marginTop: 2 }}>{lang === "pt" ? "Seu PDF está pronto" : "Your PDF is ready"}</div>
              </div>
            </div>

            <div style={{ background: "var(--paper-2)", border: "2.5px solid var(--ink)", borderRadius: 10, padding: 12, display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 50, borderRadius: 4, background: "var(--red)", border: "2.5px solid var(--ink)", color: "var(--paper)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 11 }}>PDF</div>
              <div style={{ overflow: "hidden" }}>
                <div className="mono" style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{outputName}</div>
                <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{archive?.entries?.length || 0} pages · {mFmtBytes(pdfBytesLen)}</div>
              </div>
            </div>
          </div>

          <button className="m-btn m-btn-yellow m-btn-lg" onClick={downloadPdf}>
            <MIcon name="download" size={20}/> {t.converter.download}
          </button>
          <button className="m-btn m-btn-paper m-btn-sm" onClick={reset}>↺ {t.converter.reset}</button>
        </div>
      )}

      {stage === "error" && (
        <div className="pop-in" style={{ display: "grid", gap: 14 }}>
          <div className="m-panel" style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--red)", color: "var(--paper)", border: "3px solid var(--ink)", display: "grid", placeItems: "center", boxShadow: "3px 3px 0 var(--ink)" }}>
                <MIcon name="alert" size={26} stroke={3}/>
              </div>
              <div>
                <div className="m-eyebrow" style={{ color: "var(--red)" }}>!! ERROR</div>
                <div className="m-display-md" style={{ marginTop: 2 }}>{t.converter.error}</div>
              </div>
            </div>
            <div style={{ background: "var(--paper-2)", border: "2.5px solid var(--ink)", borderRadius: 8, padding: 12 }}>
              <div className="m-eyebrow muted" style={{ marginBottom: 4 }}>STACK</div>
              <div className="mono" style={{ fontSize: 12, wordBreak: "break-word" }}>{error}</div>
            </div>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>{t.converter.errorSub}</p>
          </div>
          <button className="m-btn m-btn-paper" onClick={reset}>↺ {t.converter.reset}</button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".cbz,.cbr,.zip,.rar"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}/>
    </div>
  );
};

window.MConverter = MConverter;
