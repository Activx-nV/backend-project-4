#!/usr/bin/env node
import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .argument('<url>')
  .action((url, { output }) => pageLoader(url, output)
    .then(() => {
      console.log(`The page ${url} was successfully downloaded`);
    })
    .catch((err) => {
      console.error(`Error occurred while downloading the page: ${err.message} ${err.code}`);
      process.exit(1);
    }));

program.parse();
