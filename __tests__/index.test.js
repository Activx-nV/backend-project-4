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

let data;
let tmpDir;

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(path.join(tmpFilePath, 'page-loader-'));
});

beforeAll(async () => {
  const fixturePath = getFixturePath('expected_html_result.html');
  data = await fsp.readFile(fixturePath, 'utf-8');
});

describe('Check successful download', () => {
  test('Page loader', async () => {
    const actualData = data;

    nock(/ru\.hexlet\.io/)
      .get(/\/courses/)
      .reply(200, actualData);

    await pageLoader('https://ru.hexlet.io/courses', tmpDir);
    const expectedData = await fsp.readFile(path.join(tmpDir, 'ru-hexlet-io-courses.html'), 'utf-8');

    expect(expectedData).toEqual(actualData);
  });
});
