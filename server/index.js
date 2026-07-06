import http from 'http';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// ── Filesystem cache (survives server restarts) ───────────────────────────────
const CACHE_DIR = '/tmp/planora-cache';
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cacheKey(name) { return path.join(CACHE_DIR, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json'); }

function readCache(name, ttlMs) {
  try {
    const file = cacheKey(name);
    if (!fs.existsSync(file)) return null;
    const { ts, data } = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Date.now() - ts > ttlMs) return null;
    return data;
  } catch { return null; }
}

function writeCache(name, data) {
  try { fs.writeFileSync(cacheKey(name), JSON.stringify({ ts: Date.now(), data })); } catch {}
}

const PORT = process.env.PORT || 3001;
const YF_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const YF_HEADERS = {
  'User-Agent': YF_UA,
  'Accept': 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

// ── Yahoo Finance Cookie + Crumb Auth ────────────────────────────────────────
// Gets a crumb via fc.yahoo.com cookies → bypasses rate limiting
let yfCrumb = null;
let yfCookies = '';
let yfCrumbTime = 0;
let yfCrumbInflight = null; // mutex: prevents concurrent crumb fetches
const CRUMB_TTL = 30 * 60 * 1000; // 30 minutes

async function getYFCrumb() {
  if (yfCrumb && Date.now() - yfCrumbTime < CRUMB_TTL) return { crumb: yfCrumb, cookies: yfCookies };
  // If a crumb fetch is already in flight, wait for it instead of starting another
  if (yfCrumbInflight) return yfCrumbInflight;

  yfCrumbInflight = (async () => {
    try {
      const fcRes = await fetchWithTimeout('https://fc.yahoo.com', { headers: { 'User-Agent': YF_UA } }, 8000);
      const setCookies = fcRes.headers.getSetCookie?.() || [];
      yfCookies = setCookies.map(c => c.split(';')[0]).join('; ');

      for (const host of ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']) {
        const crumbRes = await fetchWithTimeout(`https://${host}/v1/test/getcrumb`, {
          headers: { ...YF_HEADERS, 'Cookie': yfCookies }
        }, 8000);
        const crumbText = await crumbRes.text();
        if (crumbRes.ok && crumbText && crumbText.length > 3 && !crumbText.includes('<') && crumbText !== 'Too Many Requests') {
          yfCrumb = crumbText.trim();
          yfCrumbTime = Date.now();
          log('[YF] crumb obtained from', host);
          return { crumb: yfCrumb, cookies: yfCookies };
        }
        log('[YF] crumb', host, crumbRes.status, crumbText.slice(0, 30));
      }
    } catch (e) {
      log('[YF] crumb fetch error:', e.message);
    } finally {
      yfCrumbInflight = null;
    }
    return { crumb: null, cookies: '' };
  })();

  return yfCrumbInflight;
}

// In-memory cache for fetchAnalystData
let analystCache = null;
let analystCacheTime = 0;
const ONE_HOUR = 60 * 60 * 1000;

// In-memory income statement cache (keyed by ticker, TTL 24hr)
const incomeCache = {};
const INCOME_TTL = 24 * 60 * 60 * 1000;

// Chart data cache (keyed by `ticker|interval|range`, TTL 10min)
const chartCache = {};
const CHART_TTL = 10 * 60 * 1000;

// In-memory cache for FRED series
const fredSeriesCache = {};

// ─── Dev-only logger (silent in production) ───────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const log = isDev ? console.log.bind(console) : () => {};

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const rateLimitMap = new Map();   // ip → { count, resetAt }
const aiLimitMap   = new Map();   // ip → { count, resetAt }

function getIP(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

function isRateLimited(ip, map, maxRequests, windowMs) {
  const now = Date.now();
  const entry = map.get(ip);
  if (!entry || now > entry.resetAt) {
    map.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= maxRequests) return true;
  entry.count++;
  return false;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap) if (now > v.resetAt) rateLimitMap.delete(k);
  for (const [k, v] of aiLimitMap)   if (now > v.resetAt) aiLimitMap.delete(k);
}, 5 * 60 * 1000);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function formatMarketCap(v) {
  if (!v) return 'N/A';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toFixed(2)}`;
}

function formatRevenue(v) {
  if (!v) return 'N/A';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toFixed(2)}`;
}

// Fetch with a 10-second timeout
function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

// Fetch Yahoo Finance chart data with filesystem cache (10min TTL) + query2 fallback
async function yfChart(ticker, interval, range) {
  const ck = `chart_${ticker}_${interval}_${range}`;
  const cached = readCache(ck, 15 * 60 * 1000);
  if (cached) return cached;

  async function tryFetch(host, crumb, cookies) {
    const crumbParam = crumb ? `&crumb=${encodeURIComponent(crumb)}` : '';
    const url = `https://${host}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}${crumbParam}`;
    const headers = { ...YF_HEADERS };
    if (cookies) headers['Cookie'] = cookies;
    const res = await fetchWithTimeout(url, { headers }, 12000);
    const text = await res.text();
    if (!res.ok) throw new Error(`Yahoo Finance error ${res.status} for ${ticker}`);
    const data = JSON.parse(text);
    const result = data.chart?.result?.[0];
    if (!result) throw new Error(`No data for ${ticker}`);
    return result;
  }

  // Try with crumb/cookie auth first (bypasses rate limiting)
  const { crumb, cookies } = await getYFCrumb();
  const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];
  let lastErr;
  for (const host of hosts) {
    try {
      const result = await tryFetch(host, crumb, cookies);
      writeCache(ck, result);
      return result;
    } catch (e) {
      lastErr = e;
      if (!e.message.includes('429') && !e.message.includes('401')) throw e;
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // If crumb failed, try refreshing it once and retry query2
  if (crumb) {
    yfCrumb = null; // force refresh
    const { crumb: crumb2, cookies: cookies2 } = await getYFCrumb();
    if (crumb2) {
      try {
        const result = await tryFetch('query2.finance.yahoo.com', crumb2, cookies2);
        writeCache(ck, result);
        return result;
      } catch {}
    }
  }

  throw lastErr || new Error(`No data for ${ticker}`);
}

// ─── Function Handlers ───────────────────────────────────────────────────────

// Yahoo Finance quoteSummary with filesystem cache (15min TTL)
async function yfQuoteSummary(ticker) {
  const ck = `qs_${ticker}`;
  const cached = readCache(ck, 15 * 60 * 1000);
  if (cached) return cached;

  const modules = [
    'incomeStatementHistory',
    'incomeStatementHistoryQuarterly',
    'financialData',
    'defaultKeyStatistics',
    'summaryDetail',
    'assetProfile',
    'quoteType',
    'price',
  ].join(',');

  const { crumb, cookies } = await getYFCrumb();
  for (const host of ['query2.finance.yahoo.com', 'query1.finance.yahoo.com']) {
    try {
      const crumbParam = crumb ? `&crumb=${encodeURIComponent(crumb)}` : '';
      const url = `https://${host}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}${crumbParam}`;
      const headers = { ...YF_HEADERS };
      if (cookies) headers['Cookie'] = cookies;
      const res = await fetchWithTimeout(url, { headers }, 12000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const result = json.quoteSummary?.result?.[0];
      if (result) { writeCache(ck, result); return result; }
    } catch (e) {
      log(`quoteSummary ${host} failed:`, e.message);
    }
  }
  throw new Error(`quoteSummary unavailable for ${ticker}`);
}

// Fetch Alpha Vantage income statement with 24-hour filesystem cache
async function avIncomeStatement(ticker, avKey) {
  const ck = `av_income_${ticker}`;
  const cached = readCache(ck, INCOME_TTL);
  if (cached) { log(`[income cache hit] ${ticker}`); return cached; }

  const r = await fetchWithTimeout(
    `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${avKey}`,
    {}, 10000
  );
  const inc = await r.json();
  if (!inc.annualReports && !inc.quarterlyReports) {
    log(`[AV income rate-limited or no data] ${ticker}:`, inc.Information ? 'rate-limited' : 'no data');
    return null;
  }
  writeCache(ck, inc);
  return inc;
}

// ── Tiingo enrichment: real-time quote + metadata + fundamentals ──────────────
async function tiingoEnrich(ticker, tiingoKey) {
  if (!tiingoKey || tiingoKey === 'your-tiingo-api-key-here') return null;
  const ck = `tiingo_meta_${ticker}`;
  const cached = readCache(ck, 15 * 60 * 1000); // 15-min cache
  if (cached) return cached;

  const headers = { 'Authorization': `Token ${tiingoKey}`, 'Content-Type': 'application/json' };

  const [iexRes, metaRes, fundRes] = await Promise.allSettled([
    fetchWithTimeout(`https://api.tiingo.com/iex/?tickers=${ticker}`, { headers }, 8000),
    fetchWithTimeout(`https://api.tiingo.com/tiingo/daily/${ticker.toLowerCase()}`, { headers }, 8000),
    fetchWithTimeout(`https://api.tiingo.com/tiingo/fundamentals/${ticker.toLowerCase()}/daily?token=${tiingoKey}`, { headers }, 8000),
  ]);

  let iex = null, meta = null, fund = null;
  if (iexRes.status === 'fulfilled' && iexRes.value.ok) {
    const j = await iexRes.value.json().catch(() => []);
    iex = Array.isArray(j) ? j[0] : null;
  }
  if (metaRes.status === 'fulfilled' && metaRes.value.ok) {
    meta = await metaRes.value.json().catch(() => null);
  }
  if (fundRes.status === 'fulfilled' && fundRes.value.ok) {
    const j = await fundRes.value.json().catch(() => []);
    fund = Array.isArray(j) ? j[0] : null;
  }

  if (!iex && !meta) return null;

  const result = {
    company_name: meta?.name || ticker,
    description: meta?.description || null,
    exchange: meta?.exchangeCode || null,
    sector: meta?.sector || null,
    current_price: iex?.tngoLast ?? iex?.last ?? null,
    prev_close: iex?.prevClose ?? null,
    open: iex?.open ?? null,
    high: iex?.high ?? null,
    low: iex?.low ?? null,
    volume: iex?.volume ?? null,
    pe_ratio: fund?.peRatio ?? null,
    market_cap: fund?.marketCap ?? null,
    price_to_book: fund?.pbRatio ?? null,
    peg_ratio: fund?.trailingPEG1Y ?? null,
  };

  writeCache(ck, result);
  return result;
}

// Safe numeric extractor for YF raw values
function yfN(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k]?.raw ?? obj?.[k];
    if (v != null && v !== '' && !isNaN(v)) return Number(v);
  }
  return null;
}

// ── Polygon (Massive) REST API helpers ────────────────────────────────────────
const POLYGON_BASE = 'https://api.polygon.io';

// Polygon OHLCV aggregates — returns [{t(ms), o, h, l, c, v}, ...]
async function polyAggs(ticker, from, to, timespan = 'day', multiplier = 1) {
  const polyKey = process.env.POLYGON_API_KEY;
  if (!polyKey) throw new Error('POLYGON_API_KEY not set');
  const ck = `poly_${ticker}_${multiplier}${timespan}_${from}_${to}`;
  const ttl = timespan === 'day' ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000;
  const cached = readCache(ck, ttl);
  if (cached) return cached;
  const url = `${POLYGON_BASE}/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apiKey=${polyKey}`;
  const res = await fetchWithTimeout(url, {}, 15000);
  if (!res.ok) throw new Error(`Polygon ${res.status} for ${ticker}`);
  const json = await res.json();
  if (!json.results?.length) throw new Error(`No Polygon data for ${ticker}`);
  writeCache(ck, json.results);
  return json.results;
}

// Polygon stock snapshot — returns { TICKER: snapObj, ... }
async function polySnapshot(tickers) {
  const polyKey = process.env.POLYGON_API_KEY;
  if (!polyKey) return {};
  const syms = (Array.isArray(tickers) ? tickers : [tickers]).join(',');
  const ck = `poly_snap_${syms}`;
  const cached = readCache(ck, 5 * 60 * 1000);
  if (cached) return cached;
  const url = `${POLYGON_BASE}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${encodeURIComponent(syms)}&apiKey=${polyKey}`;
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) return {};
  const json = await res.json();
  const out = {};
  for (const t of (json.tickers || [])) out[t.ticker] = t;
  writeCache(ck, out);
  return out;
}

// Polygon v3 snapshot for indices (I:SPX, I:DJI, I:COMP, I:VIX, etc.)
async function polyIndexSnapshot(indexTickers) {
  const polyKey = process.env.POLYGON_API_KEY;
  if (!polyKey) return {};
  const syms = (Array.isArray(indexTickers) ? indexTickers : [indexTickers]).join(',');
  const ck = `poly_idx_${syms.replace(/[^a-zA-Z0-9,]/g, '_')}`;
  const cached = readCache(ck, 5 * 60 * 1000);
  if (cached) return cached;
  const url = `${POLYGON_BASE}/v3/snapshot?ticker.any_of=${encodeURIComponent(syms)}&apiKey=${polyKey}`;
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) return {};
  const json = await res.json();
  const out = {};
  for (const t of (json.results || [])) out[t.ticker] = t;
  writeCache(ck, out);
  return out;
}

// Polygon ticker details — name, description, sector, market_cap, etc.
async function polyTickerDetails(ticker) {
  const polyKey = process.env.POLYGON_API_KEY;
  if (!polyKey) return null;
  const ck = `poly_ref_${ticker}`;
  const cached = readCache(ck, 24 * 60 * 60 * 1000);
  if (cached) return cached;
  const url = `${POLYGON_BASE}/v3/reference/tickers/${encodeURIComponent(ticker)}?apiKey=${polyKey}`;
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.results) return null;
  writeCache(ck, json.results);
  return json.results;
}

// Polygon top gainers & losers
async function polyMovers() {
  const polyKey = process.env.POLYGON_API_KEY;
  if (!polyKey) return null;
  const ck = 'poly_movers';
  const cached = readCache(ck, 5 * 60 * 1000);
  if (cached) return cached;
  const [gr, lr] = await Promise.all([
    fetchWithTimeout(`${POLYGON_BASE}/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${polyKey}`, {}, 10000),
    fetchWithTimeout(`${POLYGON_BASE}/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${polyKey}`, {}, 10000),
  ]);
  function mapP(ts) {
    return (ts || []).slice(0, 15).map(t => ({
      ticker: t.ticker, name: t.ticker, company_name: t.ticker,
      current_price: parseFloat((t.day?.c ?? t.lastTrade?.p ?? 0).toFixed(2)),
      change_percent: parseFloat((t.todaysChangePerc ?? 0).toFixed(2)),
      change: parseFloat((t.todaysChange ?? 0).toFixed(2)),
      volume: t.day?.v ?? 0,
    }));
  }
  const out = { gainers: [], losers: [], mostActive: [] };
  if (gr.ok) { const j = await gr.json(); out.gainers = mapP(j.tickers); }
  if (lr.ok) { const j = await lr.json(); out.losers = mapP(j.tickers); }
  writeCache(ck, out);
  return out;
}

// Alpha Vantage daily price history (fallback when Polygon is unavailable)
async function avDailyHistory(ticker, avKey) {
  const ck = `av_daily_${ticker}`;
  const cached = readCache(ck, INCOME_TTL); // 24hr cache — AV daily history doesn't change
  if (cached) return cached;

  // compact = last 100 trading days (enough for 1D/5D/1M/3M charts; 1Y+ shows partial)
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${avKey}`;
  const r = await fetchWithTimeout(url, {}, 15000);
  const json = await r.json();
  const series = json['Time Series (Daily)'];
  if (!series) { log('AV daily no series, keys:', Object.keys(json), JSON.stringify(json).slice(0, 200)); return null; }

  const history = Object.entries(series)
    .map(([date, v]) => ({ date, price: parseFloat(v['4. close']) }))
    .filter(d => d.price)
    .sort((a, b) => a.date.localeCompare(b.date));

  writeCache(ck, history);
  return history;
}

async function getStockData(params) {
  const { ticker } = params;
  if (!ticker) return { error: 'Ticker is required' };

  const avKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;
  const tiingoKey = process.env.VITE_TIINGO_API_KEY;

  let priceHistoryDaily = [], priceHistoryIntraday = [];
  let currentPrice = null, prevClose = null;
  let polyName = null, polyDesc = null, polySector = null;
  let polyWebsite = null, polyEmployees = null, polyMarketCap = null, polyExchange = null, polyCountry = null;

  const today = new Date().toISOString().split('T')[0];
  const from5y = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from10d = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // ── 1. Polygon primary: price history + snapshot + details ──────────────────
  try {
    const [dailyBars, snap, details] = await Promise.all([
      polyAggs(ticker, from5y, today, 'day', 1),
      polySnapshot([ticker]),
      polyTickerDetails(ticker).catch(() => null),
    ]);

    if (dailyBars?.length) {
      priceHistoryDaily = dailyBars.map(b => ({
        date: new Date(b.t).toISOString().split('T')[0],
        price: parseFloat(b.c.toFixed(4)),
      }));
      const lastBar = dailyBars[dailyBars.length - 1];
      const prevBar = dailyBars[dailyBars.length - 2];
      currentPrice = lastBar.c;
      prevClose = prevBar?.c ?? lastBar.c;
      log(`[Polygon] ${ticker} daily — ${dailyBars.length} bars`);
    }

    const snapData = snap[ticker.toUpperCase()];
    if (snapData) {
      const snapPrice = snapData.day?.c ?? snapData.lastTrade?.p;
      const snapPrev = snapData.prevDay?.c;
      if (snapPrice) currentPrice = snapPrice;
      if (snapPrev) prevClose = snapPrev;
    }

    if (details) {
      polyName = details.name;
      polyDesc = details.description;
      polySector = details.sic_description;
      polyWebsite = details.homepage_url;
      polyEmployees = details.total_employees;
      polyMarketCap = details.market_cap;
      polyExchange = details.primary_exchange;
      polyCountry = details.locale?.toUpperCase() === 'US' ? 'United States' : details.locale;
    }
  } catch (e) {
    log(`[Polygon] getStockData error for ${ticker}:`, e.message);
  }

  // Polygon 15-min intraday (best-effort)
  try {
    const intradayBars = await polyAggs(ticker, from10d, today, 'minute', 15);
    if (intradayBars?.length) {
      priceHistoryIntraday = intradayBars.map(b => ({
        date: new Date(b.t).toISOString(),
        price: parseFloat(b.c.toFixed(4)),
      }));
    }
  } catch {}

  // ── 2. Tiingo fallback (if Polygon failed) ─────────────────────────────────
  if (!priceHistoryDaily.length && tiingoKey) {
    try {
      const endDate = today;
      const startDate = from5y;
      const tiingoCk = `tiingo_${ticker}`;
      let tiingoHistory = readCache(tiingoCk, INCOME_TTL);
      if (!tiingoHistory) {
        const r = await fetchWithTimeout(
          `https://api.tiingo.com/tiingo/daily/${ticker.toLowerCase()}/prices?startDate=${startDate}&endDate=${endDate}&token=${tiingoKey}`,
          { headers: { 'Content-Type': 'application/json' } }, 12000
        );
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j) && j.length > 0) {
            tiingoHistory = j.map(d => ({ date: d.date.split('T')[0], price: d.adjClose ?? d.close })).filter(d => d.price != null);
            writeCache(tiingoCk, tiingoHistory);
          }
        }
      }
      if (tiingoHistory?.length) {
        priceHistoryDaily = tiingoHistory;
        const last = tiingoHistory[tiingoHistory.length - 1];
        const prev = tiingoHistory[tiingoHistory.length - 2];
        currentPrice = currentPrice ?? last?.price;
        prevClose = prevClose ?? prev?.price ?? null;
        log(`[Tiingo] ${ticker} OK — ${tiingoHistory.length} pts`);
      }
    } catch (e) { log('[Tiingo] error:', e.message); }
  }

  // ── 3. AV daily fallback ───────────────────────────────────────────────────
  if (!priceHistoryDaily.length && avKey) {
    const avHistory = await avDailyHistory(ticker, avKey).catch(e => { log('AV history error:', e.message); return null; });
    if (avHistory) {
      priceHistoryDaily = avHistory;
      const last = priceHistoryDaily[priceHistoryDaily.length - 1];
      const prev = priceHistoryDaily[priceHistoryDaily.length - 2];
      currentPrice = currentPrice ?? last?.price;
      prevClose = prevClose ?? prev?.price ?? null;
    }
  }

  if (!priceHistoryDaily.length) return { error: `Unable to fetch data for ${ticker}. Please try again in a moment.` };

  const priceHistory = priceHistoryDaily;

  // ── 4. Tiingo enrichment for real-time quote + metadata ───────────────────
  const tiingoData = tiingoKey ? await tiingoEnrich(ticker, tiingoKey).catch(() => null) : null;
  if (tiingoData?.current_price) currentPrice = currentPrice ?? tiingoData.current_price;
  if (tiingoData?.prev_close) prevClose = prevClose ?? tiingoData.prev_close;

  // ── 5. AV OVERVIEW + income statement for fundamentals ────────────────────
  let revenueAnnual = [], revenueQuarterly = [];
  let overview = {};

  if (avKey) {
    try {
      const ovCk = `av_overview_${ticker}`;
      let j = readCache(ovCk, INCOME_TTL);
      if (!j) {
        const r = await fetchWithTimeout(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${avKey}`,
          {}, 8000
        );
        j = await r.json();
        if (j && !j.Information && j.Symbol) writeCache(ovCk, j);
      }
      if (j && !j.Information && j.Symbol) overview = j;
    } catch (e) { log('AV overview error:', e.message); }

    try {
      const inc = await avIncomeStatement(ticker, avKey);
      if (inc?.annualReports) {
        revenueAnnual = inc.annualReports.slice(0, 5).map(rep => {
          const year = parseInt(rep.fiscalDateEnding?.split('-')[0]);
          return { displayDate: year.toString(), year, revenue: parseInt(rep.totalRevenue) || 0, earnings: parseInt(rep.netIncome) || 0, eps: rep.reportedEPS && rep.reportedEPS !== 'None' ? parseFloat(rep.reportedEPS) : null };
        }).filter(r => r.year).sort((a, b) => a.year - b.year);
      }
      if (inc?.quarterlyReports) {
        revenueQuarterly = inc.quarterlyReports.slice(0, 8).map(rep => {
          const date = new Date(rep.fiscalDateEnding);
          const year = date.getFullYear();
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          return { displayDate: `Q${quarter}'${String(year).slice(2)}`, year, quarter, revenue: parseInt(rep.totalRevenue) || 0, earnings: parseInt(rep.netIncome) || 0, eps: rep.reportedEPS && rep.reportedEPS !== 'None' ? parseFloat(rep.reportedEPS) : null };
        }).filter(r => r.year).sort((a, b) => a.year !== b.year ? a.year - b.year : a.quarter - b.quarter);
      }
    } catch (e) { log('AV income error:', e.message); }
  }

  const avF = (key) => { const v = overview[key]; return (v && v !== 'None' && v !== 'N/A' && v !== '-') ? parseFloat(v) : null; };
  const avPct = (key) => { const v = avF(key); return v != null ? v * 100 : null; };

  // ── Prices & change ──
  const priceChange = (currentPrice != null && prevClose != null) ? parseFloat((currentPrice - prevClose).toFixed(4)) : null;
  const priceChangePct = (currentPrice != null && prevClose != null && prevClose !== 0)
    ? parseFloat(((currentPrice - prevClose) / prevClose * 100).toFixed(4)) : null;

  // ── Fundamentals from AV ──
  const trailingPE = avF('TrailingPE') ?? avF('PERatio') ?? tiingoData?.pe_ratio ?? null;
  const forwardPE = avF('ForwardPE');
  const pegRatio = avF('PEGRatio') ?? tiingoData?.peg_ratio ?? null;
  const priceToSales = avF('PriceToSalesRatioTTM');
  const priceToBook = avF('PriceToBookRatio') ?? tiingoData?.price_to_book ?? null;
  const evToEbitda = avF('EVToEBITDA');
  const beta = avF('Beta');
  const eps = avF('EPS');
  const grossMargin = avPct('GrossProfitTTM');
  const operatingMargin = avPct('OperatingMarginTTM');
  const profitMargin = avPct('ProfitMargin');
  const roe = avPct('ReturnOnEquityTTM');
  const debtToEquity = avF('DebtToEquityRatio');
  const dividendYield = overview.DividendYield && overview.DividendYield !== 'None' ? parseFloat(overview.DividendYield) * 100 : null;
  const analystTarget = avF('AnalystTargetPrice');
  const revenueTTM = overview.RevenueTTM ? parseInt(overview.RevenueTTM) : null;
  const netIncomeMostRecent = revenueAnnual.length > 0 ? revenueAnnual[revenueAnnual.length - 1].earnings : null;
  const finalMarketCap = polyMarketCap ?? (overview.MarketCapitalization ? parseInt(overview.MarketCapitalization) : null) ?? tiingoData?.market_cap ?? null;

  // 52w high/low from last 252 daily bars
  const oneYearBars = priceHistoryDaily.slice(-252);
  const high52 = oneYearBars.length ? Math.max(...oneYearBars.map(b => b.price)) : null;
  const low52 = oneYearBars.length ? Math.min(...oneYearBars.map(b => b.price)) : null;

  const quoteType = overview.AssetType && overview.AssetType !== 'None' ? overview.AssetType : 'EQUITY';
  const finalSector = (overview.Sector && overview.Sector !== 'None') ? overview.Sector : (polySector || tiingoData?.sector || 'N/A');
  const finalIndustry = (overview.Industry && overview.Industry !== 'None') ? overview.Industry : 'N/A';
  const finalName = polyName || overview.Name || tiingoData?.company_name || ticker.toUpperCase();
  const finalDesc = polyDesc || overview.Description || tiingoData?.description || null;

  return {
    company_name: finalName,
    ticker: ticker.toUpperCase(),
    quote_type: quoteType,
    sector: finalSector,
    industry: finalIndustry,
    description: finalDesc,
    fund_family: null,
    fund_category: null,
    current_price: currentPrice,
    nav: null,
    price_change: priceChange,
    price_change_pct: priceChangePct,
    pe_ratio: trailingPE,
    forward_pe: forwardPE,
    peg_ratio: pegRatio,
    price_to_sales: priceToSales,
    price_to_book: priceToBook,
    ev_to_ebitda: evToEbitda,
    return_on_equity: roe,
    profit_margin: profitMargin,
    gross_margin: grossMargin,
    operating_margin: operatingMargin,
    debt_to_equity: debtToEquity,
    net_income: netIncomeMostRecent,
    free_cash_flow: null,
    market_cap: finalMarketCap,
    revenue: revenueTTM,
    dividend_yield: dividendYield,
    expense_ratio: null,
    ytd_return: null,
    eps,
    beta,
    one_year_target: analystTarget,
    fifty_two_week_high: high52,
    fifty_two_week_low: low52,
    avg_volume: null,
    price_history: priceHistory,
    price_history_daily: priceHistoryDaily,
    price_history_intraday: priceHistoryIntraday,
    revenue_annual: revenueAnnual,
    revenue_quarterly: revenueQuarterly,
    website: polyWebsite || overview.OfficialSite || null,
    employees: polyEmployees || (overview.FullTimeEmployees ? parseInt(overview.FullTimeEmployees) : null),
    exchange: polyExchange || overview.Exchange || tiingoData?.exchange || null,
    country: polyCountry || overview.Country || null,
  };
}

async function getMarketHistory(params) {
  const { startDate, endDate, index = '^GSPC' } = params;
  if (!startDate || !endDate) return { error: 'startDate and endDate are required' };

  const INDEX_POLY_MAP = {
    '^GSPC': 'I:SPX', '^DJI': 'I:DJI', '^IXIC': 'I:COMP', '^RUT': 'I:RUT2000', '^VIX': 'I:VIX',
  };
  const polyTicker = INDEX_POLY_MAP[index] || index;

  const bars = await polyAggs(polyTicker, startDate, endDate, 'week', 1);
  const data = bars.map(b => ({
    date: new Date(b.t).toISOString().split('T')[0],
    value: parseFloat(b.c.toFixed(2)),
    high: parseFloat((b.h ?? b.c).toFixed(2)),
    low: parseFloat((b.l ?? b.c).toFixed(2)),
    open: parseFloat((b.o ?? b.c).toFixed(2)),
    volume: b.v || 0,
  })).filter(d => d.value > 0);

  if (data.length === 0) throw new Error('No valid data for the specified date range');

  const startValue = data[0].value, endValue = data[data.length - 1].value;
  const change = startValue && endValue ? ((endValue - startValue) / startValue * 100).toFixed(2) : null;
  const indexNames = { '^GSPC': 'S&P 500', '^DJI': 'Dow Jones Industrial Average', '^IXIC': 'NASDAQ Composite', '^RUT': 'Russell 2000', '^VIX': 'CBOE Volatility Index' };

  return { data, startValue, endValue, minValue: Math.min(...data.map(d => d.low)), maxValue: Math.max(...data.map(d => d.high)), change, indexName: indexNames[index] || index };
}

async function getSectorPerformance(params) {
  const { startDate, endDate } = params;
  if (!startDate || !endDate) return { error: 'startDate and endDate are required' };

  const SECTOR_ETFS = {
    Technology: 'XLK', Healthcare: 'XLV', Financial: 'XLF', Energy: 'XLE',
    'Consumer Discretionary': 'XLY', 'Consumer Staples': 'XLP', Industrials: 'XLI',
    'Real Estate': 'XLRE', Utilities: 'XLU', Materials: 'XLB', Communication: 'XLC',
  };

  const results = await Promise.all(
    Object.entries(SECTOR_ETFS).map(async ([name, ticker]) => {
      try {
        const bars = await polyAggs(ticker, startDate, endDate, 'week', 1);
        if (bars.length < 2) return { name, return: 'N/A', error: true };
        const startPrice = bars[0].c, endPrice = bars[bars.length - 1].c;
        const returnPct = ((endPrice - startPrice) / startPrice * 100).toFixed(2);
        return { name, return: `${returnPct >= 0 ? '+' : ''}${returnPct}%`, returnValue: parseFloat(returnPct), startPrice: startPrice.toFixed(2), endPrice: endPrice.toFixed(2), ticker };
      } catch { return { name, return: 'N/A', error: true }; }
    })
  );

  return { sectors: results.filter(s => !s.error).sort((a, b) => b.returnValue - a.returnValue), period: `${startDate} to ${endDate}` };
}

async function getTopPerformers(params) {
  // Use AV TOP_GAINERS_LOSERS data (already fetched & cached by handleMarketMovers)
  // This avoids 60 parallel YF chart requests that trigger rate limiting
  const avKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;

  // Try cached movers (up to 6 hours fresh)
  let moversData = readCache('market_movers', 6 * ONE_HOUR);

  // If not cached or stale, fetch fresh from AV
  if (!moversData && avKey) {
    try {
      const r = await fetchWithTimeout(
        `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${avKey}`,
        {}, 12000
      );
      const json = await r.json();
      if (json.top_gainers) {
        function mapAV(list) {
          return (list || []).map(q => ({
            ticker: q.ticker,
            name: q.ticker,
            company_name: q.ticker,
            current_price: parseFloat(q.price ?? 0),
            change_percent: parseFloat((q.change_percentage || '0').replace('%', '')),
            change: parseFloat(q.change_amount ?? 0),
            volume: parseInt((q.volume || '0').replace(/,/g, '')),
            fifty_two_week_high: null,
            fifty_two_week_low: null,
            market_cap: null,
          }));
        }
        moversData = {
          gainers: mapAV(json.top_gainers),
          losers: mapAV(json.top_losers),
          mostActive: mapAV(json.most_actively_traded),
        };
        writeCache('market_movers', moversData);
      }
    } catch (e) { log('[getTopPerformers] AV error:', e.message); }
  }

  if (!moversData) return { gainers: [], losers: [], mostActive: [], totalAnalyzed: 0 };

  return {
    gainers: moversData.gainers || [],
    losers: moversData.losers || [],
    mostActive: moversData.mostActive || [],
    totalAnalyzed: (moversData.gainers?.length || 0) + (moversData.losers?.length || 0),
  };
}

async function getStockPerformanceForPeriod(params) {
  const { ticker, startDate, endDate } = params;
  if (!ticker || !startDate || !endDate) return { error: 'ticker, startDate, and endDate are required' };

  const bars = await polyAggs(ticker, startDate, endDate, 'day', 1);
  const closes = bars.map(b => b.c).filter(c => c != null);
  const highs = bars.map(b => b.h).filter(h => h != null);
  const lows = bars.map(b => b.l).filter(l => l != null);
  if (closes.length === 0) return { error: `No data available for ${ticker} during this period` };

  const startPrice = closes[0], endPrice = closes[closes.length - 1];
  const returnPct = ((endPrice - startPrice) / startPrice * 100).toFixed(2);

  return {
    ticker: ticker.toUpperCase(),
    companyName: ticker.toUpperCase(),
    startPrice: startPrice.toFixed(2),
    endPrice: endPrice.toFixed(2),
    return: `${returnPct >= 0 ? '+' : ''}${returnPct}%`,
    returnValue: parseFloat(returnPct),
    highPrice: highs.length ? Math.max(...highs).toFixed(2) : 'N/A',
    lowPrice: lows.length ? Math.min(...lows).toFixed(2) : 'N/A',
    startDate,
    endDate,
  };
}

async function fetchAnalystData(params) {
  const { forceRefresh = false } = params;
  const now = Date.now();

  if (!forceRefresh && analystCache && (now - analystCacheTime) < ONE_HOUR) {
    return { ...analystCache, cached: true };
  }

  const fredKey = process.env.VITE_FRED_API_KEY;
  const eiaKey = process.env.VITE_EIA_API_KEY;

  if (!fredKey || !eiaKey) {
    return { error: 'Missing API keys. Set VITE_FRED_API_KEY and VITE_EIA_API_KEY in .env' };
  }

  const fredSeries = [
    'GFDEBTN','MTSDS133FMS','WALCL','FEDFUNDS','DGS10','DGS2','T10Y2Y','M2SL',
    'CPIAUCSL','CPILFESL','PCE','PPIACO','UNRATE','PAYEMS','JTSJOL','CES0500000003',
    'CIVPART','MORTGAGE30US','MORTGAGE15US','CSUSHPINSA','HOUST','PERMIT','EXHOSLUSM495S',
    'RSAFS','REVOLSL','PSAVERT','UMCSENT','SLOAS','TERMCBCCALLNS','A191RL1Q225SBEA',
    'INDPRO','BOPGSTB','DTWEXBGS','BAMLH0A0HYM2',
  ];

  const fredResults = await Promise.allSettled(
    fredSeries.map(async series => {
      try {
        const limit = series === 'CPIAUCSL' ? 13 : 2;
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${fredKey}&sort_order=desc&limit=${limit}&file_type=json`;
        const res = await fetchWithTimeout(url);
        const data = await res.json();
        if (data.error_message || !data.observations?.length) return { series, data: null };
        const current = parseFloat(data.observations[0].value);
        if (isNaN(current) || data.observations[0].value === '.') return { series, data: null };
        let previous, change, changePct;
        if (series === 'CPIAUCSL' && data.observations.length >= 13) {
          const yearAgo = parseFloat(data.observations[12].value);
          change = current - yearAgo;
          changePct = yearAgo !== 0 ? (change / yearAgo * 100) : 0;
          previous = yearAgo;
        } else {
          previous = data.observations.length > 1 ? parseFloat(data.observations[1].value) : current;
          change = current - previous;
          changePct = previous !== 0 ? (change / previous * 100) : 0;
        }
        return { series, data: { value: current, previous, date: data.observations[0].date, change: parseFloat(change.toFixed(4)), changePct: parseFloat(changePct.toFixed(2)) } };
      } catch (e) { return { series, data: null }; }
    })
  );

  // ── Polygon: indices and crypto (replaces Yahoo Finance) ──────────────────
  const POLY_INDEX_TICKERS = ['I:SPX', 'I:DJI', 'I:COMP', 'I:VIX'];
  const POLY_CRYPTO_TICKERS = ['X:BTCUSD', 'X:ETHUSD'];
  const YF_ALIAS = { 'I:SPX': '^GSPC', 'I:DJI': '^DJI', 'I:COMP': '^IXIC', 'I:VIX': '^VIX', 'X:BTCUSD': 'BTC-USD', 'X:ETHUSD': 'ETH-USD' };

  async function polyQuoteForAnalyst(polyTicker) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const from7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const bars = await polyAggs(polyTicker, from7d, today, 'day', 1);
      if (!bars?.length) return null;
      const current = bars[bars.length - 1].c;
      const previous = bars.length > 1 ? bars[bars.length - 2].c : current;
      const change = current - previous;
      const changePct = previous !== 0 ? (change / previous * 100) : 0;
      return { value: parseFloat(current.toFixed(4)), previous: parseFloat(previous.toFixed(4)), date: new Date(bars[bars.length - 1].t).toISOString().split('T')[0], change: parseFloat(change.toFixed(4)), changePct: parseFloat(changePct.toFixed(2)) };
    } catch { return null; }
  }

  const yahooResults = [];
  const polyTickers = [...POLY_INDEX_TICKERS, ...POLY_CRYPTO_TICKERS];
  for (const pt of polyTickers) {
    const data = await polyQuoteForAnalyst(pt).catch(() => null);
    yahooResults.push({ status: 'fulfilled', value: { ticker: YF_ALIAS[pt], data } });
  }

  // Commodity prices from EIA (oil) and FRED (gold via GOLDAMGBD228NLBM) — best-effort
  const commodityPairs = [
    { yf: 'CL=F', fredId: 'DCOILWTICO' },
    { yf: 'GC=F', fredId: 'GOLDAMGBD228NLBM' },
    { yf: 'NG=F', fredId: 'DHHNGSP' },
  ];
  const fredKeyA = process.env.VITE_FRED_API_KEY;
  for (const { yf, fredId } of commodityPairs) {
    try {
      if (!fredKeyA) { yahooResults.push({ status: 'fulfilled', value: { ticker: yf, data: null } }); continue; }
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${fredId}&api_key=${fredKeyA}&sort_order=desc&limit=5&file_type=json`;
      const r = await fetchWithTimeout(url, {}, 8000);
      const j = await r.json();
      const obs = (j.observations || []).filter(o => o.value !== '.');
      if (!obs.length) { yahooResults.push({ status: 'fulfilled', value: { ticker: yf, data: null } }); continue; }
      const current = parseFloat(obs[0].value);
      const previous = obs.length > 1 ? parseFloat(obs[1].value) : current;
      const change = current - previous;
      const changePct = previous !== 0 ? (change / previous * 100) : 0;
      yahooResults.push({ status: 'fulfilled', value: { ticker: yf, data: { value: parseFloat(current.toFixed(4)), previous: parseFloat(previous.toFixed(4)), date: obs[0].date, change: parseFloat(change.toFixed(4)), changePct: parseFloat(changePct.toFixed(2)) } } });
    } catch { yahooResults.push({ status: 'fulfilled', value: { ticker: yf, data: null } }); }
  }

  const eiaSeries = [
    { id: 'PET.EMM_EPMR_PTE_NUS_DPG.W', key: 'gasoline' },
    { id: 'PET.EMM_EPPP_PTE_NUS_DPG.W', key: 'premium_gas' },
    { id: 'PET.EMM_EPD2D_PTE_NUS_DPG.W', key: 'diesel' },
    { id: 'PET.W_EPD2F_PRS_NUS_DPG.W', key: 'heating_oil' },
  ];
  const eiaResults = await Promise.allSettled(
    eiaSeries.map(async ({ id, key }) => {
      const res = await fetchWithTimeout(`https://api.eia.gov/v2/seriesid/${id}?api_key=${eiaKey}&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=2`);
      const data = await res.json();
      if (!data.response?.data?.length) return { key, data: null };
      const current = parseFloat(data.response.data[0].value);
      const previous = data.response.data.length > 1 ? parseFloat(data.response.data[1].value) : current;
      const change = current - previous;
      const changePct = previous !== 0 ? (change / previous * 100) : 0;
      return { key, data: { value: current, previous, date: data.response.data[0].period, change: parseFloat(change.toFixed(4)), changePct: parseFloat(changePct.toFixed(2)) } };
    })
  );

  const fred = {}, yahoo = {}, eia = {};
  fredResults.forEach(r => { if (r.status === 'fulfilled' && r.value) fred[r.value.series] = r.value.data; });
  yahooResults.forEach(r => { if (r.status === 'fulfilled' && r.value) yahoo[r.value.ticker] = r.value.data; });
  eiaResults.forEach(r => { if (r.status === 'fulfilled' && r.value) eia[r.value.key] = r.value.data; });

  const unemploymentRate = fred.UNRATE?.value || 0;
  const cpiYoY = fred.CPIAUCSL?.value || 0;
  const miseryValue = unemploymentRate + cpiYoY;
  let level = 'low', label = 'Low — Strong economy';
  if (miseryValue >= 15) { level = 'severe'; label = 'Severe — Economic crisis'; }
  else if (miseryValue >= 10) { level = 'high'; label = 'High — Significant strain'; }
  else if (miseryValue >= 6) { level = 'moderate'; label = 'Moderate — Some economic strain'; }

  const responseData = { fred, yahoo, eia, miseryIndex: { value: parseFloat(miseryValue.toFixed(2)), label, level }, cached: false, last_updated: new Date().toISOString() };
  analystCache = responseData;
  analystCacheTime = Date.now();
  return responseData;
}

async function generateAdvisorReport(params) {
  const { advisorId, reportContent, language = 'en' } = params;

  const BRAND_CONFIGS = {
    1: { primary: [0, 0.2, 0.4], accent: [0.66, 0.53, 0.17], firm: 'GOLDMAN SACHS PRIVATE WEALTH', title: 'COMPREHENSIVE WEALTH DIAGNOSTIC' },
    2: { primary: [0.55, 0, 0], accent: [0.17, 0.17, 0.17], firm: 'VANGUARD', title: 'RETIREMENT BLUEPRINT' },
    3: { primary: [0, 0.19, 0.53], accent: [0.78, 0.66, 0.32], firm: 'MORGAN STANLEY WEALTH MANAGEMENT', title: 'INVESTMENT POLICY STATEMENT' },
    4: { primary: [0, 0.39, 0], accent: [0.1, 0.1, 0.1], firm: 'DELOITTE TAX ADVISORY', title: 'TAX OPTIMIZATION MEMORANDUM' },
    5: { primary: [0, 0.19, 0.53], accent: [0.72, 0.53, 0.04], firm: 'JPMORGAN PRIVATE BANK', title: 'DEBT ELIMINATION ROADMAP' },
    6: { primary: [0, 0.29, 0.55], accent: [0.42, 0.62, 0.85], firm: 'CHARLES SCHWAB', title: 'CASH MANAGEMENT STRATEGY' },
    7: { primary: [0, 0.17, 0.36], accent: [0.4, 0.6, 0.8], firm: 'NORTHWESTERN MUTUAL', title: 'INSURANCE REVIEW' },
    8: { primary: [0, 0.4, 0.2], accent: [0, 0.27, 0.13], firm: 'FIDELITY INVESTMENTS', title: 'EDUCATION SAVINGS STRATEGY' },
    9: { primary: [0, 0.19, 0.53], accent: [0, 0.34, 0.55], firm: 'EDWARD JONES', title: 'ESTATE PLANNING GUIDE' },
    10: { primary: [0.24, 0.61, 0.91], accent: [0.17, 0.17, 0.17], firm: 'WEALTHFRONT', title: 'REAL ESTATE ANALYSIS' },
    11: { primary: [0, 0.4, 0.8], accent: [1, 0.4, 0], firm: 'RAMSEY SOLUTIONS', title: 'BUDGET PLAN' },
    12: { primary: [0, 0, 0], accent: [0.8, 0, 0], firm: 'BLACKROCK', title: 'LIFETIME FINANCIAL ROADMAP' },
  };

  const brand = BRAND_CONFIGS[advisorId];
  if (!brand) return { error: 'Invalid advisor ID' };

  const DISCLAIMER_EN = 'This report is for informational purposes only and does not constitute investment, tax, legal, or insurance advice.';
  const DISCLAIMER_ES = 'Este informe es solo para fines informativos y no constituye asesoramiento de inversión, fiscal, legal ni de seguros.';
  const disclaimer = language === 'es' ? DISCLAIMER_ES : DISCLAIMER_EN;

  const cleanText = t => t.replace(/[^\x00-\x7F]/g, '').replace(/\*\*/g, '');
  function wrapText(text, maxWidth, font, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else { currentLine = testLine; }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cover page
  let page = pdfDoc.addPage([612, 792]);
  page.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: rgb(...brand.primary) });
  const firmWidth = fontBold.widthOfTextAtSize(brand.firm, 16);
  page.drawText(brand.firm, { x: 306 - firmWidth / 2, y: 760, size: 16, font: fontBold, color: rgb(1, 1, 1) });
  let yPos = 600;
  const titleWidth = fontBold.widthOfTextAtSize(brand.title, 24);
  page.drawText(brand.title, { x: 306 - titleWidth / 2, y: yPos, size: 24, font: fontBold, color: rgb(...brand.accent) });
  yPos -= 80;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dateWidth = font.widthOfTextAtSize(dateStr, 12);
  page.drawText(dateStr, { x: 306 - dateWidth / 2, y: yPos, size: 12, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawRectangle({ x: 150, y: 100, width: 312, height: 3, color: rgb(...brand.accent) });

  // Content pages
  const lines = reportContent.split('\n');
  page = pdfDoc.addPage([612, 792]);
  yPos = 720;
  const leftMargin = 50, rightMargin = 562, maxWidth = rightMargin - leftMargin;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { yPos -= 8; continue; }
    if (yPos < 100) { page = pdfDoc.addPage([612, 792]); yPos = 720; }

    let useFont = font, size = 11, color = rgb(0, 0, 0), text = cleanText(trimmed), indent = leftMargin;

    if (trimmed.startsWith('###')) { useFont = fontBold; size = 14; color = rgb(...brand.accent); text = cleanText(trimmed.replace(/^###\s*/, '')); yPos -= 10; }
    else if (trimmed.startsWith('##')) { useFont = fontBold; size = 18; color = rgb(...brand.primary); text = cleanText(trimmed.replace(/^##\s*/, '')); yPos -= 15; }
    else if (trimmed.startsWith('# ')) { useFont = fontBold; size = 20; color = rgb(...brand.primary); text = cleanText(trimmed.replace(/^#\s*/, '')); yPos -= 18; }
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      text = cleanText(trimmed.replace(/^[-*]\s*/, ''));
      indent = leftMargin + 15;
      page.drawText('•', { x: leftMargin + 5, y: yPos, size, font, color: rgb(...brand.accent) });
    } else if (/^\d+\./.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s*(.*)/);
      if (match) { text = cleanText(match[2]); indent = leftMargin + 20; page.drawText(match[1] + '.', { x: leftMargin + 5, y: yPos, size, font: fontBold, color: rgb(...brand.accent) }); }
    }
    if (text.includes('**')) useFont = fontBold;

    const wrapped = wrapText(text, maxWidth - (indent - leftMargin), useFont, size);
    for (const wl of wrapped) {
      if (yPos < 100) { page = pdfDoc.addPage([612, 792]); yPos = 720; }
      page.drawText(wl, { x: indent, y: yPos, size, font: useFont, color });
      yPos -= size + 4;
    }
    if (trimmed.startsWith('#')) yPos -= 5;
  }

  // Headers/footers on content pages
  const pages = pdfDoc.getPages();
  for (let i = 1; i < pages.length; i++) {
    const p = pages[i];
    p.drawRectangle({ x: 0, y: 772, width: 612, height: 18, color: rgb(...brand.primary) });
    p.drawText(brand.firm, { x: 50, y: 778, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    p.drawRectangle({ x: 0, y: 40, width: 612, height: 1, color: rgb(...brand.accent) });
    p.drawText(`Page ${i}`, { x: 280, y: 26, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
    if (i === pages.length - 1) {
      const dLines = wrapText(disclaimer, 512, font, 7);
      let dy = 50;
      for (const dl of dLines) { p.drawText(dl, { x: 50, y: dy, size: 7, font, color: rgb(0.5, 0.5, 0.5) }); dy += 9; }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const base64 = Buffer.from(pdfBytes).toString('base64');
  return { pdf: base64, fileName: `${brand.firm.replace(/\s+/g, '_')}_Report.pdf` };
}

async function scrapeAdvisorData(params) {
  return { error: 'scrapeAdvisorData requires an LLM integration and is not available locally.' };
}

// ─── Fed Rates Data ───────────────────────────────────────────────────────────

async function getFedRatesData() {
  const fredKey = process.env.VITE_FRED_API_KEY;

  async function fetchFred(series, limit = 13) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${fredKey}&sort_order=desc&limit=${limit}&file_type=json`;
      const res = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.error_message || !data.observations?.length) return null;
      return data.observations;
    } catch { return null; }
  }

  const [fedObs, cpiObs, coreCpiObs, mortgageObs] = await Promise.all([
    fetchFred('FEDFUNDS', 2),
    fetchFred('CPIAUCSL', 13),
    fetchFred('CPILFESL', 13),
    fetchFred('MORTGAGE30US', 2),
  ]);

  const fedRate = fedObs ? `${parseFloat(fedObs[0].value).toFixed(2)}%` : '5.33%';

  let cpiYoY = 'N/A';
  if (cpiObs && cpiObs.length >= 13) {
    const cur = parseFloat(cpiObs[0].value), ago = parseFloat(cpiObs[12].value);
    cpiYoY = `${((cur - ago) / ago * 100).toFixed(1)}%`;
  }
  let cpiMoM = 'N/A';
  if (cpiObs && cpiObs.length >= 2) {
    const cur = parseFloat(cpiObs[0].value), prev = parseFloat(cpiObs[1].value);
    cpiMoM = `${((cur - prev) / prev * 100).toFixed(2)}%`;
  }
  let coreCpi = 'N/A';
  if (coreCpiObs && coreCpiObs.length >= 13) {
    const cur = parseFloat(coreCpiObs[0].value), ago = parseFloat(coreCpiObs[12].value);
    coreCpi = `${((cur - ago) / ago * 100).toFixed(1)}%`;
  }
  const mortgageRate = mortgageObs ? `${parseFloat(mortgageObs[0].value).toFixed(2)}%` : 'N/A';

  return {
    fed_rate: fedRate,
    cpi_yoy: cpiYoY,
    cpi_mom: cpiMoM,
    core_cpi: coreCpi,
    mortgage_rate: mortgageRate,
    fed_commentary: `The Federal Reserve sets the federal funds rate as its primary tool for managing inflation and employment. In 2022–2023, the Fed embarked on one of its most aggressive rate-hiking cycles in history, raising rates from near zero to over 5% to combat post-pandemic inflation that peaked above 9% in mid-2022. The Fed has since begun a gradual easing cycle as inflation has moderated toward its 2% target.\n\n**Key Fed mandates:**\n- Price stability (targeting ~2% inflation)\n- Maximum employment\n- Moderate long-term interest rates`,
    rate_outlook: `Market expectations are closely tracked via the CME FedWatch Tool, which shows the probability of rate changes at each upcoming FOMC meeting. With inflation slowly declining and the labor market remaining resilient, the Fed is expected to maintain a data-dependent approach.\n\n**Factors influencing future rates:**\n- Core PCE inflation trajectory\n- Monthly jobs reports (NFP)\n- GDP growth\n- Financial stability concerns\n- Global economic conditions`,
    how_to_predict: `To anticipate Fed rate decisions, watch these key indicators:\n\n1. **CPI & PCE data** — Rising inflation above 2% pressures the Fed to hike\n2. **Jobs Report (NFP)** — Strong jobs = potential hike; weak jobs = potential cut\n3. **Fed speeches** — FOMC members signal intentions through public remarks\n4. **CME FedWatch** — Real-time market probability of rate changes\n5. **Yield curve** — Inversion often precedes recession and eventual rate cuts\n6. **PCE deflator** — The Fed's preferred inflation measure`,
    inflation_explainer: `**Inflation** is the rate at which the general price level rises, eroding purchasing power. The Fed targets 2% annual inflation as healthy for a growing economy.\n\n**Types:**\n- **Demand-pull**: Too much money chasing too few goods\n- **Cost-push**: Rising production costs (energy, wages)\n- **Built-in**: Wage-price spiral expectations\n\n**Deflation** (falling prices) sounds good but is dangerous — it discourages spending as people wait for lower prices, leading to recession.\n\n**Stagflation** — the worst combination: high inflation + high unemployment + slow growth (seen in the 1970s).`,
    market_impact: `**Stocks**: Rate hikes increase borrowing costs, compress P/E multiples (especially for growth stocks), and reduce corporate profits. Rate cuts tend to boost equities.\n\n**Bonds**: Rate hikes push bond prices down (yields rise). Long-duration bonds are most sensitive. Rate cuts boost bond prices.\n\n**Savings accounts**: Rate hikes mean higher APYs on savings accounts, CDs, and money market funds — great for savers.\n\n**Mortgages**: The 30-year fixed mortgage closely tracks the 10-year Treasury yield. Higher rates mean significantly higher monthly payments.\n\n**Dollar**: Higher rates attract foreign capital seeking better returns, strengthening the USD.`,
    rate_history: [
      { year: '2015', fed_rate: 0.13, cpi: 0.1, mortgage: 3.85 },
      { year: '2016', fed_rate: 0.40, cpi: 2.1, mortgage: 3.65 },
      { year: '2017', fed_rate: 1.00, cpi: 2.1, mortgage: 3.99 },
      { year: '2018', fed_rate: 1.83, cpi: 2.4, mortgage: 4.54 },
      { year: '2019', fed_rate: 2.16, cpi: 2.3, mortgage: 3.94 },
      { year: '2020', fed_rate: 0.36, cpi: 1.2, mortgage: 3.11 },
      { year: '2021', fed_rate: 0.08, cpi: 4.7, mortgage: 2.96 },
      { year: '2022', fed_rate: 1.68, cpi: 8.0, mortgage: 5.34 },
      { year: '2023', fed_rate: 5.02, cpi: 4.1, mortgage: 6.81 },
      { year: '2024', fed_rate: 5.33, cpi: 2.9, mortgage: 6.72 },
      { year: '2025', fed_rate: 4.33, cpi: 3.0, mortgage: 6.65 },
    ],
    sources: ['Federal Reserve', 'Bureau of Labor Statistics', 'Freddie Mac Primary Mortgage Market Survey'],
    related_articles: [
      { title: 'Federal Reserve: How Monetary Policy Works', url: 'https://www.federalreserve.gov/monetarypolicy.htm', source: 'Federal Reserve', description: 'Official Fed overview of monetary policy tools and goals.' },
      { title: 'CPI Summary — Bureau of Labor Statistics', url: 'https://www.bls.gov/cpi/', source: 'BLS', description: 'Latest Consumer Price Index data and historical releases.' },
      { title: 'Understanding the Federal Funds Rate', url: 'https://www.investopedia.com/terms/f/federalfundsrate.asp', source: 'Investopedia', description: 'Plain-English explanation of how the fed funds rate works.' },
      { title: 'CME FedWatch Tool', url: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html', source: 'CME Group', description: 'Real-time market expectations for future Fed rate decisions.' },
    ],
  };
}

// ─── Politics & Economy Data ──────────────────────────────────────────────────

async function getPoliticsData() {
  return {
    republican_approach: `**Republican / Conservative Economic Philosophy**\n\nRepublicans generally favor lower taxes, reduced government spending, deregulation, and free-market solutions. Core tenets include:\n\n- **Supply-side economics**: Tax cuts for businesses and individuals spur investment, growth, and job creation\n- **Smaller government**: Reduce federal spending, balance the budget, reduce the national debt\n- **Deregulation**: Fewer regulations lower costs for businesses and encourage entrepreneurship\n- **Free trade (historically)**: Open markets increase prosperity; though recent years have seen more protectionist policies\n- **Monetary policy**: Generally favor price stability and a strong dollar`,
    democrat_approach: `**Democrat / Progressive Economic Philosophy**\n\nDemocrats generally favor progressive taxation, higher government spending on social programs, worker protections, and demand-side stimulus. Core tenets include:\n\n- **Demand-side economics**: Government spending and putting money in workers' pockets drives consumer demand and growth\n- **Progressive taxation**: Higher taxes on corporations and wealthy individuals to fund public investment\n- **Social safety net**: Expansion of healthcare, Social Security, unemployment insurance, and education\n- **Regulation**: Stronger consumer, environmental, and financial protections\n- **Trade**: More focus on fair trade agreements with labor and environmental standards`,
    spending_comparison: `**Federal Spending by Administration (% of GDP)**\n\nGovernment spending as a percentage of GDP tends to rise during crises (wars, recessions, pandemics) regardless of party:\n\n- Both parties have expanded the federal budget in absolute terms over time\n- Mandatory spending (Social Security, Medicare, Medicaid, interest) now accounts for ~70% of the federal budget and grows largely on autopilot\n- Discretionary spending (defense, education, infrastructure) is where most political battles occur\n- The 2008 financial crisis and 2020 COVID pandemic both triggered massive bipartisan spending increases`,
    key_policies: `**Major Economic Legislation & Impact**\n\n**Tax Cuts and Jobs Act (2017, R)** — Reduced corporate tax rate from 35% to 21%, cut individual rates. Boosted corporate earnings short-term; added ~$1.9T to the deficit over 10 years per CBO.\n\n**Affordable Care Act (2010, D)** — Expanded health insurance coverage to ~20M Americans. Added insurance mandates and Medicaid expansion.\n\n**Dodd-Frank Act (2010, D)** — Major financial regulation after 2008 crisis. Created the CFPB, stress tests for banks, Volcker Rule.\n\n**American Rescue Plan (2021, D)** — $1.9T COVID relief. Boosted GDP recovery; critics argue it contributed to 2021-2022 inflation.\n\n**Infrastructure Investment and Jobs Act (2021, bipartisan)** — $1.2T for roads, bridges, broadband, clean energy.`,
    fiscal_effects: `**How Fiscal Policy Affects the Economy**\n\n**Expansionary Fiscal Policy** (stimulus spending / tax cuts):\n- Increases aggregate demand and GDP in the short term\n- Can reduce unemployment during recessions\n- Risk: Increases national debt; can fuel inflation if economy is near full capacity\n\n**Contractionary Fiscal Policy** (spending cuts / tax increases):\n- Reduces aggregate demand, can slow inflation\n- Risk: Can slow growth and increase unemployment\n\n**The Deficit vs. Debt distinction:**\n- **Deficit** = Annual shortfall (spending > revenue)\n- **Debt** = Cumulative total of all past deficits\n- US national debt has grown under every president since Eisenhower`,
    debt_timeline: [
      { president: 'Reagan', party: 'R', years: '1981-1989', debt_start_t: 0.9, debt_end_t: 2.7, gdp_growth: 3.5, sp500_return: 12.7 },
      { president: 'Bush Sr.', party: 'R', years: '1989-1993', debt_start_t: 2.7, debt_end_t: 4.4, gdp_growth: 2.1, sp500_return: 13.5 },
      { president: 'Clinton', party: 'D', years: '1993-2001', debt_start_t: 4.4, debt_end_t: 5.7, gdp_growth: 3.9, sp500_return: 18.2 },
      { president: 'Bush Jr.', party: 'R', years: '2001-2009', debt_start_t: 5.7, debt_end_t: 11.9, gdp_growth: 2.1, sp500_return: -4.4 },
      { president: 'Obama', party: 'D', years: '2009-2017', debt_start_t: 11.9, debt_end_t: 19.9, gdp_growth: 2.3, sp500_return: 13.8 },
      { president: 'Trump', party: 'R', years: '2017-2021', debt_start_t: 19.9, debt_end_t: 27.8, gdp_growth: 1.9, sp500_return: 14.7 },
      { president: 'Biden', party: 'D', years: '2021-2025', debt_start_t: 27.8, debt_end_t: 36.2, gdp_growth: 3.1, sp500_return: 11.4 },
    ],
    sources: ['Congressional Budget Office', 'Bureau of Economic Analysis', 'US Treasury', 'Bureau of Labor Statistics'],
    related_articles: [
      { title: 'CBO: The Budget and Economic Outlook', url: 'https://www.cbo.gov/publication/budget-economic-outlook', source: 'CBO', description: 'Official Congressional Budget Office projections for federal spending and revenue.' },
      { title: 'US Debt Clock', url: 'https://www.usdebtclock.org', source: 'US Debt Clock', description: 'Real-time national debt, spending, and revenue tracker.' },
      { title: 'BEA: GDP by Administration', url: 'https://www.bea.gov/data/gdp/gross-domestic-product', source: 'BEA', description: 'Official GDP data from the Bureau of Economic Analysis.' },
    ],
  };
}

// ─── LLM Integration Shim ─────────────────────────────────────────────────────

async function invokeLLM(params) {
  const { prompt = '' } = params;
  if (prompt.includes('Federal Reserve') || prompt.includes('interest rates') || prompt.includes('CPI')) {
    return getFedRatesData();
  }
  if (prompt.includes('Democrats and Republicans') || prompt.includes('political') || prompt.includes('fiscal policy')) {
    return getPoliticsData();
  }
  throw new Error('LLM integration not available locally for this prompt.');
}

// ─── Route Dispatch ──────────────────────────────────────────────────────────

const HANDLERS = {
  getStockData,
  getMarketHistory,
  getSectorPerformance,
  getTopPerformers,
  getStockPerformanceForPeriod,
  fetchAnalystData,
  generateAdvisorReport,
  scrapeAdvisorData,
};

// ─── New GET Route Handlers ───────────────────────────────────────────────────

async function handleIndices() {
  log('[GET /api/indices]');

  const cachedIndices = readCache('indices_result', 10 * 60 * 1000);
  if (cachedIndices) { log('[indices] cache hit'); return cachedIndices; }

  const avKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;
  const fredKey = process.env.VITE_FRED_API_KEY;
  const tiingoKey = process.env.VITE_TIINGO_API_KEY;

  // Maps YF-style symbol → Polygon index ticker + display name
  const INDEX_MAP = [
    { symbol: '^GSPC',    name: 'S&P 500',        polyIdx: 'I:SPX',     etf: 'SPY',  scale: 10.05 },
    { symbol: '^DJI',     name: 'Dow Jones',       polyIdx: 'I:DJI',     etf: 'DIA',  scale: 100.0 },
    { symbol: '^IXIC',    name: 'NASDAQ',          polyIdx: 'I:COMP',    etf: 'QQQ',  scale: 37.5  },
    { symbol: '^RUT',     name: 'Russell 2000',    polyIdx: 'I:RUT2000', etf: 'IWM',  scale: 10.0  },
    { symbol: '^VIX',     name: 'VIX',             polyIdx: 'I:VIX',     etf: null,   scale: 1.0   },
    { symbol: '^TNX',     name: '10Y Treasury',    polyIdx: null,        etf: null,   scale: 1.0   },
    { symbol: 'DX-Y.NYB', name: 'Dollar Index',   polyIdx: null,        etf: 'UUP',  scale: 38.5  },
  ];

  // ── 1. Polygon index snapshot (primary for true indices) ──────────────────
  const polyIdxTickers = INDEX_MAP.filter(e => e.polyIdx).map(e => e.polyIdx);
  const polyIdxData = await polyIndexSnapshot(polyIdxTickers).catch(() => ({}));
  log(`[indices] Polygon index — ${Object.keys(polyIdxData).length} indices`);

  // ── 2. Polygon ETF snapshot for non-index items (DXY proxy, 10Y ETF) ─────
  const polyEtfTickers = INDEX_MAP.filter(e => !e.polyIdx && e.etf).map(e => e.etf);
  const polyEtfData = polyEtfTickers.length ? await polySnapshot(polyEtfTickers).catch(() => ({})) : {};

  // ── 3. Tiingo IEX fallback for ETF proxies ────────────────────────────────
  let tiingoEtfMap = {};
  if (tiingoKey && tiingoKey !== 'your-tiingo-api-key-here') {
    const etfSymbols = INDEX_MAP.filter(e => e.etf).map(e => e.etf);
    const ck = `tiingo_iex_indices`;
    let cached = readCache(ck, 5 * 60 * 1000);
    if (!cached) {
      try {
        const headers = { 'Authorization': `Token ${tiingoKey}`, 'Content-Type': 'application/json' };
        const r = await fetchWithTimeout(`https://api.tiingo.com/iex/?tickers=${etfSymbols.join(',')}`, { headers }, 10000);
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j)) {
            cached = {};
            for (const d of j) {
              const t = d.ticker?.toUpperCase();
              if (t) cached[t] = { price: d.tngoLast ?? d.last ?? 0, prev: d.prevClose ?? d.tngoLast ?? 0 };
            }
            writeCache(ck, cached);
          }
        }
      } catch (e) { log('[indices] Tiingo IEX error:', e.message); }
    }
    tiingoEtfMap = cached || {};
  }

  // ── 4. AV GLOBAL_QUOTE for ETF proxies (24hr cache) ──────────────────────
  async function avGQ(etf) {
    const ck = `av_gq_idx_${etf}`;
    let gq = readCache(ck, INCOME_TTL);
    if (!gq) {
      const r = await fetchWithTimeout(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${etf}&apikey=${avKey}`, {}, 8000
      );
      const j = await r.json();
      if (j['Global Quote']?.['05. price']) { gq = j['Global Quote']; writeCache(ck, gq); }
    }
    if (!gq) return null;
    return { price: parseFloat(gq['05. price'] ?? 0), prev: parseFloat(gq['08. previous close'] ?? 0) };
  }

  // ── 5. FRED for VIX + 10Y yield ──────────────────────────────────────────
  async function fredLastValue(series) {
    const ck = `fred_idx_${series}`;
    let cached = readCache(ck, INCOME_TTL);
    if (cached) return cached;
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${fredKey}&file_type=json&limit=5&sort_order=desc`;
      const r = await fetchWithTimeout(url, {}, 8000);
      const j = await r.json();
      const obs = (j.observations || []).filter(o => o.value !== '.');
      if (obs.length > 0) {
        const val = { price: parseFloat(obs[0].value), prev: parseFloat(obs[1]?.value ?? obs[0].value) };
        writeCache(ck, val);
        return val;
      }
    } catch {}
    return null;
  }

  const results = [];
  for (const { symbol, name, polyIdx, etf, scale } of INDEX_MAP) {
    // ── A. Polygon native index (I:SPX, I:DJI, etc.) ──
    if (polyIdx && polyIdxData[polyIdx]) {
      const t = polyIdxData[polyIdx];
      const price = t.value ?? t.session?.close ?? 0;
      const prev = t.session?.previous_close ?? t.prevDay?.c ?? price;
      const change = price - prev;
      const changePercent = prev !== 0 ? (change / prev * 100) : 0;
      results.push({ symbol, name, price: parseFloat(price.toFixed(2)), change: parseFloat(change.toFixed(2)), changePercent: parseFloat(changePercent.toFixed(2)), isUp: change >= 0 });
      continue;
    }

    // ── B. 10Y yield from FRED (no index ticker available) ──
    if (symbol === '^TNX' && fredKey) {
      const fredData = await fredLastValue('DGS10').catch(() => null);
      if (fredData) {
        const { price, prev } = fredData;
        const change = price - prev;
        const changePercent = prev !== 0 ? (change / prev * 100) : 0;
        results.push({ symbol, name, price: parseFloat(price.toFixed(2)), change: parseFloat(change.toFixed(2)), changePercent: parseFloat(changePercent.toFixed(2)), isUp: change >= 0 });
        continue;
      }
      results.push({ symbol, name, price: 0, change: 0, changePercent: 0, isUp: false, error: true });
      continue;
    }

    // ── C. Polygon ETF snapshot (for DXY proxy and any without polyIdx) ──
    if (etf && polyEtfData[etf]) {
      const t = polyEtfData[etf];
      const etfPrice = t.day?.c ?? t.lastTrade?.p ?? 0;
      const etfPrev = t.prevDay?.c ?? etfPrice;
      const indexPrice = parseFloat((etfPrice * scale).toFixed(2));
      const indexPrev = parseFloat((etfPrev * scale).toFixed(2));
      const change = parseFloat((indexPrice - indexPrev).toFixed(2));
      const changePercent = indexPrev !== 0 ? parseFloat(((change / indexPrev) * 100).toFixed(2)) : 0;
      results.push({ symbol, name, price: indexPrice, change, changePercent, isUp: change >= 0 });
      continue;
    }

    // ── D. Tiingo ETF proxy fallback ──
    if (etf && tiingoEtfMap[etf]) {
      const { price: etfPrice, prev: etfPrev } = tiingoEtfMap[etf];
      const indexPrice = parseFloat((etfPrice * scale).toFixed(2));
      const indexPrev = parseFloat((etfPrev * scale).toFixed(2));
      const change = parseFloat((indexPrice - indexPrev).toFixed(2));
      const changePercent = indexPrev !== 0 ? parseFloat(((change / indexPrev) * 100).toFixed(2)) : 0;
      results.push({ symbol, name, price: indexPrice, change, changePercent, isUp: change >= 0 });
      continue;
    }

    // ── E. AV ETF proxy fallback (24hr cached) ──
    if (etf && avKey) {
      try {
        const etfData = await avGQ(etf);
        if (etfData) {
          const indexPrice = parseFloat((etfData.price * scale).toFixed(2));
          const indexPrev = parseFloat((etfData.prev * scale).toFixed(2));
          const change = parseFloat((indexPrice - indexPrev).toFixed(2));
          const changePercent = indexPrev !== 0 ? parseFloat(((change / indexPrev) * 100).toFixed(2)) : 0;
          results.push({ symbol, name, price: indexPrice, change, changePercent, isUp: change >= 0 });
          continue;
        }
      } catch (e) { log(`[indices] AV fallback error for ${etf}:`, e.message); }
    }

    results.push({ symbol, name, price: 0, change: 0, changePercent: 0, isUp: false, error: true });
  }

  writeCache('indices_result', results);
  return results;
}

async function handleFredSeries(seriesId, limit = 100) {
  log(`[GET /api/fred/${seriesId}] limit=${limit}`);
  const fredKey = process.env.VITE_FRED_API_KEY;
  if (!fredKey) throw new Error('Missing VITE_FRED_API_KEY');

  const cacheKey = `${seriesId}:${limit}`;
  const now = Date.now();
  const cached = fredSeriesCache[cacheKey];
  if (cached && (now - cached.time) < ONE_HOUR) {
    return cached.data;
  }

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredKey}&file_type=json&limit=${limit}&sort_order=desc`;
  const res = await fetchWithTimeout(url);
  const json = await res.json();
  if (json.error_message) throw new Error(`FRED error: ${json.error_message}`);

  const data = (json.observations || [])
    .filter(o => o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
    .reverse();

  const result = { seriesId, data };
  fredSeriesCache[cacheKey] = { time: now, data: result };
  return result;
}

async function handleFredMultiple(seriesParam, limit = 100) {
  log(`[GET /api/fred-multiple] series=${seriesParam} limit=${limit}`);
  if (!seriesParam) throw new Error('Query param "series" is required');
  const ids = seriesParam.split(',').map(s => s.trim()).filter(Boolean);
  const results = await Promise.all(ids.map(id => handleFredSeries(id, limit).catch(e => ({ seriesId: id, error: e.message, data: [] }))));
  const out = {};
  for (const r of results) out[r.seriesId] = r;
  return out;
}

async function handleEiaStateGas() {
  log('[GET /api/eia-state-gas]');
  const eiaKey = process.env.VITE_EIA_API_KEY;
  if (!eiaKey) throw new Error('Missing VITE_EIA_API_KEY');

  const cached = readCache('eia_state_gas', 6 * 60 * 60 * 1000);
  if (cached) return cached;

  // Fetch weekly retail regular gas prices for all areas — filter states on server side
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${eiaKey}&data[]=value&facets[product][]=EPM0&frequency=weekly&sort[0][column]=period&sort[0][direction]=desc&length=1000&offset=0`;
  const res = await fetchWithTimeout(url, {}, 15000);
  const json = await res.json();
  const rows = json.response?.data || [];

  // EIA state area codes: 3-char, start with 'S', e.g. SCA, STX, SFL
  const STATE_AREAS = new Set([
    'SAL','SAK','SAZ','SAR','SCA','SCO','SCT','SDE','SFL','SGA',
    'SHI','SID','SIL','SIN','SIA','SKS','SKY','SLA','SME','SMD',
    'SMA','SMI','SMN','SMS','SMO','SMT','SNE','SNV','SNH','SNJ',
    'SNM','SNY','SNC','SND','SOH','SOK','SOR','SPA','SRI','SSC',
    'SSD','STN','STX','SUT','SVT','SVA','SWA','SWV','SWI','SWY','SDC'
  ]);

  const stateMap = {};
  for (const row of rows) {
    const area = row.duoarea;
    if (STATE_AREAS.has(area) && !stateMap[area]) {
      stateMap[area] = { period: row.period, value: parseFloat(row.value) };
    }
  }

  writeCache('eia_state_gas', stateMap);
  return stateMap;
}

async function handleBls(seriesIdsParam) {
  log(`[GET /api/bls] seriesIds=${seriesIdsParam}`);
  const blsKey = process.env.VITE_BLS_API_KEY;
  if (!blsKey) throw new Error('Missing VITE_BLS_API_KEY');
  if (!seriesIdsParam) throw new Error('Query param "seriesIds" is required');

  const seriesid = seriesIdsParam.split(',').map(s => s.trim()).filter(Boolean);
  const currentYear = new Date().getFullYear().toString();
  const body = JSON.stringify({ seriesid, startyear: '2015', endyear: currentYear, registrationkey: blsKey });

  const res = await fetchWithTimeout('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const json = await res.json();
  return json;
}

async function handleEia(route) {
  log(`[GET /api/eia/${route}]`);
  const eiaKey = process.env.VITE_EIA_API_KEY;
  if (!eiaKey) throw new Error('Missing VITE_EIA_API_KEY');

  const url = `https://api.eia.gov/v2/${route}?api_key=${eiaKey}&data[]=value&facets[duoarea][]=NUS&frequency=monthly&sort[0][column]=period&sort[0][direction]=desc&length=24`;
  const res = await fetchWithTimeout(url);
  const json = await res.json();
  return json;
}

async function handleMarketBreadth() {
  log('[GET /api/market/breadth]');

  const etfTickers = ['SPY', 'QQQ', 'IWM', 'DIA'];
  const ETF_NAMES = { SPY: 'S&P 500 ETF', QQQ: 'NASDAQ 100 ETF', IWM: 'Russell 2000 ETF', DIA: 'Dow Jones ETF' };
  const fredKey = process.env.VITE_FRED_API_KEY;

  const today = new Date().toISOString().split('T')[0];
  const from30d = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from1y = new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const etfResults = await Promise.all(
    etfTickers.map(async ticker => {
      try {
        const bars = await polyAggs(ticker, from1y, today, 'day', 1);
        const closes = bars.map(b => b.c).filter(c => c != null);
        if (closes.length < 2) return null;
        const price = closes[closes.length - 1];
        const prev1d = closes.length >= 2 ? closes[closes.length - 2] : price;
        const prev5d = closes.length >= 6 ? closes[closes.length - 6] : closes[0];
        const prev20d = closes.length >= 21 ? closes[closes.length - 21] : closes[0];
        const high52 = Math.max(...closes);
        const low52 = Math.min(...closes);
        return {
          symbol: ticker, name: ETF_NAMES[ticker] || ticker,
          price: parseFloat(price.toFixed(2)),
          change1d: parseFloat(((price - prev1d) / prev1d * 100).toFixed(2)),
          change5d: parseFloat(((price - prev5d) / prev5d * 100).toFixed(2)),
          change20d: parseFloat(((price - prev20d) / prev20d * 100).toFixed(2)),
          high52: parseFloat(high52.toFixed(2)),
          low52: parseFloat(low52.toFixed(2)),
        };
      } catch (e) {
        console.error(`[market/breadth] Polygon error for ${ticker}:`, e.message);
        return null;
      }
    })
  );

  // VIX from FRED (most reliable source)
  let vixCurrent = 0, vixChange = 0;
  try {
    if (fredKey) {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${fredKey}&file_type=json&limit=5&sort_order=desc`;
      const r = await fetchWithTimeout(url, {}, 8000);
      const j = await r.json();
      const obs = (j.observations || []).filter(o => o.value !== '.');
      if (obs.length >= 2) {
        vixCurrent = parseFloat(parseFloat(obs[0].value).toFixed(2));
        const vixPrev = parseFloat(obs[1].value);
        vixChange = parseFloat(((vixCurrent - vixPrev) / (vixPrev || 1) * 100).toFixed(2));
      }
    }
  } catch {}

  return {
    indices: etfResults.filter(Boolean),
    vixCurrent,
    vixChange,
    advanceDecline: { advancing: 340, declining: 160, unchanged: 10 },
    newHighs: 45,
    newLows: 12,
    putCallRatio: 0.85,
    bullishPercent: 62,
  };
}

async function handleMarketMovers() {
  log('[GET /api/market/movers]');
  const avKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;

  const cached = readCache('market_movers', 5 * 60 * 1000);
  if (cached) return cached;

  // ── Primary: Polygon gainers/losers ──────────────────────────────────────
  try {
    const movers = await polyMovers();
    if (movers && (movers.gainers.length > 0 || movers.losers.length > 0)) {
      writeCache('market_movers', movers);
      return movers;
    }
  } catch (e) { log('[movers] Polygon error:', e.message); }

  // ── Fallback: Alpha Vantage TOP_GAINERS_LOSERS ────────────────────────────
  if (avKey) {
    try {
      const r = await fetchWithTimeout(
        `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${avKey}`,
        {}, 12000
      );
      const json = await r.json();
      function mapAV(list) {
        return (list || []).slice(0, 15).map(q => ({
          ticker: q.ticker, name: q.ticker, company_name: q.ticker,
          current_price: parseFloat(q.price ?? 0),
          change_percent: parseFloat((q.change_percentage || '0').replace('%', '')),
          change: parseFloat(q.change_amount ?? 0),
          volume: parseInt((q.volume || '0').replace(/,/g, '')),
        }));
      }
      if (json.top_gainers) {
        const result = { gainers: mapAV(json.top_gainers), losers: mapAV(json.top_losers), mostActive: mapAV(json.most_actively_traded) };
        writeCache('market_movers', result);
        return result;
      }
    } catch (e) { log('AV movers error:', e.message); }
  }

  return { gainers: [], losers: [], mostActive: [] };
}

async function handleEconomicCalendar() {
  log('[GET /api/economic-calendar]');

  const events = [
    { date: '2026-03-05', time: '08:30', event: 'Initial Jobless Claims', importance: 'medium', forecast: '215K', previous: '212K', actual: null },
    { date: '2026-03-07', time: '08:30', event: 'Non-Farm Payrolls', importance: 'high', forecast: '185K', previous: '177K', actual: null },
    { date: '2026-03-07', time: '08:30', event: 'Unemployment Rate', importance: 'high', forecast: '4.1%', previous: '4.1%', actual: null },
    { date: '2026-03-10', time: '10:00', event: 'Consumer Confidence', importance: 'medium', forecast: '104.5', previous: '103.9', actual: null },
    { date: '2026-03-12', time: '08:30', event: 'CPI Report', importance: 'high', forecast: '0.3%', previous: '0.4%', actual: null },
    { date: '2026-03-12', time: '08:30', event: 'Core CPI (YoY)', importance: 'high', forecast: '3.1%', previous: '3.2%', actual: null },
    { date: '2026-03-13', time: '08:30', event: 'PPI (MoM)', importance: 'medium', forecast: '0.2%', previous: '0.4%', actual: null },
    { date: '2026-03-17', time: '08:30', event: 'Retail Sales', importance: 'high', forecast: '0.4%', previous: '-0.9%', actual: null },
    { date: '2026-03-18', time: '09:15', event: 'Industrial Production', importance: 'medium', forecast: '0.3%', previous: '0.5%', actual: null },
    { date: '2026-03-18', time: '08:30', event: 'Housing Starts', importance: 'medium', forecast: '1.38M', previous: '1.37M', actual: null },
    { date: '2026-03-19', time: '14:00', event: 'FOMC Meeting — Rate Decision', importance: 'high', forecast: '4.25-4.50%', previous: '4.25-4.50%', actual: null },
    { date: '2026-03-19', time: '14:30', event: 'FOMC Press Conference', importance: 'high', forecast: null, previous: null, actual: null },
    { date: '2026-03-20', time: '08:30', event: 'Initial Jobless Claims', importance: 'medium', forecast: '218K', previous: '215K', actual: null },
    { date: '2026-03-21', time: '09:45', event: 'ISM Manufacturing PMI', importance: 'high', forecast: '49.8', previous: '50.3', actual: null },
    { date: '2026-03-24', time: '08:30', event: 'Durable Goods Orders', importance: 'medium', forecast: '0.6%', previous: '0.5%', actual: null },
    { date: '2026-03-25', time: '10:00', event: 'Consumer Confidence', importance: 'medium', forecast: '105.2', previous: '104.5', actual: null },
    { date: '2026-03-26', time: '08:30', event: 'GDP (Q4 Final)', importance: 'high', forecast: '2.3%', previous: '2.3%', actual: null },
    { date: '2026-03-27', time: '08:30', event: 'Personal Income & Spending (PCE)', importance: 'high', forecast: '0.4%', previous: '0.3%', actual: null },
    { date: '2026-03-27', time: '08:30', event: 'Core PCE Price Index (YoY)', importance: 'high', forecast: '2.6%', previous: '2.6%', actual: null },
    { date: '2026-04-01', time: '10:00', event: 'ISM Manufacturing Index', importance: 'high', forecast: '50.1', previous: '49.8', actual: null },
    { date: '2026-04-03', time: '08:30', event: 'Non-Farm Payrolls', importance: 'high', forecast: '182K', previous: '185K', actual: null },
    { date: '2026-04-07', time: '08:30', event: 'Trade Balance', importance: 'medium', forecast: '-$87.2B', previous: '-$88.5B', actual: null },
    { date: '2026-04-10', time: '08:30', event: 'CPI Report', importance: 'high', forecast: '0.2%', previous: '0.3%', actual: null },
    { date: '2026-04-14', time: '08:30', event: 'Retail Sales', importance: 'high', forecast: '0.3%', previous: '0.4%', actual: null },
    { date: '2026-04-16', time: '08:30', event: 'Housing Starts', importance: 'medium', forecast: '1.40M', previous: '1.38M', actual: null },
    { date: '2026-04-28', time: '14:00', event: 'FOMC Meeting — Rate Decision', importance: 'high', forecast: '4.00-4.25%', previous: '4.25-4.50%', actual: null },
    { date: '2026-04-29', time: '08:30', event: 'GDP (Q1 Advance)', importance: 'high', forecast: '2.1%', previous: '2.3%', actual: null },
    { date: '2026-04-30', time: '08:30', event: 'Core PCE Price Index (YoY)', importance: 'high', forecast: '2.5%', previous: '2.6%', actual: null },
  ];

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function handleSectorHeatmap() {
  log('[GET /api/sector/heatmap]');

  const SECTOR_ETFS = [
    { symbol: 'XLK',  name: 'Technology' },
    { symbol: 'XLF',  name: 'Financials' },
    { symbol: 'XLE',  name: 'Energy' },
    { symbol: 'XLV',  name: 'Health Care' },
    { symbol: 'XLY',  name: 'Consumer Discretionary' },
    { symbol: 'XLP',  name: 'Consumer Staples' },
    { symbol: 'XLI',  name: 'Industrials' },
    { symbol: 'XLU',  name: 'Utilities' },
    { symbol: 'XLRE', name: 'Real Estate' },
    { symbol: 'XLB',  name: 'Materials' },
    { symbol: 'XLC',  name: 'Communication Services' },
  ];

  const avKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;
  const allSymbols = SECTOR_ETFS.map(e => e.symbol);

  function sectorColor(dayChange) {
    if (dayChange >= 2) return '#16a34a';
    if (dayChange >= 0.5) return '#4ade80';
    if (dayChange >= 0) return '#86efac';
    if (dayChange >= -0.5) return '#fca5a5';
    if (dayChange >= -2) return '#f87171';
    return '#dc2626';
  }

  // ── Primary: Polygon batch snapshot ──────────────────────────────────────
  let priceMap = {};
  try {
    const polySnap = await polySnapshot(allSymbols);
    if (Object.keys(polySnap).length > 0) {
      for (const [sym, t] of Object.entries(polySnap)) {
        priceMap[sym] = { price: t.day?.c ?? t.lastTrade?.p ?? 0, prev: t.prevDay?.c ?? 0 };
      }
      log(`[sector/heatmap] Polygon OK — ${Object.keys(priceMap).length} sectors`);
    }
  } catch (e) { log('[sector/heatmap] Polygon error:', e.message); }

  // ── Tiingo IEX fallback ───────────────────────────────────────────────────
  const tiingoKey = process.env.VITE_TIINGO_API_KEY;
  if (Object.keys(priceMap).length === 0 && tiingoKey && tiingoKey !== 'your-tiingo-api-key-here') {
    const tiingoCk = `sector_tiingo_iex`;
    let cached = readCache(tiingoCk, 5 * 60 * 1000);
    if (!cached) {
      try {
        const headers = { 'Authorization': `Token ${tiingoKey}`, 'Content-Type': 'application/json' };
        const r = await fetchWithTimeout(`https://api.tiingo.com/iex/?tickers=${allSymbols.join(',')}`, { headers }, 10000);
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j) && j.length > 0) {
            cached = {};
            for (const d of j) {
              const sym = d.ticker?.toUpperCase();
              if (sym) cached[sym] = { price: d.tngoLast ?? d.last ?? 0, prev: d.prevClose ?? 0 };
            }
            writeCache(tiingoCk, cached);
          }
        }
      } catch (e) { log('[sector/heatmap] Tiingo IEX error:', e.message); }
    }
    if (cached) priceMap = cached;
  }

  // ── AV GLOBAL_QUOTE per ETF (last resort) ────────────────────────────────
  const results = [];
  for (const { symbol, name } of SECTOR_ETFS) {
    if (priceMap[symbol]) {
      const { price, prev } = priceMap[symbol];
      const dayChange = prev ? parseFloat(((price - prev) / prev * 100).toFixed(2)) : 0;
      results.push({ symbol, name, dayChange, weekChange: 0, monthChange: 0, threeMonthChange: 0, ytdChange: 0, yearChange: 0, color: sectorColor(dayChange) });
    } else if (avKey) {
      try {
        const ck = `av_gq_${symbol}`;
        let gq = readCache(ck, 6 * ONE_HOUR);
        if (!gq) {
          await new Promise(r => setTimeout(r, 500));
          const r = await fetchWithTimeout(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${avKey}`, {}, 8000);
          const j = await r.json();
          if (j['Global Quote']?.['05. price']) { gq = j['Global Quote']; writeCache(ck, gq); }
        }
        if (gq) {
          const price = parseFloat(gq['05. price'] ?? 0);
          const prevClose = parseFloat(gq['08. previous close'] ?? price);
          const dayChange = prevClose ? parseFloat(((price - prevClose) / prevClose * 100).toFixed(2)) : 0;
          results.push({ symbol, name, dayChange, weekChange: 0, monthChange: 0, threeMonthChange: 0, ytdChange: 0, yearChange: 0, color: sectorColor(dayChange) });
        } else {
          results.push({ symbol, name, dayChange: 0, weekChange: 0, monthChange: 0, threeMonthChange: 0, ytdChange: 0, yearChange: 0, color: '#6b7280' });
        }
      } catch { results.push({ symbol, name, dayChange: 0, weekChange: 0, monthChange: 0, threeMonthChange: 0, ytdChange: 0, yearChange: 0, color: '#6b7280' }); }
    } else {
      results.push({ symbol, name, dayChange: 0, weekChange: 0, monthChange: 0, threeMonthChange: 0, ytdChange: 0, yearChange: 0, color: '#6b7280' });
    }
  }

  return results;
}

async function handleWatchlistQuote(symbolsParam) {
  log(`[GET /api/watchlist/quote] symbols=${symbolsParam}`);
  if (!symbolsParam) throw new Error('Query param "symbols" is required');

  const tiingoKey = process.env.VITE_TIINGO_API_KEY;
  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  const results = await Promise.all(
    symbols.map(async symbol => {
      try {
        // Try Tiingo IEX first (real-time, no IP ban issues)
        if (tiingoKey && tiingoKey !== 'your-tiingo-api-key-here') {
          const ck = `wl_tiingo_${symbol}`;
          let iexData = readCache(ck, 5 * 60 * 1000); // 5-min cache
          if (!iexData) {
            const headers = { 'Authorization': `Token ${tiingoKey}`, 'Content-Type': 'application/json' };
            const r = await fetchWithTimeout(`https://api.tiingo.com/iex/?tickers=${symbol}`, { headers }, 8000);
            if (r.ok) {
              const j = await r.json();
              const d = Array.isArray(j) ? j[0] : null;
              if (d) { iexData = d; writeCache(ck, d); }
            }
          }
          if (iexData) {
            const price = iexData.tngoLast ?? iexData.last ?? 0;
            const prevClose = iexData.prevClose ?? price;
            const change = price - prevClose;
            const changePercent = prevClose !== 0 ? (change / prevClose * 100) : 0;
            const metaData = await tiingoEnrich(symbol, tiingoKey).catch(() => null);
            return {
              symbol,
              name: metaData?.company_name || symbol,
              price: parseFloat(price.toFixed(2)),
              change: parseFloat(change.toFixed(2)),
              changePercent: parseFloat(changePercent.toFixed(2)),
              volume: iexData.volume ?? 0,
              marketCap: metaData?.market_cap ?? null,
              pe: metaData?.pe_ratio ? parseFloat(metaData.pe_ratio.toFixed(2)) : null,
              high52: iexData.high ?? null,
              low52: iexData.low ?? null,
              sector: metaData?.sector ?? null,
            };
          }
        }

        // Polygon fallback
        const snap = await polySnapshot([symbol]);
        const t = snap[symbol];
        if (t) {
          const price = t.day?.c ?? t.lastTrade?.p ?? 0;
          const prevClose = t.prevDay?.c ?? price;
          const change = price - prevClose;
          const changePercent = prevClose !== 0 ? (change / prevClose * 100) : 0;
          return {
            symbol, name: symbol,
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: t.day?.v ?? 0,
            marketCap: null, pe: null,
            high52: null, low52: null,
          };
        }
        throw new Error(`No data for ${symbol}`);
      } catch (e) {
        console.error(`[watchlist/quote] Error fetching ${symbol}:`, e.message);
        return { symbol, name: symbol, price: 0, change: 0, changePercent: 0, volume: 0, marketCap: null, pe: null, high52: null, low52: null, error: e.message };
      }
    })
  );

  return results;
}

// ─── News Fetching (Polygon + RSS) ───────────────────────────────────────────

const NEWS_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const NEWS_SOURCES = [
  { name: 'Bloomberg',   url: 'https://feeds.bloomberg.com/markets/news.rss',                        category: 'Markets'   },
  { name: 'Reuters',     url: 'https://feeds.reuters.com/reuters/businessNews',                       category: 'Markets'   },
  { name: 'MarketWatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',          category: 'Markets'   },
  { name: 'CNBC',        url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', category: 'Markets' },
  { name: 'FT',          url: 'https://www.ft.com/rss/home/us',                                      category: 'Markets'   },
];

function parseRSS(xml, sourceName, defaultCategory) {
  const articles = [];
  // Extract all <item> blocks
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<\\!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
      return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
    };
    const title = get('title');
    const link  = get('link') || block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() || '';
    const desc  = get('description') || get('summary') || '';
    const pubDate = get('pubDate') || get('published') || get('dc:date') || '';
    if (!title || title.length < 5) continue;
    // Categorise by keywords
    const text = (title + ' ' + desc).toLowerCase();
    let category = defaultCategory;
    if (/fed|fomc|rate|inflation|cpi|gdp|powell|macro/.test(text)) category = 'Fed & Macro';
    else if (/earn|eps|revenue|quarter|profit|beat|miss/.test(text)) category = 'Earnings';
    else if (/tech|ai|nvidia|apple|google|meta|microsoft|amazon|chip/.test(text)) category = 'Tech';
    else if (/oil|energy|gas|opec|crude|lng|pipeline/.test(text)) category = 'Energy';
    else if (/crypto|bitcoin|btc|ethereum|eth|defi|blockchain/.test(text)) category = 'Crypto';
    else if (/trump|tariff|congress|trade|policy|geopolit|election/.test(text)) category = 'Politics';

    // Extract tickers (words like $AAPL or uppercase 1-5 letter words near company names)
    const tickerMatches = (title + ' ' + desc).match(/\$([A-Z]{1,5})\b/g) || [];
    const tickers = [...new Set(tickerMatches.map(t => t.replace('$', '')))].slice(0, 4);

    // Detect sentiment
    const bullishWords = /surge|rally|gain|jump|beat|record|high|strong|growth|rise|soar/i;
    const bearishWords  = /drop|fall|plunge|decline|miss|low|weak|concern|risk|sell|crash|fear/i;
    const impact = bullishWords.test(title) ? 'Bullish' : bearishWords.test(title) ? 'Bearish' : 'Neutral';

    articles.push({
      id: Buffer.from(link || title).toString('base64').slice(0, 16),
      source: sourceName,
      category,
      title,
      summary: desc.slice(0, 280).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      url: link,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      tickers,
      impact,
    });
  }
  return articles;
}

async function fetchNewsFromRSS() {
  const all = [];
  for (const source of NEWS_SOURCES) {
    try {
      const res = await fetchWithTimeout(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PlanorBot/1.0)', 'Accept': 'application/rss+xml, application/xml, text/xml' }
      }, 10000);
      if (!res.ok) continue;
      const xml = await res.text();
      const parsed = parseRSS(xml, source.name, source.category);
      all.push(...parsed.slice(0, 15));
      log(`[News] ${source.name}: ${parsed.length} articles`);
    } catch (e) {
      log(`[News] ${source.name} failed: ${e.message}`);
    }
  }
  return all;
}

async function fetchNewsFromPolygon() {
  const polyKey = process.env.POLYGON_API_KEY;
  if (!polyKey) return [];
  try {
    const url = `https://api.polygon.io/v2/reference/news?limit=50&order=desc&sort=published_utc&apiKey=${polyKey}`;
    const res = await fetchWithTimeout(url, {}, 12000);
    if (!res.ok) return [];
    const json = await res.json();
    const results = json.results || [];
    return results.map(a => {
      const text = (a.title + ' ' + (a.description || '')).toLowerCase();
      let category = 'Markets';
      if (/fed|fomc|rate|inflation|cpi|gdp|powell|macro/.test(text)) category = 'Fed & Macro';
      else if (/earn|eps|revenue|quarter|profit|beat|miss/.test(text)) category = 'Earnings';
      else if (/tech|ai|nvidia|apple|google|meta|microsoft|amazon|chip/.test(text)) category = 'Tech';
      else if (/oil|energy|gas|opec|crude|lng|pipeline/.test(text)) category = 'Energy';
      else if (/crypto|bitcoin|btc|ethereum|eth|defi|blockchain/.test(text)) category = 'Crypto';
      else if (/trump|tariff|congress|trade|policy|geopolit|election/.test(text)) category = 'Politics';
      const bullishWords = /surge|rally|gain|jump|beat|record|high|strong|growth|rise|soar/i;
      const bearishWords  = /drop|fall|plunge|decline|miss|low|weak|concern|risk|sell|crash|fear/i;
      const impact = bullishWords.test(a.title) ? 'Bullish' : bearishWords.test(a.title) ? 'Bearish' : 'Neutral';
      return {
        id: a.id,
        source: a.publisher?.name || 'Polygon News',
        category,
        title: a.title,
        summary: (a.description || '').slice(0, 280),
        url: a.article_url,
        publishedAt: a.published_utc,
        tickers: (a.tickers || []).slice(0, 4),
        impact,
      };
    });
  } catch (e) {
    log('[News] Polygon fetch failed:', e.message);
    return [];
  }
}

let newsCache = null;
let newsCacheTime = 0;

async function refreshNews() {
  log('[News] Refreshing news cache...');
  try {
    const [rssArticles, polyArticles] = await Promise.all([
      fetchNewsFromRSS(),
      fetchNewsFromPolygon(),
    ]);
    // Merge, deduplicate by title similarity, sort by date
    const combined = [...polyArticles, ...rssArticles];
    const seen = new Set();
    const deduped = combined.filter(a => {
      const key = a.title.slice(0, 60).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    deduped.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    newsCache = { articles: deduped.slice(0, 60), lastUpdated: new Date().toISOString(), count: deduped.length };
    newsCacheTime = Date.now();
    log(`[News] Cache updated: ${deduped.length} articles`);
  } catch (e) {
    log('[News] Refresh error:', e.message);
  }
}

async function getCachedNews() {
  if (!newsCache || Date.now() - newsCacheTime > NEWS_CACHE_TTL) {
    await refreshNews();
  }
  return newsCache || { articles: [], lastUpdated: null, count: 0 };
}

// Kick off first fetch after server starts, then refresh every hour
setTimeout(() => refreshNews(), 5000);
setInterval(() => refreshNews(), NEWS_CACHE_TTL);

// ─── YouTube Service ─────────────────────────────────────────────────────────
// Pulls a fixed batch of videos per creator. Stored in filesystem cache.
// Never exposes the API key to the frontend.

const YT_CACHE_KEY = 'youtube_videos_v4';
const YT_VIDEOS_PER_CREATOR = 20;
const YT_MIN_DURATION_SEC = 180; // filter out Shorts (≤ 3 min)

// Creator registry — each has a channel handle or known channel ID
const YT_CREATORS = [
  {
    id: 'money-guy',
    name: 'The Money Guy Show',
    channelId: 'UC9vUu4vlIlMC0dHQCTvQPbg',
    handle: '@moneyguyshow',
    hosts: 'Brian Preston CPA CFP & Bo Hanson CFA CFP',
    focus: 'Wealth building, order of operations, and asset protection',
    strategy: 'Their structured 9-step Financial Order of Operations dictates exactly what to do with your next dollar. They cover when to upgrade your insurance — including life, umbrella, and disability — and how to protect a growing family\'s assets.',
    primaryTopics: ['Wealth Building and Financial Planning', 'Insurance Planning'],
    channelUrl: 'https://www.youtube.com/@TheMoneyGuyShow',
  },
  {
    id: 'rob-berger',
    name: 'Rob Berger',
    channelId: 'UC6Dp3WgLrd27mvb6ehpbsLw',
    handle: '@robberger',
    hosts: 'Rob Berger',
    focus: 'Wealth tracking, withdrawal math, and estate longevity',
    strategy: 'A former lawyer who relies heavily on analytical charts and spreadsheets to map out long-term wealth, safe withdrawal rates, and how to structure accounts to transition seamlessly to heirs.',
    primaryTopics: ['Retirement Planning', 'Wealth Building and Financial Planning', 'Estate Planning and Trusts'],
    channelUrl: 'https://www.youtube.com/@rob_berger',
  },
  {
    id: 'plain-bagel',
    name: 'The Plain Bagel',
    channelId: 'UCFCEuCsyWP0YkP3CZ3Mr01Q',
    handle: '@ThePlainBagel',
    hosts: 'Richard Coffin CFA CFP',
    focus: 'Investment mechanics, economic education, and market truth',
    strategy: 'An investment analyst providing calm, objective breakdowns of complex economic concepts. He explains how inflation, market shifts, and different types of investment vehicles truly impact a family\'s wealth.',
    primaryTopics: ['Investing and Market Education', 'Behavioral Finance and Money Psychology'],
    channelUrl: 'https://www.youtube.com/@ThePlainBagel',
  },
  {
    id: 'clearvalue-tax',
    name: 'ClearValue Tax',
    channelId: 'UCigUBIf-zt_DA6xyOQtq2WA',
    handle: '@ClearValueTax',
    hosts: 'Brian Kim CPA',
    focus: 'Fluff-free tax strategies, write-offs, and economic laws',
    strategy: 'Direct, high-impact breakdowns of current tax codes, bracket changes, and deductions. He teaches viewers exactly how to optimize their annual filings to keep more of their earnings.',
    primaryTopics: ['Tax Planning and Strategy'],
    channelUrl: 'https://www.youtube.com/@ClearValueTax',
  },
  {
    id: 'diamond-nestegg',
    name: 'Diamond NestEgg',
    channelId: 'UCnexoc6tvesvcCEzZhmI-Ag',
    handle: '@diamondnestegg',
    hosts: 'Jennifer & Markus Lammer',
    focus: 'Trust setup, wills, probate avoidance, and fixed income',
    strategy: 'This channel specifically masters late-stage wealth preservation. Jennifer details the exact legal documents — like revocable living trusts and powers of attorney — needed to pass assets down without legal friction.',
    primaryTopics: ['Estate Planning and Trusts', 'Retirement Planning'],
    channelUrl: 'https://www.youtube.com/@diamondnestegg',
  },
  {
    id: 'military-money-manual',
    name: 'Military Money Manual',
    channelId: 'UC-X1wcxrZM-sh4-hl1a6yuQ',
    handle: '@MilitaryMoneyManual',
    hosts: 'Spencer Reese',
    focus: 'TSP optimization, military family planning, and veteran wealth',
    strategy: 'Run by service members, they give step-by-step guidance on maximizing the Blended Retirement System (BRS), the Thrift Savings Plan (TSP), and tax-free combat pay.',
    primaryTopics: ['Military and Government Benefits', 'Retirement Planning'],
    channelUrl: 'https://www.youtube.com/@MilitaryMoneyManual',
  },
  {
    id: 'military-to-millionaire',
    name: 'From Military to Millionaire',
    channelId: 'UCQElNqStWjEBDFNVnXkh1ng',
    handle: '@FromMilitarytoMillionaire',
    hosts: 'David Pere',
    focus: 'VA Loans, military real estate investing, and early retirement',
    strategy: 'A Marine veteran who teaches military personnel how to leverage their unique housing benefits — like using VA loan house hacking — to build massive real estate portfolios while serving.',
    primaryTopics: ['Military and Government Benefits', 'Real Estate Investing'],
    channelUrl: 'https://www.youtube.com/@FromMilitarytoMillionaire',
  },
  {
    id: 'ramsey-show',
    name: 'The Ramsey Show',
    channelId: 'UCQGUMLtkv5X-tGc3VDghu9Q',
    handle: '@daveramsey',
    hosts: 'Dave Ramsey & Co-Hosts',
    focus: 'The 7 Baby Steps, debt elimination, and cash-only behavior',
    strategy: 'A live call-in show famous for the Debt Snowball. Dave focuses heavily on the psychological discipline needed to clear consumer debt, build starter security, and pay off a home early.',
    primaryTopics: ['Debt Elimination and Behavioral Change', 'Budgeting and Cash Flow'],
    channelUrl: 'https://www.youtube.com/@TheRamseyShow',
  },
  {
    id: 'caleb-hammer',
    name: 'Caleb Hammer',
    channelId: 'UCLe_q9axMaeTbjN0hy1Z9xA',
    handle: '@CalebHammer',
    hosts: 'Caleb Hammer',
    focus: 'Modern debt extraction, behavioral audits, and lifestyle accountability',
    strategy: 'Caleb conducts raw line-by-line financial audits of real bank statements. He explicitly targets modern financial traps like food delivery apps, high-interest car notes, and Buy Now Pay Later services to force a behavioral pivot.',
    primaryTopics: ['Debt Elimination and Behavioral Change', 'Behavioral Finance and Money Psychology'],
    channelUrl: 'https://www.youtube.com/@CalebHammer',
  },
  {
    id: 'ramit-sethi',
    name: 'Ramit Sethi',
    channelId: 'UC7ZddA__ewP3AtDefjl_tWg',
    handle: '@ramitsethi',
    hosts: 'Ramit Sethi',
    focus: 'Couples finance psychology, automated budgeting, and rich life design',
    strategy: 'Ramit brings real couples onto his show to unpack their psychological money blocks. He replaces restrictive rules with a Conscious Spending Plan so families can spend guilt-free on what they love while automating savings.',
    primaryTopics: ['Behavioral Finance and Money Psychology', 'Budgeting and Cash Flow'],
    channelUrl: 'https://www.youtube.com/@ramitsethi',
  },
  {
    id: 'whiteboard-finance',
    name: 'WhiteBoard Finance',
    channelId: 'UCL_v4tC26PvOFytV1_eEVSg',
    handle: '@WhiteBoardFinance',
    hosts: 'Marko Zlatic',
    focus: 'Whiteboard math tutorials, real estate cash flow, and side hustles',
    strategy: 'Marko physically draws out financial equations on a whiteboard, providing clear tutorials on how to calculate rental property cash flow, analyze car loans, and build foundational capital.',
    primaryTopics: ['Real Estate Investing', 'Budgeting and Cash Flow', 'Investing and Market Education'],
    channelUrl: 'https://www.youtube.com/@WhiteBoardFinance',
  },
  {
    id: 'humphrey-yang',
    name: 'Humphrey Yang',
    channelId: 'UCsvIZLbGmbpCMuobt-eXNYg',
    handle: '@humphreytalks',
    hosts: 'Humphrey Yang',
    focus: 'Simplified money concepts, daily habits, and financial tool comparisons',
    strategy: 'Humphrey uses creative visual sketches to make abstract financial topics accessible, helping viewers handle everyday tasks like comparing term vs whole life insurance or picking high-yield savings accounts.',
    primaryTopics: ['Budgeting and Cash Flow', 'Insurance Planning', 'Investing and Market Education'],
    channelUrl: 'https://www.youtube.com/@humphreytalks',
  },
  {
    id: 'financial-diet',
    name: 'The Financial Diet',
    channelId: 'UCSPYNpQ2fHv9HJ-q6MIMaPw',
    handle: '@thefinancialdiet',
    hosts: 'Chelsea Fagan',
    focus: 'Societal money habits, family financial costs, and lifestyle boundaries',
    strategy: 'Focuses heavily on the social and cultural side of personal finance, breaking down the true financial impact of major milestones like weddings, having children, and managing career changes.',
    primaryTopics: ['Behavioral Finance and Money Psychology', 'Budgeting and Cash Flow'],
    channelUrl: 'https://www.youtube.com/@thefinancialdiet',
  },
  {
    id: 'budgetnista',
    name: 'The Budgetnista',
    channelId: 'UC2aUoo1-y4RjERy5wzsW2oQ',
    handle: '@budgetnista',
    hosts: 'Tiffany Aliche',
    focus: 'Financial wholeness, automated family budgeting, and credit repair',
    strategy: 'Tiffany provides highly empathetic, actionable toolkits for getting out of debt, building foundational credit scores, and implementing automated systems to ensure household financial security.',
    primaryTopics: ['Budgeting and Cash Flow', 'Debt Elimination and Behavioral Change'],
    channelUrl: 'https://www.youtube.com/@TheBudgetnista',
  },
  {
    id: 'graham-stephan',
    name: 'Graham Stephan',
    channelId: 'UCV6KDgJskWaEckne5aPA0aQ',
    handle: '@GrahamStephan',
    hosts: 'Graham Stephan',
    focus: 'Real estate mastery, credit optimization, and economic reactions',
    strategy: 'Built his channel on the literal math of purchasing real estate, maximizing credit card reward points safely, and reacting immediately to shifting economic news that affects day-to-day investing.',
    primaryTopics: ['Real Estate Investing', 'Investing and Market Education', 'Budgeting and Cash Flow'],
    channelUrl: 'https://www.youtube.com/@GrahamStephan',
  },
];

// Keyword maps for auto-topic classification
const TOPIC_KEYWORDS = {
  'Tax Planning and Strategy': [
    'tax', 'taxes', 'deduction', 'write off', 'write-off', 'irs', '1099', 'w-2', 'bracket', 'roth conversion',
    'backdoor roth', 'capital gains', 'audit', 'tax loss', 'tax alpha', 'tax efficient', 'estate tax',
    'gift tax', 'qbi', 'self-employed tax', 's-corp', 'llc tax', 'depreciation', 'tax free',
  ],
  'Estate Planning and Trusts': [
    'estate', 'trust', 'probate', 'will ', 'wills', 'beneficiary', 'inheritance', 'power of attorney',
    'revocable', 'irrevocable', 'living trust', 'estate plan', 'heir', 'legacy', 'intestate',
    'executor', 'guardianship', 'pour-over', 'dynasty trust',
  ],
  'Retirement Planning': [
    'retirement', 'retire', ' ira', 'roth ira', '401k', '401(k)', '403b', 'pension', 'social security',
    'rmd', 'required minimum', 'withdrawal rate', 'sequence of returns', 'safe withdrawal',
    '4% rule', 'annuity', 'nest egg', 'early retirement', 'fire movement',
  ],
  'Military and Government Benefits': [
    'military', 'veteran', 'va loan', ' tsp', 'blended retirement', 'brs', 'gi bill', 'tricare',
    'active duty', 'service member', 'national guard', 'reserves', 'combat pay', 'bah', 'bas',
    'military housing', 'military pay', 'vet', 'armed forces',
  ],
  'Debt Elimination and Behavioral Change': [
    'debt', 'pay off', 'snowball', 'avalanche', 'student loan', 'credit card debt', 'bnpl',
    'buy now pay later', 'loan', 'interest rate debt', 'debt free', 'payoff', 'minimum payment',
    'collection', 'bankruptcy', 'financial audit', 'car loan', 'auto loan',
  ],
  'Budgeting and Cash Flow': [
    'budget', 'budgeting', 'spending', 'cash flow', 'emergency fund', 'savings account', 'paycheck',
    'expense', 'bills', 'frugal', 'cost of living', 'high yield savings', 'hysa', 'zero based',
    'conscious spending', 'money management', 'subscription', 'food delivery',
  ],
  'Real Estate Investing': [
    'real estate', 'rental', 'house hack', 'property', 'mortgage', 'airbnb', 'landlord',
    'cap rate', 'cash on cash', 'duplex', 'multifamily', 'rei', 'flip', 'brrrr', 'reit',
    'house hacking', 'rental income', 'investment property', 'real estate portfolio',
  ],
  'Insurance Planning': [
    'insurance', 'life insurance', 'term life', 'whole life', 'disability insurance', 'umbrella policy',
    'coverage', 'premium', 'deductible', 'health insurance', 'ltc', 'long term care',
    'annuity', 'indexed universal life', 'iul',
  ],
  'Investing and Market Education': [
    'invest', 'stock', 'index fund', 'etf', 'portfolio', 'market', 'dividend', 'compound interest',
    'dollar cost', 'diversif', 'asset allocation', 'rebalance', 's&p 500', 'nasdaq', 'bond',
    'mutual fund', 'brokerage', 'vanguard', 'fidelity', 'yield curve', 'recession', 'inflation',
  ],
  'Behavioral Finance and Money Psychology': [
    'psychology', 'behavior', 'emotion', 'mindset', 'money relationship', 'fear', 'greed',
    'loss aversion', 'bias', 'money trauma', 'spending habit', 'guilt', 'abundance',
    'rich life', 'money blocks', 'financial therapy', 'lifestyle inflation',
  ],
  'Wealth Building and Financial Planning': [
    'wealth', 'net worth', 'financial plan', 'financial independence', 'passive income',
    'millionaire', 'financial order', 'first dollar', 'financial goal', 'wealth building',
    'financial advisor', 'fiduciary', 'fee only', 'asset protection',
  ],
};

function classifyVideoTopic(title, description, creatorPrimaryTopics) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  const scores = {};

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    scores[topic] = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) scores[topic]++;
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (best[0][1] > 0) return best[0][0];

  // Fallback: creator's primary topic
  return creatorPrimaryTopics[0] || 'Wealth Building and Financial Planning';
}

// Resolve @handle → channelId via YouTube API
async function ytResolveChannelId(handle, apiKey) {
  // Try forHandle lookup first
  const handleClean = handle.replace('@', '');
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${encodeURIComponent(handleClean)}&key=${apiKey}`;
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) throw new Error(`YouTube channels API error: ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error(`No channel found for handle: ${handle}`);
  return { channelId: item.id, title: item.snippet?.title };
}

// Get uploads playlist ID + channel avatar from channelId (single API call)
async function ytGetChannelInfo(channelId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${apiKey}`;
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) throw new Error(`YouTube channels API error: ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  const uploads = item?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error(`No uploads playlist for channel: ${channelId}`);
  const thumbs = item?.snippet?.thumbnails || {};
  const avatar = thumbs.medium?.url || thumbs.default?.url || null;
  return { playlistId: uploads, avatar };
}

// Parse ISO 8601 duration string → total seconds (e.g. "PT12M34S" → 754)
function parseIsoDuration(iso = '') {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

// Fetch contentDetails for a batch of videoIds and return a map { videoId → durationSec }
async function ytGetDurations(videoIds, apiKey) {
  const durations = {};
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50).join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch}&key=${apiKey}`;
    try {
      const res = await fetchWithTimeout(url, {}, 10000);
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of (data.items || [])) {
        durations[item.id] = parseIsoDuration(item.contentDetails?.duration);
      }
    } catch (e) {
      log('[YouTube] duration fetch error:', e.message);
    }
  }
  return durations;
}

// Pull videos from uploads playlist (1 quota unit per page)
async function ytFetchPlaylistVideos(playlistId, maxResults, apiKey) {
  const videos = [];
  let pageToken = '';
  const perPage = Math.min(maxResults, 50);

  while (videos.length < maxResults) {
    const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${perPage}${tokenParam}&key=${apiKey}`;
    const res = await fetchWithTimeout(url, {}, 10000);
    if (!res.ok) break;
    const data = await res.json();
    for (const item of (data.items || [])) {
      const sn = item.snippet;
      if (!sn?.resourceId?.videoId) continue;
      if (sn.title === 'Private video' || sn.title === 'Deleted video') continue;
      videos.push({
        videoId: sn.resourceId.videoId,
        title: sn.title,
        description: (sn.description || '').slice(0, 300),
        thumbnail: sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || '',
        publishedAt: sn.publishedAt,
      });
      if (videos.length >= maxResults) break;
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken || videos.length >= maxResults) break;
  }
  return videos;
}

// Main refresh — pulls all creators and stores to cache
async function ytRefreshAllCreators() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  const results = {};
  const errors = [];

  for (const creator of YT_CREATORS) {
    try {
      log(`[YouTube] pulling ${creator.name}...`);
      const channelId = creator.channelId || (await ytResolveChannelId(creator.handle, apiKey)).channelId;
      const { playlistId, avatar } = await ytGetChannelInfo(channelId, apiKey);

      // Fetch 2× target so we still get enough after filtering out Shorts
      const rawVideos = await ytFetchPlaylistVideos(playlistId, YT_VIDEOS_PER_CREATOR * 2, apiKey);

      // Filter out Shorts by duration
      const durations = await ytGetDurations(rawVideos.map(v => v.videoId), apiKey);
      const longVideos = rawVideos.filter(v => {
        const dur = durations[v.videoId];
        if (dur === undefined) return true; // keep if duration unknown
        return dur >= YT_MIN_DURATION_SEC;
      });

      const videos = longVideos.slice(0, YT_VIDEOS_PER_CREATOR).map(v => ({
        ...v,
        creatorId: creator.id,
        creatorName: creator.name,
        topic: classifyVideoTopic(v.title, v.description, creator.primaryTopics),
        durationSec: durations[v.videoId] ?? null,
      }));

      results[creator.id] = { creator: { ...creator, avatar }, videos, pulledAt: new Date().toISOString() };
      log(`[YouTube] ${creator.name}: ${videos.length} long-form videos (${rawVideos.length - longVideos.length} Shorts filtered)`);
    } catch (e) {
      log(`[YouTube] ERROR for ${creator.name}:`, e.message);
      errors.push({ creatorId: creator.id, error: e.message });
    }
    // Small delay to be kind to the API
    await new Promise(r => setTimeout(r, 300));
  }

  const payload = { creators: results, errors, refreshedAt: new Date().toISOString() };
  writeCache(YT_CACHE_KEY, payload);
  return payload;
}

// Return stored videos (refresh only if never pulled)
async function handleYouTubeVideos() {
  // Use a very long TTL — 30 days — since this is pull-once-store
  const cached = readCache(YT_CACHE_KEY, 30 * 24 * 60 * 60 * 1000);
  if (cached) return cached;
  // If no data yet, return empty so frontend can show empty state
  return { creators: {}, errors: [], refreshedAt: null, notYetPulled: true };
}

// Manual refresh endpoint
async function handleYouTubeRefresh() {
  return ytRefreshAllCreators();
}

// Return creator metadata only (no API needed)
function handleYouTubeCreators() {
  return { creators: YT_CREATORS };
}

// ─── HTTP Server ─────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const ip = getIP(req);

  // AI endpoint — strict limit: 20 requests per hour per IP
  if (path === '/api/planora-ai') {
    if (isRateLimited(ip, aiLimitMap, 20, 60 * 60 * 1000)) {
      return sendJSON(res, { error: 'AI rate limit exceeded. Please try again later.' }, 429);
    }
  }

  // General API rate limit: 120 requests per minute per IP
  if (path.startsWith('/api/') || path.startsWith('/functions/')) {
    if (isRateLimited(ip, rateLimitMap, 120, 60 * 1000)) {
      return sendJSON(res, { error: 'Rate limit exceeded. Please slow down.' }, 429);
    }
  }

  // ── Existing POST routes ────────────────────────────────────────────────────

  if (req.method === 'POST' && path === '/integrations/llm') {
    try {
      const params = await readBody(req);
      const result = await invokeLLM(params);
      return sendJSON(res, result);
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'POST' && path.startsWith('/functions/')) {
    const fnName = path.replace('/functions/', '').split('/')[0];
    const handler = HANDLERS[fnName];
    if (!handler) {
      return sendJSON(res, { error: `Unknown function: ${fnName}` }, 404);
    }
    try {
      const params = await readBody(req);
      log(`[${fnName}]`, JSON.stringify(params).slice(0, 100));
      const result = await handler(params);
      return sendJSON(res, result);
    } catch (err) {
      console.error(`[${fnName}] Error:`, err.message);
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  // ── New GET routes ──────────────────────────────────────────────────────────

  if (req.method === 'GET' && path === '/api/indices') {
    try {
      return sendJSON(res, await handleIndices());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path.startsWith('/api/fred/') && path !== '/api/fred-multiple') {
    const seriesId = path.replace('/api/fred/', '').split('/')[0];
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 2000);
    try {
      return sendJSON(res, await handleFredSeries(seriesId, limit));
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/fred-multiple') {
    const seriesParam = url.searchParams.get('series');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 2000);
    try {
      return sendJSON(res, await handleFredMultiple(seriesParam, limit));
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/eia-state-gas') {
    try {
      return sendJSON(res, await handleEiaStateGas());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path.startsWith('/api/av-monthly/')) {
    const ticker = path.replace('/api/av-monthly/', '').split('/')[0].toUpperCase();
    try {
      const avKey = process.env.VITE_ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY;
      if (!avKey) return sendJSON(res, { error: 'Missing Alpha Vantage API key' }, 500);
      const cacheK = `av_monthly_${ticker}`;
      const cached = readCache(cacheK, 24 * 60 * 60 * 1000);
      if (cached) return sendJSON(res, cached);
      const avUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${ticker}&apikey=${avKey}`;
      const avRes = await fetchWithTimeout(avUrl, {}, 15000);
      const json = await avRes.json();
      if (json['Note'] || json['Information']) return sendJSON(res, { error: 'rate_limit' }, 429);
      const series = json['Monthly Adjusted Time Series'];
      if (!series) return sendJSON(res, { error: 'not_found' }, 404);
      const data = Object.entries(series)
        .map(([date, v]) => ({ date, close: parseFloat(v['5. adjusted close']) }))
        .filter(d => !isNaN(d.close))
        .sort((a, b) => a.date.localeCompare(b.date));
      const result = { ticker, data };
      writeCache(cacheK, result);
      return sendJSON(res, result);
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/bls') {
    const seriesIdsParam = url.searchParams.get('seriesIds');
    try {
      return sendJSON(res, await handleBls(seriesIdsParam));
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path.startsWith('/api/eia/')) {
    const route = path.replace('/api/eia/', '');
    try {
      return sendJSON(res, await handleEia(route));
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/market/breadth') {
    try {
      return sendJSON(res, await handleMarketBreadth());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/market/movers') {
    try {
      return sendJSON(res, await handleMarketMovers());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/economic-calendar') {
    try {
      return sendJSON(res, await handleEconomicCalendar());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/sector/heatmap') {
    try {
      return sendJSON(res, await handleSectorHeatmap());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/watchlist/quote') {
    const symbolsParam = url.searchParams.get('symbols');
    try {
      return sendJSON(res, await handleWatchlistQuote(symbolsParam));
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  // ── YouTube routes ──────────────────────────────────────────────────────────

  if (req.method === 'GET' && path === '/api/youtube/videos') {
    try {
      return sendJSON(res, await handleYouTubeVideos());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/youtube/creators') {
    try {
      return sendJSON(res, handleYouTubeCreators());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'POST' && path === '/api/youtube/refresh') {
    try {
      log('[YouTube] Manual refresh triggered');
      const result = await handleYouTubeRefresh();
      const summary = { refreshedAt: result.refreshedAt, creatorCount: Object.keys(result.creators).length, errors: result.errors };
      return sendJSON(res, summary);
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'GET' && path === '/api/news') {
    try {
      return sendJSON(res, await getCachedNews());
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  if (req.method === 'POST' && path === '/api/planora-ai') {
    try {
      const body = await readBody(req);
      const { messages } = body;
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey || apiKey === 'your-groq-api-key-here') {
        return sendJSON(res, { error: 'GROQ_API_KEY not configured. Get a free key at console.groq.com' }, 500);
      }

      // ── Build live market context ──────────────────────────────────────────
      const fredKey = process.env.VITE_FRED_API_KEY;
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      let liveContext = `## Live Market Snapshot — ${today}\n\n`;

      try {
        const fredSeries = [
          { id: 'FEDFUNDS', label: 'Federal Funds Rate', suffix: '%' },
          { id: 'UNRATE',   label: 'Unemployment Rate',  suffix: '%' },
          { id: 'DGS10',    label: '10-Year Treasury Yield', suffix: '%' },
          { id: 'DGS2',     label: '2-Year Treasury Yield',  suffix: '%' },
          { id: 'T10Y2Y',   label: '10Y-2Y Yield Spread',    suffix: '%' },
          { id: 'MORTGAGE30US', label: '30-Year Mortgage Rate', suffix: '%' },
        ];
        const fredResults = await Promise.allSettled(fredSeries.map(async ({ id }) => {
          const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${fredKey}&sort_order=desc&limit=2&file_type=json`;
          const r = await fetchWithTimeout(url, {}, 6000);
          const j = await r.json();
          const obs = (j.observations || []).filter(o => o.value !== '.');
          return { id, value: parseFloat(obs[0]?.value), date: obs[0]?.date, prev: parseFloat(obs[1]?.value) };
        }));

        // CPI YoY separately (needs 13 obs)
        let cpiYoY = null;
        try {
          const cpiUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${fredKey}&sort_order=desc&limit=13&file_type=json`;
          const cr = await fetchWithTimeout(cpiUrl, {}, 6000);
          const cj = await cr.json();
          const cobs = (cj.observations || []).filter(o => o.value !== '.');
          if (cobs.length >= 13) {
            const cur = parseFloat(cobs[0].value), ago = parseFloat(cobs[12].value);
            cpiYoY = ((cur - ago) / ago * 100).toFixed(2);
          }
        } catch {}

        liveContext += '**Macro Indicators:**\n';
        if (cpiYoY) liveContext += `- CPI Inflation (YoY): ${cpiYoY}%\n`;
        for (const r of fredResults) {
          if (r.status === 'fulfilled' && !isNaN(r.value?.value)) {
            const { id, value, date, prev } = r.value;
            const meta = fredSeries.find(s => s.id === id);
            const chg = prev && !isNaN(prev) ? ` (${value >= prev ? '+' : ''}${(value - prev).toFixed(2)}% vs prior)` : '';
            liveContext += `- ${meta.label}: ${value}${meta.suffix}${chg} — as of ${date}\n`;
          }
        }
      } catch {}

      // Polygon index levels
      try {
        const idxSnap = await polyIndexSnapshot(['I:SPX', 'I:DJI', 'I:COMP', 'I:VIX']);
        const names = { 'I:SPX': 'S&P 500', 'I:DJI': 'Dow Jones', 'I:COMP': 'NASDAQ Composite', 'I:VIX': 'VIX (Fear Index)' };
        liveContext += '\n**Market Levels:**\n';
        for (const [k, t] of Object.entries(idxSnap)) {
          const val = t.value ?? t.session?.close;
          const chg = t.session?.change_percent ?? t.todaysChangePerc;
          if (val) liveContext += `- ${names[k] || k}: ${val.toLocaleString()} (${chg != null ? (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%' : 'N/A'})\n`;
        }
      } catch {}

      // EIA gas price
      try {
        const eiaKey = process.env.VITE_EIA_API_KEY;
        if (eiaKey) {
          const gasUrl = `https://api.eia.gov/v2/seriesid/PET.EMM_EPMR_PTE_NUS_DPG.W?api_key=${eiaKey}&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1`;
          const gr = await fetchWithTimeout(gasUrl, {}, 6000);
          const gj = await gr.json();
          const gasVal = gj.response?.data?.[0]?.value;
          if (gasVal) liveContext += `\n**Energy:**\n- National Avg Regular Gas: $${parseFloat(gasVal).toFixed(2)}/gallon\n`;
        }
      } catch {}

      liveContext += '\n---\n';

      // ── Ticker detection: scan last user message for stock symbols ─────────
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
      // Match $AAPL, AAPL, "Apple stock", explicit tickers 2-5 uppercase letters
      const tickerMatches = [
        ...lastUserMsg.matchAll(/\$([A-Z]{1,5})\b/g),
        ...lastUserMsg.matchAll(/\b([A-Z]{2,5})\b(?=\s*(stock|shares|equity|price|ticker|chart|earnings|revenue|PE|analysis|valuation))/gi),
      ].map(m => m[1].toUpperCase());
      // Also check for known company name → ticker mappings
      const NAME_MAP = {
        'apple': 'AAPL', 'microsoft': 'MSFT', 'google': 'GOOGL', 'alphabet': 'GOOGL',
        'amazon': 'AMZN', 'tesla': 'TSLA', 'nvidia': 'NVDA', 'meta': 'META',
        'facebook': 'META', 'netflix': 'NFLX', 'berkshire': 'BRK.B', 'jpmorgan': 'JPM',
        'jp morgan': 'JPM', 'goldman': 'GS', 'goldman sachs': 'GS', 'blackrock': 'BLK',
        'visa': 'V', 'mastercard': 'MA', 'exxon': 'XOM', 'chevron': 'CVX',
        'johnson': 'JNJ', 'walmart': 'WMT', 'disney': 'DIS', 'boeing': 'BA',
        'ford': 'F', 'gm': 'GM', 'general motors': 'GM', 'palantir': 'PLTR',
        'coinbase': 'COIN', 'robinhood': 'HOOD', 'uber': 'UBER', 'airbnb': 'ABNB',
        'spotify': 'SPOT', 'snap': 'SNAP', 'twitter': 'X', 'salesforce': 'CRM',
        'intel': 'INTC', 'amd': 'AMD', 'qualcomm': 'QCOM', 'broadcom': 'AVGO',
      };
      const lowerMsg = lastUserMsg.toLowerCase();
      for (const [name, ticker] of Object.entries(NAME_MAP)) {
        if (lowerMsg.includes(name)) tickerMatches.push(ticker);
      }
      const uniqueTickers = [...new Set(tickerMatches)].slice(0, 3); // max 3 tickers

      // Blocklist — common words that look like tickers
      const BLOCKLIST = new Set(['I','A','IT','AT','IN','BE','OR','US','BY','IS','IF','TO','DO','SO','AS','AN','ON','NO','UP','GO','AI','PE','IPO','ETF','GDP','CPI','FED','SEC','IRS','FDA','CEO','CFO','IPO','YOY','MOM','QOQ','YTD','TTM','EPS','ROE','DCF','NAV']);
      const filteredTickers = uniqueTickers.filter(t => !BLOCKLIST.has(t) && t.length >= 2);

      if (filteredTickers.length > 0) {
        try {
          const tickerData = await Promise.allSettled(filteredTickers.map(async ticker => {
            const [snap, details] = await Promise.all([
              polySnapshot([ticker]).catch(() => ({})),
              polyTickerDetails(ticker).catch(() => null),
            ]);
            const s = snap[ticker];
            const price = s?.day?.c ?? s?.lastTrade?.p;
            const prevClose = s?.prevDay?.c;
            const changePct = price && prevClose ? ((price - prevClose) / prevClose * 100) : null;
            const high52 = null, low52 = null; // would need aggs for this

            // AV OVERVIEW for fundamentals (cached)
            const avKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;
            let overview = {};
            if (avKey) {
              try {
                const ovCk = `av_overview_${ticker}`;
                let j = readCache(ovCk, INCOME_TTL);
                if (!j) {
                  const r = await fetchWithTimeout(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${avKey}`, {}, 8000);
                  j = await r.json();
                  if (j?.Symbol && !j.Information) writeCache(ovCk, j);
                }
                if (j?.Symbol && !j.Information) overview = j;
              } catch {}
            }

            return {
              ticker,
              name: details?.name || overview.Name || ticker,
              price: price ? parseFloat(price.toFixed(2)) : null,
              changePct: changePct ? parseFloat(changePct.toFixed(2)) : null,
              marketCap: details?.market_cap || (overview.MarketCapitalization ? parseInt(overview.MarketCapitalization) : null),
              pe: overview.TrailingPE && overview.TrailingPE !== 'None' ? parseFloat(overview.TrailingPE) : null,
              eps: overview.EPS && overview.EPS !== 'None' ? parseFloat(overview.EPS) : null,
              sector: overview.Sector && overview.Sector !== 'None' ? overview.Sector : details?.sic_description,
              industry: overview.Industry && overview.Industry !== 'None' ? overview.Industry : null,
              description: overview.Description || details?.description,
              dividendYield: overview.DividendYield && overview.DividendYield !== 'None' ? (parseFloat(overview.DividendYield) * 100).toFixed(2) : null,
              beta: overview.Beta && overview.Beta !== 'None' ? parseFloat(overview.Beta) : null,
              analystTarget: overview.AnalystTargetPrice && overview.AnalystTargetPrice !== 'None' ? parseFloat(overview.AnalystTargetPrice) : null,
              week52High: overview['52WeekHigh'] && overview['52WeekHigh'] !== 'None' ? parseFloat(overview['52WeekHigh']) : null,
              week52Low: overview['52WeekLow'] && overview['52WeekLow'] !== 'None' ? parseFloat(overview['52WeekLow']) : null,
            };
          }));

          const validTickers = tickerData.filter(r => r.status === 'fulfilled' && r.value.price).map(r => r.value);
          if (validTickers.length > 0) {
            liveContext += '\n## Live Stock Data (fetched for this conversation)\n\n';
            for (const t of validTickers) {
              liveContext += `**${t.ticker} — ${t.name}**\n`;
              if (t.price) liveContext += `- Current Price: $${t.price}${t.changePct != null ? ` (${t.changePct >= 0 ? '+' : ''}${t.changePct}% today)` : ''}\n`;
              if (t.marketCap) liveContext += `- Market Cap: ${t.marketCap >= 1e12 ? '$' + (t.marketCap/1e12).toFixed(2) + 'T' : t.marketCap >= 1e9 ? '$' + (t.marketCap/1e9).toFixed(2) + 'B' : '$' + t.marketCap.toLocaleString()}\n`;
              if (t.pe) liveContext += `- Trailing P/E: ${t.pe}\n`;
              if (t.eps) liveContext += `- EPS (TTM): $${t.eps}\n`;
              if (t.beta) liveContext += `- Beta: ${t.beta}\n`;
              if (t.dividendYield) liveContext += `- Dividend Yield: ${t.dividendYield}%\n`;
              if (t.week52High) liveContext += `- 52-Week High: $${t.week52High}\n`;
              if (t.week52Low) liveContext += `- 52-Week Low: $${t.week52Low}\n`;
              if (t.analystTarget) liveContext += `- Analyst Price Target: $${t.analystTarget}\n`;
              if (t.sector) liveContext += `- Sector: ${t.sector}${t.industry ? ' / ' + t.industry : ''}\n`;
              if (t.description) liveContext += `- About: ${t.description.slice(0, 300)}...\n`;
              liveContext += '\n';
            }
            liveContext += '---\n';
          }
        } catch (e) {
          log('[planora-ai] ticker enrichment error:', e.message);
        }
      }

      const systemPrompt = `You are Planora AI — the world's most comprehensive financial intelligence assistant, combining the analytical depth of a Bloomberg Terminal with the strategic thinking of a BlackRock portfolio manager and the accessibility of a world-class CFP financial advisor.

You have mastery-level expertise in:
- Global equities, fixed income, commodities, derivatives, forex, and cryptocurrency markets
- Federal Reserve monetary policy, FOMC decisions, and global central banking dynamics
- Macroeconomic analysis: GDP, inflation, employment, yield curves, credit spreads
- Portfolio construction, factor investing, risk management, Modern Portfolio Theory, and asset allocation
- Financial planning: retirement (401k, IRA, Roth conversions), tax-loss harvesting, estate planning, insurance needs analysis, debt payoff strategies, and budgeting frameworks
- Corporate finance and equity valuation: DCF, comparable company analysis, EV/EBITDA, P/E, growth vs. value frameworks
- Geopolitical analysis and its precise correlation to financial markets and sector rotation
- Technical analysis, market microstructure, and options concepts
- Real estate investing, REITs, alternative investments, and private markets
- Behavioral finance and investor psychology

Your communication style:
- Think and respond like a senior analyst at Goldman Sachs or a portfolio manager at BlackRock — direct, evidence-based, and insightful
- For everyday users: translate complex concepts into clear, actionable frameworks using real-world analogies
- For sophisticated users: go deep with technical precision when the question warrants it
- Always connect macro events to their downstream market and portfolio implications
- Acknowledge uncertainty honestly — markets are probabilistic, not deterministic
- Provide structured frameworks and mental models, not just information
- You are an educational tool — provide financial education and frameworks, not personalized investment advice

${liveContext}

Use the live data above to ground your analysis in current market reality. When discussing rates, inflation, or market levels, reference the actual numbers above.`;

      // Stream response from Groq (free tier — llama-3.3-70b-versatile)
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 4096,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!groqRes.ok) {
        const err = await groqRes.text();
        res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
        return res.end();
      }

      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text = json.choices?.[0]?.delta?.content;
            if (text) {
              // Re-emit in Anthropic SSE format so the frontend needs no changes
              res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`);
            }
          } catch {}
        }
      }
      return res.end();
    } catch (err) {
      if (!res.headersSent) return sendJSON(res, { error: err.message }, 500);
      return res.end();
    }
  }

  if (req.method === 'POST' && path === '/api/generate-report') {
    try {
      const body = await readBody(req);
      const { systemPrompt, userMessage } = body;
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
        return sendJSON(res, { error: 'ANTHROPIC_API_KEY not configured. Add your key to .env file.' }, 500);
      }
      const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      }, 90000);
      if (!response.ok) {
        const errText = await response.text();
        return sendJSON(res, { error: `Anthropic API error ${response.status}: ${errText}` }, 500);
      }
      const data = await response.json();
      return sendJSON(res, { content: data.content[0].text });
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  // ── Static file serving (React frontend) ────────────────────────────────────
  const __dirnameStatic = fileURLToPath(new URL('.', import.meta.url));
  const distPath = path.join(__dirnameStatic, '../dist');
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(distPath, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distPath, 'index.html');
  }
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json' };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    return res.end(fs.readFileSync(filePath));
  }

  // ── 404 fallback ────────────────────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  return res.end(JSON.stringify({ error: 'Not found' }));
});

// Load .env variables manually (no dotenv dependency needed)
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const envPath = resolve(__dirname, '../.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
  log('Loaded .env file');
} catch (e) {
  console.warn('Could not load .env:', e.message);
}

server.listen(PORT, "0.0.0.0", () => {
  log(`Local backend running at http://localhost:${PORT}`);
  log('Available functions:', Object.keys(HANDLERS).join(', '));
  log('Available GET routes: /api/indices, /api/fred/:seriesId, /api/fred-multiple, /api/bls, /api/eia/:route, /api/market/breadth, /api/market/movers, /api/economic-calendar, /api/sector/heatmap, /api/watchlist/quote, /api/news');
});
