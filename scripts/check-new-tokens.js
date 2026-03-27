#!/usr/bin/env node
/**
 * Check for new tokenized stocks on Solana via Jupiter datapi.
 * Compares against saved state, alerts on new tokens.
 * Usage: node check-new-tokens.js [--dry-run] [--post-x]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_FILE = path.join(__dirname, '..', '.new-tokens-state.json');
const DATAPI_BASE = 'https://datapi.jup.ag/v2/assets/stocks/24h';
const PROVIDERS = [
  { key: 'xstocks', provider: 'xStocks' },
  { key: 'ondo', provider: 'Ondo' },
  { key: 'prestocks', provider: 'PreStocks' },
];
const PAGE_SIZE = 50;

const DRY_RUN = process.argv.includes('--dry-run');
const POST_X = process.argv.includes('--post-x');

async function fetchScreener(key) {
  const assets = [];
  let offset = 0;
  while (true) {
    const url = `${DATAPI_BASE}?stocks=${key}&offset=${offset}&includeOndoStatus=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`datapi ${key} returned ${res.status}`);
    const data = await res.json();
    const page = data.assets || [];
    assets.push(...page);
    if (page.length < PAGE_SIZE || assets.length >= (data.total || 0)) break;
    offset += PAGE_SIZE;
  }
  return assets;
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { knownMints: [], lastCheck: null };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// OAuth 1.0a signing for @StocksOnSolana
const crypto = require('crypto');
const CREDS = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.credentials/x-stocksonsolana.json'), 'utf-8'));

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function oauthSign(method, url, params, consumerSecret, tokenSecret) {
  const sorted = Object.keys(params).sort().map(k => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&');
  const base = `${method}&${percentEncode(url)}&${percentEncode(sorted)}`;
  const key = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return crypto.createHmac('sha1', key).update(base).digest('base64');
}

async function postToX(text) {
  const url = 'https://api.x.com/2/tweets';
  const oauthParams = {
    oauth_consumer_key: CREDS.consumer_key,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: CREDS.access_token,
    oauth_version: '1.0',
  };
  const sig = oauthSign('POST', url, oauthParams, CREDS.consumer_secret, CREDS.access_token_secret);
  oauthParams.oauth_signature = sig;
  const authHeader = 'OAuth ' + Object.keys(oauthParams).sort().map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`).join(', ');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.data?.id) {
      console.log(`[X] Posted: https://x.com/StocksOnSolana/status/${data.data.id}`);
      return true;
    } else {
      console.error('[X] Failed:', JSON.stringify(data));
      return false;
    }
  } catch (e) {
    console.error('[X] Error:', e.message);
    return false;
  }
}

async function main() {
  console.log(`[${new Date().toISOString()}] Checking for new tokenized stocks...`);

  // Fetch all current tokens
  const allTokens = [];
  for (const { key, provider } of PROVIDERS) {
    try {
      const assets = await fetchScreener(key);
      for (const a of assets) {
        allTokens.push({
          mint: a.id,
          symbol: a.symbol,
          name: a.name,
          provider,
          price: a.usdPrice || null,
        });
      }
    } catch (e) {
      console.error(`[${provider}] fetch failed:`, e.message);
    }
  }

  console.log(`Found ${allTokens.length} total tokens`);

  const state = loadState();
  const knownSet = new Set(state.knownMints);

  // Find new tokens
  const newTokens = allTokens.filter(t => !knownSet.has(t.mint));

  if (newTokens.length === 0) {
    console.log('No new tokens found.');
    // Update state with current mint list (in case first run)
    if (state.knownMints.length === 0) {
      console.log('First run — saving all current tokens as known.');
      saveState({
        knownMints: allTokens.map(t => t.mint),
        lastCheck: new Date().toISOString(),
      });
    } else {
      state.lastCheck = new Date().toISOString();
      saveState(state);
    }
    return;
  }

  console.log(`🆕 Found ${newTokens.length} new token(s):`);

  for (const token of newTokens) {
    const line = `  ${token.symbol} (${token.name}) — ${token.provider} — ${token.mint.slice(0, 8)}...`;
    console.log(line);

    if (POST_X && !DRY_RUN) {
      // Build tweet
      const priceStr = token.price ? ` at $${Number(token.price).toFixed(2)}` : '';
      const tweet = `🆕 New tokenized stock on Solana: ${token.name} ($${token.symbol})${priceStr}

Provider: ${token.provider}

https://stocksonsolana.com/${token.symbol.toLowerCase()}`;

      console.log('[TWEET]', tweet);
      await postToX(tweet);

      // Small delay between posts to avoid rate limits
      if (newTokens.indexOf(token) < newTokens.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    } else if (DRY_RUN) {
      const priceStr = token.price ? ` at $${Number(token.price).toFixed(2)}` : '';
      console.log(`[DRY RUN] Would tweet: 🆕 New tokenized stock on Solana: ${token.name} ($${token.symbol})${priceStr}`);
    }
  }

  // Update state
  const allMints = [...new Set([...state.knownMints, ...allTokens.map(t => t.mint)])];
  saveState({
    knownMints: allMints,
    lastCheck: new Date().toISOString(),
    lastNewTokens: newTokens.map(t => ({ symbol: t.symbol, name: t.name, provider: t.provider, mint: t.mint })),
  });

  // Output summary for cron/caller
  console.log(JSON.stringify({ newCount: newTokens.length, tokens: newTokens.map(t => t.symbol) }));
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
