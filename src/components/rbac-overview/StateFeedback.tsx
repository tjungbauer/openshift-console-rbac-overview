/**
 * @file StateFeedback.tsx
 * TabLoadingState spinner and TabErrorAlert for failed watches.
 */
import { Alert, Bullseye, Spinner } from '@patternfly/react-core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { k8sClientErrorMessage } from './k8sClientError';
import { K } from './i18nKeys';

export const TabLoadingState: FC = () => {
  const { t } = useTranslation('plugin__rbac-overview');
  return (
    <Bullseye>
      <Spinner size="xl" aria-label={t(K.common.loading)} />
    </Bullseye>
  );
};

type TabErrorAlertProps = {
  error: unknown;
};

export const TabErrorAlert: FC<TabErrorAlertProps> = ({ error }) => {
  const { t } = useTranslation('plugin__rbac-overview');
  return (
    <Alert variant="danger" isInline title={t(K.common.error)} component="p">
      {k8sClientErrorMessage(error)}
    </Alert>
  );
};
