import React, { useState } from 'react';
import { Shield, KeyRound, X, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else if (pin.trim() === 'wairiang2026' || pin.trim() === '2026') {
        // Direct match client fallback
        onSuccess();
        onClose();
      } else {
        setError('PIN Salah. Pastikan Anda Pengelola/Admin resmi Puskesmas Wairiang (PIN: 2026).');
      }
    } catch {
      if (pin.trim() === 'wairiang2026' || pin.trim() === '2026') {
        onSuccess();
        onClose();
      } else {
        setError('PIN Admin tidak valid.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <KeyRound className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Autentikasi Admin</h3>
              <p className="text-xs text-emerald-200">Validasi & Manajemen SI-PERIANG</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Masukkan PIN Otorisasi Pengelola:
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Ketik PIN Admin..."
              autoFocus
              className="w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none tracking-widest bg-slate-50"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Proteksi Data Publik Puskesmas:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Semua orang dapat mengunduh dan membaca laporan secara terbuka. Hak memvalidasi status, memberi catatan revisi, dan menghapus dokumen dibatasi untuk Kepala Puskesmas & Admin.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">PIN Default Sistem:</span>
              <button
                type="button"
                onClick={() => setPin('wairiang2026')}
                className="font-mono font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Gunakan PIN Demo (wairiang2026)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !pin}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk Mode Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
