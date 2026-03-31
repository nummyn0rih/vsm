import React from 'react';
import { Tag, Select } from 'antd';
import { ShipmentStatus } from '../types';

const STATUS_MAP: Record<ShipmentStatus, { label: string; color: string }> = {
  PLANNED: { label: 'Запланирована', color: 'blue' },
  IN_TRANSIT: { label: 'В пути', color: 'orange' },
};

interface StatusTagProps {
  status: ShipmentStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const config = STATUS_MAP[status];
  return <Tag color={config?.color || 'default'}>{config?.label || status}</Tag>;
}

interface StatusSelectProps {
  value?: ShipmentStatus;
  onChange?: (value: ShipmentStatus) => void;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ width: 160 }}
      options={Object.entries(STATUS_MAP).map(([key, val]) => ({
        value: key,
        label: <Tag color={val.color}>{val.label}</Tag>,
      }))}
    />
  );
}

export { STATUS_MAP };