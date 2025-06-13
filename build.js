import esbuild from 'esbuild';
import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env if present
dotenv.config();

const define = {};
const keys = ['API_KEY', 'AWS_PARAM', 'AWS_PARAM_URL', 'HTTP_ENDPOINT', 'WS_ENDPOINT'];
for (const key of keys) {
  if (process.env[key]) {
    define[`process.env.${key}`] = JSON.stringify(process.env[key]);
    define[`import.meta.env.${key}`] = JSON.stringify(process.env[key]);
  }
}

esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  outfile: 'public/bundle.js',
  define,
  sourcemap: true,
}).catch(() => process.exit(1));

