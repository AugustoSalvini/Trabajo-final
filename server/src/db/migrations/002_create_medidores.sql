-- Migración 002: Crear tabla de medidores
-- Fecha: 2025-10-01
-- Descripción: Tabla para almacenar información de medidores de agua

CREATE TABLE IF NOT EXISTS medidores (
    id SERIAL PRIMARY KEY,
    numero_medidor VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL,
    tipo_medidor VARCHAR(50) DEFAULT 'Residencial',
    marca VARCHAR(100),
    modelo VARCHAR(100),
    fecha_instalacion DATE NOT NULL,
    ubicacion TEXT,
    lectura_inicial DECIMAL(10,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Mantenimiento', 'Retirado')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Clave foránea
    CONSTRAINT fk_medidores_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_medidores_numero ON medidores(numero_medidor);
CREATE INDEX IF NOT EXISTS idx_medidores_cliente_id ON medidores(cliente_id);
CREATE INDEX IF NOT EXISTS idx_medidores_estado ON medidores(estado);

-- Trigger para actualizar fecha_modificacion
CREATE TRIGGER trigger_medidores_update_fecha_modificacion
    BEFORE UPDATE ON medidores
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_modificacion();