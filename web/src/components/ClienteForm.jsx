import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearCliente, getZonas } from "../services/api";

// Validación (igual que la tuya, con mínimos ajustes)
const schema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido: z.string().min(2, "Mínimo 2 caracteres"),
  dniOCuit: z.string().regex(/^\d+$/, "Solo números").min(7, "Min 7 dígitos").max(11, "Max 11 dígitos"),
  direccion: z.string().min(5, "Dirección demasiado corta"),
  zonaId: z.string().min(1, "Selecciona una zona")
});

export default function ClienteForm() {
  const [zonas, setZonas] = useState([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [serverMsg, setServerMsg] = useState(null);
  const [serverErr, setServerErr] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur"
  });

  // Cargar zonas del backend
  useEffect(() => {
    (async () => {
      try {
        const data = await getZonas();
        setZonas(data);
      } catch {
        setServerErr("No se pudieron cargar las zonas.");
      } finally {
        setLoadingZonas(false);
      }
    })();
  }, []);

  // Normaliza strings (trim)
  const tidy = (v) => (typeof v === "string" ? v.trim() : v);

  const onSubmit = async (values) => {
    setServerMsg(null);
    setServerErr(null);
    const payload = {
      nombre: tidy(values.nombre),
      apellido: tidy(values.apellido),
      dniOCuit: tidy(values.dniOCuit),
      direccion: tidy(values.direccion),
      zonaId: Number(values.zonaId)
    };

    try {
      const resp = await crearCliente(payload);
      setServerMsg(resp?.message || "Registrado con éxito.");
      reset();
    } catch (e) {
      setServerErr(e?.response?.data?.error || "Error al registrar.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 16, marginTop: 16 }}>
      {/* Nombre */}
      <label className="field">
        Nombre *
        <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2-8 4.5V21h16v-2.5C20 16 16.4 14 12 14Z" />
        </svg>
        <input type="text" aria-invalid={!!errors.nombre} {...register("nombre")} />
        {errors.nombre && <span className="msg err">{errors.nombre.message}</span>}
      </label>

      {/* Apellido */}
      <label className="field">
        Apellido *
        <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2-8 4.5V21h16v-2.5C20 16 16.4 14 12 14Z" />
        </svg>
        <input type="text" aria-invalid={!!errors.apellido} {...register("apellido")} />
        {errors.apellido && <span className="msg err">{errors.apellido.message}</span>}
      </label>

      {/* DNI/CUIT */}
      <label className="field">
        DNI o CUIT *
        <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm2 4h12v2H6V8Zm0 4h8v2H6v-2Z" />
        </svg>
        <input type="text" inputMode="numeric" aria-invalid={!!errors.dniOCuit} {...register("dniOCuit")} />
        {errors.dniOCuit && <span className="msg err">{errors.dniOCuit.message}</span>}
      </label>

      {/* Dirección */}
      <label className="field">
        Dirección *
        <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
        </svg>
        <input type="text" aria-invalid={!!errors.direccion} {...register("direccion")} />
        {errors.direccion && <span className="msg err">{errors.direccion.message}</span>}
      </label>

      {/* Zona */}
      <label>
        Zona *
        <select aria-invalid={!!errors.zonaId} disabled={loadingZonas} {...register("zonaId")}>
          <option value="">{loadingZonas ? "Cargando zonas..." : "Seleccionar…"}</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </select>
        {errors.zonaId && <span className="msg err">{errors.zonaId.message}</span>}
      </label>

      {/* Botones / Estados */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Registrar"}
        </button>
        <button type="button" onClick={() => reset()} disabled={isSubmitting}>
          Limpiar
        </button>
      </div>

      {serverMsg && <p className="msg ok">{serverMsg}</p>}
      {serverErr && <p className="msg err">{serverErr}</p>}
      <p style={{ marginTop: 4, color: "#667085" }}>Campos con * son obligatorios.</p>
    </form>
  );
}
