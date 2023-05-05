import fs from 'fs';
import path from 'path';
import { LicenseInfo, PackageData } from '../PackageData';

interface JsonData {
  version: string;
  archive: string;
  url?: string;
  license?: LicenseInfo | null;
}

export function saveAsJSON(allPackageData: PackageData[]) {
  const data: Record<string, JsonData> = {};

  allPackageData.forEach((packageData) => {
    const { name, ...otherData } = packageData;
    data[name] = otherData;
  });

  fs.writeFileSync(path.join('.', 'output.json'), JSON.stringify(data));
}