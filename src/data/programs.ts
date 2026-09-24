import { BidangDefinition, BidangType, IndikatorDefinition, ProgramDefinition } from '../types';

export const BIDANG_LIST: BidangDefinition[] = [
  {
    id: 'Kesmas',
    name: 'Bidang Kesmas',
    fullName: 'Kesehatan Masyarakat',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    programs: [
      {
        id: 'kia',
        name: 'Program KIA (Kesehatan Ibu & Anak)',
        bidang: 'Kesmas',
        indikatorList: [
          { id: 'f1-f8-kesga', name: 'F1-F8 Kesga', satuan: 'Laporan Form', keterangan: 'Format rekapitulasi kesehatan keluarga F1 hingga F8' },
          { id: 'pws-kia', name: 'PWS KIA', satuan: 'Grafik / Dokumen', keterangan: 'Pemantauan Wilayah Setempat KIA bulanan' },
          { id: 'anak', name: 'Anak', satuan: 'Sasaran Anak', keterangan: 'Pelayanan kesehatan neonatal, bayi, dan balita' },
          { id: 'ibu', name: 'Ibu', satuan: 'Sasaran Ibu', keterangan: 'Pelayanan persalinan, nifas, dan ibu menyusui' },
          { id: '7h7-center', name: 'Ibu Hamil Baru (7H7) Center', satuan: 'Bumil Baru', keterangan: 'Penjaringan dan pendataan ibu hamil baru 7H7 center' },
          { id: 'kb', name: 'Keluarga Berencana', satuan: 'Akseptor KB', keterangan: 'Capaian peserta KB aktif dan KB pasca persalinan' },
          { id: 'lansia', name: 'Lansia', satuan: 'Sasaran Lansia', keterangan: 'Pelayanan kesehatan usia lanjut & Posyandu Lansia' },
          { id: 'remaja', name: 'Remaja', satuan: 'Sasaran Remaja', keterangan: 'Pelayanan kesehatan peduli remaja (PKPR)' },
        ],
      },
      {
        id: 'gizi',
        name: 'Program Gizi',
        bidang: 'Kesmas',
        indikatorList: [
          { id: 'f3-gizi', name: 'F3 Gizi', satuan: 'Laporan F3', keterangan: 'Formulir pelaporan berkala gizi masyarakat' },
          { id: 'kohor-gizi-buruk', name: 'Kohor Gizi Buruk', satuan: 'Balita', keterangan: 'Pemantauan kohor balita gizi buruk dan tata laksana gizi' },
          { id: 'bumil-kek', name: 'Bumil KEK', satuan: 'Bumil', keterangan: 'Ibu hamil kurang energi kronis dan pemberian PMT' },
          { id: '2t', name: '2T (Tidak Naik Timbangan 2 Kali)', satuan: 'Balita', keterangan: 'Kasus balita berat badan tidak naik 2 kali berturut-turut' },
          { id: 'bbu-bbtb', name: 'BBU/BBTB', satuan: 'Sasaran Balita', keterangan: 'Hasil pengukuran BB menurut Umur & BB menurut TB' },
        ],
      },
      {
        id: 'promkes',
        name: 'Program Promkes (Promosi Kesehatan)',
        bidang: 'Kesmas',
        indikatorList: [
          { id: 'rts', name: 'RTS (Rumah Tangga Sehat)', satuan: 'KK / Rumah Tangga', keterangan: 'Pembinaan PHBS tatanan rumah tangga sehat' },
          { id: 'desa-siaga', name: 'Desa Siaga', satuan: 'Desa', keterangan: 'Tingkat perkembangan Desa Siaga Aktif' },
          { id: 'kemandirian-posyandu', name: 'Kemandirian Posyandu', satuan: 'Posyandu', keterangan: 'Tingkat strata kemandirian posyandu (Pratama/Madya/Purnama/Mandiri)' },
          { id: 'toga', name: 'Toga (Tanaman Obat Keluarga)', satuan: 'Kelompok Toga', keterangan: 'Pemanfaatan pekarangan dan tanaman obat keluarga' },
          { id: 'penyuluhan', name: 'Penyuluhan', satuan: 'Sesi Kegiatan', keterangan: 'Penyuluhan kelompok dan masyarakat luar/dalam gedung' },
          { id: 'kegiatan-poskesdes', name: 'Kegiatan Poskesdes', satuan: 'Laporan Kegiatan', keterangan: 'Pelaksanaan dan rekap kegiatan pos kesehatan desa' },
        ],
      },
      {
        id: 'uks',
        name: 'Program UKS (Usaha Kesehatan Sekolah)',
        bidang: 'Kesmas',
        indikatorList: [
          { id: 'penjaringan', name: 'Penjaringan Peserta Didik', satuan: 'Siswa / Sekolah', keterangan: 'Screening kesehatan peserta didik baru (SD/SMP/SMA)' },
          { id: 'pemeriksaan-berkala', name: 'Pemeriksaan Berkala', satuan: 'Siswa', keterangan: 'Pemeriksaan kesehatan berkala berkala siswa sekolah' },
          { id: 'pelayanan-gigi-mulut', name: 'Pelayanan Kesehatan Gigi Mulut', satuan: 'Siswa / Kasus', keterangan: 'Pemeriksaan gigi dan mulut di institusi pendidikan' },
        ],
      },
      {
        id: 'kesling-kesjaor',
        name: 'Program Kesling Kesjaor',
        bidang: 'Kesmas',
        indikatorList: [
          { id: 'kesling', name: 'Kesling (Kesehatan Lingkungan)', satuan: 'Inspeksi Sarana', keterangan: 'Inspeksi sanitasi lingkungan, air bersih, jamban sehat' },
          { id: 'kesjaor', name: 'Kesjaor (Kesehatan Kerja & Olahraga)', satuan: 'Pekerja / Kelompok', keterangan: 'Pos UKK dan pembinaan kebugaran jasmani / olahraga' },
          { id: 'limbah', name: 'Limbah', satuan: 'Kg / Manifest', keterangan: 'Pengelolaan dan pembuangan limbah medis B3 & domestik' },
        ],
      },
    ],
  },
  {
    id: 'SDK',
    name: 'Bidang SDK',
    fullName: 'Sumber Daya Kesehatan',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    programs: [
      {
        id: 'farmasi',
        name: 'Program Farmasi',
        bidang: 'SDK',
        indikatorList: [
          { id: 'pemakaian-permintaan-obat', name: 'Pemakaian dan Permintaan Obat', satuan: 'Form LPLPO / Item', keterangan: 'Laporan Pemakaian dan Lembar Permintaan Obat (LPLPO)' },
        ],
      },
    ],
  },
  {
    id: 'Yankes',
    name: 'Bidang Yankes',
    fullName: 'Pelayanan Kesehatan',
    color: 'teal',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    programs: [
      {
        id: 'pelayanan-kesehatan',
        name: 'Program Pelayanan Kesehatan',
        bidang: 'Yankes',
        indikatorList: [
          { id: 'lb1', name: 'L.B1 (Data Kesakitan)', satuan: 'Kasus Diagnosa', keterangan: 'Laporan bulanan data kesakitan dan ICD-10' },
          { id: 'lb3', name: 'L.B3 (GIZI KIA)', satuan: 'Dokumen Rekap', keterangan: 'Laporan bulanan keterpaduan gizi dan KIA' },
          { id: 'lb4', name: 'L.B4 (Data Kunjungan)', satuan: 'Kunjungan Pasien', keterangan: 'Data kunjungan pasien rawat jalan, poli, dan puskesmas' },
          { id: 'gigi-mulut', name: 'Gigi dan Mulut', satuan: 'Tindakan / Pasien', keterangan: 'Pelayanan poli gigi dan kesehatan mulut' },
          { id: 'rawat-inap', name: 'Rawat Inap', satuan: 'Pasien / BOR', keterangan: 'Laporan tempat tidur, rawat inap, dan hari perawatan' },
          { id: 'rawat-jalan', name: 'Rawat Jalan', satuan: 'Kunjungan Pasien', keterangan: 'Rekapitulasi pasien rawat jalan antar poli' },
          { id: '10-penyakit', name: '10 Penyakit Terbesar', satuan: 'Ranking Kasus', keterangan: 'Daftar tren 10 besar pola penyakit bulanan' },
          { id: 'kematian', name: 'Kematian', satuan: 'Jiwa / Kasus', keterangan: 'Laporan data mortalitas/kematian (umum, maternal, neonatal)' },
          { id: 'prolanis', name: 'Prolanis', satuan: 'Peserta', keterangan: 'Program Pengelolaan Penyakit Kronis (Hipertensi & DM)' },
        ],
      },
    ],
  },
  {
    id: 'P2P',
    name: 'Bidang P2P',
    fullName: 'Pencegahan & Pengendalian Penyakit',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    programs: [
      {
        id: 'p2pm',
        name: 'Program P2PM (Penyakit Menular)',
        bidang: 'P2P',
        indikatorList: [
          { id: 'malaria', name: 'Malaria', satuan: 'Kasus / Tes RDT', keterangan: 'Pemeriksaan RDT/Mikroskopis & kasus positif malaria' },
          { id: 'ispa', name: 'ISPA', satuan: 'Kasus / Balita', keterangan: 'Penemuan dan tatalaksana pneumonia / ISPA' },
          { id: 'tbc', name: 'TBC', satuan: 'Suspek / Kasus TCM', keterangan: 'Penemuan suspek TBC, TCM, dan pengobatan OAT' },
          { id: 'rabies', name: 'Rabies', satuan: 'Kasus GHPR / VAR', keterangan: 'Gigitan Hewan Penular Rabies & pemberian VAR' },
          { id: 'hiv-ims', name: 'HIV/IMS', satuan: 'Tes Skrining', keterangan: 'Pemeriksaan tes HIV, konseling, dan IMS' },
          { id: 'kusta', name: 'Kusta', satuan: 'Penderita Baru / RFT', keterangan: 'Penemuan kasus kusta baru dan penuntasan MDT' },
          { id: 'frambusia', name: 'Frambusia', satuan: 'Kasus Koreng', keterangan: 'Surveilans dan penemuan kasus frambusia' },
          { id: 'fillaria', name: 'Fillaria', satuan: 'Sasaran POMP', keterangan: 'Kasus filariasis dan program pencegahan' },
          { id: 'odgj', name: 'ODGJ (Kesehatan Jiwa)', satuan: 'Pasien ODGJ', keterangan: 'Pelayanan orang dengan gangguan jiwa berat & bebas pasung' },
        ],
      },
      {
        id: 'surveilance',
        name: 'Program Surveilance',
        bidang: 'P2P',
        indikatorList: [
          { id: 'stp', name: 'STP (Surveilans Terpadu Penyakit)', satuan: 'Laporan Mingguan / Bulanan', keterangan: 'Laporan STP rawat jalan, rawat inap, dan potensi wabah' },
          { id: 'p2-diare', name: 'P2 Diare', satuan: 'Kasus / Oralit Zinc', keterangan: 'Tatalaksana penderita diare balita dan oralit zinc' },
          { id: 'aip-campak', name: 'AIP/Campak', satuan: 'Suspek Kasus', keterangan: 'Surveilans AFP (Acute Flaccid Paralysis) dan suspek Campak' },
          { id: 'imunisasi', name: 'Imunisasi', satuan: 'Sasaran Bayi / Baduta', keterangan: 'Capaian Imunisasi Dasar Lengkap (IDL) & lanjutan' },
        ],
      },
      {
        id: 'ptm',
        name: 'Program PTM (Penyakit Tidak Menular)',
        bidang: 'P2P',
        indikatorList: [
          { id: 'fktp', name: 'FKTP', satuan: 'Kasus Skrining', keterangan: 'Skrining dan tata laksana PTM di fasilitas kesehatan' },
          { id: 'posbindu', name: 'Posbindu', satuan: 'Peserta / Posbindu', keterangan: 'Pelaksanaan Pos Pembinaan Terpadu PTM masyarakat' },
        ],
      },
    ],
  },
  {
    id: 'UP',
    name: 'Bidang UP',
    fullName: 'Tata Usaha / Umum & Kepegawaian',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    programs: [
      {
        id: 'up-kepegawaian',
        name: 'Program Tata Usaha & Kepegawaian',
        bidang: 'UP',
        indikatorList: [
          { id: 'absensi', name: 'Absensi', satuan: 'Rekap Kehadiran / Staf', keterangan: 'Laporan kehadiran, disiplin apel, dan absensi pegawai' },
        ],
      },
    ],
  },
];

export const BULAN_LIST = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const TAHUN_LIST = [2026, 2025, 2024];

export function getBidangById(bidangId: BidangType): BidangDefinition | undefined {
  return BIDANG_LIST.find((b) => b.id === bidangId);
}

export function getProgramsByBidang(bidangId: BidangType): ProgramDefinition[] {
  const bidang = getBidangById(bidangId);
  return bidang ? bidang.programs : [];
}

export function getIndikatorsByProgram(bidangId: BidangType, programName: string): IndikatorDefinition[] {
  const programs = getProgramsByBidang(bidangId);
  const prog = programs.find((p) => p.name === programName || p.id === programName);
  return prog ? prog.indikatorList : [];
}
