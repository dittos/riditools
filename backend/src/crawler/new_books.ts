import * as cheerio from 'cheerio';
import { cachedHttpGet, Category } from './utils';
import { createConnection, Connection } from "typeorm";
import { Book } from "../entity/book";

async function crawlNewBooks(
  connection: Connection,
  category: Category,
  urlTemplate: ({ page: number }) => string
) {
  for (let page = 1; page <= 10; page++) {
    const url = urlTemplate({ page });
    const doc = cheerio.load(await cachedHttpGet(url));
    const bookEls = doc('.book_macro_110').toArray().map(el => cheerio(el));
    const bookEntries = bookEls.map(bookEl => {
      const titleLinkEl = bookEl.find('.title_link');
      const href = titleLinkEl.attr('href')!;
      const [, id] = /^\/books\/([0-9]+)/.exec(href)!;
      const title = titleLinkEl.find('.title_text').text().trim();
      return {
        id,
        title,
      };
    });
    const now = new Date();
    await connection.transaction(async em => {
      for (const bookEntry of bookEntries) {
        const existingBook = await em.findOne(Book, bookEntry.id, {
          lock: { mode: 'pessimistic_write' }
        });
        if (existingBook) {
          console.log(`book ${bookEntry.id} already exists.`);
          continue;
        }
        console.log(`creating book ${bookEntry.id}`);
        const book = new Book();
        book.id = bookEntry.id;
        book.title = bookEntry.title;
        book.category = category;
        book.firstSeenAt = now;
        await em.save(book);
      }
    });
  }
}

export async function handler() {
  const connection = await createConnection();
  await Promise.all([
    // 일반
    crawlNewBooks(connection, 'general', ({ page }) => `https://ridibooks.com/new-releases/general?order=recent&page=${page}`),
    // 만화
    crawlNewBooks(connection, 'comic', ({ page }) => `https://ridibooks.com/new-releases/comic?page=${page}`),
    // 라노벨
    crawlNewBooks(connection, 'lightnovel', ({ page }) => `https://ridibooks.com/category/books/3000?order=recent&page=${page}`),
  ]);
}
