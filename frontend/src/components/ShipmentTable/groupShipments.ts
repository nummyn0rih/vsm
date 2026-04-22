import dayjs from 'dayjs';
import { Shipment } from '../../types';
import { GroupRow, SubtotalRow } from './types';

const NO_DATE_KEY = 'no-date';

export function formatWeight(n: number): string {
  return n.toLocaleString('ru-RU');
}

export function groupByArrivalDate(items: Shipment[]): GroupRow[] {
  const bucket = new Map<string, Shipment[]>();
  for (const s of items) {
    const key = s.arrivalDate ? dayjs(s.arrivalDate).format('YYYY-MM-DD') : NO_DATE_KEY;
    const list = bucket.get(key);
    if (list) list.push(s);
    else bucket.set(key, [s]);
  }

  const keys = [...bucket.keys()].sort((a, b) => {
    if (a === NO_DATE_KEY) return -1;
    if (b === NO_DATE_KEY) return 1;
    return b.localeCompare(a);
  });

  return keys.map<GroupRow>((key) => {
    const children = bucket.get(key)!;
    const totals = new Map<string, number>();
    let totalWeight = 0;
    for (const s of children) {
      if (typeof s.weight === 'number' && s.weight > 0) {
        totals.set(s.vegetable.name, (totals.get(s.vegetable.name) ?? 0) + s.weight);
        totalWeight += s.weight;
      }
    }
    const totalsByVegetable = [...totals.entries()].sort((a, b) => b[1] - a[1]);

    const dateLabel =
      key === NO_DATE_KEY ? 'Без даты прибытия' : dayjs(key).format('DD.MM.YYYY');
    const label = `${dateLabel} — ${children.length} ${pluralShipments(children.length)}, ${formatWeight(totalWeight)} кг`;

    const subtotal: SubtotalRow = {
      __kind: 'subtotal',
      id: `subtotal-${key}`,
      dateKey: key,
      totalsByVegetable,
    };

    return {
      __kind: 'group',
      id: `group-${key}`,
      dateKey: key,
      label,
      count: children.length,
      totalWeight,
      totalsByVegetable,
      children: [...children, subtotal],
    };
  });
}

export function defaultExpandedKeys(groups: GroupRow[]): React.Key[] {
  const today = dayjs().format('YYYY-MM-DD');
  return groups
    .filter((g) => g.dateKey === NO_DATE_KEY || g.dateKey >= today)
    .map((g) => g.id);
}

function pluralShipments(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'поставка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'поставки';
  return 'поставок';
}
