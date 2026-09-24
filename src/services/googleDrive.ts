import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Workspace OAuth Scopes
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Cache the access token strictly in memory
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Memory cache for folder IDs to avoid redundant lookups
const folderCache: Record<string, string> = {};

/**
 * Initialize Google Auth state listener.
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Trigger Google Sign In popup with Drive permissions
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh access token Google Drive dari autentikasi.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out from Google account
 */
export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Retrieve cached memory access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Set in-memory token (e.g. from sign in callback)
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Find or create a folder in Google Drive
 */
export async function getOrCreateDriveFolder(
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Otorisasi Google Drive belum tersedia. Harap hubungkan akun Google terlebih dahulu.');
  }

  const cacheKey = `${parentFolderId || 'root'}_${folderName}`;
  if (folderCache[cacheKey]) {
    return folderCache[cacheKey];
  }

  // 1. Check if folder already exists
  let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id;
      folderCache[cacheKey] = folderId;
      return folderId;
    }
  }

  // 2. Folder not found, create new folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat folder "${folderName}" di Google Drive.`);
  }

  const newFolder = await createRes.json();
  folderCache[cacheKey] = newFolder.id;
  return newFolder.id;
}

/**
 * Upload a file directly to Google Drive in organized Puskesmas folders
 */
export async function uploadFileToGoogleDrive(
  fileBlob: Blob,
  fileName: string,
  options: {
    bidang?: string;
    program?: string;
    pjNama?: string;
    periode?: string;
    indikator?: string;
    description?: string;
  }
): Promise<{
  fileId: string;
  webViewLink: string;
  webContentLink?: string;
  folderId: string;
  folderName: string;
}> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Google Drive belum terhubung. Silakan login akun Google terlebih dahulu.');
  }

  // 1. Get or create root folder: "SI-PERIANG Puskesmas Wairiang"
  const rootFolderName = 'SI-PERIANG Puskesmas Wairiang';
  const rootFolderId = await getOrCreateDriveFolder(rootFolderName);

  // 2. Get or create subfolder per Bidang (e.g. "Kesmas", "Yankes")
  const targetFolderName = options.bidang ? `Bidang ${options.bidang}` : 'Dokumen Pelaporan';
  const targetFolderId = await getOrCreateDriveFolder(targetFolderName, rootFolderId);

  // 3. Prepare metadata and multipart body
  const metadata = {
    name: fileName,
    parents: [targetFolderId],
    description: `SI-PERIANG Puskesmas Wairiang\nBidang: ${options.bidang || '-'}\nProgram: ${options.program || '-'}\nIndikator: ${options.indikator || '-'}\nPeriode: ${options.periode || '-'}\nPenanggung Jawab: ${options.pjNama || '-'}\nDiunggah: ${new Date().toLocaleString('id-ID')}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const fileHeaderPart = `${delimiter}Content-Type: ${fileBlob.type || 'application/octet-stream'}\r\n\r\n`;

  // Combine metadata and file blob
  const multipartBlob = new Blob([
    metadataPart,
    fileHeaderPart,
    fileBlob,
    closeDelimiter,
  ]);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBlob,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal mengunggah berkas ke Google Drive.');
  }

  const uploadResult = await uploadRes.json();
  return {
    fileId: uploadResult.id,
    webViewLink: uploadResult.webViewLink || `https://drive.google.com/file/d/${uploadResult.id}/view`,
    webContentLink: uploadResult.webContentLink,
    folderId: targetFolderId,
    folderName: targetFolderName,
  };
}
