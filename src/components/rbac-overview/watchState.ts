/**
 * @file watchState.ts
 * isWatchSettled() — treat 403 / finished loading as settled so tabs do not spin forever.
 */
/** Console k8s watches may leave `loaded` false when `loadError` is set — treat those as finished. */
export function isWatchSettled(loaded: boolean | undefined, error: unknown): boolean {
  return Boolean(loaded) || error != null;
}

type WatchResourceState = {
  loaded?: boolean;
  loadError?: unknown;
};

export function isResourceSettled(resource: WatchResourceState | undefined): boolean {
  // Watch disabled (null spec) — nothing to wait for.
  if (!resource) {
    return true;
  }
  return isWatchSettled(resource.loaded, resource.loadError);
}
