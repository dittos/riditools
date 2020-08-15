import "reflect-metadata";

import * as fs from 'fs';
import * as crypto from 'crypto';
import axios from 'axios';

export type Category = 'general' | 'comic' | 'lightnovel';

export async function cachedHttpGet(url: string) {
  const cacheKey = crypto.createHash('sha256').update(url).digest('hex');
  const cachePath = `tmp/cache/${cacheKey}`;
  if (fs.existsSync(cachePath)) {
    // TODO: cache ttl
    return fs.readFileSync(cachePath);
  }
  const data = (await axios.get(url)).data;
  fs.writeFileSync(cachePath, data);
  return data;
}
