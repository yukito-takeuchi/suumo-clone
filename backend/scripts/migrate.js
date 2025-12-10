#!/usr/bin/env node
const { exec } = require('child_process');

// Heroku PostgreSQL requires SSL with rejectUnauthorized: false
// Append SSL parameters to DATABASE_URL if not already present
let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && !databaseUrl.includes('sslmode=')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}sslmode=require`;
}

// Set the modified DATABASE_URL
process.env.DATABASE_URL = databaseUrl;

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
