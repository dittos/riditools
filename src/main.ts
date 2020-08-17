import "reflect-metadata";

import * as yargs from 'yargs';
import * as CalendarCrawler from './crawler/calendar';
import * as NewBooksCrawler from './crawler/new_books';

yargs
  .command('crawler <command>', 'crawlers', (args) => {
    args
      .command('calendar', 'crawl calendar', CalendarCrawler.handler)
      .command('new-books', 'crawl new books', NewBooksCrawler.handler)
  })
  .demandCommand()
  .help()
  .argv;
