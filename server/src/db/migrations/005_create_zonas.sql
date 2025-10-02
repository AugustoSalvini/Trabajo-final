-- Migración 005: Crear tabla de zonas
-- Fecha: 2025-10-01
-- Descripción: Tabla para almacenar las zonas de servicio

CREATE TABLE IF NOT EXISTS zonas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    codigo VARCHAR(20) UNIQUE,
    tarifa_basica DECIMAL(10,2) DEFAULT 0.00,
    tarifa_exceso DECIMAL(10,2) DEFAULT 0.00,
    estado BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_zonas_nombre ON zonas(nombre);
CREATE INDEX IF NOT EXISTS idx_zonas_codigo ON zonas(codigo);
CREATE INDEX IF NOT EXISTS idx_zonas_estado ON zonas(estado);

-- Trigger para actualizar fecha_modificacion
CREATE TRIGGER trigger_zonas_update_fecha_modificacion
    BEFORE UPDATE ON zonas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_modificacion();

-- Insertar algunas zonas de ejemplo
INSERT INTO zonas (nombre, descripcion, codigo, tarifa_basica, tarifa_exceso) VALUES
('Centro', 'Zona céntrica de la ciudad', 'ZN001', 15.50, 8.75),
('Norte', 'Zona norte residencial', 'ZN002', 12.30, 6.50),
('Sur', 'Zona sur industrial', 'ZN003', 18.00, 10.25),
('Este', 'Zona este comercial', 'ZN004', 16.75, 9.00),
('Oeste', 'Zona oeste residencial', 'ZN005', 14.25, 7.80)
ON CONFLICT (nombre) DO NOTHING;