import { useState, useEffect } from "react";

// ─── PALETTE & DESIGN TOKENS ───────────────────────────────────────────────
const C = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  ink: "#1A1410",
  muted: "#8A7E74",
  accent: "#C4622D",
  accentLight: "#F5E6DC",
  green: "#4A7C59",
  greenLight: "#E4F0E8",
  blue: "#2D5F8A",
  blueLight: "#DDE9F5",
  yellow: "#D4A017",
  yellowLight: "#FBF3DC",
  border: "#E8E0D5",
  shadow: "0 2px 12px rgba(26,20,16,0.07)",
};

const BLOCKS = [
  { id: "manana", label: "Mañana libre", hours: "8:30–10:30", color: C.blueLight, dot: C.blue },
  { id: "mediodia", label: "Vuelta del jardín", hours: "11:00–13:30", color: C.greenLight, dot: C.green },
  { id: "siesta", label: "Siesta de Vicky", hours: "13:30–16:00", color: C.yellowLight, dot: C.yellow },
  { id: "tarde", label: "Antes del entreno", hours: "16:30–18:00", color: C.accentLight, dot: C.accent },
];

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const FULLDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const ENTRENOS = {
  0: "🏐 Vóley 18:30",
  1: "🏋️ Gimnasio 18:00",
  2: "🏐 Vóley 18:30",
  3: "🏋️ Gimnasio 18:00 · 🏐 Vóley después",
};

const IDEA_CATS = ["Estudio", "Casa", "Victoria", "Personal", "Compras", "Otro"];
const MENUS_INIT = Array(7).fill("").map(() => ({ almuerzo: "", cena: "" }));

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── STORAGE ───────────────────────────────────────────────────────────────
function useLocalState(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : (typeof init === "function" ? init() : init);
    } catch { return typeof init === "function" ? init() : init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function Badge({ color, bg, children }) {
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 700,
      padding: "2px 8px", borderRadius: 99, letterSpacing: 0.5,
      textTransform: "uppercase", fontFamily: "inherit"
    }}>{children}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, boxShadow: C.shadow,
      border: `1px solid ${C.border}`, padding: "20px 22px",
      ...style
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif", fontSize: 22,
      color: C.ink, margin: "0 0 16px", fontWeight: 700
    }}>{children}</h2>
  );
}

// ─── TAB: HOY ─────────────────────────────────────────────────────────────

function TabHoy({ recordatorios, setRecordatorios, blockTasks, setBlockTasks }) {
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const entreno = ENTRENOS[todayIdx];

  const [newTask, setNewTask] = useState({});
  const [newRec, setNewRec] = useState({ texto: "", hora: "" });

  function addTask(blockId) {
    const t = newTask[blockId];
    if (!t?.trim()) return;
    setBlockTasks(prev => ({
      ...prev,
      [blockId]: [...(prev[blockId] || []), { id: generateId(), texto: t, done: false }]
    }));
    setNewTask(p => ({ ...p, [blockId]: "" }));
  }

  function toggleTask(blockId, id) {
    setBlockTasks(prev => ({
      ...prev,
      [blockId]: prev[blockId].map(t => t.id === id ? { ...t, done: !t.done } : t)
    }));
  }

  function removeTask(blockId, id) {
    setBlockTasks(prev => ({
      ...prev,
      [blockId]: prev[blockId].filter(t => t.id !== id)
    }));
  }

  function addRec() {
    if (!newRec.texto.trim()) return;
    setRecordatorios(prev => [...prev, { id: generateId(), ...newRec, done: false }]);
    setNewRec({ texto: "", hora: "" });
  }

  function toggleRec(id) {
    setRecordatorios(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  }

  function removeRec(id) {
    setRecordatorios(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Encabezado del día */}
      <Card style={{ background: C.ink, color: "#fff", border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700 }}>
              {FULLDAYS[todayIdx]}
            </div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>
              {new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          {entreno && (
            <div style={{
              background: "rgba(255,255,255,0.12)", borderRadius: 12,
              padding: "8px 14px", fontSize: 13, fontWeight: 600, textAlign: "right"
            }}>{entreno}</div>
          )}
        </div>
      </Card>

      {/* Bloques del día */}
      {BLOCKS.map(block => (
        <Card key={block.id} style={{ borderLeft: `4px solid ${block.dot}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: block.dot, flexShrink: 0
            }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{block.label}</span>
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 2 }}>{block.hours}</span>
          </div>

          {(blockTasks[block.id] || []).map(t => (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 6, opacity: t.done ? 0.45 : 1
            }}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(block.id, t.id)}
                style={{ accentColor: block.dot, width: 16, height: 16, cursor: "pointer" }} />
              <span style={{
                fontSize: 14, color: C.ink, flex: 1,
                textDecoration: t.done ? "line-through" : "none"
              }}>{t.texto}</span>
              <button onClick={() => removeTask(block.id, t.id)}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={newTask[block.id] || ""}
              onChange={e => setNewTask(p => ({ ...p, [block.id]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addTask(block.id)}
              placeholder="Agregar tarea..."
              style={{
                flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "7px 12px", fontSize: 13, background: block.bg,
                fontFamily: "inherit", outline: "none", color: C.ink
              }}
            />
            <button onClick={() => addTask(block.id)} style={{
              background: block.dot, color: "#fff", border: "none",
              borderRadius: 8, padding: "7px 14px", cursor: "pointer",
              fontSize: 13, fontWeight: 700
            }}>+</button>
          </div>
        </Card>
      ))}

      {/* Recordatorios */}
      <Card>
        <SectionTitle>⏰ Recordatorios del día</SectionTitle>
        {recordatorios.filter(r => !r.done).map(r => (
          <div key={r.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 0", borderBottom: `1px solid ${C.border}`
          }}>
            <input type="checkbox" onChange={() => toggleRec(r.id)}
              style={{ accentColor: C.accent, width: 16, height: 16, cursor: "pointer" }} />
            <span style={{ flex: 1, fontSize: 14, color: C.ink }}>{r.texto}</span>
            {r.hora && <Badge color={C.accent} bg={C.accentLight}>{r.hora}</Badge>}
            <button onClick={() => removeRec(r.id)}
              style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={newRec.texto}
            onChange={e => setNewRec(p => ({ ...p, texto: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addRec()}
            placeholder="Acordate de..."
            style={{
              flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "7px 12px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: C.ink
            }}
          />
          <input
            type="time"
            value={newRec.hora}
            onChange={e => setNewRec(p => ({ ...p, hora: e.target.value }))}
            style={{
              border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "7px 10px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: C.ink, width: 90
            }}
          />
          <button onClick={addRec} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 8, padding: "7px 14px", cursor: "pointer",
            fontSize: 13, fontWeight: 700
          }}>+</button>
        </div>
      </Card>
    </div>
  );
}

// ─── TAB: MENÚ ────────────────────────────────────────────────────────────

function TabMenu({ menus, setMenus, compras, setCompras }) {
  const [ingrediente, setIngrediente] = useState("");
  const [seccion, setSeccion] = useState("super");

  function updateMenu(dayIdx, tipo, val) {
    setMenus(prev => {
      const m = [...prev];
      m[dayIdx] = { ...m[dayIdx], [tipo]: val };
      return m;
    });
  }

  function addIngrediente() {
    if (!ingrediente.trim()) return;
    setCompras(prev => ({
      ...prev,
      [seccion]: [...(prev[seccion] || []), { id: generateId(), texto: ingrediente, done: false }]
    }));
    setIngrediente("");
  }

  function toggleItem(sec, id) {
    setCompras(prev => ({
      ...prev,
      [sec]: prev[sec].map(i => i.id === id ? { ...i, done: !i.done } : i)
    }));
  }

  function removeItem(sec, id) {
    setCompras(prev => ({
      ...prev,
      [sec]: prev[sec].filter(i => i.id !== id)
    }));
  }

  const SECCIONES = [
    { id: "super", label: "🛒 Supermercado" },
    { id: "verduleria", label: "🥬 Verdulería" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle>🍽 Menú semanal</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", color: C.muted, fontWeight: 600, padding: "4px 8px" }}>Día</th>
                <th style={{ textAlign: "left", color: C.muted, fontWeight: 600, padding: "4px 8px" }}>Almuerzo</th>
                <th style={{ textAlign: "left", color: C.muted, fontWeight: 600, padding: "4px 8px" }}>Cena</th>
              </tr>
            </thead>
            <tbody>
              {FULLDAYS.map((day, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "6px 8px", fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>{day}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <input
                      value={menus[i]?.almuerzo || ""}
                      onChange={e => updateMenu(i, "almuerzo", e.target.value)}
                      placeholder="—"
                      style={{
                        width: "100%", border: "none", borderBottom: `1px solid ${C.border}`,
                        background: "transparent", fontSize: 13, fontFamily: "inherit",
                        color: C.ink, outline: "none", padding: "2px 0"
                      }}
                    />
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    <input
                      value={menus[i]?.cena || ""}
                      onChange={e => updateMenu(i, "cena", e.target.value)}
                      placeholder="—"
                      style={{
                        width: "100%", border: "none", borderBottom: `1px solid ${C.border}`,
                        background: "transparent", fontSize: 13, fontFamily: "inherit",
                        color: C.ink, outline: "none", padding: "2px 0"
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle>🛍 Lista de compras</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={ingrediente}
            onChange={e => setIngrediente(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addIngrediente()}
            placeholder="Agregar ítem..."
            style={{
              flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "8px 12px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: C.ink
            }}
          />
          <select
            value={seccion}
            onChange={e => setSeccion(e.target.value)}
            style={{
              border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: C.ink, background: C.bg
            }}
          >
            <option value="super">Súper</option>
            <option value="verduleria">Verdulería</option>
          </select>
          <button onClick={addIngrediente} style={{
            background: C.green, color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 16px", cursor: "pointer",
            fontSize: 13, fontWeight: 700
          }}>+</button>
        </div>

        {SECCIONES.map(sec => {
          const items = compras[sec.id] || [];
          if (items.length === 0) return null;
          const pendientes = items.filter(i => !i.done);
          const hechos = items.filter(i => i.done);
          return (
            <div key={sec.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 8 }}>
                {sec.label}
                <span style={{ fontWeight: 400, fontSize: 12, color: C.muted, marginLeft: 8 }}>
                  {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
                </span>
              </div>
              {items.map(item => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "5px 0", opacity: item.done ? 0.45 : 1
                }}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleItem(sec.id, item.id)}
                    style={{ accentColor: C.green, width: 16, height: 16, cursor: "pointer" }} />
                  <span style={{
                    flex: 1, fontSize: 14, color: C.ink,
                    textDecoration: item.done ? "line-through" : "none"
                  }}>{item.texto}</span>
                  <button onClick={() => removeItem(sec.id, item.id)}
                    style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── TAB: IDEAS ───────────────────────────────────────────────────────────

function TabIdeas({ ideas, setIdeas }) {
  const [texto, setTexto] = useState("");
  const [cat, setCat] = useState("Otro");
  const [filtro, setFiltro] = useState("Todas");

  function addIdea() {
    if (!texto.trim()) return;
    setIdeas(prev => [{ id: generateId(), texto, cat, fecha: new Date().toLocaleDateString("es-AR"), done: false }, ...prev]);
    setTexto("");
  }

  function toggleIdea(id) {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  }

  function removeIdea(id) {
    setIdeas(prev => prev.filter(i => i.id !== id));
  }

  const CAT_COLORS = {
    Estudio: { bg: C.blueLight, c: C.blue },
    Casa: { bg: C.yellowLight, c: C.yellow },
    Victoria: { bg: "#FCE4EC", c: "#C2185B" },
    Personal: { bg: C.accentLight, c: C.accent },
    Compras: { bg: C.greenLight, c: C.green },
    Otro: { bg: C.border, c: C.muted },
  };

  const filtered = filtro === "Todas" ? ideas : ideas.filter(i => i.cat === filtro);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionTitle>💡 Nueva idea o pendiente</SectionTitle>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Anotá lo que se te ocurre..."
          rows={3}
          style={{
            width: "100%", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
            outline: "none", color: C.ink, resize: "none",
            boxSizing: "border-box"
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <select
            value={cat}
            onChange={e => setCat(e.target.value)}
            style={{
              flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: C.ink, background: C.bg
            }}
          >
            {IDEA_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={addIdea} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 20px", cursor: "pointer",
            fontSize: 14, fontWeight: 700
          }}>Guardar</button>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {["Todas", ...IDEA_CATS].map(c => (
            <button key={c} onClick={() => setFiltro(c)} style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: filtro === c ? C.ink : C.border,
              color: filtro === c ? "#fff" : C.muted,
              transition: "all 0.15s"
            }}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "20px 0" }}>
            Nada por acá todavía
          </div>
        )}

        {filtered.map(idea => {
          const col = CAT_COLORS[idea.cat] || CAT_COLORS.Otro;
          return (
            <div key={idea.id} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "10px 0", borderBottom: `1px solid ${C.border}`,
              opacity: idea.done ? 0.45 : 1
            }}>
              <input type="checkbox" checked={idea.done} onChange={() => toggleIdea(idea.id)}
                style={{ accentColor: C.accent, width: 16, height: 16, cursor: "pointer", marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 14, color: C.ink,
                  textDecoration: idea.done ? "line-through" : "none"
                }}>{idea.texto}</span>
                <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                  <Badge color={col.c} bg={col.bg}>{idea.cat}</Badge>
                  <span style={{ fontSize: 11, color: C.muted }}>{idea.fecha}</span>
                </div>
              </div>
              <button onClick={() => removeIdea(idea.id)}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── TAB: VICTORIA ────────────────────────────────────────────────────────

function TabVictoria({ vicItems, setVicItems }) {
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("jardín");

  const TIPOS = ["jardín", "ropa", "salud", "actividades", "otro"];
  const TIPO_EMOJI = { jardín: "🏫", ropa: "👗", salud: "💊", actividades: "🎨", otro: "📌" };

  function add() {
    if (!texto.trim()) return;
    setVicItems(prev => [{ id: generateId(), texto, tipo, done: false }, ...prev]);
    setTexto("");
  }

  function toggle(id) {
    setVicItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  }

  function remove(id) {
    setVicItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ borderTop: `4px solid #C2185B` }}>
        <SectionTitle>🌸 Victoria</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Agregar cosa de Vicky..."
            style={{
              flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "8px 12px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: C.ink
            }}
          />
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            style={{
              border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: C.ink, background: C.bg
            }}
          >
            {TIPOS.map(t => <option key={t} value={t}>{TIPO_EMOJI[t]} {t}</option>)}
          </select>
          <button onClick={add} style={{
            background: "#C2185B", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 16px", cursor: "pointer",
            fontSize: 13, fontWeight: 700
          }}>+</button>
        </div>
      </Card>

      {TIPOS.map(t => {
        const items = vicItems.filter(i => i.tipo === t);
        if (items.length === 0) return null;
        return (
          <Card key={t}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 10 }}>
              {TIPO_EMOJI[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
            {items.map(item => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 0", opacity: item.done ? 0.45 : 1,
                borderBottom: `1px solid ${C.border}`
              }}>
                <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)}
                  style={{ accentColor: "#C2185B", width: 16, height: 16, cursor: "pointer" }} />
                <span style={{
                  flex: 1, fontSize: 14, color: C.ink,
                  textDecoration: item.done ? "line-through" : "none"
                }}>{item.texto}</span>
                <button onClick={() => remove(item.id)}
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ))}
          </Card>
        );
      })}

      {vicItems.length === 0 && (
        <div style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "30px 0" }}>
          Todo en orden con Vicky 🌸
        </div>
      )}
    </div>
  );
}

// ─── TAB: ASISTENTE ───────────────────────────────────────────────────────

function TabAsistente({ menus, ideas, vicItems, recordatorios, compras, blockTasks }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hola Sole 👋 Soy tu asistente personal. Podés preguntarme qué tenés pendiente, pedirme que te ayude a planificar tu semana, o cualquier cosa relacionada con tu rutina. ¿En qué te ayudo hoy?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const context = `
Sos un asistente personal de Soledad, abogada y mamá en Misiones, Argentina.
Hablale de vos a vos, en español rioplatense, tono directo y cálido.

CONTEXTO DE SU DÍA:
- 8:30-10:30: Mañana libre (casa + trabajo)
- 11:00-13:30: Vuelta del jardín de Victoria, puede pasar por el súper
- 13:30-16:00: Siesta de Victoria
- 16:30-18:00: Entre el jardín y el entreno
- Lun/Mié: Vóley 18:30 | Mar/Jue: Gimnasio 18:00 | Jue también vóley después | Vie: libre

SUS DATOS ACTUALES:
Menú semanal: ${JSON.stringify(menus)}
Recordatorios pendientes: ${JSON.stringify(recordatorios.filter(r => !r.done))}
Compras pendientes: ${JSON.stringify({ super: (compras.super || []).filter(i => !i.done), verduleria: (compras.verduleria || []).filter(i => !i.done) })}
Ideas pendientes: ${JSON.stringify(ideas.filter(i => !i.done).slice(0, 10))}
Cosas de Victoria: ${JSON.stringify(vicItems.filter(i => !i.done))}
Tareas en bloques hoy: ${JSON.stringify(blockTasks)}

Respondé de forma concreta y útil. Si te pregunta qué tiene pendiente, resumilo bien.
Si no hay datos relevantes, decílo con naturalidad.
    `.trim();

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "No pude responder, intentá de nuevo.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Ups, algo falló. Intentá de nuevo." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", gap: 0 }}>
      <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 0 }}>
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 22px",
          display: "flex", flexDirection: "column", gap: 12
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start"
            }}>
              <div style={{
                maxWidth: "80%",
                background: m.role === "user" ? C.ink : C.accentLight,
                color: m.role === "user" ? "#fff" : C.ink,
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
                whiteSpace: "pre-wrap"
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex" }}>
              <div style={{
                background: C.accentLight, borderRadius: "16px 16px 16px 4px",
                padding: "10px 16px", color: C.muted, fontSize: 14
              }}>...</div>
            </div>
          )}
        </div>
        <div style={{
          padding: "14px 20px", borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 8
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Preguntame algo..."
            style={{
              flex: 1, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "10px 14px", fontSize: 14, fontFamily: "inherit",
              outline: "none", color: C.ink
            }}
          />
          <button onClick={send} disabled={loading} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 18px", cursor: loading ? "default" : "pointer",
            fontSize: 14, fontWeight: 700, opacity: loading ? 0.6 : 1
          }}>Enviar</button>
        </div>
      </Card>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "hoy", label: "Hoy", emoji: "📅" },
  { id: "menu", label: "Menú", emoji: "🍽" },
  { id: "recetas", label: "Recetas", emoji: "📖" },
  { id: "ideas", label: "Ideas", emoji: "💡" },
  { id: "victoria", label: "Vicky", emoji: "🌸" },
  { id: "asistente", label: "Asistente", emoji: "✨" },
];

// ─── TAB: RECETAS ─────────────────────────────────────────────────────────

function TabRecetas({ recetas, setRecetas, setCompras }) {
  const [vista, setVista] = useState("lista"); // lista | ver | nueva | ia
  const [recetaActiva, setRecetaActiva] = useState(null);
  const [porciones, setPorciones] = useState(4);
  const [faltantes, setFaltantes] = useState({});

  // ── Formulario manual ──
  const recetaVacia = { id: "", nombre: "", porciones: 4, categoria: "almuerzo", ingredientes: [], pasos: [], notas: "" };
  const [form, setForm] = useState(recetaVacia);
  const [ingInput, setIngInput] = useState({ nombre: "", cantidad: "", unidad: "g" });
  const [pasoInput, setPasoInput] = useState("");

  // ── Carga por IA ──
  const [iaInput, setIaInput] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState("");

  const UNIDADES = ["g", "kg", "ml", "l", "taza", "cdita", "cda", "unidad", "rodaja", "pizca", "al gusto"];
  const CATS = ["almuerzo", "cena", "desayuno", "merienda", "postre", "para Vicky", "otro"];

  function addIngrediente() {
    if (!ingInput.nombre.trim()) return;
    setForm(f => ({
      ...f,
      ingredientes: [...f.ingredientes, { id: generateId(), ...ingInput }]
    }));
    setIngInput({ nombre: "", cantidad: "", unidad: "g" });
  }

  function removeIng(id) {
    setForm(f => ({ ...f, ingredientes: f.ingredientes.filter(i => i.id !== id) }));
  }

  function addPaso() {
    if (!pasoInput.trim()) return;
    setForm(f => ({ ...f, pasos: [...f.pasos, { id: generateId(), texto: pasoInput }] }));
    setPasoInput("");
  }

  function removePaso(id) {
    setForm(f => ({ ...f, pasos: f.pasos.filter(p => p.id !== id) }));
  }

  function guardarReceta() {
    if (!form.nombre.trim()) return;
    const nueva = { ...form, id: form.id || generateId() };
    setRecetas(prev => {
      const existe = prev.find(r => r.id === nueva.id);
      return existe ? prev.map(r => r.id === nueva.id ? nueva : r) : [...prev, nueva];
    });
    setForm(recetaVacia);
    setVista("lista");
  }

  async function cargarConIA() {
    if (!iaInput.trim()) return;
    setIaLoading(true);
    setIaError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Sos un asistente de cocina. El usuario te describe una receta y vos la convertís en JSON estructurado.
Respondé ÚNICAMENTE con un JSON válido, sin texto adicional, sin backticks, sin markdown.
El JSON debe tener exactamente esta estructura:
{
  "nombre": "string",
  "porciones": number,
  "categoria": "almuerzo|cena|desayuno|merienda|postre|para Vicky|otro",
  "ingredientes": [{ "id": "abc1", "nombre": "string", "cantidad": "string", "unidad": "string" }],
  "pasos": [{ "id": "abc2", "texto": "string" }],
  "notas": "string"
}
Para unidades usá: g, kg, ml, l, taza, cdita, cda, unidad, rodaja, pizca, al gusto.
Generá IDs cortos de 4 caracteres aleatorios para cada ingrediente y paso.`,
          messages: [{ role: "user", content: iaInput }]
        })
      });
      const data = await res.json();
      const texto = data.content?.[0]?.text || "";
      const parsed = JSON.parse(texto);
      setForm({ ...recetaVacia, ...parsed, id: generateId() });
      setVista("nueva");
    } catch {
      setIaError("No pude interpretar la receta. Probá describiendo más detalle o cargala a mano.");
    }
    setIaLoading(false);
  }

  function verReceta(r) {
    setRecetaActiva(r);
    setPorciones(r.porciones);
    setFaltantes({});
    setVista("ver");
  }

  function escalar(cantidad, base, actual) {
    if (!cantidad || isNaN(parseFloat(cantidad))) return cantidad;
    const num = parseFloat(cantidad);
    const resultado = (num * actual) / base;
    return Number.isInteger(resultado) ? resultado.toString() : resultado.toFixed(1).replace(/\.0$/, "");
  }

  function toggleFaltante(id) {
    setFaltantes(f => ({ ...f, [id]: !f[id] }));
  }

  function agregarFaltantesAlSuper() {
    const items = recetaActiva.ingredientes.filter(i => faltantes[i.id]);
    if (items.length === 0) return;
    setCompras(prev => ({
      ...prev,
      super: [
        ...(prev.super || []),
        ...items.map(i => ({
          id: generateId(),
          texto: `${i.nombre}${i.cantidad ? ` (${escalar(i.cantidad, recetaActiva.porciones, porciones)} ${i.unidad !== "al gusto" ? i.unidad : ""})` : ""}`.trim(),
          done: false,
          origen: recetaActiva.nombre
        }))
      ]
    }));
    setFaltantes({});
    alert(`✅ ${items.length} ingrediente${items.length > 1 ? "s" : ""} agregado${items.length > 1 ? "s" : ""} al súper`);
  }

  function eliminarReceta(id) {
    setRecetas(prev => prev.filter(r => r.id !== id));
    setVista("lista");
  }

  const CAT_COLOR = {
    almuerzo: { bg: C.blueLight, c: C.blue },
    cena: { bg: C.yellowLight, c: C.yellow },
    desayuno: { bg: "#FFF3E0", c: "#E65100" },
    merienda: { bg: "#FCE4EC", c: "#C2185B" },
    postre: { bg: "#F3E5F5", c: "#7B1FA2" },
    "para Vicky": { bg: "#FCE4EC", c: "#C2185B" },
    otro: { bg: C.border, c: C.muted },
  };

  // ── VISTA: LISTA ──
  if (vista === "lista") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { setForm(recetaVacia); setVista("nueva"); }} style={{
          flex: 1, background: C.accent, color: "#fff", border: "none",
          borderRadius: 10, padding: "11px", cursor: "pointer",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit"
        }}>+ Cargar a mano</button>
        <button onClick={() => { setIaInput(""); setIaError(""); setVista("ia"); }} style={{
          flex: 1, background: C.ink, color: "#fff", border: "none",
          borderRadius: 10, padding: "11px", cursor: "pointer",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit"
        }}>✨ Cargar con IA</button>
      </div>

      {recetas.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", color: C.muted, padding: "30px 0", fontSize: 14 }}>
            Todavía no hay recetas guardadas
          </div>
        </Card>
      )}

      {CATS.map(cat => {
        const items = recetas.filter(r => r.categoria === cat);
        if (items.length === 0) return null;
        const col = CAT_COLOR[cat] || CAT_COLOR.otro;
        return (
          <div key={cat}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              {cat}
            </div>
            {items.map(r => (
              <Card key={r.id} style={{ marginBottom: 8, cursor: "pointer" }} >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => verReceta(r)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{r.nombre}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {r.ingredientes.length} ingredientes · {r.porciones} porciones base
                    </div>
                  </div>
                  <Badge color={col.c} bg={col.bg}>{cat}</Badge>
                  <span style={{ color: C.muted, fontSize: 18 }}>›</span>
                </div>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );

  // ── VISTA: VER RECETA ──
  if (vista === "ver" && recetaActiva) {
    const hasFaltantes = Object.values(faltantes).some(Boolean);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => setVista("lista")} style={{
          background: "none", border: "none", color: C.accent, cursor: "pointer",
          fontSize: 14, fontWeight: 700, textAlign: "left", padding: 0, fontFamily: "inherit"
        }}>← Volver</button>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.ink, margin: "0 0 4px" }}>
                {recetaActiva.nombre}
              </h2>
              <Badge color={CAT_COLOR[recetaActiva.categoria]?.c} bg={CAT_COLOR[recetaActiva.categoria]?.bg}>
                {recetaActiva.categoria}
              </Badge>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { setForm(recetaActiva); setVista("nueva"); }} style={{
                background: C.border, border: "none", borderRadius: 8, padding: "6px 12px",
                cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", color: C.ink
              }}>Editar</button>
              <button onClick={() => eliminarReceta(recetaActiva.id)} style={{
                background: "#FDECEA", border: "none", borderRadius: 8, padding: "6px 12px",
                cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", color: "#C62828"
              }}>Eliminar</button>
            </div>
          </div>
        </Card>

        {/* Escalado de porciones */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 12 }}>🍽 Porciones</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setPorciones(p => Math.max(1, p - 1))} style={{
              width: 36, height: 36, borderRadius: "50%", border: `2px solid ${C.border}`,
              background: C.bg, fontSize: 20, cursor: "pointer", fontWeight: 700, color: C.ink
            }}>−</button>
            <span style={{ fontSize: 22, fontWeight: 700, color: C.accent, minWidth: 30, textAlign: "center" }}>
              {porciones}
            </span>
            <button onClick={() => setPorciones(p => p + 1)} style={{
              width: 36, height: 36, borderRadius: "50%", border: `2px solid ${C.border}`,
              background: C.bg, fontSize: 20, cursor: "pointer", fontWeight: 700, color: C.ink
            }}>+</button>
            <span style={{ fontSize: 13, color: C.muted }}>
              {porciones !== recetaActiva.porciones && `(base: ${recetaActiva.porciones})`}
            </span>
          </div>
        </Card>

        {/* Ingredientes */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>🧂 Ingredientes</div>
            <div style={{ fontSize: 11, color: C.muted }}>Marcá los que te faltan</div>
          </div>
          {recetaActiva.ingredientes.map(ing => (
            <div key={ing.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 0", borderBottom: `1px solid ${C.border}`
            }}>
              <input type="checkbox" checked={!!faltantes[ing.id]} onChange={() => toggleFaltante(ing.id)}
                style={{ accentColor: C.accent, width: 16, height: 16, cursor: "pointer" }} />
              <span style={{ flex: 1, fontSize: 14, color: C.ink }}>{ing.nombre}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>
                {escalar(ing.cantidad, recetaActiva.porciones, porciones)}
                {ing.unidad !== "al gusto" && ing.unidad !== "unidad" ? ` ${ing.unidad}` : ing.unidad === "al gusto" ? " al gusto" : ""}
              </span>
            </div>
          ))}

          {hasFaltantes && (
            <button onClick={agregarFaltantesAlSuper} style={{
              marginTop: 12, width: "100%", background: C.green, color: "#fff",
              border: "none", borderRadius: 10, padding: "10px", cursor: "pointer",
              fontSize: 14, fontWeight: 700, fontFamily: "inherit"
            }}>🛒 Agregar faltantes al súper</button>
          )}
        </Card>

        {/* Pasos */}
        {recetaActiva.pasos.length > 0 && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 12 }}>👩‍🍳 Preparación</div>
            {recetaActiva.pasos.map((paso, i) => (
              <div key={paso.id} style={{
                display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start"
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", background: C.accentLight,
                  color: C.accent, fontSize: 12, fontWeight: 700, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1
                }}>{i + 1}</div>
                <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>{paso.texto}</span>
              </div>
            ))}
          </Card>
        )}

        {recetaActiva.notas && (
          <Card style={{ background: C.yellowLight, border: `1px solid ${C.yellow}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.yellow, marginBottom: 4 }}>📝 Notas</div>
            <div style={{ fontSize: 14, color: C.ink }}>{recetaActiva.notas}</div>
          </Card>
        )}
      </div>
    );
  }

  // ── VISTA: IA ──
  if (vista === "ia") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button onClick={() => setVista("lista")} style={{
        background: "none", border: "none", color: C.accent, cursor: "pointer",
        fontSize: 14, fontWeight: 700, textAlign: "left", padding: 0, fontFamily: "inherit"
      }}>← Volver</button>
      <Card>
        <SectionTitle>✨ Cargar receta con IA</SectionTitle>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 12px" }}>
          Describí la receta como quieras — con ingredientes, pasos, todo junto o por partes. La IA la organiza por vos.
        </p>
        <textarea
          value={iaInput}
          onChange={e => setIaInput(e.target.value)}
          placeholder={"Ej: Milanesas de pollo. Para 4 personas. Ingredientes: 4 pechugas, 2 huevos, pan rallado, sal, ajo. Se aplasta el pollo, se pasa por huevo batido con ajo y sal, después por pan rallado y se fríe..."}
          rows={7}
          style={{
            width: "100%", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
            outline: "none", color: C.ink, resize: "none", boxSizing: "border-box"
          }}
        />
        {iaError && <div style={{ color: "#C62828", fontSize: 13, marginTop: 8 }}>{iaError}</div>}
        <button onClick={cargarConIA} disabled={iaLoading} style={{
          marginTop: 10, width: "100%", background: C.ink, color: "#fff",
          border: "none", borderRadius: 10, padding: "11px", cursor: iaLoading ? "default" : "pointer",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit", opacity: iaLoading ? 0.6 : 1
        }}>{iaLoading ? "Analizando..." : "Generar receta"}</button>
      </Card>
    </div>
  );

  // ── VISTA: FORMULARIO MANUAL ──
  if (vista === "nueva") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button onClick={() => setVista("lista")} style={{
        background: "none", border: "none", color: C.accent, cursor: "pointer",
        fontSize: 14, fontWeight: 700, textAlign: "left", padding: 0, fontFamily: "inherit"
      }}>← Volver</button>

      <Card>
        <SectionTitle>{form.id ? "Editar receta" : "Nueva receta"}</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Nombre de la receta"
            style={{
              border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px",
              fontSize: 15, fontFamily: "inherit", outline: "none", color: C.ink, fontWeight: 700
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              style={{
                flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: C.ink, background: C.bg
              }}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0 12px" }}>
              <span style={{ fontSize: 12, color: C.muted }}>Porciones</span>
              <button onClick={() => setForm(f => ({ ...f, porciones: Math.max(1, f.porciones - 1) }))}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.ink }}>−</button>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.accent }}>{form.porciones}</span>
              <button onClick={() => setForm(f => ({ ...f, porciones: f.porciones + 1 }))}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.ink }}>+</button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 10 }}>🧂 Ingredientes</div>
        {form.ingredientes.map(ing => (
          <div key={ing.id} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 0", borderBottom: `1px solid ${C.border}`
          }}>
            <span style={{ flex: 1, fontSize: 13, color: C.ink }}>{ing.nombre}</span>
            <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>{ing.cantidad} {ing.unidad}</span>
            <button onClick={() => removeIng(ing.id)}
              style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <input
            value={ingInput.nombre}
            onChange={e => setIngInput(p => ({ ...p, nombre: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addIngrediente()}
            placeholder="Ingrediente"
            style={{
              flex: 2, minWidth: 100, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "7px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: C.ink
            }}
          />
          <input
            value={ingInput.cantidad}
            onChange={e => setIngInput(p => ({ ...p, cantidad: e.target.value }))}
            placeholder="Cant."
            style={{
              width: 60, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "7px 8px", fontSize: 13, fontFamily: "inherit", outline: "none", color: C.ink
            }}
          />
          <select value={ingInput.unidad} onChange={e => setIngInput(p => ({ ...p, unidad: e.target.value }))}
            style={{
              border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "7px 6px", fontSize: 12, fontFamily: "inherit", outline: "none", color: C.ink, background: C.bg
            }}>
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button onClick={addIngrediente} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700
          }}>+</button>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 10 }}>👩‍🍳 Pasos</div>
        {form.pasos.map((paso, i) => (
          <div key={paso.id} style={{
            display: "flex", gap: 8, alignItems: "flex-start",
            padding: "5px 0", borderBottom: `1px solid ${C.border}`
          }}>
            <span style={{ fontSize: 12, color: C.muted, marginTop: 3, minWidth: 16 }}>{i + 1}.</span>
            <span style={{ flex: 1, fontSize: 13, color: C.ink }}>{paso.texto}</span>
            <button onClick={() => removePaso(paso.id)}
              style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            value={pasoInput}
            onChange={e => setPasoInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addPaso()}
            placeholder="Agregar paso..."
            style={{
              flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "7px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: C.ink
            }}
          />
          <button onClick={addPaso} style={{
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700
          }}>+</button>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 8 }}>📝 Notas (opcional)</div>
        <textarea
          value={form.notas}
          onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
          placeholder="Tips, variantes, sustituciones..."
          rows={2}
          style={{
            width: "100%", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
            outline: "none", color: C.ink, resize: "none", boxSizing: "border-box"
          }}
        />
      </Card>

      <button onClick={guardarReceta} style={{
        width: "100%", background: C.ink, color: "#fff", border: "none",
        borderRadius: 12, padding: "13px", cursor: "pointer",
        fontSize: 15, fontWeight: 700, fontFamily: "inherit"
      }}>Guardar receta</button>
    </div>
  );

  return null;
}

export default function App() {
  const [tab, setTab] = useState("hoy");
  const [recordatorios, setRecordatorios] = useLocalState("sol_recordatorios", []);
  const [blockTasks, setBlockTasks] = useLocalState("sol_blocktasks", {});
  const [menus, setMenus] = useLocalState("sol_menus", MENUS_INIT);
  const [compras, setCompras] = useLocalState("sol_compras", { super: [], verduleria: [] });
  const [ideas, setIdeas] = useLocalState("sol_ideas", []);
  const [vicItems, setVicItems] = useLocalState("sol_victoria", []);
  const [recetas, setRecetas] = useLocalState("sol_recetas", []);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "16px 20px 0", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 12
          }}>Mi Organización</div>
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 14px", fontSize: 13, fontWeight: 700,
                fontFamily: "inherit",
                color: tab === t.id ? C.accent : C.muted,
                borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
                whiteSpace: "nowrap", transition: "all 0.15s"
              }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 40px" }}>
        {tab === "hoy" && (
          <TabHoy
            recordatorios={recordatorios} setRecordatorios={setRecordatorios}
            blockTasks={blockTasks} setBlockTasks={setBlockTasks}
          />
        )}
        {tab === "menu" && (
          <TabMenu menus={menus} setMenus={setMenus} compras={compras} setCompras={setCompras} />
        )}
        {tab === "ideas" && <TabIdeas ideas={ideas} setIdeas={setIdeas} />}
        {tab === "recetas" && <TabRecetas recetas={recetas} setRecetas={setRecetas} setCompras={setCompras} />}
        {tab === "victoria" && <TabVictoria vicItems={vicItems} setVicItems={setVicItems} />}
        {tab === "asistente" && (
          <TabAsistente
            menus={menus} ideas={ideas} vicItems={vicItems}
            recordatorios={recordatorios} compras={compras} blockTasks={blockTasks}
          />
        )}
      </div>
    </div>
  );
}
