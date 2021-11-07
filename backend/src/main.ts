import "reflect-metadata";

import * as yargs from 'yargs';
import * as CalendarCrawler from './crawler/calendar';
import * as NewBooksCrawler from './crawler/new_books';
import * as ApiServer from './api/server';

yargs
  .command('crawler <command>', 'crawlers', (args) => {
    args
      .command('calendar', 'crawl calendar', CalendarCrawler.handler)
      .command('new-books', 'crawl new books', NewBooksCrawler.handler)
  })
  .command('api', 'api server', ApiServer.handler)
  .demandCommand()
  .help()
  .argv;
