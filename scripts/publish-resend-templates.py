#!/usr/bin/env python3
"""Publish Stocks on Solana Resend templates (magic-link + welcome)."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRED = Path.home() / ".credentials" / "resend.txt"
FULL = Path.home() / ".credentials" / "resend-full.txt"
OUT = Path.home() / ".credentials" / "resend-stocks-templates.json"
FROM = "Stocks on Solana <noreply@stocksonsolana.com>"


def key() -> str:
    for p in (FULL, CRED):
        if p.exists():
            k = p.read_text().strip().splitlines()[0].strip()
            if k.startswith("re_"):
                return k
    env = os.environ.get("RESEND_API_KEY", "")
    if env.startswith("re_"):
        return env
    sys.exit("No Resend API key")


def curl_json(method: str, path: str, body: dict | None = None):
    k = key()
    cmd = [
        "curl",
        "-sS",
        "-X",
        method,
        f"https://api.resend.com{path}",
        "-H",
        f"Authorization: Bearer {k}",
        "-H",
        "User-Agent: curl/8.0",
        "-H",
        "Content-Type: application/json",
    ]
    if body is not None:
        cmd += ["-d", json.dumps(body)]
    out = subprocess.check_output(cmd, text=True)
    return json.loads(out) if out.strip() else {}


# Templates use Resend {{{VAR}}} placeholders — not Python f-strings for those.
MAGIC_HTML = r"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="dark"/><title>Sign in</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e8e8e8;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0a;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#111111;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden;">
<tr><td style="height:6px;background:linear-gradient(90deg,#F8F700 0%,#FBAE17 45%,#7F47DD 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;text-align:center;">
<img src="https://stocksonsolana.com/logo-mark.png" width="52" height="52" alt="" style="display:block;margin:0 auto 12px;border:0;"/>
<div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FBAE17;margin-bottom:18px;">STOCKS ON SOLANA</div>
<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#fff;">Sign in</h1>
<p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#a8a8a8;">Click to open the screener. This link expires in 15 minutes.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px;"><tr>
<td style="border-radius:8px;background:linear-gradient(90deg,#F8F700 0%,#FBAE17 45%,#7F47DD 100%);">
<a href="{{{MAGIC_URL}}}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:0.06em;color:#0a0a0a;text-decoration:none;text-transform:uppercase;">Sign in</a>
</td></tr></table>
<p style="margin:0;font-size:11px;color:#555;">If you did not request this, ignore it.</p>
</td></tr>
<tr><td style="padding:0 28px 28px;text-align:center;font-size:11px;color:#555;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
Design by <a href="https://graysunderland.com" style="color:#666;text-decoration:none;">Gray</a> · Not financial advice.
</td></tr>
</table></td></tr></table>
</body></html>"""

WELCOME_HTML = r"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="dark"/><title>Welcome</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e8e8e8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're in. Track 600+ tokenized stocks on Solana in real time.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0a;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#111111;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden;">
<tr><td style="height:6px;background:linear-gradient(90deg,#F8F700 0%,#FBAE17 45%,#7F47DD 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;text-align:center;">
<img src="https://stocksonsolana.com/logo-mark.png" width="52" height="52" alt="" style="display:block;margin:0 auto 12px;border:0;"/>
<div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FBAE17;margin-bottom:18px;">STOCKS ON SOLANA</div>
<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#fff;">Welcome to the terminal</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:#a8a8a8;">Hey {{{CONTACT_NAME}}} — you're in. Real-time screener for tokenized equities on Solana: xStocks, Sunrise (Backpack), Ondo, PreStocks, and more.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;text-align:left;"><tr>
<td style="padding:14px 16px;border:1px solid #1e1e1e;border-radius:8px;background:#0d0d0d;">
<div style="font-size:13px;color:#e8e8e8;margin-bottom:8px;"><span style="color:#FBAE17;">→</span> Live prices via Jupiter</div>
<div style="font-size:13px;color:#e8e8e8;margin-bottom:8px;"><span style="color:#FBAE17;">→</span> Discount / premium vs NYSE &amp; NASDAQ</div>
<div style="font-size:13px;color:#e8e8e8;margin-bottom:8px;"><span style="color:#FBAE17;">→</span> Filter xStocks · Sunrise · Ondo</div>
<div style="font-size:13px;color:#e8e8e8;"><span style="color:#FBAE17;">→</span> Market pulse in this inbox</div>
</td></tr></table>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 8px;"><tr>
<td style="border-radius:8px;background:linear-gradient(90deg,#F8F700 0%,#FBAE17 45%,#7F47DD 100%);">
<a href="https://stocksonsolana.com" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:0.06em;color:#0a0a0a;text-decoration:none;text-transform:uppercase;">Open screener</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:0 28px 28px;text-align:center;font-size:11px;color:#555;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<a href="https://x.com/StocksOnSolana" style="color:#FBAE17;text-decoration:none;">@StocksOnSolana</a>
 · <a href="https://stocksonsolana.com/privacy" style="color:#666;">Privacy</a>
 · Design by <a href="https://graysunderland.com" style="color:#666;text-decoration:none;">Gray</a>
 · Not financial advice.
</td></tr>
</table></td></tr></table>
</body></html>"""

TEMPLATES = [
    {
        "name": "SoS Magic Link",
        "alias": "sos-magic-link",
        "subject": "Your Stocks on Solana login link",
        "html": MAGIC_HTML,
        "variables": [{"key": "MAGIC_URL", "type": "string", "fallbackValue": "https://stocksonsolana.com"}],
    },
    {
        "name": "SoS Welcome",
        "alias": "sos-welcome",
        "subject": "You're on Stocks on Solana",
        "html": WELCOME_HTML,
        "variables": [{"key": "CONTACT_NAME", "type": "string", "fallbackValue": "there"}],
    },
]


def main():
    existing = curl_json("GET", "/templates")
    by_alias = {}
    for t in existing.get("data") or []:
        if t.get("alias"):
            by_alias[t["alias"]] = t

    result = {}
    for tpl in TEMPLATES:
        alias = tpl["alias"]
        payload = {
            "name": tpl["name"],
            "alias": alias,
            "from": FROM,
            "subject": tpl["subject"],
            "html": tpl["html"],
            "variables": tpl["variables"],
        }
        if alias in by_alias:
            tid = by_alias[alias]["id"]
            print("PATCH", alias, tid)
            r = curl_json("PATCH", f"/templates/{tid}", payload)
            print(r)
        else:
            print("POST", alias)
            r = curl_json("POST", "/templates", payload)
            print(r)
            tid = r.get("id") or (r.get("data") or {}).get("id")
            if not tid:
                # list again
                existing = curl_json("GET", "/templates")
                for t in existing.get("data") or []:
                    if t.get("alias") == alias:
                        tid = t["id"]
                        break
        if not tid:
            print("FAIL no id", alias)
            continue
        pub = curl_json("POST", f"/templates/{tid}/publish", {})
        print("publish", alias, pub)
        result[alias] = {"id": tid, "name": tpl["name"], "subject": tpl["subject"]}

    OUT.write_text(json.dumps(result, indent=2) + "\n")
    OUT.chmod(0o600)
    print("wrote", OUT)

    # sync HTML files for broadcasts
    emails = ROOT / "emails"
    (emails / "welcome.html").write_text(
        WELCOME_HTML.replace("{{{CONTACT_NAME}}}", "{{{CONTACT_NAME}}}")
        # broadcasts use contact vars — keep simple
        .replace("{{{CONTACT_NAME}}}", "{{{contact.first_name|there}}}")
        + "\n"
    )
    # welcome for broadcast should also have unsubscribe - append note in README
    brand = {
        "product": "Stocks on Solana",
        "domain": "stocksonsolana.com",
        "from": FROM,
        "logo_url": "https://stocksonsolana.com/logo-mark.png",
        "site_url": "https://stocksonsolana.com",
        "x_url": "https://x.com/StocksOnSolana",
        "colors": {
            "bg": "#0a0a0a",
            "bg_card": "#111111",
            "border": "#1e1e1e",
            "gold": "#F8F700",
            "amber": "#FBAE17",
            "violet": "#7F47DD",
            "gradient": "linear-gradient(90deg,#F8F700 0%,#FBAE17 45%,#7F47DD 100%)",
            "text": "#e8e8e8",
        },
        "templates": result,
        "mailing_list": {
            "segment_id": "c7b7154e-cb8e-43cf-a262-bd1212bf1358",
            "segment_name": "Stocks on Solana",
        },
        "env": {
            "RESEND_TPL_MAGIC_LINK": result.get("sos-magic-link", {}).get("id", ""),
            "RESEND_TPL_WELCOME": result.get("sos-welcome", {}).get("id", ""),
        },
    }
    (emails / "RESEND_BRAND.json").write_text(json.dumps(brand, indent=2) + "\n")
    print("updated emails/RESEND_BRAND.json")


if __name__ == "__main__":
    main()
