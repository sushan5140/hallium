export const metadata={title:"Hallim | Offline"};
export default function OfflinePage(){
 return <main className="publicPage"><section className="publicHero">
  <span className="eyebrow">CONNECTION UNAVAILABLE</span>
  <h1>Hallim is offline right now.</h1>
  <p>Reconnect to continue learning. For privacy, we do not store your private lessons, scores, conversations or account information in an offline page cache.</p>
  <div className="publicHeroActions"><a className="publicPrimary" href="/">Retry Hallim →</a><a className="publicSecondary" href="/community">Community</a></div>
 </section></main>;
}