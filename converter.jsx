// Converter component — real CBZ→PDF using JSZip + pdf-lib
const { useState, useRef, useEffect, useCallback } = React;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;

// natural sort for filenames like "page1.jpg", "page10.jpg"
function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function fmtBytes(n) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
  return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

function detectKind(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".cbz") || lower.endsWith(".zip")) return "cbz";
  if (lower.endsWith(".cbr") || lower.endsWith(".rar")) return "cbr";
  return "unknown";
}

// Get image dimensions from a Blob via <img> decode
function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const out = { width: img.naturalWidth, height: img.naturalHeight, url };
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode failed")); };
    img.src = url;
  });
}

async function blobToBytes(blob) {
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

// Page sizes in points (1pt = 1/72 inch)
const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const Converter = ({ t, lang }) => {
  const [stage, setStage] = useState("idle"); // idle | ready | converting | done | error
  const [file, setFile] = useState(null);
  const [archive, setArchive] = useState(null); // {kind, entries: [{name, blob}]}
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [outputName, setOutputName] = useState("comic.pdf");
  const [pageSize, setPageSize] = useState("original"); // original|a4|letter
  const [fit, setFit] = useState("contain");
  const [margin, setMargin] = useState("none");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBytesLen, setPdfBytesLen] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Drag-and-drop on whole page
  useEffect(() => {
    const onDrop = (e) => {
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    };
    const onOver = (e) => { e.preventDefault(); setDragging(true); };
    const onLeave = (e) => {
      if (e.relatedTarget === null || e.target === document) setDragging(false);
    };
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    return () => {
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
    };
  }, []);

  const reset = () => {
    setStage("idle");
    setFile(null);
    setArchive(null);
    setError(null);
    setProgress(0);
    setProgressLabel("");
    setPdfBlob(null);
    setPdfBytesLen(0);
  };

  const handleFile = useCallback(async (f) => {
    if (!f) return;
    reset();
    setFile(f);
    setOutputName(f.name.replace(/\.(cbz|cbr|zip|rar)$/i, "") + ".pdf");
    setStage("converting");
    setProgress(2);
    setProgressLabel(t.converter.reading);

    const kind = detectKind(f.name);
    try {
      if (kind === "cbz") {
        const zip = await JSZip.loadAsync(f);
        const all = [];
        zip.forEach((path, entry) => {
          if (!entry.dir && IMAGE_EXT.test(path)) all.push(entry);
        });
        if (all.length === 0) throw new Error("No images found in archive.");
        all.sort((a, b) => naturalCompare(a.name, b.name));
        setProgressLabel(t.converter.extracting);
        const entries = [];
        for (let i = 0; i < all.length; i++) {
          const blob = await all[i].async("blob");
          entries.push({ name: all[i].name, blob });
          setProgress(2 + Math.round((i / all.length) * 30));
        }
        setArchive({ kind, entries });
        setStage("ready");
        setProgress(0);
        setProgressLabel("");
      } else if (kind === "cbr") {
        // CBR support is beta — we surface a friendly error since RAR support
        // requires a heavy WASM dependency. Per the proposal, we degrade.
        throw new Error(t.converter.cbrBeta + " (RAR decoder not bundled in this prototype.)");
      } else {
        throw new Error("Unsupported file type. Use .cbz, .cbr, .zip or .rar.");
      }
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
      setStage("error");
    }
  }, [t]);

  const convertToPdf = async () => {
    if (!archive) return;
    setStage("converting");
    setProgress(35);
    setProgressLabel(t.converter.composing);

    try {
      const { PDFDocument } = PDFLib;
      const pdf = await PDFDocument.create();
      const total = archive.entries.length;
      const marginPx = margin === "small" ? 18 : 0;

      for (let i = 0; i < total; i++) {
        const entry = archive.entries[i];
        const bytes = await blobToBytes(entry.blob);
        let img;
        const lower = entry.name.toLowerCase();
        try {
          if (lower.endsWith(".png")) {
            img = await pdf.embedPng(bytes);
          } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            img = await pdf.embedJpg(bytes);
          } else {
            // Fallback: render to canvas, re-encode as JPEG
            const dec = await loadImage(entry.blob);
            const canvas = document.createElement("canvas");
            canvas.width = dec.width; canvas.height = dec.height;
            const ctx = canvas.getContext("2d");
            const tmp = new Image();
            await new Promise((res, rej) => { tmp.onload = res; tmp.onerror = rej; tmp.src = dec.url; });
            ctx.drawImage(tmp, 0, 0);
            URL.revokeObjectURL(dec.url);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            const jpgBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), c => c.charCodeAt(0));
            img = await pdf.embedJpg(jpgBytes);
          }
        } catch (embedErr) {
          console.warn("skipping page", entry.name, embedErr);
          continue;
        }

        let pageW, pageH;
        if (pageSize === "original") {
          pageW = img.width + marginPx * 2;
          pageH = img.height + marginPx * 2;
        } else {
          [pageW, pageH] = PAGE_SIZES[pageSize];
        }
        const page = pdf.addPage([pageW, pageH]);
        const innerW = pageW - marginPx * 2;
        const innerH = pageH - marginPx * 2;

        let drawW, drawH;
        if (pageSize === "original") {
          drawW = img.width; drawH = img.height;
        } else {
          const sx = innerW / img.width;
          const sy = innerH / img.height;
          const scale = fit === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
          drawW = img.width * scale;
          drawH = img.height * scale;
        }
        const x = marginPx + (innerW - drawW) / 2;
        const y = marginPx + (innerH - drawH) / 2;
        page.drawImage(img, { x, y, width: drawW, height: drawH });

        setProgress(35 + Math.round((i / total) * 60));
        if (i % 4 === 0) await new Promise(r => setTimeout(r, 0));
      }

      setProgress(97);
      setProgressLabel(t.converter.finalizing);
      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setPdfBlob(blob);
      setPdfBytesLen(pdfBytes.length);
      setProgress(100);
      setStage("done");
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
      setStage("error");
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url; a.download = outputName || "comic.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  // ===== Render =====
  return (
    <div className="panel panel-xl" style={{ padding: 28, position: "relative", overflow: "hidden" }} id="converter">
      <HalftoneCorner corner="tr" color="var(--red)" />
      <div className="between" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow muted">{lang === "pt" ? "FERRAMENTA" : "THE TOOL"}</div>
          <div className="display-md" style={{ marginTop: 4 }}>
            {lang === "pt" ? "Converter agora" : "Convert now"}
          </div>
        </div>
        <span className="chip chip-yellow"><Icon name="lock" size={12}/> {lang === "pt" ? "100% LOCAL" : "100% LOCAL"}</span>
      </div>

      {stage === "idle" && (
        <DropArea
          onPick={() => fileInputRef.current?.click()}
          onFile={handleFile}
          dragging={dragging}
          t={t}
        />
      )}

      {stage === "ready" && archive && (
        <ReadyForm
          file={file} archive={archive}
          outputName={outputName} setOutputName={setOutputName}
          pageSize={pageSize} setPageSize={setPageSize}
          fit={fit} setFit={setFit}
          margin={margin} setMargin={setMargin}
          onConvert={convertToPdf}
          onReset={reset}
          t={t}
        />
      )}

      {stage === "converting" && (
        <ConvertingView progress={progress} label={progressLabel} t={t} fileName={file?.name}/>
      )}

      {stage === "done" && (
        <DoneView
          outputName={outputName}
          pageCount={archive?.entries?.length || 0}
          size={pdfBytesLen}
          onDownload={downloadPdf}
          onReset={reset}
          t={t}
        />
      )}

      {stage === "error" && (
        <ErrorView error={error} onReset={reset} t={t}/>
      )}

      <input
        ref={fileInputRef} type="file" accept=".cbz,.cbr,.zip,.rar"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Demo state cycler — only visible in idle when nothing else is happening */}
      {stage === "idle" && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 6 }}>
          <span className="eyebrow muted" style={{ alignSelf: "center", marginRight: 6 }}>
            {lang === "pt" ? "DEMO ESTADOS:" : "DEMO STATES:"}
          </span>
          <button className="chip" onClick={() => simulateState(setStage, setFile, setArchive, setProgress, setProgressLabel, setOutputName, setPdfBytesLen, "ready", t)}>
            ready
          </button>
          <button className="chip" onClick={() => simulateState(setStage, setFile, setArchive, setProgress, setProgressLabel, setOutputName, setPdfBytesLen, "converting", t)}>
            converting
          </button>
          <button className="chip" onClick={() => simulateState(setStage, setFile, setArchive, setProgress, setProgressLabel, setOutputName, setPdfBytesLen, "done", t)}>
            done
          </button>
          <button className="chip" onClick={() => { setError("Demo: failed to read archive."); setStage("error"); }}>
            error
          </button>
        </div>
      )}
    </div>
  );
};

// ----- Sub-views -----

function simulateState(setStage, setFile, setArchive, setProgress, setProgressLabel, setOutputName, setPdfBytesLen, target, t) {
  const fakeFile = { name: "amazing-spider-man-001.cbz", size: 28_400_000 };
  const fakeEntries = Array.from({ length: 24 }, (_, i) => ({ name: `page${String(i+1).padStart(3,"0")}.jpg` }));
  setFile(fakeFile);
  setArchive({ kind: "cbz", entries: fakeEntries });
  setOutputName("amazing-spider-man-001.pdf");
  if (target === "ready") {
    setStage("ready"); setProgress(0); setProgressLabel("");
  } else if (target === "converting") {
    setStage("converting"); setProgress(62); setProgressLabel(t.converter.composing);
  } else if (target === "done") {
    setStage("done"); setProgress(100); setPdfBytesLen(31_200_000);
  }
}

const DropArea = ({ onPick, onFile, dragging, t }) => {
  const [hoverLocal, setHoverLocal] = useState(false);
  return (
    <div
      className={"dropzone" + (dragging || hoverLocal ? " drag-over" : "")}
      onClick={onPick}
      onDragEnter={() => setHoverLocal(true)}
      onDragLeave={() => setHoverLocal(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); setHoverLocal(false); onFile(e.dataTransfer.files[0]); }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 14,
          background: "var(--paper)", border: "3px solid var(--ink)",
          display: "grid", placeItems: "center",
          boxShadow: "4px 4px 0 var(--ink)",
        }}>
          <Icon name="upload" size={32} stroke={2.8}/>
        </div>
        <div className="display-sm" style={{ fontFamily: "var(--font-display)" }}>
          {t.converter.drop}
        </div>
        <div className="muted" style={{ fontSize: 14 }}>{t.converter.dropSub}</div>
        <button className="btn btn-yellow" type="button" onClick={(e) => { e.stopPropagation(); onPick(); }}>
          <Icon name="file" size={18}/> {t.hero.cta}
        </button>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <span className="chip">.CBZ</span>
          <span className="chip">.CBR <strong style={{marginLeft:4, fontSize:9, background:"var(--ink)", color:"var(--paper)", padding:"1px 4px", borderRadius:3}}>BETA</strong></span>
          <span className="chip">.ZIP</span>
        </div>
      </div>
    </div>
  );
};

const ReadyForm = ({ file, archive, outputName, setOutputName, pageSize, setPageSize, fit, setFit, margin, setMargin, onConvert, onReset, t }) => (
  <div className="pop-in" style={{ display: "grid", gap: 20 }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12,
    }}>
      <InfoCell label={t.converter.fileSelected} value={file.name} mono/>
      <InfoCell label={t.converter.pages} value={String(archive.entries.length)} accent="red"/>
      <InfoCell label={lang_label(file.size)} value={fmtBytes(file.size)} accent="blue"/>
    </div>

    <div className="divider" style={{ height: 2.5 }}/>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div>
        <label className="field-label">{t.converter.output}</label>
        <input className="input mono" value={outputName} onChange={(e) => setOutputName(e.target.value)}/>
      </div>
      <div>
        <label className="field-label">{t.converter.pageSize}</label>
        <Seg value={pageSize} onChange={setPageSize} options={[
          { value: "original", label: t.converter.pageSizeOpts.original },
          { value: "a4", label: t.converter.pageSizeOpts.a4 },
          { value: "letter", label: t.converter.pageSizeOpts.letter },
        ]}/>
      </div>
      <div>
        <label className="field-label">{t.converter.fit}</label>
        <Seg value={fit} onChange={setFit} options={[
          { value: "contain", label: t.converter.fitOpts.contain },
          { value: "cover", label: t.converter.fitOpts.cover },
        ]}/>
      </div>
      <div>
        <label className="field-label">{t.converter.margin}</label>
        <Seg value={margin} onChange={setMargin} options={[
          { value: "none", label: t.converter.marginOpts.none },
          { value: "small", label: t.converter.marginOpts.small },
        ]}/>
      </div>
    </div>

    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
      <button className="btn btn-red btn-lg" onClick={onConvert}>
        <Icon name="bolt" size={20}/> {t.converter.convert}
      </button>
      <button className="btn btn-paper" onClick={onReset}>
        <Icon name="x" size={16}/> {t.converter.reset}
      </button>
      <div style={{ flex: 1 }}/>
      <div className="mono muted" style={{ fontSize: 12, textAlign: "right" }}>
        {archive.entries.length} pages • local processing
      </div>
    </div>
  </div>
);

function lang_label(size) {
  return "size";
}

const InfoCell = ({ label, value, mono, accent }) => {
  const bg = accent === "red" ? "var(--red)" : accent === "blue" ? "var(--blue)" : "var(--paper-2)";
  const fg = (accent === "red" || accent === "blue") ? "var(--paper)" : "var(--ink)";
  return (
    <div style={{
      border: "2.5px solid var(--ink)", borderRadius: 8, padding: "10px 12px",
      background: bg, color: fg, boxShadow: "2px 2px 0 var(--ink)", overflow: "hidden",
    }}>
      <div className="eyebrow" style={{ fontSize: 10, opacity: 0.85 }}>{label}</div>
      <div className={mono ? "mono" : ""} style={{
        fontWeight: 700, marginTop: 2, fontSize: mono ? 14 : 22,
        whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-display)",
      }}>{value}</div>
    </div>
  );
};

const ConvertingView = ({ progress, label, t, fileName }) => (
  <div className="pop-in" style={{ display: "grid", gap: 16, padding: "12px 0" }}>
    <div className="between">
      <div>
        <div className="eyebrow muted">{label || t.converter.converting}</div>
        <div className="display-sm mono" style={{ marginTop: 4, fontFamily: "var(--font-mono)" }}>
          {fileName}
        </div>
      </div>
      <div className="display-md" style={{ color: "var(--red)" }}>{Math.round(progress)}%</div>
    </div>
    <div className="progress">
      <div className="progress-fill" style={{ width: `${progress}%` }}/>
    </div>
    <div className="row mono muted" style={{ gap: 16, fontSize: 13 }}>
      <span>● cpu: this device</span>
      <span>● upload: 0 bytes</span>
      <span>● privacy: 100%</span>
    </div>
  </div>
);

const DoneView = ({ outputName, pageCount, size, onDownload, onReset, t }) => (
  <div className="pop-in" style={{ display: "grid", gap: 18 }}>
    <div className="row" style={{ gap: 16 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: "var(--green)", border: "3px solid var(--ink)",
        display: "grid", placeItems: "center", color: "var(--ink)",
        boxShadow: "4px 4px 0 var(--ink)",
      }}>
        <Icon name="check" size={32} stroke={3.5}/>
      </div>
      <div>
        <div className="eyebrow" style={{ color: "var(--red)" }}>{t.converter.done.toUpperCase()} ✦</div>
        <div className="display-md" style={{ marginTop: 2 }}>{lang_label_ready(t)}</div>
      </div>
    </div>

    <div style={{
      border: "2.5px solid var(--ink)", borderRadius: 10, padding: 16,
      background: "var(--paper-2)", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
    }}>
      <div style={{
        width: 44, height: 56, borderRadius: 4,
        background: "var(--red)", border: "2.5px solid var(--ink)",
        display: "grid", placeItems: "center", color: "var(--paper)",
        fontFamily: "var(--font-display)", fontSize: 13,
      }}>PDF</div>
      <div style={{ overflow: "hidden" }}>
        <div className="mono" style={{ fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
          {outputName}
        </div>
        <div className="muted mono" style={{ fontSize: 12, marginTop: 2 }}>
          {pageCount} pages • {fmtBytes(size)}
        </div>
      </div>
      <button className="btn btn-yellow btn-lg" onClick={onDownload}>
        <Icon name="download" size={20}/> {t.converter.download}
      </button>
    </div>

    <div className="between">
      <button className="btn btn-paper" onClick={onReset}>
        ↺ {t.converter.reset}
      </button>
      <span className="mono muted" style={{ fontSize: 12 }}>
        Saved nowhere but your downloads folder.
      </span>
    </div>
  </div>
);

function lang_label_ready(t) {
  // both languages
  return t === window.I18N?.pt ? "Seu PDF está pronto" : "Your PDF is ready";
}

const ErrorView = ({ error, onReset, t }) => (
  <div className="pop-in" style={{ display: "grid", gap: 16 }}>
    <div className="row" style={{ gap: 16 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: "var(--red)", border: "3px solid var(--ink)",
        display: "grid", placeItems: "center", color: "var(--paper)",
        boxShadow: "4px 4px 0 var(--ink)",
      }}>
        <Icon name="alert" size={32} stroke={3}/>
      </div>
      <div>
        <div className="eyebrow" style={{ color: "var(--red)" }}>!! ERROR</div>
        <div className="display-md" style={{ marginTop: 2 }}>{t.converter.error}</div>
      </div>
    </div>

    <div className="tag-box" style={{ background: "var(--paper-2)" }}>
      <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
        Stack trace
      </div>
      <div style={{ wordBreak: "break-word" }}>{error}</div>
    </div>

    <p className="muted" style={{ fontSize: 14 }}>{t.converter.errorSub}</p>
    <button className="btn btn-paper" onClick={onReset}>
      ↺ {t.converter.reset}
    </button>
  </div>
);

window.Converter = Converter;
