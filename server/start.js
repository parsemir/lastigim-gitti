const { execSync } = require('child_process');

// Run prisma db push before starting the server
try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('Database synced successfully!');
} catch (err) {
  console.error('Warning: prisma db push failed, continuing anyway...', err.message);
}

// Start the actual server
require('./dist/index.js');
