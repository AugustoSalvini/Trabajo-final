-- Migración 006: Actualizar tabla clientes para coincir con el frontend
-- Fecha: 2025-10-01
-- Descripción: Agregar relación con zonas y ajustar campos según el formulario

-- Agregar columna zona_id a la tabla clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS zona_id INTEGER;

-- Agregar la clave foránea hacia zonas
ALTER TABLE clientes 
ADD CONSTRAINT fk_clientes_zona 
FOREIGN KEY (zona_id) REFERENCES zonas(id) ON DELETE SET NULL;

-- Renombrar la columna documento a dni_o_cuit para coincidir con el frontend
ALTER TABLE clientes 
RENAME COLUMN documento TO dni_o_cuit;

-- Actualizar el índice
DROP INDEX IF EXISTS idx_clientes_documento;
CREATE INDEX IF NOT EXISTS idx_clientes_dni_o_cuit ON clientes(dni_o_cuit);

-- Índice para la nueva relación con zonas
CREATE INDEX IF NOT EXISTS idx_clientes_zona_id ON clientes(zona_id);