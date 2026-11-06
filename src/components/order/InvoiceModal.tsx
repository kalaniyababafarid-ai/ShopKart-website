import React from 'react';
import { X, Printer, Download, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden z-10 p-8 my-8 print:p-0 print:shadow-none print:max-w-none">
        {/* Actions bar (hidden in print) */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tax Invoice
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {order.paymentStatus === 'completed' ? 'PAID' : order.paymentStatus.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Content */}
        <div className="pt-6 space-y-6">
          {/* Header & Seller Info */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 font-heading">
                  SHOPKART
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Shopkart Marketplace Global Inc.<br />
                100 Innovation Way, Suite 800<br />
                San Francisco, CA 94105, USA<br />
                Tax Registration ID: US-EIN-948102948
              </p>
            </div>

            <div className="text-right">
              <h3 className="text-lg font-black text-slate-900">INVOICE</h3>
              <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">{order.orderNumber}</p>
              <p className="text-xs text-slate-500 mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              {order.paymentTransactionId && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Txn ID: {order.paymentTransactionId}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Shipping Address */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Billed To
              </h5>
              <p className="font-semibold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.customerEmail}</p>
              <p className="text-slate-600">{order.customerPhone}</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Delivered To
              </h5>
              <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
              <p className="text-slate-600">{order.shippingAddress.street}</p>
              <p className="text-slate-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-slate-600">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2.5">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    {item.attributes && (
                      <p className="text-[10px] text-slate-500">
                        {Object.values(item.attributes).filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 text-center font-semibold text-slate-700">{item.quantity}</td>
                  <td className="py-2.5 text-right font-medium text-slate-600">${item.price.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping ({order.shippingMethod?.name})</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                <span>Grand Total Paid</span>
                <span className="text-indigo-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Electronically authorized tax invoice generated by Shopkart.</span>
            </div>
            <span>Support: support@shopkart.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
