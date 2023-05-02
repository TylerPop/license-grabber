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

interface PackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  license?: string;
}

export type { PackageData, LicenseInfo, PackageJson };
