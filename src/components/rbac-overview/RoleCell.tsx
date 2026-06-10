/**
 * @file RoleCell.tsx
 * Role column: link, optional sensitive badge, and rules toggle on its own row.
 */
import { Td } from '@patternfly/react-table';
import type { FC } from 'react';

import { RoleResourceLink } from './ResourceLinks';
import { RoleRulesToggle } from './RoleRulesToggle';
import { SensitiveRoleLabel } from './SensitiveRoleLabel';

type RoleCellProps = {
  roleKind: string;
  roleName: string;
  namespace?: string;
  sensitiveRoleNames?: Set<string>;
  expandedKey: string | null;
  onToggle: (key: string | null) => void;
};

export const RoleCell: FC<RoleCellProps> = ({
  roleKind,
  roleName,
  namespace,
  sensitiveRoleNames,
  expandedKey,
  onToggle,
}) => {
  const showSensitive = sensitiveRoleNames?.has(roleName) ?? false;

  return (
    <Td className="rbac-overview__role-column">
      <div className="rbac-overview__role-cell">
        <div className="rbac-overview__role-cell-primary">
          <RoleResourceLink
            roleKind={roleKind}
            name={roleName}
            namespace={namespace}
            inline
          />
          {showSensitive ? (
            <SensitiveRoleLabel
              roleName={roleName}
              isClusterAdmin={roleName === 'cluster-admin'}
            />
          ) : null}
        </div>
        <RoleRulesToggle
          roleKind={roleKind}
          roleName={roleName}
          namespace={namespace}
          expandedKey={expandedKey}
          onToggle={onToggle}
        />
      </div>
    </Td>
  );
};
