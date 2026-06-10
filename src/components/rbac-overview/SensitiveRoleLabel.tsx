/**
 * @file SensitiveRoleLabel.tsx
 * Badge for cluster-admin and configured sensitive roles.
 */
import { Label } from '@patternfly/react-core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { K } from './i18nKeys';

type SensitiveRoleLabelProps = {
  roleName?: string;
  isClusterAdmin?: boolean;
};

export const SensitiveRoleLabel: FC<SensitiveRoleLabelProps> = ({ isClusterAdmin }) => {
  const { t } = useTranslation('plugin__rbac-overview');

  return (
    <Label className="rbac-overview__danger-badge" color={isClusterAdmin ? 'red' : 'orange'}>
      {isClusterAdmin ? t(K.clusterAdmins.clusterAdminBadge) : t(K.clusterAdmins.sensitiveRoleBadge)}
    </Label>
  );
};
