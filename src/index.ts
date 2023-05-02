import path from 'path';
import fs from 'fs';
import { LicenseInfo, PackageData, PackageJson } from './PackageData';

const PROJECT_DIRECTORY = '.';
const NODE_MODULES = path.resolve(PROJECT_DIRECTORY, 'node_modules');
const PACKAGE_JSON_BUFFER = fs.readFileSync(path.resolve(PROJECT_DIRECTORY, 'package.json'));
const PACKAGE_JSON: PackageJson = JSON.parse(PACKAGE_JSON_BUFFER.toString());

function getDependencies(packageJson: PackageJson, includeDevDependencies = true): PackageData[] {
  let dependencies: PackageData[] = [];
  let devDependencies: PackageData[] = [];

  if (packageJson?.dependencies) {
    dependencies = Object.entries(PACKAGE_JSON.dependencies).map(([name, version]) => {
      return { name, version: version.slice(1) };
    });
  }

  if (includeDevDependencies && packageJson?.devDependencies) {
    devDependencies = Object.entries(PACKAGE_JSON.devDependencies).map(([name, version]) => {
      return { name, version: version.slice(1) };
    });
  }

  return dependencies.concat(devDependencies);
}

const packages = getDependencies(PACKAGE_JSON);

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

const allPackageData = getAllPackagesData();
console.log(allPackageData, allPackageData.length);
