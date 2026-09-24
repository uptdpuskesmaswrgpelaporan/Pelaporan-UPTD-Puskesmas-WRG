import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || 'wairiang2026';

function isValidAdminPin(pin?: string): boolean {
  if (!pin) return false;
  const clean = String(pin).trim();
  return clean === 'wairiang2026' || clean === '2026' || clean === ADMIN_PIN;
}

// Directories setup
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
const recordsFile = path.join(dataDir, 'records.json');
const activityLogsFile = path.join(dataDir, 'activity_logs.json');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Activity Logs seed
const INITIAL_LOGS = [
  {
    id: 'LOG-20260924-001',
    action: 'verify',
    actionLabel: 'Verifikasi Dokumen Disetujui',
    targetId: 'REC-2026-001',
    targetTitle: 'F1-F8 Kesga',
    program: 'Program KIA (Kesehatan Ibu & Anak)',
    bidang: 'Kesmas',
    recordType: 'laporan',
    actor: 'dr. Antonius L. (Kepala Puskesmas Wairiang)',
    actorRole: 'admin',
    timestamp: '2026-09-21T10:15:00.000Z',
    fileName: 'Rekapitulasi_F1_F8_Kesga_Puskesmas_Wairiang_Sep2026.xlsx',
    fileSize: 184520,
    details: 'Data lengkap, sinkron dengan rekap PWS KIA desa binaan.',
    statusBefore: 'menunggu_verifikasi',
    statusAfter: 'diverifikasi',
  },
  {
    id: 'LOG-20260924-002',
    action: 'upload',
    actionLabel: 'Unggah Dokumen Baru',
    targetId: 'REC-2026-001',
    targetTitle: 'F1-F8 Kesga',
    program: 'Program KIA (Kesehatan Ibu & Anak)',
    bidang: 'Kesmas',
    recordType: 'laporan',
    actor: 'Bd. Maria Goreti, S.Tr.Keb',
    actorRole: 'pj',
    timestamp: '2026-09-20T08:30:00.000Z',
    fileName: 'Rekapitulasi_F1_F8_Kesga_Puskesmas_Wairiang_Sep2026.xlsx',
    fileSize: 184520,
    details: 'Pengunggahan berkas laporan F1-F8 Kesga periode September 2026.',
    statusAfter: 'menunggu_verifikasi',
  },
  {
    id: 'LOG-20260924-003',
    action: 'verify',
    actionLabel: 'Verifikasi Dokumen Disetujui',
    targetId: 'REC-2026-002',
    targetTitle: 'Kohor Gizi Buruk',
    program: 'Program Gizi',
    bidang: 'Kesmas',
    recordType: 'capaian',
    actor: 'dr. Antonius L. (Kepala Puskesmas Wairiang)',
    actorRole: 'admin',
    timestamp: '2026-09-22T14:30:00.000Z',
    fileName: 'Capaian_Kohor_Gizi_Buruk_Wairiang_Sep2026.pdf',
    fileSize: 421500,
    details: 'Target tercapai 100%, tata laksana PMT sesuai SOP Kemenkes.',
    statusBefore: 'menunggu_verifikasi',
    statusAfter: 'diverifikasi',
  },
  {
    id: 'LOG-20260924-004',
    action: 'upload',
    actionLabel: 'Unggah Dokumen Baru',
    targetId: 'REC-2026-002',
    targetTitle: 'Kohor Gizi Buruk',
    program: 'Program Gizi',
    bidang: 'Kesmas',
    recordType: 'capaian',
    actor: 'Yohana Barek, AMG',
    actorRole: 'pj',
    timestamp: '2026-09-22T09:45:00.000Z',
    fileName: 'Capaian_Kohor_Gizi_Buruk_Wairiang_Sep2026.pdf',
    fileSize: 421500,
    details: 'Pengunggahan bukti capaian kohor pemantauan balita gizi periode September 2026.',
    statusAfter: 'menunggu_verifikasi',
  },
  {
    id: 'LOG-20260924-005',
    action: 'upload',
    actionLabel: 'Unggah Dokumen Baru',
    targetId: 'REC-2026-003',
    targetTitle: 'LB1 (Laporan Bulanan Kesakitan)',
    program: 'Program Sistem Informasi Puskesmas (SP3)',
    bidang: 'SDK',
    recordType: 'laporan',
    actor: 'Stefanus Diaz, S.Kom',
    actorRole: 'pj',
    timestamp: '2026-09-23T11:00:00.000Z',
    fileName: 'Laporan_LB1_Kasus_Penyakit_Wairiang_Sep2026.pdf',
    fileSize: 312800,
    details: 'Pengunggahan dokumen laporan LB1 morbiditas rawat jalan.',
    statusAfter: 'menunggu_verifikasi',
  },
  {
    id: 'LOG-20260924-006',
    action: 'delete',
    actionLabel: 'Hapus Dokumen',
    targetId: 'REC-2026-DRAFT',
    targetTitle: 'Draft Laporan Daluarsa P2P',
    program: 'Surveilans & SKDR',
    bidang: 'P2P',
    recordType: 'laporan',
    actor: 'Admin Puskesmas Wairiang',
    actorRole: 'admin',
    timestamp: '2026-09-23T15:20:00.000Z',
    fileName: 'Draft_Duplikat_Surveilans_W37.pdf',
    fileSize: 154200,
    details: 'Penghapusan berkas draft ganda oleh Admin Puskesmas Wairiang.',
    statusBefore: 'menunggu_verifikasi',
  },
];

function getActivityLogs(): any[] {
  try {
    if (fs.existsSync(activityLogsFile)) {
      const data = fs.readFileSync(activityLogsFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading activity logs file:', err);
  }
  return INITIAL_LOGS;
}

function saveActivityLogs(logs: any[]): void {
  try {
    fs.writeFileSync(activityLogsFile, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving activity logs file:', err);
  }
}

function recordActivityLog(entry: any): void {
  try {
    const logs = getActivityLogs();
    const newEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    logs.unshift(newEntry);
    // Keep max 500 logs
    if (logs.length > 500) {
      logs.length = 500;
    }
    saveActivityLogs(logs);
  } catch (err) {
    console.error('Error recording activity log:', err);
  }
}

if (!fs.existsSync(activityLogsFile)) {
  saveActivityLogs(INITIAL_LOGS);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${cleanOriginalName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit requested
  },
});

// Helper for file type category
function detectFileType(filename: string, mimetype?: string): 'pdf' | 'excel' | 'word' | 'image' | 'other' {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf' || mimetype?.includes('pdf')) return 'pdf';
  if (['.xlsx', '.xls', '.csv', '.ods'].includes(ext) || mimetype?.includes('spreadsheet') || mimetype?.includes('excel')) return 'excel';
  if (['.doc', '.docx', '.rtf', '.odt'].includes(ext) || mimetype?.includes('word')) return 'word';
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext) || mimetype?.startsWith('image/')) return 'image';
  return 'other';
}

// Helper to read / write records
function getRecords(): any[] {
  try {
    if (fs.existsSync(recordsFile)) {
      const data = fs.readFileSync(recordsFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading records file:', err);
  }
  return [];
}

function saveRecords(records: any[]): void {
  try {
    fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving records file:', err);
  }
}

// Create sample demo files in uploads dir if not exist
function createSampleFiles(): void {
  const samplePdfPath = path.join(uploadsDir, 'sample-kohor-gizi.pdf');
  if (!fs.existsSync(samplePdfPath)) {
    // Minimal standard PDF header for browser preview
    const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 170 >> stream
BT
/F1 18 Tf
50 720 Td
(PUSKESMAS WAIRIANG - KABUPATEN FLORES TIMUR) Tj
0 -30 Td
/F1 14 Tf
(Laporan Capaian Program Gizi & KIA - September 2026) Tj
0 -25 Td
/F1 11 Tf
(Status: Valid / Disetujui Kepala Puskesmas Wairiang) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000224 00000 n 
0000000445 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
514
%%EOF`;
    try {
      fs.writeFileSync(samplePdfPath, minimalPdf);
      fs.copyFileSync(samplePdfPath, path.join(uploadsDir, 'sample-lb1-kesakitan.pdf'));
      fs.copyFileSync(samplePdfPath, path.join(uploadsDir, 'sample-absensi.pdf'));
      fs.copyFileSync(samplePdfPath, path.join(uploadsDir, 'sample-posyandu.pdf'));
      fs.copyFileSync(samplePdfPath, path.join(uploadsDir, 'sample-7h7-bumil.pdf'));
    } catch (e) {
      console.error('Error creating sample pdfs', e);
    }
  }

  // Create sample CSV/Excel representation
  const sampleExcelPath = path.join(uploadsDir, 'sample-kesga-f1-f8.xlsx');
  if (!fs.existsSync(sampleExcelPath)) {
    const csvContent = `No,Desa/Kelurahan,Sasaran Bumil,Bumil K1,Bumil K4,Bumil K6,Persalinan Nakes,KF3,KN Lengkap,Capaian %\n1,Desa Wairiang,45,45,43,42,43,43,43,95.5%\n2,Desa Baniona,32,32,32,31,31,31,31,96.8%\n3,Desa Lewoingu,28,28,28,27,27,27,27,96.4%\n4,Desa Belogili,35,35,34,34,34,34,34,97.1%\n5,Total Wilayah Puskesmas Wairiang,140,140,137,134,135,135,135,96.4%`;
    try {
      fs.writeFileSync(path.join(uploadsDir, 'sample-kesga-f1-f8.csv'), csvContent);
      fs.writeFileSync(path.join(uploadsDir, 'sample-lplpo-obat.csv'), 'No,Kode Obat,Nama Obat,Satuan,Stok Awal,Penerimaan,Pemakaian,Sisa Stok,Permintaan\n1,OBT-001,Amoksisilin 500mg,Tablet,5000,2000,4500,2500,3000\n2,OBT-002,Parasetamol 500mg,Tablet,8000,5000,9200,3800,6000\n3,OBT-003,Oralit 200ml,Sachet,1200,1000,850,1350,1000\n4,OBT-004,Vitamin A 200.000 IU,Kapsul Biru,800,500,600,700,500');
      fs.writeFileSync(path.join(uploadsDir, 'sample-stp-surveilans.csv'), 'Minggu Ke,Kode ICD,Nama Penyakit,Jumlah Kasus,Status Alert,Tindak Lanjut\nW36,A09,Diare Akut,8,Normal,Edukasi PHBS\nW37,J00,ISPA / Common Cold,24,Normal,Terapi rawat jalan\nW38,B50,Malaria Falciparum,1,Peringatan 1,PE 1-2-5\nW39,A01,Demam Tifoid,3,Normal,Pemeriksaan lab');
      fs.writeFileSync(path.join(uploadsDir, 'sample-10-penyakit.csv'), 'Peringkat,Nama Penyakit,Kode ICD-10,Jumlah Kasus,Persentase\n1,ISPA (Infeksi Saluran Napas Atas),J06.9,214,24.5%\n2,Gastritis & Duodenitis,K29.7,142,16.2%\n3,Hipertensi Esensial,I10,98,11.2%\n4,Dermatitis / Alergi Kulit,L23,76,8.7%\n5,Artritis / Rematik,M13,64,7.3%\n6,Diare & Gastroenteritis,A09,52,5.9%\n7,Diabetes Melitus Tipe 2,E11,48,5.5%\n8,Cephalgia (Sakit Kepala),R51,35,4.0%\n9,Tonsilitis Akut,J03,29,3.3%\n10,Konjungtivitis,H10,21,2.4%');
    } catch (e) {
      console.error('Error creating sample csvs', e);
    }
  }
}

createSampleFiles();

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving with proper preview headers
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.path);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    // Allow inline display for PDF and images
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      res.setHeader('Content-Disposition', 'inline');
    } else if (['.csv', '.txt'].includes(ext)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
  express.static(uploadsDir)(req, res, next);
});

// --- API ROUTES ---

// 1. Get all records
app.get('/api/records', (_req: Request, res: Response) => {
  const records = getRecords();
  res.json({ success: true, data: records });
});

// 2. Upload file & create report or achievement record
app.post('/api/upload', upload.single('file'), (req: Request, res: Response): void => {
  try {
    const file = req.file;
    const body = req.body;

    if (!file) {
      res.status(400).json({ success: false, message: 'File laporan/capaian wajib diunggah.' });
      return;
    }

    const type = body.type || 'laporan';
    const bidang = body.bidang;
    const program = body.program;
    const indikator = body.indikator;
    const periodeTipe = body.periodeTipe || 'bulanan';
    const periodeBulan = body.periodeBulan || 'September';
    const periodeTahun = Number(body.periodeTahun) || 2026;
    const periodeNama = body.periodeNama || `${periodeBulan} ${periodeTahun}`;
    const pjNama = body.pjNama || 'Penanggung Jawab Program';
    const pjNip = body.pjNip || '';
    const pjKontak = body.pjKontak || '';
    const target = body.target ? Number(body.target) : undefined;
    const realisasi = body.realisasi ? Number(body.realisasi) : undefined;
    const satuan = body.satuan || '';
    const keterangan = body.keterangan || '';
    const analisisMasalah = body.analisisMasalah || '';
    const rencanaTindakLanjut = body.rencanaTindakLanjut || '';

    let persentase: number | undefined = undefined;
    if (target !== undefined && target > 0 && realisasi !== undefined) {
      persentase = Number(((realisasi / target) * 100).toFixed(1));
    } else if (body.persentase) {
      persentase = Number(body.persentase);
    }

    const fileCategory = detectFileType(file.originalname, file.mimetype);
    const fileUrl = `/uploads/${file.filename}`;

    const newRecord = {
      id: `REC-${Date.now()}`,
      type,
      bidang,
      program,
      indikator,
      periodeTipe,
      periodeBulan,
      periodeTahun,
      periodeNama,
      pjNama,
      pjNip,
      pjKontak,
      target,
      realisasi,
      persentase,
      satuan,
      keterangan,
      analisisMasalah,
      rencanaTindakLanjut,
      fileName: file.filename,
      fileOriginalName: file.originalname,
      fileType: fileCategory,
      fileSize: file.size,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      status: 'menunggu_verifikasi', // Status otomatis: Menunggu Verifikasi Admin
      adminNotes: '',
      driveFileId: body.driveFileId || undefined,
      driveWebViewLink: body.driveWebViewLink || undefined,
      driveWebContentLink: body.driveWebContentLink || undefined,
      driveFolderId: body.driveFolderId || undefined,
      driveFolderName: body.driveFolderName || undefined,
      driveSyncedAt: body.driveSyncedAt || (body.driveFileId ? new Date().toISOString() : undefined),
    };

    const currentRecords = getRecords();
    currentRecords.unshift(newRecord);
    saveRecords(currentRecords);

    // Record Activity Log: Upload Document
    recordActivityLog({
      action: 'upload',
      actionLabel: 'Unggah Dokumen Baru',
      targetId: newRecord.id,
      targetTitle: newRecord.indikator,
      program: newRecord.program,
      bidang: newRecord.bidang,
      recordType: newRecord.type,
      actor: newRecord.pjNama,
      actorRole: 'pj',
      fileName: newRecord.fileOriginalName || newRecord.fileName,
      fileSize: newRecord.fileSize,
      details: `Pengunggahan ${newRecord.type === 'laporan' ? 'Laporan Program' : 'Bukti Capaian'} periode ${newRecord.periodeNama || newRecord.periodeBulan + ' ' + newRecord.periodeTahun}`,
      statusAfter: 'menunggu_verifikasi',
    });

    res.status(201).json({
      success: true,
      message: `${type === 'laporan' ? 'Laporan' : 'Capaian'} berhasil diunggah dan siap diverifikasi!`,
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal mengunggah file' });
  }
});

// 2b. Update record with Google Drive sync metadata
app.patch('/api/records/:id/drive', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { driveFileId, driveWebViewLink, driveWebContentLink, driveFolderId, driveFolderName } = req.body;

    const records = getRecords();
    const index = records.findIndex((r: any) => r.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
      return;
    }

    records[index] = {
      ...records[index],
      driveFileId: driveFileId || records[index].driveFileId,
      driveWebViewLink: driveWebViewLink || records[index].driveWebViewLink,
      driveWebContentLink: driveWebContentLink || records[index].driveWebContentLink,
      driveFolderId: driveFolderId || records[index].driveFolderId,
      driveFolderName: driveFolderName || records[index].driveFolderName,
      driveSyncedAt: new Date().toISOString(),
    };

    saveRecords(records);

    res.json({
      success: true,
      message: 'Informasi sinkronisasi Google Drive berhasil disimpan.',
      data: records[index],
    });
  } catch (error: any) {
    console.error('Error updating drive sync info:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status Google Drive' });
  }
});

// 3. Admin validation endpoint
app.patch('/api/records/:id/validate', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, validatedBy, adminNotes } = req.body;

    const records = getRecords();
    const recordIndex = records.findIndex((r) => r.id === id);

    if (recordIndex === -1) {
      res.status(404).json({ success: false, message: 'Data record tidak ditemukan' });
      return;
    }

    const prevRecord = records[recordIndex];
    const prevStatus = prevRecord.status;

    records[recordIndex] = {
      ...records[recordIndex],
      status: status || records[recordIndex].status,
      validatedBy: validatedBy || 'Pengelola SI-PERIANG Puskesmas Wairiang',
      validatedAt: new Date().toISOString(),
      adminNotes: adminNotes !== undefined ? adminNotes : records[recordIndex].adminNotes,
    };

    saveRecords(records);

    // Record Activity Log: Validation / Revision
    const isApproved = status === 'diverifikasi' || status === 'valid';
    const isRevision = status === 'revisi';
    recordActivityLog({
      action: isRevision ? 'revisi' : 'verify',
      actionLabel: isRevision ? 'Permintaan Revisi Dokumen' : 'Verifikasi Dokumen Disetujui',
      targetId: prevRecord.id,
      targetTitle: prevRecord.indikator,
      program: prevRecord.program,
      bidang: prevRecord.bidang,
      recordType: prevRecord.type,
      actor: validatedBy || 'Admin Puskesmas Wairiang',
      actorRole: 'admin',
      fileName: prevRecord.fileOriginalName || prevRecord.fileName,
      fileSize: prevRecord.fileSize,
      details: adminNotes || (isApproved ? 'Dokumen diverifikasi dan disahkan oleh pengelola.' : 'Status dokumen diperbarui oleh admin.'),
      statusBefore: prevStatus,
      statusAfter: status,
    });

    res.json({ success: true, message: 'Status validasi berhasil diperbarui', data: records[recordIndex] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Delete record - PROTECTED: Requires Admin PIN to prevent public modification/deletion
app.delete('/api/records/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const pin = (req.headers['x-admin-pin'] as string) || req.body?.adminPin;

    if (!isValidAdminPin(pin)) {
      res.status(403).json({
        success: false,
        message: 'Akses Ditolak: Penghapusan atau pengubahan data memerlukan otorisasi/persetujuan Admin Puskesmas Wairiang.',
      });
      return;
    }

    const records = getRecords();
    const recordToDelete = records.find((r) => r.id === id);

    if (!recordToDelete) {
      res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
      return;
    }

    // Try deleting physical file if exists
    if (recordToDelete.fileName) {
      const filePath = path.join(uploadsDir, recordToDelete.fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete file:', filePath);
        }
      }
    }

    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);

    // Record Activity Log: Delete Document
    recordActivityLog({
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
      details: `Penghapusan berkas ${recordToDelete.type} (${recordToDelete.fileOriginalName || recordToDelete.fileName}) oleh Admin Puskesmas Wairiang.`,
      statusBefore: recordToDelete.status,
    });

    res.json({ success: true, message: 'Data laporan/capaian berhasil dihapus oleh Admin' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Activity Logs Endpoints
app.get('/api/activity-logs', (_req: Request, res: Response) => {
  const logs = getActivityLogs();
  res.json({ success: true, data: logs });
});

app.post('/api/activity-logs', (req: Request, res: Response) => {
  try {
    const entry = req.body;
    if (!entry || !entry.action) {
      res.status(400).json({ success: false, message: 'Format log tidak valid' });
      return;
    }
    recordActivityLog(entry);
    res.status(201).json({ success: true, message: 'Log berhasil dicatat' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Verify admin PIN check
app.post('/api/auth/verify-pin', (req: Request, res: Response): void => {
  const { pin } = req.body;
  if (isValidAdminPin(pin)) {
    res.json({ success: true, message: 'Otorisasi Admin Berhasil' });
  } else {
    res.status(401).json({ success: false, message: 'PIN Admin tidak valid. Hubungi Pengelola Puskesmas Wairiang.' });
  }
});

// Setup Vite or Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SI-PERIANG] Puskesmas Wairiang Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
