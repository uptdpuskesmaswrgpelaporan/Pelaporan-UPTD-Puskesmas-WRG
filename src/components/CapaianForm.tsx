import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  File, 
  Layers, 
  Calendar, 
  User, 
  Phone, 
  ArrowRight,
  Clock,
  HelpCircle,
  FileCheck2,
  Cloud,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { BIDANG_LIST, BULAN_LIST, TAHUN_LIST, getProgramsByBidang, getIndikatorsByProgram } from '../data/programs';
import { BidangType, PeriodeTipe, RecordItem } from '../types';
import { api } from '../services/api';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { uploadFileToGoogleDrive } from '../services/googleDrive';

interface CapaianFormProps {
  onSuccess: (newRecord: RecordItem) => void;
  onNavigateToDashboard: () => void;
}

export const CapaianForm: React.FC<CapaianFormProps> = ({ onSuccess, onNavigateToDashboard }) => {
  const [bidang, setBidang] = useState<BidangType>('Kesmas');
  const [program, setProgram] = useState('');
  const [indikator, setIndikator] = useState('');
  
  // Periode Type
  const [periodeTipe, setPeriodeTipe] = useState<PeriodeTipe>('bulanan');
  const [periodeBulan, setPeriodeBulan] = useState('September');
  const [triwulan, setTriwulan] = useState('Triwulan III (Juli - September)');
  const [semester, setSemester] = useState('Semester II (Juli - Desember)');
  const [periodeTahun, setPeriodeTahun] = useState(2026);

  const [pjNama, setPjNama] = useState('');
  const [pjNip, setPjNip] = useState('');
  const [pjKontak, setPjKontak] = useState('');
  
  const [keterangan, setKeterangan] = useState('');
  const [analisisMasalah, setAnalisisMasalah] = useState('');
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRecord, setCreatedRecord] = useState<RecordItem | null>(null);

  // Google Drive integration
  const { user, isConnected, isConnecting, loginGoogle } = useGoogleDrive();

  // Sync programs when bidang changes
  useEffect(() => {
    const availablePrograms = getProgramsByBidang(bidang);
    if (availablePrograms.length > 0) {
      setProgram(availablePrograms[0].name);
      const firstIndikators = availablePrograms[0].indikatorList;
      if (firstIndikators.length > 0) {
        setIndikator(firstIndikators[0].name);
      }
    }
  }, [bidang]);

  const handleProgramChange = (progName: string) => {
    setProgram(progName);
    const availableIndikators = getIndikatorsByProgram(bidang, progName);
    if (availableIndikators.length > 0) {
      setIndikator(availableIndikators[0].name);
    }
  };

  const handleIndikatorChange = (indName: string) => {
    setIndikator(indName);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const name = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => name.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Format file tidak didukung. Harap gunakan PDF, Excel, Word, atau Gambar.');
      return;
    }

    // Limit 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 5 MB. Harap perkecil berkas Anda.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
  };

  // Compute display name of period
  const getComputedPeriodeNama = () => {
    if (periodeTipe === 'bulanan') return `${periodeBulan} ${periodeTahun}`;
    if (periodeTipe === 'tribulanan') return `${triwulan} ${periodeTahun}`;
    if (periodeTipe === 'semester') return `${semester} ${periodeTahun}`;
    return `Tahun ${periodeTahun}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!program || !indikator) {
      setErrorMessage('Harap pilih Bidang, Program, dan Indikator capaian.');
      return;
    }

    if (!pjNama.trim()) {
      setErrorMessage('Nama Penanggung Jawab (PJ) Program wajib diisi.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('File bukti dokumen capaian (PDF, Excel, Word, atau Gambar) wajib diunggah.');
      return;
    }

    setIsSubmitting(true);

    try {
      const computedPeriodeNama = getComputedPeriodeNama();

      const formData = new FormData();
      formData.append('type', 'capaian');
      formData.append('bidang', bidang);
      formData.append('program', program);
      formData.append('indikator', indikator);
      formData.append('periodeTipe', periodeTipe);
      formData.append('periodeBulan', periodeTipe === 'bulanan' ? periodeBulan : computedPeriodeNama);
      formData.append('periodeTahun', String(periodeTahun));
      formData.append('periodeNama', computedPeriodeNama);
      formData.append('pjNama', pjNama);
      formData.append('pjNip', pjNip);
      formData.append('pjKontak', pjKontak);
      formData.append('keterangan', keterangan);
      formData.append('analisisMasalah', analisisMasalah);
      formData.append('rencanaTindakLanjut', rencanaTindakLanjut);
      formData.append('file', selectedFile);

      // Simultaneous upload/backup to Google Drive if connected
      if (isConnected) {
        try {
          const driveRes = await uploadFileToGoogleDrive(selectedFile, selectedFile.name, {
            bidang,
            program,
            pjNama,
            indikator,
            periode: computedPeriodeNama,
          });
          formData.append('driveFileId', driveRes.fileId);
          formData.append('driveWebViewLink', driveRes.webViewLink);
          if (driveRes.webContentLink) formData.append('driveWebContentLink', driveRes.webContentLink);
          formData.append('driveFolderId', driveRes.folderId);
          formData.append('driveFolderName', driveRes.folderName);
        } catch (dErr: any) {
          console.warn('Google Drive backup notice during capaian upload:', dErr);
        }
      }

      const record = await api.uploadRecord(formData);
      setCreatedRecord(record);
      setSuccessMessage(
        record.driveWebViewLink
          ? `Dokumen Capaian ${indikator} (${computedPeriodeNama}) berhasil diunggah dan disimpan ke Google Drive! Status: Menunggu Verifikasi Admin.`
          : `Dokumen Capaian ${indikator} (${computedPeriodeNama}) berhasil diunggah! Status: Menunggu Verifikasi Admin.`
      );
      onSuccess(record);

      // Reset file and notes
      setSelectedFile(null);
      setKeterangan('');
      setAnalisisMasalah('');
      setRencanaTindakLanjut('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengunggah capaian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePrograms = getProgramsByBidang(bidang);
  const availableIndikators = getIndikatorsByProgram(bidang, program);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-teal-700/80 px-3 py-1 rounded-full text-xs font-semibold text-teal-100 mb-3 border border-teal-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-teal-300" />
            <span>Formulir Pengunggahan Bukti Capaian Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Input Capaian Puskesmas Wairiang
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
            Unggah dokumen berkas bukti capaian kinerja penanggung jawab program. Berkas berukuran maksimal 5 MB dan akan otomatis berstatus <strong>Menunggu Verifikasi Admin</strong> sebelum disetujui.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && createdRecord && (
        <div className="mb-6 p-5 bg-teal-50 border border-teal-300 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-teal-950">{successMessage}</h4>
              <p className="text-xs text-teal-800">
                Dokumen capaian siap dipratinjau atau diunduh dari Dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToDashboard}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <span>Lihat di Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Capaian Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Section 1: Bidang, Program, Indikator */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-teal-900 font-bold text-sm">
            <Layers className="w-4 h-4 text-teal-700" />
            <span>1. Klasifikasi Bidang & Indikator Capaian</span>
          </div>

          {/* Bidang Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Bidang Puskesmas:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BIDANG_LIST.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBidang(b.id)}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    bidang === b.id
                      ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-xs ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-black">{b.name}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{b.fullName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Program Kerja:
              </label>
              <select
                value={program}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-medium"
              >
                {availablePrograms.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Indikator Capaian:
              </label>
              <select
                value={indikator}
                onChange={(e) => handleIndikatorChange(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-medium"
              >
                {availableIndikators.map((ind) => (
                  <option key={ind.id} value={ind.name}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pilihan Periode Capaian */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-4 text-teal-900 font-bold text-sm">
            <Calendar className="w-4 h-4 text-teal-700" />
            <span>2. Periode Capaian (Bulanan / Tribulanan / Semester / Tahunan)</span>
          </div>

          {/* Segmented Period Tabs */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Jenis Periode:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPeriodeTipe('bulanan')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  periodeTipe === 'bulanan'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Bulanan</span>
              </button>

              <button
                type="button"
                onClick={() => setPeriodeTipe('tribulanan')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  periodeTipe === 'tribulanan'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Tribulanan (Triwulan)</span>
              </button>

              <button
                type="button"
                onClick={() => setPeriodeTipe('semester')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  periodeTipe === 'semester'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Semester</span>
              </button>

              <button
                type="button"
                onClick={() => setPeriodeTipe('tahunan')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  periodeTipe === 'tahunan'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Tahunan</span>
              </button>
            </div>
          </div>

          {/* Dynamic Period Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            {periodeTipe === 'bulanan' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bulan Capaian:
                </label>
                <select
                  value={periodeBulan}
                  onChange={(e) => setPeriodeBulan(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                >
                  {BULAN_LIST.map((bln) => (
                    <option key={bln} value={bln}>
                      {bln}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {periodeTipe === 'tribulanan' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Triwulan:
                </label>
                <select
                  value={triwulan}
                  onChange={(e) => setTriwulan(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-medium"
                >
                  <option value="Triwulan I (Januari - Maret)">Triwulan I (Januari - Maret)</option>
                  <option value="Triwulan II (April - Juni)">Triwulan II (April - Juni)</option>
                  <option value="Triwulan III (Juli - September)">Triwulan III (Juli - September)</option>
                  <option value="Triwulan IV (Oktober - Desember)">Triwulan IV (Oktober - Desember)</option>
                </select>
              </div>
            )}

            {periodeTipe === 'semester' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Semester:
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-medium"
                >
                  <option value="Semester I (Januari - Juni)">Semester I (Januari - Juni)</option>
                  <option value="Semester II (Juli - Desember)">Semester II (Juli - Desember)</option>
                </select>
              </div>
            )}

            <div className={periodeTipe === 'tahunan' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tahun Anggaran / Periode:
              </label>
              <select
                value={periodeTahun}
                onChange={(e) => setPeriodeTahun(Number(e.target.value))}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              >
                {TAHUN_LIST.map((thn) => (
                  <option key={thn} value={thn}>
                    {thn}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-2 text-right text-[11px] text-slate-500">
            Label Periode: <span className="font-bold text-teal-800">{getComputedPeriodeNama()}</span>
          </div>
        </div>

        {/* Section 3: Identitas PJ Program */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-teal-900 font-bold text-sm">
            <User className="w-4 h-4 text-teal-700" />
            <span>3. Identitas Penanggung Jawab (PJ) Program</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap & Gelar PJ *:
              </label>
              <input
                type="text"
                required
                value={pjNama}
                onChange={(e) => setPjNama(e.target.value)}
                placeholder="Contoh: Yohana Barek, AMG"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NIP / NIK (Opsional):
              </label>
              <input
                type="text"
                value={pjNip}
                onChange={(e) => setPjNip(e.target.value)}
                placeholder="19920719 201903 2 007"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                No. WhatsApp / HP:
              </label>
              <input
                type="text"
                value={pjKontak}
                onChange={(e) => setPjKontak(e.target.value)}
                placeholder="0821-XXXX-XXXX"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Unggah Berkas Bukti Capaian (Maks 5 MB) */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
              <Upload className="w-4 h-4 text-teal-700" />
              <span>4. Unggah Berkas Bukti Capaian *</span>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Ukuran Maksimal: 5 MB
            </span>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer ${
              dragActive
                ? 'border-teal-500 bg-teal-50/60 ring-4 ring-teal-500/20'
                : selectedFile
                ? 'border-teal-400 bg-teal-50/30'
                : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              onChange={handleFileInput}
              accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-sm">
                  {selectedFile.name.endsWith('.pdf') && <FileText className="w-7 h-7 text-rose-600" />}
                  {(selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.csv')) && (
                    <FileSpreadsheet className="w-7 h-7 text-emerald-700" />
                  )}
                  {(selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx')) && (
                    <File className="w-7 h-7 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB (di bawah 5 MB) • Klik untuk mengganti
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Berkas Siap Diunggah
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-1">
                  <Upload className="w-6 h-6 text-teal-700" />
                </div>
                <p className="font-bold text-sm text-slate-800">
                  Tarik file bukti capaian, atau <span className="text-teal-700 underline">Pilih File dari Perangkat</span>
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Mendukung PDF, Excel (.xlsx/.xls/.csv), Word (.doc/.docx), atau Gambar (Maksimal 5 MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Uraian & Analisis Hambatan / RTL */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 mb-2 text-teal-900 font-bold text-sm">
            <FileCheck2 className="w-4 h-4 text-teal-700" />
            <span>5. Uraian Keterangan & Rencana Tindak Lanjut (Opsional)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Keterangan Capaian:
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Seluruh sasaran balita gizi kurang di wilayah kerja telah dipantau dan menerima PMT..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Analisis Masalah / Hambatan Lapangan:
              </label>
              <textarea
                rows={3}
                value={analisisMasalah}
                onChange={(e) => setAnalisisMasalah(e.target.value)}
                placeholder="Kendala atau hambatan yang dihadapi saat pelaksanaan kegiatan..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rencana Tindak Lanjut (RTL):
              </label>
              <textarea
                rows={3}
                value={rencanaTindakLanjut}
                onChange={(e) => setRencanaTindakLanjut(e.target.value)}
                placeholder="Rencana kegiatan tindak lanjut / perbaikan ke depan..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Status Awal:</span> Setelah diunggah, dokumen otomatis berstatus <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Menunggu Verifikasi Admin</span>. Admin Puskesmas Wairiang dapat langsung memverifikasi berkas menjadi <strong>Diverifikasi</strong>.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Kembali ke Dashboard
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isSubmitting ? 'Mengunggah Capaian...' : 'Unggah Dokumen Capaian'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
