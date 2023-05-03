import fs from 'fs';
import path from 'path';
import { LicenseInfo } from './PackageData';

export function getLicensePath(packagePath: string): string | null {
  const licenseRegex = /(LICENSE|LICENCE|COPYING|COPYRIGHT)\.?.*/i;
  const files = fs.readdirSync(packagePath);
  const licenseFile = files.filter((filename) => licenseRegex.test(filename));

  if (licenseFile.length === 1) return path.join(packagePath, licenseFile[0]);
  else return null;
}

export function getLicenseInfo(packagePath: string): LicenseInfo | null {
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
