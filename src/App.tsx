import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Beranda } from './components/Beranda';
import { Dashboard } from './components/Dashboard';
import { LaporanForm } from './components/LaporanForm';
import { CapaianForm } from './components/CapaianForm';
import { FilePreviewModal } from './components/FilePreviewModal';
import { AdminModal } from './components/AdminModal';
import { PuskesmasLogo } from './components/PuskesmasLogo';
import { ThemeModal } from './components/ThemeModal';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleDriveProvider } from './context/GoogleDriveContext';
import { RecordItem, ValidationStatus } from './types';
import { api } from './services/api';
import { ShieldCheck, Building2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'beranda' | 'dashboard' | 'laporan' | 'capaian'>('beranda');
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Admin Mode state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('si_periang_admin_auth') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Preview Modal state
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Toast alert state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load records
  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecords();
      setRecords(data);
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleOpenPreview = (record: RecordItem) => {
    setSelectedRecord(record);
    setIsPreviewOpen(true);
  };

  const handleRecordCreated = (newRecord: RecordItem) => {
    setRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    showToast(`Dokumen "${newRecord.indikator}" berhasil diunggah! Status: Menunggu Verifikasi Admin.`);
  };

  // Admin validation from modal
  const handleValidate = async (id: string, status: ValidationStatus, notes: string) => {
    try {
      const updated = await api.validateRecord(
        id,
        status,
        notes,
        'Admin Pengelola (Puskesmas Wairiang)'
      );
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(updated);
      }
      showToast(
        status === 'diverifikasi' || status === 'valid'
          ? 'Dokumen berhasil Diverifikasi!'
          : 'Status berkas berhasil diperbarui.'
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal memvalidasi', 'error');
    }
  };

  // Direct 1-click verification from Admin Queue in Dashboard
  const handleDirectVerify = async (recordId: string) => {
    try {
      const targetRecord = records.find((r) => r.id === recordId);
      const updated = await api.validateRecord(
        recordId,
        'diverifikasi',
        'Diverifikasi langsung oleh Pengelola Puskesmas Wairiang',
        'Admin Pengelola (Puskesmas Wairiang)'
      );
      setRecords((prev) => prev.map((r) => (r.id === recordId ? updated : r)));
      if (selectedRecord && selectedRecord.id === recordId) {
        setSelectedRecord(updated);
      }
      showToast(`Dokumen "${targetRecord?.indikator || 'Program'}" telah Diverifikasi!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memverifikasi dokumen', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteRecord(id, 'wairiang2026');
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord && selectedRecord.id === id) {
        setIsPreviewOpen(false);
        setSelectedRecord(null);
      }
      showToast('Dokumen berhasil dihapus.');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus dokumen', 'error');
    }
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('si_periang_admin_auth', 'true');
    // Langsung arahkan ke Dashboard agar berkas "Menunggu Verifikasi" tampil di hadapan admin
    setCurrentTab('dashboard');
    showToast('Berhasil masuk Mode Admin. Membuka antrean berkas Menunggu Verifikasi.');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('si_periang_admin_auth');
    showToast('Keluar dari Mode Admin.', 'info');
  };

  // Count pending records for badges
  const pendingCount = records.filter(
    (r) => r.status === 'menunggu_verifikasi' || r.status === 'menunggu'
  ).length;

  return (
    <ThemeProvider>
      <GoogleDriveProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          
          {/* Toast Notification */}
          {toast && (
            <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
              <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
                toast.type === 'success'
                  ? 'bg-emerald-900 text-white border-emerald-700'
                  : toast.type === 'error'
                  ? 'bg-rose-900 text-white border-rose-700'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}>
                <span>{toast.message}</span>
              </div>
            </div>
          )}

          {/* Navigation Bar (Branding UPTD PUSKESMAS WAIRIANG - DINAS KESEHATAN KABUPATEN LEMBATA) */}
          <Navbar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            isAdmin={isAdmin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onLogoutAdmin={handleAdminLogout}
            totalRecordsCount={records.length}
            pendingVerificationCount={pendingCount}
          />

          {/* Main Content Areas */}
          <main className="flex-1">
            {currentTab === 'beranda' && (
              <Beranda
                records={records}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
                onSelectPreview={handleOpenPreview}
                isAdmin={isAdmin}
                onOpenAdminModal={() => setIsAdminModalOpen(true)}
              />
            )}

            {currentTab === 'dashboard' && (
              <Dashboard
                records={records}
                isLoading={isLoading}
                onRefresh={loadRecords}
                onSelectPreview={handleOpenPreview}
                isAdmin={isAdmin}
                onOpenAdminModal={() => setIsAdminModalOpen(true)}
                onDeleteRecord={handleDelete}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
                onDirectVerify={handleDirectVerify}
              />
            )}

            {currentTab === 'laporan' && (
              <LaporanForm
                onSuccess={handleRecordCreated}
                onNavigateToDashboard={() => setCurrentTab('dashboard')}
              />
            )}

            {currentTab === 'capaian' && (
              <CapaianForm
                onSuccess={handleRecordCreated}
                onNavigateToDashboard={() => setCurrentTab('dashboard')}
              />
            )}
          </main>

          {/* File Preview & Admin Validation Modal */}
          <FilePreviewModal
            record={selectedRecord}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            isAdmin={isAdmin}
            onValidate={handleValidate}
            onDelete={handleDelete}
          />

          {/* Admin Authentication PIN Modal */}
          <AdminModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onSuccess={handleAdminSuccess}
          />

          {/* Theme Palette Modal */}
          <ThemeModal />

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PuskesmasLogo size="sm" />
                <div>
                  <p className="font-bold text-slate-800">
                    SI-PERIANG • UPTD PUSKESMAS WAIRIANG
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    DINAS KESEHATAN KABUPATEN LEMBATA
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  Bidang: Kesmas • SDK • Yankes • P2P • UP
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                  Sistem Input Laporan & Capaian Resmi
                </span>
              </div>
            </div>
          </footer>

        </div>
      </GoogleDriveProvider>
    </ThemeProvider>
  );
}
