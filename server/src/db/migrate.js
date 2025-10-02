import { pool } from './pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Tabla para controlar qué migraciones se han ejecutado
 */
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await pool.query(query);
  console.log('✅ Tabla schema_migrations creada o ya existe');
}

/**
 * Obtiene las migraciones ya ejecutadas
 */
async function getExecutedMigrations() {
  const query = 'SELECT migration_name FROM schema_migrations ORDER BY migration_name';
  const result = await pool.query(query);
  return result.rows.map(row => row.migration_name);
}

/**
 * Marca una migración como ejecutada
 */
async function markMigrationAsExecuted(migrationName) {
  const query = 'INSERT INTO schema_migrations (migration_name) VALUES ($1)';
  await pool.query(query, [migrationName]);
}

/**
 * Ejecuta una migración desde archivo SQL
 */
async function executeMigration(migrationPath, migrationName) {
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Ejecutar dentro de una transacción
    await pool.query('BEGIN');
    
    // Ejecutar el SQL de la migración
    await pool.query(sql);
    
    // Marcar como ejecutada
    await markMigrationAsExecuted(migrationName);
    
    await pool.query('COMMIT');
    console.log(`✅ Migración ejecutada: ${migrationName}`);
    
  } catch (error) {
    await pool.query('ROLLBACK');
    throw new Error(`Error ejecutando migración ${migrationName}: ${error.message}`);
  }
}

/**
 * Ejecuta todas las migraciones pendientes
 */
async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones...');
    
    // Crear tabla de control de migraciones
    await createMigrationsTable();
    
    // Obtener migraciones ya ejecutadas
    const executedMigrations = await getExecutedMigrations();
    console.log('📋 Migraciones ya ejecutadas:', executedMigrations);
    
    // Leer archivos de migraciones
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ejecutar en orden alfabético
    
    console.log('📁 Archivos de migración encontrados:', migrationFiles);
    
    // Ejecutar migraciones pendientes
    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.sql');
      
      if (!executedMigrations.includes(migrationName)) {
        console.log(`⏳ Ejecutando migración: ${migrationName}`);
        const migrationPath = path.join(migrationsDir, file);
        await executeMigration(migrationPath, migrationName);
      } else {
        console.log(`⏭️  Saltando migración ya ejecutada: ${migrationName}`);
      }
    }
    
    console.log('🎉 ¡Todas las migraciones completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las migraciones:', error.message);
    throw error;
  }
}

/**
 * Función para ejecutar las migraciones si este archivo se ejecuta directamente
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Iniciando proceso de migraciones...');
  runMigrations()
    .then(() => {
      console.log('✅ Proceso de migraciones finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migraciones:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    });
} else {
  console.log('ℹ️  Script de migraciones cargado como módulo');
}

export { runMigrations, createMigrationsTable, executeMigration };