import fsp from 'fs/promises';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import prettier from 'prettier';
import {
  formatPathName, isDownloadable, getFilePath, replaceSlashesWithDashed,
} from './utils.js';

const downloadFiles = (url, filePath) => axios.get(url, { responseType: 'arraybuffer' })
  .then((response) => fsp.writeFile(filePath, response.data))
  .then(() => {
    console.log(url);
    console.log(filePath);
  })
  .catch((error) => {
    throw error;
  });

const pageLoader = (url, outputDir) => {
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
      const imgPromises = [];

      $('img').each((i, img) => {
        const imgSrc = $(img).attr('src');
        const imgFileName = `${formattedHostName}${replaceSlashesWithDashed(imgSrc)}`;
        const imgPathName = path.join(filesFolderDirPath, imgFileName);
        const imgDownloadLink = new URL(imgSrc, url).href;

        if (isDownloadable(imgSrc, url)) {
          imgPromises.push(downloadFiles(imgDownloadLink, imgPathName));
          $(img).attr('src', getFilePath(filesFolderName, imgFileName));
        }
      });

      const updatedHtml = prettier.format($.html(), { parser: 'html' });
      return Promise.all(imgPromises)
        .then(() => fsp.writeFile(htmlFilePath, updatedHtml));
    })
    .catch((error) => {
      throw error;
    });
};

export default pageLoader;
