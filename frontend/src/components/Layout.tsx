import React from 'react';
import { Layout as AntLayout, Menu, Button, Typography, Space, Tag } from 'antd';
import {
  CarOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <CarOutlined />,
      label: 'Поставки',
    },
    ...(isAdmin
      ? [
          {
            key: '/references',
            icon: <UnorderedListOutlined />,
            label: 'Справочники',
          },
          {
            key: '/logs',
            icon: <HistoryOutlined />,
            label: 'Журнал действий',
          },
        ]
      : []),
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: '#001529' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Text strong style={{ color: '#fff', fontSize: 16 }}>
            🥕 Поставки
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Space>
            <UserOutlined />
            <Text>{user?.fullName}</Text>
            <Tag color={isAdmin ? 'red' : 'blue'}>
              {isAdmin ? 'Администратор' : 'Пользователь'}
            </Tag>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              danger
            >
              Выйти
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}