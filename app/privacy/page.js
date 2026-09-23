import LegalPage from "../legal/LegalPage";

export const metadata = {
  title: "Privacy Policy | Hallium",
  description: "How Hallium handles account details, Korean-learning progress, partner features, and AI-assisted practice.",
};

const sections = [
  { id:"scope", heading:"What this policy covers", paragraphs:[
    "This policy explains how Hallium (also displayed as Hallim) handles personal information when you use this Vercel-hosted Korean-learning application, including Google sign-in, learning activities, AI features, referrals, and Study Partners.",
    "The separate public Hangul Lab and flashcard demos hosted on GitHub Pages have different, preview-specific privacy notices. Their browser-only progress must not be confused with the account records described here."
  ]},
  { id:"collect", heading:"Information used by the app", paragraphs:[
    "If you sign in with Google, the authentication service may provide an account identifier, email address, display name, and profile image when available. Hallium uses your sign-in identity to associate your private learner records with your account.",
    "Hallium can save the current and target Korean levels you select, completed lessons, answers and study-test results, mistake and review history, study plans, AI audit and intelligence records, and the approved referral code that brought you here. Some progress and preferences are cached in your browser and synchronized with your account in Supabase."
  ],points:[
    "Study Partners: a nickname, selected level, availability, stated or diagnostically informed vocabulary/grammar focus, and your opt-in discovery setting.",
    "Content you choose to create: private vocabulary or grammar notes, selected notes shared with a partner, joint notes, messages, mutual practice answers and sessions, and reports about another learner.",
    "Technical data required to deliver the site, authenticate requests, secure sessions and troubleshoot errors; hosting and service providers may receive IP address, request details, device or browser information and timestamps."
  ]},
  { id:"use", heading:"Why this information is used", paragraphs:[
    "We use the information to sign you in, keep your learning history available across sessions, personalize review and study routes, support optional partner connections, limit misuse, respond to reports, and understand which approved creator referral led to registration.",
    "We do not present lesson completion, practice scores or AI feedback as a formal language qualification or official TOPIK result."
  ]},
  { id:"partners", heading:"What other learners can see", paragraphs:[
    "Study Partner discovery is off by default. If you enable it, other signed-in learners using discovery can see the nickname, selected level, availability, and vocabulary/grammar focus on your partner profile. Your email address and raw learning records are not intended to appear in discovery.",
    "A partnership request does not by itself open a shared room. After the other learner accepts, both members can see messages, joint notes, shared-note selections and mutual practice within that connection. Individual private notes are only shared when you select them. Revoking access stops future viewing through the shared-note link, but a partner may keep a separate copy they already saved. Blocking or ending a partnership closes shared-room access under the application's permissions."
  ]},
  { id:"ai", heading:"AI and speech providers", paragraphs:[
    "When you use AI study plans, feedback, audits or adaptive practice, the relevant learner snapshot or study content is sent through Hallium's server to Groq to generate the requested result. In mutual partner practice, eligible notes deliberately shared by both partners can be included in the prompt. Avoid entering sensitive details into lessons, notes or messages.",
    "Hallium uses browser or device speech tools for some pronunciation playback. Depending on the voice and platform, your device or browser provider may process the spoken text locally or through its own service. The app does not claim to independently assess your spoken pronunciation from this playback."
  ]},
  { id:"providers", heading:"Services and storage", paragraphs:[
    "Vercel hosts the account application; Supabase provides authentication and database storage; Google supports Google sign-in; Groq processes prompts for enabled AI features; and browser, device, and font providers may process technical requests when their services are used. Each provider may have its own terms, safeguards and retention practices.",
    "Hallium's browser storage may include account-related progress, review data, preferences, and referral attribution. Clearing browser storage or signing out does not automatically remove the corresponding account records in Supabase or copies a partner retained."
  ]},
  { id:"choices", heading:"Your controls and requests", points:[
    "Sign out if you no longer want to keep a Hallium session active on that browser.",
    "Switch partner discovery off, decline requests, stop a partnership, block a learner, or unshare individual notes through the available Study Partners controls.",
    "Clear Hallium site data in your browser to remove locally stored records on that device; this does not delete cloud data.",
    "For questions, correction or deletion of account-related data, contact Hallium through an established private communication channel. Do not publish private information in public GitHub issues. Some information may need to be retained where required by applicable law or for legitimate security and dispute-handling purposes."
  ]},
  { id:"retention", heading:"Retention and security", paragraphs:[
    "Account-based information may remain while your account and related features are in use. We do not promise a specific automatic deletion date for cloud learning records. Messages or notes already copied by another learner are outside the original shared-note permission link.",
    "We use provider authentication and application access controls, including Supabase row-level policies for Study Partners, but no online service can guarantee absolute security. Do not share passwords, API keys, private documents or other sensitive material in learner notes or messages."
  ]},
  { id:"children", heading:"Younger learners", paragraphs:[
    "The learning app is not a place to submit sensitive information about children. Anyone who needs parental or guardian permission to use online services under applicable local rules should obtain that permission before creating an account or enabling social features."
  ]},
  { id:"updates", heading:"Changes and contact", paragraphs:[
    "If Hallium adds payment, new social tools, new AI providers, advertising, or materially different collection or sharing, we will revise this policy to describe the actual feature. The effective date above tells you when this version was published.",
    "For general product questions and corrections, you may use the public Hallium GitHub issue tracker, but never include personal account information or deletion-request details in a public issue. Use an existing private Hallium contact channel for those matters."
  ]}
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" subtitle="Your learning belongs to you. Here is what the account-based Hallium app stores, shares and sends to service providers." sections={sections} current="privacy" />;
}
