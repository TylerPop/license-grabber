interface PackageData {
  name: string;
  version: string;
  license?: LicenseInfo | null;
  archive?: string;
}

interface LicenseInfo {
  name: string;
  description: string;
}

export type { PackageData, LicenseInfo };
