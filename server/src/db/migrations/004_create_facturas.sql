-- Migración 004: Crear tabla de facturas
-- Fecha: 2025-10-01
-- Descripción: Tabla para almacenar las facturas generadas

CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    lectura_id INTEGER NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    periodo_facturado_inicio DATE NOT NULL,
    periodo_facturado_fin DATE NOT NULL,
    
    -- Detalles de consumo
    consumo_m3 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tarifa_basica DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tarifa_exceso DECIMAL(10,2) DEFAULT 0.00,
    
    -- Montos
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descuentos DECIMAL(10,2) DEFAULT 0.00,
    recargos DECIMAL(10,2) DEFAULT 0.00,
    impuestos DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    
    -- Estado y pagos
    estado_factura VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado_factura IN ('Pendiente', 'Pagada', 'Vencida', 'Anulada')),
    fecha_pago DATE,
    metodo_pago VARCHAR(50),
    observaciones TEXT,
    
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    CONSTRAINT fk_facturas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_facturas_lectura FOREIGN KEY (lectura_id) REFERENCES lecturas(id) ON DELETE RESTRICT,
    
    -- Restricciones de negocio
    CONSTRAINT chk_fecha_vencimiento CHECK (fecha_vencimiento > fecha_emision),
    CONSTRAINT chk_periodo_facturado CHECK (periodo_facturado_fin > periodo_facturado_inicio),
    CONSTRAINT chk_montos_positivos CHECK (subtotal >= 0 AND total >= 0)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_emision ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_vencimiento ON facturas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_periodo ON facturas(periodo_facturado_inicio, periodo_facturado_fin);

-- Trigger para actualizar fecha_modificacion
CREATE TRIGGER trigger_facturas_update_fecha_modificacion
    BEFORE UPDATE ON facturas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_modificacion();