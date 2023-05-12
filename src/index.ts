import path from 'path';
import yargs from 'yargs';
import * as Utils from './utils';
import isValidPath from 'is-valid-path';
import saveAs from './serialization';
import { LicenseGrabberOptions } from './types';

function main({
  projectDirectory,
  type,
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

  outputPath = path.join(outputPath, filename);
  if (!isValidPath(outputPath)) {
    console.error(`Error: The output ${outputPath} is not a valid path.`);
    process.exit(9);
  }

  Promise.all(processedPackageData).then((data) => {
    saveAs(type, data, outputPath);
    console.info('Complete.');
  });
}

// Command line functionality
yargs
  .scriptName('license-grabber')
  .usage('$0 [directory] <options>')
  .wrap(Math.min(105, yargs.terminalWidth()))
  .command('$0 [directory]', '', (yargs) => {
    const argv = yargs
      .positional('directory', {
        default: '.',
        describe: 'The root directory of the project.',
        type: 'string',
        nargs: 1,
        normalize: true
      })
      .option('type', {
        alias: ['t'],
        default: 'json',
        describe: 'The type of output file that is generated.',
        type: 'string',
        choices: ['json', 'txt', 'markdown', 'html'],
        nargs: 1
      })
      .option('output-path', {
        alias: ['o'],
        default: '.',
        describe: 'The directory where the output file(s) will be generated.',
        type: 'string',
        nargs: 1,
        normalize: true
      })
      .option('name', {
        alias: ['n'],
        default: 'license_info',
        describe: 'The name of the output file.',
        type: 'string',
        nargs: 1
      })
      .option('exclude-prod', {
        alias: ['P'],
        default: false,
        describe: 'Exclude licenses from production dependencies.',
        type: 'boolean',
        nargs: 0
      })
      .option('exclude-dev', {
        alias: ['D'],
        default: false,
        describe: 'Exclude licenses from development dependencies.',
        type: 'boolean',
        nargs: 0
      })
      .option('skip-node-modules', {
        alias: ['N'],
        default: false,
        describe: 'Skips checking the node_modules folder.',
        type: 'boolean',
        nargs: 0
      })
      .option('skip-registry', {
        alias: ['R'],
        default: false,
        describe: 'Skips checking the NPM registry.',
        type: 'boolean',
        nargs: 0
      })
      .parseSync();

    const options = {
      projectDirectory: argv.directory,
      type: argv.type,
      outputPath: argv.outputPath,
      filename: argv.name,
      excludeProd: argv.excludeProd,
      excludeDev: argv.excludeDev,
      skipNodeModules: argv.skipNodeModules,
      skipRegistry: argv.skipRegistry
    };

    if (!argv.help) main(options);
  })
  .help()
  .alias('help', ['h'])
  .alias('version', ['v']).argv;
