import React from 'react';
import { Card, Empty, Spin, Typography } from 'antd';
import { Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import { AnalyticsSummary, AnalyticsDailyVegetablePoint } from '../../types';
import { buildVegetableColorScale } from './vegetableColors';

const { Text } = Typography;

interface Props {
  title: string;
  data: AnalyticsSummary | null;
  loading: boolean;
}

function dailyChartData(points: AnalyticsDailyVegetablePoint[]) {
  return points.map((p) => ({
    label: dayjs(p.date).format('dd, DD.MM'),
    vegetable: p.vegetable,
    weight: Math.round(p.weight * 10) / 10,
    count: p.count,
  }));
}

export default function WeekBlock({ title, data, loading }: Props) {
  const totalCount = data?.daily.reduce((s, d) => s + d.count, 0) ?? 0;

  return (
    <Card
      title={title}
      extra={
        data ? (
          <Text type="secondary">Всего поставок: {totalCount}</Text>
        ) : null
      }
    >
      {loading && !data ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : !data || totalCount === 0 ? (
        <Empty description="Нет поставок за этот период" />
      ) : (
        <div style={{ height: 340, width: '100%' }}>
          <Column
            autoFit
            data={dailyChartData(data.dailyByVegetable)}
            xField="label"
            yField="weight"
            colorField="vegetable"
            group
            scale={{ color: buildVegetableColorScale(data.dailyByVegetable.map((p) => p.vegetable)) }}
            axis={{
              y: {
                title: 'кг',
                grid: true,
                gridStroke: '#e8e8e8',
                gridStrokeOpacity: 0.7,
                gridLineDash: [0, 0],
              },
              x: { title: false },
            }}
            legend={{ color: { position: 'top' } }}
          />
        </div>
      )}
    </Card>
  );
}
