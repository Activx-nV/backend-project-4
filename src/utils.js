import path from 'path';
import prettier from 'prettier';
import fsp from 'fs/promises';
import axios from 'axios';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';

const log = debug('page-loader');
log.enabled = false;

axiosDebug(log);

export const downloadFiles = (url, filePath) => axios.get(url, { responseType: 'arraybuffer' })
  .then((response) => fsp.writeFile(filePath, response.data));

export const formatPathName = (pathName) => pathName.replace(/htt(p|ps):\/\//, '').replace(/\W/g, '-');

export const replaceSlashesWithDashed = (str) => str.replace(/\//g, '-');

export const isDownloadable = (pathName, hostName) => {
  const pathNameUrl = new URL(pathName, hostName);
  const baseUrl = new URL(hostName);
  return pathNameUrl.origin === baseUrl.origin;
};

export const getFilePath = (outputDir, fileName) => path.join(outputDir, fileName);

export const getAllResources = (
  $,
  formattedHostName,
  filesFolderDirPath,
  filesFolderName,
  htmlFilePath,
  url,
) => {
  const tasks = new Listr([], { concurrent: true });
  const resourcesTags = {
    img: 'src',
    link: 'href',
    script: 'src',
  };

  log(`HTML file path: ${htmlFilePath}`);
  log(`Resource files store directory: ${filesFolderDirPath}`);

  Object.entries(resourcesTags).map(([key, value]) => {
    $(key).each((i, tagName) => {
      const src = $(tagName).attr(value);
      if (!src) {
        return;
      }

      const parsedUrl = new URL(src, url);
      const extensionFallBack = path.extname(parsedUrl.pathname) ? '' : '.html';
      const filename = `${formattedHostName}${replaceSlashesWithDashed(parsedUrl.pathname)}${extensionFallBack}`;
      const pathname = path.join(filesFolderDirPath, filename);
      const downloadLink = new URL(src, url).href;

      if (isDownloadable(src, url)) {
        log(`File name: ${filename}`);
        log(`Download url: ${downloadLink}`);
        tasks.add({
          title: downloadLink,
          task: () => downloadFiles(downloadLink, pathname)
        });
        $(tagName).attr(value, getFilePath(filesFolderName, filename));
      }
    });
  });

  const updatedHtml = prettier.format($.html(), { parser: 'html' });
  return tasks.run()
      .then(() => fsp.writeFile(htmlFilePath, updatedHtml)).then(() => console.log(`Page was successfully downloaded into ${htmlFilePath}`));
};
