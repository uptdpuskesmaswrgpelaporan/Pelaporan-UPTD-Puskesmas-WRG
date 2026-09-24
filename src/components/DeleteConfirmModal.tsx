import React from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { RecordItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  record: RecordItem | null;
  isAdmin: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  onOpenAdminModal: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  record,
  isAdmin,
  isDeleting,
  onClose,
  onConfirmDelete,
  onOpenAdminModal,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${
          isAdmin ? 'bg-gradient-to-r from-rose-700 to-red-800' : 'bg-gradient-to-r from-amber-700 to-amber-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl">
              {isAdmin ? (
                <Trash2 className="w-5 h-5 text-white" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-200" />
              )}
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">
                {isAdmin ? 'Konfirmasi Hapus Dokumen' : 'Otoritas Admin Diperlukan'}
              </h3>
              <p className="text-[11px] text-rose-100 opacity-90">
                {isAdmin ? 'Tindakan Otoritas Pengelola' : 'Fitur Penghapusan Dilindungi'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 hover:bg-white/20 rounded-xl transition text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {isAdmin ? (
            <>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold mb-1">Peringatan Penghapusan Berkas:</p>
                  <p className="text-rose-800/90">
                    Apakah Anda yakin ingin menghapus berkas laporan/capaian ini? Dokumen dan file fisik akan dihapus permanen dari server Puskesmas Wairiang.
                  </p>
                </div>
              </div>

              {/* Target Record Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Indikator & Bidang</span>
                  <span className="font-bold text-slate-900 text-sm">{record.indikator}</span>
                  <span className="text-slate-500 block">{record.program} ({record.bidang} • {record.type.toUpperCase()})</span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-600 text-[11px]">
                  <span>PJ: <strong className="text-slate-800">{record.pjNama}</strong></span>
                  <span>Periode: <strong className="text-slate-800">{record.periodeNama || `${record.periodeBulan} ${record.periodeTahun}`}</strong></span>
                </div>

                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 truncate">
                  Berkas: {record.fileOriginalName || record.fileName}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Akses Penghapusan Khusus Admin</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  Untuk menjaga integritas dan keamanan data pelaporan Puskesmas Wairiang, menu hapus dokumen <strong>hanya dapat digunakan setelah masuk ke Mode Admin</strong> dengan otorisasi resmi.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[10px]">Dokumen yang dipilih:</span>
                <span className="font-bold text-slate-900">{record.indikator}</span>
                <span className="text-slate-500 text-[11px] block">{record.pjNama}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Batal
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus Dokumen...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Dokumen</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminModal();
              }}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Masuk Mode Admin</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
