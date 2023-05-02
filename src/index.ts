import packageJsonData from '../test-project/package.json';
import path from 'path';
import fs from 'fs';

const dependencies = Object.keys(packageJsonData.dependencies);
const devDependencies = Object.keys(packageJsonData.devDependencies);

const packageNames = dependencies.concat(devDependencies);
packageNames.sort();

const PROJECT_DIRECTORY = './test-project';
const NODE_MODULES = path.resolve(PROJECT_DIRECTORY, 'node_modules');
// const packagePath = path.join(NODE_MODULES, packageName);

function getAllLicensePaths(packagePath: string): string[] {
  const licenseRegex = /(LICENSE|LICENCE|COPYING|COPYRIGHT)\.?.*/i;
  const files = fs.readdirSync(packagePath);
  const licenseFiles = files.filter((filename) => licenseRegex.test(filename));

  const licensePaths = licenseFiles.map((filename) => path.join(packagePath, filename));

  return licensePaths;
}

console.log(getAllLicensePaths(path.join(NODE_MODULES, 'rimraf')));
