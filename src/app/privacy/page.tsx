"use client";

import Link from "next/link";

const Logo = () => (
  <div className="footer-logo" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
    <Link href="/">
      <img src="/assets/images/logo2.png" alt="Limitra Logo" style={{ height: 'clamp(32px, 8vw, 48px)', width: 'auto' }} />
    </Link>
  </div>
);

export default function Privacy() {
  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("limitra-theme", nextTheme);
  };

  return (
    <main>
      {/* Header Section */}
      <section className="hero section" style={{ paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="hero-pattern"></div>
        <div className="container">
          <div className="hero-header">
            <div className="logo-container">
              <Logo />
            </div>

            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle color mode"
            >
              <svg className="theme-toggle-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
              <svg className="theme-toggle-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3a6 6 0 0 0 9 7.4A9 9 0 1 1 12 3Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Privacy Content Section */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', color: 'var(--text-main)', textAlign: 'center' }}>Privacy</h1>
          
          <div style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>At Limitra, your privacy matters to us.</p>
            
            <p>When you join our waitlist, we may collect your name, email address, phone number, and any other information you choose to share with us.</p>
            
            <p>We use this information to:</p>
            
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Send you Limitra launch updates</li>
              <li>Give you early access information</li>
              <li>Share special offers and member announcements</li>
              <li>Improve our customer experience before launch</li>
            </ul>

            <p>We do not sell your personal information. We do not share your details with outside companies for their own marketing.</p>
            
            <p>You can ask us to update or remove your information at any time by contacting us.</p>
            
            <p>We take reasonable steps to protect your information, but no online system is completely risk free.</p>
            
            <p>By joining the waitlist, you agree that Limitra may contact you about the launch, early access, and related offers.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <Logo />
          <div className="footer-center">
            <div className="social-icons">
              <a href="#" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 20.5 5 16.3A8.3 8.3 0 1 1 8 19.1l-4.5 1.4Z"></path><path d="M8.8 8.6c.2-.4.3-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.3 0 .5-.1.6l-.4.5c-.1.1-.2.3-.1.5.4.8 1.2 1.7 2.2 2.2.2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .9-.8 1.7-1.7 1.7-1.1 0-2.9-.5-4.6-2.1-1.6-1.5-2.5-3.4-2.5-4.5 0-.5.2-.9.6-1.4Z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16"></path><path d="M20 4 4 20"></path></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
            <div className="copyright">
              © 2026 LIMITRA. All rights reserved.
            </div>
            <p className="footer-domain">limitra.com.ng</p>
            <div className="footer-links">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className="footer-navs">
            <p><Link href="/">Home</Link></p>
            <p><Link href="/#">Guide</Link></p>
            <p><Link href="/#about">About</Link></p>
            <p><Link href="/#faq">FAQ</Link></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
