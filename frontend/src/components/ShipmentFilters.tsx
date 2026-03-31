import React, { useEffect, useState } from 'react';
import { Card, Form, Select, DatePicker, Input, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ShipmentFilters as FiltersType, Vegetable, Supplier, TransportCompany, Driver } from '../types';
import { referencesApi } from '../api/references';
import { STATUS_MAP } from './StatusTag';

const { RangePicker } = DatePicker;

interface Props {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export default function ShipmentFilters({ filters, onFiltersChange }: Props) {
  const [form] = Form.useForm();
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [vegRes, supRes, compRes, drvRes] = await Promise.all([
          referencesApi.getVegetables(),
          referencesApi.getSuppliers(),
          referencesApi.getTransportCompanies(),
          referencesApi.getDrivers(),
        ]);
        setVegetables(vegRes.data);
        setSuppliers(supRes.data);
        setCompanies(compRes.data);
        setDrivers(drvRes.data);
      } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
      }
    };
    loadRefs();
  }, []);

  const handleFinish = (values: any) => {
    const newFilters: FiltersType = {
      ...filters,
      status: values.status || undefined,
      vegetableId: values.vegetableId || undefined,
      supplierId: values.supplierId || undefined,
      transportCompanyId: values.transportCompanyId || undefined,
      driverId: values.driverId || undefined,
      search: values.search || undefined,
      page: 1,
    };

    if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
      newFilters.dateFrom = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.dateTo = values.dateRange[1].format('YYYY-MM-DD');
    } else {
      newFilters.dateFrom = undefined;
      newFilters.dateTo = undefined;
    }

    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    form.resetFields();
    onFiltersChange({ page: 1, pageSize: filters.pageSize });
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={[12, 0]}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="search" label="Поиск">
              <Input placeholder="Поиск..." prefix={<SearchOutlined />} allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="status" label="Статус">
              <Select
                placeholder="Все статусы"
                allowClear
                options={Object.entries(STATUS_MAP).map(([key, val]) => ({
                  value: key,
                  label: val.label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="vegetableId" label="Овощ">
              <Select
                placeholder="Все овощи"
                allowClear
                showSearch
                optionFilterProp="label"
                options={vegetables.map((v) => ({ value: v.id, label: v.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="supplierId" label="Поставщик">
              <Select
                placeholder="Все поставщики"
                allowClear
                showSearch
                optionFilterProp="label"
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="transportCompanyId" label="Транспортная компания">
              <Select
                placeholder="Все компании"
                allowClear
                showSearch
                optionFilterProp="label"
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="driverId" label="Водитель">
              <Select
                placeholder="Все водители"
                allowClear
                showSearch
                optionFilterProp="label"
                options={drivers.map((d) => ({ value: d.id, label: d.fullName }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="dateRange" label="Период отправки">
              <RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4} lg={2}>
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
    </Card>
  );
}