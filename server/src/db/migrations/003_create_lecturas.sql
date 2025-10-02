-- Migración 003: Crear tabla de lecturas
-- Fecha: 2025-10-01
-- Descripción: Tabla para almacenar las lecturas de consumo de agua

CREATE TABLE IF NOT EXISTS lecturas (
    id SERIAL PRIMARY KEY,
    medidor_id INTEGER NOT NULL,
    fecha_lectura DATE NOT NULL,
    lectura_anterior DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    lectura_actual DECIMAL(10,2) NOT NULL,
    consumo DECIMAL(10,2) GENERATED ALWAYS AS (lectura_actual - lectura_anterior) STORED,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    observaciones TEXT,
    lector_nombre VARCHAR(100),
    estado_lectura VARCHAR(20) DEFAULT 'Válida' CHECK (estado_lectura IN ('Válida', 'Estimada', 'Anulada')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Clave foránea
    CONSTRAINT fk_lecturas_medidor FOREIGN KEY (medidor_id) REFERENCES medidores(id) ON DELETE CASCADE,
    
    -- Restricciones de negocio
    CONSTRAINT chk_lectura_positiva CHECK (lectura_actual >= lectura_anterior),
    CONSTRAINT chk_periodo_valido CHECK (periodo_fin > periodo_inicio)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_lecturas_medidor_id ON lecturas(medidor_id);
CREATE INDEX IF NOT EXISTS idx_lecturas_fecha ON lecturas(fecha_lectura);
CREATE INDEX IF NOT EXISTS idx_lecturas_periodo ON lecturas(periodo_inicio, periodo_fin);
CREATE INDEX IF NOT EXISTS idx_lecturas_estado ON lecturas(estado_lectura);

-- Índice único para evitar lecturas duplicadas por período
CREATE UNIQUE INDEX IF NOT EXISTS idx_lecturas_unicas 
ON lecturas(medidor_id, periodo_inicio, periodo_fin) 
WHERE estado_lectura != 'Anulada';

-- Trigger para actualizar fecha_modificacion
CREATE TRIGGER trigger_lecturas_update_fecha_modificacion
    BEFORE UPDATE ON lecturas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_modificacion();