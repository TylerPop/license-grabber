interface PackageData {
  name: string;
  version: string;
  archive: string;
  licenses: LicenseInfo[];
}

interface LicenseInfo {
  name: string;
  description: string;
}

export type { PackageData, LicenseInfo };
