import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Stocks on Solana',
  description: 'Privacy Policy for stocksonsolana.com',
};

export default function PrivacyPage() {
  return (
    <main style={{
      background: '#0a0a0a', minHeight: '100vh', color: '#ccc',
      fontFamily: '"JetBrains Mono", monospace', padding: '60px 24px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ color: '#ff9900', fontSize: 12, letterSpacing: 2, textDecoration: 'none' }}>← BACK</a>
        </div>
        <h1 style={{ color: '#ff9900', fontSize: 22, letterSpacing: 4, marginBottom: 8 }}>PRIVACY POLICY</h1>
        <p style={{ color: '#555', fontSize: 12, letterSpacing: 2, marginBottom: 48 }}>Last updated: February 28, 2026</p>

        {[
          {
            title: '1. Information We Collect',
            body: `We collect the following information when you use Stocks on Solana:

• Email address — when you sign in or subscribe to updates
• Usage data — pages visited, features used, time on site (via Google Analytics)
• Wallet address — if you connect a wallet (optional)

We do not collect passwords, financial information, or sensitive personal data.`,
          },
          {
            title: '2. How We Use Your Information',
            body: `We use your information to:

• Send you magic login links and account-related emails
• Send product updates and announcements (you can unsubscribe at any time)
• Improve the product through aggregate usage analytics
• Maintain security and prevent abuse`,
          },
          {
            title: '3. Data Sharing',
            body: `We do not sell your personal data. We share data only with:

• SendGrid — email delivery
• Google Analytics — anonymous usage analytics
• Cloudflare — infrastructure and DDoS protection

All third-party providers are bound by their own privacy policies.`,
          },
          {
            title: '4. Cookies',
            body: `We use minimal cookies for authentication sessions and analytics. You can disable cookies in your browser, though some features may not function correctly.`,
          },
          {
            title: '5. Data Retention',
            body: `We retain your email address for as long as your account is active or until you request deletion. Analytics data is retained for 26 months per Google Analytics defaults.`,
          },
          {
            title: '6. Your Rights',
            body: `You have the right to:

• Access the personal data we hold about you
• Request correction or deletion of your data
• Unsubscribe from marketing emails at any time
• Request a copy of your data

To exercise these rights, contact us at privacy@stocksonsolana.com`,
          },
          {
            title: '7. Security',
            body: `We use industry-standard security practices including HTTPS, secure authentication tokens, and access controls. No system is 100% secure — use the platform at your own risk.`,
          },
          {
            title: '8. Changes',
            body: `We may update this policy from time to time. We will notify users of significant changes via email or a notice on the site.`,
          },
          {
            title: '9. Contact',
            body: `Questions? Email us at privacy@stocksonsolana.com`,
          },
        ].map(({ title, body }) => (
          <section key={title} style={{ marginBottom: 36 }}>
            <h2 style={{ color: '#ff9900', fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>{title}</h2>
            <p style={{ color: '#888', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{body}</p>
            <div style={{ height: 1, background: '#1a1a1a', marginTop: 28 }} />
          </section>
        ))}
      </div>
    </main>
  );
}
