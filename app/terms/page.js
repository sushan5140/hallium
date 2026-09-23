import LegalPage from "../legal/LegalPage";

export const metadata = {
  title: "Terms & Conditions | Hallium",
  description: "Rules for using Hallium's signed-in Korean lessons, AI practice, and optional Study Partners.",
};

const sections = [
  { id:"scope", heading:"Using Hallium", paragraphs:[
    "These Terms & Conditions govern this Hallium (also displayed as Hallim) account-based Korean-learning app hosted on Vercel. By creating an account or using the application, you agree to use its features lawfully and in accordance with these terms. If you do not agree, do not use the account-based features.",
    "The static GitHub Pages Hangul Lab and flashcard demonstrations have their own preview-specific terms. The policies for those previews are not a substitute for these terms."
  ]},
  { id:"accounts", heading:"Your account and access", paragraphs:[
    "Google sign-in is used to access personalized Hallium learning progress and social features. Keep access to your Google account secure, do not impersonate others, and use the service only where you have permission to do so. You are responsible for activities initiated through your account, except where applicable law provides otherwise.",
    "The current core application is offered for learning and testing. No purchase or paid access entitlement is created by these terms. If paid services are introduced, their price and conditions should be disclosed separately before you are charged."
  ]},
  { id:"learning", heading:"Educational and AI limitations", paragraphs:[
    "Hallium provides Korean vocabulary, grammar, listening and practice content as educational aids. Romanization and browser voices are approximations; machine-generated study plans and feedback can be incomplete or wrong. Check important translations and pronunciation with reliable language-learning resources.",
    "Progress indicators, partner matching suggestions and AI-generated feedback are not certificates, official TOPIK results, verified teaching credentials or guarantees of improvement. AI-assisted partner exercise answers are not automatically graded unless the app expressly says otherwise."
  ]},
  { id:"community", heading:"Study Partners and respectful use", paragraphs:[
    "Study Partner discovery is optional. You choose whether to appear in discovery, whom to request, whether to accept, and which private notes to share. A connection must be accepted before the shared room is available.",
    "Communicate respectfully. Do not harass, threaten, spam, deceive, solicit sensitive information, or publish another person's private content without their permission. Use report and block controls where appropriate. We may restrict abusive access as reasonably necessary to protect the service and users."
  ]},
  { id:"notes", heading:"Your notes and sharing choices", paragraphs:[
    "You keep any rights you have in original notes and messages you create. By saving content in Hallium, you allow the app to store, display and process it to provide the features you select; by sharing a note or message, you permit its display to the intended accepted partner.",
    "Unsharing a note can revoke access to the shared link, but cannot take back a separate copy already saved by the recipient. Do not submit material that you do not have the right to share, or material containing passwords, health records or other sensitive details."
  ]},
  { id:"acceptable", heading:"Acceptable use and availability", points:[
    "Do not attack, scrape abusively, overload, reverse-engineer protected systems unlawfully, bypass access checks, or interfere with other learners.",
    "Do not share access credentials or attempt to obtain another account's private learning history or partner messages.",
    "We may correct, replace, suspend or discontinue experimental features while maintaining and improving Hallium. Access and local/cloud progress are not promised to be uninterrupted or permanently available."
  ]},
  { id:"third", heading:"Third-party services and privacy", paragraphs:[
    "Google authentication, Supabase account storage, Vercel hosting, Groq-powered AI where enabled, browser/device speech and external links may be subject to provider terms or availability. Hallium does not control those independent providers.",
    "Our Privacy Policy explains the current app's storage, visibility of partner information, use of AI providers, and available learner controls. Review it before sharing notes or using AI practice."
  ]},
  { id:"rights", heading:"Content rights and responsibility", paragraphs:[
    "Hallium's original interface, lessons and visual assets are provided for use within the app; these terms do not grant ownership of Hallium branding or third-party protected material. Any published source-code license governs the code covered by that license separately.",
    "We work to make the service useful and accurate, but do not promise an error-free app, uninterrupted hosting, perfect Korean translations, a compatible system voice or retention of every local record. Nothing in these terms removes rights or consumer protections that cannot legally be excluded."
  ]},
  { id:"changes", heading:"Updates and questions", paragraphs:[
    "We may update these terms as features and providers change. A revised effective date will identify a newly published version. Material changes should be explained before they govern a meaningfully different feature.",
    "For general corrections or accessibility feedback, the Hallium GitHub issue tracker is available publicly. Do not place account identifiers, private messages or sensitive information in a public issue; use an established private Hallium contact channel instead."
  ]}
];

export default function TermsPage() {
  return <LegalPage title="Terms & Conditions" subtitle="Simple ground rules for a more useful, respectful Korean-learning experience." sections={sections} current="terms" />;
}
