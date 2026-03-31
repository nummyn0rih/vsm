import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  DatePicker,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { Shipment, Vegetable, Supplier, TransportCompany, Driver, ShipmentStatus } from '../types';
import { shipmentsApi } from '../api/shipments';
import { referencesApi } from '../api/references';
import { StatusSelect } from './StatusTag';

interface Props {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ShipmentForm({ open, shipment, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    if (open) {
      loadReferences();
      if (shipment) {
        form.setFieldsValue({
          vegetableId: shipment.vegetableId,
          supplierId: shipment.supplierId,
          transportCompanyId: shipment.transportCompanyId,
          driverId: shipment.driverId,
          status: shipment.status,
          quantity: shipment.quantity,
          unit: shipment.unit,
          weight: shipment.weight,
          departureDate: shipment.departureDate ? dayjs(shipment.departureDate) : null,
          arrivalDate: shipment.arrivalDate ? dayjs(shipment.arrivalDate) : null,
          notes: shipment.notes,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 'PLANNED', unit: 'кг' });
      }
    }
  }, [open, shipment]);

  const loadReferences = async () => {
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
    } catch {
      message.error('Ошибка загрузки справочников');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data = {
        ...values,
        departureDate: values.departureDate?.toISOString(),
        arrivalDate: values.arrivalDate?.toISOString(),
      };

      if (shipment) {
        await shipmentsApi.update(shipment.id, data);
        message.success('Поставка обновлена');
      } else {
        await shipmentsApi.create(data);
        message.success('Поставка создана');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={shipment ? 'Редактировать поставку' : 'Новая поставка'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText={shipment ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="vegetableId"
          label="Овощ"
          rules={[{ required: true, message: 'Выберите овощ' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Выберите овощ"
            options={vegetables.map((v) => ({ value: v.id, label: v.name }))}
          />
        </Form.Item>

        <Form.Item
          name="supplierId"
          label="Поставщик"
          rules={[{ required: true, message: 'Выберите поставщика' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Выберите поставщика"
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Form.Item>

        <Form.Item
          name="transportCompanyId"
          label="Транспортная компания"
          rules={[{ required: true, message: 'Выберите транспортную компанию' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Выберите компанию"
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>

        <Form.Item
          name="driverId"
          label="Водитель"
          rules={[{ required: true, message: 'Выберите водителя' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Выберите водителя"
            options={drivers.map((d) => ({ value: d.id, label: d.fullName }))}
          />
        </Form.Item>

        <Form.Item name="status" label="Статус">
          <StatusSelect />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Количество"
          rules={[{ required: true, message: 'Укажите количество' }]}
        >
          <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="0" />
        </Form.Item>

        <Form.Item name="unit" label="Единица измерения">
          <Select
            options={[
              { value: 'кг', label: 'кг' },
              { value: 'т', label: 'т' },
              { value: 'шт', label: 'шт' },
            ]}
          />
        </Form.Item>

        <Form.Item name="weight" label="Вес (кг)">
          <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="0" />
        </Form.Item>

        <Form.Item name="departureDate" label="Дата отправки">
          <DatePicker
            showTime
            format="DD.MM.YYYY HH:mm"
            style={{ width: '100%' }}
            placeholder="Выберите дату"
          />
        </Form.Item>

        <Form.Item name="arrivalDate" label="Дата прибытия">
          <DatePicker
            showTime
            format="DD.MM.YYYY HH:mm"
            style={{ width: '100%' }}
            placeholder="Выберите дату"
          />
        </Form.Item>

        <Form.Item name="notes" label="Примечания">
          <Input.TextArea rows={3} placeholder="Дополнительная информация..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}