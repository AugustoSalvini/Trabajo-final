import express from 'express';
import { registrarPago, listarPagos } from '../controllers/pagosController.js';

const router = express.Router();

// POST /api/pagos - Registrar un nuevo pago
router.post('/', registrarPago);

// GET /api/pagos - Listar todos los pagos
router.get('/', listarPagos);

export default router;
