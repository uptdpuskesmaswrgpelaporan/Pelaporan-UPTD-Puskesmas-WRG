import React from 'react';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { Cloud, CheckCircle2, HardDrive } from 'lucide-react';

interface GoogleDriveNavbarBadgeProps {
  onOpenModal: () => void;
}

export const GoogleDriveNavbarBadge: React.FC<GoogleDriveNavbarBadgeProps> = ({ onOpenModal }) => {
  const { user, isConnected, isConnecting } = useGoogleDrive();

  if (isConnected && user) {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group"
        title={`Google Drive Terhubung: ${user.email} (Klik untuk pengaturan & sinkronisasi)`}
      >
        <div className="relative">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-emerald-400"
            />
          ) : (
            <HardDrive className="w-4 h-4 text-emerald-700" />
          )}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
        </div>
        <div className="text-left hidden md:block">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black leading-tight text-emerald-800">Drive Terhubung</span>
          </div>
          <span className="text-[9px] text-emerald-600 block leading-none font-mono truncate max-w-[120px]">
            {user.email}
          </span>
        </div>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 hidden sm:block" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenModal}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50"
      title="Hubungkan penyimpanan ke Google Drive (uptdpuskesmaswrgpelaporan@gmail.com)"
    >
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      <span className="hidden sm:inline">Hubungkan Drive</span>
      <span className="sm:hidden">Drive</span>
    </button>
  );
};
