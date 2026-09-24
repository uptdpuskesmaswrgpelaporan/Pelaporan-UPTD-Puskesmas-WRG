import { RecordItem, ValidationStatus, ActivityLogItem } from '../types';
import { INITIAL_RECORDS } from '../data/initialRecords';
import { INITIAL_ACTIVITY_LOGS } from '../data/initialActivityLogs';

const LOCAL_STORAGE_KEY = 'si_periang_records_v1';
const LOCAL_STORAGE_LOGS_KEY = 'si_periang_activity_logs_v1';

export const api = {
  // Fetch all records from server, fallback to local storage
  async getRecords(): Promise<RecordItem[]> {
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend fetch failed, falling back to local cache/initial records:', err);
    }

    // Fallback
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing local storage:', e);
      }
    }
    return INITIAL_RECORDS;
  },

  // Upload new report or achievement
  async uploadRecord(formData: FormData): Promise<RecordItem> {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengunggah laporan/capaian ke server');
      }
    } catch (err: any) {
      console.warn('Direct upload error, creating client-side stored record:', err);
      // Client-side fallback if server offline or standalone preview
      const file = formData.get('file') as File | null;
      let fileUrl = '';
      let fileData: string | undefined = undefined;

      if (file) {
        fileUrl = URL.createObjectURL(file);
        // read base64 if small enough
        if (file.size < 5 * 1024 * 1024) {
          try {
            fileData = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          } catch (e) {
            console.error('File reading failed', e);
          }
        }
      }

      const targetVal = formData.get('target') ? Number(formData.get('target')) : undefined;
      const realisasiVal = formData.get('realisasi') ? Number(formData.get('realisasi')) : undefined;
      let persentase: number | undefined = undefined;
      if (targetVal && targetVal > 0 && realisasiVal !== undefined) {
        persentase = Number(((realisasiVal / targetVal) * 100).toFixed(1));
      }

      const fallbackRecord: RecordItem = {
        id: `REC-${Date.now()}`,
        type: (formData.get('type') as any) || 'laporan',
        bidang: formData.get('bidang') as any,
        program: formData.get('program') as string,
        indikator: formData.get('indikator') as string,
        periodeBulan: (formData.get('periodeBulan') as string) || 'September',
        periodeTahun: Number(formData.get('periodeTahun')) || 2026,
        pjNama: (formData.get('pjNama') as string) || 'Penanggung Jawab Program',
        pjNip: (formData.get('pjNip') as string) || '',
        pjKontak: (formData.get('pjKontak') as string) || '',
        target: targetVal,
        realisasi: realisasiVal,
        persentase,
        satuan: (formData.get('satuan') as string) || '',
        keterangan: (formData.get('keterangan') as string) || '',
        analisisMasalah: (formData.get('analisisMasalah') as string) || '',
        rencanaTindakLanjut: (formData.get('rencanaTindakLanjut') as string) || '',
        fileName: file ? file.name : 'dokumen_laporan.pdf',
        fileOriginalName: file ? file.name : 'dokumen_laporan.pdf',
        fileType: detectFileType(file?.name || ''),
        fileSize: file ? file.size : 102400,
        fileUrl,
        fileData,
        uploadedAt: new Date().toISOString(),
        status: 'menunggu',
        adminNotes: '',
      };

      const existing = await this.getRecords();
      const updated = [fallbackRecord, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      // Record Activity Log for fallback upload
      await this.recordActivityLog({
        action: 'upload',
        actionLabel: 'Unggah Dokumen Baru',
        targetId: fallbackRecord.id,
        targetTitle: fallbackRecord.indikator,
        program: fallbackRecord.program,
        bidang: fallbackRecord.bidang,
        recordType: fallbackRecord.type,
        actor: fallbackRecord.pjNama,
        actorRole: 'pj',
        fileName: fallbackRecord.fileOriginalName || fallbackRecord.fileName,
        fileSize: fallbackRecord.fileSize,
        details: `Pengunggahan ${fallbackRecord.type === 'laporan' ? 'Laporan Program' : 'Bukti Capaian'} periode ${fallbackRecord.periodeBulan} ${fallbackRecord.periodeTahun}`,
        statusAfter: 'menunggu_verifikasi',
      });

      return fallbackRecord;
    }
    throw new Error('Upload gagal');
  },

  // Admin validation
  async validateRecord(
    id: string,
    status: ValidationStatus,
    adminNotes: string,
    validatedBy: string = 'Kepala / Admin Puskesmas Wairiang'
  ): Promise<RecordItem> {
    try {
      const res = await fetch(`/api/records/${id}/validate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes, validatedBy }),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend validation failed, saving in localStorage:', e);
    }

    // Local fallback
    const records = await this.getRecords();
    const idx = records.findIndex((r) => r.id === id);
    if (idx !== -1) {
      const prevRecord = records[idx];
      const prevStatus = prevRecord.status;

      records[idx] = {
        ...records[idx],
        status,
        adminNotes,
        validatedBy,
        validatedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));

      const isApproved = status === 'diverifikasi' || status === 'valid';
      const isRevision = status === 'revisi';
      await this.recordActivityLog({
        action: isRevision ? 'revisi' : 'verify',
        actionLabel: isRevision ? 'Permintaan Revisi Dokumen' : 'Verifikasi Dokumen Disetujui',
        targetId: prevRecord.id,
        targetTitle: prevRecord.indikator,
        program: prevRecord.program,
        bidang: prevRecord.bidang,
        recordType: prevRecord.type,
        actor: validatedBy,
        actorRole: 'admin',
        fileName: prevRecord.fileOriginalName || prevRecord.fileName,
        fileSize: prevRecord.fileSize,
        details: adminNotes || (isApproved ? 'Dokumen diverifikasi dan disahkan oleh pengelola.' : 'Status dokumen diperbarui oleh admin.'),
        statusBefore: prevStatus,
        statusAfter: status,
      });

      return records[idx];
    }
    throw new Error('Data tidak ditemukan');
  },

  // Update Google Drive sync metadata
  async updateRecordDriveSync(
    id: string,
    driveData: {
      driveFileId: string;
      driveWebViewLink: string;
      driveWebContentLink?: string;
      driveFolderId?: string;
      driveFolderName?: string;
    }
  ): Promise<RecordItem> {
    try {
      const res = await fetch(`/api/records/${id}/drive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driveData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to update drive sync in server, updating local storage:', err);
    }

    const records = await this.getRecords();
    const idx = records.findIndex((r) => r.id === id);
    if (idx !== -1) {
      records[idx] = {
        ...records[idx],
        ...driveData,
        driveSyncedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
      return records[idx];
    }
    throw new Error('Data tidak ditemukan');
  },

  // Delete record - PROTECTED: requires admin PIN
  async deleteRecord(id: string, adminPin: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        body: JSON.stringify({ adminPin }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menghapus data. Periksa PIN Admin.');
      }
      return true;
    } catch (e: any) {
      if (adminPin === 'wairiang2026' || adminPin === '2026') {
        // Allow client fallback deletion with valid PIN
        const records = await this.getRecords();
        const recordToDelete = records.find((r) => r.id === id);
        const updated = records.filter((r) => r.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

        if (recordToDelete) {
          await this.recordActivityLog({
            action: 'delete',
            actionLabel: 'Hapus Dokumen',
            targetId: recordToDelete.id,
            targetTitle: recordToDelete.indikator,
            program: recordToDelete.program,
            bidang: recordToDelete.bidang,
            recordType: recordToDelete.type,
            actor: 'Admin Puskesmas Wairiang',
            actorRole: 'admin',
            fileName: recordToDelete.fileOriginalName || recordToDelete.fileName,
            fileSize: recordToDelete.fileSize,
            details: `Penghapusan berkas ${recordToDelete.type} (${recordToDelete.fileOriginalName || recordToDelete.fileName}) oleh Admin.`,
            statusBefore: recordToDelete.status,
          });
        }
        return true;
      }
      throw e;
    }
  },

  // Get Activity Logs
  async getActivityLogs(): Promise<ActivityLogItem[]> {
    try {
      const res = await fetch('/api/activity-logs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch activity logs from server, falling back to local storage:', err);
    }

    const local = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing local logs:', e);
      }
    }
    return INITIAL_ACTIVITY_LOGS;
  },

  // Record an Activity Log
  async recordActivityLog(entry: Omit<ActivityLogItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const res = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        return;
      }
    } catch (err) {
      console.warn('Could not post activity log to server, saving locally:', err);
    }

    // Fallback save in localStorage
    const currentLogs = await this.getActivityLogs();
    const newLogItem: ActivityLogItem = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const updatedLogs = [newLogItem, ...currentLogs];
    if (updatedLogs.length > 500) updatedLogs.length = 500;
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(updatedLogs));
  },
};

function detectFileType(filename: string): 'pdf' | 'excel' | 'word' | 'image' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) return 'excel';
  if (['doc', 'docx', 'rtf'].includes(ext)) return 'word';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image';
  return 'other';
}
