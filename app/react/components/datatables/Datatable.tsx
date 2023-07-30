import {
  Table as TableInstance,
  TableState,
  useReactTable,
  Row,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getExpandedRowModel,
  TableOptions,
  TableMeta,
} from '@tanstack/react-table';
import { ReactNode, useMemo } from 'react';
import clsx from 'clsx';
import _ from 'lodash';

import { AutomationTestingProps } from '@/types';

import { IconProps } from '@@/Icon';

import { DatatableHeader } from './DatatableHeader';
import { DatatableFooter } from './DatatableFooter';
import { defaultGetRowId } from './defaultGetRowId';
import { Table } from './Table';
import { useGoToHighlightedRow } from './useGoToHighlightedRow';
import { BasicTableSettings, DefaultType } from './types';
import { DatatableContent } from './DatatableContent';
import { createSelectColumn } from './select-column';
import { TableRow } from './TableRow';
import { type TableState as GlobalTableState } from './useTableState';

type DefaultGlobalFilter = { search: string };

export interface Props<
  D extends DefaultType,
  TMeta extends TableMeta<D> = TableMeta<D>,
  TFilter extends DefaultGlobalFilter = DefaultGlobalFilter
> extends AutomationTestingProps {
  dataset: D[];
  columns: TableOptions<D>['columns'];
  renderTableSettings?(instance: TableInstance<D>): ReactNode;
  renderTableActions?(selectedRows: D[]): ReactNode;
  disableSelect?: boolean;
  getRowId?(row: D): string;
  isRowSelectable?(row: Row<D>): boolean;
  emptyContentLabel?: string;
  title?: string;
  titleIcon?: IconProps['icon'];
  initialTableState?: Partial<TableState>;
  isLoading?: boolean;
  totalCount?: number;
  description?: ReactNode;
  pageCount?: number;
  highlightedItemId?: string;
  onPageChange?(page: number): void;
  settingsManager: GlobalTableState<BasicTableSettings>;
  renderRow?(row: Row<D>, highlightedItemId?: string): ReactNode;
  getRowCanExpand?(row: Row<D>): boolean;
  noWidget?: boolean;
  meta?: TMeta;
  globalFilterFn?: typeof defaultGlobalFilterFn<D, TFilter>;
}

export function Datatable<
  D extends DefaultType,
  TMeta extends TableMeta<D> = TableMeta<D>,
  TFilter extends DefaultGlobalFilter = DefaultGlobalFilter
>({
  columns,
  dataset,
  renderTableSettings = () => null,
  renderTableActions = () => null,
  disableSelect,
  getRowId = defaultGetRowId,
  isRowSelectable = () => true,
  title,
  titleIcon,
  emptyContentLabel,
  initialTableState = {},
  isLoading,
  totalCount = dataset.length,
  description,
  pageCount,
  onPageChange = () => null,
  settingsManager: settings,
  renderRow = defaultRenderRow,
  highlightedItemId,
  noWidget,
  getRowCanExpand,
  'data-cy': dataCy,
  meta,
  globalFilterFn = defaultGlobalFilterFn,
}: Props<D, TMeta, TFilter>) {
  const isServerSidePagination = typeof pageCount !== 'undefined';
  const enableRowSelection = getIsSelectionEnabled(
    disableSelect,
    isRowSelectable
  );

  const allColumns = useMemo(
    () => _.compact([!disableSelect && createSelectColumn<D>(), ...columns]),
    [disableSelect, columns]
  );

  const tableInstance = useReactTable<D>({
    columns: allColumns,
    data: dataset,
    initialState: {
      pagination: {
        pageSize: settings.pageSize,
      },
      sorting: settings.sortBy ? [settings.sortBy] : [],
      globalFilter: {
        search: settings.search,
        ...initialTableState.globalFilter,
      },

      ...initialTableState,
    },
    defaultColumn: {
      enableColumnFilter: false,
      enableHiding: true,
    },
    enableRowSelection,
    autoResetExpanded: false,
    globalFilterFn,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
    ...(isServerSidePagination ? { manualPagination: true, pageCount } : {}),
    meta,
  });

  const tableState = tableInstance.getState();

  useGoToHighlightedRow(
    isServerSidePagination,
    tableState.pagination.pageSize,
    tableInstance.getCoreRowModel().rows,
    handlePageChange,
    highlightedItemId
  );

  const selectedRowModel = tableInstance.getSelectedRowModel();
  const selectedItems = selectedRowModel.rows.map((row) => row.original);

  return (
    <Table.Container noWidget={noWidget}>
      <DatatableHeader
        onSearchChange={handleSearchBarChange}
        searchValue={settings.search}
        title={title}
        titleIcon={titleIcon}
        description={description}
        renderTableActions={() => renderTableActions(selectedItems)}
        renderTableSettings={() => renderTableSettings(tableInstance)}
      />
      <DatatableContent<D>
        tableInstance={tableInstance}
        renderRow={(row) => renderRow(row, highlightedItemId)}
        emptyContentLabel={emptyContentLabel}
        isLoading={isLoading}
        onSortChange={handleSortChange}
        data-cy={dataCy}
      />

      <DatatableFooter
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        page={tableState.pagination.pageIndex}
        pageSize={tableState.pagination.pageSize}
        totalCount={totalCount}
        totalSelected={selectedItems.length}
      />
    </Table.Container>
  );

  function handleSearchBarChange(search: string) {
    tableInstance.setGlobalFilter({ search });
    settings.setSearch(search);
  }

  function handlePageChange(page: number) {
    tableInstance.setPageIndex(page);
    onPageChange(page);
  }

  function handleSortChange(colId: string, desc: boolean) {
    settings.setSortBy(colId, desc);
  }

  function handlePageSizeChange(pageSize: number) {
    tableInstance.setPageSize(pageSize);
    settings.setPageSize(pageSize);
  }
}

function defaultRenderRow<D extends DefaultType>(
  row: Row<D>,
  highlightedItemId?: string
) {
  return (
    <TableRow<D>
      cells={row.getVisibleCells()}
      className={clsx({
        active: highlightedItemId === row.id,
      })}
    />
  );
}

function getIsSelectionEnabled<D extends DefaultType>(
  disabledSelect?: boolean,
  isRowSelectable?: Props<D>['isRowSelectable']
) {
  if (disabledSelect) {
    return false;
  }

  if (isRowSelectable) {
    return isRowSelectable;
  }

  return true;
}

export function defaultGlobalFilterFn<D, TFilter extends { search: string }>(
  row: Row<D>,
  columnId: string,
  filterValue: null | TFilter
): boolean {
  const value = row.getValue(columnId);

  if (filterValue === null || !filterValue.search) {
    return true;
  }

  if (value == null) {
    return false;
  }

  const filterValueLower = filterValue.search.toLowerCase();

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value.toString().toLowerCase().includes(filterValueLower);
  }

  if (Array.isArray(value)) {
    return value.some((item) => item.toLowerCase().includes(filterValueLower));
  }

  return false;
}
