#!/usr/bin/env node
/**
 * Tweet one stock at a time from the live Jupiter API.
 * Tracks progress in .tweet-all-state.json.
 * Usage: node tweet-all-stocks.js [--dry-run] [--reset]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STATE_FILE = path.join(__dirname, '..', '.tweet-all-state.json');
const CREDS = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.credentials/x-stocksonsolana.json'), 'utf-8'));
const DRY_RUN = process.argv.includes('--dry-run');
const RESET = process.argv.includes('--reset');

const PROVIDERS = [
  { key: 'xstocks', label: 'xStocks' },
  { key: 'ondo', label: 'Ondo' },
  { key: 'prestocks', label: 'PreStocks' },
];

async function fetchAllTokens() {
  const all = [];
  for (const { key, label } of PROVIDERS) {
    let offset = 0;
    while (true) {
      const url = `https://datapi.jup.ag/v2/assets/stocks/24h?stocks=${key}&offset=${offset}&includeOndoStatus=false`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`datapi ${key} returned ${res.status}`);
      const data = await res.json();
      const page = data.assets || [];
      for (const a of page) {
        all.push({
          symbol: a.symbol || a.id,
          name: a.name || a.symbol,
          mint: a.id || a.mint,
          provider: label,
          price: a.usdPrice,
          mcap: a.mcap,
          holders: a.holderCount,
        });
      }
      if (page.length < 50) break;
      offset += 50;
    }
  }
  return all;
}

function loadState() {
  if (RESET) return { tweeted: [], tweetedMints: [] };
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); }
  catch { return { tweeted: [], tweetedMints: [] }; }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// OAuth 1.0a
function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function oauthSign(method, url, params, cs, ts) {
  const sorted = Object.keys(params).sort().map(k => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&');
  const base = `${method}&${percentEncode(url)}&${percentEncode(sorted)}`;
  return crypto.createHmac('sha1', `${percentEncode(cs)}&${percentEncode(ts)}`).update(base).digest('base64');
}

function makeAuth(method, url) {
  const p = {
    oauth_consumer_key: CREDS.consumer_key,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: CREDS.access_token,
    oauth_version: '1.0',
  };
  p.oauth_signature = oauthSign(method, url, p, CREDS.consumer_secret, CREDS.access_token_secret);
  return 'OAuth ' + Object.keys(p).sort().map(k => `${percentEncode(k)}="${percentEncode(p[k])}"`).join(', ');
}

async function postToX(text) {
  const url = 'https://api.x.com/2/tweets';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': makeAuth('POST', url), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (data.data?.id) {
    console.log(`[X] https://x.com/StocksOnSolana/status/${data.data.id}`);
    return data.data.id;
  } else {
    console.error('[X] Failed:', JSON.stringify(data));
    return null;
  }
}

function formatPrice(p) {
  if (!p) return '';
  if (p >= 1000) return `$${(p / 1000).toFixed(1)}K`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

function formatMcap(m) {
  if (!m) return '';
  if (m >= 1e9) return `$${(m / 1e9).toFixed(1)}B`;
  if (m >= 1e6) return `$${(m / 1e6).toFixed(1)}M`;
  return `$${(m / 1e3).toFixed(0)}K`;
}

async function main() {
  const tokens = await fetchAllTokens();
  const state = loadState();
  const tweetedSet = new Set(state.tweetedMints || []);

  // Find next untweeted token
  const next = tokens.find(t => !tweetedSet.has(t.mint));
  if (!next) {
    console.log(`[DONE] All ${tokens.length} stocks tweeted.`);
    return;
  }

  const remaining = tokens.filter(t => !tweetedSet.has(t.mint)).length;
  const slug = next.symbol.toLowerCase();
  const priceStr = next.price ? `\n💰 ${formatPrice(next.price)}` : '';
  const mcapStr = next.mcap ? ` | MCap: ${formatMcap(next.mcap)}` : '';
  const holdersStr = next.holders ? ` | ${next.holders.toLocaleString()} holders` : '';

  const tweet = `${next.name} ($${next.symbol}) is now a tokenized stock on Solana via ${next.provider}${priceStr}${mcapStr}${holdersStr}\n\nhttps://stocksonsolana.com/${slug}`;

  console.log(`[${state.tweeted.length + 1}/${tokens.length}] ${next.symbol} — ${next.name} (${remaining} remaining)`);

  if (DRY_RUN) {
    console.log('[DRY RUN]', tweet);
  } else {
    const id = await postToX(tweet);
    if (id) {
      state.tweeted.push({ symbol: next.symbol, mint: next.mint, tweetId: id, at: new Date().toISOString() });
      if (!state.tweetedMints) state.tweetedMints = [];
      state.tweetedMints.push(next.mint);
      saveState(state);
      console.log(`[OK] ${state.tweeted.length}/${tokens.length} done`);
    } else {
      console.error('[SKIP] Rate limited or error — will retry next run');
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
