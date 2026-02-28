import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Stocks on Solana',
  description: 'Terms of Service for stocksonsolana.com',
};

export default function TermsPage() {
  return (
    <main style={{
      background: '#0a0a0a', minHeight: '100vh', color: '#ccc',
      fontFamily: '"JetBrains Mono", monospace', padding: '60px 24px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ color: '#ff9900', fontSize: 12, letterSpacing: 2, textDecoration: 'none' }}>← BACK</a>
        </div>
        <h1 style={{ color: '#ff9900', fontSize: 22, letterSpacing: 4, marginBottom: 8 }}>TERMS OF SERVICE</h1>
        <p style={{ color: '#555', fontSize: 12, letterSpacing: 2, marginBottom: 48 }}>Last updated: February 28, 2026</p>

        {[
          {
            title: '1. Acceptance',
            body: `By accessing or using Stocks on Solana ("the Service"), you agree to these Terms. If you do not agree, do not use the Service.`,
          },
          {
            title: '2. Not Financial Advice',
            body: `Stocks on Solana is an informational tool only. Nothing on this site constitutes financial, investment, legal, or tax advice. All data is provided for informational purposes only.

Do your own research. Past performance does not guarantee future results. Tokenized assets on Solana carry significant risks including smart contract risk, liquidity risk, regulatory risk, and total loss of funds.`,
          },
          {
            title: '3. Eligibility',
            body: `You must be at least 18 years old to use this Service. By using the Service, you represent that you are legally permitted to do so in your jurisdiction.

The Service is not available to residents of jurisdictions where tokenized securities or DeFi products are prohibited.`,
          },
          {
            title: '4. Use of the Service',
            body: `You agree not to:

• Use the Service for any unlawful purpose
• Attempt to gain unauthorised access to any part of the Service
• Scrape, copy, or redistribute data without permission
• Interfere with the operation of the Service
• Use the Service to manipulate markets`,
          },
          {
            title: '5. Third-Party Links',
            body: `The Service contains links to third-party platforms (Jupiter, Solscan, etc.). We are not responsible for the content, accuracy, or practices of third-party sites. Use them at your own risk.`,
          },
          {
            title: '6. Data Accuracy',
            body: `We strive for accuracy but do not guarantee that price data, market cap figures, or other information is complete, current, or error-free. Data is sourced from third-party APIs and may be delayed or incorrect.`,
          },
          {
            title: '7. Disclaimer of Warranties',
            body: `The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We disclaim all warranties including merchantability, fitness for a particular purpose, and non-infringement.`,
          },
          {
            title: '8. Limitation of Liability',
            body: `To the fullest extent permitted by law, Stocks on Solana and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of funds, arising from your use of the Service.`,
          },
          {
            title: '9. Changes to Terms',
            body: `We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.`,
          },
          {
            title: '10. Governing Law',
            body: `These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be resolved through binding arbitration or a court of competent jurisdiction.`,
          },
          {
            title: '11. Contact',
            body: `Questions? Email us at legal@stocksonsolana.com`,
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
