import React, { useEffect, useMemo, useState } from 'react';
import { Table, Space, Button, Popconfirm, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Shipment, ShipmentStatus, PaginatedResponse, ShipmentFilters } from '../types';
import { StatusTag, StatusSelect } from './StatusTag';
import { shipmentsApi } from '../api/shipments';
import { useAuth } from '../context/AuthContext';
import ColumnSettings from './ShipmentTable/ColumnSettings';
import { useColumnPrefs } from './ShipmentTable/useColumnPrefs';
import {
  ColumnKey,
  COLUMN_LABELS,
  GroupRow,
  isGroupRow,
  isSubtotalRow,
  SubtotalRow,
  TableRow,
} from './ShipmentTable/types';
import {
  defaultExpandedKeys,
  formatWeight,
  groupByArrivalDate,
} from './ShipmentTable/groupShipments';
import './ShipmentTable/table.css';

interface Props {
  data: PaginatedResponse<Shipment> | null;
  loading: boolean;
  filters: ShipmentFilters;
  onFiltersChange: (filters: ShipmentFilters) => void;
  onEdit: (shipment: Shipment) => void;
  onRefresh: () => void;
}

export default function ShipmentTable({ data, loading, onEdit, onRefresh }: Props) {
  const { isAdmin } = useAuth();
  const { prefs, visibleOrdered, toggleVisible, reorder, reset } = useColumnPrefs();

  const shipments = data?.data || [];
  const groups = useMemo(() => groupByArrivalDate(shipments), [shipments]);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  useEffect(() => {
    setExpandedKeys(defaultExpandedKeys(groups));
  }, [groups]);

  const handleStatusChange = async (id: number, status: ShipmentStatus) => {
    try {
      await shipmentsApi.updateStatus(id, status);
      message.success('Статус обновлён');
      onRefresh();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Ошибка обновления статуса');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await shipmentsApi.delete(id);
      message.success('Поставка удалена');
      onRefresh();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const columnRenderers = buildColumnRenderers({ isAdmin, onStatusChange: handleStatusChange });

  const visibleCount = visibleOrdered.length;

  const dataColumns: ColumnsType<TableRow> = visibleOrdered.map((key, idx) => {
    const def = columnRenderers[key];
    const isFirst = idx === 0;
    return {
      title: def.title,
      key,
      width: def.width,
      ellipsis: def.ellipsis,
      onCell: (record: TableRow) => {
        if (isGroupRow(record) || isSubtotalRow(record)) {
          return isFirst ? { colSpan: visibleCount } : { colSpan: 0 };
        }
        return {};
      },
      render: (_: unknown, record: TableRow) => {
        if (isGroupRow(record)) {
          return isFirst ? renderGroupLabel(record) : null;
        }
        if (isSubtotalRow(record)) {
          return isFirst ? renderSubtotal(record) : null;
        }
        return def.render(record as Shipment);
      },
    };
  });

  const columns: ColumnsType<TableRow> = [...dataColumns];

  if (isAdmin) {
    columns.push({
      title: 'Действия',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        if (isGroupRow(record) || isSubtotalRow(record)) return null;
        const shipment = record as Shipment;
        return (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(shipment)}
            />
            <Popconfirm
              title="Удалить поставку?"
              description="Это действие нельзя отменить"
              onConfirm={() => handleDelete(shipment.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    });
  }

  return (
    <>
      <div className="vsm-table-toolbar">
        <ColumnSettings
          prefs={prefs}
          onReorder={reorder}
          onToggle={toggleVisible}
          onReset={reset}
        />
      </div>
      <Table<TableRow>
        columns={columns}
        dataSource={groups}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1600 }}
        pagination={false}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => setExpandedKeys([...keys]),
        }}
        rowClassName={(record) => {
          if (isGroupRow(record)) return 'vsm-row-group';
          if (isSubtotalRow(record)) return 'vsm-row-subtotal';
          return '';
        }}
        size="middle"
      />
    </>
  );
}

interface ColumnRenderer {
  title: string;
  width?: number;
  ellipsis?: { showTitle: boolean } | boolean;
  render: (r: Shipment) => React.ReactNode;
}

function buildColumnRenderers(opts: {
  isAdmin: boolean;
  onStatusChange: (id: number, status: ShipmentStatus) => void;
}): Record<ColumnKey, ColumnRenderer> {
  return {
    vegetable: {
      title: COLUMN_LABELS.vegetable,
      width: 140,
      render: (r) => r.vegetable.name,
    },
    supplier: {
      title: COLUMN_LABELS.supplier,
      width: 180,
      render: (r) => r.supplier.name,
    },
    transportCompany: {
      title: COLUMN_LABELS.transportCompany,
      width: 180,
      render: (r) => r.transportCompany.name,
    },
    driver: {
      title: COLUMN_LABELS.driver,
      width: 180,
      render: (r) => r.driver.fullName,
    },
    status: {
      title: COLUMN_LABELS.status,
      width: 170,
      render: (r) =>
        opts.isAdmin ? (
          <StatusSelect
            value={r.status}
            onChange={(status) => opts.onStatusChange(r.id, status)}
          />
        ) : (
          <StatusTag status={r.status} />
        ),
    },
    quantity: {
      title: COLUMN_LABELS.quantity,
      width: 110,
      render: (r) => `${r.quantity} ${r.unit}`,
    },
    weight: {
      title: COLUMN_LABELS.weight,
      width: 110,
      render: (r) => (typeof r.weight === 'number' ? formatWeight(r.weight) : '—'),
    },
    departureDate: {
      title: COLUMN_LABELS.departureDate,
      width: 130,
      render: (r) => (r.departureDate ? dayjs(r.departureDate).format('DD.MM.YYYY') : '—'),
    },
    arrivalDate: {
      title: COLUMN_LABELS.arrivalDate,
      width: 130,
      render: (r) => (r.arrivalDate ? dayjs(r.arrivalDate).format('DD.MM.YYYY') : '—'),
    },
    notes: {
      title: COLUMN_LABELS.notes,
      width: 200,
      ellipsis: { showTitle: false },
      render: (r) => (
        <Tooltip placement="topLeft" title={r.notes}>
          {r.notes || '—'}
        </Tooltip>
      ),
    },
  };
}

function renderGroupLabel(group: GroupRow) {
  return <span>{group.label}</span>;
}

function renderSubtotal(row: SubtotalRow) {
  if (row.totalsByVegetable.length === 0) {
    return <span>Подытог: —</span>;
  }
  return (
    <span>
      <span style={{ fontStyle: 'normal', fontWeight: 600, marginRight: 8 }}>Подытог:</span>
      {row.totalsByVegetable.map(([name, w], i) => (
        <span key={name} className="vsm-subtotal-item">
          {name} — <span className="vsm-subtotal-item-weight">{formatWeight(w)} кг</span>
          {i < row.totalsByVegetable.length - 1 ? ' · ' : null}
        </span>
      ))}
    </span>
  );
}
