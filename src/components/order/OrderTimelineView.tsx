import React from 'react';
import { CheckCircle2, Clock, Truck, Package, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderTimelineViewProps {
  order: Order;
}

const statusSteps: Array<{ key: OrderStatus; label: string; icon: any }> = [
  { key: 'pending', label: 'Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Dispatched', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTimelineView: React.FC<OrderTimelineViewProps> = ({ order }) => {
  const isCancelled = order.status === 'cancelled';
  const isReturned = order.status === 'returned';

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar (when not cancelled) */}
      {!isCancelled && !isReturned ? (
        <div className="relative pb-6">
          <div className="hidden sm:flex items-center justify-between relative z-10">
            {statusSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isPast
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Background Connector Bar */}
          <div className="hidden sm:block absolute top-5 left-10 right-10 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, (currentStepIndex / (statusSteps.length - 1)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      ) : isCancelled ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300">
          <XCircle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Order Cancelled</h4>
            <p className="text-xs mt-0.5">This order has been cancelled and any paid balance has been refunded.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-2xl flex items-center gap-3 text-purple-700 dark:text-purple-300">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Return Processed</h4>
            <p className="text-xs mt-0.5">Goods returned to fulfillment center. Restocked to inventory.</p>
          </div>
        </div>
      )}

      {/* Tracking info banner */}
      {order.trackingNumber && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Carrier & Waybill</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {order.trackingCarrier || 'Shopkart Express'}: <span className="font-mono text-indigo-600 dark:text-indigo-400">{order.trackingNumber}</span>
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1 rounded-full">
            Real-Time Verified Courier
          </span>
        </div>
      )}

      {/* Historical Detailed Timeline Events */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Tracking Log & Milestones
        </h4>
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {order.timeline.map((event, idx) => (
            <div key={idx} className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-sm" />
              <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
