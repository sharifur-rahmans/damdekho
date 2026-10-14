import * as cheerio from 'cheerio';
import { sql } from './db';

const bn = '০১২৩৪৫৬৭৮৯';
export function parsePrice(text) {
  const t = text.replace(/[০-৯]/g, d => bn.indexOf(d));
  const m = t.match(/\d[\d,]*(\.\d+)?/);
  if (!m) return null;
  const n = Math.round(parseFloat(m[0].replace(/,/g, '')));
  return n > 0 ? n : null;
}

export async function scrapeListing(l) {
  try {
    const res = await fetch(l.url, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; DamDekhoBot/1.0)', 'accept-language': 'en' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const $ = cheerio.load(await res.text());
    const price = parsePrice($(l.selector).first().text());
    if (!price) throw new Error('No price found with selector "' + l.selector + '"');
    await sql`update listings set price=${price}, updated_at=now(), last_error=null where id=${l.id}`;
    if (price !== l.price) await sql`insert into price_history(listing_id, price) values(${l.id}, ${price})`;
    return { id: l.id, ok: true, price };
  } catch (e) {
    await sql`update listings set last_error=${String(e.message).slice(0, 200)} where id=${l.id}`;
    return { id: l.id, ok: false, error: e.message };
  }
}

export async function scrapeAll(onlyId) {
  const rows = onlyId
    ? await sql`select * from listings where id=${onlyId}`
    : await sql`select * from listings where url is not null and url <> '' and selector is not null and selector <> ''`;
  const out = [];
  for (let i = 0; i < rows.length; i += 5)
    out.push(...(await Promise.all(rows.slice(i, i + 5).map(scrapeListing))));
  return out;
}
