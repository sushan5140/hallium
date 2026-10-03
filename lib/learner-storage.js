export const HALLIUM_GUEST_STORAGE_SUFFIX = ":guest";

export function scopedLearnerStorageKey(baseKey, guestMode = false) {
  const key = String(baseKey || "");
  return guestMode ? key + HALLIUM_GUEST_STORAGE_SUFFIX : key;
}

export function isGuestScopedStorageKey(key) {
  return String(key || "").endsWith(HALLIUM_GUEST_STORAGE_SUFFIX);
}
