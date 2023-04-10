import { test } from '@jest/globals';
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
let tmpDir;

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(path.join(tmpFilePath, 'page-loader-'));
});

beforeAll(async () => {
  const initHtmlFixturePath = path.join(getFixturePath('ru-hexlet-io-courses_files'), 'ru-hexlet-io-courses.html');
  const imageFileFixture = path.join(getFixturePath('ru-hexlet-io-courses_files'), 'ru-hexlet-io-assets-professions-nodejs.png');
  const updatedHtmlFixturePath = getFixturePath('ru-hexlet-io-courses.html');
  initHtmlData = await fsp.readFile(initHtmlFixturePath, 'utf-8');
  imageData = await fsp.readFile(imageFileFixture, 'utf-8');
  updatedHtmlData = await fsp.readFile(updatedHtmlFixturePath, 'utf-8');
});

describe('Check successful download', () => {
  test('Page loader', async () => {
    const initialHtmlData = initHtmlData;
    const actualHtmlData = updatedHtmlData;
    const actualImageData = imageData;

    nock(/ru\.hexlet\.io/)
      .get(/\/courses/)
      .reply(200, initialHtmlData)
      .get(/\/assets\/professions\/nodejs\.png/)
      .reply(200, actualImageData);

    await pageLoader('https://ru.hexlet.io/courses', tmpDir);
    const expectedHtmlData = await fsp.readFile(path.join(tmpDir, 'ru-hexlet-io-courses.html'), 'utf-8');
    const expectedImageData = await fsp.readFile(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png'), 'utf-8');

    expect(expectedHtmlData).toEqual(actualHtmlData);
    expect(expectedImageData).toEqual(actualImageData);
  });
});
