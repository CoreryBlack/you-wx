import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = ['unpackage', 'dist'].map(dir => path.resolve(__dirname, '..', dir));

targets.forEach(target => {
  try {
    if (fs.existsSync(target)) {
      // Node 14+ supports rmSync with recursive; fallback to rmdirSync
      if (fs.rmSync) {
        fs.rmSync(target, { recursive: true, force: true });
      } else {
        const rimraf = (p) => {
          if (fs.existsSync(p)) {
            fs.readdirSync(p).forEach((file) => {
              const cur = path.join(p, file);
              if (fs.lstatSync(cur).isDirectory()) rimraf(cur);
              else fs.unlinkSync(cur);
            });
            fs.rmdirSync(p);
          }
        };
        rimraf(target);
      }
      console.log('Removed', target);
    } else {
      console.log(`No ${path.basename(target)} directory to remove.`);
    }
  } catch (err) {
    console.error(`Failed to remove ${path.basename(target)}:`, err);
    // Don't exit on first failure, try regular cleanup
  }
});
