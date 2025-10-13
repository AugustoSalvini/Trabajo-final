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
    await pool.query('BEGIN');
    await pool.query(sql);
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
    await createMigrationsTable();
    const executedMigrations = await getExecutedMigrations();
    console.log('📋 Migraciones ya ejecutadas:', executedMigrations);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`No existe la carpeta de migraciones: ${migrationsDir}`);
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('📁 Archivos de migración encontrados:', migrationFiles);

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

// ---------------------------------------------------
// EJECUCIÓN DIRECTA (detecta bien en Windows y con dotenv)
// ---------------------------------------------------
import { fileURLToPath as furl } from 'url';

const __filename2 = furl(import.meta.url);
const called = process.argv[1] ? path.resolve(process.argv[1]) : '';
const self = path.resolve(__filename2);

if (called === self) {
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
