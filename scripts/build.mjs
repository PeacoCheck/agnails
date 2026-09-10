import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_RELEASE_ID: process.env.NEXT_PUBLIC_RELEASE_ID || new Date().toISOString().replace(/\D/g, '').slice(0, 14) },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
