import { ReactNode } from 'react';
import { Row } from '@tanstack/react-table';

import { TableRow } from './TableRow';

interface Props<D extends Record<string, unknown>> {
  row: Row<D>;
  renderSubRow(row: Row<D>): ReactNode;
  expandOnClick?: boolean;
}

export function ExpandableDatatableTableRow<D extends Record<string, unknown>>({
  row,
  renderSubRow,
  expandOnClick,
}: Props<D>) {
  const cells = row.getVisibleCells();

  return (
    <>
      <TableRow<D>
        cells={cells}
        onClick={expandOnClick ? () => row.toggleExpanded() : undefined}
      />
      {row.getIsExpanded() && renderSubRow(row)}
    </>
  );
}
