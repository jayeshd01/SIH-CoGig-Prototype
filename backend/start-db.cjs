const { PGlite } = require('@electric-sql/pglite');
const { createServer } = require('pglite-server');
const path = require('path');

async function main() {
  const dataDir = path.join(__dirname, 'pglite-data');
  const db = new PGlite(dataDir);
  await db.waitReady;
  console.log('PGlite database ready at', dataDir);

  const server = createServer(db, { logLevel: 3 });
  server.listen(5432, '127.0.0.1', () => {
    console.log('Postgres server listening on 127.0.0.1:5432');
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    server.close();
    await db.close();
    process.exit(0);
  });
}

main().catch(console.error);
