/**
 * @file currentUser.ts
 * SelfSubjectReview — who is logged in, system vs OpenShift groups.
 */
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { SelfSubjectReviewModel } from './constants';

type UserInfo = {
  username?: string;
  groups?: string[];
};

type SelfSubjectReviewKind = {
  status?: {
    userInfo?: UserInfo;
  };
};

export type CurrentUserInfo = {
  username: string;
  apiGroups: string[];
  openshiftGroups: string[];
};

const SYSTEM_GROUP_PREFIX = 'system:';

/** Groups from the API that are Kubernetes/OpenShift system identities. */
export const isSystemGroup = (group: string): boolean => group.startsWith(SYSTEM_GROUP_PREFIX);

export async function fetchSelfSubjectReview(): Promise<SelfSubjectReviewKind> {
  const response = await k8sCreate({
    model: SelfSubjectReviewModel,
    data: {
      apiVersion: 'authentication.k8s.io/v1',
      kind: 'SelfSubjectReview',
    },
  });
  return response as SelfSubjectReviewKind;
}

export function parseUserInfo(userInfo: UserInfo | undefined): CurrentUserInfo | null {
  const username = userInfo?.username?.trim();
  if (!username) {
    return null;
  }
  const allGroups = userInfo?.groups ?? [];
  return {
    username,
    apiGroups: allGroups.filter(isSystemGroup).sort((a, b) => a.localeCompare(b)),
    openshiftGroups: allGroups.filter((group) => !isSystemGroup(group)).sort((a, b) => a.localeCompare(b)),
  };
}
