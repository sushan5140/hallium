export const metadata = {
  title: "Hallim Ambassadors | Partner with Hallim",
  description: "The founding ambassador program for Hallim, a structured adaptive Korean-learning product.",
};

const strengths = [
  ["Structured, not endless", "Learners move through a published route with lessons, checkpoints, vocabulary, grammar, listening, shadowing, dictation, and tests."],
  ["Adaptive by evidence", "Hallim Intelligence uses lesson progress and test evidence to decide what the learner should do next instead of guessing ability."],
  ["Korean quality matters", "Written Hangul, natural pronunciation notes, listening practice, and explicit no-fake-scoring rules keep the product honest about what it can measure."],
  ["Progress can travel", "Google sign-in unlocks the learner app and preserves private progress across devices."],
];

const partnerPoints = [
  "Early access to new Hallim learning systems and curriculum releases",
  "A direct product-feedback channel so creator and learner feedback can shape the roadmap",
  "A unique referral code for approved ambassadors, with signup attribution built into Hallim",
  "Creator-ready product demos and shareable learner progress for content workflows",
];

export default function AmbassadorsPage() {
  return (
    <main className="publicPage ambassadorPage">
      <header className="publicNav">
        <a className="publicBrand" href="/"><i>ㅎ</i><span><b>Hallim</b><small>한림</small></span></a>
        <nav><a href="/demo">Product demo</a><a href="/creator-kit">Creator kit</a><a className="publicNavCta" href="/auth/google?next=%2F%3Fview%3Dhome">Open Hallim</a></nav>
      </header>

      <section className="publicHero">
        <span className="eyebrow">Founding Ambassador Program</span>
        <h1>Represent a Korean-learning product worth putting your name beside.</h1>
        <p>Hallim is being built around structured progression, measurable learning evidence, and adaptive practice—not streak pressure or an endless feed of disconnected exercises.</p>
        <div className="publicHeroActions">
          <a className="publicPrimary" href="/demo">See the 60-second product tour →</a>
          <a className="publicSecondary" href="/auth/google?next=%2F%3Fview%3Dcompanion">Try the real app</a>
        </div>
        <div className="publicProofRow">
          <span><b>15</b> published units</span>
          <span><b>76</b> lessons & checkpoints</span>
          <span><b>5</b> published learning bands</span>
          <span><b>6</b> Hallim Intelligence tools</span>
        </div>
      </section>

      <section className="publicSection">
        <div className="publicSectionHead">
          <span className="eyebrow">Why Hallim</span>
          <h2>The product should carry the partnership.</h2>
          <p>We want creators to be able to show the learning experience itself rather than rely on exaggerated claims.</p>
        </div>
        <div className="publicFeatureGrid">
          {strengths.map(([title, body]) => (
            <article key={title}><small>HALLIM</small><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className="publicSplit">
        <div>
          <span className="eyebrow">What ambassadors can expect</span>
          <h2>A product relationship, not a copy-paste promo brief.</h2>
          <p>Founding partnerships are selective and discussed directly. Commercial terms, if any, are agreed separately; this page does not promise a fixed payment or commission structure.</p>
        </div>
        <ul>
          {partnerPoints.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="publicSection">
        <div className="publicSectionHead">
          <span className="eyebrow">Best fit</span>
          <h2>Creators whose audience actually wants to learn Korean.</h2>
        </div>
        <div className="fitGrid">
          <article><b>Korean-learning creators</b><p>Grammar, vocabulary, pronunciation, TOPIK preparation, and study routines.</p></article>
          <article><b>Korea / study-abroad creators</b><p>Audiences preparing for life, university, or everyday communication in Korea.</p></article>
          <article><b>Language & productivity creators</b><p>Audiences interested in structured systems, measurable progress, and adaptive study.</p></article>
        </div>
      </section>

      <section className="referralExplainer">
        <div>
          <span className="eyebrow">Referral-ready</span>
          <h2>Approved ambassadors get attributable links.</h2>
          <p>Hallim already understands links in the form <code>hallium.vercel.app/?ref=YOURCODE</code>. The first valid code is preserved locally and attached to the learner profile when they complete Google sign-in.</p>
        </div>
        <div className="referralFlow">
          <span>Creator link</span><i>→</i><span>Hallim learner</span><i>→</i><span>Google sign-in</span><i>→</i><span>Referral attribution</span>
        </div>
      </section>

      <section className="pilotNotice">
        <div>
          <span className="eyebrow">Founding pilot · invite only</span>
          <h2>We are starting deliberately small.</h2>
          <p>The first Hallim ambassador cohort is limited to a controlled set of creators who test the product before any promotion request. Referral codes are issued only after that testing stage is approved.</p>
        </div>
        <div className="pilotStages">
          <span>Shortlisted</span><i>→</i><span>Invited</span><i>→</i><span>Testing</span><i>→</i><span>Approved</span><i>→</i><span>Active</span>
        </div>
      </section>

      <section className="publicCta">
        <span className="eyebrow">Before you decide</span>
        <h2>Use Hallim like a learner first.</h2>
        <p>If Hallim reached you through a direct invitation, the best next step is to try the demo and real product, then reply to that invitation with what you would want improved before representing it.</p>
        <div className="publicHeroActions">
          <a className="publicPrimary" href="/demo">Open product demo →</a>
          <a className="publicSecondary" href="/auth/google?next=%2F%3Fview%3Dcompanion">Start learning</a>
        </div>
      </section>

      <footer className="publicFooter"><span>Hallim · 한림</span><small>Structured Korean. Evidence-led progression.</small></footer>
    </main>
  );
}
