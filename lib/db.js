import { neon } from '@neondatabase/serverless';
export const sql = (...a) => neon(process.env.DATABASE_URL)(...a);
export const slugify = s => s.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09ff]+/g, '-').replace(/^-|-$/g, '');
