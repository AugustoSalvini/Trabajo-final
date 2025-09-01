import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const zonas = [
  { id: 1, nombre: "Centro" },
  { id: 2, nombre: "Norte" },
  { id: 3, nombre: "Sur" },
  { id: 4, nombre: "Este" },
  { id: 5, nombre: "Oeste" }
];

app.get("/api/zonas", (req, res) => {
  res.json(zonas);
});

app.post("/api/clientes", (req, res) => {
  const { nombre, apellido, dniOCuit, direccion, zonaId } = req.body;

  if (!nombre || !apellido || !dniOCuit || !direccion || !zonaId) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  const zona = zonas.find(z => z.id === Number(zonaId));
  if (!zona) return res.status(400).json({ error: "Zona inválida." });

  const clienteId = Math.floor(Math.random() * 100000);
  const adhesionId = Math.floor(Math.random() * 100000);
  const fechaAlta = new Date().toISOString().split("T")[0];

  const cliente = {
    id: clienteId,
    nombre,
    apellido,
    dniOCuit,
    direccion,
    zonaId: Number(zonaId)
  };

  const adhesion = {
    id: adhesionId,
    clienteId,
    zonaId: Number(zonaId),
    fechaAlta,
    estado: "activa"
  };

  return res.status(201).json({
    message: "Cliente registrado y adhesión creada.",
    cliente,
    adhesion
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
