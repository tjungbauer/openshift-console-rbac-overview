/**
 * @file ResourceSelect.tsx
 * Who-can resource preset and custom input.
 */
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { WHO_CAN_RESOURCE_OPTIONS } from './constants';
import { K } from './i18nKeys';
import { PresetOrCustomSelect } from './PresetOrCustomSelect';

type ResourceSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export const ResourceSelect: FC<ResourceSelectProps> = ({ id, value, onChange }) => {
  const { t } = useTranslation('plugin__rbac-overview');

  return (
    <PresetOrCustomSelect
      id={id}
      value={value}
      onChange={onChange}
      presets={WHO_CAN_RESOURCE_OPTIONS}
      customLabel={t(K.whoCan.customResource)}
      customPlaceholder={t(K.whoCan.enterCustomResource)}
      ariaLabel={t(K.field.resource)}
    />
  );
};
