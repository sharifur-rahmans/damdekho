import Link from 'next/link';
import { sql } from '@/lib/db';
export const dynamic = 'force-dynamic';

const tk = n => '৳' + n.toLocaleString('en-IN');

export default async function Home({ searchParams }) {
  const q = (searchParams.q || '').toLowerCase().trim();
  const cat = searchParams.cat || '';
  const [cats, prods, ls] = await Promise.all([
    sql`select * from categories order by name`,
    sql`select p.id, p.name, p.spec, c.slug from products p join categories c on c.id=p.category_id`,
    sql`select l.product_id, l.price, l.url, l.warranty, l.official, l.updated_at, s.name as store
        from listings l join stores s on s.id=l.store_id where l.price is not null order by l.price`,
  ]);
  const items = prods
    .filter(p => (!cat || p.slug === cat) && (p.name + ' ' + p.spec).toLowerCase().includes(q))
    .map(p => ({ ...p, stores: ls.filter(l => l.product_id === p.id) }))
    .filter(p => p.stores.length)
    .sort((a, b) => a.stores[0].price - b.stores[0].price);

  return (
    <div className="wrap">
      <div className="logo">Dam<b>Dekho</b></div>
      <h1>Check the price before you pay.</h1>
      <p className="muted">Compare electronics prices across Bangladesh stores, with warranty type and last-updated time.</p>
      <form className="search">
        <input name="q" defaultValue={searchParams.q || ''} placeholder="Search e.g. Galaxy A55, IdeaPad" />
        {cat && <input type="hidden" name="cat" value={cat} />}
        <button>Search</button>
      </form>
      <div className="chips">
        <Link className={'chip' + (!cat ? ' on' : '')} href="/">All</Link>
        {cats.map(c => <Link key={c.id} className={'chip' + (cat === c.slug ? ' on' : '')} href={`/?cat=${c.slug}`}>{c.name}</Link>)}
      </div>
      {items.length === 0 && <p className="muted">No products yet. Add some in <Link href="/admin">the admin panel</Link>.</p>}
      {items.map(p => (
        <details key={p.id}>
          <summary>
            <div><b>{p.name}</b><div className="muted">{p.spec} · {p.stores.length} stores</div></div>
            <strong>{tk(p.stores[0].price)}</strong>
          </summary>
          <div className="in">
            {p.stores.map((l, i) => (
              <div className="s" key={i}>
                <div>
                  <b>{l.store}</b>{i === 0 && <span className="best">Lowest price</span>}
                  <div className="muted" style={{ fontSize: 13 }}>
                    <span className={'tag' + (l.official ? '' : ' un')}>{l.official ? 'Official' : 'Unofficial'}</span>
                    {l.warranty} warranty · updated {new Date(l.updated_at).toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div><b>{tk(l.price)}</b>{l.url && <> <a href={l.url} target="_blank" rel="nofollow sponsored noopener">Visit store</a></>}</div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
