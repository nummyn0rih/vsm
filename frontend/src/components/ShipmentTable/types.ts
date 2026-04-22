import { Shipment } from '../../types';

export type ColumnKey =
  | 'vegetable'
  | 'supplier'
  | 'transportCompany'
  | 'driver'
  | 'status'
  | 'quantity'
  | 'weight'
  | 'departureDate'
  | 'arrivalDate'
  | 'notes';

export const COLUMN_ORDER_DEFAULT: ColumnKey[] = [
  'arrivalDate',
  'vegetable',
  'supplier',
  'transportCompany',
  'driver',
  'status',
  'quantity',
  'weight',
  'departureDate',
  'notes',
];

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  vegetable: 'Овощ',
  supplier: 'Поставщик',
  transportCompany: 'Транспортная компания',
  driver: 'Водитель',
  status: 'Статус',
  quantity: 'Кол-во',
  weight: 'Вес (кг)',
  departureDate: 'Дата отправки',
  arrivalDate: 'Дата прибытия',
  notes: 'Примечания',
};

export interface GroupRow {
  __kind: 'group';
  id: string;
  dateKey: string;
  label: string;
  count: number;
  totalWeight: number;
  totalsByVegetable: Array<[string, number]>;
  children: Array<Shipment | SubtotalRow>;
}

export interface SubtotalRow {
  __kind: 'subtotal';
  id: string;
  dateKey: string;
  totalsByVegetable: Array<[string, number]>;
}

export type TableRow = GroupRow | SubtotalRow | Shipment;

export function isGroupRow(r: TableRow): r is GroupRow {
  return (r as GroupRow).__kind === 'group';
}

export function isSubtotalRow(r: TableRow): r is SubtotalRow {
  return (r as SubtotalRow).__kind === 'subtotal';
}
