export const metadata = {
  title: "Hallim Creator Kit",
  description: "Creator-ready Hallim product facts, demo flows, content angles, referral guidance, and claim-safe talking points.",
  openGraph: {
    title: "Hallim Creator Kit",
    description: "Everything a creator needs to understand and demonstrate Hallim accurately.",
    url: "https://hallium.vercel.app/creator-kit",
  },
};

const productFacts = [
  ["15", "published units"],
  ["76", "lessons & checkpoints"],
  ["5", "published learning bands"],
  ["6", "Hallim Intelligence tools"],
];

const contentAngles = [
  ["“I let the app decide what I should study next”", "Show Today’s Hallim Path before and after a test or adaptive review."],
  ["“This Korean app remembers what I got wrong”", "Miss a Study Test item, then open Review and show the scheduled weakness queue."],
  ["“Written Korean vs how it actually sounds”", "Open Vocabulary and show a word with natural-pronunciation notation such as 학생 [학쌩]."],
  ["“Can an AI Korean app avoid becoming a chatbot?”", "Show that Hallim Intelligence is attached to audit, difficulty, review, checkpoints, and routing—not a generic chat box."],
];

const faq = [
  ["Does Hallim replace a teacher?", "No. Hallim is a structured self-study product. It organizes learning, practice, review, and evidence; it does not claim to replace human instruction."],
  ["Does Hallim score pronunciation?", "Not currently. Shadowing is self-practice and Hallim says so explicitly. Browser TTS is a convenience layer, not an acoustic assessment model."],
  ["Is Hallim a TOPIK score predictor?", "No. Levels use TOPIK ranges as learning context, but Hallim does not claim official exam readiness or predict an official score."],
  ["When does Hallim require sign-in?", "The public product can be previewed without an account. Any learner action immediately starts Google sign-in, which unlocks private progress and cross-device sync."],
  ["How do ambassador links work?", "Approved creator codes use ?ref=CODE. Hallim validates the code against its active ambassador registry before attributing a signup."],
];

export default function CreatorKitPage() {
  return (
    <main className="publicPage creatorKitPage">
      <header className="publicNav">
        <a className="publicBrand" href="/"><i>ㅎ</i><span><b>Hallim</b><small>한림</small></span></a>
        <nav><a href="/demo">Demo</a><a href="/ambassadors">Ambassadors</a><a className="publicNavCta" href="/auth/google?next=%2F%3Fview%3Dhome">Open Hallim</a></nav>
      </header>

      <section className="publicHero creatorKitHero">
        <span className="eyebrow">Creator Launch Kit</span>
        <h1>Everything needed to show Hallim accurately.</h1>
        <p>Use this page as the source of truth for product facts, demo order, content angles, referral links, and the claims Hallim is comfortable making publicly.</p>
        <div className="publicHeroActions">
          <a className="publicPrimary" href="/demo">Run the product demo →</a>
          <a className="publicSecondary" href="/ambassadors">Partnership details</a>
        </div>
        <div className="publicProofRow">
          {productFacts.map(([value,label]) => <span key={label}><b>{value}</b>{label}</span>)}
        </div>
      </section>

      <section className="creatorFlowSection">
        <div className="publicSectionHead">
          <span className="eyebrow">30-second demonstration</span>
          <h2>Show the learning loop, not every menu.</h2>
        </div>
        <ol className="creatorTimeline">
          <li><b>0–5s</b><span>Open Home and show the learner’s current → target level plus Today’s Hallim Path.</span></li>
          <li><b>5–12s</b><span>Open a Companion lesson and show listening, shadowing, or sentence building.</span></li>
          <li><b>12–20s</b><span>Answer one Study Test question incorrectly and show “Explain my mistake.”</span></li>
          <li><b>20–26s</b><span>Open Review and show that the missed question is remembered for spaced review.</span></li>
          <li><b>26–30s</b><span>Return Home/Profile and show Hallim adapting the next route from evidence.</span></li>
        </ol>
      </section>

      <section className="creatorFlowSection alt">
        <div className="publicSectionHead">
          <span className="eyebrow">60-second demonstration</span>
          <h2>Add curriculum depth and Korean quality.</h2>
        </div>
        <ol className="creatorTimeline">
          <li><b>0–10s</b><span>Show the 15-unit route from Starter through Advanced and explain that the chosen starting level changes the entry point.</span></li>
          <li><b>10–22s</b><span>Show a lesson with listening → shadowing → production rather than isolated flashcards.</span></li>
          <li><b>22–32s</b><span>Open Vocabulary and show written Hangul separately from natural pronunciation notes.</span></li>
          <li><b>32–45s</b><span>Take a test/adaptive review and show question-level feedback plus the weakness memory.</span></li>
          <li><b>45–55s</b><span>Show Today’s Hallim Path or an AI audit changing the next recommended activity.</span></li>
          <li><b>55–60s</b><span>Close on the real app and your approved Hallim referral link.</span></li>
        </ol>
      </section>

      <section className="publicSection">
        <div className="publicSectionHead">
          <span className="eyebrow">Content angles</span>
          <h2>Four demonstrations that are actually true.</h2>
        </div>
        <div className="creatorAngleGrid">
          {contentAngles.map(([title,body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="creatorClaims">
        <div className="creatorDo">
          <span className="eyebrow">Safe to say</span>
          <h2>Ground the content in product facts.</h2>
          <ul>
            <li>Hallim has 15 published units and 76 lessons/checkpoints across five learning bands.</li>
            <li>Hallim stores question-level mistakes and schedules them back for review.</li>
            <li>Hallim Intelligence uses test/progress evidence to generate routes, practice, audits, and difficulty changes.</li>
            <li>Learner actions use Google sign-in so private progress can sync across devices.</li>
            <li>Approved ambassador links can attribute Google-authenticated signups to a creator code.</li>
          </ul>
        </div>
        <div className="creatorDont">
          <span className="eyebrow">Do not claim</span>
          <h2>No inflated promises.</h2>
          <ul>
            <li>Do not claim Hallim guarantees a TOPIK score or scholarship outcome.</li>
            <li>Do not call shadowing “AI pronunciation scoring.” Hallim does not currently score speech acoustically.</li>
            <li>Do not invent learner counts, retention, conversion, or success rates.</li>
            <li>Do not state a commission or payment arrangement unless it exists in your individual agreement.</li>
            <li>Do not describe generated practice as unlimited new Korean; it is intentionally constrained to studied material.</li>
          </ul>
        </div>
      </section>

      <section className="creatorShotList">
        <div>
          <span className="eyebrow">Shot list</span>
          <h2>Best screens to capture.</h2>
        </div>
        <div className="creatorShots">
          <span><b>01</b> Home · Today’s Hallim Path</span>
          <span><b>02</b> Companion · full curriculum route</span>
          <span><b>03</b> Lesson · listening / shadowing / dictation</span>
          <span><b>04</b> Vocabulary · natural pronunciation</span>
          <span><b>05</b> Study Test · mistake explanation</span>
          <span><b>06</b> Review · spaced weakness memory</span>
          <span><b>07</b> Profile · Intelligence + progress</span>
          <span><b>08</b> Demo page · product summary</span>
        </div>
      </section>

      <section className="publicSection">
        <div className="publicSectionHead">
          <span className="eyebrow">Creator FAQ</span>
          <h2>Questions to settle before publishing.</h2>
        </div>
        <div className="creatorFaq">
          {faq.map(([q,a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}
        </div>
      </section>

      <section className="referralExplainer">
        <div>
          <span className="eyebrow">Approved referral link</span>
          <h2>Use only the code Hallim assigns to you.</h2>
          <p>Format: <code>https://hallium.vercel.app/?ref=YOURCODE</code>. Hallim validates it against the approved active-code registry before storing attribution.</p>
        </div>
        <div className="referralFlow"><span>Your content</span><i>→</i><span>Approved link</span><i>→</i><span>Google sign-in</span><i>→</i><span>Attribution</span></div>
      </section>

      <section className="publicCta">
        <span className="eyebrow">Creator test</span>
        <h2>Try to break the product before recommending it.</h2>
        <p>The most useful creator feedback is not praise. Test a real level path, complete a lesson, deliberately miss a question, inspect Review, and tell us what would stop you from recommending Hallim.</p>
        <div className="publicHeroActions"><a className="publicPrimary" href="/auth/google?next=%2F%3Fview%3Dhome">Open Hallim →</a><a className="publicSecondary" href="/demo">Open demo</a></div>
      </section>

      <footer className="publicFooter"><span>Hallim · 한림</span><small>Creator kit · claim-safe product facts</small></footer>
    </main>
  );
}
