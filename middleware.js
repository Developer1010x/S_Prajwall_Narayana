/**
 * Vercel Edge Middleware — server-side region routing.
 *
 * Runs at the edge before any static file is served, so the decision is made
 * on the server and cannot be skipped by disabling JavaScript. Read the
 * "Geo routing" section of README.md for what this does and does not
 * guarantee — it raises the floor, it is not a security boundary.
 *
 * Order of precedence:
 *   1. ?region=<cc>          explicit owner override, stored in a cookie
 *   2. pn_region cookie      previous override or on-page region switcher
 *   3. x-vercel-ip-country   geo-IP header injected by Vercel at the edge
 *   4. DEFAULT_REGION        everything else
 */

const REGIONS = ['uk', 'in', 'us', 'jp', 'de'];

/**
 * Visitors from countries with no page of their own land here. 'uk' is a
 * deliberate choice, not a leftover: the UK CV is the most conservative of
 * the five (British spelling, no photo, no personal data beyond contact
 * details) so it is the safest thing to show a stranger from anywhere.
 */
const DEFAULT_REGION = 'uk';

const COUNTRY_TO_REGION = {
  IN: 'in',
  GB: 'uk',
  US: 'us',
  JP: 'jp',
  DE: 'de',
};

const COOKIE_NAME = 'pn_region';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Search-engine crawlers are exempt from the geo redirect.
 *
 * Googlebot crawls almost entirely from US IP addresses. Without this
 * exemption it would be redirected to /us/ on every request and would never
 * see /uk/ — the one page that is actually meant to be indexed. The cost is
 * that anyone who sets a crawler user-agent string can read any region.
 * That is an accepted, deliberate hole: see README.md.
 */
const ALLOW_CRAWLERS = true;
const CRAWLER_UA =
  /(googlebot|google-inspectiontool|bingbot|duckduckbot|slurp|baiduspider|yandex(bot)?|applebot|linkedinbot|twitterbot|facebookexternalhit|slackbot|discordbot|telegrambot|whatsapp|petalbot|ahrefsbot|semrushbot|ia_archiver)/i;

export const config = {
  // Skip static assets and well-known files; everything else is routed.
  matcher: '/((?!assets/|_vercel|favicon\\.ico|favicon\\.svg|robots\\.txt|sitemap\\.xml).*)',
};

function regionFromPath(pathname) {
  const match = /^\/([a-z]{2})(?:\/|$)/i.exec(pathname);
  if (!match) return null;
  const cc = match[1].toLowerCase();
  return REGIONS.includes(cc) ? cc : null;
}

function regionFromCookie(request) {
  const header = request.headers.get('cookie') || '';
  const match = new RegExp('(?:^|;\\s*)' + COOKIE_NAME + '=([a-z]{2})', 'i').exec(header);
  if (!match) return null;
  const cc = match[1].toLowerCase();
  return REGIONS.includes(cc) ? cc : null;
}

function regionFromGeo(request) {
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  return COUNTRY_TO_REGION[country] || null;
}

function redirect(to, { setRegion } = {}) {
  const headers = new Headers({
    Location: to,
    // Geo/cookie dependent: never let a CDN cache one visitor's answer for another.
    'Cache-Control': 'private, no-store',
    Vary: 'Cookie',
  });
  if (setRegion) {
    headers.append(
      'Set-Cookie',
      `${COOKIE_NAME}=${setRegion}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`
    );
  }
  return new Response(null, { status: 307, headers });
}

export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Static files and anything with an extension are none of our business.
  if (pathname.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(pathname)) return;

  const requested = regionFromPath(pathname);

  // (a) Owner override. Redirects to the clean URL and remembers the choice,
  //     so a shared link like https://site/uk/?region=uk works from anywhere.
  const override = (url.searchParams.get('region') || '').toLowerCase();
  if (REGIONS.includes(override)) {
    return redirect(`/${override}/`, { setRegion: override });
  }

  if (ALLOW_CRAWLERS && CRAWLER_UA.test(request.headers.get('user-agent') || '')) return;

  const allowed = regionFromCookie(request) || regionFromGeo(request) || DEFAULT_REGION;

  // Root: send visitors to their own region. The root page itself is only
  // reached by crawlers (above) and by static/local copies with no edge.
  if (pathname === '/' || pathname === '') {
    return redirect(`/${allowed}/`);
  }

  // Wrong region: send them to theirs. Server-side, not a JS suggestion.
  if (requested && requested !== allowed) {
    return redirect(`/${allowed}/`);
  }

  return;
}
