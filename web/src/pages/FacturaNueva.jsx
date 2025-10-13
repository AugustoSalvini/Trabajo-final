import React, { useMemo, useState } from "react";

/** ------------------- MOCKS (podés reemplazar por datos de API) ------------------- */
const MOCK_CLIENTES = [
  { id: 1, nombre: "Juan Pérez", dni: "30-12345678-9" },
  { id: 2, nombre: "María López", dni: "20-87654321-0" },
  { id: 3, nombre: "Whiteglass SRL", dni: "30-20304050-6" },
];

const MOCK_PRODUCTOS = [
  { id: "p1", nombre: "Servicio de mantenimiento", precio: 25000 },
  { id: "p2", nombre: "Repuesto A", precio: 12000 },
  { id: "p3", nombre: "Repuesto B", precio: 7800 },
];

/** ------------------- Utils ------------------- */
const fmtMoney = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n || 0);

const redondear2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** ------------------- Página ------------------- */
export default function FacturaNueva() {
  const [cliente, setCliente] = useState(null);
  const [clienteQuery, setClienteQuery] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState("B"); // A | B | C
  const [condIva, setCondIva] = useState("Responsable Inscripto");
  const [alicuota, setAlicuota] = useState(21); // 0 | 10.5 | 21
  const [descuento, setDescuento] = useState(0); // %
  const [obs, setObs] = useState("");

  const [items, setItems] = useState([
    { id: 1, producto: null, descripcion: "", cantidad: 1, precio: 0 },
  ]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, producto: null, descripcion: "", cantidad: 1, precio: 0 },
    ]);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function onChangeItem(id, patch) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  // Autocomplete simple de clientes
  const clientesFiltrados = useMemo(() => {
    const q = clienteQuery.trim().toLowerCase();
    if (!q) return MOCK_CLIENTES;
    return MOCK_CLIENTES.filter((c) => c.nombre.toLowerCase().includes(q) || (c.dni || "").toLowerCase().includes(q));
  }, [clienteQuery]);

  // Cálculos
  const subtotal = useMemo(() => {
    const st = items.reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precio) || 0), 0);
    const desc = st * (Number(descuento) / 100 || 0);
    return redondear2(st - desc);
  }, [items, descuento]);

  const iva = useMemo(() => redondear2(subtotal * (Number(alicuota) / 100)), [subtotal, alicuota]);
  const total = useMemo(() => redondear2(subtotal + iva), [subtotal, iva]);

  function validar() {
    const errores = [];
    if (!cliente) errores.push("Seleccioná un cliente.");
    if (!fecha) errores.push("Seleccioná la fecha.");
    if (!items.length) errores.push("Agregá al menos un ítem.");
    items.forEach((i, idx) => {
      if (!i.descripcion && !i.producto) errores.push(`Ítem #${idx + 1}: falta descripción o producto.`);
      if (!Number(i.cantidad) || Number(i.cantidad) <= 0) errores.push(`Ítem #${idx + 1}: cantidad inválida.`);
      if (!Number(i.precio) || Number(i.precio) < 0) errores.push(`Ítem #${idx + 1}: precio inválido.`);
    });
    return errores;
  }

  function onSubmit(e) {
    e.preventDefault();
    const errores = validar();
    if (errores.length) {
      alert("Revisá el formulario:\n- " + errores.join("\n- "));
      return;
    }

    const payload = {
      tipo,
      fecha,
      cliente: { id: cliente.id, nombre: cliente.nombre, dni: cliente.dni },
      condIva,
      alicuota: Number(alicuota),
      descuento: Number(descuento),
      items: items.map(({ id, producto, descripcion, cantidad, precio }) => ({
        descripcion: descripcion || producto?.nombre || "",
        productoId: producto?.id ?? null,
        cantidad: Number(cantidad),
        precioUnit: Number(precio),
        importe: redondear2(Number(cantidad) * Number(precio)),
      })),
      subtotal,
      iva,
      total,
      observaciones: obs,
    };

    // Solo frontend: mostrás el JSON. Luego lo enviarías al backend.
    alert("Factura generada (mock):\n" + JSON.stringify(payload, null, 2));
  }

  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Emisión de Factura</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        {/* Cabecera */}
        <div style={card}>
          <div style={row}>
            <div style={col}>
              <label style={label}>Cliente</label>
              <div style={{ position: "relative" }}>
                {!cliente ? (
                  <>
                    <input
                      value={clienteQuery}
                      onChange={(e) => setClienteQuery(e.target.value)}
                      placeholder="Buscar cliente por nombre o DNI/CUIT…"
                      style={input}
                    />
                    {clienteQuery && (
                      <div style={dropdown}>
                        {clientesFiltrados.length ? (
                          clientesFiltrados.map((c) => (
                            <div
                              key={c.id}
                              style={dropdownItem}
                              onClick={() => {
                                setCliente(c);
                                setClienteQuery("");
                              }}
                            >
                              {c.nombre} {c.dni ? `— ${c.dni}` : ""}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: 8, color: "#666" }}>Sin resultados</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, background: "#fafafa" }}>
                      <b>{cliente.nombre}</b> {cliente.dni ? `— ${cliente.dni}` : ""}
                    </div>
                    <button type="button" style={btnLite} onClick={() => setCliente(null)}>Cambiar</button>
                  </div>
                )}
              </div>
            </div>

            <div style={col}>
              <label style={label}>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={input} />
            </div>

            <div style={col}>
              <label style={label}>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={input}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <div style={col}>
              <label style={label}>Condición IVA</label>
              <select value={condIva} onChange={(e) => setCondIva(e.target.value)} style={input}>
                <option>Responsable Inscripto</option>
                <option>Monotributo</option>
                <option>Exento</option>
                <option>Consumidor Final</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ítems */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Ítems</h3>
            <button type="button" style={btn} onClick={addItem}>+ Agregar ítem</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <Th style={{ minWidth: 220 }}>Producto / Descripción</Th>
                  <Th style={{ width: 110, textAlign: "right" }}>Cantidad</Th>
                  <Th style={{ width: 160, textAlign: "right" }}>Precio unitario</Th>
                  <Th style={{ width: 160, textAlign: "right" }}>Importe</Th>
                  <Th style={{ width: 80 }}></Th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((it) => {
                    const importe = redondear2((Number(it.cantidad) || 0) * (Number(it.precio) || 0));
                    return (
                      <tr key={it.id}>
                        <Td>
                          {/* selector de producto rápido */}
                          <div style={{ display: "grid", gap: 6 }}>
                            <select
                              value={it.producto?.id || ""}
                              onChange={(e) => {
                                const prod = MOCK_PRODUCTOS.find((p) => p.id === e.target.value) || null;
                                onChangeItem(it.id, {
                                  producto: prod,
                                  descripcion: prod ? prod.nombre : it.descripcion,
                                  precio: prod ? prod.precio : it.precio,
                                });
                              }}
                              style={input}
                            >
                              <option value="">— Seleccionar producto (opcional) —</option>
                              {MOCK_PRODUCTOS.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.nombre} — {fmtMoney(p.precio)}
                                </option>
                              ))}
                            </select>

                            <input
                              placeholder="Descripción del ítem"
                              value={it.descripcion}
                              onChange={(e) => onChangeItem(it.id, { descripcion: e.target.value })}
                              style={input}
                            />
                          </div>
                        </Td>

                        <Td align="right">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={it.cantidad}
                            onChange={(e) => onChangeItem(it.id, { cantidad: e.target.value })}
                            style={{ ...input, textAlign: "right" }}
                          />
                        </Td>

                        <Td align="right">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={it.precio}
                            onChange={(e) => onChangeItem(it.id, { precio: e.target.value })}
                            style={{ ...input, textAlign: "right" }}
                          />
                        </Td>

                        <Td align="right">{fmtMoney(importe)}</Td>

                        <Td align="center">
                          <button type="button" style={btnDanger} onClick={() => removeItem(it.id)}>Eliminar</button>
                        </Td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <Td colSpan={5} style={{ color: "#666" }}>No hay ítems. Agregá alguno con el botón de arriba.</Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 380px" }}>
          <div style={card}>
            <label style={label}>Observaciones</label>
            <textarea rows={4} value={obs} onChange={(e) => setObs(e.target.value)} style={{ ...input, resize: "vertical" }} />
          </div>

          <div style={card}>
            <div style={row}>
              <div style={{ ...col, flex: 1 }}>
                <label style={label}>Descuento (%)</label>
                <input type="number" min={0} max={100} step="0.5" value={descuento} onChange={(e) => setDescuento(e.target.value)} style={input} />
              </div>
              <div style={{ ...col, flex: 1 }}>
                <label style={label}>Alicuota IVA</label>
                <select value={alicuota} onChange={(e) => setAlicuota(e.target.value)} style={input}>
                  <option value={0}>0%</option>
                  <option value={10.5}>10.5%</option>
                  <option value={21}>21%</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 8, borderTop: "1px dashed #e5e7eb", paddingTop: 12 }}>
              <TotalRow label="Subtotal" value={fmtMoney(subtotal)} />
              <TotalRow label={`IVA ${alicuota}%`} value={fmtMoney(iva)} />
              <TotalRow label="Total" value={fmtMoney(total)} strong />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" style={btnLite} onClick={() => window.history.back()}>Cancelar</button>
          <button type="submit" style={btn}>Emitir factura</button>
        </div>
      </form>
    </section>
  );
}

/** ------------------- Subcomponentes y estilos ------------------- */
function Th({ children, style }) {
  return <th style={{ padding: 12, borderBottom: "1px solid #f2f2f2", textAlign: "left", fontWeight: 600, ...style }}>{children}</th>;
}
function Td({ children, align = "left", colSpan, style }) {
  return <td colSpan={colSpan} style={{ padding: 12, borderBottom: "1px solid #f2f2f2", textAlign: align, ...style }}>{children}</td>;
}
function TotalRow({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
      <span style={{ color: "#555" }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 600 }}>{value}</span>
    </div>
  );
}

const card = { border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff" };
const row = { display: "flex", gap: 12, flexWrap: "wrap" };
const col = { minWidth: 220, flex: 1 };
const label = { display: "block", fontSize: ".9rem", color: "#333", marginBottom: 6 };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff" };
const btn = { padding: "10px 14px", borderRadius: 10, border: "1px solid #222", background: "#222", color: "#fff", cursor: "pointer" };
const btnLite = { padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "#fff", color: "#222", cursor: "pointer" };
const btnDanger = { padding: "6px 10px", borderRadius: 8, border: "1px solid #b00020", background: "#fff", color: "#b00020", cursor: "pointer" };
