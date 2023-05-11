import fs from 'fs';
import { LicenseInfo, PackageData } from '../types';

interface JsonData {
  version: string;
  archive: string;
  url?: string;
  license?: LicenseInfo | null;
}

export default function saveAsJSON(allPackageData: PackageData[], outputPath: string) {
  const data: Record<string, JsonData> = {};

  allPackageData.forEach((packageData) => {
    const { name, ...otherData } = packageData;
    data[name] = otherData;
  });

  try {
    fs.writeFileSync(outputPath, JSON.stringify(data));
  } catch (e) {
    console.error(`Error: There was a problem writing to file ${outputPath}`);
    console.error(e);
  }
}
