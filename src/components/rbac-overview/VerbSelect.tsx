/**
 * @file VerbSelect.tsx
 * Who-can verb preset and custom input.
 */
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { WHO_CAN_VERB_OPTIONS } from './constants';
import { K } from './i18nKeys';
import { PresetOrCustomSelect } from './PresetOrCustomSelect';

type VerbSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export const VerbSelect: FC<VerbSelectProps> = ({ id, value, onChange }) => {
  const { t } = useTranslation('plugin__rbac-overview');

  return (
    <PresetOrCustomSelect
      id={id}
      value={value}
      onChange={onChange}
      presets={WHO_CAN_VERB_OPTIONS}
      customLabel={t(K.whoCan.customVerb)}
      customPlaceholder={t(K.whoCan.enterCustomVerb)}
      ariaLabel={t(K.field.verb)}
    />
  );
};
