import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 生成带 hash 的文件名
const generateHash = () => {
  return Math.random().toString(36).substring(2, 15);
};

const hash = generateHash();
const bundleFileName = `bundle.${hash}.js`;

const template = () => {
  const htmlContent = fs.readFileSync(pathResolve(__dirname, 'src/index.html'), 'utf-8');
  return htmlContent.replace('{{bundle}}', bundleFileName);
};

export default {
  input: 'src/main.js',
  output: {
    file: `dist/${bundleFileName}`,
    format: 'iife',
    name: 'MainApp',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true
    }),
    html({
      template
    }),
    serve({
      contentBase: 'dist',
      port: 3001,
    }),
  ]
}; 