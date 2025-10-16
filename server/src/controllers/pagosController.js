import { pool } from '../db/pool.js';

/**
 * POST /api/pagos - Registrar nuevo pago
 */
export const registrarPago = async (req, res) => {
  try {
    const { factura_id, monto_pagado, metodo_pago, observaciones } = req.body;

    // Validación básica
    if (!factura_id || isNaN(monto_pagado)) {
      return res.status(400).json({ error: 'Factura y monto son obligatorios' });
    }

    // Verificar existencia de factura
    const facturaResult = await pool.query('SELECT total, estado_factura FROM facturas WHERE id = $1', [factura_id]);
    if (facturaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const factura = facturaResult.rows[0];

    if (factura.estado_factura === 'Pagada') {
      return res.status(400).json({ error: 'La factura ya está pagada' });
    }

    // Registrar el pago
    const insert = `
      INSERT INTO pagos (factura_id, monto_pagado, metodo_pago, observaciones)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(insert, [
      factura_id,
      monto_pagado,
      metodo_pago || null,
      observaciones || null
    ]);

    // Si el monto coincide con el total exacto, marcamos factura como pagada
    if (parseFloat(monto_pagado) >= parseFloat(factura.total)) {
      await pool.query(`
        UPDATE facturas
        SET estado_factura = 'Pagada',
            fecha_pago = CURRENT_DATE
        WHERE id = $1
      `, [factura_id]);
    }

    res.status(201).json({
      message: 'Pago registrado correctamente',
      pago: rows[0]
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * GET /api/pagos - Listar todos los pagos
 */
export const listarPagos = async (_req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.factura_id,
        f.numero_factura,
        f.cliente_id,
        p.fecha_pago,
        p.monto_pagado,
        p.metodo_pago,
        p.observaciones
      FROM pagos p
      LEFT JOIN facturas f ON p.factura_id = f.id
      ORDER BY p.fecha_pago DESC
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
