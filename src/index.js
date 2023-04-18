import fsp from 'fs/promises';
import * as cheerio from 'cheerio';
import {
  formatPathName, getFilePath, getAllResources, downloadFiles,
} from './utils.js';

const pageLoader = (url, outputDir = process.cwd()) => {
  const formattedFileName = formatPathName(url);
  const filesFolderName = `${formattedFileName}_files`;
  const newUrl = new URL(url);
  const formattedHostName = formatPathName(newUrl.host);

  const htmlExtFileName = `${formattedFileName}.html`;
  const htmlFilePath = getFilePath(outputDir, htmlExtFileName);
  const filesFolderDirPath = getFilePath(outputDir, filesFolderName);

  return downloadFiles(url, htmlFilePath)
    .then(() => fsp.mkdir(filesFolderDirPath, { recursive: true }))
    .then(() => fsp.readFile(htmlFilePath))
    .then((data) => {
      const $ = cheerio.load(data);
      return getAllResources(
        $,
        formattedHostName,
        filesFolderDirPath,
        filesFolderName,
        htmlFilePath,
        url,
      );
    })
    .catch((error) => {
      throw error;
    });
};

export default pageLoader;
