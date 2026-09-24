import React, { useState } from 'react';
import { BIDANG_LIST } from '../data/programs';
import { Layers, CheckCircle, FileText, Download, ShieldCheck, HelpCircle } from 'lucide-react';

export const InfoPanduan: React.FC = () => {
  const [selectedBidangId, setSelectedBidangId] = useState('Kesmas');

  const currentBidang = BIDANG_LIST.find((b) => b.id === selectedBidangId) || BIDANG_LIST[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold mb-3 border border-emerald-400/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Struktur Organisasi & Tata Kelola Pelaporan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">
            Panduan Bidang & Indikator Puskesmas Wairiang
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            SI-PERIANG membagi seluruh pengumpulan data laporan bulanan dan capaian kinerja ke dalam 5 Bidang resmi UPTD Puskesmas Wairiang.
          </p>
        </div>
      </div>

      {/* Bidang Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {BIDANG_LIST.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBidangId(b.id)}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              selectedBidangId === b.id
                ? 'bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/30'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div>
              <span className="text-xs font-black block">{b.name}</span>
              <span className={`text-[11px] block mt-0.5 ${selectedBidangId === b.id ? 'text-emerald-200' : 'text-slate-500'}`}>
                {b.fullName}
              </span>
            </div>
            <span className={`text-[10px] font-bold mt-3 inline-block px-2 py-0.5 rounded-full ${
              selectedBidangId === b.id ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-100 text-slate-600'
            }`}>
              {b.programs.length} Program
            </span>
          </button>
        ))}
      </div>

      {/* Detailed Programs & Indikators of the Selected Bidang */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {currentBidang.name} ({currentBidang.fullName})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Daftar program dan indikator laporan yang wajib diinput berkala oleh Penanggung Jawab terkait.
            </p>
          </div>
          <span className="text-xs font-bold uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            {currentBidang.id}
          </span>
        </div>

        <div className="space-y-6">
          {currentBidang.programs.map((program) => (
            <div key={program.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
              <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>{program.name}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {program.indikatorList.map((ind) => (
                  <div key={ind.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="font-bold text-xs text-slate-900 mb-1 flex items-start justify-between gap-1">
                      <span>{ind.name}</span>
                      {ind.satuan && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                          {ind.satuan}
                        </span>
                      )}
                    </div>
                    {ind.keterangan && (
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {ind.keterangan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hak Akses & Kebijakan Sistem */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-3">
        <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Kebijakan Keamanan & Akses Terbuka SI-PERIANG</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-900 leading-relaxed">
          <div className="bg-white p-4 rounded-xl border border-emerald-100">
            <span className="font-bold text-slate-900 block mb-1">Akses Publik & Seluruh Staf:</span>
            Dapat membuka tautan website dari perangkat apa saja (komputer, smartphone, tablet), mengunggah berkas laporan/capaian, melihat pratinjau lembar kerja Excel/PDF/Word, dan mengunduh berkas asli tanpa memerlukan pendaftaran akun rumit.
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100">
            <span className="font-bold text-slate-900 block mb-1">Otoritas Validasi & Proteksi Data:</span>
            Untuk menjamin integritas data instansi Puskesmas Wairiang, tombol perubahan status verifikasi dokumen (Valid / Revisi) serta penghapusan arsip hanya dapat disetujui melalui otorisasi Pengelola / Admin Puskesmas.
          </div>
        </div>
      </div>
    </div>
  );
};
