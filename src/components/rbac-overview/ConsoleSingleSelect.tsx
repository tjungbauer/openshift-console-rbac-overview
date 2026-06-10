/**
 * @file ConsoleSingleSelect.tsx
 * Single-select dropdown using MenuToggle + Select (matches OpenShift console filters).
 */
import { MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';
import type { FC } from 'react';
import { useState } from 'react';

export type ConsoleSelectOption = {
  value: string;
  label: string;
};

type ConsoleSingleSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly ConsoleSelectOption[];
  ariaLabel: string;
  placeholder?: string;
};

export const ConsoleSingleSelect: FC<ConsoleSingleSelectProps> = ({
  id,
  value,
  onChange,
  options,
  ariaLabel,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const toggleLabel = selectedOption?.label ?? placeholder ?? '';

  return (
    <Select
      id={id}
      isOpen={isOpen}
      selected={value}
      onSelect={(_event, selected) => {
        if (selected !== undefined) {
          onChange(String(selected));
          setIsOpen(false);
        }
      }}
      onOpenChange={setIsOpen}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          isFullWidth
          aria-label={ariaLabel}
          className="rbac-overview__console-select-toggle"
        >
          {toggleLabel}
        </MenuToggle>
      )}
    >
      <SelectList id={`${id}-list`}>
        {options.map((option) => (
          <SelectOption key={option.value || 'empty'} value={option.value} isSelected={option.value === value}>
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};
