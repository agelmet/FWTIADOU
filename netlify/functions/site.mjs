// Renders every page of the site from the published content (Netlify Blobs), so edits in the panel go live
// without a new deploy. Falls back to the content.json that ships with the repo.
import { getStore } from '@netlify/blobs';
import { render, matchRoute, sitemap } from '../../assets/js/render.mjs';
import base from '../../content.json' with { type: 'json' };

async function current() {
  try { const s = await getStore('mm-site').get('state', { type: 'json' }); if (s && s.t) return s; } catch (e) {}
  return base;
}
const H = { 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=31536000, stale-while-revalidate=60', 'Netlify-Cache-Tag': 'mm' };

export default async (req) => {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/media/')) {
    const key = decodeURIComponent(url.pathname.slice(7));
    const r = await getStore('mm-media').getWithMetadata(key, { type: 'arrayBuffer' });
    if (!r) return new Response('Not found', { status: 404 });
    return new Response(r.data, { headers: { 'Content-Type': (r.metadata && r.metadata.type) || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  }
  const state = await current();
  if (url.pathname === '/sitemap.xml') {
    const xml = sitemap(state, state.settings.domain || url.host);
    return new Response(xml, { headers: { ...H, 'Content-Type': 'application/xml; charset=utf-8' } });
  }
  const route = matchRoute(state, url.pathname);
  if (!route) {
    if (!url.pathname.endsWith('/') && matchRoute(state, url.pathname + '/')) return Response.redirect(url.origin + url.pathname + '/' + url.search, 301);
    const html = render(state, { page: 'home', lang: url.pathname.startsWith('/en') ? 'en' : 'el' }, { base: '/' });
    return new Response(html, { status: 404, headers: { ...H, 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return new Response(render(state, route, { base: '/' }), { headers: { ...H, 'Content-Type': 'text/html; charset=utf-8' } });
};
export const config = { path: ['/', '/en', '/en/*', '/synedries', '/synedries/*', '/blog', '/blog/*', '/aporrito', '/aporrito/*', '/sitemap.xml', '/media/*'] };
