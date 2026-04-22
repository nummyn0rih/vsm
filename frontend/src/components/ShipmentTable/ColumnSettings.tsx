import React from 'react';
import { Button, Checkbox, Popover, Space, Typography } from 'antd';
import { HolderOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnKey, COLUMN_LABELS } from './types';
import { ColumnPrefs } from './useColumnPrefs';

interface Props {
  prefs: ColumnPrefs;
  onReorder: (from: ColumnKey, to: ColumnKey) => void;
  onToggle: (key: ColumnKey) => void;
  onReset: () => void;
}

export default function ColumnSettings({ prefs, onReorder, onToggle, onReset }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(active.id as ColumnKey, over.id as ColumnKey);
  };

  const content = (
    <div style={{ width: 260 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Перетащите для изменения порядка
      </Typography.Text>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={prefs.order} strategy={verticalListSortingStrategy}>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {prefs.order.map((key) => (
              <SortableItem
                key={key}
                columnKey={key}
                checked={!prefs.hidden[key]}
                onToggle={() => onToggle(key)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" icon={<ReloadOutlined />} onClick={onReset}>
          Сбросить
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={content} title="Настройка колонок" trigger="click" placement="bottomRight">
      <Button icon={<SettingOutlined />}>Колонки</Button>
    </Popover>
  );
}

function SortableItem({
  columnKey,
  checked,
  onToggle,
}: {
  columnKey: ColumnKey;
  checked: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnKey,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 6px',
    background: isDragging ? '#f0f7ff' : 'transparent',
    borderRadius: 4,
    userSelect: 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', color: '#999', display: 'inline-flex' }}
        aria-label="Перетащить"
      >
        <HolderOutlined />
      </span>
      <Checkbox checked={checked} onChange={onToggle}>
        {COLUMN_LABELS[columnKey]}
      </Checkbox>
    </div>
  );
}

