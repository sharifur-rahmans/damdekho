import { scrapeAll } from '@/lib/scrape';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response('Unauthorized', { status: 401 });
  const r = await scrapeAll();
  return Response.json({ checked: r.length, failed: r.filter(x => !x.ok).length });
}
