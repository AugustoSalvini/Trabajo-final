import React, { useEffect, useMemo, useState } from "react";

// ---------- MOCK: datos de ejemplo (podés borrar y traer de API luego) ----------
const MOCK_FACTURAS = [
  { id: 1001, numero: "F-0001", cliente: "Juan Pérez", fecha: "2025-10-01", total: 45250.5, estado: "PAGADA" },
  { id: 1002, numero: "F-0002", cliente: "María López", fecha: "2025-10-02", total: 19999, estado: "PENDIENTE" },
  { id: 1003, numero: "F-0003", cliente: "Carlos García", fecha: "2025-10-02", total: 8350, estado: "ANULADA" },
  { id: 1004, numero: "F-0004", cliente: "Whiteglass SRL", fecha: "2025-10-03", total: 121000, estado: "PAGADA" },
  { id: 1005, numero: "F-0005", cliente: "MegaSport", fecha: "2025-10-05", total: 54000, estado: "PENDIENTE" },
  { id: 1006, numero: "F-0006", cliente: "Agus Salvini", fecha: "2025-10-06", total: 32000, estado: "PAGADA" },
  { id: 1007, numero: "F-0007", cliente: "Rincón Vet", fecha: "2025-10-07", total: 27500, estado: "PENDIENTE" },
  { id: 1008, numero: "F-0008", cliente: "Centro Médico", fecha: "2025-10-08", total: 90000, estado: "PAGADA" },
  { id: 1009, numero: "F-0009", cliente: "LawTrack", fecha: "2025-10-09", total: 150000, estado: "PAGADA" },
  { id: 1010, numero: "F-0010", cliente: "ITech", fecha: "2025-10-10", total: 61000, estado: "ANULADA" },
];

const ESTADOS = ["TODAS", "PENDIENTE", "PAGADA", "ANULADA"];

// ---------- Utilidades ----------
function formatCurrency(n) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n ?? 0);
  } catch {
    return `$ ${Number(n || 0).toFixed(2)}`;
  }
}

// ---------- Componente principal ----------
export default function FacturaLista() {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("TODAS");
  const [desde, setDesde] = useState(""); // YYYY-MM-DD
  const [hasta, setHasta] = useState(""); // YYYY-MM-DD
  const [orden, setOrden] = useState({ campo: "fecha", dir: "desc" }); // asc | desc
  const [pagina, setPagina] = useState(1);
  const filasPorPagina = 6;

  // Tip: reemplazá MOCK_FACTURAS por props o fetch cuando conectes backend
  const [facturas] = useState(MOCK_FACTURAS);

  // Filtro + orden + paginación (todo en memo)
  const filtradas = useMemo(() => {
    let list = [...facturas];

    // Filtro por búsqueda (número o cliente)
    const q = busqueda.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.numero.toLowerCase().includes(q) ||
          f.cliente.toLowerCase().includes(q)
      );
    }

    // Filtro por estado
    if (estado !== "TODAS") list = list.filter((f) => f.estado === estado);

    // Filtro por rango de fechas
    if (desde) list = list.filter((f) => f.fecha >= desde);
    if (hasta) list = list.filter((f) => f.fecha <= hasta);

    // Orden
    list.sort((a, b) => {
      const dir = orden.dir === "asc" ? 1 : -1;
      const A = a[orden.campo];
      const B = b[orden.campo];
      if (orden.campo === "total") return (A - B) * dir;
      if (orden.campo === "fecha") return (A.localeCompare(B)) * dir;
      return String(A).localeCompare(String(B)) * dir;
    });

    return list;
  }, [facturas, busqueda, estado, desde, hasta, orden]);

  // Reset página al cambiar filtros
  useEffect(() => { setPagina(1); }, [busqueda, estado, desde, hasta]);

  // Paginación
  const total = filtradas.length;
  const totalPaginas = Math.max(1, Math.ceil(total / filasPorPagina));
  const desdeIdx = (pagina - 1) * filasPorPagina;
  const hastaIdx = desdeIdx + filasPorPagina;
  const paginaItems = filtradas.slice(desdeIdx, hastaIdx);

  function toggleOrden(campo) {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { campo, dir: "asc" }
    );
  }

  // Callbacks UI (solo frontend)
  function verFactura(f) {
    alert(`Ver factura ${f.numero} (solo frontend, sin backend aún)`);
  }
  function descargarPDF(f) {
    alert(`Descargar PDF de ${f.numero} (mock)`);
  }

  return (
    <section style={{ padding: 24 }}>
      <header style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto", alignItems: "end", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Facturas</h2>
          <p style={{ color: "#666", margin: "4px 0 0" }}>
            Listado con búsqueda, filtros y orden. Solo frontend (mock data).
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input
            placeholder="Buscar por número o cliente…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={input}
          />
          <select value={estado} onChange={(e) => setEstado(e.target.value)} style={input}>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={input} />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={input} />
        </div>
      </header>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <span>{total} resultado(s)</span>
        <small style={{ color: "#666" }}>
          Orden: <b>{orden.campo}</b> ({orden.dir})
        </small>
      </div>

      <div style={{ overflow: "auto", border: "1px solid #eee", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <Th onClick={() => toggleOrden("numero")}>Nº</Th>
              <Th onClick={() => toggleOrden("cliente")}>Cliente</Th>
              <Th onClick={() => toggleOrden("fecha")}>Fecha</Th>
              <Th onClick={() => toggleOrden("total")} style={{ textAlign: "right" }}>Total</Th>
              <Th onClick={() => toggleOrden("estado")}>Estado</Th>
              <Th style={{ width: 160 }}>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {paginaItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "#666" }}>No hay facturas para mostrar.</td>
              </tr>
            ) : (
              paginaItems.map((f) => (
                <tr key={f.id}>
                  <Td>{f.numero}</Td>
                  <Td>{f.cliente}</Td>
                  <Td>{new Date(f.fecha).toLocaleDateString("es-AR")}</Td>
                  <Td style={{ textAlign: "right" }}>{formatCurrency(f.total)}</Td>
                  <Td>
                    <span style={badgeStyle(f.estado)}>{f.estado}</span>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={btn} onClick={() => verFactura(f)}>Ver</button>
                      <button style={{ ...btn, background: "#fff", color: "#222" }} onClick={() => descargarPDF(f)}>
                        PDF
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center", marginTop: 12 }}>
        <button style={btnLite} onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}>
          ← Anterior
        </button>
        <span style={{ color: "#666" }}>
          Página {pagina} de {totalPaginas}
        </span>
        <button style={btnLite} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>
          Siguiente →
        </button>
      </div>
    </section>
  );
}

// ---------- Subcomponentes y estilos ----------
function Th({ children, onClick, style }) {
  return (
    <th
      onClick={onClick}
      style={{
        padding: 12,
        borderBottom: "1px solid #f2f2f2",
        textAlign: "left",
        fontWeight: 600,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        ...style,
      }}
      title={onClick ? "Ordenar" : undefined}
    >
      {children}
    </th>
  );
}

function Td({ children, style }) {
  return (
    <td style={{ padding: 12, borderBottom: "1px solid #f2f2f2", ...style }}>
      {children}
    </td>
  );
}

const input = { padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff" };
const btn = { padding: "6px 10px", borderRadius: 8, border: "1px solid #222", background: "#222", color: "#fff", cursor: "pointer" };
const btnLite = { padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", color: "#222", cursor: "pointer" };

function badgeStyle(estado) {
  const map = {
    PAGADA: { bg: "#e6f4ea", fg: "#1e7e34", br: "#b7e1c0" },
    PENDIENTE: { bg: "#fff7e6", fg: "#b26a00", br: "#ffe0b2" },
    ANULADA: { bg: "#fdecea", fg: "#b71c1c", br: "#f5b5b2" },
    DEFAULT: { bg: "#eef2f7", fg: "#2c3e50", br: "#d6dce5" },
  };
  const c = map[estado] || map.DEFAULT;
  return {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    background: c.bg,
    color: c.fg,
    border: `1px solid ${c.br}`,
    fontSize: ".85rem",
    fontWeight: 600,
  };
}
