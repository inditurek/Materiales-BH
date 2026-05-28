// === Combined: screens.jsx + table.jsx + app.jsx ===

// ----- screens.jsx -----
// Screens: Upload, Loading, Home (folders + saved peulot)
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS, useMemo: useMemoS } = React;

const SAMPLE_PEULA_TEXT = `Peulá: "El espejo y la espiral" — Janijim 7° grado
Madrij/á a cargo: Sofi + Tomás

APERTURA (10 min):
Recibimos a los janijim con un espiral gigante dibujado en el piso del jol.
Materiales: 1 afiche blanco grande, marcador negro grueso. Trae Sofi.

INSTANCIA 1 (25 min) — Tablero gigante de decisiones
Armamos un tablero de juego tipo "oca" con casilleros que representan dilemas.
Materiales: cartulina grande, 6 marcadores de colores, regla.
Inspiración: https://pinterest.com/pin/tablero-gigante
Trae Tomás. Hay que armarlo antes.

INSTANCIA 2 (20 min) — Memotest de valores
Repartimos en grupos chicos. Cada grupo recibe 12 tarjetas de memotest.
Materiales: imprimir tarjetas en cartulina, plastificar, recortar (12 pares).
Inspiración: https://pinterest.com/pin/memotest-valores
Trae Luli.

INSTANCIA 3 (15 min) — Dinámica del agua que se transforma
Cada janij recibe un vasito con agua de color.
Materiales: 6 vasitos transparentes (kiosco). Trae Nico.

CIERRE (10 min):
Sellamos lo aprendido en una caja transparente que queda en el jol.
Materiales: caja de cartón + nylon film + cutter. Trae Dana.`;

const LOADING_MSGS = [
  "Leyendo la peulá...",
  "Buscando materiales escondidos entre líneas...",
  "Anotando quién trae qué...",
  "Cazando links de Pinterest...",
  "Agrupando por momento...",
  "Casi listo... ✨",
];

// ---------- Upload ----------
function UploadScreen({ onSubmit, onCancel, hasSavedPeulot }) {
  const [mode, setMode] = useStateS("texto");
  const [text, setText] = useStateS("");
  const [filename, setFilename] = useStateS(null);
  const [drag, setDrag] = useStateS(false);
  const fileRef = useRefS(null);

  const ready = mode === "texto" ? text.trim().length > 30 : !!filename;

  const handleFile = (file) => { if (file) setFilename(file.name); };
  const useExample = () => { setMode("texto"); setText(SAMPLE_PEULA_TEXT); };

  return (
    <div className="upload-wrap">
      <div className="upload-card">
        <div className="upload-eyebrow">¡Hola, madrij/á!</div>
        <h1 className="upload-title">Subí tu planificación y armamos la lista de materiales.</h1>
        <p className="upload-sub">
          Pegá el texto de la peulá o subí el PDF — extraemos los materiales, quién los trae y los links de inspiración.
        </p>

        <div className="tabs">
          <button className={"tab" + (mode === "texto" ? " active" : "")} onClick={() => setMode("texto")}>📝 Pegar texto</button>
          <button className={"tab" + (mode === "pdf" ? " active" : "")} onClick={() => setMode("pdf")}>📄 Subir PDF</button>
        </div>

        {mode === "pdf" ? (
          <div
            className={"dropzone" + (drag ? " drag" : "")}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
          >
            <div className="dropzone-icon">📄</div>
            <div className="dropzone-title">{filename ? filename : "Arrastrá el PDF o tocá para elegir"}</div>
            <div className="dropzone-hint">
              {filename ? <b>Listo para procesar</b> : <>Aceptamos planificaciones de <b>hasta 5 MB</b></>}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
            <div className="formats">
              <span className="format-badge">.pdf</span>
              <span className="format-badge">.docx</span>
              <span className="format-badge">.txt</span>
            </div>
          </div>
        ) : (
          <div className="textarea-wrap">
            <textarea
              placeholder="Pegá acá el texto de tu peulá... ej:&#10;&#10;APERTURA — recibimos a los janijim con un espiral gigante.&#10;Materiales: afiche blanco, marcador negro. Trae Sofi.&#10;..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="textarea-counter">{text.length} caracteres</div>
          </div>
        )}

        <button className="example-link" onClick={useExample}>↳ Probar con una peulá de ejemplo</button>

        <div className="cta-row">
          <span className="cta-helper">
            {ready ? "Todo listo — vamos a armar la lista" : "Pegá el texto o subí un archivo para continuar"}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            {hasSavedPeulot && (
              <button className="modal-btn modal-btn-ghost" onClick={onCancel}>← Volver</button>
            )}
            <button className="cta-primary" disabled={!ready} onClick={() => onSubmit({ text, filename })}>
              Armar lista de materiales →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Loading ----------
function LoadingScreen({ onDone }) {
  const [step, setStep] = useStateS(0);
  const [progress, setProgress] = useStateS(8);

  useEffectS(() => {
    const timers = [];
    LOADING_MSGS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setStep(i);
        setProgress(Math.round(((i + 1) / LOADING_MSGS.length) * 95));
      }, i * 650));
    });
    timers.push(setTimeout(() => {
      setProgress(100);
      setTimeout(onDone, 350);
    }, LOADING_MSGS.length * 650));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="loading-wrap">
      <div className="loading-card">
        <div className="loading-spinner">
          <div className="bubble b1"></div>
          <div className="bubble b2"></div>
          <div className="bubble b3"></div>
          <div className="bubble b4"></div>
        </div>
        <h2 className="loading-title">Procesando tu peulá</h2>
        <div key={step} className="loading-msg">{LOADING_MSGS[step]}</div>
        <div className="loading-progress">
          <div className="loading-progress-bar" style={{ width: progress + "%" }}></div>
        </div>
      </div>
    </div>
  );
}

// ---------- Home: folders + saved peulot ----------
const FOLDER_ICONS = ["📁", "🌱", "📚", "🎒", "✨", "🎨"];
const FOLDER_TINTS = ["", "rose", "mint", "lilac", "peach", "sky"];

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function PeulaCard({ peula, madrijim, onOpen, onDelete, onRename, onMove, folders }) {
  const [menuOpen, setMenuOpen] = useStateS(false);
  const wrapRef = useRefS(null);

  useEffectS(() => {
    if (!menuOpen) return;
    const close = (e) => { if (!wrapRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const total = peula.rows.length;
  const listos = peula.rows.filter(r => r.estado === "listo").length;
  const pct = total > 0 ? Math.round((listos / total) * 100) : 0;
  const involvedIds = [...new Set(peula.rows.map(r => r.quien).filter(Boolean))];
  const involved = involvedIds.map(id => madrijim.find(m => m.id === id)).filter(Boolean);

  return (
    <div className="peula-card" ref={wrapRef} onClick={() => onOpen(peula.id)}>
      <button className="peula-card-menu-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>⋯</button>
      {menuOpen && (
        <div className="peula-menu" onClick={(e) => e.stopPropagation()}>
          <button className="peula-menu-item" onClick={() => { const n = prompt("Nuevo nombre", peula.name); if (n) onRename(peula.id, n); setMenuOpen(false); }}>
            ✏️ Renombrar
          </button>
          {folders.length > 1 && (
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-faint)", padding: "8px 10px 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Mover a</div>
              {folders.filter(f => f.id !== peula.folderId).map(f => (
                <button key={f.id} className="peula-menu-item" onClick={() => { onMove(peula.id, f.id); setMenuOpen(false); }}>
                  <span>{f.icon}</span> {f.name}
                </button>
              ))}
            </div>
          )}
          <div style={{ height: 1, background: "var(--line)", margin: "4px 6px" }}></div>
          <button className="peula-menu-item danger" onClick={() => { if (confirm(`¿Eliminar "${peula.name}"?`)) onDelete(peula.id); setMenuOpen(false); }}>
            🗑 Eliminar
          </button>
        </div>
      )}

      <div className="pc-head">
        <div className="pc-title">{peula.name}</div>
      </div>
      <div className="pc-meta">
        <span><b>{total}</b> materiales</span>
        <span><b>{involved.length}</b> personas</span>
        <span style={{ marginLeft: "auto" }}>{timeAgo(peula.updatedAt)}</span>
      </div>
      <div className="pc-faces">
        {involved.slice(0, 5).map(m => <MadrijAvatar key={m.id} madrij={m} size="sm" />)}
        {involved.length > 5 && <span className="more">+{involved.length - 5}</span>}
      </div>
      <div>
        <div className="pc-bar"><div className="pc-bar-fill" style={{ width: pct + "%" }}></div></div>
        <div className="pc-bar-text" style={{ marginTop: 4 }}>
          <span>{listos}/{total} listos</span>
          <span>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ peulot, folders, madrijim, onOpenPeula, onNewPeula, onDeletePeula, onRenamePeula, onMovePeula, onAddFolder, onRenameFolder, onDeleteFolder }) {
  const [addingFolder, setAddingFolder] = useStateS(false);
  const [folderDraft, setFolderDraft] = useStateS("");
  const totalPeulot = peulot.length;
  const totalMaterials = peulot.reduce((s, p) => s + p.rows.length, 0);

  return (
    <div className="home-wrap">
      <div className="home-hero">
        <div>
          <div className="eyebrow">¡Hola, madrij/á!</div>
          <h1>Tus peulot guardadas</h1>
          <div className="sub">
            {totalPeulot === 0
              ? "Subí tu primera planificación para empezar a armar listas de materiales."
              : <>Tenés <b>{totalPeulot}</b> {totalPeulot === 1 ? "peulá" : "peulot"} con <b>{totalMaterials}</b> materiales en total.</>}
          </div>
        </div>
        <button className="cta-primary" onClick={onNewPeula}>+ Nueva peulá</button>
      </div>

      {folders.map(folder => {
        const inFolder = peulot.filter(p => p.folderId === folder.id);
        return (
          <div className="folder-section" key={folder.id}>
            <div className="folder-head">
              <div className={"folder-icon " + (folder.tint || "")}>{folder.icon}</div>
              <div className="folder-name">{folder.name}</div>
              <span className="folder-count">{inFolder.length}</span>
              {folder.id !== "default" && (
                <button
                  className="folder-menu-btn"
                  onClick={() => {
                    const n = prompt("Renombrar carpeta (vacío para eliminar)", folder.name);
                    if (n === null) return;
                    if (n.trim() === "") {
                      if (confirm(`Eliminar la carpeta "${folder.name}"? Las peulot vuelven a la carpeta principal.`)) onDeleteFolder(folder.id);
                    } else onRenameFolder(folder.id, n.trim());
                  }}
                  title="Editar carpeta"
                >⋯</button>
              )}
            </div>
            <div className="peulot-grid">
              {folder.id === folders[0].id && (
                <button className="peula-card-new" onClick={onNewPeula}>
                  <span className="plus-circle">+</span>
                  <span className="pcn-title">Nueva peulá</span>
                  <span className="pcn-sub">Subí PDF o pegá texto</span>
                </button>
              )}
              {inFolder.length === 0 && folder.id !== folders[0].id && (
                <div className="peula-card-empty">Carpeta vacía — movés peulot acá desde el menú ⋯</div>
              )}
              {inFolder
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map(p => (
                  <PeulaCard
                    key={p.id}
                    peula={p}
                    madrijim={madrijim}
                    folders={folders}
                    onOpen={onOpenPeula}
                    onDelete={onDeletePeula}
                    onRename={onRenamePeula}
                    onMove={onMovePeula}
                  />
                ))}
            </div>
          </div>
        );
      })}

      {addingFolder ? (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <input
            autoFocus
            className="madrij-menu-input"
            style={{ maxWidth: 280 }}
            value={folderDraft}
            onChange={(e) => setFolderDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { if (folderDraft.trim()) onAddFolder(folderDraft.trim()); setFolderDraft(""); setAddingFolder(false); }
              if (e.key === "Escape") { setFolderDraft(""); setAddingFolder(false); }
            }}
            placeholder="Nombre de la carpeta (ej. Majané verano)"
          />
          <button className="modal-btn modal-btn-ghost" onClick={() => { setAddingFolder(false); setFolderDraft(""); }}>Cancelar</button>
        </div>
      ) : (
        <button className="new-folder-btn" onClick={() => setAddingFolder(true)}>
          📁 + Nueva carpeta
        </button>
      )}
    </div>
  );
}

Object.assign(window, {
  SAMPLE_PEULA_TEXT, LOADING_MSGS, FOLDER_ICONS, FOLDER_TINTS,
  UploadScreen, LoadingScreen, HomeScreen, timeAgo,
});


// ----- table.jsx -----
// Table screen + editable cells + chips + links + status pill
const { useState: useStateT, useEffect: useEffectT, useRef: useRefT, useMemo: useMemoT } = React;

const ESTADO_LABELS = {
  porhacer: "Por hacer",
  comprar: "Comprar",
  imprimir: "Imprimir",
  llevar: "Llevar",
  listo: "✓ Listo",
};
const ESTADO_ORDER = ["porhacer", "comprar", "imprimir", "llevar", "listo"];
const ESTADO_DOT_VAR = {
  porhacer: "butter-deep",
  comprar: "sky-deep",
  imprimir: "lilac-deep",
  llevar: "peach-deep",
  listo: "mint-deep",
};

const uid = () => "r" + Math.random().toString(36).slice(2, 9);

// ---------- EditableCell ----------
function EditableCell({ value, onChange, placeholder, className = "", multiline = false }) {
  const ref = useRefT(null);
  const [editing, setEditing] = useStateT(false);

  const start = () => {
    setEditing(true);
    setTimeout(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 0);
  };
  const commit = () => {
    const v = ref.current?.innerText.trim() ?? "";
    onChange(v);
    setEditing(false);
  };
  const onKey = (e) => {
    if (!multiline && e.key === "Enter") { e.preventDefault(); ref.current.blur(); }
    if (e.key === "Escape") { ref.current.innerText = value; ref.current.blur(); }
  };

  return (
    <span
      ref={ref}
      className={"cell-edit " + className + (editing ? " editing" : "") + (!value ? " cell-empty" : "")}
      contentEditable
      suppressContentEditableWarning
      onFocus={start}
      onBlur={commit}
      onKeyDown={onKey}
    >
      {value || placeholder || "—"}
    </span>
  );
}

// ---------- ChipsCell ----------
function ChipsCell({ items, onChange }) {
  const [adding, setAdding] = useStateT(false);
  const [draft, setDraft] = useStateT("");
  const inputRef = useRefT(null);

  useEffectT(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const add = () => {
    const v = draft.trim();
    if (v) onChange([...items, v]);
    setDraft("");
    setAdding(false);
  };
  const removeAt = (i) => onChange(items.filter((_, idx) => idx !== i));
  const editAt = (i, v) => {
    const next = [...items];
    next[i] = v;
    onChange(next.filter(Boolean));
  };

  return (
    <div className="chips">
      {items.map((c, i) => (
        <span className="chip" key={i}>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => editAt(i, e.currentTarget.innerText.trim())}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
          >{c}</span>
          <button className="chip-x" onClick={() => removeAt(i)} title="Quitar">×</button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          className="chip-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
            if (e.key === "Escape") { setDraft(""); setAdding(false); }
          }}
          placeholder="nuevo..."
        />
      ) : (
        <button className="chip-add" onClick={() => setAdding(true)}>+ sub-material</button>
      )}
    </div>
  );
}

// ---------- LinksCell ----------
function LinksCell({ items, onChange }) {
  const [adding, setAdding] = useStateT(false);
  const [draft, setDraft] = useStateT("");
  const inputRef = useRefT(null);
  useEffectT(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const labelOf = (url) => {
    try {
      const u = new URL(url.startsWith("http") ? url : "https://" + url);
      return u.hostname.replace("www.", "");
    } catch { return url; }
  };
  const add = () => {
    const v = draft.trim();
    if (v) {
      const url = v.startsWith("http") ? v : "https://" + v;
      onChange([...items, { url, label: labelOf(v) }]);
    }
    setDraft("");
    setAdding(false);
  };
  const removeAt = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="linkpills">
      {items.length === 0 && !adding && (<span className="linkpill-empty">—</span>)}
      {items.map((l, i) => (
        <span className="linkpill" key={i} style={{ position: "relative" }}>
          <span className="linkpill-icon">🔗</span>
          <a href={l.url} target="_blank" rel="noreferrer" className="linkpill-text" onClick={(e) => e.stopPropagation()}>
            {l.label}
          </a>
          <button className="chip-x" onClick={() => removeAt(i)} style={{ opacity: 1, marginLeft: 2 }}>×</button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          className="chip-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
            if (e.key === "Escape") { setDraft(""); setAdding(false); }
          }}
          placeholder="pegá link..."
          style={{ width: 130 }}
        />
      ) : (
        <button className="chip-add" onClick={() => setAdding(true)}>+ link</button>
      )}
    </div>
  );
}

// ---------- StatusPill ----------
function StatusPill({ value, onChange }) {
  const [open, setOpen] = useStateT(false);
  const wrapRef = useRefT(null);

  useEffectT(() => {
    if (!open) return;
    const close = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <span ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button className={"status-pill status-" + value} onClick={() => setOpen(!open)}>
        <span className="dot"></span>
        {ESTADO_LABELS[value]}
        <span className="caret">▼</span>
      </button>
      {open && (
        <div className="status-menu">
          {ESTADO_ORDER.map((k) => (
            <button key={k} className="status-menu-item" onClick={() => { onChange(k); setOpen(false); }}>
              <span className="dot" style={{ background: `var(--${ESTADO_DOT_VAR[k]})` }}></span>
              {ESTADO_LABELS[k]}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

// ---------- TableScreen ----------
function TableScreen({ peula, onUpdate, madrijim, onAddMadrij }) {
  const [toast, setToast] = useStateT(null);
  const [modalOpen, setModalOpen] = useStateT(false);
  const [modalMadrijId, setModalMadrijId] = useStateT(null);

  const rows = peula.rows;
  const setRows = (next) => onUpdate({ ...peula, rows: typeof next === "function" ? next(rows) : next });

  const updateRow = (id, patch) => setRows(rows.map(r => r.id === id ? { ...r, ...patch } : r));
  const deleteRow = (id) => setRows(rows.filter(r => r.id !== id));
  const addRow = () => setRows([...rows, {
    id: uid(), momento: "", material: "", cantidad: "1", quien: null, como: [], links: [], estado: "porhacer",
  }]);

  const counts = useMemoT(() => {
    const c = { porhacer: 0, comprar: 0, imprimir: 0, llevar: 0, listo: 0 };
    rows.forEach(r => { c[r.estado] = (c[r.estado] || 0) + 1; });
    return c;
  }, [rows]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const copyTable = async () => {
    const header = "Momento\tMaterial\tCantidad\tQuién trae\tCómo conseguirlo\tLinks\tEstado";
    const nameOf = (id) => madrijim.find(m => m.id === id)?.name || "";
    const body = rows.map(r => [
      r.momento, r.material, r.cantidad, nameOf(r.quien),
      r.como.join(", "), r.links.map(l => l.url).join(", "), ESTADO_LABELS[r.estado],
    ].join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(header + "\n" + body);
      showToast("Tabla copiada al portapapeles");
    } catch { showToast("No se pudo copiar"); }
  };
  const exportSheets = () => showToast("Abriendo Google Sheets...");

  const openExportFor = (madrijId) => {
    setModalMadrijId(madrijId);
    setModalOpen(true);
  };

  return (
    <div className="table-screen">
      <div className="table-header">
        <div>
          <div>
            <span className="peula-tag">📋 {peula.name}</span>
          </div>
          <h1 style={{ marginTop: 8 }}>Lista de materiales</h1>
          <div className="sub">Tocá cualquier celda para editar. Se guarda automáticamente.</div>
        </div>
        <div className="summary-pills">
          <span className="summary-pill"><span className="dot" style={{ background: "var(--butter-deep)" }}></span>Por hacer<span className="count">{counts.porhacer}</span></span>
          <span className="summary-pill"><span className="dot" style={{ background: "var(--sky-deep)" }}></span>Comprar<span className="count">{counts.comprar}</span></span>
          <span className="summary-pill"><span className="dot" style={{ background: "var(--lilac-deep)" }}></span>Imprimir<span className="count">{counts.imprimir}</span></span>
          <span className="summary-pill"><span className="dot" style={{ background: "var(--peach-deep)" }}></span>Llevar<span className="count">{counts.llevar}</span></span>
          <span className="summary-pill"><span className="dot" style={{ background: "var(--mint-deep)" }}></span>Listo<span className="count">{counts.listo}</span></span>
        </div>
      </div>

      <MadrijTracker
        madrijim={madrijim}
        rows={rows}
        activeId={modalMadrijId}
        onOpenExport={openExportFor}
      />

      <div className="table-card">
        <table className="materials-table">
          <thead>
            <tr>
              <th style={{ width: "13%" }}>Momento</th>
              <th style={{ width: "18%" }}>Material</th>
              <th style={{ width: "7%" }}>Cant.</th>
              <th style={{ width: "11%" }}>Quién trae</th>
              <th style={{ width: "21%" }}>Cómo conseguirlo</th>
              <th style={{ width: "15%" }}>Links de inspiración</th>
              <th style={{ width: "15%" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={"row-" + r.estado}>
                <td data-label="Momento" className="cell-momento">
                  <EditableCell value={r.momento} onChange={(v) => updateRow(r.id, { momento: v })} placeholder="ej. Apertura" />
                </td>
                <td data-label="Material" className="cell-material">
                  <EditableCell value={r.material} onChange={(v) => updateRow(r.id, { material: v })} placeholder="describí el material" />
                </td>
                <td data-label="Cant." className="cell-cantidad">
                  <EditableCell value={r.cantidad} onChange={(v) => updateRow(r.id, { cantidad: v })} placeholder="—" />
                </td>
                <td data-label="Quién trae">
                  <MadrijSelect
                    value={r.quien}
                    onChange={(v) => updateRow(r.id, { quien: v })}
                    madrijim={madrijim}
                    onAddMadrij={onAddMadrij}
                  />
                </td>
                <td data-label="Cómo conseguirlo">
                  <ChipsCell items={r.como} onChange={(items) => updateRow(r.id, { como: items })} />
                </td>
                <td data-label="Links">
                  <LinksCell items={r.links} onChange={(items) => updateRow(r.id, { links: items })} />
                </td>
                <td data-label="Estado" className="status-cell">
                  <StatusPill value={r.estado} onChange={(v) => updateRow(r.id, { estado: v })} />
                  <button className="row-delete" onClick={() => deleteRow(r.id)} title="Eliminar fila" aria-label="Eliminar fila">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 4h10M6 4V2.5h4V4M5 4l.6 9a1 1 0 0 0 1 1h2.8a1 1 0 0 0 1-1L11 4M7 7v5M9 7v5"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="add-row-wrap">
          <button className="add-row-btn" onClick={addRow}>
            <span className="plus">+</span> Agregar material
          </button>
        </div>
      </div>

      <ExportBar rows={rows} onCopy={copyTable} onSheets={exportSheets} />

      <MadrijExportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        madrijim={madrijim}
        rows={rows}
        initialMadrijId={modalMadrijId}
        showToast={showToast}
      />

      {toast && (
        <div className="toast">
          <span className="check">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function ExportBar({ rows, onCopy, onSheets }) {
  const total = rows.length;
  const listos = rows.filter(r => r.estado === "listo").length;
  return (
    <div className="export-bar">
      <div className="export-stats">
        <div><span className="label">Total</span>{total}</div>
        <div className="sep"></div>
        <div><span className="label">Listos</span>{listos}/{total}</div>
      </div>
      <button className="export-btn export-btn-secondary" onClick={onCopy}>
        <span style={{ fontSize: 14 }}>⧉</span> Copiar tabla
      </button>
      <button className="export-btn export-btn-primary" onClick={onSheets}>
        <span className="gicon">G</span> Exportar a Google Sheets
      </button>
    </div>
  );
}

Object.assign(window, {
  ESTADO_LABELS, ESTADO_ORDER, ESTADO_DOT_VAR, uid,
  EditableCell, ChipsCell, LinksCell, StatusPill, TableScreen, ExportBar,
});


// ----- app.jsx -----
// Materiales BH — top-level app with persistence + folders + madrijim roster
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

const STORAGE_KEY = "materiales-bh-v2";

// ---------- Seed data (first visit) ----------
const seedRows = () => ([
  {
    id: "r1", momento: "Apertura", material: "Espiral gigante", cantidad: "1",
    quien: "m_sofi",
    como: ["Afiche blanco", "Marcador negro"],
    links: [],
    estado: "listo",
  },
  {
    id: "r2", momento: "Instancia 1", material: "Tablero de juego", cantidad: "1",
    quien: "m_tomas",
    como: ["Cartulina grande", "6 marcadores de colores", "Regla"],
    links: [{ url: "https://pinterest.com/pin/tablero-gigante", label: "pinterest.com" }],
    estado: "porhacer",
  },
  {
    id: "r3", momento: "Instancia 2", material: "Tarjetas memotest", cantidad: "12",
    quien: "m_luli",
    como: ["Imprimir en cartulina", "Plastificar", "Recortar"],
    links: [{ url: "https://pinterest.com/pin/memotest-valores", label: "pinterest.com" }],
    estado: "imprimir",
  },
  {
    id: "r4", momento: "Instancia 3", material: "Vasitos transparentes", cantidad: "6",
    quien: "m_nico",
    como: ["Comprar en kiosco"],
    links: [],
    estado: "comprar",
  },
  {
    id: "r5", momento: "Cierre", material: "Caja con lámina transparente", cantidad: "1",
    quien: "m_dana",
    como: ["Caja de cartón", "Nylon film", "Cutter"],
    links: [],
    estado: "porhacer",
  },
]);

const SEED = () => ({
  madrijim: DEFAULT_MADRIJIM,
  folders: [
    { id: "default",  name: "Peulot activas",  icon: "🌱", tint: "mint" },
    { id: "majane",   name: "Majané 2026",     icon: "🎒", tint: "peach" },
    { id: "archivo",  name: "Archivo",         icon: "📚", tint: "sand" },
  ],
  peulot: [
    {
      id: "p_seed_1",
      name: '"El espejo y la espiral"',
      folderId: "default",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      rows: seedRows(),
    },
    {
      id: "p_seed_2",
      name: '"Pésaj y la libertad"',
      folderId: "default",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      rows: [
        { id: "ra", momento: "Apertura", material: "Cartelitos de plagas", cantidad: "10", quien: "m_juli", como: ["Hojas A4", "Marcadores"], links: [], estado: "listo" },
        { id: "rb", momento: "Instancia 1", material: "Bandeja de seder", cantidad: "1", quien: "m_mati", como: ["Bandeja", "Símbolos impresos"], links: [], estado: "comprar" },
        { id: "rc", momento: "Cierre", material: "Velas de cierre", cantidad: "4", quien: "m_sofi", como: ["Velas blancas"], links: [], estado: "llevar" },
      ],
    },
    {
      id: "p_seed_3",
      name: '"Tikún olam — el mundo que queremos"',
      folderId: "archivo",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      rows: [
        { id: "rd", momento: "Apertura", material: "Mapa del mundo", cantidad: "1", quien: "m_dana", como: ["Mapa político", "Stickers"], links: [], estado: "listo" },
        { id: "re", momento: "Cierre", material: "Frasco de los deseos", cantidad: "1", quien: "m_nico", como: ["Frasco vidrio", "Papelitos"], links: [], estado: "listo" },
      ],
    },
  ],
});

// ---------- Topbar ----------
function Topbar({ onHome, breadcrumb }) {
  return (
    <header className="topbar">
      <div className="brand" onClick={onHome} style={{ cursor: "pointer" }}>
        <div className="brand-mark">🌱</div>
        <div>
          Materiales BH<span className="brand-sparkle">✨</span>
        </div>
      </div>
      <div className="topbar-meta">
        {breadcrumb && (
          <button className="tab" style={{ background: "var(--paper)", border: "1px solid var(--line)" }} onClick={onHome}>
            ← {breadcrumb}
          </button>
        )}
        <span className="url-pill">materiales.bethilel.org</span>
      </div>
    </header>
  );
}

// ---------- Persistence ----------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED();
    const parsed = JSON.parse(raw);
    if (!parsed.folders || !parsed.peulot || !parsed.madrijim) return SEED();
    return parsed;
  } catch { return SEED(); }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

// ---------- App ----------
function App() {
  const [state, setState] = useStateA(loadState);
  const [phase, setPhase] = useStateA("home"); // home | upload | loading | table
  const [activePeulaId, setActivePeulaId] = useStateA(null);
  const [pendingPeulaName, setPendingPeulaName] = useStateA(null);

  // Persist on every change
  useEffectA(() => { saveState(state); }, [state]);

  const { madrijim, folders, peulot } = state;
  const activePeula = peulot.find(p => p.id === activePeulaId);

  // ---- madrijim ----
  const addMadrij = (name) => {
    const id = "m_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Math.random().toString(36).slice(2, 5);
    const color = madrijim.length % MADRIJ_PALETTE.length;
    setState(s => ({ ...s, madrijim: [...s.madrijim, { id, name, color }] }));
    return id;
  };

  // ---- folders ----
  const addFolder = (name) => {
    const id = "f_" + Math.random().toString(36).slice(2, 8);
    const icons = ["📁", "✨", "🎨", "🎒", "📚", "🌱"];
    const tints = ["lilac", "rose", "sky", "peach", "mint", ""];
    const idx = folders.length;
    setState(s => ({ ...s, folders: [...s.folders, { id, name, icon: icons[idx % icons.length], tint: tints[idx % tints.length] }] }));
  };
  const renameFolder = (id, name) => setState(s => ({ ...s, folders: s.folders.map(f => f.id === id ? { ...f, name } : f) }));
  const deleteFolder = (id) => setState(s => ({
    ...s,
    folders: s.folders.filter(f => f.id !== id),
    peulot: s.peulot.map(p => p.folderId === id ? { ...p, folderId: s.folders[0].id } : p),
  }));

  // ---- peulot ----
  const openPeula = (id) => { setActivePeulaId(id); setPhase("table"); };
  const updatePeula = (next) => setState(s => ({
    ...s,
    peulot: s.peulot.map(p => p.id === next.id ? { ...next, updatedAt: new Date().toISOString() } : p),
  }));
  const deletePeula = (id) => setState(s => ({ ...s, peulot: s.peulot.filter(p => p.id !== id) }));
  const renamePeula = (id, name) => setState(s => ({
    ...s, peulot: s.peulot.map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p),
  }));
  const movePeula = (id, folderId) => setState(s => ({
    ...s, peulot: s.peulot.map(p => p.id === id ? { ...p, folderId } : p),
  }));

  // ---- flow ----
  const goNewPeula = () => setPhase("upload");
  const goHome = () => { setPhase("home"); setActivePeulaId(null); };

  const handleSubmit = ({ text, filename }) => {
    let name = "Peulá sin título";
    if (filename) name = filename.replace(/\.[^.]+$/, "");
    else if (text) {
      const m = text.match(/peul[áa]:?\s*"?([^"\n]+)"?/i);
      if (m) name = m[1].trim();
    }
    setPendingPeulaName(name);
    setPhase("loading");
  };

  const finalizeLoading = () => {
    // create a new peula with "parsed" rows (we reuse seedRows as the demo extraction)
    const id = "p_" + Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();
    const newPeula = {
      id,
      name: pendingPeulaName || "Peulá sin título",
      folderId: folders[0].id,
      createdAt: now,
      updatedAt: now,
      rows: seedRows().map(r => ({ ...r, id: uid() })),
    };
    setState(s => ({ ...s, peulot: [newPeula, ...s.peulot] }));
    setActivePeulaId(id);
    setPhase("table");
  };

  const hasSaved = peulot.length > 0;

  return (
    <div className="app">
      <Topbar
        onHome={goHome}
        breadcrumb={
          phase === "table" ? "Volver al inicio" :
          phase === "upload" && hasSaved ? "Volver al inicio" : null
        }
      />
      {phase === "home" && (
        <HomeScreen
          peulot={peulot}
          folders={folders}
          madrijim={madrijim}
          onOpenPeula={openPeula}
          onNewPeula={goNewPeula}
          onDeletePeula={deletePeula}
          onRenamePeula={renamePeula}
          onMovePeula={movePeula}
          onAddFolder={addFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
        />
      )}
      {phase === "upload" && (
        <UploadScreen
          onSubmit={handleSubmit}
          onCancel={goHome}
          hasSavedPeulot={hasSaved}
        />
      )}
      {phase === "loading" && <LoadingScreen onDone={finalizeLoading} />}
      {phase === "table" && activePeula && (
        <TableScreen
          peula={activePeula}
          onUpdate={updatePeula}
          madrijim={madrijim}
          onAddMadrij={addMadrij}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
