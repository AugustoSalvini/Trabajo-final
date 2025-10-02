import express from 'express';
import { getZonas, getZonaById } from '../controllers/zonasController.js';

const router = express.Router();

// GET /api/zonas - Obtener todas las zonas
router.get('/', getZonas);

// GET /api/zonas/:id - Obtener una zona por ID
router.get('/:id', getZonaById);

export default router;