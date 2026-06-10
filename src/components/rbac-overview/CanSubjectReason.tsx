/**
 * @file CanSubjectReason.tsx
 * Renders parsed SAR reason with clickable resource links.
 */
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { parseCanSubjectReason } from './canSubjectReasonParser';
import { K } from './i18nKeys';
import {
  BindingResourceLink,
  RoleResourceLink,
  SubjectResourceLink,
} from './ResourceLinks';

type CanSubjectReasonProps = {
  reason?: string;
};

export const CanSubjectReason: FC<CanSubjectReasonProps> = ({ reason }) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const parsed = useMemo(() => parseCanSubjectReason(reason), [reason]);

  if (!reason) {
    return <span>{t(K.canSubject.noReason)}</span>;
  }

  if (!parsed) {
    return <span>{reason}</span>;
  }

  return (
    <div className="rbac-overview__inline-sentence">
      <span>
        {t(K.common.rbac)}: {parsed.decision} {t(K.common.by)}{' '}
        {parsed.bindingKind === 'RoleBinding' ? t(K.bindingKind.roleBinding) : t(K.bindingKind.clusterRoleBinding)}
      </span>
      {parsed.bindingKind === 'RoleBinding' && parsed.bindingNamespace ? (
        <BindingResourceLink
          bindingKind="RoleBinding"
          name={parsed.bindingName}
          namespace={parsed.bindingNamespace}
          inline
        />
      ) : (
        <BindingResourceLink bindingKind="ClusterRoleBinding" name={parsed.bindingName} inline />
      )}
      <span>
        {t(K.common.of)} {parsed.roleKind}
      </span>
      <RoleResourceLink
        roleKind={parsed.roleKind}
        name={parsed.roleName}
        namespace={parsed.roleKind === 'Role' ? parsed.bindingNamespace : undefined}
        inline
      />
      <span>
        {t(K.common.to)} {parsed.subjectKind}
      </span>
      <SubjectResourceLink
        kind={parsed.subjectKind}
        name={parsed.subjectName}
        namespace={parsed.subjectNamespace}
        inline
      />
    </div>
  );
};

type CanSubjectEvaluatedGroupsProps = {
  groups: string[];
};

export const CanSubjectEvaluatedGroups: FC<CanSubjectEvaluatedGroupsProps> = ({ groups }) => {
  const { t } = useTranslation('plugin__rbac-overview');

  if (groups.length === 1) {
    return (
      <div className="rbac-overview__inline-sentence">
        <span>{t(K.canSubject.userChecksIncludeGroups)}</span>
        <SubjectResourceLink kind="Group" name={groups[0]} inline />
      </div>
    );
  }

  return (
    <div className="rbac-overview__evaluated-groups">
      <p className="rbac-overview__evaluated-groups-intro">{t(K.canSubject.userChecksIncludeGroups)}</p>
      <ul className="rbac-overview__evaluated-groups-list">
        {groups.map((group) => (
          <li key={group} className="rbac-overview__inline-sentence">
            <SubjectResourceLink kind="Group" name={group} inline />
          </li>
        ))}
      </ul>
    </div>
  );
};
