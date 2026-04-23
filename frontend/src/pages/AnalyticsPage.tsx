import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Space, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { analyticsApi } from '../api/analytics';
import { AnalyticsSummary, AnalyticsTotal } from '../types';
import WeekBlock from '../components/analytics/WeekBlock';
import TotalBlock from '../components/analytics/TotalBlock';

const { Title } = Typography;

interface WeekRange {
  start: Dayjs;
  end: Dayjs;
}

function formatRange({ start, end }: WeekRange): string {
  return `${start.format('DD.MM')} – ${end.format('DD.MM.YYYY')}`;
}

export default function AnalyticsPage() {
  const [current, next] = useMemo<[WeekRange, WeekRange]>(() => {
    const startOfCurrent = dayjs().startOf('week');
    const endOfCurrent = dayjs().endOf('week');
    return [
      { start: startOfCurrent, end: endOfCurrent },
      {
        start: startOfCurrent.add(1, 'week'),
        end: endOfCurrent.add(1, 'week'),
      },
    ];
  }, []);

  const [currentData, setCurrentData] = useState<AnalyticsSummary | null>(null);
  const [nextData, setNextData] = useState<AnalyticsSummary | null>(null);
  const [totalData, setTotalData] = useState<AnalyticsTotal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [curRes, nextRes, totalRes] = await Promise.all([
          analyticsApi.summary(
            current.start.toISOString(),
            current.end.toISOString(),
          ),
          analyticsApi.summary(
            next.start.toISOString(),
            next.end.toISOString(),
          ),
          analyticsApi.total(),
        ]);
        if (cancelled) return;
        setCurrentData(curRes.data);
        setNextData(nextRes.data);
        setTotalData(totalRes.data);
      } catch (err) {
        if (!cancelled) {
          message.error('Не удалось загрузить аналитику');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [current, next]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        Аналитика
      </Title>
      <WeekBlock
        title={`Текущая неделя (${formatRange(current)})`}
        data={currentData}
        loading={loading}
      />
      <WeekBlock
        title={`Следующая неделя (${formatRange(next)})`}
        data={nextData}
        loading={loading}
      />
      <TotalBlock data={totalData} loading={loading} />
    </Space>
  );
}
