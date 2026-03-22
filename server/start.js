const { execSync } = require('child_process');
const path = require('path');

const serverDir = __dirname;

console.log('=== Lastiğim Gitti Startup ===');
console.log('Current directory:', serverDir);
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Run prisma db push before starting the server
try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss --schema=prisma/schema.prisma', {
    stdio: 'inherit',
    cwd: serverDir,
    env: { ...process.env }
  });
  console.log('Database synced successfully!');
} catch (err) {
  console.error('ERROR: prisma db push failed!', err.message);
  // Don't continue if db push fails - the app won't work without tables
  process.exit(1);
}

// Start the actual server
console.log('Starting server...');
require('./dist/index.js');
