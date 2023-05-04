import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { LicenseInfo, PackageData } from '../PackageData';

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
          const packageUrl = response.data.repository?.url.replace('git+', '');

          packageData.license = { name: packageLicense, description: '' };
          packageData.url = packageUrl;
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
