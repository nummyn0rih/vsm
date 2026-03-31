import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, DatePicker, Row, Col, Form, Button, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AuditLog, PaginatedResponse } from '../types';
import { logsApi } from '../api/logs';

const { RangePicker } = DatePicker;

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Создание', color: 'green' },
  UPDATE: { label: 'Обновление', color: 'blue' },
  DELETE: { label: 'Удаление', color: 'red' },
  STATUS_CHANGE: { label: 'Смена статуса', color: 'orange' },
};

const ENTITY_MAP: Record<string, string> = {
  shipment: 'Поставка',
  vegetable: 'Овощ',
  supplier: 'Поставщик',
  transport_company: 'Транспортная компания',
  driver: 'Водитель',
};

export default function LogsTable() {
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({ page: 1, pageSize: 50 });
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await logsApi.getAll(filters);
      setData(res.data);
    } catch {
      console.error('Ошибка загрузки логов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const handleFilter = (values: any) => {
    const newFilters: any = { page: 1, pageSize: filters.pageSize };
    if (values.action) newFilters.action = values.action;
    if (values.entityType) newFilters.entityType = values.entityType;
    if (values.dateRange?.[0] && values.dateRange?.[1]) {
      newFilters.dateFrom = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.dateTo = values.dateRange[1].format('YYYY-MM-DD');
    }
    setFilters(newFilters);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({ page: 1, pageSize: 50 });
  };

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (val: string) => dayjs(val).format('DD.MM.YYYY HH:mm:ss'),
    },
    {
      title: 'Пользователь',
      dataIndex: ['user', 'fullName'],
      key: 'user',
      width: 180,
    },
    {
      title: 'Действие',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (val: string) => {
        const config = ACTION_MAP[val];
        return <Tag color={config?.color || 'default'}>{config?.label || val}</Tag>;
      },
    },
    {
      title: 'Тип объекта',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 160,
      render: (val: string) => ENTITY_MAP[val] || val,
    },
    {
      title: 'ID объекта',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 100,
    },
    {
      title: 'Старые значения',
      dataIndex: 'oldValues',
      key: 'oldValues',
      width: 300,
      ellipsis: true,
      render: (val: any) => (val ? JSON.stringify(val, null, 2).substring(0, 100) + '...' : '—'),
    },
    {
      title: 'Новые значения',
      dataIndex: 'newValues',
      key: 'newValues',
      width: 300,
      ellipsis: true,
      render: (val: any) => (val ? JSON.stringify(val, null, 2).substring(0, 100) + '...' : '—'),
    },
  ];

  return (
    <Card title="Журнал действий">
      <Form form={form} layout="vertical" onFinish={handleFilter} style={{ marginBottom: 16 }}>
        <Row gutter={[12, 0]}>
          <Col xs={24} sm={8} md={6}>
            <Form.Item name="action" label="Действие">
              <Select
                placeholder="Все действия"
                allowClear
                options={Object.entries(ACTION_MAP).map(([key, val]) => ({
                  value: key,
                  label: val.label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Form.Item name="entityType" label="Тип объекта">
              <Select
                placeholder="Все типы"
                allowClear
                options={Object.entries(ENTITY_MAP).map(([key, val]) => ({
                  value: key,
                  label: val,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Form.Item name="dateRange" label="Период">
              <RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Form.Item label=" ">
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  Найти
                </Button>
                <Button onClick={handleReset} icon={<ClearOutlined />}>
                  Сброс
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        dataSource={data?.data || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        size="small"
        pagination={{
          current: data?.page || 1,
          pageSize: data?.pageSize || 50,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Всего записей: ${total}`,
          onChange: (page, pageSize) => setFilters({ ...filters, page, pageSize }),
        }}
      />
    </Card>
  );
}