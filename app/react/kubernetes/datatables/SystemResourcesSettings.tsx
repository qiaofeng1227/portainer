import { useAuthorizations } from '@/react/hooks/useUser';

import { ZustandSetFunc } from '@@/datatables/types';
import { Checkbox } from '@@/form-components/Checkbox';

export function SystemResourcesSettings({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const authorized = useAuthorizations(
    'K8sAccessSystemNamespaces',
    undefined,
    true
  );
  if (!authorized) {
    return null;
  }

  return (
    <Checkbox
      id="show-system-resources"
      label="Show system resources"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

export interface SystemResourcesTableSettings {
  showSystemResources: boolean;
  setShowSystemResources: (value: boolean) => void;
}

export function systemResourcesSettings<T extends SystemResourcesTableSettings>(
  set: ZustandSetFunc<T>
): SystemResourcesTableSettings {
  return {
    showSystemResources: false,
    setShowSystemResources(showSystemResources: boolean) {
      set((s) => ({
        ...s,
        showSystemResources,
      }));
    },
  };
}
