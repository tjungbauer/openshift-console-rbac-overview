/**
 * @file identity.ts
 * Fetch OpenShift User / Group objects; resolve which groups a username belongs to.
 */
import { k8sGet, k8sListItems } from '@openshift-console/dynamic-plugin-sdk';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { GroupModel, UserModel } from './constants';
import { getCachedUserGroups, setCachedUserGroups } from './groupMembershipCache';

export type UserIdentity = {
  providerName?: string;
  providerUserName?: string;
};

export type OpenShiftUser = K8sResourceCommon & {
  identities?: UserIdentity[];
  groups?: string[];
  fullName?: string;
};

export type OpenShiftGroup = K8sResourceCommon & {
  users?: string[];
};

const sortGroups = (groups: Set<string>): string[] => Array.from(groups).sort((a, b) => a.localeCompare(b));

/**
 * Resolves OpenShift group memberships for a user.
 * Uses `User.groups` when present; lists all Groups only as a fallback when that field is empty.
 */
export async function resolveUserGroupMembership(userName: string): Promise<string[]> {
  const cached = getCachedUserGroups(userName);
  if (cached) {
    return cached;
  }

  const groups = new Set<string>();
  let userReadable = false;

  try {
    const user = (await k8sGet({ model: UserModel, name: userName })) as OpenShiftUser;
    userReadable = true;
    user.groups?.forEach((group) => groups.add(group));
  } catch {
    // User object may not be readable for the current caller.
  }

  if (userReadable && groups.size > 0) {
    const resolved = sortGroups(groups);
    setCachedUserGroups(userName, resolved);
    return resolved;
  }

  try {
    const groupItems = (await k8sListItems({ model: GroupModel, queryParams: {} })) as OpenShiftGroup[];
    groupItems.forEach((group) => {
      const name = group.metadata?.name;
      if (name && group.users?.includes(userName)) {
        groups.add(name);
      }
    });
  } catch {
    // Group list may not be readable for the current caller.
  }

  const resolved = sortGroups(groups);
  setCachedUserGroups(userName, resolved);
  return resolved;
}

export const formatUserIdentities = (user: OpenShiftUser | undefined): string[] => {
  if (!user?.identities?.length) {
    return [];
  }
  return user.identities.map((identity) => {
    const provider = identity.providerName ?? 'unknown';
    const name = identity.providerUserName ?? '';
    return name ? `${provider}: ${name}` : provider;
  });
};
