import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  TrendingUp, 
  LayoutDashboard, 
  ShieldCheck, 
  KeyRound, 
  LogOut,
  ChevronRight,
  Palette,
  Sparkles
} from 'lucide-react';
import { PuskesmasLogo } from './PuskesmasLogo';
import { useTheme } from '../context/ThemeContext';

export type NavTab = 'beranda' | 'capaian' | 'laporan' | 'dashboard';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
  pendingVerificationCount?: number;
  totalRecordsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  onOpenAdminModal,
  onLogoutAdmin,
  pendingVerificationCount = 0,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, setIsThemeModalOpen } = useTheme();

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs transition-colors">
        {/* Top Header: UPTD PUSKESMAS WAIRIANG - DINAS KESEHATAN KABUPATEN LEMBATA */}
        <div 
          className="text-white text-xs sm:text-sm py-2 px-4 text-center font-bold tracking-wider shadow-inner transition-colors duration-300"
          style={{
            background: `linear-gradient(to right, ${theme.secondaryColor}, ${theme.primaryColor})`,
          }}
        >
          <p className="max-w-7xl mx-auto uppercase">
            UPTD PUSKESMAS WAIRIANG - DINAS KESEHATAN KABUPATEN LEMBATA
          </p>
        </div>

        {/* Main Navbar Bar: Only Hamburger, Logo, SI-PERIANG, Theme Switcher & Menu Admin */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Garis Tiga (Menu) + Logo + SI-PERIANG Branding */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Garis Tiga (Hamburger Menu) Button */}
              <button
                type="button"
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                aria-label="Buka Menu Navigasi"
                title="Menu Navigasi (Beranda, Input Capaian, Input Laporan, Dashboard)"
              >
                {drawerOpen ? (
                  <X className="w-6 h-6 text-slate-900" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-800" />
                )}
              </button>

              {/* Logo & Website Branding (SI-PERIANG) */}
              <div 
                onClick={() => handleSelectTab('beranda')}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <PuskesmasLogo size="md" className="group-hover:scale-105 transition-transform" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 transition">
                      SI-PERIANG
                    </span>
                  </div>
                  <p 
                    className="text-[11px] sm:text-xs font-bold tracking-wide uppercase line-clamp-1 transition-colors"
                    style={{ color: theme.primaryColor }}
                  >
                    UPTD PUSKESMAS WAIRIANG
                  </p>
                </div>
              </div>

            </div>

            {/* Right: Theme Palette Switcher & Menu Admin */}
            <div className="flex items-center gap-2">
              {/* Theme Palette Button */}
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer group"
                title={`Tema Warna Aktif: ${theme.name} (Klik untuk ganti tema)`}
              >
                <div className="flex items-center -space-x-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800" />
                  <span className="font-semibold text-[11px]">{theme.name}</span>
                </div>
              </button>

              {isAdmin ? (
                <div 
                  className="flex items-center gap-1.5 border px-3 py-1.5 rounded-xl shadow-xs"
                  style={{
                    backgroundColor: `${theme.primaryColor}12`,
                    borderColor: `${theme.primaryColor}40`,
                  }}
                >
                  <div 
                    className="flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin Wairiang</span>
                    {pendingVerificationCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                        {pendingVerificationCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onLogoutAdmin}
                    className="p-1 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg transition ml-1 cursor-pointer"
                    title="Keluar dari Mode Admin"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition group cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span>Menu Admin</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Drawer Menu (Opened by Garis Tiga) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer content panel */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-r border-slate-200 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
                <div className="flex items-center gap-3">
                  <PuskesmasLogo size="sm" />
                  <div>
                    <h3 className="font-black text-lg text-white">SI-PERIANG</h3>
                    <p className="text-[10px] text-emerald-200 uppercase font-semibold">Puskesmas Wairiang</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items: Beranda, Input Capaian, Input Laporan, Dashboard */}
              <div className="p-4 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Menu Utama Sistem
                </p>

                {/* 1. Beranda */}
                <button
                  onClick={() => handleSelectTab('beranda')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-sm transition ${
                    currentTab === 'beranda'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className={`w-5 h-5 ${currentTab === 'beranda' ? 'text-white' : 'text-emerald-700'}`} />
                    <span>Beranda</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* 2. Input Capaian */}
                <button
                  onClick={() => handleSelectTab('capaian')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-sm transition ${
                    currentTab === 'capaian'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className={`w-5 h-5 ${currentTab === 'capaian' ? 'text-white' : 'text-teal-600'}`} />
                    <span>Input Capaian</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* 3. Input Laporan */}
                <button
                  onClick={() => handleSelectTab('laporan')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-sm transition ${
                    currentTab === 'laporan'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 ${currentTab === 'laporan' ? 'text-white' : 'text-blue-600'}`} />
                    <span>Input Laporan</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* 4. Dashboard */}
                <button
                  onClick={() => handleSelectTab('dashboard')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-sm transition ${
                    currentTab === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'text-white' : 'text-slate-700'}`} />
                    <span>Dashboard Dokumen</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* 5. Ganti Tema Warna */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setIsThemeModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                    <div className="text-left">
                      <span>Pilihan Tema Warna</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
                        Tema saat ini: {theme.name}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 text-center">
              <p className="font-bold text-slate-800">
                UPTD PUSKESMAS WAIRIANG
              </p>
              <p className="text-slate-400 mt-0.5">
                Dinas Kesehatan Kabupaten Lembata
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
