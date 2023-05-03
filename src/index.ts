import path from 'path';
import fs from 'fs';
import * as LicenseUtils from './LicenseUtils';
import { PackageData, PackageJson } from './PackageData';

const PROJECT_DIRECTORY = '.';
const NODE_MODULES_PATH = path.resolve(PROJECT_DIRECTORY, 'node_modules');
const USE_NODE_MODULES = fs.existsSync(NODE_MODULES_PATH);

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

function getAllPackagesData(basePath: string): PackageData[] {
  return packages.map((packageData) => {
    const packagePath = path.join(basePath, packageData.name);
    packageData.license = LicenseUtils.getLicenseInfo(packagePath);
    return packageData;
  });
}

if (USE_NODE_MODULES) {
  const allPackageData = getAllPackagesData(NODE_MODULES_PATH);
  console.log(allPackageData, allPackageData.length);
}
