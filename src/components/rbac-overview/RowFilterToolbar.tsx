/**
 * @file RowFilterToolbar.tsx
 * Kind/name filters and export button slot.
 */
import {
  MenuToggle,
  type MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import type { FC, MouseEvent, ReactNode, Ref } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SUBJECT_KIND_OPTIONS } from './filters';
import type { SubjectKind } from './types';
import { K } from './i18nKeys';

type RowFilterToolbarProps = {
  id: string;
  kinds: Set<string>;
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  onKindToggle: (kind: string, selected: boolean) => void;
  onClearKinds: () => void;
  onClearAll: () => void;
  kindOptions?: SubjectKind[];
  showKindFilter?: boolean;
  exportAction?: ReactNode;
};

const kindTranslationKey: Record<SubjectKind, string> = {
  User: K.subjectKind.user,
  Group: K.subjectKind.group,
  ServiceAccount: K.subjectKind.serviceAccount,
};

export const RowFilterToolbar: FC<RowFilterToolbarProps> = ({
  id,
  kinds,
  nameQuery,
  onNameQueryChange,
  onKindToggle,
  onClearKinds,
  onClearAll,
  kindOptions = SUBJECT_KIND_OPTIONS,
  showKindFilter = true,
  exportAction,
}) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const [kindMenuOpen, setKindMenuOpen] = useState(false);

  const kindChipLabels = useMemo(
    () => Array.from(kinds).map((kind) => t(kindTranslationKey[kind as SubjectKind] ?? kind)),
    [kinds, t],
  );

  const nameChipLabels = useMemo(() => {
    const trimmed = nameQuery.trim();
    return trimmed ? [trimmed] : [];
  }, [nameQuery]);

  const kindToggleLabel = useMemo(() => {
    if (kinds.size === 0) {
      return t(K.filter.byKind);
    }
    return kindChipLabels.join(', ');
  }, [kindChipLabels, kinds.size, t]);

  const kindToggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setKindMenuOpen((open) => !open)}
      isExpanded={kindMenuOpen}
      style={{ minWidth: '12rem', maxWidth: '20rem' }}
    >
      {kindToggleLabel}
    </MenuToggle>
  );

  const onKindSelect = (
    _event: MouseEvent<Element> | undefined,
    value: string | number | undefined,
  ) => {
    if (value === undefined) {
      return;
    }
    const kind = String(value);
    onKindToggle(kind, !kinds.has(kind));
  };

  return (
    <Toolbar
      id={`rbac-filter-toolbar-${id}`}
      className="rbac-overview__filter-toolbar pf-m-toggle-group-container"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={onClearAll}
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarFilter
              categoryName={t(K.column.name)}
              labels={nameChipLabels}
              deleteLabel={() => onNameQueryChange('')}
            >
              <ToolbarItem className="rbac-overview__toolbar-search">
                <SearchInput
                  placeholder={t(K.filter.searchByName)}
                  value={nameQuery}
                  onChange={(_event, value) => onNameQueryChange(value)}
                  onClear={() => onNameQueryChange('')}
                  aria-label={t(K.filter.searchByName)}
                />
              </ToolbarItem>
            </ToolbarFilter>
          </ToolbarGroup>
          {showKindFilter ? (
            <ToolbarGroup variant="filter-group">
              <ToolbarFilter
                categoryName={t(K.column.kind)}
                labels={kindChipLabels}
                deleteLabel={(_category, chipLabel) => {
                  const kind = kindOptions.find(
                    (option) => t(kindTranslationKey[option]) === chipLabel,
                  );
                  if (kind) {
                    onKindToggle(kind, false);
                  }
                }}
                deleteLabelGroup={onClearKinds}
              >
                <Select
                  id={`rbac-kind-select-${id}`}
                  isOpen={kindMenuOpen}
                  selected={Array.from(kinds)}
                  onSelect={onKindSelect}
                  onOpenChange={setKindMenuOpen}
                  toggle={kindToggle}
                  shouldFocusToggleOnSelect
                  aria-label={t(K.filter.byKind)}
                >
                  <SelectList>
                    {kindOptions.map((kind) => (
                      <SelectOption
                        key={kind}
                        value={kind}
                        hasCheckbox
                        isSelected={kinds.has(kind)}
                      >
                        {t(kindTranslationKey[kind])}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </ToolbarFilter>
            </ToolbarGroup>
          ) : null}
        </ToolbarToggleGroup>
        {exportAction ? <ToolbarItem align={{ default: 'alignEnd' }}>{exportAction}</ToolbarItem> : null}
      </ToolbarContent>
    </Toolbar>
  );
};
