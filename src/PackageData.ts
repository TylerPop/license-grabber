interface PackageData {
  name: string;
  version: string;
  archive: string;
  url?: string;
  license?: LicenseInfo | null;
}

interface LicenseInfo {
  name: string;
  description: string;
}

interface PackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  license?: string;
}

export type { PackageData, LicenseInfo, PackageJson };
