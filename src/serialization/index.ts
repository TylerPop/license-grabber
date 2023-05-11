import saveAsJSON from './json';
import saveAsTxt from './txt';
import saveAsMarkdown from './markdown';
import saveAsHTML from './html';
import { PackageData } from '../types';

export default function saveAs(type: string, allPackageData: PackageData[], outputPath: string) {
  switch (type) {
    case 'json':
      saveAsJSON(allPackageData, outputPath + '.json');
      break;
    case 'txt':
      saveAsTxt(allPackageData, outputPath);
      break;
    case 'markdown':
      saveAsMarkdown(allPackageData, outputPath + '.md');
      break;
    case 'html':
      saveAsHTML(allPackageData, outputPath + '.html');
      break;
  }
}
