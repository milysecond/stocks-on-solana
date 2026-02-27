import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'stocks-on-solana-secret-2026'
);

const HMAC_SECRET = process.env.JWT_SECRET || 'stocks-on-solana-secret-2026';

// ── Magic link token (HMAC, no DB) ──────────────────────────────
export async function createMagicToken(email: string): Promise<string> {
  const expiry = Date.now() + 15 * 60 * 1000; // 15 min
  const payload = `${email}:${expiry}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(HMAC_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return btoa(payload) + '.' + sigB64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const [payloadB64, sigB64] = token.split('.');
    const payload = atob(payloadB64);
    const [email, expiryStr] = payload.split(':');
    if (Date.now() > parseInt(expiryStr)) return null;

    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(HMAC_SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(payload));
    return valid ? email : null;
  } catch { return null; }
}

// ── Session JWT ──────────────────────────────────────────────────
export async function createSession(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string };
  } catch { return null; }
}
