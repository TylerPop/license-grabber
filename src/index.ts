import path from 'path';
import * as Utils from './utils';
import isValidPath from 'is-valid-path';
import saveAsHTML from './serialization/html';
import yargs from 'yargs';

interface LicenseGrabberOptions {
  projectDirectory: string;
  outputPath: string;
  filename: string;
  excludeProd: boolean;
  excludeDev: boolean;
  skipNodeModules: boolean;
  skipRegistry: boolean;
}

function main({
  projectDirectory,
  outputPath,
  filename,
  excludeProd,
  excludeDev,
  skipNodeModules,
  skipRegistry
}: LicenseGrabberOptions) {
  Utils.checkProjectDirectoryExists(projectDirectory);

  const NODE_MODULES_PATH = path.resolve(projectDirectory, 'node_modules');
  const REGISTRY_PREFIX = 'https://registry.npmjs.org/';
  const PACKAGE_JSON = Utils.parsePackageJson(projectDirectory);
  const packages = Utils.collectDependencies(
    PACKAGE_JSON,
    REGISTRY_PREFIX,
    excludeProd,
    excludeDev
  );

  const processedPackageData = packages.map(async (packageData) => {
    // Check node_modules first
    const packagePath = path.join(NODE_MODULES_PATH, packageData.name);
    if (!skipNodeModules) packageData.license = Utils.getLicenseFromNodeModules(packagePath);

    // Check registry if license is not found in node_modules
    if (!packageData.license && !skipRegistry) {
      await Utils.getLicenseFromRegistry(packageData).then((data) => (packageData = data));
    }

    // Populate any missing license descriptions using SPDX repository
    // https://github.com/spdx/license-list-data/tree/main/text
    if (packageData.license?.name && !packageData.license?.description) {
      await Utils.getLicenseDescription(packageData.license.name).then((desc) => {
        if (packageData?.license) packageData.license.description = desc;
      });
    }

    // Populate any missing package repository URLs
    if (!packageData?.url) {
      await Utils.getRepositoryURL(packageData).then((url) => (packageData.url = url));
    }

    return packageData;
  });

  outputPath = path.join(outputPath, filename + '.html');
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
      .option('output-path', {
        default: '.',
        describe: 'The directory where the output file(s) will be created.',
        type: 'string'
      })
      .option('filename', {
        default: 'license_info',
        describe: 'The name of the output file/directory created.',
        type: 'string'
      })
      .option('exclude-prod', {
        default: false,
        describe:
          'License information from production dependencies will be excluded from the output.',
        type: 'boolean'
      })
      .option('exclude-dev', {
        default: false,
        describe:
          'License information from development dependencies will be excluded from the output.',
        type: 'boolean'
      })
      .option('skip-node-modules', {
        default: false,
        describe: 'Skips checking node_modules folder for license information.',
        type: 'boolean'
      })
      .option('skip-registry', {
        default: false,
        describe: 'Skips checking the NPM registry for license information.',
        type: 'boolean'
      })
      .parseSync();

    main({
      projectDirectory: argv.directory,
      outputPath: argv.outputPath,
      filename: argv.filename,
      excludeProd: argv.excludeProd,
      excludeDev: argv.excludeDev,
      skipNodeModules: argv.skipNodeModules,
      skipRegistry: argv.skipRegistry
    });
  })
  .help().argv;
