import React, { useRef } from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function PrintArea({ children, title = 'Поставки овощей' }: Props) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: title,
    pageStyle: `
      @page {
        size: landscape;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        table {
          font-size: 11px;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 4px 8px !important;
        }
        .ant-tag {
          border: 1px solid #999;
          padding: 0 4px;
        }
      }
    `,
  });

  return (
    <div>
      <div className="no-print" style={{ marginBottom: 8 }}>
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
          Печать
        </Button>
      </div>
      <div ref={componentRef}>
        <div style={{ textAlign: 'center', marginBottom: 16 }} className="print-only">
          <h2 style={{ display: 'none' }}>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}