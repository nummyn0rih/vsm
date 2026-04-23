import React, { useState, useEffect, ReactNode } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Popconfirm,
  Tabs,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AxiosResponse } from 'axios';
import { referencesApi } from '../api/references';
import {
  Vegetable,
  Supplier,
  TransportCompany,
  Driver,
  SupplierContract,
} from '../types';

interface ReferenceTableProps<T extends { id: number }> {
  fetchFn: () => Promise<AxiosResponse<T[]>>;
  createFn: (data: any) => Promise<AxiosResponse<T>>;
  updateFn: (id: number, data: any) => Promise<AxiosResponse<T>>;
  deleteFn: (id: number) => Promise<AxiosResponse>;
  columns: ColumnsType<T>;
  formFields: ReactNode;
  addLabel: string;
  getFormValues: (item: T) => Record<string, any>;
  errorLabel: string;
}

function ReferenceTable<T extends { id: number }>({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  columns,
  formFields,
  addLabel,
  getFormValues,
  errorLabel,
}: ReferenceTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch {
      message.error(`Ошибка загрузки: ${errorLabel}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (item?: T) => {
    if (item) {
      setEditItem(item);
      form.setFieldsValue(getFormValues(item));
    } else {
      setEditItem(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editItem) {
        await updateFn(editItem.id, values);
        message.success('Запись обновлена');
      } else {
        await createFn(values);
        message.success('Запись добавлена');
      }
      setModalOpen(false);
      load();
    } catch (error: any) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFn(id);
      message.success('Запись удалена');
      load();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const actionColumn: ColumnsType<T>[number] = {
    title: 'Действия',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpen(record)}
        />
        <Popconfirm
          title="Удалить запись?"
          onConfirm={() => handleDelete(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpen()}>
          {addLabel}
        </Button>
      </div>
      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        columns={[...columns, actionColumn]}
      />
      <Modal
        title={editItem ? 'Редактировать' : addLabel}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {formFields}
        </Form>
      </Modal>
    </>
  );
}

// === Конфигурации справочников ===

function VegetableTable() {
  return (
    <ReferenceTable<Vegetable>
      fetchFn={referencesApi.getVegetables}
      createFn={referencesApi.createVegetable}
      updateFn={referencesApi.updateVegetable}
      deleteFn={referencesApi.deleteVegetable}
      addLabel="Добавить овощ"
      errorLabel="овощи"
      getFormValues={(item) => ({ name: item.name })}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Название', dataIndex: 'name' },
      ]}
      formFields={
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: 'Введите название овоща' }]}
        >
          <Input placeholder="Например: Картофель" />
        </Form.Item>
      }
    />
  );
}

function SupplierTable() {
  return (
    <ReferenceTable<Supplier>
      fetchFn={referencesApi.getSuppliers}
      createFn={referencesApi.createSupplier}
      updateFn={referencesApi.updateSupplier}
      deleteFn={referencesApi.deleteSupplier}
      addLabel="Добавить поставщика"
      errorLabel="поставщики"
      getFormValues={(item) => ({ name: item.name, contactInfo: item.contactInfo })}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Название', dataIndex: 'name' },
        { title: 'Контактная информация', dataIndex: 'contactInfo', render: (v) => v || '—' },
      ]}
      formFields={
        <>
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder='Например: ООО "Агрофирма"' />
          </Form.Item>
          <Form.Item name="contactInfo" label="Контактная информация">
            <Input placeholder="Телефон, email и т.д." />
          </Form.Item>
        </>
      }
    />
  );
}

function TransportCompanyTable() {
  return (
    <ReferenceTable<TransportCompany>
      fetchFn={referencesApi.getTransportCompanies}
      createFn={referencesApi.createTransportCompany}
      updateFn={referencesApi.updateTransportCompany}
      deleteFn={referencesApi.deleteTransportCompany}
      addLabel="Добавить компанию"
      errorLabel="транспортные компании"
      getFormValues={(item) => ({ name: item.name, contactInfo: item.contactInfo })}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Название', dataIndex: 'name' },
        { title: 'Контактная информация', dataIndex: 'contactInfo', render: (v) => v || '—' },
      ]}
      formFields={
        <>
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder='Например: ТК "Быстрая доставка"' />
          </Form.Item>
          <Form.Item name="contactInfo" label="Контактная информация">
            <Input placeholder="Телефон, email и т.д." />
          </Form.Item>
        </>
      }
    />
  );
}

function DriverTable() {
  return (
    <ReferenceTable<Driver>
      fetchFn={referencesApi.getDrivers}
      createFn={referencesApi.createDriver}
      updateFn={referencesApi.updateDriver}
      deleteFn={referencesApi.deleteDriver}
      addLabel="Добавить водителя"
      errorLabel="водители"
      getFormValues={(item) => ({ fullName: item.fullName, phone: item.phone })}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'ФИО', dataIndex: 'fullName' },
        { title: 'Телефон', dataIndex: 'phone', render: (v) => v || '—' },
      ]}
      formFields={
        <>
          <Form.Item
            name="fullName"
            label="ФИО"
            rules={[{ required: true, message: 'Введите ФИО' }]}
          >
            <Input placeholder="Иванов Иван Иванович" />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <Input placeholder="+7 (900) 123-45-67" />
          </Form.Item>
        </>
      }
    />
  );
}

function ContractTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);

  useEffect(() => {
    Promise.all([referencesApi.getSuppliers(), referencesApi.getVegetables()])
      .then(([s, v]) => {
        setSuppliers(s.data);
        setVegetables(v.data);
      })
      .catch(() => message.error('Не удалось загрузить справочники'));
  }, []);

  return (
    <ReferenceTable<SupplierContract>
      fetchFn={referencesApi.getContracts}
      createFn={referencesApi.createContract}
      updateFn={referencesApi.updateContract}
      deleteFn={referencesApi.deleteContract}
      addLabel="Добавить контракт"
      errorLabel="контракты"
      getFormValues={(item) => ({
        supplierId: item.supplierId,
        vegetableId: item.vegetableId,
        volumeKg: item.volumeKg,
      })}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 60 },
        {
          title: 'Поставщик',
          dataIndex: ['supplier', 'name'],
          key: 'supplier',
        },
        {
          title: 'Овощ',
          dataIndex: ['vegetable', 'name'],
          key: 'vegetable',
        },
        {
          title: 'Объём (кг)',
          dataIndex: 'volumeKg',
          key: 'volumeKg',
          render: (v: number) => v.toLocaleString('ru-RU'),
        },
      ]}
      formFields={
        <>
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
            name="volumeKg"
            label="Объём по контракту (кг)"
            rules={[
              { required: true, message: 'Укажите объём' },
              {
                type: 'number',
                min: 0.1,
                message: 'Объём должен быть больше 0',
              },
            ]}
          >
            <InputNumber
              min={0.1}
              step={100}
              style={{ width: '100%' }}
              placeholder="Например: 200000"
            />
          </Form.Item>
        </>
      }
    />
  );
}

export default function ReferenceManager() {
  const items = [
    { key: 'vegetables', label: '🥕 Овощи', children: <VegetableTable /> },
    { key: 'suppliers', label: '🏭 Поставщики', children: <SupplierTable /> },
    { key: 'transport', label: '🚛 Транспортные компании', children: <TransportCompanyTable /> },
    { key: 'drivers', label: '👤 Водители', children: <DriverTable /> },
    { key: 'contracts', label: '📄 Контракты', children: <ContractTable /> },
  ];

  return (
    <Card title="Управление справочниками">
      <Tabs items={items} />
    </Card>
  );
}
