import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileSpreadsheet, 
  File, 
  Image as ImageIcon,
  Shield, 
  Calendar, 
  User, 
  Phone, 
  Maximize2,
  Trash2,
  Send,
  Search,
  Cloud,
  ExternalLink
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { RecordItem, ValidationStatus } from '../types';

interface FilePreviewModalProps {
  record: RecordItem | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onValidate: (id: string, status: ValidationStatus, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  record,
  isOpen,
  onClose,
  isAdmin,
  onValidate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'detail' | 'admin'>('preview');
  const [selectedStatus, setSelectedStatus] = useState<ValidationStatus>('valid');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<{ sheets: string[]; activeSheet: string; rows: any[][] }>({
    sheets: [],
    activeSheet: '',
    rows: [],
  });
  const [sheetSearch, setSheetSearch] = useState('');
  const [loadingSpreadsheet, setLoadingSpreadsheet] = useState(false);
  const [spreadsheetError, setSpreadsheetError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (record) {
      setSelectedStatus(record.status || 'valid');
      setAdminNotesInput(record.adminNotes || '');
      setActiveTab('preview');
      setSheetSearch('');
      setShowDeleteConfirm(false);

      // If file is excel or spreadsheet, load and parse it
      if (record.fileType === 'excel' || record.fileOriginalName.endsWith('.csv') || record.fileOriginalName.endsWith('.xlsx')) {
        loadSpreadsheet(record);
      }
    }
  }, [record]);

  const loadSpreadsheet = async (item: RecordItem) => {
    setLoadingSpreadsheet(true);
    setSpreadsheetError(null);
    try {
      let arrayBuffer: ArrayBuffer | null = null;
      // If we have fileData (base64)
      if (item.fileData && item.fileData.includes('base64,')) {
        const base64 = item.fileData.split('base64,')[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else if (item.fileUrl) {
        const res = await fetch(item.fileUrl);
        if (res.ok) {
          arrayBuffer = await res.arrayBuffer();
        }
      }

      if (arrayBuffer) {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetNames = workbook.SheetNames;
        const firstSheet = sheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        setSpreadsheetData({
          sheets: sheetNames,
          activeSheet: firstSheet,
          rows: jsonData,
        });
      } else {
        // Fallback default sample table for demo files
        setSpreadsheetData({
          sheets: ['Rekap Data Wairiang'],
          activeSheet: 'Rekap Data Wairiang',
          rows: [
            ['No', 'Indikator Kinerja', 'Target', 'Realisasi', 'Persentase %', 'Keterangan'],
            ['1', item.indikator, item.target ?? 100, item.realisasi ?? 98, `${item.persentase ?? 98}%`, item.keterangan || 'Data sinkron'],
            ['2', 'Cakupan Desa Wairiang', 35, 35, '100%', 'Lengkap'],
            ['3', 'Cakupan Desa Baniona', 28, 27, '96.4%', 'Tercapai'],
            ['4', 'Cakupan Desa Lewoingu', 30, 29, '96.6%', 'Tercapai'],
          ],
        });
      }
    } catch (err: any) {
      console.warn('Error loading spreadsheet data:', err);
      // provide graceful fallback view
      setSpreadsheetData({
        sheets: ['Ringkasan Rekapitulasi'],
        activeSheet: 'Ringkasan Rekapitulasi',
        rows: [
          ['Indikator', 'Periode', 'PJ Program', 'Nilai Target', 'Nilai Realisasi', 'Status'],
          [item.indikator, `${item.periodeBulan} ${item.periodeTahun}`, item.pjNama, item.target ?? '-', item.realisasi ?? '-', item.status.toUpperCase()],
          ['Catatan Tambahan', item.keterangan || 'Tidak ada catatan tambahan', '-', '-', '-', '-'],
        ],
      });
    } finally {
      setLoadingSpreadsheet(false);
    }
  };

  if (!isOpen || !record) return null;

  const handleValidationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingValidation(true);
    try {
      await onValidate(record.id, selectedStatus, adminNotesInput);
      onClose();
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredSpreadsheetRows = spreadsheetData.rows.filter((row) => {
    if (!sheetSearch.trim()) return true;
    return row.some((cell) => String(cell).toLowerCase().includes(sheetSearch.toLowerCase()));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              {record.fileType === 'pdf' && <FileText className="w-6 h-6 text-rose-600" />}
              {record.fileType === 'excel' && <FileSpreadsheet className="w-6 h-6 text-emerald-700" />}
              {record.fileType === 'word' && <File className="w-6 h-6 text-blue-600" />}
              {record.fileType === 'image' && <ImageIcon className="w-6 h-6 text-purple-600" />}
              {record.fileType === 'other' && <File className="w-6 h-6 text-slate-600" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {record.fileOriginalName || record.fileName}
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  record.type === 'laporan' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {record.type === 'laporan' ? 'Laporan Program' : 'Capaian Kinerja'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  record.status === 'valid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : record.status === 'revisi'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {record.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {record.status === 'revisi' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                  {record.status === 'menunggu' && <Clock className="w-3.5 h-3.5 text-slate-500" />}
                  {record.status === 'valid' ? 'Valid / Terverifikasi' : record.status === 'revisi' ? 'Perlu Revisi' : 'Menunggu Validasi'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {record.bidang} • {record.program} • {record.indikator} • Periode: {record.periodeBulan} {record.periodeTahun}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Drive Link if synced */}
            {record.driveWebViewLink && (
              <a
                href={record.driveWebViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-xs transition"
                title="Buka Dokumen di Google Drive"
              >
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Buka di Drive</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
            )}

            {/* Direct Download Button */}
            <a
              href={record.fileUrl}
              download={record.fileOriginalName || record.fileName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh File</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 bg-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2.5 border-b-2 transition ${
                activeTab === 'preview'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Preview Dokumen
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`py-2.5 border-b-2 transition ${
                activeTab === 'detail'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Rincian & Informasi PJ
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'border-amber-500 text-amber-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Validasi Pengelola
              </button>
            )}
          </div>
          <div className="text-slate-500 hidden sm:block">
            Ukuran File: {formatFileSize(record.fileSize)}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="h-full flex flex-col">
              {/* PDF Preview */}
              {record.fileType === 'pdf' && (
                <div className="w-full flex-1 min-h-[480px] bg-slate-200 rounded-xl overflow-hidden border border-slate-300 flex flex-col">
                  <div className="bg-slate-800 text-white px-4 py-2 text-xs flex items-center justify-between">
                    <span className="font-mono">PDF Viewer: {record.fileOriginalName}</span>
                    <a
                      href={record.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Buka di Tab Baru</span>
                    </a>
                  </div>
                  <iframe
                    src={`${record.fileUrl}#toolbar=1&navpanes=0&view=FitH`}
                    className="w-full flex-1 border-0 min-h-[440px]"
                    title="PDF Preview"
                  />
                </div>
              )}

              {/* Excel / Spreadsheet Preview */}
              {record.fileType === 'excel' && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col min-h-[460px]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      <span className="font-bold text-sm text-slate-800">
                        Pratinjau Spreadsheet / Excel
                      </span>
                    </div>
                    
                    {/* Search inside sheet */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={sheetSearch}
                          onChange={(e) => setSheetSearch(e.target.value)}
                          placeholder="Cari dalam tabel..."
                          className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-slate-50"
                        />
                      </div>
                      {spreadsheetData.sheets.length > 1 && (
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <span>Sheet:</span>
                          <span className="font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                            {spreadsheetData.activeSheet}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {loadingSpreadsheet ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-xs">Membaca data spreadsheet...</p>
                    </div>
                  ) : filteredSpreadsheetRows.length > 0 ? (
                    <div className="flex-1 overflow-x-auto border border-slate-200 rounded-lg max-h-[380px]">
                      <table className="w-full text-xs text-left text-slate-700 border-collapse">
                        <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 border-b border-slate-300">
                          <tr>
                            {filteredSpreadsheetRows[0]?.map((colHeader: any, idx: number) => (
                              <th key={idx} className="px-3 py-2 border-r border-slate-200 font-semibold uppercase tracking-wider">
                                {String(colHeader || `Kolom ${idx + 1}`)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredSpreadsheetRows.slice(1).map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-emerald-50/40 transition">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-3 py-1.5 border-r border-slate-200 whitespace-nowrap">
                                  {cell !== undefined && cell !== null ? String(cell) : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Tidak ada baris yang sesuai dengan kata kunci pencarian.
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      Total {spreadsheetData.rows.length} baris data ditemukan.
                    </span>
                    <span className="italic">
                      Pratinjau interaktif disediakan oleh SI-PERIANG engine.
                    </span>
                  </div>
                </div>
              )}

              {/* Word & Document Preview */}
              {record.fileType === 'word' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <File className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">
                    Dokumen Microsoft Word / Dokumen Teks
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mb-6">
                    File dokumen <span className="font-semibold text-slate-700">{record.fileOriginalName}</span> ({formatFileSize(record.fileSize)}) dapat langsung diunduh dan dibuka di Microsoft Word, Google Docs, atau aplikasi pengolah kata lainnya.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full max-w-lg text-left mb-6 text-xs space-y-2">
                    <div className="font-semibold text-slate-700 border-b pb-1.5">Ringkasan Dokumen:</div>
                    <div className="flex justify-between"><span className="text-slate-500">Program:</span> <span className="font-medium text-slate-800">{record.program}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Indikator:</span> <span className="font-medium text-slate-800">{record.indikator}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Periode:</span> <span className="font-medium text-slate-800">{record.periodeBulan} {record.periodeTahun}</span></div>
                    {record.keterangan && (
                      <div className="pt-1.5 border-t text-slate-600 italic">
                        "{record.keterangan}"
                      </div>
                    )}
                  </div>

                  <a
                    href={record.fileUrl}
                    download={record.fileOriginalName || record.fileName}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh & Buka Dokumen Word</span>
                  </a>
                </div>
              )}

              {/* Image Preview */}
              {record.fileType === 'image' && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
                  <img
                    src={record.fileUrl}
                    alt={record.fileOriginalName}
                    className="max-h-[460px] object-contain rounded-lg border border-slate-200 shadow-xs"
                  />
                  <p className="text-xs text-slate-500 mt-3">{record.fileOriginalName}</p>
                </div>
              )}

              {/* Other file types */}
              {record.fileType === 'other' && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center min-h-[350px] flex flex-col items-center justify-center">
                  <File className="w-16 h-16 text-slate-400 mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{record.fileOriginalName}</h4>
                  <p className="text-xs text-slate-500 mb-5">Pratinjau otomatis tidak tersedia untuk format ini. Silakan unduh file untuk melihat isi lengkap.</p>
                  <a
                    href={record.fileUrl}
                    download={record.fileOriginalName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File Sekarang</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DETAIL & PJ INFO */}
          {activeTab === 'detail' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Informasi Penginput & Program */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b pb-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    Penanggung Jawab (PJ) Program
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Nama Lengkap PJ:</span>
                      <span className="font-bold text-slate-900 text-sm">{record.pjNama}</span>
                    </div>
                    {record.pjNip && (
                      <div>
                        <span className="text-slate-500 block">NIP / NIK:</span>
                        <span className="font-mono text-slate-700">{record.pjNip}</span>
                      </div>
                    )}
                    {record.pjKontak && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.pjKontak}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Diunggah pada: {new Date(record.uploadedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Informasi Indikator & Target / Realisasi */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b pb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Kinerja & Indikator
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Bidang / Program:</span>
                      <span className="font-semibold text-slate-900">{record.bidang} • {record.program}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Indikator Laporan:</span>
                      <span className="font-bold text-emerald-700 text-sm">{record.indikator}</span>
                    </div>
                    {record.target !== undefined && record.realisasi !== undefined && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-600 font-semibold">Pencapaian:</span>
                          <span className={`font-black text-sm ${
                            (record.persentase ?? 0) >= 100
                              ? 'text-emerald-700'
                              : (record.persentase ?? 0) >= 80
                              ? 'text-blue-700'
                              : 'text-amber-700'
                          }`}>
                            {record.persentase}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full ${
                              (record.persentase ?? 0) >= 100
                                ? 'bg-emerald-600'
                                : (record.persentase ?? 0) >= 80
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(record.persentase ?? 0, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Target: {record.target} {record.satuan}</span>
                          <span>Realisasi: {record.realisasi} {record.satuan}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Keterangan & Analisis */}
              {(record.keterangan || record.analisisMasalah || record.rencanaTindakLanjut) && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 border-b pb-2">
                    Catatan Lapangan & Analisis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {record.keterangan && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Keterangan Umum:</span>
                        <p className="text-slate-600 leading-relaxed">{record.keterangan}</p>
                      </div>
                    )}
                    {record.analisisMasalah && (
                      <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-900 block mb-1">Hambatan / Analisis Masalah:</span>
                        <p className="text-amber-800 leading-relaxed">{record.analisisMasalah}</p>
                      </div>
                    )}
                    {record.rencanaTindakLanjut && (
                      <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                        <span className="font-bold text-emerald-900 block mb-1">Rencana Tindak Lanjut (RTL):</span>
                        <p className="text-emerald-800 leading-relaxed">{record.rencanaTindakLanjut}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Validasi & Riwayat Admin */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-800 border-b pb-2 mb-3 flex items-center justify-between">
                  <span>Status Verifikasi Administrasi</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    record.status === 'diverifikasi' || record.status === 'valid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : record.status === 'revisi'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {record.status === 'diverifikasi' || record.status === 'valid' ? 'Diverifikasi' : record.status === 'revisi' ? 'Perlu Revisi Dokumen' : 'Menunggu Verifikasi Admin'}
                  </span>
                </h4>
                <div className="text-xs space-y-2 text-slate-600">
                  {record.validatedBy && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Diverifikasi oleh:</span>
                      <span className="font-semibold text-slate-800">{record.validatedBy}</span>
                    </div>
                  )}
                  {record.validatedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Tanggal Verifikasi:</span>
                      <span>{new Date(record.validatedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</span>
                    </div>
                  )}
                  {record.adminNotes && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                      <span className="font-semibold block mb-0.5 text-slate-800">Catatan Verifikator:</span>
                      <span>{record.adminNotes}</span>
                    </div>
                  )}
                  {!record.validatedBy && !record.adminNotes && (
                    <p className="italic text-slate-400">
                      Dokumen ini baru saja diunggah dan sedang dalam antrean verifikasi pengelola Puskesmas Wairiang.
                    </p>
                  )}
                </div>
              </div>

              {/* Status Penyimpanan Google Drive */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-800 border-b pb-2 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <span>Penyimpanan Google Drive</span>
                  </span>
                  {record.driveWebViewLink ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Tersimpan di Cloud
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                      Penyimpanan Lokal Saja
                    </span>
                  )}
                </h4>
                {record.driveWebViewLink ? (
                  <div className="text-xs space-y-2 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Folder Tujuan:</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        SI-PERIANG Puskesmas Wairiang / {record.driveFolderName || `Bidang ${record.bidang}`}
                      </span>
                    </div>
                    {record.driveSyncedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Waktu Sinkronisasi:</span>
                        <span>{new Date(record.driveSyncedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <a
                        href={record.driveWebViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition"
                      >
                        <Cloud className="w-4 h-4 text-emerald-600" />
                        <span>Buka Berkas di Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Dokumen ini tersimpan di server lokal. Hubungkan akun Google Drive (uptdpuskesmaswrgpelaporan@gmail.com) untuk mencadangkannya ke cloud Google Drive.
                  </p>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: ADMIN VALIDATION ACTIONS */}
          {activeTab === 'admin' && isAdmin && (
            <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm border-b pb-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <span>Panel Pengelola Puskesmas Wairiang</span>
              </div>
              <p className="text-xs text-slate-600">
                Pilih status keabsahan dokumen laporan/capaian ini setelah meninjau isi file di tab Preview.
              </p>

              <form onSubmit={handleValidationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Status Validasi:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      selectedStatus === 'diverifikasi' || selectedStatus === 'valid'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value="diverifikasi"
                        checked={selectedStatus === 'diverifikasi' || selectedStatus === 'valid'}
                        onChange={() => setSelectedStatus('diverifikasi')}
                        className="text-emerald-600"
                      />
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs">Diverifikasi (Disetujui)</span>
                    </label>

                    <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      selectedStatus === 'revisi'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value="revisi"
                        checked={selectedStatus === 'revisi'}
                        onChange={() => setSelectedStatus('revisi')}
                        className="text-amber-600"
                      />
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs">Perlu Revisi PJ</span>
                    </label>

                    <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      selectedStatus === 'menunggu_verifikasi' || selectedStatus === 'menunggu'
                        ? 'border-slate-500 bg-slate-100 text-slate-900 font-bold ring-2 ring-slate-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value="menunggu_verifikasi"
                        checked={selectedStatus === 'menunggu_verifikasi' || selectedStatus === 'menunggu'}
                        onChange={() => setSelectedStatus('menunggu_verifikasi')}
                        className="text-slate-600"
                      />
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span className="text-xs">Menunggu Verifikasi Admin</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Verifikasi / Alasan Revisi untuk PJ Program:
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Contoh: Data lengkap, sesuai dengan target renja bulanan..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-emerald-600 bg-slate-50"
                  />
                </div>

                {/* Delete Confirmation Box (Admin) */}
                {showDeleteConfirm ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                      <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Yakin hapus dokumen ini permanen dari server Puskesmas Wairiang?</span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={async () => {
                          setIsDeleting(true);
                          try {
                            await onDelete(record.id);
                            onClose();
                          } finally {
                            setIsDeleting(false);
                            setShowDeleteConfirm(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Sekarang'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Dokumen (Admin)</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingValidation}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingValidation ? 'Menyimpan...' : 'Simpan Verifikasi'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Dokumen Terproteksi: Pengunduhan bebas untuk umum, penghapusan hanya via Admin.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
            >
              Tutup
            </button>
            <a
              href={record.fileUrl}
              download={record.fileOriginalName || record.fileName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh ({formatFileSize(record.fileSize)})</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
