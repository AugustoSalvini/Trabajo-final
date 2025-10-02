-- Migración 001: Crear tabla de clientes
-- Fecha: 2025-10-01
-- Descripción: Tabla principal para almacenar información de clientes

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) DEFAULT 'No especificada',
    codigo_postal VARCHAR(10),
    estado BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);

-- Trigger para actualizar fecha_modificacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clientes_update_fecha_modificacion
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_modificacion();