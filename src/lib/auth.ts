// Pure Web Crypto — works on Edge and Node.js runtimes

const SECRET = process.env.JWT_SECRET || 'stocks-on-solana-secret-2026';

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else {
    bytes = new Uint8Array(input);
  }
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(s: string): ArrayBuffer {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

async function hmacKey(usage: 'sign' | 'verify') {
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, [usage]
  );
}

// ── Magic link token ─────────────────────────────────────────────
export async function createMagicToken(email: string): Promise<string> {
  const expiry = Date.now() + 15 * 60 * 1000;
  const payload = btoa(`${email}:${expiry}`);
  const key = await hmacKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const [payload, sig] = token.split('.');
    const decoded = atob(payload);
    const colonIdx = decoded.lastIndexOf(':');
    const email = decoded.slice(0, colonIdx);
    const expiry = parseInt(decoded.slice(colonIdx + 1));
    if (Date.now() > expiry) return null;
    const key = await hmacKey('verify');
    const valid = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig), new TextEncoder().encode(payload));
    return valid ? email : null;
  } catch { return null; }
}

// ── Session JWT (HS256, no deps) ─────────────────────────────────
export async function createSession(email: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  }));
  const key = await hmacKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(sig)}`;
}

export async function verifySession(token: string): Promise<{ email: string } | null> {
  try {
    const [header, payload, sig] = token.split('.');
    const key = await hmacKey('verify');
    const valid = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig), new TextEncoder().encode(`${header}.${payload}`));
    if (!valid) return null;
    const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: data.email };
  } catch { return null; }
}
