import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Heart,
  MessageSquare,
  User as UserIcon,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  RotateCcw,
  XCircle,
  Truck,
  ExternalLink,
  ChevronDown,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Order, SupportTicket, Address } from '../types';
import { OrderTimelineView } from '../components/order/OrderTimelineView';
import { InvoiceModal } from '../components/order/InvoiceModal';
import { ReturnModal } from '../components/order/ReturnModal';
import { getProductFallbackSvg } from '../utils/imageFallback';

interface AccountPageProps {
  initialTab?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { showToast } = useNotification();

  const resolveTab = (tab?: string): 'orders' | 'addresses' | 'wishlist' | 'tickets' | 'security' => {
    if (tab === 'profile' || tab === 'settings') return 'security';
    if (tab && ['orders', 'addresses', 'wishlist', 'tickets', 'security'].includes(tab)) {
      return tab as any;
    }
    return 'orders';
  };

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'tickets' | 'security'>(() =>
    resolveTab(initialTab)
  );

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Support tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Order & Delivery');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketReplyText, setTicketReplyText] = useState<Record<string, string>>({});

  // Address modal form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  // Profile & Password forms
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(resolveTab(initialTab));
    }
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  // Load orders and tickets
  useEffect(() => {
    if (!isAuthenticated) return;
    api.orders.list().then((res) => setOrders(res.orders)).catch(() => {});
    api.support.getTickets().then((res) => setTickets(res.tickets)).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto text-indigo-600">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Sign In to Access Your Customer Account
        </h2>
        <p className="text-xs text-slate-500">
          Track shipments, download official invoices, manage addresses, and view order history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-8 py-3 rounded-full shadow-lg shadow-indigo-600/25"
        >
          Sign In to Shopkart
        </button>
      </div>
    );
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await api.orders.cancel(orderId, 'Cancelled by customer request');
      setOrders(orders.map((o) => (o.id === orderId ? res.order : o)));
      setOrderToCancel(null);
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not cancel order.', 'error');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      setIsAddingAddress(false);
      setNewAddress({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
      });
    } catch {
      // Handled
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({ name: profileName, phone: profilePhone, avatar: profileAvatar });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await api.auth.changePassword({ currentPassword, newPassword });
      showToast(res.message, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Could not update password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;
    setIsSubmittingTicket(true);
    try {
      const res = await api.support.createTicket({
        subject: newTicketSubject.trim(),
        category: newTicketCategory,
        message: newTicketMessage.trim(),
      });
      setTickets([res.ticket, ...tickets]);
      showToast(res.message, 'success');
      setNewTicketSubject('');
      setNewTicketMessage('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    const text = ticketReplyText[ticketId];
    if (!text || !text.trim()) return;
    try {
      const res = await api.support.replyTicket(ticketId, text.trim());
      setTickets(tickets.map((t) => (t.id === ticketId ? res.ticket : t)));
      setTicketReplyText({ ...ticketReplyText, [ticketId]: '' });
      showToast('Reply dispatched to support team.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Header */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              {user?.name}
            </h1>
            <p className="text-xs text-slate-500">{user?.email} • Member since {new Date(user?.createdAt || '').getFullYear()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Total Orders</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{orders.length}</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Saved Wishlist</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{wishlist.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 sm:gap-6 text-xs font-bold">
        {[
          { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
          { id: 'addresses', label: `Saved Addresses (${user?.addresses.length || 0})`, icon: MapPin },
          { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
          { id: 'tickets', label: `Support Tickets (${tickets.length})`, icon: MessageSquare },
          { id: 'security', label: 'Security & Profile', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-2 flex items-center gap-2 whitespace-nowrap transition-colors relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panes */}
      <div>
        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter by status */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-semibold">Filter Orders:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped & In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-16 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">No Orders Found</h4>
                <p className="text-xs text-slate-500">You do not have any orders under this filter.</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="bg-indigo-600 text-white text-xs font-bold px-6 py-2 rounded-full"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const isDelivered = ord.status === 'delivered';
                  const canCancel = ['pending', 'confirmed'].includes(ord.status);
                  const isExpandedTracking = selectedOrderForTracking?.id === ord.id;

                  return (
                    <div
                      key={ord.id}
                      className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60 text-xs">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                              {ord.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : ord.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : ord.status === 'returned'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-slate-400 mt-1 block">
                            Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>

                          <button
                            onClick={() =>
                              setSelectedOrderForTracking(isExpandedTracking ? null : ord)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{isExpandedTracking ? 'Hide Tracking' : 'Track Shipment'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={it.image}
                                alt={it.title}
                                className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getProductFallbackSvg(it.title);
                                }}
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {it.title}
                                </h4>
                                <p className="text-[11px] text-slate-400">Qty: {it.quantity} • ${it.price.toFixed(2)} each</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                              ${it.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Expanded Tracking Timeline */}
                      {isExpandedTracking && (
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <OrderTimelineView order={ord} />
                        </div>
                      )}

                      {/* Order Footer & Actions */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap justify-between items-center gap-4 text-xs">
                        <div>
                          <span className="text-slate-500">Total: </span>
                          <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                            ${ord.total.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {canCancel && (
                            <button
                              onClick={() => setOrderToCancel(ord)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 dark:border-rose-900 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}

                          {isDelivered && !ord.returnRequest && (
                            <button
                              onClick={() => setSelectedOrderForReturn(ord)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            >
                              Request Return / Refund
                            </button>
                          )}

                          {ord.returnRequest && (
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-full">
                              Return {ord.returnRequest.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Saved Delivery Addresses
              </h3>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  New Shipping Address
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded">
                            Default Address
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{addr.street}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">Phone: {addr.phone}</p>
                    </div>

                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      aria-label="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                    >
                      Set as Default Delivery Address
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              My Saved Items ({wishlist.length})
            </h3>

            {wishlist.length === 0 ? (
              <div className="p-16 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Heart className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Wishlist is Empty</h4>
                <p className="text-xs text-slate-500">Save items while browsing to track price changes and quick-order later.</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="bg-indigo-600 text-white text-xs font-bold px-6 py-2 rounded-full"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full aspect-square object-cover rounded-xl bg-slate-100"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getProductFallbackSvg(prod.title, prod.categoryId, prod.brandId);
                        }}
                      />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3 line-clamp-2">
                        {prod.title}
                      </h4>
                      <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        ${prod.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => addToCart(prod.id, prod.variants[0]?.id, 1)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(prod)}
                        className="w-full text-center text-xs text-slate-400 hover:text-rose-500 font-semibold"
                      >
                        Remove from Wishlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Support Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {/* Create Ticket */}
            <form onSubmit={handleCreateTicket} className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Open a Support Inquiry or Ticket
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    placeholder="e.g. Question about order tracking"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <option value="Order & Delivery">Order & Delivery</option>
                    <option value="Product Technical Support">Product Technical Support</option>
                    <option value="Returns & Warranty">Returns & Warranty</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  placeholder="Detail your inquiry or issue..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingTicket}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl disabled:opacity-50"
              >
                {isSubmittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>

            {/* Tickets List */}
            <div className="space-y-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {t.ticketNumber}
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {t.subject}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{t.message}</p>
                    </div>
                  </div>

                  {/* Replies thread */}
                  {t.replies.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Conversation Thread
                      </span>
                      {t.replies.map((rep) => (
                        <div
                          key={rep.id}
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            rep.sender === 'support'
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900'
                              : 'bg-slate-50 dark:bg-slate-800'
                          }`}
                        >
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={rep.sender === 'support' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}>
                              {rep.senderName}
                            </span>
                            <span className="text-slate-400 font-normal">
                              {new Date(rep.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200">{rep.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={ticketReplyText[t.id] || ''}
                      onChange={(e) =>
                        setTicketReplyText({ ...ticketReplyText, [t.id]: e.target.value })
                      }
                      placeholder="Type a reply to concierge..."
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <button
                      onClick={() => handleReplyTicket(t.id)}
                      className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold px-4 rounded-xl"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Security & Profile */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Edit Profile */}
            <form onSubmit={handleSaveProfile} className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Personal Profile Details
              </h4>

              <div>
                <label className="block text-xs font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl disabled:opacity-50"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>

            {/* Change Password */}
            <form onSubmit={handleChangePassword} className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Change Account Password
              </h4>

              <div>
                <label className="block text-xs font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">New Password (min 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold px-6 py-2.5 rounded-xl disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modals */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setOrderToCancel(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 z-10 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Cancel Order {orderToCancel.orderNumber}?
            </h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this order? Stock will be restored to our warehouse and any authorized amount (${orderToCancel.total.toFixed(2)}) will be refunded immediately.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => handleCancelOrder(orderToCancel.id)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />

      <ReturnModal
        order={selectedOrderForReturn}
        onClose={() => setSelectedOrderForReturn(null)}
        onSuccess={(updated) => {
          setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
        }}
      />
    </div>
  );
};
