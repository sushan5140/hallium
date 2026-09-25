import styles from "./page.module.css";

export const metadata = {
  title: "Hangul Lab — Hallium",
  description: "Learn, hear, build, write, and practise Hangul in Hallium's dedicated alphabet studio.",
};

export default function HangulLab() {
  return (
    <main className={styles.shell} id="hangul-lab">
      <nav className={styles.bar} aria-label="Hangul Lab navigation">
        <a className={styles.back} href="/" aria-label="Back to the Hallium learning dashboard">
          <span aria-hidden="true">←</span> <span>Back to Hallium</span>
        </a>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">ㅎ</span>
          <span><strong>Hallium</strong><small>HANGUL LAB · ALPHABET STUDIO</small></span>
        </div>
        <a className={styles.lessons} href="/?view=companion">My lessons <span aria-hidden="true">↗</span></a>
      </nav>
      <iframe
        className={styles.frame}
        title="Hallium's interactive Hangul learning and handwriting studio"
        src="/hangul-lab/index.html#learn"
        loading="eager"
        allow="autoplay"
      />
    </main>
  );
}
