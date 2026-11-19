import React, { useState } from 'react';
import { X, Store, Lock, Mail, User, ShieldCheck, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import type { AuthState } from '../../types';
import { apiClient } from '../../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authState: AuthState;
  onAuthSuccess: (token: string, user: any, seller: any) => void;
  onLogout: () => void;
  onContinueGuest: () => void;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authState,
  onAuthSuccess,
  onLogout,
  onContinueGuest,
  onTriggerSync,
  isSyncing = false
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const res = await apiClient.login({ email, password });
        onAuthSuccess(res.token, res.user, res.seller);
        onClose();
      } else {
        const res = await apiClient.register({
          shop_name: shopName,
          name,
          email,
          password,
          payment_instructions: paymentInstructions
        });
        onAuthSuccess(res.token, res.user, res.seller);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-t border-stone-200 p-4 space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="w-10 h-1.5 rounded-full bg-stone-300 mx-auto" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">
                {authState.token ? 'Shop & Cloud Sync Account' : 'Connect Cloud Account'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {authState.token ? 'Your data is backed up to the cloud' : 'Sync orders across devices with zero lag'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 active:scale-95 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN ACCOUNT VIEW */}
        {authState.token && authState.seller ? (
          <div className="space-y-3.5">
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Active Shop
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Cloud Linked
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-stone-900">
                  {authState.seller.shop_name}
                </h4>
                <p className="text-xs text-stone-600">
                  Owner: {authState.user?.name} &bull; {authState.user?.email}
                </p>
              </div>

              {authState.seller.payment_instructions && (
                <div className="pt-2 border-t border-amber-200/80 text-xs text-stone-700">
                  <p className="font-bold text-[11px] text-amber-900 mb-0.5">Receipt Payment Info:</p>
                  <p className="text-[11px] text-stone-600 font-mono bg-white/70 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    {authState.seller.payment_instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Sync Now Action */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="min-h-[48px] rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="min-h-[48px] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* GUEST / SIGN-IN FORM VIEW */
          <div className="space-y-4">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`min-h-[40px] rounded-xl text-xs font-extrabold transition ${
                  mode === 'login'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`min-h-[40px] rounded-xl text-xs font-extrabold transition ${
                  mode === 'register'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Create Shop
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Shop / Bakery Name
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Maria's Homemade Brownies"
                        className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-stone-300 bg-white text-xs font-semibold outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                        className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-stone-300 bg-white text-xs font-semibold outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="baker@example.com"
                    className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-stone-300 bg-white text-xs font-semibold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-stone-300 bg-white text-xs font-semibold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Receipt Payment Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    placeholder="e.g. GCash: 0917-xxx-xxxx (Maria S.)"
                    className="w-full min-h-[44px] px-3 rounded-xl border border-stone-300 bg-white text-xs font-semibold outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[50px] rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black active:scale-95 transition disabled:opacity-60 shadow-md"
              >
                {loading
                  ? 'Connecting...'
                  : mode === 'login'
                  ? 'Sign In & Sync'
                  : 'Register Shop & Start Syncing'}
              </button>
            </form>

            {/* Offline Guest Option */}
            <div className="pt-2 border-t border-stone-200 text-center">
              <button
                type="button"
                onClick={() => {
                  onContinueGuest();
                  onClose();
                }}
                className="text-xs font-extrabold text-stone-500 hover:text-stone-900 py-1"
              >
                Continue Offline as Guest (Store locally on phone only)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
