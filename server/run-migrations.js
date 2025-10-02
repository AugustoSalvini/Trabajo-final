import { runMigrations } from './src/db/migrate.js';

console.log('🚀 Ejecutando migraciones...');

runMigrations()
  .then(() => {
    console.log('✅ ¡Migraciones completadas exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando migraciones:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });