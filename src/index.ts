import path from 'path';
import fs from 'fs';
import * as LicenseUtils from './LicenseUtils';
import { PackageData, PackageJson } from './PackageData';

function getDependencies(packageJson: PackageJson, includeDevDependencies = true): PackageData[] {
  let dependencies: PackageData[] = [];
  let devDependencies: PackageData[] = [];

  if (packageJson?.dependencies) {
    dependencies = Object.entries(PACKAGE_JSON.dependencies).map(([name, version]) => {
      const archiveUrl = new URL(`${name}`, REGISTRY_PREFIX).href;
      return { name, version: version.slice(1), archive: archiveUrl };
    });
  }

  if (includeDevDependencies && packageJson?.devDependencies) {
    devDependencies = Object.entries(PACKAGE_JSON.devDependencies).map(([name, version]) => {
      const archiveUrl = new URL(`${name}`, REGISTRY_PREFIX).href;
      return { name, version: version.slice(1), archive: archiveUrl };
    });
  }

  return dependencies.concat(devDependencies);
}

function getAllPackagesData(basePath: string): PackageData[] {
  return packages.map((packageData) => {
    const packagePath = path.join(basePath, packageData.name);
    packageData.license = LicenseUtils.getLicenseInfo(packagePath);
    return packageData;
  });
}

function parsePackageJson(): PackageJson {
  try {
    const packageJsonBuffer = fs.readFileSync(path.resolve(PROJECT_DIRECTORY, 'package.json'));
    const packageJson = JSON.parse(packageJsonBuffer.toString());
    return packageJson;
  } catch (e) {
    console.error(`Error: Unable to locate package.json in ${PROJECT_DIRECTORY}`);
    process.exit(1);
  }
}

const PROJECT_DIRECTORY = '.';
const REGISTRY_PREFIX = 'https://registry.npmjs.org/';
const PACKAGE_JSON = parsePackageJson();
const packages = getDependencies(PACKAGE_JSON);

// Stop process if selected project directory does not exist
if (!fs.existsSync(PROJECT_DIRECTORY)) {
  console.error(`Error: ${PROJECT_DIRECTORY} does not exist.`);
  process.exit(9); // Invalid Argument exit code
}

const NODE_MODULES_PATH = path.resolve(PROJECT_DIRECTORY, 'node_modules');
const USE_NODE_MODULES = fs.existsSync(NODE_MODULES_PATH);

if (USE_NODE_MODULES) {
  const allPackageData = getAllPackagesData(NODE_MODULES_PATH);
  console.log(allPackageData, allPackageData.length);
}
