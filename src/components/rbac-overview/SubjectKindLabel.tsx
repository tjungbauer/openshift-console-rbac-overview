/**
 * @file SubjectKindLabel.tsx
 * Compact User / Group / ServiceAccount label.
 */
import { Label } from '@patternfly/react-core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { K } from './i18nKeys';
import type { SubjectKind } from './types';

const KIND_COLORS: Record<SubjectKind, 'blue' | 'purple' | 'teal'> = {
  User: 'blue',
  Group: 'purple',
  ServiceAccount: 'teal',
};

const kindTranslationKey: Record<SubjectKind, string> = {
  User: K.subjectKind.user,
  Group: K.subjectKind.group,
  ServiceAccount: K.subjectKind.serviceAccount,
};

type SubjectKindLabelProps = {
  kind: SubjectKind | string;
  className?: string;
};

export const SubjectKindLabel: FC<SubjectKindLabelProps> = ({ kind, className }) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const subjectKind = kind as SubjectKind;
  const color = KIND_COLORS[subjectKind] ?? 'grey';

  return (
    <Label className={className} color={color} isCompact>
      {t(kindTranslationKey[subjectKind] ?? kind)}
    </Label>
  );
};
