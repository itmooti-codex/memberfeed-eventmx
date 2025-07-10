import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if esbuild is available, if not install it
try {
  require.resolve('esbuild');
} catch (e) {
  console.log('Installing esbuild...');
  execSync('npm install --save-dev esbuild', { stdio: 'inherit' });
}

// Import esbuild after ensuring it's installed
const esbuild = await import('esbuild');

const mainInputPath = path.join(__dirname, 'src', 'main.js');
const notificationsInputPath = path.join(__dirname, 'src', 'notifications-only.js');
const mainOutputPath = path.join(__dirname, 'dist', 'bundle.js');
const notificationsOutputPath = path.join(__dirname, 'dist', 'notifications-bundle.js');

try {
  // Ensure dist directory exists
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }

  // Build the main JavaScript bundle
  const mainResult = await esbuild.build({
    entryPoints: [mainInputPath],
    bundle: true,
    outfile: mainOutputPath,
    format: 'esm',
    target: ['es2020'],
    minify: true,
    sourcemap: true,
    loader: {
      '.js': 'jsx',
    },
  });

  // Build the notifications JavaScript bundle
  const notificationsResult = await esbuild.build({
    entryPoints: [notificationsInputPath],
    bundle: true,
    outfile: notificationsOutputPath,
    format: 'esm',
    target: ['es2020'],
    minify: true,
    sourcemap: true,
    loader: {
      '.js': 'jsx',
    },
  });

  console.log('✅ JavaScript bundles built successfully');
  
  // Get file sizes
  const mainStats = fs.statSync(mainOutputPath);
  const notificationsStats = fs.statSync(notificationsOutputPath);
  const mainSizeInKB = (mainStats.size / 1024).toFixed(2);
  const notificationsSizeInKB = (notificationsStats.size / 1024).toFixed(2);
  console.log(`📊 Main bundle size: ${mainSizeInKB} KB`);
  console.log(`📊 Notifications bundle size: ${notificationsSizeInKB} KB`);
  
} catch (error) {
  console.error('❌ Error building JavaScript:', error);
  process.exit(1);
} 