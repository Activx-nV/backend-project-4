import fsp from 'fs/promises';
import axios from 'axios';
import path from 'path';

const getFilePath = (outputDir, fileName) => path.join(outputDir, fileName);

const pageLoader = (url, outputDir) => {
  const newUrl = new URL(url);
  const hostName = newUrl.host;
  const pathName = newUrl.pathname;
  const fullPath = `${hostName}${pathName}`;
  const formattedFileName = `${fullPath.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
  const filePath = getFilePath(outputDir, formattedFileName);

  return axios.get(url, { responseType: 'document' })
    .then((response) => fsp.writeFile(filePath, response.data, (err) => {
      if (err) {
        throw err;
      }
    }).then(() => {
      console.log(url);
      console.log(filePath);
    }))
    .catch((error) => {
      throw error;
    });
};

export default pageLoader;
