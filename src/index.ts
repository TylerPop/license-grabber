import path from 'path';
import fs from 'fs';
import * as LicenseUtils from './LicenseUtils';
import { PackageData, PackageJson } from './PackageData';

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

function getAllPackagesData(basePath: string): PackageData[] {
  const packages = getDependencies(PACKAGE_JSON);
  return packages.map((packageData) => {
    const packagePath = path.join(basePath, packageData.name);
    packageData.license = LicenseUtils.getLicenseInfo(packagePath);
    return packageData;
  });
}

const PROJECT_DIRECTORY = '.';
let PACKAGE_JSON_BUFFER: Buffer;
let PACKAGE_JSON: PackageJson;

// Stop process if selected project directory does not exist
if (!fs.existsSync(PROJECT_DIRECTORY)) {
  console.error(`Error: ${PROJECT_DIRECTORY} does not exist.`);
  process.exit(9); // Invalid Argument exit code
}

try {
  PACKAGE_JSON_BUFFER = fs.readFileSync(path.resolve(PROJECT_DIRECTORY, 'package.json'));
  PACKAGE_JSON = JSON.parse(PACKAGE_JSON_BUFFER.toString());
} catch (e) {
  console.error(`Error: Unable to locate package.json in ${PROJECT_DIRECTORY}`);
}

const NODE_MODULES_PATH = path.resolve(PROJECT_DIRECTORY, 'node_modules');
const USE_NODE_MODULES = fs.existsSync(NODE_MODULES_PATH);

if (USE_NODE_MODULES) {
  const allPackageData = getAllPackagesData(NODE_MODULES_PATH);
  console.log(allPackageData, allPackageData.length);
}
