// Madrij utilities + selector + tracker + per-madrij export modal
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM, useMemo: useMemoM } = React;

// ---------- Roster + colors ----------
const MADRIJ_PALETTE = [
  { bg: "#F8C3C7", fg: "#7A1F26" }, // rose
  { bg: "#FFE3A0", fg: "#6B4F0E" }, // butter
  { bg: "#C5E5B8", fg: "#2D5C1F" }, // mint
  { bg: "#D9CCEF", fg: "#4A3373" }, // lilac
  { bg: "#FFCDA8", fg: "#7A3D14" }, // peach
  { bg: "#C5DDF1", fg: "#1F4E7A" }, // sky
  { bg: "#FBD8E8", fg: "#7A2554" }, // pink
  { bg: "#E5DDC8", fg: "#4D3F1F" }, // sand
];

const DEFAULT_MADRIJIM = [
  { id: "m_sofi",  name: "Sofi",  color: 0 },
  { id: "m_tomas", name: "Tomás", color: 2 },
  { id: "m_luli",  name: "Luli",  color: 1 },
  { id: "m_nico",  name: "Nico",  color: 3 },
  { id: "m_dana",  name: "Dana",  color: 4 },
  { id: "m_mati",  name: "Mati",  color: 5 },
  { id: "m_juli",  name: "Juli",  color: 6 },
];

function initialsOf(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function MadrijAvatar({ madrij, size = "md" }) {
  if (!madrij) return null;
  const c = MADRIJ_PALETTE[madrij.color % MADRIJ_PALETTE.length];
  return (
    <span
      className={"madrij-avatar " + (size === "sm" ? "sm" : size === "lg" ? "lg" : "")}
      style={{ background: c.bg, color: c.fg }}
      title={madrij.name}
    >
      {initialsOf(madrij.name)}
    </span>
  );
}

// ---------- Single-select dropdown for "Quién trae" ----------
function MadrijSelect({ value, onChange, madrijim, onAddMadrij }) {
  const [open, setOpen] = useStateM(false);
  const [adding, setAdding] = useStateM(false);
  const [draft, setDraft] = useStateM("");
  const wrapRef = useRefM(null);
  const inputRef = useRefM(null);

  useEffectM(() => {
    if (!open) return;
    const close = (e) => {
      if (!wrapRef.current?.contains(e.target)) {
        setOpen(false); setAdding(false); setDraft("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffectM(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const selected = madrijim.find(m => m.id === value);

  const submitNew = () => {
    const name = draft.trim();
    if (!name) { setAdding(false); return; }
    const id = onAddMadrij(name);
    onChange(id);
    setOpen(false); setAdding(false); setDraft("");
  };

  return (
    <span ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        className={"madrij-cell" + (selected ? "" : " empty")}
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <>
            <MadrijAvatar madrij={selected} size="sm" />
            <span className="madrij-name">{selected.name}</span>
            <span className="caret">▼</span>
          </>
        ) : (
          <>+ asignar</>
        )}
      </button>
      {open && (
        <div className="madrij-menu">
          {madrijim.map(m => (
            <button
              key={m.id}
              className={"madrij-menu-item" + (m.id === value ? " active" : "")}
              onClick={() => { onChange(m.id); setOpen(false); }}
            >
              <MadrijAvatar madrij={m} size="sm" />
              <span>{m.name}</span>
            </button>
          ))}
          {value && (
            <>
              <div className="madrij-menu-divider"></div>
              <button className="madrij-menu-clear" onClick={() => { onChange(null); setOpen(false); }}>
                Quitar asignación
              </button>
            </>
          )}
          <div className="madrij-menu-divider"></div>
          {adding ? (
            <input
              ref={inputRef}
              className="madrij-menu-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submitNew}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNew();
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              placeholder="Nombre del nuevo madrij/á"
            />
          ) : (
            <button className="madrij-menu-add" onClick={() => setAdding(true)}>
              <span className="add-circle">+</span>
              Agregar madrij/á al equipo
            </button>
          )}
        </div>
      )}
    </span>
  );
}

// ---------- Tracker strip above the table ----------
function MadrijTracker({ madrijim, rows, activeId, onSelect, onOpenExport }) {
  const counts = useMemoM(() => {
    const c = {};
    rows.forEach(r => {
      const k = r.quien || "__unassigned__";
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [rows]);

  const pendingByMadrij = useMemoM(() => {
    const p = {};
    rows.forEach(r => {
      if (r.estado !== "listo") {
        const k = r.quien || "__unassigned__";
        p[k] = (p[k] || 0) + 1;
      }
    });
    return p;
  }, [rows]);

  const ordered = madrijim
    .filter(m => counts[m.id])
    .sort((a, b) => counts[b.id] - counts[a.id]);
  const unassigned = counts["__unassigned__"] || 0;

  return (
    <div className="madrij-tracker">
      <span className="madrij-tracker-label">Carga</span>
      {ordered.length === 0 && unassigned === 0 && (
        <span style={{ color: "var(--ink-faint)", fontSize: 13, fontStyle: "italic" }}>
          Asigná cada material a un madrij/á para hacer el seguimiento.
        </span>
      )}
      {ordered.map(m => (
        <button
          key={m.id}
          className={"madrij-track-chip" + (activeId === m.id ? " active" : "")}
          onClick={() => onOpenExport(m.id)}
          title={`Ver lista de ${m.name}`}
        >
          <MadrijAvatar madrij={m} size="sm" />
          <span>{m.name}</span>
          <span className="track-count">{counts[m.id]}</span>
          {pendingByMadrij[m.id] > 0 && <span className="pending-dot" title={`${pendingByMadrij[m.id]} pendientes`}></span>}
        </button>
      ))}
      {unassigned > 0 && (
        <span className="madrij-track-chip unassigned" title="Materiales sin asignar">
          <span style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px dashed var(--ink-faint)", display: "inline-block" }}></span>
          <span>Sin asignar</span>
          <span className="track-count">{unassigned}</span>
        </span>
      )}
      <button className="tracker-action" onClick={() => onOpenExport("all")}>
        📋 Listas individuales
      </button>
    </div>
  );
}

// ---------- Per-madrij export modal ----------
function MadrijExportModal({ open, onClose, madrijim, rows, initialMadrijId, showToast }) {
  const [activeId, setActiveId] = useStateM(initialMadrijId || (madrijim[0] && madrijim[0].id));

  useEffectM(() => {
    if (open && initialMadrijId && initialMadrijId !== "all") setActiveId(initialMadrijId);
    else if (open && initialMadrijId === "all") {
      // pick the madrij with most assignments
      const counts = {};
      rows.forEach(r => { if (r.quien) counts[r.quien] = (counts[r.quien] || 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (top) setActiveId(top[0]);
    }
  }, [open, initialMadrijId]);

  if (!open) return null;

  const counts = {};
  rows.forEach(r => { if (r.quien) counts[r.quien] = (counts[r.quien] || 0) + 1; });
  const assigned = madrijim.filter(m => counts[m.id]);

  const active = madrijim.find(m => m.id === activeId);
  const items = active ? rows.filter(r => r.quien === active.id) : [];
  const pending = items.filter(i => i.estado !== "listo").length;

  const buildText = () => {
    if (!active) return "";
    const lines = [];
    lines.push(`Lista de materiales para ${active.name} ✨`);
    lines.push("");
    items.forEach((r, i) => {
      const estadoLabel = window.ESTADO_LABELS[r.estado];
      lines.push(`${i + 1}. ${r.material} (x${r.cantidad}) — ${estadoLabel}`);
      if (r.momento) lines.push(`   Momento: ${r.momento}`);
      if (r.como.length) {
        lines.push(`   Necesita:`);
        r.como.forEach(s => lines.push(`     • ${s}`));
      }
      if (r.links.length) {
        lines.push(`   Inspiración: ${r.links.map(l => l.url).join(", ")}`);
      }
      lines.push("");
    });
    return lines.join("\n");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildText());
      showToast(`Lista de ${active.name} copiada`);
    } catch { showToast("No se pudo copiar"); }
  };

  const wa = () => {
    const text = encodeURIComponent(buildText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const printIt = () => window.print();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          {active && <MadrijAvatar madrij={active} size="lg" />}
          <div>
            <h2 className="title">Lista para {active ? active.name : "..."}</h2>
            <div className="sub">
              {items.length} {items.length === 1 ? "material" : "materiales"}
              {pending > 0 && ` · ${pending} ${pending === 1 ? "pendiente" : "pendientes"}`}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {assigned.length > 1 && (
          <div style={{ padding: "10px 24px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {assigned.map(m => (
              <button
                key={m.id}
                className={"madrij-track-chip" + (m.id === activeId ? " active" : "")}
                onClick={() => setActiveId(m.id)}
                style={{ fontSize: 12 }}
              >
                <MadrijAvatar madrij={m} size="sm" />
                <span>{m.name}</span>
                <span className="track-count">{counts[m.id]}</span>
              </button>
            ))}
          </div>
        )}

        <div className="modal-body">
          {items.length === 0 && (
            <div className="export-empty">
              {active ? `${active.name} todavía no tiene materiales asignados.` : "Sin madrij/á seleccionadx."}
            </div>
          )}
          {items.map((r, idx) => (
            <div key={r.id} className="export-item">
              <div className="export-item-head">
                <div>
                  <div className="export-item-name">{r.material || "(sin nombre)"}</div>
                  {r.momento && <div className="export-item-moment">{r.momento}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="export-item-qty">x{r.cantidad || "—"}</span>
                  <span className={"status-pill status-" + r.estado} style={{ pointerEvents: "none", fontSize: 11, padding: "3px 8px" }}>
                    <span className="dot"></span>
                    {window.ESTADO_LABELS[r.estado]}
                  </span>
                </div>
              </div>
              {r.como.length > 0 ? (
                <>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 700, marginBottom: 4 }}>Necesitás conseguir:</div>
                  <ul className="export-item-list">
                    {r.como.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </>
              ) : (
                <div style={{ fontSize: 12, color: "var(--ink-faint)", fontStyle: "italic" }}>
                  Sin sub-materiales — agregalos desde la tabla.
                </div>
              )}
              {r.links.length > 0 && (
                <div className="export-item-links">
                  {r.links.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noreferrer" className="linkpill">
                      <span className="linkpill-icon">🔗</span>
                      <span className="linkpill-text">{l.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-foot">
          <button className="modal-btn modal-btn-ghost grow" onClick={printIt}>
            🖨 Imprimir
          </button>
          <button className="modal-btn modal-btn-wa grow" onClick={wa}>
            💬 WhatsApp
          </button>
          <button className="modal-btn modal-btn-primary grow" onClick={copy}>
            ⧉ Copiar
          </button>
        </div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, {
  MADRIJ_PALETTE, DEFAULT_MADRIJIM, initialsOf,
  MadrijAvatar, MadrijSelect, MadrijTracker, MadrijExportModal,
});
