import React, { useState, useMemo, useEffect } from 'react';
import { 
  ActivityLogItem, 
  ActivityActionType, 
  RecordItem, 
  BidangType 
} from '../types';
import { BIDANG_LIST } from '../data/programs';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Search, 
  FileDown, 
  RefreshCw, 
  Clock, 
  User, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  ExternalLink, 
  Filter, 
  History,
  Calendar,
  Layers,
  ArrowRight,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import * as XLSX from 'xlsx';

interface ActivityLogViewProps {
  records: RecordItem[];
  onSelectPreview?: (record: RecordItem) => void;
  onRefreshRecords?: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  records,
  onSelectPreview,
  onRefreshRecords,
}) => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedBidang, setSelectedBidang] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Load activity logs
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const uploads = logs.filter((l) => l.action === 'upload').length;
    const verified = logs.filter((l) => l.action === 'verify').length;
    const revisi = logs.filter((l) => l.action === 'revisi').length;
    const deleted = logs.filter((l) => l.action === 'delete').length;
    return { total, uploads, verified, revisi, deleted };
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          log.targetTitle.toLowerCase().includes(q) ||
          log.program.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          (log.fileName && log.fileName.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Filter Action
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false;
      }

      // Filter Bidang
      if (selectedBidang !== 'all' && log.bidang !== selectedBidang) {
        return false;
      }

      // Filter Time Range
      if (selectedTimeRange !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (selectedTimeRange === 'today') {
          const isToday = logDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (selectedTimeRange === 'week') {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (selectedTimeRange === 'month') {
          const isSameMonth = logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
          if (!isSameMonth) return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedAction, selectedBidang, selectedTimeRange]);

  // Format date helper
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const datePart = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timePart = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${datePart}, ${timePart} WITA`;
    } catch {
      return isoString;
    }
  };

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Baru saja';
      if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} hari lalu`;
      return `${Math.floor(diffDays / 30)} bln lalu`;
    } catch {
      return '';
    }
  };

  // Format file bytes helper
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Action badge & config helper
  const getActionConfig = (action: ActivityActionType) => {
    switch (action) {
      case 'upload':
        return {
          label: 'Unggah Dokumen',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <UploadCloud className="w-4 h-4 text-emerald-600" />,
          color: '#059669',
        };
      case 'verify':
        return {
          label: 'Verifikasi Disetujui',
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
          color: '#2563eb',
        };
      case 'revisi':
        return {
          label: 'Permintaan Revisi',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          color: '#d97706',
        };
      case 'delete':
        return {
          label: 'Hapus Dokumen',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: <Trash2 className="w-4 h-4 text-rose-600" />,
          color: '#e11d48',
        };
      default:
        return {
          label: 'Aktivitas',
          badgeClass: 'bg-slate-50 text-slate-800 border-slate-300',
          icon: <History className="w-4 h-4 text-slate-600" />,
          color: '#475569',
        };
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredLogs.map((item, index) => ({
      No: index + 1,
      'Waktu Log': formatTimestamp(item.timestamp),
      'Waktu Relatif': getRelativeTime(item.timestamp),
      'Aksi / User Action': item.actionLabel || item.action.toUpperCase(),
      'Pelaku (Actor)': item.actor,
      'Peran': item.actorRole === 'admin' ? 'Admin Puskesmas' : 'PJ Program',
      'Target Dokumen / Indikator': item.targetTitle,
      'Program': item.program,
      'Bidang': item.bidang,
      'Tipe': item.recordType === 'laporan' ? 'Laporan' : 'Capaian',
      'Nama Berkas': item.fileName || '-',
      'Ukuran Berkas': formatBytes(item.fileSize),
      'Status Sebelum': item.statusBefore || '-',
      'Status Sesudah': item.statusAfter || '-',
      'Catatan / Keterangan': item.details || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Log Aktivitas Dokumen');
    XLSX.writeFile(
      wb, 
      `Log_Aktivitas_SI_PERIANG_Puskesmas_Wairiang_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
            <History className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Log Aktivitas Dokumen (Audit Trail)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                Mode Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekam jejak otomatis pengunggahan, verifikasi, dan penghapusan berkas dokumen Puskesmas Wairiang
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-2 transition cursor-pointer"
            title="Ekspor Seluruh Log Aktivitas ke Excel"
          >
            <FileDown className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Log Excel</span>
          </button>

          <button
            onClick={() => {
              loadLogs();
              if (onRefreshRecords) onRefreshRecords();
            }}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs transition cursor-pointer"
            title="Segarkan Log Aktivitas"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-slate-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Log */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Aktivitas</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Uploads */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Dokumen Diunggah</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-700">{metrics.uploads}</span>
            <UploadCloud className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Diverifikasi</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-700">{metrics.verified}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Revisi */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Revisi</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-700">{metrics.revisi}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Deleted */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Dihapus</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-rose-700">{metrics.deleted}</span>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari indikator, program, nama PJ, berkas, atau admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            
            {/* Filter Aksi */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 shrink-0"
            >
              <option value="all">Semua Aksi</option>
              <option value="upload">Unggah Dokumen (Upload)</option>
              <option value="verify">Verifikasi Disetujui</option>
              <option value="revisi">Permintaan Revisi</option>
              <option value="delete">Hapus Dokumen</option>
            </select>

            {/* Filter Bidang */}
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 shrink-0"
            >
              <option value="all">Semua Bidang</option>
              {BIDANG_LIST.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {/* Filter Waktu */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 shrink-0"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
            </select>

            {/* Toggle View Mode */}
            <div className="border border-slate-200 rounded-xl p-0.5 flex items-center bg-slate-50 shrink-0">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tabel
              </button>
            </div>

          </div>

        </div>

        {/* Active Filter Indicators */}
        {(selectedAction !== 'all' || selectedBidang !== 'all' || selectedTimeRange !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">Filter Aktif:</span>
            {selectedAction !== 'all' && (
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                Aksi: {selectedAction}
              </span>
            )}
            {selectedBidang !== 'all' && (
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                Bidang: {selectedBidang}
              </span>
            )}
            {selectedTimeRange !== 'all' && (
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                Waktu: {selectedTimeRange}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedAction('all');
                setSelectedBidang('all');
                setSelectedTimeRange('all');
                setSearchQuery('');
              }}
              className="text-rose-600 hover:underline font-bold ml-auto"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Tidak ada catatan aktivitas yang cocok</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau bersihkan filter untuk melihat riwayat aktivitas lainnya.
          </p>
        </div>
      ) : viewMode === 'timeline' ? (
        
        /* Timeline View */
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const config = getActionConfig(log.action);
            const matchingRecord = records.find((r) => r.id === log.targetId);

            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  {/* Action Icon Bubble */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs mt-0.5"
                    style={{
                      backgroundColor: `${config.color}15`,
                      border: `1px solid ${config.color}30`,
                    }}
                  >
                    {config.icon}
                  </div>

                  {/* Log Details */}
                  <div className="space-y-1.5 min-w-0">
                    
                    {/* Action Header & Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${config.badgeClass}`}>
                        {config.label}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        Bidang {log.bidang}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {log.recordType}
                      </span>
                    </div>

                    {/* Document Title / Indikator */}
                    <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-slate-800 transition">
                      {log.targetTitle}
                    </h4>

                    {/* Program */}
                    <p className="text-xs text-slate-600 font-medium">
                      {log.program}
                    </p>

                    {/* Actor Information */}
                    <div className="flex items-center gap-2 text-xs text-slate-700 pt-0.5">
                      <span className="flex items-center gap-1 font-semibold">
                        {log.actorRole === 'admin' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="text-slate-900 font-bold">{log.actor}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        {log.actorRole === 'admin' ? 'Pengelola / Admin' : 'Penanggung Jawab (PJ)'}
                      </span>
                    </div>

                    {/* Additional Notes or Details */}
                    {log.details && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 mt-2">
                        <span className="font-semibold text-slate-700">Keterangan:</span> {log.details}
                      </div>
                    )}

                    {/* File Attachment Pill */}
                    {log.fileName && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-700 truncate max-w-xs">{log.fileName}</span>
                        {log.fileSize ? <span>({formatBytes(log.fileSize)})</span> : null}
                      </div>
                    )}

                  </div>
                </div>

                {/* Right: Timestamp & Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1 sm:justify-end text-xs font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>

                  {/* If document still exists in active records, give quick preview button */}
                  {matchingRecord && onSelectPreview && (
                    <button
                      onClick={() => onSelectPreview(matchingRecord)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Buka Pratinjau Dokumen"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Lihat Dokumen</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">Waktu (Timestamp)</th>
                  <th className="py-3.5 px-4">Aksi</th>
                  <th className="py-3.5 px-4">Pelaku / User</th>
                  <th className="py-3.5 px-4">Indikator & Program</th>
                  <th className="py-3.5 px-4">Bidang</th>
                  <th className="py-3.5 px-4">Berkas</th>
                  <th className="py-3.5 px-4">Catatan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const config = getActionConfig(log.action);
                  const matchingRecord = records.find((r) => r.id === log.targetId);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatTimestamp(log.timestamp)}</div>
                        <div className="text-[10px] text-slate-500">{getRelativeTime(log.timestamp)}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeClass}`}>
                          {config.icon}
                          <span>{config.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.actor}</div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          {log.actorRole === 'admin' ? 'Admin' : 'PJ Program'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 max-w-xs truncate">{log.targetTitle}</div>
                        <div className="text-[11px] text-slate-500 max-w-xs truncate">{log.program}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{log.bidang}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-600 truncate max-w-xs block">
                          {log.fileName || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-slate-600 line-clamp-2">
                          {log.details || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {matchingRecord && onSelectPreview ? (
                          <button
                            onClick={() => onSelectPreview(matchingRecord)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition"
                            title="Buka Berkas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </div>
  );
};
