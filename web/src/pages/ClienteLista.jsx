// web/src/pages/ClienteLista.jsx
import React from "react";
import { useEffect, useRef, useState } from "react";


// Helpers HTTP (fetch nativo)
const API = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:4000/api";

async function apiGetClientes(q = "") {
  const url = new URL(`${API}/clientes`);
  if (q) url.searchParams.set("q", q);
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`GET /clientes -> ${res.status}`);
  return await res.json(); // se espera [{id,nombre,email,telefono,direccion,...}]
}

async function apiUpdateCliente(id, payload) {
  const res = await fetch(`${API}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PUT /clientes/${id} -> ${res.status}`);
  return await res.json();
}

export default function ClienteLista() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // objeto cliente en edición
  const debounceRef = useRef(null);

  async function load(qText = "") {
    try {
      setLoading(true);
      setError("");
      const data = await apiGetClientes(qText.trim());
      setClientes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el listado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(""); }, []);

  // debounce de búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(q), 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function handleSave(values) {
    if (!editing?.id) return;
    try {
      const updated = await apiUpdateCliente(editing.id, values);
      // actualizar en memoria
      setClientes(prev => prev.map(c => (c.id === editing.id ? { ...c, ...updated } : c)));
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar. Revisá el backend y la consola.");
    }
  }

  return (
    <section className="page" style={{ padding: 24 }}>
      <header className="page__header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,marginBottom:16}}>
        <div>
          <h2 style={{margin:0}}>Clientes</h2>
          <p style={{color:"#666",margin:"4px 0 0"}}>Listado con búsqueda y edición.</p>
        </div>
        <div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono…"
            aria-label="Buscar clientes"
            style={{padding:"10px 12px",border:"1px solid #ddd",borderRadius:8,minWidth:260}}
          />
        </div>
      </header>

      <div className="meta" style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
        {loading ? <span>Cargando…</span> : <span>{clientes.length} resultado(s)</span>}
        {error && <span style={{color:"#c62828"}}>{error}</span>}
      </div>

      <div className="table__wrap" style={{overflow:"auto",border:"1px solid #eee",borderRadius:12}}>
        <table className="table" style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#fafafa"}}>
              <th style={th}>Nombre</th>
              <th style={th}>Email</th>
              <th style={th}>Teléfono</th>
              <th style={th}>Dirección</th>
              <th style={{...th, width:110}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && !loading ? (
              <tr><td colSpan={5} style={{padding:16,color:"#666"}}>No hay clientes para mostrar.</td></tr>
            ) : clientes.map((c) => (
              <tr key={c.id}>
                <td style={td}>{c.nombre}</td>
                <td style={td}>{c.email || "-"}</td>
                <td style={td}>{c.telefono || "-"}</td>
                <td style={td}>{c.direccion || "-"}</td>
                <td style={td}>
                  <button className="btn" style={btn} onClick={() => setEditing(c)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {editing && (
        <EditDialog
          cliente={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

/* ---------- estilos inline reusables ----------- */
const th = { padding:"12px", textAlign:"left", borderBottom:"1px solid #f2f2f2", fontWeight:600 };
const td = { padding:"12px", borderBottom:"1px solid #f2f2f2" };
const btn = { padding:"6px 10px", borderRadius:8, border:"1px solid #222", background:"#222", color:"#fff", cursor:"pointer" };

/* ---------- Modal + formulario de edición ---------- */
function EditDialog({ cliente, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: cliente?.nombre || "",
    email: cliente?.email || "",
    telefono: cliente?.telefono || "",
    direccion: cliente?.direccion || "",
  });
  const [saving, setSaving] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.nombre || form.nombre.trim().length < 2) {
      return alert("El nombre es obligatorio (mínimo 2 caracteres).");
    }
    try {
      setSaving(true);
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  function backdrop(e) {
    if (e.target.classList.contains("dialog__backdrop")) onClose?.();
  }

  return (
    <div className="dialog__backdrop"
         onClick={backdrop}
         style={{
           position:"fixed", inset:0, background:"rgba(0,0,0,.25)",
           display:"flex", alignItems:"center", justifyContent:"center",
           padding:16, zIndex:50
         }}>
      <div className="dialog__content"
           style={{width:"100%",maxWidth:520,background:"#fff",borderRadius:16,padding:20,boxShadow:"0 10px 30px rgba(0,0,0,.15)"}}>
        <h3 style={{marginTop:0}}>Editar cliente</h3>
        <form onSubmit={submit}>
          <LabelInput label="Nombre" name="nombre" value={form.nombre} onChange={onChange} required />
          <LabelInput label="Email" name="email" type="email" value={form.email || ""} onChange={onChange} />
          <LabelInput label="Teléfono" name="telefono" value={form.telefono || ""} onChange={onChange} />
          <LabelInput label="Dirección" name="direccion" value={form.direccion || ""} onChange={onChange} />
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
            <button type="button" style={{...btn, background:"#fff", color:"#222"}} onClick={onClose}>Cancelar</button>
            <button type="submit" style={btn} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LabelInput({ label, name, value, onChange, type="text", required=false }) {
  return (
    <label style={{display:"block", marginBottom:12}}>
      <span style={{display:"block", fontSize:".9rem", color:"#333", marginBottom:6}}>{label}{required && " *"}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{width:"100%", padding:"10px 12px", border:"1px solid #ddd", borderRadius:8}}
      />
    </label>
  );
}
