import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'zamrud' | 'bahari' | 'pirus' | 'ungu' | 'koral';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  navGradient: string;
  activeTabClass: string;
  badgeClass: string;
  buttonClass: string;
  accentTextClass: string;
  borderClass: string;
  cardBgClass: string;
  heroGradient: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'zamrud',
    name: 'Zamrud Wairiang',
    subtitle: 'Kesehatan & Kesegaran Alami (Default)',
    description: 'Warna hijau zamrud khas Puskesmas & standar Kemenkes RI, melambangkan kesegaran alam Flores Timur dan ketenangan pelayanan kesehatan.',
    primaryColor: '#047857', // emerald-700
    secondaryColor: '#065f46', // emerald-800
    accentColor: '#10b981', // emerald-500
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    navGradient: 'from-emerald-900 to-teal-900',
    activeTabClass: 'bg-emerald-800 text-white shadow-emerald-900/20',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20',
    accentTextClass: 'text-emerald-800',
    borderClass: 'border-emerald-300',
    cardBgClass: 'bg-emerald-50/50',
    heroGradient: 'from-emerald-950 via-teal-950 to-slate-900',
  },
  {
    id: 'bahari',
    name: 'Bahari Lembata',
    subtitle: 'Samudera Biru & Berwibawa',
    description: 'Nuansa biru laut pesisir kepulauan Lembata yang luas dan damai, memberikan kesan instansi formal, berwibawa, dan dapat dipercaya.',
    primaryColor: '#1d4ed8', // blue-700
    secondaryColor: '#1e3a8a', // blue-900
    accentColor: '#38bdf8', // sky-400
    bgGradient: 'from-blue-950 via-slate-950 to-indigo-950',
    navGradient: 'from-blue-900 to-indigo-950',
    activeTabClass: 'bg-blue-800 text-white shadow-blue-900/20',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    buttonClass: 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20',
    accentTextClass: 'text-blue-800',
    borderClass: 'border-blue-300',
    cardBgClass: 'bg-blue-50/50',
    heroGradient: 'from-blue-950 via-indigo-950 to-slate-900',
  },
  {
    id: 'pirus',
    name: 'Pirus Sehati',
    subtitle: 'Toska Modern & Klinis Bersih',
    description: 'Perpaduan warna pirus (teal/cyan) segar yang modern dan klinis. Memberikan atmosfer teknologi sistem informasi kesehatan yang futuristik.',
    primaryColor: '#0f766e', // teal-700
    secondaryColor: '#134e4a', // teal-900
    accentColor: '#06b6d4', // cyan-500
    bgGradient: 'from-teal-950 via-cyan-950 to-slate-950',
    navGradient: 'from-teal-900 to-cyan-950',
    activeTabClass: 'bg-teal-800 text-white shadow-teal-900/20',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
    buttonClass: 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20',
    accentTextClass: 'text-teal-800',
    borderClass: 'border-teal-300',
    cardBgClass: 'bg-teal-50/50',
    heroGradient: 'from-teal-950 via-cyan-950 to-slate-900',
  },
  {
    id: 'ungu',
    name: 'Ungu Wijaya',
    subtitle: 'Amethyst Eksekutif & Elegan',
    description: 'Nuansa violet dan amestist yang anggun dan berkelas eksekutif, sangat elegan untuk pemantauan data performa dan laporan pimpinan.',
    primaryColor: '#6d28d9', // purple-700
    secondaryColor: '#4c1d95', // purple-900
    accentColor: '#c084fc', // purple-400
    bgGradient: 'from-purple-950 via-slate-950 to-indigo-950',
    navGradient: 'from-purple-900 to-indigo-950',
    activeTabClass: 'bg-purple-800 text-white shadow-purple-900/20',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
    buttonClass: 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-700/20',
    accentTextClass: 'text-purple-800',
    borderClass: 'border-purple-300',
    cardBgClass: 'bg-purple-50/50',
    heroGradient: 'from-purple-950 via-slate-950 to-indigo-950',
  },
  {
    id: 'koral',
    name: 'Koral Lembata',
    subtitle: 'Tenun Tradisional & Hangat',
    description: 'Terinspirasi dari kehangatan motif tenun ikat dan terumbu koral pulau Lembata. Memberikan nuansa humanis, hangat, dan bersahabat.',
    primaryColor: '#c2410c', // orange-700
    secondaryColor: '#7c2d12', // orange-900
    accentColor: '#fbbf24', // amber-400
    bgGradient: 'from-orange-950 via-amber-950 to-slate-950',
    navGradient: 'from-orange-900 to-stone-950',
    activeTabClass: 'bg-amber-700 text-white shadow-amber-900/20',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    buttonClass: 'bg-orange-700 hover:bg-orange-800 text-white shadow-orange-700/20',
    accentTextClass: 'text-amber-800',
    borderClass: 'border-amber-300',
    cardBgClass: 'bg-amber-50/50',
    heroGradient: 'from-stone-950 via-orange-950 to-amber-950',
  },
];

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeOption;
  setThemeId: (id: ThemeId) => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_THEME_KEY = 'siperiang_app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemeId;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved;
      }
    } catch (e) {
      // Ignore
    }
    return 'zamrud';
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, id);
    } catch (e) {
      // Ignore
    }
  };

  const theme = THEME_OPTIONS.find((t) => t.id === themeId) || THEME_OPTIONS[0];

  // Apply root CSS variables for global consistency
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.id);
    document.documentElement.style.setProperty('--theme-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--theme-accent', theme.accentColor);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setThemeId,
        isThemeModalOpen,
        setIsThemeModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
