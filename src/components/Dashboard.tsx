import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  TrendingUp, 
  FileSpreadsheet, 
  File, 
  Image as ImageIcon,
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Download, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  Calendar, 
  User, 
  LayoutGrid, 
  List, 
  FileDown, 
  RefreshCw, 
  Check, 
  Phone,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Cloud,
  HardDrive
} from 'lucide-react';
import { RecordItem, ValidationStatus, BidangType, RecordType, getStatusLabel } from '../types';
import { BIDANG_LIST, BULAN_LIST, TAHUN_LIST } from '../data/programs';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import * as XLSX from 'xlsx';
import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  records: RecordItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectPreview: (record: RecordItem) => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onDeleteRecord: (id: string) => Promise<void>;
  onNavigateToTab: (tab: 'beranda' | 'laporan' | 'capaian' | 'dashboard') => void;
  onDirectVerify?: (recordId: string) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  records,
  isLoading,
  onRefresh,
  onSelectPreview,
  isAdmin,
  onOpenAdminModal,
  onDeleteRecord,
  onNavigateToTab,
  onDirectVerify,
}) => {
  const { theme } = useTheme();
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidang, setSelectedBidang] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBulan, setSelectedBulan] = useState<string>('all');
  const [selectedTahun, setSelectedTahun] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalRecord, setDeleteModalRecord] = useState<RecordItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDelete = (item: RecordItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModalRecord(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalRecord) return;
    setIsDeleting(true);
    try {
      await onDeleteRecord(deleteModalRecord.id);
      setIsDeleteModalOpen(false);
      setDeleteModalRecord(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute pending records for Admin Quick Queue
  const pendingRecords = useMemo(() => {
    return records.filter((r) => r.status === 'menunggu_verifikasi' || r.status === 'menunggu');
  }, [records]);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = records.length;
    const diverifikasi = records.filter((r) => r.status === 'diverifikasi' || r.status === 'valid').length;
    const menunggu = records.filter((r) => r.status === 'menunggu_verifikasi' || r.status === 'menunggu').length;
    const revisi = records.filter((r) => r.status === 'revisi').length;
    const totalPj = new Set(records.map((r) => r.pjNama.trim()).filter(Boolean)).size;

    return { total, diverifikasi, menunggu, revisi, totalPj };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          r.indikator.toLowerCase().includes(q) ||
          r.program.toLowerCase().includes(q) ||
          r.pjNama.toLowerCase().includes(q) ||
          r.fileOriginalName.toLowerCase().includes(q) ||
          (r.keterangan && r.keterangan.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Bidang
      if (selectedBidang !== 'all' && r.bidang !== selectedBidang) return false;

      // Type
      if (selectedType !== 'all' && r.type !== selectedType) return false;

      // Status
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'diverifikasi' && (r.status !== 'diverifikasi' && r.status !== 'valid')) return false;
        if (selectedStatus === 'menunggu_verifikasi' && (r.status !== 'menunggu_verifikasi' && r.status !== 'menunggu')) return false;
        if (selectedStatus === 'revisi' && r.status !== 'revisi') return false;
      }

      // Bulan
      if (selectedBulan !== 'all' && r.periodeBulan !== selectedBulan) return false;

      // Tahun
      if (selectedTahun !== 'all' && String(r.periodeTahun) !== selectedTahun) return false;

      return true;
    });
  }, [records, searchQuery, selectedBidang, selectedType, selectedStatus, selectedBulan, selectedTahun]);

  // Direct quick verification by Admin
  const handleQuickVerify = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDirectVerify) return;
    try {
      setVerifyingId(recordId);
      await onDirectVerify(recordId);
    } finally {
      setVerifyingId(null);
    }
  };

  // Export current list to Excel
  const handleExportSummary = () => {
    const exportData = filteredRecords.map((r, i) => ({
      No: i + 1,
      Tipe: r.type.toUpperCase(),
      Bidang: r.bidang,
      Program: r.program,
      Indikator: r.indikator,
      Periode: r.periodeNama || `${r.periodeBulan} ${r.periodeTahun}`,
      'PJ Program': r.pjNama,
      'Kontak PJ': r.pjKontak || '-',
      Status: getStatusLabel(r.status),
      'Nama Berkas': r.fileOriginalName || r.fileName,
      'Diverifikasi Oleh': r.validatedBy || '-',
      'Tanggal Upload': new Date(r.uploadedAt).toLocaleDateString('id-ID'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap SI-PERIANG');
    XLSX.writeFile(wb, `Rekap_SI_PERIANG_Puskesmas_Wairiang_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* ============================================================== */}
      {/* MODE ADMIN: PANEL ANTREAN VERIFIKASI CEPAT LANGSUNG MUNCUL   */}
      {/* ============================================================== */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Mode Admin: Antrean Menunggu Verifikasi
                  </h2>
                  <span className="bg-amber-500 text-white text-xs px-2.5 py-0.5 rounded-full font-black animate-pulse">
                    {pendingRecords.length} Dokumen Baru
                  </span>
                </div>
                <p className="text-xs text-amber-900/80">
                  Berikut berkas laporan & capaian yang baru diunggah. Klik <strong>"Verifikasi Sekarang"</strong> untuk langsung mengesahkan dokumen menjadi status <strong>"Diverifikasi"</strong>.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl self-start sm:self-center">
              ✓ Otoritas Verifikasi Aktif
            </span>
          </div>

          {/* Pending items list */}
          {pendingRecords.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Semua dokumen laporan dan capaian telah diverifikasi. Tidak ada antrean berkas yang berstatus menunggu verifikasi saat ini.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {pendingRecords.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 transition flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.type === 'laporan' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {item.bidang}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Menunggu Verifikasi
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                      {item.indikator}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.program} • <span className="font-semibold text-slate-700">{item.periodeNama || `${item.periodeBulan} ${item.periodeTahun}`}</span>
                    </p>

                    <div className="text-[11px] text-slate-600 pt-1 flex items-center justify-between">
                      <span className="font-semibold">PJ: {item.pjNama}</span>
                      <span className="text-slate-400 font-mono text-[10px] truncate max-w-[140px]">
                        {item.fileOriginalName || item.fileName}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Direct Verify or Preview */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onSelectPreview(item)}
                      className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pratinjau</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleQuickVerify(item.id, e)}
                      disabled={verifyingId === item.id}
                      className="flex-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      {verifyingId === item.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 stroke-[3]" />
                      )}
                      <span>{verifyingId === item.id ? 'Memproses...' : 'Verifikasi Sekarang'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total File */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Total Berkas</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.total}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Dokumen tersimpan</p>
          </div>
        </div>

        {/* Diverifikasi */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Diverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{metrics.diverifikasi}</span>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">Disetujui Admin</p>
          </div>
        </div>

        {/* Menunggu Verifikasi Admin */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.menunggu}</span>
            <p className="text-[11px] text-amber-700 mt-0.5">Perlu diverifikasi</p>
          </div>
        </div>

        {/* Perlu Revisi */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Perlu Revisi</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-rose-700">{metrics.revisi}</span>
            <p className="text-[11px] text-rose-600/80 mt-0.5">Catatan perbaikan</p>
          </div>
        </div>

      </div>

      {/* Bidang Selector Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSelectedBidang('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedBidang === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Bidang ({records.length})
          </button>
          {BIDANG_LIST.map((b) => {
            const count = records.filter((r) => r.bidang === b.id).length;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBidang(b.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  selectedBidang === b.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{b.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedBidang === b.id ? 'bg-emerald-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleExportSummary}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 text-xs font-bold border border-slate-200 cursor-pointer"
            title="Ekspor Rekap Excel"
          >
            <FileDown className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          <button
            onClick={onRefresh}
            title="Segarkan Data"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari indikator (KIA, Gizi, Farmasi, Malaria...), PJ Program, atau nama berkas..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            
            {/* Tipe Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-emerald-600 font-medium"
            >
              <option value="all">Semua Tipe (Laporan & Capaian)</option>
              <option value="laporan">Laporan Saja</option>
              <option value="capaian">Capaian Saja</option>
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-emerald-600 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi Admin</option>
              <option value="diverifikasi">Diverifikasi</option>
              <option value="revisi">Perlu Revisi</option>
            </select>

            {/* Bulan Selector */}
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-emerald-600"
            >
              <option value="all">Semua Bulan</option>
              {BULAN_LIST.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-300 rounded-xl p-0.5 bg-slate-100">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Info line */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dokumen Terbuka: Setiap pengguna dapat melihat pratinjau dan mengunduh berkas langsung.</span>
          </div>
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredRecords.length}</span> dokumen
          </div>
        </div>
      </div>

      {/* Records Listing */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Tidak ada dokumen laporan/capaian yang sesuai
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Coba sesuaikan kata kunci pencarian atau ubah filter Bidang, Tipe, dan Status di atas.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBidang('all');
              setSelectedType('all');
              setSelectedStatus('all');
              setSelectedBulan('all');
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((item) => {
            const isVerified = item.status === 'diverifikasi' || item.status === 'valid';
            const isPending = item.status === 'menunggu_verifikasi' || item.status === 'menunggu';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group hover:border-emerald-300"
              >
                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        {item.fileType === 'pdf' && <FileText className="w-5 h-5 text-rose-600" />}
                        {item.fileType === 'excel' && <FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
                        {item.fileType === 'word' && <File className="w-5 h-5 text-blue-600" />}
                        {item.fileType === 'image' && <ImageIcon className="w-5 h-5 text-purple-600" />}
                        {item.fileType === 'other' && <File className="w-5 h-5 text-slate-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            item.type === 'laporan' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {item.bidang}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-emerald-800 transition">
                          {item.indikator}
                        </h4>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 flex items-center gap-1 ${
                      isVerified
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'revisi'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {item.status === 'revisi' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                      {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{getStatusLabel(item.status)}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 mb-2.5">
                    {item.program}
                  </p>

                  {/* Periode Badge */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mb-3">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Periode: {item.periodeNama || `${item.periodeBulan} ${item.periodeTahun}`}</span>
                  </div>

                  {/* File Info */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="truncate font-mono">{item.fileOriginalName || item.fileName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {formatBytes(item.fileSize)}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                        {item.pjNama}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.uploadedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectPreview(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pratinjau</span>
                    </button>

                    <a
                      href={item.fileUrl}
                      download={item.fileOriginalName || item.fileName}
                      className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition"
                      title="Unduh Berkas Langsung"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {item.driveWebViewLink && (
                      <a
                        href={item.driveWebViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl transition"
                        title="Buka Dokumen di Google Drive"
                      >
                        <Cloud className="w-4 h-4 text-emerald-700" />
                      </a>
                    )}

                    {/* Admin direct verify button on card */}
                    {isAdmin && isPending && (
                      <button
                        onClick={(e) => handleQuickVerify(item.id, e)}
                        disabled={verifyingId === item.id}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                        title="Verifikasi dokumen sekarang"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Verifikasi</span>
                      </button>
                    )}

                    {/* Delete button (Protected by Admin authorization) */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenDelete(item, e)}
                      className={`p-1.5 rounded-xl transition flex items-center justify-center ${
                        isAdmin
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200'
                      }`}
                      title={isAdmin ? 'Hapus Dokumen (Admin)' : 'Hapus Dokumen (Hanya untuk Admin)'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Tipe & Bidang</th>
                  <th className="py-3.5 px-4">Indikator & Program</th>
                  <th className="py-3.5 px-4">Periode</th>
                  <th className="py-3.5 px-4">Penanggung Jawab (PJ)</th>
                  <th className="py-3.5 px-4">Berkas Dokumen</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((item) => {
                  const isVerified = item.status === 'diverifikasi' || item.status === 'valid';
                  const isPending = item.status === 'menunggu_verifikasi' || item.status === 'menunggu';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.type === 'laporan' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {item.type}
                        </span>
                        <span className="ml-1.5 text-[10px] text-slate-500 font-semibold uppercase">
                          {item.bidang}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{item.indikator}</span>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">{item.program}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-semibold">
                        {item.periodeNama || `${item.periodeBulan} ${item.periodeTahun}`}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">{item.pjNama}</span>
                        {item.pjKontak && (
                          <span className="text-[10px] text-slate-400">{item.pjKontak}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <span className="font-mono text-[11px] text-slate-700 block truncate">
                          {item.fileOriginalName || item.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.fileType.toUpperCase()} • {formatBytes(item.fileSize)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'revisi'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {item.status === 'revisi' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{getStatusLabel(item.status)}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPreview(item)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={item.fileUrl}
                            download={item.fileOriginalName || item.fileName}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Unduh Berkas"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {item.driveWebViewLink && (
                            <a
                              href={item.driveWebViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition border border-emerald-300"
                              title="Buka Dokumen di Google Drive"
                            >
                              <Cloud className="w-4 h-4 text-emerald-700" />
                            </a>
                          )}

                          {isAdmin && isPending && (
                            <button
                              onClick={(e) => handleQuickVerify(item.id, e)}
                              disabled={verifyingId === item.id}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                              title="Verifikasi Sekarang"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verifikasi</span>
                            </button>
                          )}

                          {/* Delete button (Protected by Admin authorization) */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenDelete(item, e)}
                            className={`p-1.5 rounded-lg transition flex items-center justify-center ${
                              isAdmin
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                            }`}
                            title={isAdmin ? 'Hapus Dokumen (Admin)' : 'Hapus Dokumen (Hanya untuk Admin)'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom In-App Delete Confirmation Modal (Admin Protection & Safe Deletion) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        record={deleteModalRecord}
        isAdmin={isAdmin}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeleteModalRecord(null);
          }
        }}
        onConfirmDelete={handleConfirmDelete}
        onOpenAdminModal={onOpenAdminModal}
      />

    </div>
  );
};
