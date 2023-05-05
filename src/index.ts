import path from 'path';
import fs from 'fs';
import * as LicenseUtils from './LicenseUtils';
import { PackageData, PackageJson } from './PackageData';
import { saveAsJSON } from './serialization/json';
import isValidPath from 'is-valid-path';

function collectDependencies(
  packageJson: PackageJson,
  includeDevDependencies = true
): PackageData[] {
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
const packages = collectDependencies(PACKAGE_JSON);

// Stop process if selected project directory does not exist or is invalid
if (!fs.existsSync(PROJECT_DIRECTORY)) {
  console.error(`Error: ${PROJECT_DIRECTORY} does not exist.`);
  process.exit(9); // Invalid Argument exit code
} else if (!isValidPath(PROJECT_DIRECTORY)) {
  console.error(`Error: ${PROJECT_DIRECTORY} is not a valid path.`);
  process.exit(9);
}

const NODE_MODULES_PATH = path.resolve(PROJECT_DIRECTORY, 'node_modules');

// Main

const processedPackageData = packages.map(async (packageData) => {
  // Check node_modules first
  const packagePath = path.join(NODE_MODULES_PATH, packageData.name);
  packageData.license = LicenseUtils.getLicenseFromNodeModules(packagePath);

  // Check registry if license is not found in node_modules
  if (!packageData.license) {
    await LicenseUtils.getLicenseFromRegistry(packageData).then((data) => (packageData = data));
  }

  // Populate any missing license descriptions using SPDX repository
  // https://github.com/spdx/license-list-data/tree/main/text
  if (packageData.license?.name && !packageData.license?.description) {
    await LicenseUtils.getLicenseDescription(packageData.license.name).then((desc) => {
      if (packageData?.license) packageData.license.description = desc;
    });
  }

  // Populate any missing package repository URLs
  if (!packageData?.url) {
    await LicenseUtils.getRepositoryURL(packageData).then((url) => (packageData.url = url));
  }

  return packageData;
});

const outputPath = path.join('.', 'output.json');
if (!isValidPath(outputPath)) {
  console.error(`Error: The output ${outputPath} is not a valid path.`);
  process.exit(9);
}

Promise.all(processedPackageData).then((data) => saveAsJSON(data, outputPath));
