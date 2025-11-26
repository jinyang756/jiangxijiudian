import React, { useRef } from 'react';
import { MenuItem, CartItems } from '../types';

interface PrintServiceProps {
  cart: CartItems;
  itemsMap: Map<string, MenuItem>;
  locationLabel: string;
}

const PrintService: React.FC<PrintServiceProps> = ({ 
  cart, 
  itemsMap, 
  locationLabel
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate order totals
  const cartItemIds = Object.keys(cart);
  const subtotal = cartItemIds.reduce((sum, id) => {
    const item = itemsMap.get(id);
    return sum + (item ? item.price * cart[id] : 0);
  }, 0);

  const serviceCharge = Math.round(subtotal * 0.10);
  const grandTotal = subtotal + serviceCharge;

  // Print order receipt
  const printOrder = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Order Receipt</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 300px;
                margin: 0 auto;
                padding: 20px;
                font-size: 12px;
              }
              .header {
                text-align: center;
                border-bottom: 2px dashed #333;
                padding-bottom: 10px;
                margin-bottom: 10px;
              }
              .header h1 {
                font-size: 18px;
                margin: 0 0 5px 0;
              }
              .header p {
                margin: 2px 0;
                font-size: 10px;
              }
              .order-details {
                margin: 10px 0;
              }
              .order-details p {
                margin: 2px 0;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
              }
              .items-table th {
                text-align: left;
                border-bottom: 1px solid #333;
                padding: 5px 0;
                font-size: 11px;
              }
              .items-table td {
                padding: 3px 0;
              }
              .items-table .price {
                text-align: right;
              }
              .totals {
                border-top: 1px solid #333;
                padding-top: 5px;
              }
              .totals-row {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 10px;
                border-top: 1px solid #333;
                padding-top: 10px;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // Printable receipt content
  return (
    <>
      <button 
        onClick={printOrder}
        className="w-full py-3 bg-stone-700 text-white rounded-sm font-bold tracking-widest text-sm shadow-md hover:bg-black transition-all mb-4"
      >
        打印订单 Print Order
      </button>

      {/* Hidden print content */}
      <div ref={printRef} className="hidden">
        <div className="receipt">
          <div className="header">
            <h1>江西大酒店</h1>
            <p>Jinjiang Star Hotel</p>
            <p>四楼会所 4th Floor Club</p>
          </div>
          
          <div className="order-details">
            <p><strong>订单号 Order #:</strong> {new Date().getTime().toString().slice(-6)}</p>
            <p><strong>桌号 Table:</strong> {locationLabel}</p>
            <p><strong>时间 Time:</strong> {new Date().toLocaleString('zh-CN')}</p>
          </div>
          
          <table className="items-table">
            <thead>
              <tr>
                <th>项目 Item</th>
                <th>数量 Qty</th>
                <th className="price">价格 Price</th>
              </tr>
            </thead>
            <tbody>
              {cartItemIds.map(id => {
                const item = itemsMap.get(id);
                if (!item) return null;
                const quantity = cart[id];
                const itemTotal = item.price * quantity;
                
                return (
                  <tr key={id}>
                    <td>
                      <div>{item.zh}</div>
                      <div style={{fontSize: '9px', color: '#666'}}>{item.en}</div>
                    </td>
                    <td>{quantity}</td>
                    <td className="price">
                      {itemTotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="totals">
            <div className="totals-row">
              <span>小计 Subtotal:</span>
              <span>{subtotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
            </div>
            <div className="totals-row">
              <span>服务费 Service (10%):</span>
              <span>{serviceCharge.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
            </div>
            <div className="totals-row" style={{fontWeight: 'bold', borderTop: '1px solid #333', paddingTop: '5px'}}>
              <span>总计 Total:</span>
              <span>{grandTotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
            </div>
          </div>
          
          <div className="footer">
            <p>感谢您的惠顾</p>
            <p>Thank You for Dining with Us</p>
            <p>*** 系统订单 ***</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintService;