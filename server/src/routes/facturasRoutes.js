import express from 'express';
import {
  getFacturas,
  getFacturaById,
  getFacturasPorCliente,
  createFactura,
  marcarFacturaComoPagada
} from '../controllers/facturasController.js';

const router = express.Router();

router.get('/', getFacturas); // todas las facturas
router.get('/:id', getFacturaById); // una sola factura por ID
router.get('/cliente/:id', getFacturasPorCliente); // 🆕 todas las facturas por cliente
router.post('/', createFactura); // 🆕 emitir nueva factura
router.patch('/:id/pagar', marcarFacturaComoPagada);


export default router;
