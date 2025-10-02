import express from 'express';
import {
  getClientes,
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  restoreCliente,
  deactivateCliente,
  cleanupClientes
} from '../controllers/clientesController.js';

const router = express.Router();

// DELETE /api/clientes/cleanup - Limpiar clientes desactivados PERMANENTEMENTE (DEBE IR ANTES que /:id)
router.delete('/cleanup', cleanupClientes);

// GET /api/clientes - Obtener clientes activos
router.get('/', getClientes);

// GET /api/clientes/all - Obtener TODOS los clientes (incluyendo eliminados)
router.get('/all', getAllClientes);

// GET /api/clientes/:id - Obtener un cliente por ID
router.get('/:id', getClienteById);

// POST /api/clientes - Crear un nuevo cliente
router.post('/', createCliente);

// PUT /api/clientes/:id - Actualizar un cliente
router.put('/:id', updateCliente);

// DELETE /api/clientes/:id - Eliminar un cliente FÍSICAMENTE (hard delete)
router.delete('/:id', deleteCliente);

// PATCH /api/clientes/:id/restore - Restaurar un cliente eliminado
router.patch('/:id/restore', restoreCliente);

// PATCH /api/clientes/:id/deactivate - Desactivar un cliente (soft delete)
router.patch('/:id/deactivate', deactivateCliente);

export default router;