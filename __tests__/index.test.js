import { fileURLToPath } from 'url';
import nock from 'nock';
import os from 'os';
import path from 'path';
import fsp from 'fs/promises';

import pageLoader from '../src/index.js';

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpFilePath = os.tmpdir();
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

let initHtmlData;
let updatedHtmlData;
let imageData;
let jsData;
let cssData;
let tmpDir;

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(path.join(tmpFilePath, 'page-loader-'));
});

beforeAll(async () => {
  const initHtmlFixturePath = path.join(getFixturePath('ru-hexlet-io-courses_files'), 'ru-hexlet-io-courses.html');
  const imageFileFixture = path.join(getFixturePath('ru-hexlet-io-courses_files'), 'ru-hexlet-io-assets-professions-nodejs.png');
  const updatedHtmlFixturePath = getFixturePath('ru-hexlet-io-courses.html');
  const jsFileFixturePath = path.join(getFixturePath('ru-hexlet-io-courses_files'), 'ru-hexlet-io-packs-js-runtime.js');
  const cssFileFixturePath = path.join(getFixturePath('ru-hexlet-io-courses_files'), 'ru-hexlet-io-assets-application.css');

  initHtmlData = await fsp.readFile(initHtmlFixturePath, 'utf-8');
  imageData = await fsp.readFile(imageFileFixture, 'utf-8');
  updatedHtmlData = await fsp.readFile(updatedHtmlFixturePath, 'utf-8');
  jsData = await fsp.readFile(jsFileFixturePath, 'utf-8');
  cssData = await fsp.readFile(cssFileFixturePath, 'utf-8');
});

describe('Check successful download', () => {
  test('Page loader', async () => {
    const initialHtmlData = initHtmlData;
    const actualHtmlData = updatedHtmlData;
    const actualImageData = imageData;
    const actualJsData = jsData;
    const actualCssData = cssData;

    nock(/ru\.hexlet\.io/)
      .get(/\/courses/)
      .reply(200, initialHtmlData)
      .get(/\/assets\/professions\/nodejs\.png/)
      .reply(200, actualImageData)
      .get(/\/packs\/js\/runtime\.js/)
      .reply(200, actualJsData)
      .get(/\/assets\/application\.css/)
      .reply(200, actualCssData)
      .get(/\/courses/)
      .reply(200, initialHtmlData);

    await pageLoader('https://ru.hexlet.io/courses', tmpDir);
    const expectedHtmlData = await fsp.readFile(path.join(tmpDir, 'ru-hexlet-io-courses.html'), 'utf-8');
    const expectedImageData = await fsp.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png'), 'utf-8');
    const expectedJsData = await fsp.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js'), 'utf-8');
    const expectedCssData = await fsp.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css'), 'utf-8');

    expect(expectedHtmlData).toEqual(actualHtmlData);
    expect(expectedImageData).toEqual(actualImageData);
    expect(expectedJsData).toEqual(actualJsData);
    expect(expectedCssData).toEqual(actualCssData);
  });
});

describe('Thrown rejections', () => {
  test('FS issues', async () => {
    nock('https://example.com')
      .get('/')
      .reply(200);

    await expect(pageLoader('https://example.com', '/etc')).rejects.toThrow("EACCES: permission denied, open '/etc/example-com.html'");
  });

  test('HTTP issues', async () => {
    nock('https://unavailable-domain.io')
      .get('/')
      .replyWithError('getaddrinfo ENOUTFOUND unavailable-domain.io')
      .get('/nonexistent')
      .reply(404, 'Not found')
      .get('/server-error')
      .reply(500, 'Internal Server Error');

    await expect(pageLoader('https://unavailable-domain.io', tmpDir)).rejects.toThrow('getaddrinfo ENOUTFOUND unavailable-domain.io');
    await expect(pageLoader('https://unavailable-domain.io/nonexistent')).rejects.toThrow('Request failed with status code 404');
    await expect(pageLoader('https://unavailable-domain.io/server-error')).rejects.toThrow('Request failed with status code 500');
  });
});
