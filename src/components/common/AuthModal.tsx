import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, ShieldCheck, Sparkles, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, setAuthToken } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, login, register, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password Recovery state
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [receivedPinNotice, setReceivedPinNotice] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else if (authModalTab === 'register') {
        await register(name, email, password, phone);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (type: 'customer' | 'admin') => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      if (type === 'admin') {
        await login('admin@shopkart.com', 'Admin@123');
      } else {
        await login('john@example.com', 'Customer@123');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await api.auth.forgotPassword(resetEmail.trim());
      setReceivedPinNotice(res.resetPin || '782910');
      setResetPin(res.resetPin || '782910');
      setRecoveryStep('verify');
      showToast(res.message, 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPin.trim() || !newPassword) {
      setErrorMessage('Please enter the verification PIN and new password.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await api.auth.resetPassword({
        email: resetEmail.trim(),
        resetPin: resetPin.trim(),
        newPassword,
      });

      setAuthToken(res.token);
      await refreshUser();
      showToast(res.message, 'success');
      closeAuthModal();
      // Reset state
      setRecoveryStep('request');
      setResetEmail('');
      setResetPin('');
      setNewPassword('');
      setReceivedPinNotice(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setErrorMessage('');
              openAuthModal('login');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
              authModalTab === 'login'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setErrorMessage('');
              openAuthModal('register');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
              authModalTab === 'register'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={closeAuthModal}
            className="px-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Accounts Banner (when not in recovery) */}
        {authModalTab !== 'forgot-password' && (
          <div className="px-6 pt-4 pb-2 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Demo 1-Click Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold text-center transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                Demo Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold text-center transition-colors border border-purple-200 dark:border-purple-800"
              >
                Demo Admin Portal
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD WORKFLOW */}
        {authModalTab === 'forgot-password' ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  openAuthModal('login');
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Reset Account Password
              </h3>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </div>
            )}

            {recoveryStep === 'request' ? (
              <form onSubmit={handleRequestResetPin} className="space-y-4">
                <p className="text-xs text-slate-500">
                  Enter your registered email address. We will dispatch a 6-digit security verification PIN to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Security PIN...' : 'Send Verification PIN'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                {receivedPinNotice && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Security PIN Dispatched!</span>
                    </div>
                    <p>
                      Your verification PIN is: <strong className="font-mono text-sm tracking-widest">{receivedPinNotice}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    6-Digit Verification PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={resetPin}
                      onChange={(e) => setResetPin(e.target.value)}
                      placeholder="782910"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Secure Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password & Sign In'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* LOGIN & REGISTER FORMS */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </div>
            )}

            {authModalTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {authModalTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setResetEmail(email || 'john@example.com');
                      openAuthModal('forgot-password');
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 mt-2"
            >
              {isSubmitting
                ? 'Please wait...'
                : authModalTab === 'login'
                ? 'Sign In to Account'
                : 'Create My Account'}
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Bank-grade 256-bit encrypted credential storage</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
