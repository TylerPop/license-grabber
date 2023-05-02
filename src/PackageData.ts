interface PackageData {
  name: string;
  version: string;
  licenses: LicenseInfo[];
  archive?: string;
}

interface LicenseInfo {
  name: string;
  description: string;
}

export type { PackageData, LicenseInfo };
