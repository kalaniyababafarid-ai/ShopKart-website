import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface ReturnModalProps {
  order: Order | null;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ order, onClose, onSuccess }) => {
  const { showToast } = useNotification();
  const [reason, setReason] = useState('Item arrived defective or not functioning as described');
  const [requestType, setRequestType] = useState<'return' | 'refund' | 'replacement'>('refund');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      showToast('Please provide comments describing the issue.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.orders.requestReturn(order.id, {
        reason,
        comments: comments.trim(),
        requestType,
      });
      showToast(res.message, 'success');
      onSuccess(res.order);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Could not submit return request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Request Return or Replacement
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Shopkart 30-Day Guarantee: Free return pickup and full refund/replacement upon inspection. Order: <strong>{order.orderNumber}</strong>.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Resolution Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestType('refund')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  requestType === 'refund'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Return for Full Refund (${order.total.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setRequestType('replacement')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  requestType === 'replacement'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Direct Replacement Unit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Reason for Return
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
            >
              <option value="Item arrived defective or not functioning as described">
                Item arrived defective or not functioning as described
              </option>
              <option value="Received incorrect size, color or variant">
                Received incorrect size, color or variant
              </option>
              <option value="Packaging damaged during courier transit">
                Packaging damaged during courier transit
              </option>
              <option value="Item differs significantly from catalog photos/specs">
                Item differs significantly from catalog photos/specs
              </option>
              <option value="Changed mind / No longer needed">
                Changed mind / No longer needed
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Comments & Observations
            </label>
            <textarea
              required
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe condition of item, package integrity, or reason for return..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
