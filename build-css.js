import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the styles.css file from public/styles/
const inputPath = path.join(__dirname, 'public', 'styles', 'all.css');
const outputPath = path.join(__dirname, 'dist', 'output.css');

try {
  // Ensure dist directory exists
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }

  // Read the input CSS
  const inputCSS = fs.readFileSync(inputPath, 'utf8');

  // Process with PostCSS and Tailwind
  const result = await postcss([
    tailwindcss,
    autoprefixer,
  ]).process(inputCSS, {
    from: inputPath,
    to: outputPath,
  });

  // Write the processed CSS
  fs.writeFileSync(outputPath, result.css);
  
  // Also write source map if available
  if (result.map) {
    fs.writeFileSync(outputPath + '.map', result.map.toString());
  }

  console.log('✅ CSS built successfully to dist/output.css');
  console.log(`📊 Output size: ${(result.css.length / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('❌ Error building CSS:', error);
  process.exit(1);
} 