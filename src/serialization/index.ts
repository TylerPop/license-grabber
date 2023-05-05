import fs from 'fs';
import { LicenseInfo, PackageData } from '../PackageData';

interface JsonData {
  version: string;
  archive: string;
  url?: string;
  license?: LicenseInfo | null;
}

export function saveAsJSON(allPackageData: PackageData[], outputPath: string) {
  const data: Record<string, JsonData> = {};

  allPackageData.forEach((packageData) => {
    const { name, ...otherData } = packageData;
    data[name] = otherData;
  });

  fs.writeFileSync(outputPath, JSON.stringify(data));
}
