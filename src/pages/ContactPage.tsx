import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.support.contact({ name, email, phone, subject, message });
      setIsSuccess(true);
      showToast(res.message, 'success');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      showToast(err.message || 'Could not submit inquiry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Concierge Assistance
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading">
          Get in Touch with Our Team
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Have an inquiry regarding custom volume orders, warranty care, or carrier tracking? Our concierge specialists respond around the clock.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-8 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-heading">Direct Contact Channels</h3>

            <div className="space-y-5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Global Headquarters</p>
                  <p className="mt-0.5">100 Innovation Way, Suite 800</p>
                  <p>San Francisco, CA 94105, United States</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Toll-Free Concierge</p>
                  <p className="mt-0.5">+1 (800) 555-KART (5278)</p>
                  <p className="text-[11px] text-slate-400">Mon - Fri: 8:00 AM - 9:00 PM EST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Direct Email Support</p>
                  <p className="mt-0.5">support@shopkart.com</p>
                  <p className="text-[11px] text-slate-400">Average response time: under 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Fulfillment Logistics Hours</p>
                  <p className="mt-0.5">24/7 Automated Dispatch Centers</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dedicated enterprise priority support desk</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 p-8 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Send Us a Detailed Message
          </h3>

          {isSuccess ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-emerald-800 dark:text-emerald-200">
                Message Successfully Received!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
                Thank you! Our concierge team has logged your inquiry and will reply to your email within 24 hours.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="text-xs font-bold text-emerald-800 dark:text-emerald-300 underline pt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inquiry Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Order Delivery Status / Return"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your question or requirement..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-7 py-3.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
