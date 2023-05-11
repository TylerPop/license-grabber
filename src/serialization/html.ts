import fs from 'fs';
import { PackageData } from '../types';
import fillTemplateHTML, { getHTMLBody } from './html-template';

export default function saveAsHTML(allPackageData: PackageData[], outputPath: string) {
  let htmlBody = '';
  allPackageData.forEach((packageData) => {
    htmlBody += getHTMLBody(
      packageData.name,
      packageData.url ?? '',
      packageData.license?.description ?? ''
    );
  });

  const fullHTML = fillTemplateHTML(htmlBody);

  try {
    fs.writeFileSync(outputPath, fullHTML);
  } catch (e) {
    console.error(`Error: There was a problem writing to file ${outputPath}`);
    console.error(e);
  }
}
