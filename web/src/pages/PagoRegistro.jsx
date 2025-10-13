import React, { useMemo, useState } from "react";

/** ------------------- MOCKS (reemplazá por API cuando conectes backend) ------------------- */
const MOCK_FACTURAS = [
  { id: 1001, numero: "F-0001", cliente: "Juan Pérez", fecha: "2025-10-01", total: 45250.5, pagado: 20000, estado: "PENDIENTE" },
  { id: 1004, numero: "F-0004", cliente: "Whiteglass SRL", fecha: "2025-10-03", total: 121000, pagado: 121000, estado: "PAGADA" },
  { id: 1005, numero: "F-0005", cliente: "MegaSport", fecha: "2025-10-05", total: 54000, pagado: 0, estado: "PENDIENTE" },
  { id: 1008, numero: "F-0008", cliente: "Centro Médico", fecha: "2025-10-08", total: 90000, pagado: 30000, estado: "PENDIENTE" },
];

const MEDIOS_PAGO = ["Efectivo", "Transferencia", "Tarjeta", "Mercado Pago", "Cheque"];

/** ------------------- Utils ------------------- */
const fmtMoney = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n || 0);

const redondear2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** ------------------- Página ------------------- */
export default function PagoRegistro() {
  const [query, setQuery] = useState("");
  const [factura, setFactura] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [medio, setMedio] = useState("Transferencia");
  const [monto, setMonto] = useState("");
  const [referencia, setReferencia] = useState(""); // nro de operación/comprobante
  const [obs, setObs] = useState("");

  // Filtrado simple de facturas por número o cliente
  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_FACTURAS;
    return MOCK_FACTURAS.filter(
      (f) =>
        f.numero.toLowerCase().includes(q) ||
        f.cliente.toLowerCase().includes(q)
    );
  }, [query]);

  const saldo = useMemo(() => {
    if (!factura) return 0;
    return redondear2((factura.total || 0) - (factura.pagado || 0));
  }, [factura]);

  function validar() {
    const errs = [];
    if (!factura) errs.push("Seleccioná una factura.");
    const m = Number(monto);
    if (!m || m <= 0) errs.push("Ingresá un monto válido (> 0).");
    if (m > saldo) errs.push(`El monto no puede superar el saldo (${fmtMoney(saldo)}).`);
    if (!fecha) errs.push("Seleccioná la fecha de cobro.");
    if (!medio) errs.push("Seleccioná el medio de pago.");
    return errs;
  }

  function onSubmit(e) {
    e.preventDefault();
    const errores = validar();
    if (errores.length) {
      alert("Revisá el formulario:\n- " + errores.join("\n- "));
      return;
    }
    const payload = {
      facturaId: factura.id,
      numeroFactura: factura.numero,
      cliente: factura.cliente,
      fecha,
      medio,
      monto: Number(monto),
      referencia: referencia || null,
      observaciones: obs || null,
    };
    // Solo frontend: mostramos el JSON. Luego harías POST /api/pagos
    alert("Pago registrado (mock):\n" + JSON.stringify(payload, null, 2));
    // Reset suave
    setMonto("");
    setReferencia("");
    setObs("");
  }

  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Registro de Pago</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        {/* Selección de factura */}
        <div style={card}>
          <label style={label}>Factura</label>
          {!factura ? (
            <div style={{ position: "relative" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por Nº de factura o cliente…"
                style={input}
              />
              {query !== "" && (
                <div style={dropdown}>
                  {sugerencias.length ? (
                    sugerencias.map((f) => {
                      const saldoSug = redondear2((f.total || 0) - (f.pagado || 0));
                      return (
                        <div
                          key={f.id}
                          style={dropdownItem}
                          onClick={() => {
                            setFactura(f);
                            setQuery("");
                          }}
                        >
                          <div><b>{f.numero}</b> — {f.cliente}</div>
                          <small style={{ color: "#666" }}>
                            Fecha: {new Date(f.fecha).toLocaleDateString("es-AR")} · Total {fmtMoney(f.total)} · Pagado {fmtMoney(f.pagado)} · Saldo {fmtMoney(saldoSug)} · {f.estado}
                          </small>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: 8, color: "#666" }}>Sin resultados</div>
                  )}
                </div>
              )}
              <small style={{ color: "#666" }}>
                Tip: escribí algo para ver sugerencias. También podés dejar vacío y te listamos todas.
              </small>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={pill}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <b>{factura.numero}</b> — {factura.cliente}
                  <span style={chip}>{factura.estado}</span>
                </div>
                <div style={{ color: "#555" }}>
                  Fecha: {new Date(factura.fecha).toLocaleDateString("es-AR")} · Total {fmtMoney(factura.total)} · Pagado {fmtMoney(factura.pagado)} · <b>Saldo {fmtMoney(saldo)}</b>
                </div>
              </div>
              <button type="button" style={btnLite} onClick={() => setFactura(null)}>Cambiar factura</button>
            </div>
          )}
        </div>

        {/* Datos del pago */}
        <div style={card}>
          <div style={row}>
            <div style={col}>
              <label style={label}>Fecha de cobro</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={input} />
            </div>

            <div style={col}>
              <label style={label}>Medio de pago</label>
              <select value={medio} onChange={(e) => setMedio(e.target.value)} style={input}>
                {MEDIOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={col}>
              <label style={label}>Monto</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                style={input}
                placeholder={saldo ? `Hasta ${fmtMoney(saldo)}` : ""}
              />
              <small style={{ color: "#666" }}>
                {factura ? `Saldo disponible: ${fmtMoney(saldo)}` : "Seleccioná una factura para ver el saldo."}
              </small>
            </div>
          </div>

          <div style={row}>
            <div style={{ ...col, minWidth: 280 }}>
              <label style={label}>Referencia / Nº operación (opcional)</label>
              <input value={referencia} onChange={(e) => setReferencia(e.target.value)} style={input} placeholder="Ej: #TR-123456 / N° cupón" />
            </div>
            <div style={{ ...col, minWidth: 280 }}>
              <label style={label}>Observaciones (opcional)</label>
              <input value={obs} onChange={(e) => setObs(e.target.value)} style={input} placeholder="Notas internas, aclaraciones…" />
            </div>
          </div>
        </div>

        {/* Resumen y acciones */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
          <div />
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #e5e7eb", marginBottom: 8 }}>
              <span style={{ color: "#555" }}>A imputar</span>
              <b>{fmtMoney(Number(monto || 0))}</b>
            </div>
            <div style={{ color: "#666", fontSize: ".9rem" }}>
              {factura
                ? `Saldo actual: ${fmtMoney(saldo)} · Saldo post pago: ${fmtMoney(redondear2(saldo - Number(monto || 0)))}`
                : "Seleccioná factura para ver saldos."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" style={btnLite} onClick={() => window.history.back()}>Cancelar</button>
          <button type="submit" style={btn}>Registrar pago</button>
        </div>
      </form>
    </section>
  );
}

/** ------------------- Estilos ------------------- */
const card = { border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff" };
const row = { display: "flex", gap: 12, flexWrap: "wrap" };
const col = { minWidth: 220, flex: 1 };
const label = { display: "block", fontSize: ".9rem", color: "#333", marginBottom: 6 };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff" };
const btn = { padding: "10px 14px", borderRadius: 10, border: "1px solid #222", background: "#222", color: "#fff", cursor: "pointer" };
const btnLite = { padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "#fff", color: "#222", cursor: "pointer" };
const dropdown = { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, marginTop: 4, maxHeight: 280, overflowY: "auto", zIndex: 20, boxShadow: "0 8px 20px rgba(0,0,0,.08)" };
const dropdownItem = { padding: 10, borderBottom: "1px solid #f2f2f2", cursor: "pointer" };
const pill = { padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, background: "#fafafa" };
const chip = { display: "inline-block", padding: "2px 8px", borderRadius: 999, border: "1px solid #d6dce5", background: "#eef2f7", color: "#2c3e50", fontSize: ".75rem", fontWeight: 600 };
