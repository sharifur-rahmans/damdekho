import { sql, slugify } from '@/lib/db';
import { scrapeAll } from '@/lib/scrape';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const ok = req => process.env.ADMIN_PASSWORD && req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
const num = v => (v === '' || v == null ? null : parseInt(v, 10));

export async function GET(req) {
  if (!ok(req)) return Response.json({ error: 'Wrong password' }, { status: 401 });
  const [categories, products, stores, listings] = await Promise.all([
    sql`select * from categories order by name`,
    sql`select p.*, c.name as category from products p join categories c on c.id=p.category_id order by p.name`,
    sql`select * from stores order by name`,
    sql`select l.*, p.name as product, s.name as store from listings l join products p on p.id=l.product_id join stores s on s.id=l.store_id order by p.name, l.price`,
  ]);
  return Response.json({ categories, products, stores, listings });
}

export async function POST(req) {
  if (!ok(req)) return Response.json({ error: 'Wrong password' }, { status: 401 });
  const b = await req.json();
  try {
    switch (b.action) {
      case 'addCategory': await sql`insert into categories(name, slug) values(${b.name}, ${slugify(b.name)})`; break;
      case 'delCategory': await sql`delete from categories where id=${b.id}`; break;
      case 'addProduct': await sql`insert into products(name, spec, category_id) values(${b.name}, ${b.spec || ''}, ${num(b.category_id)})`; break;
      case 'delProduct': await sql`delete from products where id=${b.id}`; break;
      case 'addStore': await sql`insert into stores(name) values(${b.name}) on conflict do nothing`; break;
      case 'delStore': await sql`delete from stores where id=${b.id}`; break;
      case 'addListing':
        await sql`insert into listings(product_id, store_id, url, selector, price, warranty, official)
          values(${num(b.product_id)}, ${num(b.store_id)}, ${b.url || null}, ${b.selector || null}, ${num(b.price)}, ${b.warranty || '1 year'}, ${b.official !== false})`;
        break;
      case 'setPrice':
        await sql`update listings set price=${num(b.price)}, updated_at=now() where id=${b.id}`;
        await sql`insert into price_history(listing_id, price) values(${b.id}, ${num(b.price)})`;
        break;
      case 'delListing': await sql`delete from listings where id=${b.id}`; break;
      case 'scrape': return Response.json({ results: await scrapeAll(b.id || null) });
      default: return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
    return Response.json({ done: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
