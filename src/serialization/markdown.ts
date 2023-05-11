import fs from 'fs';
import { PackageData } from '../types';

export default function saveAsMarkdown(allPackageData: PackageData[], outputPath: string) {
  let markdownText = '';

  allPackageData.forEach((packageData) => {
    markdownText += `# ${packageData.name}\n\`\`\`\n${packageData.license?.description}\n\`\`\`\n`;
  });

  try {
    fs.writeFileSync(outputPath, markdownText);
  } catch (e) {
    console.error(`Error: There was a problem writing to file ${outputPath}`);
    console.error(e);
  }
}
