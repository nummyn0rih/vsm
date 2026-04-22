import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Shipment, PaginatedResponse, ShipmentFilters as FiltersType } from '../types';
import { shipmentsApi } from '../api/shipments';
import ShipmentTable from '../components/ShipmentTable';
import ShipmentFiltersComponent from '../components/ShipmentFilters';
import ShipmentForm from '../components/ShipmentForm';
import ExportExcel from '../components/ExportExcel';
import PrintArea from '../components/PrintArea';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function ShipmentsPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<PaginatedResponse<Shipment> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FiltersType>({ page: 1, pageSize: 10000 });
  const [formOpen, setFormOpen] = useState(false);
  const [editShipment, setEditShipment] = useState<Shipment | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shipmentsApi.getAll(filters);
      setData(res.data);
    } catch (error) {
      console.error('Ошибка загрузки поставок:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (shipment: Shipment) => {
    setEditShipment(shipment);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditShipment(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditShipment(null);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          📦 Поставки овощей
        </Title>
        <Space wrap>
          <ExportExcel data={data?.data || []} />
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            Обновить
          </Button>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Новая поставка
            </Button>
          )}
        </Space>
      </div>

      <ShipmentFiltersComponent filters={filters} onFiltersChange={setFilters} />

      <Card bodyStyle={{ padding: 0 }}>
        <PrintArea title="Поставки овощей">
          <ShipmentTable
            data={data}
            loading={loading}
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleEdit}
            onRefresh={loadData}
          />
        </PrintArea>
      </Card>

      {isAdmin && (
        <ShipmentForm
          open={formOpen}
          shipment={editShipment}
          onClose={handleFormClose}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}