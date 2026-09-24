import React from 'react';
import { useTheme, THEME_OPTIONS, ThemeId } from '../context/ThemeContext';
import { 
  Palette, 
  Check, 
  X, 
  Sparkles, 
  SunMedium, 
  Eye, 
  ShieldCheck, 
  Activity,
  Layers
} from 'lucide-react';

export const ThemeModal: React.FC = () => {
  const { themeId, setThemeId, isThemeModalOpen, setIsThemeModalOpen } = useTheme();

  if (!isThemeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Palette className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
                <span>Pilihan Tema Warna SI-PERIANG</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] uppercase">
                  Estetika
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Sesuaikan nuansa visual sistem dengan preferensi Anda
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="p-1.5 hover:bg-white/15 rounded-xl transition text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Theme Cards */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pilihlah salah satu dari 5 tema visual eksklusif di bawah ini. Tema akan langsung diterapkan secara instan ke seluruh antarmuka navigasi, header banner, kartu data, dan tombol aplikasi:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = opt.id === themeId;
              return (
                <div
                  key={opt.id}
                  onClick={() => setThemeId(opt.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left group ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-md ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Name & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm">{opt.name}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.2 bg-slate-900 text-white text-[10px] font-bold rounded-full">
                            <Check className="w-2.5 h-2.5" /> Aktif
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {opt.subtitle}
                      </span>
                    </div>

                    {/* Color Swatch Circles */}
                    <div className="flex items-center -space-x-1 shrink-0">
                      <span
                        className="w-5 h-5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: opt.primaryColor }}
                        title={`Warna Utama: ${opt.primaryColor}`}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: opt.secondaryColor }}
                        title={`Warna Sekunder: ${opt.secondaryColor}`}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: opt.accentColor }}
                        title={`Warna Aksen: ${opt.accentColor}`}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-3">
                    {opt.description}
                  </p>

                  {/* Mini Preview Bar */}
                  <div
                    className="h-7 rounded-xl p-1.5 flex items-center justify-between text-white text-[10px] font-bold shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${opt.secondaryColor}, ${opt.primaryColor})`,
                    }}
                  >
                    <span className="flex items-center gap-1 opacity-90">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Pratinjau Tampilan
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold"
                      style={{ backgroundColor: opt.accentColor, color: '#0f172a' }}
                    >
                      Pilih Tema
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Pilihan tema otomatis tersimpan di peramban Anda
          </span>
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
