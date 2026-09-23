import styles from "./legal.module.css";

export function LegalSiteFooter() {
  return (
    <footer className={styles.siteFooter} aria-label="Hallium legal information">
      <span>© 2026 Hallium · Korean learning</span>
      <nav aria-label="Legal links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms &amp; Conditions</a>
      </nav>
    </footer>
  );
}

export default function LegalPage({ title, subtitle, sections, current }) {
  return (
    <main className={styles.page} id="main">
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Hallium home"><span aria-hidden="true">ㅎ</span>hallium<i>.</i></a>
        <nav aria-label="Legal page navigation">
          <a href="/">Back to Hallium ↗</a>
          <a href="/privacy" aria-current={current === "privacy" ? "page" : undefined}>Privacy</a>
          <a href="/terms" aria-current={current === "terms" ? "page" : undefined}>Terms</a>
        </nav>
      </header>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>HALLIUM / ACCOUNT-BASED LEARNING APP</span>
        <h1>{title}<span>.</span></h1>
        <p className={styles.lead}>{subtitle}</p>
        <p className={styles.date}>Effective 23 September 2026 · Applies to this Hallium app on Vercel, including signed-in learning and Study Partners.</p>
        <div className={styles.notice}><strong>Separate from our public learning demos</strong><p>Our static GitHub Pages Hangul and flashcard previews have separate, preview-specific notices. This document covers Hallium’s signed-in application, not those demos.</p></div>
      </div>
      <div className={styles.grid}>
        <article className={styles.document}>
          {sections.map(({ id, heading, paragraphs = [], points = [] }, index) => (
            <section id={id} key={id}>
              <h2><span>{String(index + 1).padStart(2, "0")}</span>{heading}</h2>
              {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
              {points.length > 0 && <ul>{points.map((point, i) => <li key={i}>{point}</li>)}</ul>}
            </section>
          ))}
          <p className={styles.endNote}>This notice describes Hallium’s current features. If a feature, provider, or data practice changes materially, we will revise the relevant notice.</p>
        </article>
        <aside className={styles.toc} aria-label="On this page">
          <strong>IN THIS DOCUMENT</strong>
          {sections.map(({ id, heading }, index) => <a key={id} href={"#" + id}>{String(index + 1).padStart(2, "0")} · {heading}</a>)}
          <a href={current === "privacy" ? "/terms" : "/privacy"}>Read the {current === "privacy" ? "Terms & Conditions" : "Privacy Policy"} ↗</a>
        </aside>
      </div>
    </main>
  );
}
