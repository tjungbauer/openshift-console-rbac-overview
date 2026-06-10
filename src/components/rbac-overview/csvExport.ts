/**
 * @file csvExport.ts
 * Build CSV string and trigger browser download for table export.
 */
export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string;
};

const escapeCsvCell = (value: string): string => {
  const normalized = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
};

export function rowsToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(',');
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvCell(column.value(row) ?? '')).join(','),
  );
  return [header, ...body].join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
