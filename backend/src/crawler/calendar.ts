import * as cheerio from 'cheerio';
import { cachedHttpGet, Category } from "./utils";
import { DateTime } from 'luxon';
import { createConnection, EntityManager } from 'typeorm';
import { isEqual } from 'lodash';
import { Calendar, CalendarEntry } from '../entity/calendar';
import { CalendarEntryDelta, CalendarRevision } from '../entity/calendar_revision';
import { URL } from 'url';

type CalendarData = {
  yearMonth: string;
  entries: CalendarEntry[];
  fetchedAt: DateTime;
};

async function findCalendarUrl(genreIndexUrl: string, a11yLabel: string = '신간 캘린더'): Promise<string> {
  const doc = cheerio.load(await cachedHttpGet(genreIndexUrl));
  const path = doc(`a[aria-label="${a11yLabel}"]`).attr('href');
  if (!path) throw new Error('Cannot find link');
  return new URL(path, genreIndexUrl).toString();
}

async function crawlCalendar(url: string): Promise<CalendarData> {
  const doc = cheerio.load(await cachedHttpGet(url));
  const now = DateTime.fromObject({ zone: 'Asia/Seoul' });
  const month = Number(/^([0-9]+)월/.exec(doc('.EventCalendar_Title').text())![1]);
  const year = now.month > month ? now.year + 1 : now.year;

  const badgeEls = doc('.EventCalendar_Badge').toArray().map(el => cheerio(el));
  const badgeMappings = badgeEls.map(el => {
    const src = el.find('img.EventCalendar_BadgeIcon').attr('src');
    const name = el.find('.EventCalendar_BadgeText').text().trim();
    return { src, name };
  });
  const dateEls = doc('.EventCalendar_Publications').toArray().map(el => cheerio(el));
  const entries: CalendarEntry[] = [];
  for (const dateEl of dateEls) {
    const date = dateEl.find('.EventCalendar_PublicationsDayNumber').text()!;
    const dateParts = date.split('.').map(it => it.trim()).filter(it => it !== '').map(it => Number(it));
    let y, m, d;
    if (dateParts.length === 2) {
      [m, d] = dateParts;
      y = now.month > m ? now.year + 1 : now.year;
    } else {
      y = year;
      m = month;
      d = dateParts[0];
    }
    const rowEls = dateEl.find('.EvenetCalendar_Row').toArray().map(el => cheerio(el));
    for (const rowEl of rowEls) {
      const rowBadgeEls = rowEl.find('img.EventCalendar_TableBadge').toArray().map(el => cheerio(el));
      const rowBadges = rowBadgeEls.map(el => badgeMappings.find(it => it.src === el.attr('src'))!.name);
      const titleEl = rowEl.find('.EventCalendar_PublicationTitle');
      const title = titleEl.contents().filter((i, node) => node.type === 'text').text().trim();
      const alert = titleEl.find('.EventCalendar_Alert').text().trim();
      const authors = rowEl.find('.EventCalendar_PublicationAuthor').text().trim();
      entries.push({
        title,
        badges: rowBadges,
        alert: alert !== '' ? alert : null,
        authors,
        date: DateTime.fromObject({
          year,
          month: Number(m),
          day: Number(d),
          zone: 'Asia/Seoul',
        }).toISODate(),
      });
    }
  }

  return {
    yearMonth: DateTime.fromObject({ year, month }).toFormat('yyyy-MM'),
    entries,
    fetchedAt: now,
  };
}

function calendarEntryEquals(a: CalendarEntry, b: CalendarEntry): boolean {
  return (
    a.title === b.title &&
    isEqual(a.badges, b.badges) &&
    a.alert === b.alert &&
    a.authors === b.authors &&
    a.date === b.date
  );
}

function compareCalendarEntries(prevEntries: CalendarEntry[], entries: CalendarEntry[]): CalendarEntryDelta[] {
  const changes: CalendarEntryDelta[] = [];
  const prevByTitle = new Map<string, CalendarEntry>();
  prevEntries.forEach(it => {
    prevByTitle.set(it.title, it);
  });

  // Added, Changed
  entries.forEach(entry => {
    const prev = prevByTitle.get(entry.title);
    if (prev) {
      if (!calendarEntryEquals(prev, entry)) {
        changes.push({
          type: 'changed',
          prev,
          current: entry,
        });
      }
    } else {
      changes.push({
        type: 'added',
        prev: null,
        current: entry,
      });
    }
  });

  // Removed
  const currentTitleSet = new Set<string>(entries.map(it => it.title));
  prevEntries.forEach(prev => {
    if (!currentTitleSet.has(prev.title)) {
      changes.push({
        type: 'removed',
        prev,
        current: null,
      });
    }
  });

  return changes;
}

async function saveCalendar(em: EntityManager, category: Category, currentData: CalendarData) {
  let calendar = await em.findOne(Calendar, { category, yearMonth: currentData.yearMonth });
  if (!calendar) {
    console.log(`Creating calendar: ${category}`);
    calendar = new Calendar();
    calendar.category = category;
    calendar.yearMonth = currentData.yearMonth;
    calendar.lastRevision = null;
    calendar.entries = currentData.entries;
    calendar.fetchedAt = currentData.fetchedAt.toJSDate();
    await em.save(calendar);
    return;
  }
  console.log(`Updating calendar: ${category}`);
  const deltas = compareCalendarEntries(calendar.entries, currentData.entries);
  console.log(`Found ${deltas.length} changes`);
  if (deltas.length > 0) {
    calendar.lastRevision = calendar.lastRevision ? calendar.lastRevision + 1 : 1;
    calendar.entries = currentData.entries;
    const revision = new CalendarRevision();
    revision.calendar = calendar;
    revision.revision = calendar.lastRevision;
    revision.entryDeltas = deltas;
    revision.fetchedAt = currentData.fetchedAt.toJSDate();
    await em.save(revision);
  }
  calendar.fetchedAt = currentData.fetchedAt.toJSDate();
  await em.save(calendar);
}

export async function handler() {
  const connection = await createConnection();
  const [
    generalCalendarData,
    comicCalendarData,
    lightnovelCalendarData
  ] = await Promise.all([
    // 일반
    findCalendarUrl('https://ridibooks.com/').then(url => crawlCalendar(url)),
    // 만화
    crawlCalendar('https://ridibooks.com/event/11339'),
    // 라노벨
    crawlCalendar('https://ridibooks.com/event/11342')
  ]);

  await connection.transaction('SERIALIZABLE', async em => {
    await saveCalendar(em, 'general', generalCalendarData);
    await saveCalendar(em, 'comic', comicCalendarData);
    await saveCalendar(em, 'lightnovel', lightnovelCalendarData);
  });
}
