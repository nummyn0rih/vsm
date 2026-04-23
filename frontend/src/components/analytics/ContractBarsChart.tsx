import React, { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';
import { AnalyticsSupplierVegetablePoint } from '../../types';
import { buildVegetableColorScale } from './vegetableColors';

interface Props {
  data: AnalyticsSupplierVegetablePoint[];
  height?: number;
}

const OVERSHOOT_COLOR = '#ff4d4f';

export default function ContractBarsChart({ data, height = 380 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const rows = data.map((p) => ({
      supplier: p.supplier,
      vegetable: p.vegetable,
      actualKg: p.actualKg,
      contractKg: p.contractKg,
      filledKg: Math.min(p.actualKg, p.contractKg || p.actualKg),
      overshootTop: p.actualKg > p.contractKg ? p.actualKg : p.contractKg,
    }));

    const colorScale = buildVegetableColorScale(rows.map((r) => r.vegetable));

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
    });

    chart.options({
      type: 'view',
      data: rows,
      scale: { color: colorScale },
      axis: {
        y: {
          title: 'кг',
          grid: true,
          gridStroke: '#e8e8e8',
          gridStrokeOpacity: 0.7,
        },
        x: { title: false },
      },
      legend: { color: { position: 'top' } },
      interaction: { tooltip: { shared: true } },
      children: [
        {
          type: 'interval',
          encode: {
            x: 'supplier',
            y: 'contractKg',
            color: 'vegetable',
          },
          transform: [{ type: 'dodgeX' }],
          style: { fillOpacity: 0, lineWidth: 1.5 },
          tooltip: {
            items: [
              {
                channel: 'y',
                name: 'По контракту',
                valueFormatter: (v: number) =>
                  `${Math.round(v).toLocaleString('ru-RU')} кг`,
              },
              {
                field: 'actualKg',
                name: 'Факт',
                valueFormatter: (v: number) =>
                  `${Math.round(v).toLocaleString('ru-RU')} кг`,
              },
            ],
          },
        },
        {
          type: 'interval',
          encode: {
            x: 'supplier',
            y: 'filledKg',
            color: 'vegetable',
          },
          transform: [{ type: 'dodgeX' }],
          tooltip: false,
          legend: false,
        },
        {
          type: 'interval',
          encode: {
            x: 'supplier',
            y: ['contractKg', 'overshootTop'],
            color: 'vegetable',
          },
          transform: [{ type: 'dodgeX' }],
          style: { fill: OVERSHOOT_COLOR, fillOpacity: 0.85 },
          tooltip: false,
          legend: false,
        },
      ],
    });

    chart.render();
    chartRef.current = chart;

    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return <div ref={containerRef} style={{ height, width: '100%' }} />;
}
