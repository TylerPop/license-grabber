import packageJsonData from '../test-project/package.json';
import path from 'path';
import fs from 'fs';
import { LicenseInfo, PackageData } from './PackageData';

const PROJECT_DIRECTORY = './test-project';
const NODE_MODULES = path.resolve(PROJECT_DIRECTORY, 'node_modules');

// Collect all dependencies
const dependencies: PackageData[] = Object.entries(packageJsonData.dependencies).map(
  ([name, version]) => {
    return { name, version: version.slice(1), licenses: [] };
  }
);

const devDependencies: PackageData[] = Object.entries(packageJsonData.devDependencies).map(
  ([name, version]) => {
    return { name, version: version.slice(1), licenses: [] };
  }
);

const packages = dependencies.concat(devDependencies);
const packagePath = path.join(NODE_MODULES, 'rimraf');

// Helper functions

function getLicensePath(packagePath: string): string {
  const licenseRegex = /(LICENSE|LICENCE|COPYING|COPYRIGHT)\.?.*/i;
  const files = fs.readdirSync(packagePath);
  const licenseFile = files.filter((filename) => licenseRegex.test(filename));

  return path.join(packagePath, licenseFile[0]);
}

function getLicenseInfo(packagePath: string): LicenseInfo {
  const licensePath = getLicensePath(packagePath);
  const licenseDescriptionBuffer = fs.readFileSync(licensePath);

  const packageJsonBuffer = fs.readFileSync(path.join(packagePath, 'package.json'));
  const packageJson = JSON.parse(packageJsonBuffer.toString());

  const info = {
    name: packageJson.license ?? 'Unknown',
    description: licenseDescriptionBuffer.toString()
  };

  return info;
}

console.log(getLicenseInfo(packagePath));
