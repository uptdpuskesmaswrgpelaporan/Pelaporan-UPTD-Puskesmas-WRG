import React, { useState } from 'react';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { RecordItem } from '../types';
import {
  Cloud,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  LogOut,
  X,
  HardDrive,
  FolderSync,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: RecordItem[];
  onRecordUpdated?: (updatedRecord: RecordItem) => void;
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  records,
  onRecordUpdated,
  onNotify,
}) => {
  const {
    user,
    isConnected,
    isConnecting,
    loginGoogle,
    logoutGoogle,
    syncRecordToDrive,
    openDriveFolder,
    rootFolderUrl,
    error,
  } = useGoogleDrive();

  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);

  if (!isOpen) return null;

  const unsyncedRecords = records.filter((r) => !r.driveFileId);
  const syncedRecords = records.filter((r) => !!r.driveFileId);

  const handleBulkSync = async () => {
    if (!isConnected) {
      await loginGoogle();
      return;
    }

    if (unsyncedRecords.length === 0) {
      onNotify?.('Semua berkas laporan sudah tersinkronkan ke Google Drive!', 'info');
      return;
    }

    setBulkSyncing(true);
    let successCount = 0;
    const total = unsyncedRecords.length;
    setSyncProgress({ current: 0, total });

    for (let i = 0; i < total; i++) {
      const rec = unsyncedRecords[i];
      try {
        const updated = await syncRecordToDrive(rec);
        onRecordUpdated?.(updated);
        successCount++;
      } catch (e) {
        console.error(`Gagal menyinkronkan dokumen ${rec.indikator}:`, e);
      }
      setSyncProgress({ current: i + 1, total });
    }

    setBulkSyncing(false);
    setSyncProgress(null);
    onNotify?.(
      `Sinkronisasi selesai! ${successCount} dari ${total} dokumen berhasil dicadangkan ke Google Drive.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Cloud className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">Integrasi Google Drive</h3>
              <p className="text-xs text-emerald-200/90">SI-PERIANG Puskesmas Wairiang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/15 rounded-xl transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isConnected && user ? (
            <div className="space-y-4">
              {/* Account Status Card */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google Account'}
                      className="w-11 h-11 rounded-full border-2 border-emerald-500 object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {user.displayName || 'Pengguna Google'}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Terhubung
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">{user.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logoutGoogle}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Putuskan Akun Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Drive Target Folder Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-800 text-xs">Folder Utama di Google Drive:</span>
                  </div>
                  <button
                    type="button"
                    onClick={openDriveFolder}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Folder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 flex items-center justify-between">
                  <span className="truncate">SI-PERIANG Puskesmas Wairiang / [Bidang]</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Semua berkas yang diunggah otomatis tersimpan di folder ini, dikelompokkan rapi per Bidang (Kesmas, SDK, Yankes, P2P, dan UP).
                </p>
              </div>

              {/* Sync Statistics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <span className="text-emerald-800 font-medium block text-[11px]">Tersimpan di Drive</span>
                  <strong className="text-xl font-black text-emerald-900">{syncedRecords.length}</strong>
                  <span className="text-[10px] text-slate-500 block">dokumen berkas</span>
                </div>
                <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                  <span className="text-amber-800 font-medium block text-[11px]">Belum Dicadangkan</span>
                  <strong className="text-xl font-black text-amber-900">{unsyncedRecords.length}</strong>
                  <span className="text-[10px] text-slate-500 block">dokumen berkas</span>
                </div>
              </div>

              {/* Bulk sync progress if running */}
              {bulkSyncing && syncProgress && (
                <div className="bg-slate-100 p-3.5 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-medium text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span>Menyinkronkan berkas ke Google Drive...</span>
                    </span>
                    <span>{syncProgress.current} / {syncProgress.total}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bulk sync button */}
              {unsyncedRecords.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkSync}
                  disabled={bulkSyncing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  {bulkSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Menyinkronkan...</span>
                    </>
                  ) : (
                    <>
                      <FolderSync className="w-4 h-4" />
                      <span>Cadangkan {unsyncedRecords.length} Berkas Belum Tersinkron ke Drive</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto flex items-center justify-center border border-emerald-200">
                <Cloud className="w-8 h-8 text-emerald-700" />
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm">
                  Hubungkan Google Drive Puskesmas
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Kaitkan akun Google <strong>uptdpuskesmaswrgpelaporan@gmail.com</strong> agar setiap berkas laporan dan capaian kinerja otomatis tersimpan dan terorganisir di cloud Google Drive.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-700">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Keuntungan Integrasi Drive:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                  <li>Folder otomatis <strong>"SI-PERIANG Puskesmas Wairiang"</strong></li>
                  <li>Diorganisir rapi per Bidang (Kesmas, SDK, Yankes, P2P, UP)</li>
                  <li>Tautan langsung pratinjau Drive pada setiap dokumen di Dashboard</li>
                  <li>Aman, resmi, dan hanya mengakses berkas yang diunggah oleh sistem ini</li>
                </ul>
              </div>

              {/* Official Google Sign In Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={loginGoogle}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span>
                    {isConnecting ? 'Menghubungkan Akun...' : 'Hubungkan Akun Google Drive'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            {isConnected ? 'Sinkronisasi Otomatis Aktif' : 'Penyimpanan Lokal Aktif'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
