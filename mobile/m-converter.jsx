// Mobile converter — multi-file batch CBZ→PDF (JSZip + pdf-lib)
const { useState, useRef, useEffect } = React;

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

function mLoadLibArchive() {
  return new Promise((resolve, reject) => {
    const code = `import{Archive}from"https://cdn.jsdelivr.net/npm/libarchive.js@2.0.2/dist/libarchive.js";Archive.init({workerUrl:"/libarchive-worker.js"});window._LibArchive=Archive;`;
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const s = document.createElement("script");
    s.type = "module"; s.src = url;
    s.onload = () => { URL.revokeObjectURL(url); resolve(); };
    s.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load RAR engine")); };
    document.head.appendChild(s);
  });
}

let __mJobIdSeq = 0;
const newMJobId = () => ++__mJobIdSeq;

const MConverter = ({ t, lang, setToast }) => {
  const [jobs, setJobs] = useState([]);
  const [pageSize, setPageSize] = useState("original");
  const [fit, setFit] = useState("contain");
  const [margin, setMargin] = useState("none");
  const [showOptions, setShowOptions] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [zipping, setZipping] = useState(false);
  const fileInputRef = useRef(null);

  const updateJob = (id, patch) => setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  const removeJob = (id) => setJobs(prev => prev.filter(j => j.id !== id));
  const clearAll = () => setJobs([]);

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    const newJobs = files.map(f => ({
      id: newMJobId(), file: f, status: "pending",
      pageCount: 0, progress: 0, label: "",
      pdfBlob: null, pdfSize: 0,
      outputName: f.name.replace(/\.(cbz|cbr|zip|rar)$/i, "") + ".pdf",
      error: null, archive: null,
    }));
    setJobs(prev => [...prev, ...newJobs]);
    for (const job of newJobs) await extractJob(job.id, job.file);
  };

  const extractJob = async (id, file) => {
    updateJob(id, { status: "extracting", label: t.converter.reading, progress: 4 });
    const kind = mDetectKind(file.name);
    try {
      if (kind === "unknown") throw new Error("Unsupported file type.");
      let entries = [];

      if (kind === "cbz") {
        const zip = await JSZip.loadAsync(file);
        const all = [];
        zip.forEach((p, e) => { if (!e.dir && M_IMAGE_EXT.test(p)) all.push(e); });
        if (!all.length) throw new Error("No images found.");
        all.sort((a, b) => mNatCompare(a.name, b.name));
        updateJob(id, { label: t.converter.extracting });
        for (let i = 0; i < all.length; i++) {
          entries.push({ name: all[i].name, blob: await all[i].async("blob") });
        }
      } else {
        // CBR: load libarchive.js lazily on first use (via script tag — Babel would mangle import())
        if (!window._LibArchive) {
          updateJob(id, { label: t.converter.loadingRar });
          await mLoadLibArchive();
        }
        const archive = await window._LibArchive.open(file);
        updateJob(id, { label: t.converter.extracting });
        const fileList = await archive.getFilesArray();
        const images = fileList.filter(e => e.file && typeof e.file !== "string" && M_IMAGE_EXT.test(e.file.name));
        if (!images.length) throw new Error("No images found in CBR.");
        images.sort((a, b) => mNatCompare(a.path + a.file.name, b.path + b.file.name));
        for (const entry of images) {
          const extracted = entry.file instanceof File ? entry.file : await entry.file.extract();
          entries.push({ name: entry.path + entry.file.name, blob: extracted });
        }
        await archive.close();
      }

      updateJob(id, { status: "ready", archive: { kind, entries }, pageCount: entries.length, progress: 0, label: "" });
    } catch (e) {
      console.error(e);
      updateJob(id, { status: "error", error: e.message || String(e), progress: 0, label: "" });
    }
  };

  const convertJob = async (id, archive) => {
    if (!archive) return;
    updateJob(id, { status: "converting", progress: 35, label: t.converter.composing });
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
        if (i % 3 === 0) {
          updateJob(id, { progress: 35 + Math.round((i/total)*60) });
          await new Promise(r => setTimeout(r, 0));
        }
      }
      updateJob(id, { progress: 97, label: t.converter.finalizing });
      const pdfBytes = await pdf.save();
      updateJob(id, {
        status: "done", progress: 100, label: "",
        pdfBlob: new Blob([pdfBytes], { type: "application/pdf" }),
        pdfSize: pdfBytes.length,
      });
    } catch (e) {
      console.error(e);
      updateJob(id, { status: "error", error: e.message || String(e), progress: 0, label: "" });
    }
  };

  const convertAll = async () => {
    setBatchRunning(true);
    const readyJobs = jobs.filter(j => (j.status === "ready" || j.status === "error") && j.archive);
    for (const j of readyJobs) await convertJob(j.id, j.archive);
    setBatchRunning(false);
    setToast?.(lang === "pt" ? "Todos prontos" : "All done");
  };

  const downloadJob = (id) => {
    const job = jobs.find(j => j.id === id);
    if (!job?.pdfBlob) return;
    const url = URL.createObjectURL(job.pdfBlob);
    const a = document.createElement("a");
    a.href = url; a.download = job.outputName || "comic.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    setToast?.(lang === "pt" ? "PDF salvo" : "PDF saved");
  };

  const downloadAllZip = async () => {
    const done = jobs.filter(j => j.status === "done" && j.pdfBlob);
    if (!done.length) return;
    if (done.length === 1) { downloadJob(done[0].id); return; }
    setZipping(true);
    try {
      const zip = new JSZip();
      const seen = new Map();
      for (const j of done) {
        let name = j.outputName || "comic.pdf";
        const n = (seen.get(name) || 0) + 1;
        if (n > 1) {
          const dot = name.lastIndexOf(".");
          name = (dot > 0 ? name.slice(0, dot) + `-${n}` + name.slice(dot) : name + `-${n}`);
        }
        seen.set(j.outputName, n);
        zip.file(name, j.pdfBlob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "comicpdf-batch.zip";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 800);
      setToast?.("ZIP " + (lang === "pt" ? "salvo" : "saved"));
    } finally { setZipping(false); }
  };

  const totalPages = jobs.reduce((s, j) => s + (j.pageCount || 0), 0);
  const readyCount = jobs.filter(j => j.status === "ready").length;
  const doneCount = jobs.filter(j => j.status === "done").length;
  const isEmpty = jobs.length === 0;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {isEmpty && (
        <React.Fragment>
          <div className="m-panel" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
            <div className="m-halftone-strip" style={{ top: -20, right: -20 }}/>
            <div style={{ padding: 18 }}>
              <span className="m-chip m-chip-yellow"><MIcon name="lock" size={11}/> {lang === "pt" ? "100% LOCAL" : "100% LOCAL"}</span>
              <div className="m-display-lg" style={{ marginTop: 12 }}>
                {lang === "pt" ? "Solte quadrinhos" : "Drop comics"}
              </div>
              <p className="muted" style={{ fontSize: 14, marginTop: 6, marginBottom: 0 }}>
                {lang === "pt" ? "Vários .cbz de uma vez → PDFs locais." : "Multiple .cbz at once → local PDFs."}
              </p>
            </div>
          </div>

          <label htmlFor="m-file-input" className="m-drop" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: "var(--paper)", border: "3px solid var(--ink)",
              display: "grid", placeItems: "center",
              boxShadow: "4px 4px 0 var(--ink)",
            }}>
              <MIcon name="upload" size={28} stroke={2.8}/>
            </div>
            <div className="m-display-md">{t.converter.drop}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {lang === "pt" ? "Selecione um ou vários" : "Pick one or many"}
            </div>
            <span className="m-btn m-btn-yellow" style={{ marginTop: 8, width: "auto", paddingLeft: 24, paddingRight: 24 }}>
              <MIcon name="file" size={18}/> {t.hero.cta}
            </span>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span className="m-chip">.CBZ</span>
              <span className="m-chip">.CBR</span>
              <span className="m-chip m-chip-yellow">MULTI</span>
            </div>
          </label>
        </React.Fragment>
      )}

      {!isEmpty && (
        <div className="pop-in" style={{ display: "grid", gap: 12 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <MStat label={t.converter.queue} value={String(jobs.length)} bg="var(--red)" fg="var(--paper)"/>
            <MStat label={t.converter.totalPages} value={String(totalPages)} bg="var(--blue)" fg="var(--paper)"/>
            <MStat label={t.converter.done} value={`${doneCount}/${jobs.length}`} bg="var(--yellow)" fg="var(--ink)"/>
          </div>

          {/* Options sheet trigger */}
          <button className="m-list-row" style={{ borderRadius: 12, border: "2.5px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", background: "var(--paper)" }}
            onClick={() => setShowOptions(true)}>
            <div className="row-icon"><MIcon name="settings" size={18}/></div>
            <div>
              <div className="row-title">{lang === "pt" ? "Opções" : "Options"}</div>
              <div className="row-sub mono">{pageSize} · {fit} · margin: {margin}</div>
            </div>
            <MIcon name="chevron-right" size={18}/>
          </button>

          {/* Job list */}
          <div style={{ display: "grid", gap: 10 }}>
            {jobs.map(j => (
              <MJobCard key={j.id} job={j} t={t} lang={lang}
                onRemove={() => removeJob(j.id)}
                onDownload={() => downloadJob(j.id)}
              />
            ))}
          </div>

          {/* Action buttons */}
          <button className="m-btn m-btn-red m-btn-lg" onClick={convertAll} disabled={batchRunning || readyCount === 0}>
            <MIcon name="bolt" size={20}/>
            {batchRunning ? t.converter.converting : `${t.converter.batchConvert}${readyCount > 0 ? ` (${readyCount})` : ""}`}
          </button>
          <button className="m-btn m-btn-yellow" onClick={downloadAllZip} disabled={doneCount === 0 || zipping}>
            <MIcon name="download" size={18}/>
            {zipping ? t.converter.zippingLabel + "…" : `${t.converter.batchDownload}${doneCount > 0 ? ` (${doneCount})` : ""}`}
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label htmlFor="m-file-input" className="m-btn m-btn-paper m-btn-sm" style={{ cursor: "pointer" }}>
              <MIcon name="upload" size={14}/> {t.converter.addMore}
            </label>
            <button className="m-btn m-btn-paper m-btn-sm" onClick={clearAll}>
              <MIcon name="x" size={14}/> {t.converter.clearAll}
            </button>
          </div>

          <Sheet open={showOptions} onClose={() => setShowOptions(false)} title={lang === "pt" ? "Opções" : "Options"}>
            <div style={{ display: "grid", gap: 16, marginTop: 4 }}>
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

      <input ref={fileInputRef} id="m-file-input" type="file"
        accept=".cbz,.cbr,.zip,.rar,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/vnd.rar"
        multiple
        style={{ display: "none" }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}/>
    </div>
  );
};

const MStat = ({ label, value, bg, fg }) => (
  <div style={{ background: bg, color: fg, border: "2.5px solid var(--ink)", borderRadius: 8, padding: "8px 10px", boxShadow: "2px 2px 0 var(--ink)", textAlign: "center" }}>
    <div className="m-eyebrow" style={{ fontSize: 9, opacity: 0.85 }}>{label}</div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 2 }}>{value}</div>
  </div>
);

const MJobCard = ({ job, t, lang, onRemove, onDownload }) => {
  const statusBadge = {
    pending: { bg: "var(--paper-2)", fg: "var(--ink)", label: t.converter.pending },
    extracting: { bg: "var(--blue)", fg: "var(--paper)", label: "READING" },
    ready: { bg: "var(--yellow)", fg: "var(--ink)", label: "READY" },
    converting: { bg: "var(--red)", fg: "var(--paper)", label: t.converter.converting },
    done: { bg: "var(--green)", fg: "var(--ink)", label: t.converter.done.toUpperCase() },
    error: { bg: "var(--red)", fg: "var(--paper)", label: "ERROR" },
  }[job.status];
  const showProgress = job.status === "extracting" || job.status === "converting";
  return (
    <div style={{
      border: "2.5px solid var(--ink)", borderRadius: 10,
      background: "var(--paper)", boxShadow: "3px 3px 0 var(--ink)",
      padding: 12, display: "grid", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="m-chip" style={{ background: statusBadge.bg, color: statusBadge.fg, fontSize: 8, padding: "3px 6px" }}>
          {statusBadge.label}
        </span>
        <div className="mono" style={{ fontWeight: 700, fontSize: 12, flex: 1, minWidth: 0, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
          {job.file.name}
        </div>
        <button onClick={onRemove} aria-label="remove"
          style={{ background: "transparent", border: "2px solid var(--ink)", borderRadius: 6, padding: 4, cursor: "pointer", display: "grid", placeItems: "center" }}>
          <MIcon name="x" size={12}/>
        </button>
      </div>

      {showProgress && (
        <div className="m-progress" style={{ height: 14 }}>
          <div className="m-progress-fill" style={{ width: (job.progress || 5) + "%" }}/>
        </div>
      )}

      <div className="mono muted" style={{ fontSize: 10 }}>
        {job.pageCount > 0 && <span>{job.pageCount} {t.converter.pages.toLowerCase()}</span>}
        {job.pageCount > 0 && " · "}
        {mFmtBytes(job.file.size)}
        {job.status === "done" && <span style={{ color: "var(--ink)", fontWeight: 700 }}> → {mFmtBytes(job.pdfSize)}</span>}
        {job.status === "error" && <span style={{ color: "var(--red)" }}> · {job.error}</span>}
      </div>

      {job.status === "done" && (
        <button className="m-btn m-btn-yellow m-btn-sm" onClick={onDownload}>
          <MIcon name="download" size={14}/> PDF
        </button>
      )}
    </div>
  );
};

window.MConverter = MConverter;
