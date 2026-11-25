// Panel API. The passcode lives ONLY in the Netlify environment variable ADMIN_PASS (never in the repo).
import { getStore } from '@netlify/blobs';
import { purgeCache } from '@netlify/functions';
import base from '../../content.json' with { type: 'json' };

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
function same(a, b) { a = String(a || ''); b = String(b || ''); let r = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return r === 0; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MEDIA = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav' };

export default async (req) => {
  const url = new URL(req.url);
  const act = url.pathname.replace(/^\/api\//, '');
  const PASS = process.env.ADMIN_PASS;
  if (!PASS) return J({ error: 'Ο πίνακας δεν έχει ενεργοποιηθεί ακόμα.' }, 503);
  if (!same(req.headers.get('x-pass'), PASS)) { await sleep(700); return J({ error: 'Λάθος κωδικός.' }, 401); }
  const site = getStore('mm-site');
  if (act === 'login') return J({ ok: true });
  if (act === 'state' && req.method === 'GET') {
    const s = await site.get('state', { type: 'json' });
    return J({ state: s && s.t ? s : base, published: !!s });
  }
  if (req.method !== 'POST') return J({ error: 'method' }, 405);
  if (act === 'publish') {
    const body = await req.text();
    if (body.length > 3_000_000) return J({ error: 'Πολύ μεγάλο περιεχόμενο.' }, 413);
    let st; try { st = JSON.parse(body); } catch (e) { return J({ error: 'bad json' }, 400); }
    if (!st || !st.t || !st.img || !Array.isArray(st.posts) || !st.settings) return J({ error: 'bad state' }, 400);
    const prev = await site.get('state', { type: 'text' });
    if (prev) { await site.set('prev', prev); await site.set('history/' + new Date().toISOString(), prev); }
    st.updated = new Date().toISOString();
    await site.setJSON('state', st);
    try { await purgeCache({ tags: ['mm'] }); } catch (e) {}
    return J({ ok: true, updated: st.updated });
  }
  if (act === 'undo') {
    const prev = await site.get('prev', { type: 'text' });
    if (!prev) return J({ error: 'Δεν υπάρχει προηγούμενη έκδοση.' }, 404);
    const cur = await site.get('state', { type: 'text' });
    await site.set('state', prev); if (cur) await site.set('prev', cur);
    try { await purgeCache({ tags: ['mm'] }); } catch (e) {}
    return J({ ok: true, state: JSON.parse(prev) });
  }
  if (act === 'upload') {
    const type = (req.headers.get('content-type') || '').split(';')[0].trim();
    const ext = MEDIA[type]; if (!ext) return J({ error: 'Μη αποδεκτός τύπος αρχείου.' }, 415);
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 5_500_000) return J({ error: 'Το αρχείο είναι πάνω από 5 MB.' }, 413);
    const name = (url.searchParams.get('name') || 'file').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'file';
    const key = `${Date.now().toString(36)}-${name}.${ext}`;
    await getStore('mm-media').set(key, buf, { metadata: { type } });
    return J({ ok: true, url: '/media/' + key });
  }
  return J({ error: 'unknown' }, 404);
};
export const config = { path: '/api/*' };
