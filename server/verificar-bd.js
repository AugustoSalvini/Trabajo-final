import { pool } from './src/db/pool.js';

async function verificarBD() {
  try {
    // Verificar tablas
    const tablas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas creadas:');
    tablas.rows.forEach(row => console.log('  ✅', row.table_name));
    
    // Verificar zonas
    const zonas = await pool.query('SELECT id, nombre, codigo FROM zonas ORDER BY id;');
    console.log('\n🏙️ Zonas disponibles:');
    zonas.rows.forEach(zona => console.log(`  ${zona.id}. ${zona.nombre} (${zona.codigo})`));
    
    // Verificar estructura de clientes
    const columnasClientes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clientes' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n👥 Columnas tabla clientes:');
    columnasClientes.rows.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarBD();