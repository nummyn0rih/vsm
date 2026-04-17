import React from 'react';
import { Table, Space, Button, Popconfirm, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Shipment, ShipmentStatus, PaginatedResponse, ShipmentFilters } from '../types';
import { StatusTag, StatusSelect } from './StatusTag';
import { shipmentsApi } from '../api/shipments';
import { useAuth } from '../context/AuthContext';

interface Props {
  data: PaginatedResponse<Shipment> | null;
  loading: boolean;
  filters: ShipmentFilters;
  onFiltersChange: (filters: ShipmentFilters) => void;
  onEdit: (shipment: Shipment) => void;
  onRefresh: () => void;
}

export default function ShipmentTable({
  data,
  loading,
  filters,
  onFiltersChange,
  onEdit,
  onRefresh,
}: Props) {
  const { isAdmin } = useAuth();

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

  const columns: ColumnsType<Shipment> = [
    {
      title: '№',
      key: 'index',
      width: 60,
      render: (_, __, index) =>
        ((filters.page || 1) - 1) * (filters.pageSize || 20) + index + 1,
    },
    {
      title: 'Овощ',
      dataIndex: ['vegetable', 'name'],
      key: 'vegetable',
      width: 120,
    },
    {
      title: 'Поставщик',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      width: 180,
    },
    {
      title: 'Транспортная компания',
      dataIndex: ['transportCompany', 'name'],
      key: 'transportCompany',
      width: 180,
    },
    {
      title: 'Водитель',
      dataIndex: ['driver', 'fullName'],
      key: 'driver',
      width: 180,
    },
    {
      title: 'Статус',
      key: 'status',
      width: 170,
      render: (_, record) =>
        isAdmin ? (
          <StatusSelect
            value={record.status}
            onChange={(status) => handleStatusChange(record.id, status)}
          />
        ) : (
          <StatusTag status={record.status} />
        ),
    },
    {
      title: 'Кол-во',
      key: 'quantity',
      width: 100,
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Вес (кг)',
      dataIndex: 'weight',
      key: 'weight',
      width: 90,
      render: (val) => val || '—',
    },
    {
      title: 'Дата отправки',
      dataIndex: 'departureDate',
      key: 'departureDate',
      width: 150,
      render: (val) => (val ? dayjs(val).format('DD.MM.YYYY HH:mm') : '—'),
    },
    {
      title: 'Дата прибытия',
      dataIndex: 'arrivalDate',
      key: 'arrivalDate',
      width: 150,
      render: (val) => (val ? dayjs(val).format('DD.MM.YYYY HH:mm') : '—'),
    },
    {
      title: 'Примечания',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      ellipsis: { showTitle: false },
      render: (val) => (
        <Tooltip placement="topLeft" title={val}>
          {val || '—'}
        </Tooltip>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: 'Действия',
            key: 'actions',
            width: 100,
            fixed: 'right' as const,
            render: (_: any, record: Shipment) => (
              <Space>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                />
                <Popconfirm
                  title="Удалить поставку?"
                  description="Это действие нельзя отменить"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table<Shipment>
      columns={columns}
      dataSource={data?.data || []}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1600 }}
      pagination={{
        current: data?.page || 1,
        pageSize: data?.pageSize || 20,
        total: data?.total || 0,
        showSizeChanger: true,
        showTotal: (total) => `Всего: ${total}`,
        pageSizeOptions: ['10', '20', '50', '100'],
        onChange: (page, pageSize) => {
          onFiltersChange({ ...filters, page, pageSize });
        },
      }}
    />
  );
}
