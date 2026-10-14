# DamDekho – deploy guide

## 1. Push to GitHub
`git init && git add . && git commit -m "init"` then push to a new GitHub repo.

## 2. Create the project on Vercel
Vercel dashboard → Add New → Project → import the repo.

## 3. Add a database
Project → Storage → Marketplace → **Neon (Postgres)** → connect. This sets `DATABASE_URL` automatically.
Open the Neon SQL editor and run everything in `schema.sql` once.

## 4. Environment variables (Project → Settings → Environment Variables)
- `ADMIN_PASSWORD` – your admin login password
- `CRON_SECRET` – any long random string (protects the daily scraper)

Redeploy after adding them.

## 5. Use it
- `/admin` – log in, add categories, stores, products, then price listings.
- Listing with URL + CSS selector → price is collected automatically every day (and on "Collect all prices now").
- Listing without them → type the price by hand in the table.

## Finding the CSS selector
Open the product page in Chrome → right-click the price → Inspect → right-click the highlighted element →
Copy → Copy selector. Shorten it to something stable like `.product-price` if you can.

## Limits to know
- Many shops render prices with JavaScript or block bots. If a listing shows an error, use manual price, a shop's feed/API, or ask the shop for a data feed.
- Check each site's terms and robots.txt before scraping. Scrape politely (once a day is fine).
- Vercel Hobby cron runs once per day; a scrape run must finish within 60s (about 50–100 listings per run). For more, split into batches or move scraping to GitHub Actions.
- Admin login is a single shared password; fine for one owner, upgrade to real auth if you add staff.
