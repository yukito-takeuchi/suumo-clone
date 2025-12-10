#!/usr/bin/env node
const { exec } = require('child_process');

// Heroku PostgreSQL requires SSL connection
// Add SSL parameters directly to DATABASE_URL
let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  // Add SSL parameters to the connection string
  // sslmode=require: SSL required but skip certificate verification (for Heroku)
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}sslmode=require`;

  console.log('🔧 Modified DATABASE_URL with SSL parameters');
  process.env.DATABASE_URL = databaseUrl;
}

// Also set PGSSLMODE as fallback
process.env.PGSSLMODE = 'require';

// Run node-pg-migrate
const command = 'node-pg-migrate up -m migrations --database-url-var DATABASE_URL --no-check-order';

console.log('🚀 Starting migration...');

exec(command, (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  if (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    process.exit(1);
  }
  console.log('✅ Migration completed successfully');
  process.exit(0);
});
