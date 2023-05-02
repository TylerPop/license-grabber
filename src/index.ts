import packageJsonData from '../test-project/package.json';
import path from 'path';
import fs from 'fs';

const dependencies = Object.keys(packageJsonData.dependencies);
const devDependencies = Object.keys(packageJsonData.devDependencies);

const packageNames = dependencies.concat(devDependencies);
packageNames.sort();

const PROJECT_DIRECTORY = './test-project';
const NODE_MODULES = path.resolve(PROJECT_DIRECTORY, 'node_modules');

function getLicenseFiles(packageName: string) {
  const licenseRegex = /(LICENSE|LICENCE|COPYING|COPYRIGHT)/gi;
  const packagePath = path.join(NODE_MODULES, packageName);
  const files = fs.readdirSync(packagePath);

  const licenseFiles = files.filter((filename) => licenseRegex.test(filename));

  return licenseFiles;
}

console.log(getLicenseFiles('rimraf'));
