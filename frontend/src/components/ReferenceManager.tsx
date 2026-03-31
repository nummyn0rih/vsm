import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Tabs,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { referencesApi } from '../api/references';
import { Vegetable, Supplier, TransportCompany, Driver } from '../types';

// === Компонент справочника овощей ===
function VegetableTable() {
  const [data, setData] = useState<Vegetable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Vegetable | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await referencesApi.getVegetables();
      setData(res.data);
    } catch {
      message.error('Ошибка загрузки овощей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (item?: Vegetable) => {
    if (item) {
      setEditItem(item);
      form.setFieldsValue({ name: item.name });
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
        await referencesApi.updateVegetable(editItem.id, values);
        message.success('Овощ обновлён');
      } else {
        await referencesApi.createVegetable(values);
        message.success('Овощ добавлен');
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
      await referencesApi.deleteVegetable(id);
      message.success('Овощ удалён');
      load();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpen()}>
          Добавить овощ
        </Button>
      </div>
      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'Название', dataIndex: 'name' },
          {
            title: 'Действия',
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
                  title="Удалить овощ?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editItem ? 'Редактировать овощ' : 'Новый овощ'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название овоща' }]}
          >
            <Input placeholder="Например: Картофель" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// === Компонент справочника поставщиков ===
function SupplierTable() {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await referencesApi.getSuppliers();
      setData(res.data);
    } catch {
      message.error('Ошибка загрузки поставщиков');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (item?: Supplier) => {
    if (item) {
      setEditItem(item);
      form.setFieldsValue({ name: item.name, contactInfo: item.contactInfo });
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
        await referencesApi.updateSupplier(editItem.id, values);
        message.success('Поставщик обновлён');
      } else {
        await referencesApi.createSupplier(values);
        message.success('Поставщик добавлен');
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
      await referencesApi.deleteSupplier(id);
      message.success('Поставщик удалён');
      load();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpen()}>
          Добавить поставщика
        </Button>
      </div>
      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'Название', dataIndex: 'name' },
          { title: 'Контактная информация', dataIndex: 'contactInfo', render: (v) => v || '—' },
          {
            title: 'Действия',
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
                  title="Удалить поставщика?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editItem ? 'Редактировать поставщика' : 'Новый поставщик'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
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
        </Form>
      </Modal>
    </>
  );
}

// === Компонент справочника транспортных компаний ===
function TransportCompanyTable() {
  const [data, setData] = useState<TransportCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TransportCompany | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await referencesApi.getTransportCompanies();
      setData(res.data);
    } catch {
      message.error('Ошибка загрузки транспортных компаний');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (item?: TransportCompany) => {
    if (item) {
      setEditItem(item);
      form.setFieldsValue({ name: item.name, contactInfo: item.contactInfo });
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
        await referencesApi.updateTransportCompany(editItem.id, values);
        message.success('Транспортная компания обновлена');
      } else {
        await referencesApi.createTransportCompany(values);
        message.success('Транспортная компания добавлена');
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
      await referencesApi.deleteTransportCompany(id);
      message.success('Транспортная компания удалена');
      load();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpen()}>
          Добавить компанию
        </Button>
      </div>
      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'Название', dataIndex: 'name' },
          { title: 'Контактная информация', dataIndex: 'contactInfo', render: (v) => v || '—' },
          {
            title: 'Действия',
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
                  title="Удалить компанию?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editItem ? 'Редактировать компанию' : 'Новая компания'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
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
        </Form>
      </Modal>
    </>
  );
}

// === Компонент справочника водителей ===
function DriverTable() {
  const [data, setData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Driver | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await referencesApi.getDrivers();
      setData(res.data);
    } catch {
      message.error('Ошибка загрузки водителей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (item?: Driver) => {
    if (item) {
      setEditItem(item);
      form.setFieldsValue({ fullName: item.fullName, phone: item.phone });
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
        await referencesApi.updateDriver(editItem.id, values);
        message.success('Водитель обновлён');
      } else {
        await referencesApi.createDriver(values);
        message.success('Водитель добавлен');
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
      await referencesApi.deleteDriver(id);
      message.success('Водитель удалён');
      load();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpen()}>
          Добавить водителя
        </Button>
      </div>
      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'ФИО', dataIndex: 'fullName' },
          { title: 'Телефон', dataIndex: 'phone', render: (v) => v || '—' },
          {
            title: 'Действия',
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
                  title="Удалить водителя?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editItem ? 'Редактировать водителя' : 'Новый водитель'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
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
        </Form>
      </Modal>
    </>
  );
}

// === Главный компонент справочников ===
export default function ReferenceManager() {
  const items = [
    {
      key: 'vegetables',
      label: '🥕 Овощи',
      children: <VegetableTable />,
    },
    {
      key: 'suppliers',
      label: '🏭 Поставщики',
      children: <SupplierTable />,
    },
    {
      key: 'transport',
      label: '🚛 Транспортные компании',
      children: <TransportCompanyTable />,
    },
    {
      key: 'drivers',
      label: '👤 Водители',
      children: <DriverTable />,
    },
  ];

  return (
    <Card title="Управление справочниками">
      <Tabs items={items} />
    </Card>
  );
}