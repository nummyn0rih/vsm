import React from 'react';
import { Typography } from 'antd';
import LogsTable from '../components/LogsTable';

const { Title } = Typography;

export default function LogsPage() {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        📝 Журнал действий
      </Title>
      <LogsTable />
    </div>
  );
}