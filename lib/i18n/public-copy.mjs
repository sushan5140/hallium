export const PUBLIC_LOCALES=Object.freeze(["en","ko"]);
const copy={
 en:{skip:"Skip to main content",language:"Language",offlineTitle:"Hallim is offline right now.",offlineBody:"Reconnect to continue learning. Private learner data is not stored in the offline page cache.",retry:"Retry Hallim",community:"Community"},
 ko:{skip:"본문으로 건너뛰기",language:"언어",offlineTitle:"현재 Hallim에 연결할 수 없어요.",offlineBody:"인터넷 연결을 확인한 뒤 다시 시도해 주세요. 개인 학습 기록은 오프라인 페이지 캐시에 저장되지 않습니다.",retry:"Hallim 다시 시도",community:"커뮤니티"},
};
export function normalizePublicLocale(value){return PUBLIC_LOCALES.includes(String(value||"").toLowerCase())?String(value).toLowerCase():"en";}
export function publicCopy(locale="en"){return copy[normalizePublicLocale(locale)];}
