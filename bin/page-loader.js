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
      console.error(`${err.message} error occurred while downloading the page`);
      process.exit(1);
    }));

program.parse();
