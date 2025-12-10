#!/usr/bin/env node
const { exec } = require('child_process');

// Heroku PostgreSQL requires SSL connection
// PGSSLMODE=no-verify forces SSL but skips certificate verification
process.env.PGSSLMODE = 'no-verify';

// Run node-pg-migrate
const command = 'node-pg-migrate up -m migrations --database-url-var DATABASE_URL --no-check-order';

exec(command, (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  if (error) {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
  console.log('✅ Migration completed successfully');
  process.exit(0);
});
