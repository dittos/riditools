import * as yargs from 'yargs';
import * as CalendarCrawler from './crawler/calendar';

yargs.command('crawler calendar', 'crawl calendar', CalendarCrawler.handler)
  .demandCommand()
  .help()
  .argv;
