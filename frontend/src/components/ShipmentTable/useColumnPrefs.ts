import { useCallback, useEffect, useState } from 'react';
import { ColumnKey, COLUMN_ORDER_DEFAULT } from './types';

const STORAGE_KEY = 'vsm.shipmentsTable.columnPrefs.v1';

export interface ColumnPrefs {
  order: ColumnKey[];
  hidden: Partial<Record<ColumnKey, boolean>>;
}

function loadPrefs(): ColumnPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: [...COLUMN_ORDER_DEFAULT], hidden: {} };
    const parsed = JSON.parse(raw) as Partial<ColumnPrefs>;
    const validOrder = (parsed.order ?? []).filter((k): k is ColumnKey =>
      COLUMN_ORDER_DEFAULT.includes(k as ColumnKey),
    );
    const missing = COLUMN_ORDER_DEFAULT.filter((k) => !validOrder.includes(k));
    return {
      order: [...validOrder, ...missing],
      hidden: parsed.hidden ?? {},
    };
  } catch {
    return { order: [...COLUMN_ORDER_DEFAULT], hidden: {} };
  }
}

function savePrefs(prefs: ColumnPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

export function useColumnPrefs() {
  const [prefs, setPrefs] = useState<ColumnPrefs>(() => loadPrefs());

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const toggleVisible = useCallback((key: ColumnKey) => {
    setPrefs((p) => ({ ...p, hidden: { ...p.hidden, [key]: !p.hidden[key] } }));
  }, []);

  const reorder = useCallback((fromKey: ColumnKey, toKey: ColumnKey) => {
    setPrefs((p) => {
      const from = p.order.indexOf(fromKey);
      const to = p.order.indexOf(toKey);
      if (from < 0 || to < 0 || from === to) return p;
      const next = [...p.order];
      next.splice(from, 1);
      next.splice(to, 0, fromKey);
      return { ...p, order: next };
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs({ order: [...COLUMN_ORDER_DEFAULT], hidden: {} });
  }, []);

  const visibleOrdered = prefs.order.filter((k) => !prefs.hidden[k]);

  return { prefs, visibleOrdered, toggleVisible, reorder, reset };
}
