const { spawnSync } = require('node:child_process');

if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL is not set, so Prisma generate was skipped. Set DATABASE_URL for a fully working database runtime.');
  process.exit(0);
}

const result = spawnSync('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

process.exit(result.status ?? 1);
