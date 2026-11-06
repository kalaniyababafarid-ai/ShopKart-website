import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  MapPin,
  ChevronDown,
  Building,
  Smartphone,
  Banknote,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Address, PaymentMethod } from '../types';

interface CheckoutPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, subtotal, appliedCoupon, refreshCart } = useCart();
  const { user, isAuthenticated, openAuthModal, addAddress } = useAuth();
  const { showToast } = useNotification();

  // Step 1: Address selection
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  // Step 2: Shipping method
  const [shippingMethod, setShippingMethod] = useState<'ship-std' | 'ship-exp'>('ship-std');

  // Step 3: Payment method & details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: 'Johnathan Miller',
    cardNumber: '4532 8910 2341 9821',
    expiry: '12/28',
    cvv: '884',
  });
  const [upiId, setUpiId] = useState('johnathan@okaxis');
  const [selectedBank, setSelectedBank] = useState('Chase Bank / JPMorgan');

  // Server calculation results
  const [calc, setCalc] = useState<{
    subtotal: number;
    discount: number;
    shippingFee: number;
    tax: number;
    total: number;
  }>({
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    tax: 0,
    total: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Set default address if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def.id);
    } else {
      setIsAddingNewAddress(true);
    }
  }, [user]);

  // Recalculate server numbers
  useEffect(() => {
    if (items.length === 0) return;
    api.orders
      .calculate({
        items,
        couponCode: appliedCoupon?.code,
        shippingMethodId: shippingMethod,
      })
      .then((res) => {
        setCalc({
          subtotal: res.subtotal,
          discount: res.discount,
          shippingFee: res.shippingFee,
          tax: res.tax,
          total: res.total,
        });
      })
      .catch((err) => console.error('Calculation error:', err));
  }, [items, appliedCoupon, shippingMethod]);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-full"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleCreateNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.fullName || !newAddressForm.street || !newAddressForm.city) {
      showToast('Please fill all required address fields.', 'warning');
      return;
    }
    if (!isAuthenticated) {
      showToast('Please sign in or continue as guest with this address.', 'info');
    } else {
      try {
        await addAddress({ ...newAddressForm, isDefault: true });
        setIsAddingNewAddress(false);
      } catch {
        // Handled
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to place and track your order securely.', 'info');
      openAuthModal('login');
      return;
    }

    let activeShippingAddress: Address | undefined;
    if (isAddingNewAddress) {
      if (!newAddressForm.fullName || !newAddressForm.street || !newAddressForm.city) {
        showToast('Please complete your delivery address.', 'warning');
        return;
      }
      activeShippingAddress = {
        id: `addr-temp-${Date.now()}`,
        ...newAddressForm,
      };
    } else {
      activeShippingAddress = user?.addresses.find((a) => a.id === selectedAddressId);
    }

    if (!activeShippingAddress) {
      showToast('Please select or enter a valid shipping address.', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        items,
        shippingAddress: activeShippingAddress,
        shippingMethod: {
          id: shippingMethod,
          name: shippingMethod === 'ship-exp' ? 'Express Air Priority Courier' : 'Standard Insured Delivery',
          estimatedDays: shippingMethod === 'ship-exp' ? '1-2 Business Days' : '3-5 Business Days',
          cost: calc.shippingFee,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const res = await api.orders.create(orderPayload);
      await refreshCart();

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      showToast('Order confirmed! Redirecting to receipt and shipment tracker...', 'success');
      onNavigate('order-confirmation', res.order.id);
    } catch (err: any) {
      showToast(err.message || 'Payment authorization or stock validation failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review shipping address, select delivery speed, and authorize payment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Form Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Shipping Delivery Address
                </h3>
              </div>

              {user?.addresses && user.addresses.length > 0 && !isAddingNewAddress && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Saved Addresses list */}
            {!isAddingNewAddress && user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">{addr.street}</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-slate-500 font-mono text-[11px] pt-1">
                            Phone: {addr.phone}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Add New Address Form */
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.fullName}
                      onChange={(e) =>
                        setNewAddressForm({ ...newAddressForm, fullName: e.target.value })
                      }
                      placeholder="e.g. Johnathan Miller"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddressForm.phone}
                      onChange={(e) =>
                        setNewAddressForm({ ...newAddressForm, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address & Suite/Apartment
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.street}
                    onChange={(e) =>
                      setNewAddressForm({ ...newAddressForm, street: e.target.value })
                    }
                    placeholder="742 Evergreen Terrace, Apt 4B"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.city}
                      onChange={(e) =>
                        setNewAddressForm({ ...newAddressForm, city: e.target.value })
                      }
                      placeholder="Seattle"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.state}
                      onChange={(e) =>
                        setNewAddressForm({ ...newAddressForm, state: e.target.value })
                      }
                      placeholder="Washington"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.postalCode}
                      onChange={(e) =>
                        setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })
                      }
                      placeholder="98101"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {user?.addresses && user.addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="text-xs text-slate-500 hover:underline pt-1 block"
                  >
                    Cancel and use saved address
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Shipping Courier Speed */}
          <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Shipping Courier Speed
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start justify-between transition-all ${
                  shippingMethod === 'ship-std'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'ship-std'}
                    onChange={() => setShippingMethod('ship-std')}
                    className="mt-1 text-indigo-600"
                  />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Standard Insured Delivery
                    </p>
                    <p className="text-slate-500">Estimated 3-4 business days</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {subtotal >= 50 ? 'FREE' : '$5.99'}
                </span>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start justify-between transition-all ${
                  shippingMethod === 'ship-exp'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'ship-exp'}
                    onChange={() => setShippingMethod('ship-exp')}
                    className="mt-1 text-indigo-600"
                  />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Priority Air Courier (FedEx/UPS)
                    </p>
                    <p className="text-slate-500">Guaranteed 1-2 business days</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  $14.99
                </span>
              </label>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Secure Payment Method
              </h3>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'card', label: 'Cards (Visa/MC)', icon: CreditCard },
                { id: 'upi', label: 'UPI / Instant QR', icon: Smartphone },
                { id: 'netbanking', label: 'Net Banking', icon: Building },
                { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold ring-2 ring-indigo-600/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Payment Input Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardDetails.nameOnCard}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, nameOnCard: e.target.value })
                      }
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                        }
                        className="w-full p-2.5 pl-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, expiry: e.target.value })
                        }
                        placeholder="MM/YY"
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Security CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        placeholder="•••"
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter UPI ID / Virtual Payment Address (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A secure payment collect request will be dispatched to your UPI app for authorization.
                  </p>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Financial Institution
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                    >
                      <option value="Chase Bank / JPMorgan">Chase Bank / JPMorgan</option>
                      <option value="Bank of America">Bank of America</option>
                      <option value="Citibank Worldwide">Citibank Worldwide</option>
                      <option value="Wells Fargo Financial">Wells Fargo Financial</option>
                      <option value="HDFC Bank Digital">HDFC Bank Digital</option>
                      <option value="ICICI Bank International">ICICI Bank International</option>
                      <option value="State Bank Group">State Bank Group</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p className="font-bold">Pay upon Delivery (COD)</p>
                  <p>
                    Please keep the exact amount (${calc.total.toFixed(2)}) ready in cash upon arrival of the delivery courier.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Order Items & Verification Summary */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Order Review ({items.length} items)
            </h3>

            {/* Thumbnail items list */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Server Recalculated Numbers */}
            <div className="space-y-2 text-xs pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${calc.subtotal.toFixed(2)}</span>
              </div>

              {calc.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-${calc.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping ({shippingMethod === 'ship-exp' ? 'Express Air' : 'Standard'})</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {calc.shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${calc.shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">${calc.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700 font-heading">
                <span>Total Amount Due</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  ${calc.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Verifying & Authorizing...'
                  : `Pay & Place Order ($${calc.total.toFixed(2)})`}
              </span>
            </button>

            <div className="text-[11px] text-center text-slate-400 space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Risk • Guaranteed Order Fulfillment</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
