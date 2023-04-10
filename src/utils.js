import path from 'path';

export const formatPathName = (pathName) => pathName.replace(/htt(p|ps):\/\//, '').replace(/\W/g, '-');

export const replaceSlashesWithDashed = (str) => str.replace(/\//g, '-');

export const isDownloadable = (pathName, hostName) => {
  const pathNameUrl = new URL(pathName, hostName);
  const baseUrl = new URL(hostName);
  return pathNameUrl.origin === baseUrl.origin;
};

export const getFilePath = (outputDir, fileName) => path.join(outputDir, fileName);
