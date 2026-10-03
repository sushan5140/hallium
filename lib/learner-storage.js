export const HALLIUM_GUEST_STORAGE_SUFFIX = ":guest";

export function scopedLearnerStorageKey(baseKey, guestMode = false) {
  const key = String(baseKey || "");
  return guestMode ? key + HALLIUM_GUEST_STORAGE_SUFFIX : key;
}

export function isGuestScopedStorageKey(key) {
  return String(key || "").endsWith(HALLIUM_GUEST_STORAGE_SUFFIX);
}


export function localLearnerStateBelongsToUser(ownerId, userId) {
  const owner = String(ownerId || "").trim();
  const user = String(userId || "").trim();
  if (!user) return false;
  return !owner || owner === user;
}

export function clearScopedLearnerStorage(storage, baseKeys, guestMode = false) {
  if (!storage || typeof storage.removeItem !== "function") return;
  for (const baseKey of baseKeys || []) {
    storage.removeItem(scopedLearnerStorageKey(baseKey, guestMode));
  }
}
