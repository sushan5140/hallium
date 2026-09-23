export default function sitemap() {
  const base = "https://hallium.vercel.app";
  return [
    { url: base + "/", changeFrequency: "weekly", priority: 1 },
    { url: base + "/demo", changeFrequency: "weekly", priority: 0.9 },
    { url: base + "/ambassadors", changeFrequency: "weekly", priority: 0.8 },
    { url: base + "/creator-kit", changeFrequency: "weekly", priority: 0.8 },
    { url: base + "/privacy", changeFrequency: "monthly", priority: 0.4 },
    { url: base + "/terms", changeFrequency: "monthly", priority: 0.4 },
  ];
}
