'use client';
import { useState, useEffect } from 'react';

export default function Admin() {
  const [pw, setPw] = useState('');
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState('');

  const api = async (method, body, password = pw) => {
    const r = await fetch('/api/admin', { method, headers: { 'content-type': 'application/json', 'x-admin-password': password }, body: body && JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || 'Error'); return null; }
    return j;
  };
  const load = async (p = pw) => { const j = await api('GET', null, p); if (j) { setD(j); setMsg(''); sessionStorage.setItem('pw', p); } };
  const act = async (body, confirmText) => {
    if (confirmText && !confirm(confirmText)) return;
    setMsg('Working…');
    const j = await api('POST', body);
    if (j?.results) setMsg(`Checked ${j.results.length}, failed ${j.results.filter(x => !x.ok).length}`);
    else if (j) setMsg('Saved');
    load();
  };
  useEffect(() => { const p = sessionStorage.getItem('pw'); if (p) { setPw(p); load(p); } }, []);
  const form = (action, fields, label) => (
    <form className="f" onSubmit={e => { e.preventDefault(); const o = Object.fromEntries(new FormData(e.target)); act({ action, ...o }); e.target.reset(); }}>
      {fields}<button>{label}</button>
    </form>
  );
  const sel = (name, rows, ph) => (<select name={name} required><option value="">{ph}</option>{rows.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>);

  if (!d) return (
    <div className="wrap"><h1>Admin</h1>
      <form className="f" onSubmit={e => { e.preventDefault(); load(); }}>
        <input type="password" placeholder="Admin password" value={pw} onChange={e => setPw(e.target.value)} /><button>Log in</button>
      </form><p className="err">{msg}</p></div>
  );
  return (
    <div className="wrap">
      <h1 style={{ fontSize: 30 }}>Admin <a href="/" style={{ fontSize: 14 }}>view site</a></h1>
      <p className="muted">{msg}</p>

      <div className="box"><h2>Categories</h2>
        {form('addCategory', <input name="name" placeholder="e.g. Phones" required />, 'Add')}
        {d.categories.map(c => <span key={c.id} className="tag">{c.name}<button className="del" onClick={() => act({ action: 'delCategory', id: c.id }, 'Delete category and its products?')}>×</button></span>)}
      </div>

      <div className="box"><h2>Stores</h2>
        {form('addStore', <input name="name" placeholder="e.g. Star Tech" required />, 'Add')}
        {d.stores.map(s => <span key={s.id} className="tag">{s.name}<button className="del" onClick={() => act({ action: 'delStore', id: s.id }, 'Delete store and its prices?')}>×</button></span>)}
      </div>

      <div className="box"><h2>Products</h2>
        {form('addProduct', <>{sel('category_id', d.categories, 'Category')}<input name="name" placeholder="Product name" required /><input name="spec" placeholder="Spec (8GB / 256GB)" /></>, 'Add')}
        {d.products.map(p => <div key={p.id}>{p.name} <span className="muted">· {p.category} · {p.spec}</span><button className="del" onClick={() => act({ action: 'delProduct', id: p.id }, 'Delete product?')}>×</button></div>)}
      </div>

      <div className="box"><h2>Add price listing</h2>
        <p className="muted" style={{ fontSize: 13 }}>Give a product page URL and a CSS selector to auto-collect the price. Leave both empty to set the price by hand.</p>
        {form('addListing', <>{sel('product_id', d.products, 'Product')}{sel('store_id', d.stores, 'Store')}<input name="url" placeholder="Product page URL" /><input name="selector" placeholder="CSS selector e.g. .price-new" /><input name="price" type="number" placeholder="Price (৳)" /><input name="warranty" placeholder="Warranty (1 year)" /></>, 'Add')}
      </div>

      <div className="box"><h2>Listings <button className="ghost" onClick={() => act({ action: 'scrape' })}>Collect all prices now</button></h2>
        <div className="scroll"><table><thead><tr><th>Product</th><th>Store</th><th>Price</th><th>Source</th><th></th></tr></thead><tbody>
          {d.listings.map(l => (
            <tr key={l.id}><td>{l.product}</td><td>{l.store}</td>
              <td><input type="number" defaultValue={l.price || ''} style={{ width: 100 }} onBlur={e => e.target.value && +e.target.value !== l.price && act({ action: 'setPrice', id: l.id, price: e.target.value })} /></td>
              <td>{l.url ? <><button className="ghost" onClick={() => act({ action: 'scrape', id: l.id })}>Refresh</button>{l.last_error && <div className="err">{l.last_error}</div>}</> : 'manual'}</td>
              <td><button className="del" onClick={() => act({ action: 'delListing', id: l.id }, 'Delete listing?')}>×</button></td></tr>
          ))}
        </tbody></table></div>
      </div>
    </div>
  );
}
