import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { pool, assertDb } from './db/pool.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Endpoint de prueba
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Servidor backend funcionando" });
});

// Ruta simple para ver que el server responde
app.get('/', (_req, res) => res.json({ ok: true, msg: 'API Aguas' }));

// Health de DB: pingea PostgreSQL
app.get('/health', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 AS ok');
    res.json({ db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ db: false, error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  try {
    await assertDb(); // loguea NOW si conecta
  } catch (e) {
    console.error('❌ Error conectando a PostgreSQL:', e.message);
  }
});
