export type BidangType = 'Kesmas' | 'SDK' | 'Yankes' | 'P2P' | 'UP';

export type RecordType = 'laporan' | 'capaian';

export type PeriodeTipe = 'bulanan' | 'tribulanan' | 'semester' | 'tahunan';

export type ValidationStatus = 'menunggu_verifikasi' | 'diverifikasi' | 'revisi' | 'menunggu' | 'valid';

export function getStatusLabel(status: ValidationStatus): string {
  if (status === 'diverifikasi' || status === 'valid') return 'Diverifikasi';
  if (status === 'revisi') return 'Perlu Revisi';
  return 'Menunggu Verifikasi Admin';
}

export type FileCategory = 'pdf' | 'excel' | 'word' | 'image' | 'other';

export interface IndikatorDefinition {
  id: string;
  name: string;
  satuan?: string;
  keterangan?: string;
}

export interface ProgramDefinition {
  id: string;
  name: string;
  bidang: BidangType;
  indikatorList: IndikatorDefinition[];
}

export interface BidangDefinition {
  id: BidangType;
  name: string;
  fullName: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  programs: ProgramDefinition[];
}

export interface RecordItem {
  id: string;
  type: RecordType;
  bidang: BidangType;
  program: string;
  indikator: string;
  periodeTipe?: PeriodeTipe;
  periodeBulan: string;
  periodeTahun: number;
  periodeNama?: string;
  pjNama: string;
  pjNip?: string;
  pjKontak?: string;
  target?: number;
  realisasi?: number;
  persentase?: number;
  satuan?: string;
  keterangan?: string;
  analisisMasalah?: string;
  rencanaTindakLanjut?: string;
  fileName: string;
  fileOriginalName: string;
  fileType: FileCategory;
  fileSize: number;
  fileUrl: string;
  fileData?: string; // base64 representation if stored client-side
  uploadedAt: string;
  status: ValidationStatus;
  validatedBy?: string;
  validatedAt?: string;
  adminNotes?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveWebContentLink?: string;
  driveFolderId?: string;
  driveFolderName?: string;
  driveSyncedAt?: string;
}

export interface FilterState {
  search: string;
  type: 'all' | RecordType;
  bidang: 'all' | BidangType;
  program: string;
  status: 'all' | ValidationStatus;
  bulan: string;
  tahun: string;
}

export type ActivityActionType = 'upload' | 'verify' | 'revisi' | 'delete';

export interface ActivityLogItem {
  id: string;
  action: ActivityActionType;
  actionLabel: string;
  targetId: string;
  targetTitle: string;
  program: string;
  bidang: BidangType;
  recordType: RecordType;
  actor: string;
  actorRole: 'pj' | 'admin' | 'system';
  timestamp: string; // ISO 8601 string
  fileName?: string;
  fileSize?: number;
  details?: string;
  statusBefore?: ValidationStatus;
  statusAfter?: ValidationStatus;
}
