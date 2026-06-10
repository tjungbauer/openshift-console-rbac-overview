/**
 * @file RoleAccessTab.tsx
 * Pick a ClusterRole and list bindings that grant it.
 */
import { Alert, FormGroup, Title } from '@patternfly/react-core';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ConsoleSingleSelect } from './ConsoleSingleSelect';
import { BindingsTable } from './BindingsTable';
import { TabContentGate } from './TabContentGate';
import { TabPermissionAlert } from './TabPermissionAlert';
import { useRbacUrlState } from './useRbacUrlState';
import { useRoleAccessTab } from './useRoleAccessTab';
import { useTabPermissions } from './useTabPermissions';
import { K } from './i18nKeys';

export const RoleAccessTab: FC = () => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { params, updateParams } = useRbacUrlState();
  const selectedRoleName = params.roleName ?? '';
  const permissions = useTabPermissions('role-access');
  const { clusterRoleNames, bindingRows, loaded, error } = useRoleAccessTab(selectedRoleName);

  const roleOptions = useMemo(
    () => clusterRoleNames.map((name) => ({ value: name, label: name })),
    [clusterRoleNames],
  );

  return (
    <TabContentGate tab="role-access" permissions={permissions} loaded={loaded} error={error}>
      <div className="rbac-overview__tab-content">
        <TabPermissionAlert tab="role-access" />
        <Alert variant="info" isInline title={t(K.tab.roleAccess)} className="rbac-overview__tab-intro">
          {t(K.tabIntro.roleAccess)}
        </Alert>
        <FormGroup label={t(K.roleAccess.clusterRole)} fieldId="role-access-picker">
          <ConsoleSingleSelect
            id="role-access-picker"
            value={selectedRoleName}
            onChange={(value) => updateParams({ tab: 'role-access', roleName: value })}
            ariaLabel={t(K.roleAccess.clusterRole)}
            options={roleOptions}
            placeholder={t(K.roleAccess.selectRole)}
          />
        </FormGroup>
        {selectedRoleName ? (
          <>
            <Title headingLevel="h4" size="md">
              {t(K.roleAccess.bindingsFor, { role: selectedRoleName })} ({bindingRows.length})
            </Title>
            <BindingsTable rows={bindingRows} />
          </>
        ) : null}
      </div>
    </TabContentGate>
  );
};
