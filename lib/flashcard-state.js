export const FLASHCARD_INTELLIGENCE_KEY = "flashcards";

export function normalizeFlashcardIntelligence(value = {}) {
  return {
    cards: value?.cards && typeof value.cards === "object" ? value.cards : {},
    savedIds: Array.isArray(value?.savedIds) ? [...new Set(value.savedIds.map(String))] : [],
    catalog: Array.isArray(value?.catalog) ? value.catalog.filter(Boolean) : [],
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : "",
  };
}

export function mergeFlashcardIntelligence(local = {}, remote = {}) {
  const left = normalizeFlashcardIntelligence(local);
  const right = normalizeFlashcardIntelligence(remote);
  const cards = { ...right.cards };

  for (const [id, localCard] of Object.entries(left.cards)) {
    const remoteCard = cards[id];
    if (!remoteCard) {
      cards[id] = localCard;
      continue;
    }
    const localAt = Date.parse(localCard?.lastReviewedAt || 0) || 0;
    const remoteAt = Date.parse(remoteCard?.lastReviewedAt || 0) || 0;
    cards[id] = localAt >= remoteAt ? localCard : remoteCard;
  }

  const localUpdated = Date.parse(left.updatedAt || 0) || 0;
  const remoteUpdated = Date.parse(right.updatedAt || 0) || 0;
  const newest = localUpdated >= remoteUpdated ? left : right;

  return {
    cards,
    savedIds: [...new Set([...left.savedIds, ...right.savedIds])],
    catalog: newest.catalog.length ? newest.catalog : (left.catalog.length ? left.catalog : right.catalog),
    updatedAt: new Date(Math.max(localUpdated, remoteUpdated, 0)).toISOString(),
  };
}

export function flashcardIntelligenceWithCatalog(previous = {}, catalog = []) {
  const current = normalizeFlashcardIntelligence(previous);
  return {
    ...current,
    catalog: Array.isArray(catalog) ? catalog.filter(Boolean) : [],
    updatedAt: new Date().toISOString(),
  };
}
