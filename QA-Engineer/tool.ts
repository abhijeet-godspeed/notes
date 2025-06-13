import { type PlainObject, ToolOutput } from "@gs-tools/types";
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

function writeCodeToFile(filePath: string, code: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`✅ Wrote: ${filePath}`);
}

function ensureTestEnvFile() {
    const dotenvPath = path.resolve('.env');
    const testEnvPath = path.resolve('.test.env');
  
    if (!fs.existsSync(dotenvPath)) {
      console.warn('⚠️ .env not found, skipping .test.env creation.');
      return;
    }
  
    if (fs.existsSync(testEnvPath)) {
      console.log(`ℹ️ .test.env already exists`);
      return;
    }
  
    // Load .env vars to extract only relevant ones
    const envContent = fs.readFileSync(dotenvPath, 'utf8');
    const filteredLines: string[] = [];
  
    const relevantKeys = new Set([
      'GS_TRANSPILE',
      ...Array.from(envContent.matchAll(/^\s*([A-Z0-9_]+)=/gm)).map(match => match[1]),
    ]);
  
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) continue;
  
      const [key] = trimmed.split('=', 1);
      if (relevantKeys.has(key)) {
        filteredLines.push(trimmed);
      }
    }
  
    fs.writeFileSync(testEnvPath, filteredLines.join('\n'), 'utf8');
    console.log(`✅ Created: .test.env with relevant env vars from .env`);
  }
  

function addScriptsToPackageJson(projectRoot: string, newScripts: Record<string, string>) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) throw new Error(`package.json not found at ${packageJsonPath}`);

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.scripts = {
    ...(packageJson.scripts || {}),
    ...newScripts,
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated scripts in package.json`);
}


function ensureDevDependencies() {
  try {
    const output = child_process.execSync('pnpm ls @types/mocha --json').toString();
    const trees = JSON.parse(output);

    const isInstalled = trees.some(pkg =>
      pkg.devDependencies && pkg.devDependencies['@types/mocha']
    );

    if (!isInstalled) {
      console.log('📦 Installing @types/mocha...');
      child_process.execSync('pnpm install --save-dev @types/mocha', { stdio: 'inherit' });
    } else {
      console.log('✅ @types/mocha already installed');
    }
  } catch (err) {
    console.log('📦 Installing @types/mocha (fallback)...');
    child_process.execSync('pnpm install --save-dev @types/mocha', { stdio: 'inherit' });
  }
}

// function ensureDevDependencies() {
//   try {
//     const devDeps = JSON.parse(child_process.execSync('npm ls @types/mocha --json').toString());
//     if (!devDeps.dependencies?.['@types/mocha']) {
//       console.log('📦 Installing @types/mocha...');
//       child_process.execSync('npm install --save-dev @types/mocha', { stdio: 'inherit' });
//     } else {
//       console.log('✅ @types/mocha already installed');
//     }
//   } catch {
//     console.log('📦 Installing @types/mocha...');
//     child_process.execSync('pnpm install --save-dev @types/mocha', { stdio: 'inherit' });
//   }
// }

function getImportPathPrefix(fileRelativePath: string): string {
  // const depth = path.dirname(fileRelativePath).split(path.sep).filter(Boolean).length;
  // return '../'.repeat(depth+1 || 1); // At least one '../'
  const dir = path.dirname(fileRelativePath);
  const depth = dir === '.' ? 0 : dir.split(path.sep).length;
  return '../'.repeat(depth + 1);
}

function generateTsFromYaml(yamlFilePath: string, relativePath: string, testDir: string) {
  // const baseName = path.basename(yamlFilePath, '.yaml');
  const preBaseName = path.basename(yamlFilePath, '.yaml');
  const baseName = path.join(path.dirname(relativePath), preBaseName).split(path.sep).join('.');
  const tsFilePath = path.join(testDir, relativePath).replace(/\.yaml$/, '.test.ts');

  if (fs.existsSync(tsFilePath)) {
    console.log(`ℹ️ File already exists: ${tsFilePath}`);
    return;
  }

  const importPrefix = getImportPathPrefix(relativePath);

  const testCode = `import { expect } from 'chai';
import { GSStatus } from '@godspeedsystems/core';
import { makeContext } from '${importPrefix}helpers/makeContext';
import getGSApp from '${importPrefix}hooks/globalSetup';

describe('${baseName}', () => {
  let gsApp: any;
  let args: Record<string, unknown>;

  before(() => {
    gsApp = getGSApp();
  });

  beforeEach(() => {
    args = {};
  });

  it('test description', async () => {
    const data = { params, body, headers, query, user }; // only fill required fields. see the exact input schema in the YAML file of the event in src/events directory
    const ctx = makeContext(gsApp, data);
    const workflow = gsApp.workflows['${baseName}'];
    const result: GSStatus = await workflow(ctx, args);

    // write expect statements here
  });

  // add more tests
});`;

  writeCodeToFile(tsFilePath, testCode);
}

function scaffoldEventTests() {
  const eventDir = path.resolve('src/events');
  const testDir = path.resolve('test/eventHandlers');

  if (!fs.existsSync(eventDir)) {
    console.warn('⚠️ No events directory found at src/events');
    return;
  }

  function walkAndGenerate(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walkAndGenerate(fullPath);
      } else if (entry.isFile() && fullPath.endsWith('.yaml')) {
        const relativePath = path.relative(eventDir, fullPath);
        generateTsFromYaml(fullPath, relativePath, testDir);
      }
    });
  }

  walkAndGenerate(eventDir);
  console.log('✅ Event test scaffolding complete.');
}

export const run = async (input: PlainObject): Promise<ToolOutput> => {
    // === File outputs ===
    writeCodeToFile('./test/hooks/globalSetup.ts', `import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import appPromise from '../../src/index';
import { logger } from '@godspeedsystems/core';

const envPath = path.resolve(__dirname, '../../.env');
const testEnvPath = path.resolve(__dirname, '../../.test.env');

if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
if (fs.existsSync(testEnvPath)) dotenv.config({ path: testEnvPath, override: true });

let gsApp: any;

before(async function () {
  this.timeout(10000);
  try {
    gsApp = await appPromise;
  } catch (err) {
    logger.error('App failed to start:', err);
    throw err;
  }
});

export default () => gsApp;

// Auto-exit after all tests are complete
after(function () {
  // Delay a bit to allow logs to flush (optional)
  setTimeout(() => {
    process.exit(0);
  }, 100);
});`);

writeCodeToFile('./test/helpers/makeContext.ts', `import { GSContext, logger } from '@godspeedsystems/core';
import { makeEvent } from './makeEvent';

export function makeContext(app: any, data: Record<string, any>) {
  const event = makeEvent(data);
  const childLogger = logger.child(app.getCommonAttrs(event));
  return new GSContext(app.config, app.datasources, event, app.mappings, app.nativeFunctions, app.plugins, logger, childLogger);
}`);


writeCodeToFile('./test/helpers/makeEvent.ts', `import { GSCloudEvent, GSActor } from '@godspeedsystems/core';

export function makeEvent(data: Record<string, any>) {
  return new GSCloudEvent('', '', new Date(), '', '', data, 'REST', new GSActor('user'), {});
}`);


writeCodeToFile('./tsconfig.test.json', `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "test/dist",
    "rootDir": ".",
    "noEmit": false,
    "types": ["mocha", "node"],
    "typeRoots": ["./node_modules/@types"]
  },
  "include": ["test/**/*", "src/**/*"]
}`);


writeCodeToFile('./mocha.config.js', `module.exports = {
  require: ['test/dist/hooks/globalSetup.js'],
};`);


addScriptsToPackageJson('.', {
  "build:test": "rm -rf dist && godspeed build && rm -rf test/dist && tsc -p tsconfig.test.json",
  "test": "npm run build:test && mocha test/dist/**/*.test.js",
  "test:single": "mocha -r ts-node/register --project tsconfig.test.json"
});

writeCodeToFile('./src/index.ts', `try {
  if (process.env.OTEL_ENABLED === 'true') {
    require('@godspeedsystems/tracing').initialize();
  }
} catch (error) {
  console.error("OTEL_ENABLED is set, unable to initialize opentelemetry tracing.");
  console.error(error);
  process.exit(1);
}

import Godspeed from "@godspeedsystems/core";

async function bootstrap() {
  const gsApp = new Godspeed();
  await gsApp.initialize();
  return gsApp;
}

const appPromise = bootstrap();
export default appPromise;
`);

ensureTestEnvFile();
ensureDevDependencies();

scaffoldEventTests();

console.log('✅ Scaffold complete. Ready to run tests.');
    

    const data = { message: process.cwd() };
    if(!data.message) throw new ToolOutput({ error: "Message is missing" });

    return new ToolOutput({ data: data });
}
