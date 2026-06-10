/**
 * @file ApiGroupSelect.tsx
 * Who-can API group preset and custom input.
 */
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { WHO_CAN_API_GROUP_OPTIONS } from './constants';
import { K } from './i18nKeys';
import { PresetOrCustomSelect } from './PresetOrCustomSelect';

type ApiGroupSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export const ApiGroupSelect: FC<ApiGroupSelectProps> = ({ id, value, onChange }) => {
  const { t } = useTranslation('plugin__rbac-overview');

  const presetValues = useMemo(
    () => WHO_CAN_API_GROUP_OPTIONS.map((option) => option.value) as string[],
    [],
  );

  return (
    <PresetOrCustomSelect
      id={id}
      value={value}
      onChange={onChange}
      presets={presetValues}
      customLabel={t(K.whoCan.customApiGroup)}
      customPlaceholder={t(K.whoCan.placeholderApiGroup)}
      ariaLabel={t(K.field.apiGroup)}
      renderPresetLabel={(preset) => {
        const option = WHO_CAN_API_GROUP_OPTIONS.find((item) => item.value === preset);
        if (!option) {
          return preset;
        }
        return option.value ? option.labelKey : t(K.whoCan.coreApiEmpty);
      }}
    />
  );
};
