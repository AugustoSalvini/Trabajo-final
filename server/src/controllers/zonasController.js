import { pool } from '../db/pool.js';

/**
 * Controlador para gestión de Zonas
 */

// GET /api/zonas - Obtener todas las zonas activas
export const getZonas = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, descripcion, codigo, tarifa_basica, tarifa_exceso
      FROM zonas 
      WHERE estado = true
      ORDER BY nombre;
    `;
    
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo zonas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/zonas/:id - Obtener una zona por ID
export const getZonaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const query = `
      SELECT id, nombre, descripcion, codigo, tarifa_basica, tarifa_exceso
      FROM zonas 
      WHERE id = $1 AND estado = true;
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Zona no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo zona:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};