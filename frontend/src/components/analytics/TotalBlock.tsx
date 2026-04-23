import React from 'react';
import { Card, Row, Col, Empty, Spin, Typography } from 'antd';
import { Bar } from '@ant-design/charts';
import { AnalyticsTotal } from '../../types';
import ContractBarsChart from './ContractBarsChart';

const { Text } = Typography;

interface Props {
  data: AnalyticsTotal | null;
  loading: boolean;
}

export default function TotalBlock({ data, loading }: Props) {
  const totalActual =
    data?.bySupplierVegetable.reduce((s, p) => s + p.actualKg, 0) ?? 0;

  if (loading && !data) {
    return (
      <Card title="Итоговая статистика">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (!data || data.bySupplierVegetable.length === 0) {
    return (
      <Card title="Итоговая статистика">
        <Empty description="Нет данных" />
      </Card>
    );
  }

  const tcHeight = Math.max(200, data.byTransportCompany.length * 36);

  return (
    <Card
      title="Итоговая статистика"
      extra={
        <Text type="secondary">
          Суммарный факт: {Math.round(totalActual).toLocaleString('ru-RU')} кг
        </Text>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            size="small"
            title="Поставщики × виды сырья: контракт vs факт (кг)"
            bodyStyle={{ padding: 12 }}
          >
            <ContractBarsChart data={data.bySupplierVegetable} />
          </Card>
        </Col>
        <Col span={24}>
          <Card
            size="small"
            title="Транспортные компании (рейсов)"
            bodyStyle={{ padding: 12 }}
          >
            <div style={{ height: tcHeight, width: '100%' }}>
              <Bar
                autoFit
                data={data.byTransportCompany.map((t) => ({
                  name: t.name,
                  count: t.count,
                }))}
                xField="name"
                yField="count"
                label={{ text: 'count', style: { fill: '#000' } }}
                axis={{
                  x: {
                    title: 'Рейсов',
                    grid: true,
                    gridStroke: '#e8e8e8',
                    gridStrokeOpacity: 0.7,
                  },
                  y: { title: false },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
