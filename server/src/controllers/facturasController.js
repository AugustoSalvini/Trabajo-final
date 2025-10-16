// controllers/facturasController.js
import { pool } from '../db/pool.js';

/**
 * Controlador de Facturas
 */

// GET /api/facturas - Listar todas las facturas
export const getFacturas = async (req, res) => {
  try {
    await actualizarFacturasVencidas();

    const query = `
      SELECT 
        f.id,
        f.numero_factura,
        f.cliente_id,
        c.nombre || ' ' || c.apellido AS cliente_nombre,
        f.fecha_emision,
        f.fecha_vencimiento,
        f.consumo_m3,
        f.subtotal,
        f.total,
        f.estado_factura
      FROM facturas f
      LEFT JOIN clientes c ON f.cliente_id = c.id
      ORDER BY f.fecha_emision DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/facturas/:id - Obtener una factura por ID
export const getFacturaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const query = `
      SELECT 
        f.*,
        c.nombre || ' ' || c.apellido AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON f.cliente_id = c.id
      WHERE f.id = $1
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/facturas - Crear una nueva factura
export const createFactura = async (req, res) => {
  try {
    const {
      cliente_id,
      lectura_id,
      numero_factura,
      fecha_vencimiento,
      periodo_facturado_inicio,
      periodo_facturado_fin,
      consumo_m3,
      tarifa_basica,
      tarifa_exceso,
      subtotal,
      descuentos,
      recargos,
      impuestos,
      total,
      metodo_pago,
      observaciones
    } = req.body;

    const query = `
      INSERT INTO facturas (
        cliente_id, lectura_id, numero_factura, fecha_emision, fecha_vencimiento,
        periodo_facturado_inicio, periodo_facturado_fin, consumo_m3,
        tarifa_basica, tarifa_exceso, subtotal, descuentos, recargos,
        impuestos, total, estado_factura, metodo_pago, observaciones
      ) VALUES (
        $1, $2, $3, CURRENT_DATE, $4,
        $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, 'Pendiente', $15, $16
      )
      RETURNING *
    `;

    const values = [
      cliente_id,
      lectura_id,
      numero_factura,
      fecha_vencimiento,
      periodo_facturado_inicio,
      periodo_facturado_fin,
      consumo_m3,
      tarifa_basica,
      tarifa_exceso,
      subtotal,
      descuentos,
      recargos,
      impuestos,
      total,
      metodo_pago,
      observaciones
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json({
      message: 'Factura creada exitosamente',
      factura: rows[0]
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    if (error.code === '23505' && error.constraint?.includes('numero_factura')) {
      return res.status(409).json({ error: 'El número de factura ya existe' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/facturas/cliente/:id - Obtener todas las facturas de un cliente
export const getFacturasPorCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await actualizarFacturasVencidas();

    const query = `
      SELECT 
        f.id,
        f.numero_factura,
        f.fecha_emision,
        f.periodo_facturado_inicio,
        f.periodo_facturado_fin,
        f.consumo_m3,
        f.total,
        f.estado_factura
      FROM facturas f
      WHERE f.cliente_id = $1
      ORDER BY f.fecha_emision DESC
    `;

    const { rows } = await pool.query(query, [id]);

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo facturas por cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/facturas/:id/pagar - Marcar factura como pagada
export const marcarFacturaComoPagada = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar existencia
    const existe = await pool.query('SELECT * FROM facturas WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const factura = existe.rows[0];

    if (factura.estado_factura === 'Pagada') {
      return res.status(400).json({ error: 'La factura ya está marcada como pagada' });
    }

    const query = `
      UPDATE facturas
      SET estado_factura = 'Pagada',
          fecha_pago = CURRENT_DATE
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);

    res.json({
      message: 'Factura marcada como pagada',
      factura: rows[0]
    });
  } catch (error) {
    console.error('Error al marcar factura como pagada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualiza todas las facturas vencidas (si fecha_vencimiento < hoy y no están pagadas)
export const actualizarFacturasVencidas = async () => {
  const query = `
    UPDATE facturas
    SET estado_factura = 'Vencida'
    WHERE estado_factura = 'Pendiente'
    AND fecha_vencimiento < CURRENT_DATE
  `;
  await pool.query(query);
};

