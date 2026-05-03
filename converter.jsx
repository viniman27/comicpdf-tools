// Converter component — multi-file batch CBZ→PDF using JSZip + pdf-lib
const { useState, useRef, useEffect, useCallback } = React;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;
function naturalCompare(a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }); }
function fmtBytes(n) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return n + " B";
  if (n < 1024*1024) return (n/1024).toFixed(1) + " KB";
  if (n < 1024*1024*1024) return (n/1024/1024).toFixed(1) + " MB";
  return (n/1024/1024/1024).toFixed(2) + " GB";
}
function detectKind(name) {
  const l = name.toLowerCase();
  if (l.endsWith(".cbz") || l.endsWith(".zip")) return "cbz";
  if (l.endsWith(".cbr") || l.endsWith(".rar")) return "cbr";
  return "unknown";
}
async function blobToBytes(blob) { return new Uint8Array(await blob.arrayBuffer()); }
const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };

let __jobIdSeq = 0;
const newJobId = () => ++__jobIdSeq;

const Converter = ({ t, lang }) => {
  // jobs: [{ id, file, status: 'pending'|'extracting'|'ready'|'converting'|'done'|'error',
  //          pageCount, progress, label, pdfBlob, pdfSize, outputName, error }]
  const [jobs, setJobs] = useState([]);
  const [pageSize, setPageSize] = useState("original");
  const [fit, setFit] = useState("contain");
  const [margin, setMargin] = useState("none");
  const [dragging, setDragging] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [zipping, setZipping] = useState(false);
  const fileInputRef = useRef(null);

  const updateJob = (id, patch) => setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  const removeJob = (id) => setJobs(prev => prev.filter(j => j.id !== id));
  const clearAll = () => setJobs([]);

  // Whole-page drag-and-drop
  useEffect(() => {
    const onDrop = (e) => {
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault(); setDragging(false);
      addFiles(e.dataTransfer.files);
    };
    const onOver = (e) => { e.preventDefault(); setDragging(true); };
    const onLeave = (e) => { if (e.relatedTarget === null || e.target === document) setDragging(false); };
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    return () => {
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
    };
  });

  const addFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    const newJobs = files.map(f => ({
      id: newJobId(), file: f, status: "pending",
      pageCount: 0, progress: 0, label: "",
      pdfBlob: null, pdfSize: 0,
      outputName: f.name.replace(/\.(cbz|cbr|zip|rar)$/i, "") + ".pdf",
      error: null, archive: null,
    }));
    setJobs(prev => [...prev, ...newJobs]);
    // Eagerly extract each so we can show page counts
    for (const job of newJobs) await extractJob(job.id, job.file);
  }, []);

  const extractJob = async (id, file) => {
    updateJob(id, { status: "extracting", label: t.converter.reading, progress: 4 });
    const kind = detectKind(file.name);
    try {
      if (kind !== "cbz") {
        if (kind === "cbr") throw new Error(t.converter.cbrBeta);
        throw new Error("Unsupported file type.");
      }
      const zip = await JSZip.loadAsync(file);
      const all = [];
      zip.forEach((p, e) => { if (!e.dir && IMAGE_EXT.test(p)) all.push(e); });
      if (!all.length) throw new Error("No images found.");
      all.sort((a, b) => naturalCompare(a.name, b.name));
      updateJob(id, { label: t.converter.extracting });
      const entries = [];
      for (let i = 0; i < all.length; i++) {
        entries.push({ name: all[i].name, blob: await all[i].async("blob") });
      }
      updateJob(id, {
        status: "ready", archive: { kind, entries },
        pageCount: entries.length, progress: 0, label: "",
      });
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
        const bytes = await blobToBytes(entry.blob);
        const lower = entry.name.toLowerCase();
        let img;
        try {
          if (lower.endsWith(".png")) img = await pdf.embedPng(bytes);
          else img = await pdf.embedJpg(bytes);
        } catch (err) { console.warn("skip", entry.name, err); continue; }
        let pw, ph;
        if (pageSize === "original") { pw = img.width + marginPx*2; ph = img.height + marginPx*2; }
        else { [pw, ph] = PAGE_SIZES[pageSize]; }
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
        if (i % 4 === 0) {
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
  };

  const downloadJob = (id) => {
    const job = jobs.find(j => j.id === id);
    if (!job?.pdfBlob) return;
    const url = URL.createObjectURL(job.pdfBlob);
    const a = document.createElement("a");
    a.href = url; a.download = job.outputName || "comic.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
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
    } finally { setZipping(false); }
  };

  // Stats
  const totalPages = jobs.reduce((s, j) => s + (j.pageCount || 0), 0);
  const readyCount = jobs.filter(j => j.status === "ready").length;
  const doneCount = jobs.filter(j => j.status === "done").length;
  const isEmpty = jobs.length === 0;

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

      {isEmpty && (
        <DropArea
          onPick={() => fileInputRef.current?.click()}
          onFiles={addFiles}
          dragging={dragging}
          t={t}
        />
      )}

      {!isEmpty && (
        <div style={{ display: "grid", gap: 18 }}>
          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <InfoCell label={t.converter.queue} value={`${jobs.length} ${jobs.length === 1 ? t.converter.fileSingular : t.converter.filesPlural}`} accent="red"/>
            <InfoCell label={t.converter.totalPages} value={String(totalPages)} accent="blue" mono/>
            <InfoCell label={t.converter.pending} value={String(readyCount)} mono/>
            <InfoCell label={t.converter.done} value={`${doneCount}/${jobs.length}`} accent={doneCount === jobs.length && doneCount > 0 ? "red" : null} mono/>
          </div>

          {/* Options grid */}
          <div className="divider" style={{ height: 2.5 }}/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
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

          {/* Job list */}
          <div style={{ display: "grid", gap: 10 }}>
            {jobs.map(j => (
              <JobRow key={j.id} job={j} t={t} lang={lang}
                onRemove={() => removeJob(j.id)}
                onDownload={() => downloadJob(j.id)}
                onRename={(name) => updateJob(j.id, { outputName: name })}
              />
            ))}
          </div>

          {/* Batch action bar */}
          <div className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
            <button className="btn btn-red btn-lg" onClick={convertAll} disabled={batchRunning || readyCount === 0}>
              <Icon name="bolt" size={20}/> {batchRunning ? t.converter.converting : t.converter.batchConvert}
              {readyCount > 0 && <span className="mono" style={{ fontSize: 12, opacity: 0.85, marginLeft: 4 }}>({readyCount})</span>}
            </button>
            <button className="btn btn-yellow" onClick={downloadAllZip} disabled={doneCount === 0 || zipping}>
              <Icon name="download" size={18}/> {zipping ? t.converter.zippingLabel + "…" : t.converter.batchDownload}
              {doneCount > 0 && <span className="mono" style={{ fontSize: 12, opacity: 0.85, marginLeft: 4 }}>({doneCount})</span>}
            </button>
            <button className="btn btn-paper" onClick={() => fileInputRef.current?.click()}>
              <Icon name="upload" size={16}/> {t.converter.addMore}
            </button>
            <div style={{ flex: 1 }}/>
            <button className="btn btn-paper" onClick={clearAll}>
              <Icon name="x" size={16}/> {t.converter.clearAll}
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef} type="file" accept=".cbz,.cbr,.zip,.rar"
        multiple
        style={{ display: "none" }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
};

const DropArea = ({ onPick, onFiles, dragging, t }) => {
  const [hoverLocal, setHoverLocal] = useState(false);
  return (
    <div
      className={"dropzone" + (dragging || hoverLocal ? " drag-over" : "")}
      onClick={onPick}
      onDragEnter={() => setHoverLocal(true)}
      onDragLeave={() => setHoverLocal(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setHoverLocal(false); onFiles(e.dataTransfer.files); }}
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
          <span className="chip chip-yellow">MULTI</span>
        </div>
      </div>
    </div>
  );
};

const JobRow = ({ job, t, lang, onRemove, onDownload, onRename }) => {
  const statusBadge = {
    pending: { bg: "var(--paper-2)", fg: "var(--ink)", label: t.converter.pending },
    extracting: { bg: "var(--blue)", fg: "var(--paper)", label: t.converter.reading },
    ready: { bg: "var(--yellow)", fg: "var(--ink)", label: "READY" },
    converting: { bg: "var(--red)", fg: "var(--paper)", label: t.converter.converting },
    done: { bg: "var(--green)", fg: "var(--ink)", label: t.converter.done.toUpperCase() },
    error: { bg: "var(--red)", fg: "var(--paper)", label: "ERROR" },
  }[job.status];

  return (
    <div style={{
      border: "2.5px solid var(--ink)",
      borderRadius: 10,
      background: "var(--paper)",
      boxShadow: "3px 3px 0 var(--ink)",
      padding: 14,
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: 14,
    }}>
      {/* PDF/file icon */}
      <div style={{
        width: 44, height: 56, borderRadius: 4,
        background: job.status === "done" ? "var(--green)" : "var(--ink)",
        color: job.status === "done" ? "var(--ink)" : "var(--paper)",
        border: "2.5px solid var(--ink)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-display)", fontSize: 12,
      }}>
        {job.status === "done" ? "PDF" : "CBZ"}
      </div>

      {/* Info column */}
      <div style={{ overflow: "hidden", display: "grid", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="chip" style={{ background: statusBadge.bg, color: statusBadge.fg, borderColor: "var(--ink)", fontSize: 9 }}>
            {statusBadge.label}
          </span>
          <span className="mono" style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", flex: 1 }}>
            {job.file.name}
          </span>
        </div>
        {job.status === "ready" && (
          <input
            className="input mono"
            value={job.outputName}
            onChange={(e) => onRename(e.target.value)}
            style={{ fontSize: 12, padding: "6px 10px", boxShadow: "1px 1px 0 var(--ink)" }}
          />
        )}
        {(job.status === "extracting" || job.status === "converting") && (
          <div className="progress" style={{ height: 14 }}>
            <div className="progress-fill" style={{ width: (job.progress || 5) + "%" }}/>
          </div>
        )}
        <div className="mono muted" style={{ fontSize: 11 }}>
          {job.pageCount > 0 && <span>{job.pageCount} {t.converter.pages.toLowerCase()}</span>}
          {job.pageCount > 0 && " · "}
          {fmtBytes(job.file.size)}
          {job.status === "done" && (<>
            {" · "}<span style={{ color: "var(--ink)", fontWeight: 700 }}>→ {fmtBytes(job.pdfSize)}</span>
          </>)}
          {job.status === "error" && (<><span style={{ color: "var(--red)" }}> · {job.error}</span></>)}
        </div>
      </div>

      {/* Action column */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {job.status === "done" && (
          <button className="btn btn-yellow" onClick={onDownload} style={{ padding: "8px 14px", fontSize: 13 }}>
            <Icon name="download" size={14}/> PDF
          </button>
        )}
        <button className="btn btn-paper" onClick={onRemove} title={t.converter.remove}
          style={{ padding: "8px 10px", fontSize: 12 }}>
          <Icon name="x" size={14}/>
        </button>
      </div>
    </div>
  );
};

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
        fontWeight: 700, marginTop: 2, fontSize: mono ? 16 : 22,
        whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-display)",
      }}>{value}</div>
    </div>
  );
};

window.Converter = Converter;
