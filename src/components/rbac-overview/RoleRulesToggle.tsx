/**
 * @file RoleRulesToggle.tsx
 * Expand/collapse control and full-width rules row for binding tables.
 */
import { Button } from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { RoleRulesPanel } from './RoleRulesPanel';
import { roleRefKey } from './pluginConfig';
import { K } from './i18nKeys';

type RoleRulesToggleProps = {
  roleKind: string;
  roleName: string;
  namespace?: string;
  expandedKey: string | null;
  onToggle: (key: string | null) => void;
};

export const RoleRulesToggle: FC<RoleRulesToggleProps> = ({
  roleKind,
  roleName,
  namespace,
  expandedKey,
  onToggle,
}) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const key = roleRefKey(roleKind, roleName, namespace);
  const isExpanded = expandedKey === key;

  return (
    <div className="rbac-overview__role-rules-action">
      <Button
        variant="secondary"
        size="sm"
        icon={isExpanded ? <AngleDownIcon aria-hidden /> : <AngleRightIcon aria-hidden />}
        onClick={() => onToggle(isExpanded ? null : key)}
      >
        {isExpanded ? t(K.roleRules.hide) : t(K.roleRules.view)}
      </Button>
    </div>
  );
};

type RoleRulesExpandedRowProps = {
  colSpan: number;
  roleKind: string;
  roleName: string;
  namespace?: string;
  expandedKey: string | null;
};

/** Renders policy rules across the full table width when expanded. */
export const RoleRulesExpandedRow: FC<RoleRulesExpandedRowProps> = ({
  colSpan,
  roleKind,
  roleName,
  namespace,
  expandedKey,
}) => {
  const key = roleRefKey(roleKind, roleName, namespace);

  if (expandedKey !== key) {
    return null;
  }

  return (
    <Tr className="rbac-overview__role-rules-row">
      <Td colSpan={colSpan} className="rbac-overview__role-rules-cell">
        <RoleRulesPanel roleKind={roleKind} roleName={roleName} namespace={namespace} />
      </Td>
    </Tr>
  );
};
