/**
 * @file csvExport.test.ts
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { rowsToCsv } from '../csvExport';

describe('rowsToCsv', () => {
  it('escapes commas and quotes', () => {
    const csv = rowsToCsv(
      [{ name: 'a,b', note: 'say "hi"' }],
      [
        { header: 'Name', value: (row) => row.name },
        { header: 'Note', value: (row) => row.note },
      ],
    );
    assert.match(csv, /"a,b"/);
    assert.match(csv, /"say ""hi"""/);
  });

  it('prefixes spreadsheet formula characters', () => {
    const csv = rowsToCsv(
      [{ name: '=1+1' }],
      [{ header: 'Name', value: (row) => row.name }],
    );
    assert.match(csv, /'=1\+1/);
  });
});
