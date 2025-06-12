import fs from 'fs';
import path from 'path';

function writeCodeToFile(filePath: string, code: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`✅ Wrote: ${filePath}`);
}

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
  const tsFilePath = path.join(testDir, relativePath).replace(/\.yaml$/, '.ts');

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

scaffoldEventTests();

// import fs from 'fs';
// import path from 'path';

// function writeCodeToFile(filePath: string, code: string) {
//   const dir = path.dirname(filePath);
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
//   fs.writeFileSync(filePath, code, 'utf8');
//   console.log(`✅ Wrote: ${filePath}`);
// }

// function generateTsFromYaml(yamlFilePath: string, relativePath: string, testDir: string) {
//   // const baseName = path.basename(yamlFilePath, '.yaml');
  // const preBaseName = path.basename(yamlFilePath, '.yaml');
  // const baseName = path.join(path.dirname(relativePath), preBaseName).split(path.sep).join('.');
//   const tsFilePath = path.join(testDir, relativePath).replace(/\.yaml$/, '.ts');

//   if (fs.existsSync(tsFilePath)) {
//     console.log(`ℹ️ File already exists: ${tsFilePath}`);
//     return;
//   }

//   const testCode = `import { expect } from 'chai';
// import { GSStatus } from '@godspeedsystems/core';
// import { makeContext } from '../helpers/makeContext';
// import getGSApp from '../hooks/globalSetup';

// describe('${baseName}', () => {
//   let gsApp: any;
//   let args: Record<string, unknown>;

//   before(() => {
//     gsApp = getGSApp();
//   });

//   beforeEach(() => {
//     args = {};
//   });

//   it('test description', async () => {
//     const data = { params, body, headers, query, user }; // only fill required fields
//     const ctx = makeContext(gsApp, data);
//     const workflow = gsApp.workflows['${baseName}'];
//     const result: GSStatus = await workflow(ctx, args);

//     // write expect statements here
//   });

//   // add more tests
// });`;

//   writeCodeToFile(tsFilePath, testCode);
// }

// function scaffoldEventTests() {
//   const eventDir = path.resolve('src/events');
//   const testDir = path.resolve('test/eventHandlers');

//   if (!fs.existsSync(eventDir)) {
//     console.warn('⚠️ No events directory found at src/events');
//     return;
//   }

//   function walkAndGenerate(currentDir: string) {
//     const entries = fs.readdirSync(currentDir, { withFileTypes: true });

//     entries.forEach(entry => {
//       const fullPath = path.join(currentDir, entry.name);
//       if (entry.isDirectory()) {
//         walkAndGenerate(fullPath);
//       } else if (entry.isFile() && fullPath.endsWith('.yaml')) {
//         const relativePath = path.relative(eventDir, fullPath);
//         generateTsFromYaml(fullPath, relativePath, testDir);
//       }
//     });
//   }

//   walkAndGenerate(eventDir);
//   console.log('✅ Event test scaffolding complete.');
// }

// scaffoldEventTests();

// import fs from 'fs';
// import path from 'path';

// function writeCodeToFile(filePath: string, code: string) {
//   const dir = path.dirname(filePath);
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
//   fs.writeFileSync(filePath, code, 'utf8');
//   console.log(`✅ Wrote: ${filePath}`);
// }

// function generateTestScaffold(tsFilePath: string, relativePath: string, testDir: string) {
//   const fnName = path.basename(tsFilePath, '.ts');
//   const testFilePath = path.join(testDir, relativePath).replace(/\.ts$/, '.test.ts');

//   if (fs.existsSync(testFilePath)) {
//     console.log(`ℹ️ Test file already exists for ${fnName}`);
//     return;
//   }

//   const testCode = `import { expect } from 'chai';
// import { GSStatus } from '@godspeedsystems/core';
// import { makeContext } from '../helpers/makeContext';
// import getGSApp from '../hooks/globalSetup';

// describe('${fnName}', () => {
//   let gsApp: any;
//   let args: Record<string, unknown>;

//   before(() => {
//     gsApp = getGSApp();
//   });

//   beforeEach(() => {
//     args = {};
//   });

//   it('test description', async () => {
//     const data = { params, body, headers, query, user }; // only fill required fields
//     const ctx = makeContext(gsApp, data);
//     const workflow = gsApp.workflows['${fnName}'];
//     const result: GSStatus = await workflow(ctx, args);

//     // write expect statements here
//   });

//   // add more tests
// });`;

//   writeCodeToFile(testFilePath, testCode);
// }

// function scaffoldFunctionTests() {
//   const fnDir = path.resolve('src/functions');
//   const testDir = path.resolve('test/eventHandlers');

//   if (!fs.existsSync(fnDir)) {
//     console.warn('⚠️ No functions directory found at src/functions');
//     return;
//   }

//   function walkAndScaffold(currentDir: string) {
//     const entries = fs.readdirSync(currentDir, { withFileTypes: true });

//     entries.forEach(entry => {
//       const fullPath = path.join(currentDir, entry.name);
//       if (entry.isDirectory()) {
//         walkAndScaffold(fullPath);
//       } else if (entry.isFile() && fullPath.endsWith('.ts')) {
//         const relativePath = path.relative(fnDir, fullPath);
//         generateTestScaffold(fullPath, relativePath, testDir);
//       }
//     });
//   }

//   walkAndScaffold(fnDir);
//   console.log('✅ Function test scaffolding complete.');
// }

// scaffoldFunctionTests();
