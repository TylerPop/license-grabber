import fs from 'fs';
import path from 'path';
import axios from 'axios';
import isValidPath from 'is-valid-path';
import { LicenseInfo, PackageData, PackageJson } from '../PackageData';

export function parsePackageJson(projectDirectory: string): PackageJson {
  try {
    const packageJsonBuffer = fs.readFileSync(path.resolve(projectDirectory, 'package.json'));
    const packageJson = JSON.parse(packageJsonBuffer.toString());
    return packageJson;
  } catch (e) {
    console.error(`Error: Unable to locate package.json in ${projectDirectory}`);
    process.exit(1);
  }
}

export function checkProjectDirectoryExists(projectDirectory: string) {
  if (!fs.existsSync(projectDirectory)) {
    console.error(`Error: ${projectDirectory} does not exist.`);
    process.exit(9); // Invalid Argument exit code
  } else if (!isValidPath(projectDirectory)) {
    console.error(`Error: ${projectDirectory} is not a valid path.`);
    process.exit(9);
  }
}

export function collectDependencies(
  packageJson: PackageJson,
  registryPrefix: string,
  excludeProd: boolean,
  excludeDev: boolean
): PackageData[] {
  let dependencies: PackageData[] = [];
  let devDependencies: PackageData[] = [];

  if (!excludeProd && packageJson?.dependencies) {
    dependencies = Object.entries(packageJson.dependencies).map(([name, version]) => {
      const archiveUrl = new URL(`${name}`, registryPrefix).href;
      return { name, version: version.slice(1), archive: archiveUrl };
    });
  }

  if (!excludeDev && packageJson?.devDependencies) {
    devDependencies = Object.entries(packageJson.devDependencies).map(([name, version]) => {
      const archiveUrl = new URL(`${name}`, registryPrefix).href;
      return { name, version: version.slice(1), archive: archiveUrl };
    });
  }

  return dependencies.concat(devDependencies);
}

export function getLicensePath(packagePath: string): string | null {
  const licenseRegex = /(LICENSE|LICENCE|COPYING|COPYRIGHT)\.?.*/i;
  const files = fs.readdirSync(packagePath);
  const licenseFile = files.filter((filename) => licenseRegex.test(filename));

  if (licenseFile.length === 1) return path.join(packagePath, licenseFile[0]);
  else return null;
}

export function getLicenseFromNodeModules(packagePath: string): LicenseInfo | null {
  const licensePath = getLicensePath(packagePath);

  if (!licensePath) return null;

  const licenseDescriptionBuffer = fs.readFileSync(licensePath);
  const packageJsonBuffer = fs.readFileSync(path.join(packagePath, 'package.json'));
  const packageJson = JSON.parse(packageJsonBuffer.toString());

  const info = {
    name: packageJson.license ?? 'Unknown',
    description: licenseDescriptionBuffer.toString().trim()
  };

  return info;
}

export async function getLicenseFromRegistry(packageData: PackageData) {
  return axios
    .get(packageData.archive)
    .then((response) => {
      if (response.data?.license) {
        try {
          const packageLicense = response.data.versions[packageData.version].license;
          packageData.license = { name: packageLicense, description: '' };

          const repositoryUrl = response.data.repository?.url;
          if (repositoryUrl) {
            packageData.url = repositoryUrl.replace('git+', '');
          }
        } catch (e) {
          console.log(
            `Could not find license from registry for ${packageData.name} ${packageData.version}`
          );
        }
      }
      return packageData;
    })
    .catch((error) => {
      console.error(error);
      return packageData;
    });
}

export async function getLicenseDescription(licenseName: string): Promise<string> {
  const licenseDescriptionUrl = `https://raw.githubusercontent.com/spdx/license-list-data/master/text/${licenseName}.txt`;

  return axios
    .get(licenseDescriptionUrl)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Error: Unable to retrieve license description for ${licenseName}.`);
      console.error(error);
      return '';
    });
}

export async function getRepositoryURL(packageData: PackageData): Promise<string> {
  return axios
    .get(packageData.archive)
    .then((response) => {
      if (response.data.repository?.url) {
        return response.data.repository.url.replace('git+', '');
      }

      console.error(
        `Error: Unable to retrieve repository URL for ${packageData.name} ${packageData.version}.`
      );
    })
    .catch((error) => {
      console.error(error);
      return '';
    });
}
