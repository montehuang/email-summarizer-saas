import UserMenu from "@/components/UserMenu";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className="gradient-text">MailAI</span>
        </div>
        <div className={styles.navLinks}>
          <UserMenu />
        </div>
      </nav>

      <main className={styles.main}>
        <header className={styles.hero}>
          <div className={styles.badge}>Next-Gen Email Intelligence</div>
          <h1 className={styles.title}>
            Transform your Inbox into <br />
            <span className="gradient-text">Instant Intelligence</span>
          </h1>
          <p className={styles.description}>
            MailAI uses advanced generative intelligence to summarize your daily work emails
            and send structured, actionable reports directly to your WhatsApp or Slack.
          </p>
          <div className={styles.ctaGroup}>
            <button className="glow-btn">Get Started for Free</button>
            <button className={styles.secondaryBtn}>See How it Works</button>
          </div>
        </header>

        <section className={styles.featureGrid}>
          <div className="glass-panel">
            <div className={styles.card}>
              <div className={styles.icon}>⚡</div>
              <h3>AI Summarization</h3>
              <p>Gemini-powered analysis that extracts action items and priorities in seconds.</p>
            </div>
          </div>
          <div className="glass-panel">
            <div className={styles.card}>
              <div className={styles.icon}>📱</div>
              <h3>Multi-Channel</h3>
              <p>Receive your daily reports on WhatsApp, Slack, or Telegram automatically.</p>
            </div>
          </div>
          <div className="glass-panel">
            <div className={styles.card}>
              <div className={styles.icon}>🔒</div>
              <h3>OAuth2 Secure</h3>
              <p>No passwords required. We use enterprise-grade OAuth2 to keep your data safe.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 MailAI. Modern Email Management for Professionals.</p>
      </footer>
    </div>
  );
}
