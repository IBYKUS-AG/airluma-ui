import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

// Replicating __filename and __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
// Adjust these paths relative to where you run the script (usually project root)
const SOURCE_FILE = path.join(__dirname, '../index.html');
const DEST_FILE = path.join(__dirname, '../demo-html/index.html');

// The lines to find (Must match exactly)
const DEV_CSS_LINE = '<link rel="stylesheet" href="./src/styles/ides.css" />';
const DEV_TS_LINE = '<script type="module" src="./src/index.ts"></script>';

// The new line to insert
const PROD_BUNDLE_LINE_START = '<script type="module" src="./ibykus-design-system.es.js';
const PROD_BUNDLE_LINE_END = '"></script>';

function processHtml() {
  try {
    console.log(`Reading from: ${SOURCE_FILE}`);

    if (!fs.existsSync(SOURCE_FILE)) {
      throw new Error(`Source file not found at ${SOURCE_FILE}`);
    }

    let content = fs.readFileSync(SOURCE_FILE, 'utf8');

    // 1. Remove the CSS line (replacing with empty string)
    if (content.includes(DEV_CSS_LINE)) {
      content = content.replace(DEV_CSS_LINE, '');
      console.log('Removed Dev CSS line');
    } else {
      console.warn('Warning: Dev CSS line not found in source.');
    }

    // 2. Replace the TS line with the new Bundle line
    // We replace the TS line specifically so the new script ends up
    // in the correct position (usually at the end of body/head)
    if (content.includes(DEV_TS_LINE)) {
      content = content.replace(DEV_TS_LINE, PROD_BUNDLE_LINE_START + '?time=' + Date.now() + PROD_BUNDLE_LINE_END);
      console.log('Replaced Dev TS line with Prod Bundle line');
    } else {
      console.warn('Warning: Dev TS line not found in source.');
    }

    // 3. Ensure destination directory exists
    const destDir = path.dirname(DEST_FILE);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 4. Write the file
    fs.writeFileSync(DEST_FILE, content, 'utf8');
    console.log(`Success! Processed HTML written to: ${DEST_FILE}`);

  } catch (error) {
    console.error('Error processing HTML:', error.message);
    process.exit(1);
  }
}

processHtml();
