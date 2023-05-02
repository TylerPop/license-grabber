import packageJsonData from '../test-project/package.json';
import path from 'path';
import fs from 'fs';
import { LicenseInfo, PackageData } from './PackageData';

const PROJECT_DIRECTORY = './test-project';
const NODE_MODULES = path.resolve(PROJECT_DIRECTORY, 'node_modules');

// Collect all dependencies
const dependencies: PackageData[] = Object.entries(packageJsonData.dependencies).map(
  ([name, version]) => {
    return { name, version: version.slice(1) };
  }
);

const devDependencies: PackageData[] = Object.entries(packageJsonData.devDependencies).map(
  ([name, version]) => {
    return { name, version: version.slice(1) };
  }
);

const packages = dependencies.concat(devDependencies);

// Helper functions

function getLicensePath(packagePath: string): string | null {
  const licenseRegex = /(LICENSE|LICENCE|COPYING|COPYRIGHT)\.?.*/i;
  const files = fs.readdirSync(packagePath);
  const licenseFile = files.filter((filename) => licenseRegex.test(filename));

  if (licenseFile.length === 1) return path.join(packagePath, licenseFile[0]);
  else return null;
}

function getLicenseInfo(packagePath: string): LicenseInfo | null {
  const licensePath = getLicensePath(packagePath);

  if (!licensePath) return null;

  const licenseDescriptionBuffer = fs.readFileSync(licensePath);
  const packageJsonBuffer = fs.readFileSync(path.join(packagePath, 'package.json'));
  const packageJson = JSON.parse(packageJsonBuffer.toString());

  const info = {
    name: packageJson.license ?? 'Unknown',
    description: licenseDescriptionBuffer.toString()
  };

  return info;
}

function getAllPackagesData(basePath: string = NODE_MODULES): PackageData[] {
  return packages.map((packageData) => {
    const packagePath = path.join(basePath, packageData.name);
    packageData.license = getLicenseInfo(packagePath);
    return packageData;
  });
}

console.log(getAllPackagesData());
