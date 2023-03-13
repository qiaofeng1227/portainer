import {
  refreshableSettings,
  createPersistedStore,
  BasicTableSettings,
  RefreshableTableSettings,
} from '@@/datatables/types';

import {
  SystemResourcesTableSettings,
  systemResourcesSettings,
} from '../../datatables/SystemResourcesSettings';

export interface TableSettings
  extends BasicTableSettings,
    RefreshableTableSettings,
    SystemResourcesTableSettings {}

export function createStore(storageKey: string) {
  return createPersistedStore<TableSettings>(storageKey, 'name', (set) => ({
    ...refreshableSettings(set),
    ...systemResourcesSettings(set),
  }));
}
