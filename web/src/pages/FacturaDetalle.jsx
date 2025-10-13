import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

/** ------------ MOCK: reemplazá por fetch cuando conectes backend ------------ */
const MOCK_FACTURAS = [
  {
    id: 1004,
    numero: "F-0004",
    tipo: "B",                // A | B | C
    fecha: "2025-10-03",
    cliente: { nombre: "Whiteglass SRL", dni: "30-20304050-6", direccion: "Av. Siempreviva 742" },
    condicionIva: "Responsable Inscripto",
    estado: "PAGADA",         // PENDIENTE | PAGADA | ANULADA
    items: [
      { desc: "Servicio de mantenimiento", cant: 1, pUnit: 45000 },
      { desc: "Repuesto A", cant: 2, pUnit: 38000 },
    ],
    descuentoPct: 5,
    alicuota: 21,             // 0 | 10.5 | 21
    cae: "69300000012345",    // opcional
    caeVto: "2025-10-20",     // opcional
    notas: "Gracias por su compra.",
  },
];

const fmtMoney = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n || 0);

const pill = (estado) => {
  const map = {
    PAGADA: { bg: "#e6f4ea", fg: "#1e7e34", br: "#b7e1c0" },
    PENDIENTE: { bg: "#fff7e6", fg: "#b26a00", br: "#ffe0b2" },
    ANULADA: { bg: "#fdecea", fg: "#b71c1c", br: "#f5b5b2" },
    DEFAULT: { bg: "#eef2f7", fg: "#2c3e50", br: "#d6dce5" },
  };
  const c = map[estado] || map.DEFAULT;
  return { display: "inline-block", padding: "2px 10px", borderRadius: 999, background: c.bg, color: c.fg, border: `1px solid ${c.br}`, fontWeight: 700, fontSize: ".85rem" };
};

export default function FacturaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  // simulamos “fetch”: buscá por id en mock
  const factura = useMemo(() => MOCK_FACTURAS.find((f) => String(f.id) === String(id)) || MOCK_FACTURAS[0], [id]);

  // cálculos
  const subtotalBruto = useMemo(
    () => factura.items.reduce((acc, it) => acc + Number(it.cant) * Number(it.pUnit), 0),
    [factura.items]
  );
  const descMonto = useMemo(() => subtotalBruto * ((Number(factura.descuentoPct) || 0) / 100), [subtotalBruto, factura.descuentoPct]);
  const subtotal = useMemo(() => subtotalBruto - descMonto, [subtotalBruto, descMonto]);
  const iva = useMemo(() => subtotal * ((Number(factura.alicuota) || 0) / 100), [subtotal, factura.alicuota]);
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  function imprimir() {
    window.print();
  }
  function descargarPDF() {
    alert("Descarga de PDF (mock): acá generarías el PDF en el frontend o lo pedirías al backend.");
  }

  return (
    <section style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Factura {factura.tipo}-{factura.numero}</h2>
          <div style={{ color: "#666", marginTop: 4 }}>
            Emitida el {new Date(factura.fecha).toLocaleDateString("es-AR")}
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={pill(factura.estado)}>{factura.estado}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnLite} onClick={() => navigate(-1)}>← Volver</button>
          <button style={btnLite} onClick={imprimir}>🖨️ Imprimir</button>
          <button style={btn} onClick={descargarPDF}>⬇️ PDF</button>
        </div>
      </div>

      {/* Encabezado / Datos comerciales */}
      <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <div style={card}>
          <h3 style={h3}>Datos del cliente</h3>
          <Row label="Nombre" value={factura.cliente.nombre} />
          <Row label="DNI/CUIT" value={factura.cliente.dni || "-"} />
          <Row label="Dirección" value={factura.cliente.direccion || "-"} />
          <Row label="Condición IVA" value={factura.condicionIva || "-"} />
        </div>

        <div style={card}>
          <h3 style={h3}>Datos fiscales</h3>
          <Row label="Tipo" value={`Factura ${factura.tipo}`} />
          <Row label="Fecha" value={new Date(factura.fecha).toLocaleDateString("es-AR")} />
          <Row label="Alicuota IVA" value={`${factura.alicuota}%`} />
          <Row label="CAE" value={factura.cae || "—"} />
          <Row label="Vto CAE" value={factura.caeVto ? new Date(factura.caeVto).toLocaleDateString("es-AR") : "—"} />
        </div>
      </div>

      {/* Ítems */}
      <div style={{ ...card, marginTop: 16 }}>
        <h3 style={h3}>Detalle</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <Th>Descripción</Th>
                <Th align="right" style={{ width: 120 }}>Cant.</Th>
                <Th align="right" style={{ width: 180 }}>Precio Unit.</Th>
                <Th align="right" style={{ width: 180 }}>Importe</Th>
              </tr>
            </thead>
            <tbody>
              {factura.items.map((it, idx) => (
                <tr key={idx}>
                  <Td>{it.desc}</Td>
                  <Td align="right">{Number(it.cant)}</Td>
                  <Td align="right">{fmtMoney(it.pUnit)}</Td>
                  <Td align="right">{fmtMoney(Number(it.cant) * Number(it.pUnit))}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", marginTop: 16, gap: 16 }}>
          <div>
            {factura.notas && (
              <>
                <div style={{ color: "#333", fontWeight: 600, marginBottom: 6 }}>Observaciones</div>
                <div style={{ padding: 12, border: "1px dashed #e5e7eb", borderRadius: 8, color: "#555" }}>{factura.notas}</div>
              </>
            )}
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fff" }}>
            <TotalRow label="Subtotal bruto" value={fmtMoney(subtotalBruto)} />
            <TotalRow label={`Descuento (${factura.descuentoPct || 0}%)`} value={`- ${fmtMoney(descMonto)}`} />
            <TotalRow label="Subtotal" value={fmtMoney(subtotal)} />
            <TotalRow label={`IVA ${factura.alicuota}%`} value={fmtMoney(iva)} />
            <TotalRow label="Total" value={fmtMoney(total)} strong />
          </div>
        </div>
      </div>
    </section>
  );
}

/** ----------------- Subcomponentes & estilos ----------------- */
function Row({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 8, padding: "4px 0" }}>
      <div style={{ color: "#666" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}
function Th({ children, align = "left", style }) {
  return <th style={{ padding: 12, borderBottom: "1px solid #f2f2f2", textAlign: align, fontWeight: 700, ...style }}>{children}</th>;
}
function Td({ children, align = "left", style }) {
  return <td style={{ padding: 12, borderBottom: "1px solid #f2f2f2", textAlign: align, ...style }}>{children}</td>;
}
function TotalRow({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
      <span style={{ color: "#555" }}>{label}</span>
      <span style={{ fontWeight: strong ? 800 : 700 }}>{value}</span>
    </div>
  );
}

const card = { border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff" };
const h3 = { marginTop: 0 };
const btn = { padding: "10px 14px", borderRadius: 10, border: "1px solid #222", background: "#222", color: "#fff", cursor: "pointer" };
const btnLite = { padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "#fff", color: "#222", cursor: "pointer" };
