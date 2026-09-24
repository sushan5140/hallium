export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const pairFor = (a,b) => a < b ? { low:a, high:b } : { low:b, high:a };
const brief = (value,limit=180) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,limit);
export function publicTwin(t,p) {
  if (!t?.enabled || !p?.discoverable || t.user_id !== p.user_id) return null;
  return {
    id:t.user_id,
    name:brief(t.twin_name,35),
    intro:brief(t.intro,300),
    interests:brief(t.interests,180),
    tone:["friendly","playful","calm"].includes(t.tone) ? t.tone : "friendly",
    level:brief(p.level,30),
    gives:brief(p.strength,20),
    needs:brief(p.growth_area,20),
    availability:brief(p.availability,80)
  };
}
export function guidedPlan(a,b) {
  return {
    title:"The 15-minute skill swap",
    summary:a.name+" and "+b.name+" practise Korean together using their shared learning goals.",
    steps:[
      b.name+" helps with "+a.needs+" for five minutes.",
      a.name+" helps with "+b.needs+" for five minutes.",
      "Practise a short Korean conversation together and discuss what to review next."
    ],
    opener:"안녕하세요! 오늘 같이 한국어를 연습해요.",
    source:"guided"
  };
}
export function validatePlan(p) {
  if(!p || typeof p !== "object" || typeof p.title !== "string" || typeof p.summary !== "string" ||
     !Array.isArray(p.steps) || p.steps.length !== 3 || p.steps.some(s => typeof s !== "string" || !s.trim()) ||
     typeof p.opener !== "string" || !p.opener.trim()) return null;
  return {
    title:brief(p.title,100),
    summary:brief(p.summary,360),
    steps:p.steps.map(s=>brief(s,260)),
    opener:brief(p.opener,220),
    source:"groq"
  };
}
