-- Migración 008: Crear tabla de pagos
-- Fecha: 2025-10-15

CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY,
  factura_id INTEGER NOT NULL,
  fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
  monto_pagado DECIMAL(10,2) NOT NULL CHECK (monto_pagado >= 0),
  metodo_pago VARCHAR(50),
  observaciones TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Relación con facturas
  CONSTRAINT fk_pagos_factura FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_pagos_factura_id ON pagos(factura_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos(fecha_pago);
