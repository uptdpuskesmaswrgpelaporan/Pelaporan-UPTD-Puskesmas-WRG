import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initGoogleAuth,
  signInWithGoogle,
  signOutGoogle,
  uploadFileToGoogleDrive,
  getOrCreateDriveFolder,
  getAccessToken,
  setCachedAccessToken,
} from '../services/googleDrive';
import { RecordItem } from '../types';
import { api } from '../services/api';

interface GoogleDriveContextType {
  user: User | null;
  isConnected: boolean;
  isConnecting: boolean;
  loginGoogle: () => Promise<User | null>;
  logoutGoogle: () => Promise<void>;
  syncRecordToDrive: (record: RecordItem, fileBlob?: Blob) => Promise<RecordItem>;
  isSyncing: boolean;
  rootFolderUrl: string | null;
  openDriveFolder: () => void;
  error: string | null;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setCachedAccessToken(token);
        setError(null);
      },
      () => {
        setUser(null);
        setCachedAccessToken(null);
        setRootFolderId(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginGoogle = async (): Promise<User | null> => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      
      // Pre-warm / find root folder
      try {
        const fId = await getOrCreateDriveFolder('SI-PERIANG Puskesmas Wairiang');
        setRootFolderId(fId);
      } catch (fErr) {
        console.warn('Pre-warming root folder notice:', fErr);
      }

      return result.user;
    } catch (err: any) {
      console.error('Login Google failed:', err);
      setError(err.message || 'Gagal login dengan akun Google');
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const logoutGoogle = async () => {
    try {
      await signOutGoogle();
      setUser(null);
      setRootFolderId(null);
    } catch (err: any) {
      console.error('Logout Google failed:', err);
    }
  };

  const syncRecordToDrive = async (record: RecordItem, fileBlob?: Blob): Promise<RecordItem> => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Akun Google Drive belum terhubung. Silakan hubungkan akun Google terlebih dahulu.');
    }

    setIsSyncing(true);
    try {
      let targetBlob: Blob;

      if (fileBlob) {
        targetBlob = fileBlob;
      } else if (record.fileData) {
        // Convert base64 data to blob
        const res = await fetch(record.fileData);
        targetBlob = await res.blob();
      } else if (record.fileUrl) {
        // Fetch from server upload endpoint
        const res = await fetch(record.fileUrl);
        if (!res.ok) {
          throw new Error('Gagal mengunduh berkas sumber untuk disinkronkan ke Google Drive.');
        }
        targetBlob = await res.blob();
      } else {
        throw new Error('Konten berkas tidak ditemukan untuk disinkronkan.');
      }

      const driveRes = await uploadFileToGoogleDrive(targetBlob, record.fileOriginalName || record.fileName, {
        bidang: record.bidang,
        program: record.program,
        pjNama: record.pjNama,
        indikator: record.indikator,
        periode: record.periodeNama || `${record.periodeBulan} ${record.periodeTahun}`,
      });

      // Update record in database
      const updated = await api.updateRecordDriveSync(record.id, {
        driveFileId: driveRes.fileId,
        driveWebViewLink: driveRes.webViewLink,
        driveWebContentLink: driveRes.webContentLink,
        driveFolderId: driveRes.folderId,
        driveFolderName: driveRes.folderName,
      });

      return updated;
    } finally {
      setIsSyncing(false);
    }
  };

  const rootFolderUrl = rootFolderId
    ? `https://drive.google.com/drive/folders/${rootFolderId}`
    : 'https://drive.google.com/drive/my-drive';

  const openDriveFolder = () => {
    if (rootFolderUrl) {
      window.open(rootFolderUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <GoogleDriveContext.Provider
      value={{
        user,
        isConnected: !!user,
        isConnecting,
        loginGoogle,
        logoutGoogle,
        syncRecordToDrive,
        isSyncing,
        rootFolderUrl,
        openDriveFolder,
        error,
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};
