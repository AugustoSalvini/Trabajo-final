import { pool } from '../db/pool.js';

/**
 * Controlador para gestión de Clientes
 */

// GET /api/clientes - Obtener todos los clientes
export const getClientes = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.apellido,
        c.dni_o_cuit,
        c.email,
        c.telefono,
        c.direccion,
        c.ciudad,
        c.codigo_postal,
        c.estado,
        c.fecha_registro,
        c.zona_id,
        z.nombre as zona_nombre
      FROM clientes c
      LEFT JOIN zonas z ON c.zona_id = z.id
      WHERE c.estado = true
      ORDER BY c.fecha_registro DESC;
    `;
    
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/clientes/all - Obtener TODOS los clientes (incluyendo eliminados)
export const getAllClientes = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.apellido,
        c.dni_o_cuit,
        c.email,
        c.telefono,
        c.direccion,
        c.ciudad,
        c.codigo_postal,
        c.estado,
        c.fecha_registro,
        c.zona_id,
        z.nombre as zona_nombre,
        CASE 
          WHEN c.estado = true THEN 'Activo'
          ELSE 'Eliminado'
        END as estado_texto
      FROM clientes c
      LEFT JOIN zonas z ON c.zona_id = z.id
      ORDER BY c.fecha_registro DESC;
    `;
    
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo todos los clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/clientes/:id - Obtener un cliente por ID
export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.apellido,
        c.dni_o_cuit,
        c.email,
        c.telefono,
        c.direccion,
        c.ciudad,
        c.codigo_postal,
        c.estado,
        c.fecha_registro,
        c.zona_id,
        z.nombre as zona_nombre
      FROM clientes c
      LEFT JOIN zonas z ON c.zona_id = z.id
      WHERE c.id = $1 AND c.estado = true;
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/clientes - Crear un nuevo cliente
export const createCliente = async (req, res) => {
  try {
    const { nombre, apellido, dniOCuit, email, telefono, direccion, ciudad, codigoPostal, zonaId } = req.body;
    
    // Validaciones básicas
    if (!nombre || !apellido || !dniOCuit || !direccion) {
      return res.status(400).json({ 
        error: 'Los campos nombre, apellido, DNI/CUIT y dirección son obligatorios' 
      });
    }
    
    // Verificar si ya existe un cliente con ese DNI/CUIT
    const existeQuery = 'SELECT id FROM clientes WHERE dni_o_cuit = $1 AND estado = true';
    const existeResult = await pool.query(existeQuery, [dniOCuit]);
    
    if (existeResult.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese DNI/CUIT' });
    }
    
    // Verificar que la zona existe si se proporciona
    if (zonaId) {
      const zonaQuery = 'SELECT id FROM zonas WHERE id = $1 AND estado = true';
      const zonaResult = await pool.query(zonaQuery, [zonaId]);
      
      if (zonaResult.rows.length === 0) {
        return res.status(400).json({ error: 'La zona especificada no existe' });
      }
    }
    
    const query = `
      INSERT INTO clientes (
        nombre, apellido, dni_o_cuit, email, telefono, 
        direccion, ciudad, codigo_postal, zona_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, nombre, apellido, dni_o_cuit, email, 
                telefono, direccion, ciudad, codigo_postal, zona_id, fecha_registro;
    `;
    
    const values = [
      nombre.trim(),
      apellido.trim(),
      dniOCuit.trim(),
      email ? email.trim() : null,
      telefono ? telefono.trim() : null,
      direccion.trim(),
      ciudad || 'No especificada',
      codigoPostal || null,
      zonaId || null
    ];
    
    const { rows } = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente: rows[0]
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    
    // Manejo específico de errores de unicidad
    if (error.code === '23505') {
      if (error.constraint?.includes('dni_o_cuit')) {
        return res.status(409).json({ error: 'Ya existe un cliente con ese DNI/CUIT' });
      }
      if (error.constraint?.includes('email')) {
        return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
      }
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT /api/clientes/:id - Actualizar un cliente
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, dniOCuit, email, telefono, direccion, ciudad, codigoPostal, zonaId } = req.body;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Verificar que el cliente existe
    const existeQuery = 'SELECT id FROM clientes WHERE id = $1 AND estado = true';
    const existeResult = await pool.query(existeQuery, [id]);
    
    if (existeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Validaciones básicas
    if (!nombre || !apellido || !dniOCuit || !direccion) {
      return res.status(400).json({ 
        error: 'Los campos nombre, apellido, DNI/CUIT y dirección son obligatorios' 
      });
    }
    
    // Verificar si ya existe otro cliente con ese DNI/CUIT
    const dniQuery = 'SELECT id FROM clientes WHERE dni_o_cuit = $1 AND id != $2 AND estado = true';
    const dniResult = await pool.query(dniQuery, [dniOCuit, id]);
    
    if (dniResult.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe otro cliente con ese DNI/CUIT' });
    }
    
    // Verificar que la zona existe si se proporciona
    if (zonaId) {
      const zonaQuery = 'SELECT id FROM zonas WHERE id = $1 AND estado = true';
      const zonaResult = await pool.query(zonaQuery, [zonaId]);
      
      if (zonaResult.rows.length === 0) {
        return res.status(400).json({ error: 'La zona especificada no existe' });
      }
    }
    
    const query = `
      UPDATE clientes SET
        nombre = $1,
        apellido = $2,
        dni_o_cuit = $3,
        email = $4,
        telefono = $5,
        direccion = $6,
        ciudad = $7,
        codigo_postal = $8,
        zona_id = $9,
        fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $10 AND estado = true
      RETURNING id, nombre, apellido, dni_o_cuit, email, 
                telefono, direccion, ciudad, codigo_postal, zona_id, fecha_modificacion;
    `;
    
    const values = [
      nombre.trim(),
      apellido.trim(),
      dniOCuit.trim(),
      email ? email.trim() : null,
      telefono ? telefono.trim() : null,
      direccion.trim(),
      ciudad || 'No especificada',
      codigoPostal || null,
      zonaId || null,
      id
    ];
    
    const { rows } = await pool.query(query, values);
    
    res.json({
      message: 'Cliente actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    
    // Manejo específico de errores de unicidad
    if (error.code === '23505') {
      if (error.constraint?.includes('dni_o_cuit')) {
        return res.status(409).json({ error: 'Ya existe otro cliente con ese DNI/CUIT' });
      }
      if (error.constraint?.includes('email')) {
        return res.status(409).json({ error: 'Ya existe otro cliente con ese email' });
      }
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/clientes/:id - Eliminar un cliente FÍSICAMENTE (hard delete)
export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Verificar que el cliente existe
    const existeQuery = 'SELECT id, nombre, apellido FROM clientes WHERE id = $1 AND estado = true';
    const existeResult = await pool.query(existeQuery, [id]);
    
    if (existeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    const cliente = existeResult.rows[0];
    
    // Eliminar FÍSICAMENTE el registro
    const query = 'DELETE FROM clientes WHERE id = $1';
    await pool.query(query, [id]);
    
    res.json({
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    
    // Manejo de errores de integridad referencial
    if (error.code === '23503') {
      return res.status(409).json({ 
        error: 'No se puede eliminar el cliente porque tiene registros relacionados (medidores, lecturas, etc.)' 
      });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/clientes/:id/restore - Restaurar un cliente eliminado
export const restoreCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Verificar que el cliente existe y está eliminado
    const existeQuery = 'SELECT id, nombre, apellido FROM clientes WHERE id = $1 AND estado = false';
    const existeResult = await pool.query(existeQuery, [id]);
    
    if (existeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado o ya está activo' });
    }
    
    // Restaurar cliente
    const query = `
      UPDATE clientes SET
        estado = true,
        fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, nombre, apellido;
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    res.json({
      message: 'Cliente restaurado exitosamente'
    });
  } catch (error) {
    console.error('Error restaurando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/clientes/:id/deactivate - Desactivar un cliente (soft delete)
export const deactivateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Verificar que el cliente existe
    const existeQuery = 'SELECT id, nombre, apellido FROM clientes WHERE id = $1 AND estado = true';
    const existeResult = await pool.query(existeQuery, [id]);
    
    if (existeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Soft delete: marcar como inactivo
    const query = `
      UPDATE clientes SET
        estado = false,
        fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, nombre, apellido;
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    res.json({
      message: 'Cliente desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error desactivando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/clientes/cleanup - Eliminar FÍSICAMENTE todos los clientes desactivados
export const cleanupClientes = async (req, res) => {
  try {
    // Obtener clientes desactivados antes de eliminarlos
    const selectQuery = 'SELECT id, nombre, apellido FROM clientes WHERE estado = false';
    const selectResult = await pool.query(selectQuery);
    
    if (selectResult.rows.length === 0) {
      return res.json({
        message: 'No hay clientes desactivados para eliminar',
        eliminados: 0
      });
    }
    
    // Eliminar físicamente todos los clientes desactivados
    const deleteQuery = 'DELETE FROM clientes WHERE estado = false';
    const deleteResult = await pool.query(deleteQuery);
    
    res.json({
      message: `${deleteResult.rowCount} clientes eliminados permanentemente`,
      eliminados: deleteResult.rowCount,
      clientes: selectResult.rows
    });
  } catch (error) {
    console.error('Error eliminando clientes desactivados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};