import styles from "../hangul/page.module.css";

export const metadata = {
  title: "Starter Flashcards — Hallium",
  description: "Learn Hallium's first 12 Korean Starter words with illustrated scenes, listening, recall and sentence practice.",
};

export default function StarterFlashcards() {
  return (
    <main className={styles.shell} id="starter-flashcards">
      <nav className={styles.bar} aria-label="Flashcards navigation">
        <a className={styles.back} href="/" aria-label="Back to the Hallium learning dashboard">
          <span aria-hidden="true">←</span> <span>Back to Hallium</span>
        </a>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">책</span>
          <span><strong>Hallium</strong><small>STARTER FLASHCARDS · 12 WORDS</small></span>
        </div>
        <a className={styles.lessons} href="/hangul">Hangul Lab <span aria-hidden="true">↗</span></a>
      </nav>
      <iframe
        className={styles.frame}
        title="Illustrated Starter Unit 1 Korean flashcards with twelve words, pronunciation and review"
        src="/flashcards-level1/index.html"
        loading="eager"
        allow="autoplay"
      />
    </main>
  );
}
