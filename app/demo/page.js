export const metadata = {
  title: "Hallim Product Demo | 60-second tour",
  description: "A compact product tour of Hallim's structured Korean curriculum and adaptive learning loop.",
};

const route = [
  ["01", "Choose a real starting point", "Starter, Foundation, Elementary, Lower Intermediate, Intermediate, or Advanced determine where the learner enters the published route."],
  ["02", "Learn in context", "Companion lessons combine vocabulary, grammar, listening, shadowing, sentence building, reading, and checkpoints."],
  ["03", "Measure the evidence", "Level-specific tests and checkpoints create concrete performance evidence instead of pretending completion equals mastery."],
  ["04", "Adapt the next move", "Hallim Intelligence turns progress, test history, audit findings, and difficulty into a three-step Today’s Hallim Path."],
];

const intelligence = [
  "Explain My Mistake",
  "Automatic Difficulty",
  "Adaptive Review",
  "Personal Study Plan",
  "Fresh AI Checkpoint",
  "Level Promotion Audit",
];

export default function DemoPage() {
  return (
    <main className="publicPage demoPage">
      <header className="publicNav">
        <a className="publicBrand" href="/"><i>ㅎ</i><span><b>Hallim</b><small>한림</small></span></a>
        <nav><a href="/ambassadors">Ambassadors</a><a href="/creator-kit">Creator kit</a><a className="publicNavCta" href="/auth/google?next=%2F%3Fview%3Dhome">Open Hallim</a></nav>
      </header>

      <section className="demoHero">
        <div>
          <span className="eyebrow">60-second product tour</span>
          <h1>Hallim turns Korean study into a measurable learning route.</h1>
          <p>Here is the core product loop a creator can understand before opening the full app.</p>
          <div className="publicHeroActions">
            <a className="publicPrimary" href="/auth/google?next=%2F%3Fview%3Dcompanion">Try the real app →</a>
            <a className="publicSecondary" href="/ambassadors">Partnership details</a>
          </div>
        </div>
        <div className="demoRoutePreview">
          <small>TODAY'S HALLIM PATH</small>
          <h3>Turn recognition into usable Korean.</h3>
          <p>Context + transfer + reassessment</p>
          <div><b>1</b><span>Continue a Companion lesson</span></div>
          <div><b>2</b><span>Run adaptive review</span></div>
          <div><b>3</b><span>Reassess the study pack</span></div>
        </div>
      </section>

      <section className="demoSequence">
        {route.map(([number,title,body]) => (
          <article key={number}>
            <span>{number}</span>
            <div><h2>{title}</h2><p>{body}</p></div>
          </article>
        ))}
      </section>

      <section className="demoProductGrid">
        <article className="demoCurriculumCard">
          <span className="eyebrow">Published curriculum</span>
          <h2>15 units · 76 lessons & checkpoints</h2>
          <div className="demoBands">
            <span><b>Starter / Foundation</b><small>First conversations · daily life · food</small></span>
            <span><b>Elementary</b><small>Shopping · directions · past & future</small></span>
            <span><b>Lower Intermediate</b><small>Reasons · comparisons · connected conversation</small></span>
            <span><b>Intermediate</b><small>Cause & consequence · reported speech · structured viewpoints</small></span>
            <span><b>Advanced</b><small>Inference · formal argument · precision in discourse</small></span>
          </div>
        </article>

        <article className="demoListeningCard">
          <span className="eyebrow">Listening & pronunciation</span>
          <h2>Hear it. Understand it. Produce it.</h2>
          <div className="demoKorean">학생 <em>[학쌩]</em></div>
          <p>Hallim separates written Hangul, natural Korean pronunciation notes, and learner romanization instead of pretending they are the same thing.</p>
          <div className="demoAudioRow"><span>▶ Natural pace</span><span>0.72× slow replay</span><span>Dictation</span><span>Shadowing</span></div>
        </article>
      </section>

      <section className="demoIntelligence">
        <div>
          <span className="eyebrow">Hallim Intelligence</span>
          <h2>AI is attached to learning evidence—not bolted on as a chatbot.</h2>
          <p>Generated practice is constrained to material the learner has actually studied. Hallim does not claim speaking or pronunciation ability unless it has real evidence.</p>
        </div>
        <div className="demoToolGrid">
          {intelligence.map((tool,index) => <span key={tool}><i>{String(index+1).padStart(2,"0")}</i>{tool}</span>)}
        </div>
      </section>

      <section className="demoTrust">
        <article><small>ACCESS</small><b>Google sign-in</b><p>Hallim is previewable before sign-in; learner actions unlock through Google.</p></article>
        <article><small>SYNC</small><b>Cross-device</b><p>Google-signed-in learners keep their private progress synced across devices.</p></article>
        <article><small>PRIVACY</small><b>Per-user RLS</b><p>Learner rows are protected at the database layer.</p></article>
        <article><small>PROVIDER</small><b>GroqCloud</b><p>Hallim Intelligence uses server-side AI calls; the provider key is not exposed to the browser.</p></article>
      </section>

      <section className="publicCta">
        <span className="eyebrow">The demo ends here</span>
        <h2>The real product is the proof.</h2>
        <p>Open Hallim, choose a starting level, and run through the same flow a learner would actually use.</p>
        <a className="publicPrimary" href="/auth/google?next=%2F%3Fview%3Dhome">Open Hallim →</a>
      </section>

      <footer className="publicFooter"><span>Hallim · 한림</span><small>Structured Korean. Evidence-led progression.</small></footer>
    </main>
  );
}
