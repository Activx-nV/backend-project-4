import fsp from 'fs/promises';
import * as cheerio from 'cheerio';
import {
  formatPathName, getFilePath, getAllResources, downloadFiles,
} from './utils.js';

const pageLoader = (url, outputDir = process.cwd()) => {
  const newUrl = new URL(url);
  let formattedFileName;

  if (newUrl.pathname === '/') {
    formattedFileName = formatPathName(newUrl.origin);
  } else {
    formattedFileName = formatPathName(newUrl.origin + newUrl.pathname);
  }

  const filesFolderName = `${formattedFileName}_files`;
  const formattedHostName = formatPathName(newUrl.host);

  const htmlExtFileName = `${formattedFileName}.html`;
  const htmlFilePath = getFilePath(outputDir, htmlExtFileName);
  const filesFolderDirPath = getFilePath(outputDir, filesFolderName);

  return fsp.access(outputDir)
    .catch(() => fsp.mkdir(outputDir, { recursive: true }))
    .then(() => downloadFiles(url, htmlFilePath)
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
      }));
};

export default pageLoader;
