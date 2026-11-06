import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Package,
  Printer,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { OrderTimelineView } from '../components/order/OrderTimelineView';
import { InvoiceModal } from '../components/order/InvoiceModal';
import { getProductFallbackSvg } from '../utils/imageFallback';

interface OrderConfirmationPageProps {
  orderId: string;
  onNavigate: (page: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    api.orders
      .get(orderId)
      .then((res) => setOrder(res.order))
      .catch((err) => {
        console.error('Order fetch error:', err);
        setOrder(null);
      })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Generating your order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Order Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We could not locate this order record. It may have already been archived or you may have accessed this page directly without an active checkout.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('account', 'orders')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md shadow-indigo-600/20 transition-all"
          >
            View My Orders
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Success Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-indigo-500/5 to-purple-500/10 border border-emerald-500/20 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
          Order Confirmed & Payment Authorized!
        </h1>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Thank you for shopping with Shopkart. A confirmation email and tax invoice receipt have been sent to <strong>{order.customerEmail}</strong>.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-mono font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            Order Reference: {order.orderNumber}
          </span>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-4 py-1.5 rounded-full shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Shipment Live Tracking Card */}
      <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Courier Tracking
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full uppercase">
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        <OrderTimelineView order={order} />
      </div>

      {/* Order Summary & Destination Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Destination Shipping Address</span>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-300 pt-1">
            <p className="font-bold text-slate-900 dark:text-white">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="text-slate-400 font-mono pt-1">Contact: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Payment Breakdown</span>
          </div>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="font-bold uppercase text-slate-900 dark:text-white">{order.paymentMethod}</span>
            </div>
            {order.paymentTransactionId && (
              <div className="flex justify-between">
                <span>Transaction Ref</span>
                <span className="font-mono text-[10px] text-slate-500">{order.paymentTransactionId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
              <span>Total Authorized</span>
              <span className="text-indigo-600 dark:text-indigo-400">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Purchased Items ({order.items.length})
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getProductFallbackSvg(item.title);
                  }}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                ${item.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-wrap gap-4 justify-between items-center pt-2">
        <button
          onClick={() => onNavigate('account', 'orders')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View All Orders in Account
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-7 py-3 rounded-full shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        order={order}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
