import path from 'path';
import fs from 'fs';
import * as LicenseUtils from './LicenseUtils';
import { PackageData, PackageJson } from './PackageData';
import isValidPath from 'is-valid-path';
import saveAsHTML from './serialization/html';
import yargs from 'yargs';

function collectDependencies(
  packageJson: PackageJson,
  registryPrefix: string,
  includeDevDependencies = true
): PackageData[] {
  let dependencies: PackageData[] = [];
  let devDependencies: PackageData[] = [];

  if (packageJson?.dependencies) {
    dependencies = Object.entries(packageJson.dependencies).map(([name, version]) => {
      const archiveUrl = new URL(`${name}`, registryPrefix).href;
      return { name, version: version.slice(1), archive: archiveUrl };
    });
  }

  if (includeDevDependencies && packageJson?.devDependencies) {
    devDependencies = Object.entries(packageJson.devDependencies).map(([name, version]) => {
      const archiveUrl = new URL(`${name}`, registryPrefix).href;
      return { name, version: version.slice(1), archive: archiveUrl };
    });
  }

  return dependencies.concat(devDependencies);
}

function parsePackageJson(projectDirectory: string): PackageJson {
  try {
    const packageJsonBuffer = fs.readFileSync(path.resolve(projectDirectory, 'package.json'));
    const packageJson = JSON.parse(packageJsonBuffer.toString());
    return packageJson;
  } catch (e) {
    console.error(`Error: Unable to locate package.json in ${projectDirectory}`);
    process.exit(1);
  }
}

function checkProjectDirectoryExists(projectDirectory: string) {
  if (!fs.existsSync(projectDirectory)) {
    console.error(`Error: ${projectDirectory} does not exist.`);
    process.exit(9); // Invalid Argument exit code
  } else if (!isValidPath(projectDirectory)) {
    console.error(`Error: ${projectDirectory} is not a valid path.`);
    process.exit(9);
  }
}

// Main
interface LicenseGrabberOptions {
  projectDirectory: string;
}

function main({ projectDirectory }: LicenseGrabberOptions) {
  checkProjectDirectoryExists(projectDirectory);

  const REGISTRY_PREFIX = 'https://registry.npmjs.org/';
  const PACKAGE_JSON = parsePackageJson(projectDirectory);
  const packages = collectDependencies(PACKAGE_JSON, REGISTRY_PREFIX);
  const NODE_MODULES_PATH = path.resolve(projectDirectory, 'node_modules');

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

  const outputPath = path.join('.', 'output.html');
  if (!isValidPath(outputPath)) {
    console.error(`Error: The output ${outputPath} is not a valid path.`);
    process.exit(9);
  }

  Promise.all(processedPackageData).then((data) => {
    saveAsHTML(data, outputPath);
    console.info('Complete.');
  });
}

yargs
  .scriptName('license-grabber')
  .usage('$0 [directory] <options>')
  .command('$0 [directory]', '', (yargs) => {
    const argv = yargs
      .positional('directory', {
        default: '.',
        describe: 'The root directory of the Node.js project.',
        type: 'string'
      })
      .parseSync();

    main({ projectDirectory: argv.directory });
  })
  .help().argv;
