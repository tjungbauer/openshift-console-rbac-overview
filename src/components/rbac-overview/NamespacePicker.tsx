/**
 * @file NamespacePicker.tsx
 * Single-select namespace dropdown (console-style MenuToggle + filter in menu).
 */
import {
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { K } from './i18nKeys';
import { useProjectNamespaces } from './useProjectNamespaces';

type NamespacePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
};

export const NamespacePicker: FC<NamespacePickerProps> = ({
  id,
  value,
  onChange,
  placeholder,
  allowEmpty = false,
  emptyLabel,
}) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { namespaces, loaded } = useProjectNamespaces();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFilter('');
    }
  }, [isOpen]);

  const filteredNamespaces = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) {
      return namespaces;
    }
    return namespaces.filter((namespace) => namespace.toLowerCase().includes(needle));
  }, [filter, namespaces]);

  const onSelect = (_event: React.MouseEvent<Element> | undefined, selected?: string | number) => {
    onChange(String(selected ?? ''));
    setIsOpen(false);
  };

  const toggleLabel = value || placeholder || t(K.namespace.select);

  if (!loaded) {
    return <Spinner size="sm" aria-label={t(K.namespace.loading)} />;
  }

  return (
    <Select
      id={id}
      isOpen={isOpen}
      selected={value}
      onSelect={onSelect}
      onOpenChange={setIsOpen}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          isFullWidth
          aria-label={t(K.column.namespace)}
          className="rbac-overview__namespace-toggle"
        >
          {toggleLabel}
        </MenuToggle>
      )}
      maxMenuHeight="320px"
    >
      <div className="rbac-overview__namespace-picker-filter">
        <SearchInput
          value={filter}
          onChange={(_event, next) => setFilter(next)}
          onClear={() => setFilter('')}
          placeholder={t(K.filter.searchByName)}
          aria-label={t(K.namespace.select)}
        />
      </div>
      <SelectList id={`${id}-list`}>
        {allowEmpty ? (
          <SelectOption value="" isSelected={!value}>
            {emptyLabel ?? t(K.namespace.select)}
          </SelectOption>
        ) : null}
        {filteredNamespaces.length ? (
          filteredNamespaces.map((namespace) => (
            <SelectOption key={namespace} value={namespace} isSelected={namespace === value}>
              {namespace}
            </SelectOption>
          ))
        ) : (
          <SelectOption value="" isAriaDisabled isDisabled>
            {t(K.namespace.noSearchMatches)}
          </SelectOption>
        )}
      </SelectList>
    </Select>
  );
};
