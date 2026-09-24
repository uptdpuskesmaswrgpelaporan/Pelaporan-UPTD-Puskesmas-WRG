import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  FolderDown, 
  Search,
  Eye,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { RecordItem, BidangType, getStatusLabel } from '../types';
import { BIDANG_LIST } from '../data/programs';
import { PuskesmasLogo } from './PuskesmasLogo';
import { useTheme } from '../context/ThemeContext';

interface BerandaProps {
  records: RecordItem[];
  onNavigateToTab: (tab: 'beranda' | 'capaian' | 'laporan' | 'dashboard') => void;
  onSelectPreview: (record: RecordItem) => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
}

export const Beranda: React.FC<BerandaProps> = ({
  records,
  onNavigateToTab,
  onSelectPreview,
  isAdmin,
  onOpenAdminModal,
}) => {
  const { theme } = useTheme();
  const [selectedBidangFilter, setSelectedBidangFilter] = useState<string>('all');
  const [searchPj, setSearchPj] = useState<string>('');

  // Statistics & Metrics
  const stats = useMemo(() => {
    // Unique PJ names who have uploaded
    const allPjNames = new Set(records.map((r) => r.pjNama.trim()).filter(Boolean));
    const totalPj = allPjNames.size;

    const laporanCount = records.filter((r) => r.type === 'laporan').length;
    const capaianCount = records.filter((r) => r.type === 'capaian').length;
    const verifiedCount = records.filter((r) => r.status === 'diverifikasi' || r.status === 'valid').length;
    const pendingCount = records.filter((r) => r.status === 'menunggu_verifikasi' || r.status === 'menunggu').length;

    // Per Bidang breakdown
    const bidangStats = BIDANG_LIST.map((b) => {
      const bidangRecords = records.filter((r) => r.bidang === b.id);
      const pjInBidang = new Set(bidangRecords.map((r) => r.pjNama.trim()).filter(Boolean)).size;
      const laporanInBidang = bidangRecords.filter((r) => r.type === 'laporan').length;
      const capaianInBidang = bidangRecords.filter((r) => r.type === 'capaian').length;
      const totalDocs = bidangRecords.length;

      return {
        id: b.id,
        name: b.name,
        fullName: b.fullName,
        pjCount: pjInBidang,
        laporanCount: laporanInBidang,
        capaianCount: capaianInBidang,
        totalDocs,
      };
    });

    // Per PJ Detail summary
    const pjMap: { [name: string]: { 
      name: string; 
      bidang: BidangType; 
      laporanCount: number; 
      capaianCount: number; 
      programs: Set<string>; 
      lastUploaded: string;
      latestRecord: RecordItem;
    } } = {};

    records.forEach((r) => {
      const name = r.pjNama.trim();
      if (!name) return;
      if (!pjMap[name]) {
        pjMap[name] = {
          name,
          bidang: r.bidang,
          laporanCount: 0,
          capaianCount: 0,
          programs: new Set(),
          lastUploaded: r.uploadedAt,
          latestRecord: r,
        };
      }
      if (r.type === 'laporan') pjMap[name].laporanCount += 1;
      if (r.type === 'capaian') pjMap[name].capaianCount += 1;
      pjMap[name].programs.add(r.indikator);
      if (new Date(r.uploadedAt) > new Date(pjMap[name].lastUploaded)) {
        pjMap[name].lastUploaded = r.uploadedAt;
        pjMap[name].latestRecord = r;
      }
    });

    const pjList = Object.values(pjMap).sort((a, b) => (b.laporanCount + b.capaianCount) - (a.laporanCount + a.capaianCount));

    // Calculate max value for chart scaling
    const maxBarValue = Math.max(...bidangStats.map((b) => Math.max(b.laporanCount, b.capaianCount, 1)));

    return {
      totalPj,
      laporanCount,
      capaianCount,
      verifiedCount,
      pendingCount,
      bidangStats,
      pjList,
      maxBarValue,
    };
  }, [records]);

  // Filtered PJ List
  const filteredPjList = useMemo(() => {
    return stats.pjList.filter((pj) => {
      if (selectedBidangFilter !== 'all' && pj.bidang !== selectedBidangFilter) return false;
      if (searchPj.trim()) {
        const q = searchPj.toLowerCase();
        const matchesName = pj.name.toLowerCase().includes(q);
        const matchesProgram = Array.from(pj.programs).some((p) => p.toLowerCase().includes(q));
        if (!matchesName && !matchesProgram) return false;
      }
      return true;
    });
  }, [stats.pjList, selectedBidangFilter, searchPj]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Welcome Banner */}
      <div 
        className="text-white rounded-3xl p-6 sm:p-10 shadow-xl border relative overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${theme.secondaryColor}ee, ${theme.primaryColor}dd, #0f172a)`,
          borderColor: `${theme.accentColor}35`,
        }}
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div 
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-xs"
            style={{
              backgroundColor: `${theme.accentColor}25`,
              borderColor: `${theme.accentColor}50`,
              color: '#ffffff',
            }}
          >
            <PuskesmasLogo size="sm" className="w-5 h-5" />
            <span>SISTEM INTEGRASI PELAPORAN PUSKESMAS WAIRIANG (SI-PERIANG)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
            Monitoring Pengunggahan Laporan & Capaian Kinerja PJ Program
          </h1>

          <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Selamat datang di portal terpadu UPTD Puskesmas Wairiang - Dinas Kesehatan Kabupaten Lembata. Pantau transparansi progres pengunggahan dokumen laporan dan bukti capaian dari seluruh Penanggung Jawab Program (Kesmas, SDK, Yankes, P2P, dan UP).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToTab('laporan')}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs sm:text-sm font-black shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Input Laporan Program</span>
            </button>
            <button
              onClick={() => onNavigateToTab('capaian')}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Input Capaian Kinerja</span>
            </button>
            <button
              onClick={() => onNavigateToTab('dashboard')}
              className="px-5 py-2.5 bg-black/20 hover:bg-black/35 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer border border-white/15"
            >
              <span>Lihat Semua Berkas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div 
          className="absolute right-0 bottom-0 top-0 w-96 opacity-25 pointer-events-none rounded-full blur-3xl" 
          style={{ backgroundColor: theme.accentColor }}
        />
      </div>

      {/* Top 5 Key Statistics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total PJ Program Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">PJ Program Aktif</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalPj}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Penanggung Jawab upload</p>
          </div>
        </div>

        {/* Total Laporan Terunggah */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Laporan Masuk</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-blue-700">{stats.laporanCount}</span>
            <p className="text-[11px] text-blue-600/80 mt-0.5">Berkas laporan rutin</p>
          </div>
        </div>

        {/* Total Capaian Terunggah */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Capaian Masuk</span>
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-teal-700">{stats.capaianCount}</span>
            <p className="text-[11px] text-teal-600/80 mt-0.5">Berkas bukti capaian</p>
          </div>
        </div>

        {/* Dokumen Diverifikasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Diverifikasi</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.verifiedCount}</span>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">Telah disetujui</p>
          </div>
        </div>

        {/* Menunggu Verifikasi Admin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1 hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Menunggu Verifikasi</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pendingCount}</span>
            <p className="text-[11px] text-amber-700 mt-0.5">Perlu konfirmasi admin</p>
          </div>
        </div>

      </div>

      {/* GRAFIK UTAMA: Progres Pengunggahan Laporan & Capaian per Bidang */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Grafik Kinerja Unggah Dokumen</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Grafik Jumlah Laporan & Capaian yang Diunggah per Bidang
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi komparasi berkas Laporan (Biru) vs Capaian (Teal) yang telah dikirim oleh Penanggung Jawab di masing-masing bidang.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-bold shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-600 inline-block" />
              <span className="text-slate-700">Laporan ({stats.laporanCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-teal-600 inline-block" />
              <span className="text-slate-700">Capaian ({stats.capaianCount})</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart per Bidang */}
        <div className="space-y-6 pt-2">
          {stats.bidangStats.map((b) => {
            const lapPerc = Math.max(12, Math.round((b.laporanCount / (stats.maxBarValue || 1)) * 100));
            const capPerc = Math.max(12, Math.round((b.capaianCount / (stats.maxBarValue || 1)) * 100));

            return (
              <div key={b.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-800 text-white text-xs font-black rounded-lg">
                      {b.name}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {b.fullName}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    {b.pjCount} PJ Program Aktif • Total {b.totalDocs} Berkas
                  </div>
                </div>

                {/* Bars */}
                <div className="space-y-2">
                  {/* Laporan Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-blue-700 w-20 shrink-0">
                      Laporan ({b.laporanCount})
                    </span>
                    <div className="flex-1 bg-slate-200/80 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                        style={{ width: `${b.laporanCount > 0 ? lapPerc : 0}%` }}
                      >
                        {b.laporanCount > 0 ? b.laporanCount : ''}
                      </div>
                    </div>
                  </div>

                  {/* Capaian Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-teal-700 w-20 shrink-0">
                      Capaian ({b.capaianCount})
                    </span>
                    <div className="flex-1 bg-slate-200/80 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                        style={{ width: `${b.capaianCount > 0 ? capPerc : 0}%` }}
                      >
                        {b.capaianCount > 0 ? b.capaianCount : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REKAPITULASI PENANGGUNG JAWAB (PJ) PROGRAM YANG TELAH MENGUNGGAH */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Daftar Partisipasi Pengunggahan</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Daftar Penanggung Jawab (PJ) yang Telah Mengupload di Website
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian berkas yang telah dikirim oleh masing-masing Penanggung Jawab Program di Puskesmas Wairiang.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPj}
                onChange={(e) => setSearchPj(e.target.value)}
                placeholder="Cari nama PJ Program..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:outline-emerald-600 w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedBidangFilter}
              onChange={(e) => setSelectedBidangFilter(e.target.value)}
              className="py-1.5 px-3 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:outline-emerald-600"
            >
              <option value="all">Semua Bidang</option>
              {BIDANG_LIST.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table of PJ Contributors */}
        {filteredPjList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            Tidak ditemukan Penanggung Jawab yang sesuai dengan pencarian atau filter bidang.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Penanggung Jawab (PJ)</th>
                  <th className="py-3 px-4">Bidang</th>
                  <th className="py-3 px-4">Program / Indikator yang Diampu</th>
                  <th className="py-3 px-4 text-center">Laporan</th>
                  <th className="py-3 px-4 text-center">Capaian</th>
                  <th className="py-3 px-4 text-center">Total Berkas</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPjList.map((pj, idx) => (
                  <tr key={pj.name} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <span>{pj.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Upload terakhir: {new Date(pj.lastUploaded).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {pj.bidang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {Array.from(pj.programs).map((prog) => (
                          <span key={prog} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {prog}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        {pj.laporanCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
                        {pj.capaianCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-900">
                      {pj.laporanCount + pj.capaianCount} Berkas
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectPreview(pj.latestRecord)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Pratinjau Berkas</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Petunjuk Pintar & Akses Dokumen Terbuka */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Panduan Input Laporan */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Format Periode Laporan Lengkap</span>
          </div>
          <p className="text-xs text-blue-950/80 leading-relaxed">
            Formulir laporan SI-PERIANG kini mendukung klasifikasi periode resmi: <strong>Bulanan</strong>, <strong>Tribulanan (Triwulan I - IV)</strong>, <strong>Semester (Semester I - II)</strong>, dan <strong>Tahunan</strong> untuk seluruh program.
          </p>
          <button
            onClick={() => onNavigateToTab('laporan')}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline pt-1"
          >
            <span>Buka Formulir Laporan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Akses Admin & Verifikasi */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Alur Verifikasi Dokumen Instansi</span>
          </div>
          <p className="text-xs text-emerald-950/80 leading-relaxed">
            Setiap dokumen yang baru diunggah akan otomatis berstatus <strong>Menunggu Verifikasi Admin</strong>. Admin atau Kepala Puskesmas dapat memverifikasi berkas langsung dengan satu klik menjadi <strong>Diverifikasi</strong>.
          </p>
          {!isAdmin && (
            <button
              onClick={onOpenAdminModal}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline pt-1"
            >
              <span>Masuk Mode Admin untuk Verifikasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
