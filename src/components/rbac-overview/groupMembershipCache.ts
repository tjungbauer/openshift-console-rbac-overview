/**
 * @file groupMembershipCache.ts
 * In-memory TTL cache for user→groups lookups (avoids repeated API calls).
 */
const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  groups: string[];
  expiresAt: number;
};

const membershipCache = new Map<string, CacheEntry>();

export function getCachedUserGroups(userName: string): string[] | undefined {
  const entry = membershipCache.get(userName);
  if (!entry) {
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    membershipCache.delete(userName);
    return undefined;
  }
  return entry.groups;
}

export function setCachedUserGroups(userName: string, groups: string[]): void {
  membershipCache.set(userName, {
    groups,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
