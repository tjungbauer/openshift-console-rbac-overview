/**
 * @file TableExportButton.tsx
 * CSV download trigger.
 */
import { Button } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import { downloadCsv, rowsToCsv, type CsvColumn } from './csvExport';
import { K } from './i18nKeys';

type TableExportButtonProps<T> = {
  id: string;
  filename: string;
  rows: T[];
  columns: CsvColumn<T>[];
  isDisabled?: boolean;
};

export function TableExportButton<T>({
  id,
  filename,
  rows,
  columns,
  isDisabled = false,
}: TableExportButtonProps<T>) {
  const { t } = useTranslation('plugin__rbac-overview');

  const onExport = () => {
    if (!rows.length) {
      return;
    }
    downloadCsv(filename, rowsToCsv(rows, columns));
  };

  return (
    <Button
      id={id}
      variant="secondary"
      icon={<DownloadIcon />}
      onClick={onExport}
      isDisabled={isDisabled || !rows.length}
    >
      {t(K.common.exportCsv)}
    </Button>
  );
}
