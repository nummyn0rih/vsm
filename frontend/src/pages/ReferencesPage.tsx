import React from 'react';
import { Typography } from 'antd';
import ReferenceManager from '../components/ReferenceManager';

const { Title } = Typography;

export default function ReferencesPage() {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        📋 Справочники
      </Title>
      <ReferenceManager />
    </div>
  );
}