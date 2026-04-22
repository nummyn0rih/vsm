import React from 'react';
import { Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { Shipment } from '../types';
import { STATUS_MAP } from './StatusTag';
import dayjs from 'dayjs';

interface Props {
  data: Shipment[];
  fileName?: string;
}

export default function ExportExcel({ data, fileName = 'поставки' }: Props) {
  const handleExport = () => {
    const exportData = data.map((item, index) => ({
      '№': index + 1,
      'Овощ': item.vegetable.name,
      'Поставщик': item.supplier.name,
      'Транспортная компания': item.transportCompany.name,
      'Водитель': item.driver.fullName,
      'Статус': STATUS_MAP[item.status]?.label || item.status,
      'Количество': item.quantity,
      'Ед. изм.': item.unit,
      'Вес (кг)': item.weight || '',
      'Дата отправки': item.departureDate
        ? dayjs(item.departureDate).format('DD.MM.YYYY')
        : '',
      'Дата прибытия': item.arrivalDate
        ? dayjs(item.arrivalDate).format('DD.MM.YYYY')
        : '',
      'Примечания': item.notes || '',
      'Создал': item.createdBy.fullName,
      'Дата создания': dayjs(item.createdAt).format('DD.MM.YYYY HH:mm'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Ширина столбцов
    ws['!cols'] = [
      { wch: 5 },   // №
      { wch: 15 },  // Овощ
      { wch: 25 },  // Поставщик
      { wch: 25 },  // Транспортная компания
      { wch: 25 },  // Водитель
      { wch: 15 },  // Статус
      { wch: 12 },  // Количество
      { wch: 8 },   // Ед. изм.
      { wch: 10 },  // Вес
      { wch: 18 },  // Дата отправки
      { wch: 18 },  // Дата прибытия
      { wch: 30 },  // Примечания
      { wch: 20 },  // Создал
      { wch: 18 },  // Дата создания
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Поставки');
    XLSX.writeFile(wb, `${fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  return (
    <Button icon={<FileExcelOutlined />} onClick={handleExport} disabled={data.length === 0}>
      Экспорт в Excel
    </Button>
  );
}