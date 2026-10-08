export const metadata={
 title:"Hallim Community | Learn, contribute, improve",
 description:"Explore safe ways to improve Hallim Korean learning content without exposing private learner data.",
};
const paths=[
 {title:"Suggest a correction",description:"Found an unclear translation, instruction, example, or accessibility issue? Prepare a reviewable proposal.",href:"/community/contribute",tag:"Contribution"},
 {title:"Share a practice idea",description:"Describe a real Korean situation and the skill it should train. Drafts are not published automatically.",href:"/community/contribute",tag:"Contribution"},
 {title:"Creator field guide",description:"Get claim-safe demo sequences and learn how Hallim should be represented.",href:"/creator-kit",tag:"Creators"},
 {title:"Ambassador program",description:"Explore the existing invite-only pilot and approval process.",href:"/ambassadors",tag:"Partnership"},
 {title:"Private pilot feedback",description:"Invited creators can submit feedback through their one-time feedback link.",href:"/creator-feedback",tag:"Invite only"},
];
export default function CommunityPage(){
 return <main className="publicPage">
  <header className="publicNav"><a className="publicBrand" href="/"><i>ㅎ</i><span><b>Hallim</b><small>한림</small></span></a><nav><a href="/demo">Demo</a><a href="/creator-kit">Creator kit</a><a href="/">Home</a></nav></header>
  <section className="publicHero"><span className="eyebrow">HALLIM COMMUNITY</span><h1>Better Korean learning, shaped by real people.</h1><p>Contribute a correction, thoughtful practice idea, or cultural note. We review suggestions before using them. This is a contribution space, not a public feed of learner data.</p><div className="publicHeroActions"><a className="publicPrimary" href="/community/contribute">Prepare a contribution →</a><a className="publicSecondary" href="/creator-kit">Explore creator resources</a></div></section>
  <section className="publicSection"><div className="publicSectionHead"><span className="eyebrow">CHOOSE A PATH</span><h2>Contribute where your experience helps.</h2></div><div className="publicFeatureGrid">{paths.map(p=><article key={p.title}><small>{p.tag}</small><h3>{p.title}</h3><p>{p.description}</p><a href={p.href}>Explore →</a></article>)}</div></section>
  <section className="publicSection"><div className="publicSectionHead"><span className="eyebrow">TRUST FIRST</span><h2>Review before publication.</h2></div><p>Do not include names, messages, photos, audio, account details, classmates’ data, or copyrighted lessons without permission. A draft is not a submission. No public comment wall, private chat scraping, follower scores, or automatic user-generated publishing is enabled.</p><p>Approved material should be accurate, appropriately attributed, and suitable for language learners. Community suggestions never become official TOPIK scores or mastery evidence.</p></section>
  <footer className="publicFooter"><span>Hallim · 한림</span><small>Structured Korean. Evidence-led progression.</small></footer>
 </main>;
}