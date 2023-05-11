import fs from 'fs';
import path from 'path';
import { PackageData } from '../types';

export default function saveAsTxt(allPackageData: PackageData[], outputDir: string) {
  // Create output directory if it doesn't already exist
  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir);
    } catch (e) {
      console.error(`Error: There was a problem creating directory ${outputDir}`);
      console.error(e);
    }
  }

  allPackageData.forEach((packageData) => {
    const packageNameDir = path.resolve(outputDir, packageData.name.replace('/', '-'));

    // Create directory for each package based on the name
    if (!fs.existsSync(packageNameDir)) {
      try {
        fs.mkdirSync(packageNameDir);
      } catch (e) {
        console.error(`Error: There was a problem creating directory ${packageNameDir}`);
        console.error(e);
      }
    }

    // Write license info to a text file inside the package directory
    if (packageData.license?.name) {
      const licenseFile = path.join(packageNameDir, `${packageData.license.name}.txt`);

      try {
        fs.writeFileSync(licenseFile, packageData.license.description);
      } catch (e) {
        console.error(`Error: There was a problem writing license file ${licenseFile}`);
        console.error(e);
      }
    }
  });
}
