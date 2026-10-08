"use client";
import {useState} from "react";
import {publicCopy} from "../../lib/i18n/public-copy.mjs";
export default function OfflineContent(){
 const [locale,setLocale]=useState("en");const t=publicCopy(locale);
 return <main className="publicPage" lang={locale}><section className="publicHero">
  <label htmlFor="offline-language">{t.language}</label>
  <select id="offline-language" value={locale} onChange={e=>setLocale(e.target.value)}>
   <option value="en">English</option><option value="ko">한국어</option>
  </select>
  <h1>{t.offlineTitle}</h1><p>{t.offlineBody}</p>
  <div className="publicHeroActions"><a className="publicPrimary" href="/">{t.retry} →</a><a className="publicSecondary" href="/community">{t.community}</a></div>
 </section></main>;
}