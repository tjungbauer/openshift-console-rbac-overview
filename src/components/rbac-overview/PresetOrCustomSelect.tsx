/**
 * @file PresetOrCustomSelect.tsx
 * Console-style select for presets; TextInput when a custom value is active.
 */
import { TextInput } from '@patternfly/react-core';
import type { FC } from 'react';
import { useMemo } from 'react';

import { ConsoleSingleSelect, type ConsoleSelectOption } from './ConsoleSingleSelect';

const CUSTOM_VALUE = '__custom__';

type PresetOrCustomSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  presets: readonly string[];
  customLabel: string;
  customPlaceholder: string;
  ariaLabel: string;
  renderPresetLabel?: (preset: string) => string;
};

export const PresetOrCustomSelect: FC<PresetOrCustomSelectProps> = ({
  id,
  value,
  onChange,
  presets,
  customLabel,
  customPlaceholder,
  ariaLabel,
  renderPresetLabel,
}) => {
  const isPreset = useMemo(() => (presets as readonly string[]).includes(value), [presets, value]);

  const selectOptions: ConsoleSelectOption[] = useMemo(
    () => [
      ...presets.map((preset) => ({
        value: preset,
        label: renderPresetLabel ? renderPresetLabel(preset) : preset,
      })),
      { value: CUSTOM_VALUE, label: customLabel },
    ],
    [customLabel, presets, renderPresetLabel],
  );

  const selectValue = isPreset ? value : CUSTOM_VALUE;

  return (
    <>
      <ConsoleSingleSelect
        id={id}
        value={selectValue}
        onChange={(selected) => {
          if (selected === CUSTOM_VALUE) {
            onChange('');
            return;
          }
          onChange(selected);
        }}
        options={selectOptions}
        ariaLabel={ariaLabel}
      />
      {!isPreset ? (
        <TextInput
          id={`${id}-custom`}
          className="rbac-overview__custom-select-input"
          value={value}
          placeholder={customPlaceholder}
          onChange={(_event, next) => onChange(next)}
          aria-label={ariaLabel}
        />
      ) : null}
    </>
  );
};
