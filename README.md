# lkpd-masw

Mesin dokumen **LKPD (Lembar Kerja Peserta Didik) berbasis Kurikulum Berbasis Cinta** untuk MTs dan MA Syubbanul Wathon, Tegalrejo. Dipakai oleh skill Gemini `lkpd-kbc-masw`.

Gemini cukup menulis data isi (`window.LKPD` berisi `konfig`, `siswa`, dan `guru`, sekitar 10–15 KB). Mesin di repo ini:
- merender **LKPD Peserta Didik** dan **Panduan Guru** pada halaman A4 dengan pembagian halaman otomatis;
- menyediakan toolbar: Tampilan (Lengkap / Siswa / Guru), Rapikan Halaman, Unduh Word (.docx), Unduh PDF (tanpa dialog cetak, berfungsi di Canvas);
- tanpa kop surat; memasang nama madrasah (MA/MTs) dan identitas kepala madrasah otomatis;
- palet warna: utama `#0B2B2A`, latar lembut `#DCE7DF`, aksen `#B89146`, teks `#182322`;
- memeriksa otomatis: kecocokan fase, Tema KBC Panca Cinta, materi insersi, alur FIDS/ARKA/MMM, frasa nilai cinta pada TP, soal HOTS, refleksi Panca Cinta, tadabbur untuk mapel PAI/Arab, rubrik Sikap/Adab & Nilai Cinta, kunci terpisah, dan isi yang melebihi halaman.

## Isi repo

| Path | Fungsi |
|---|---|
| `mesin/mesin-lkpd.js` | Mesin v1.0.0 |
| `uji/Uji_Cepat_Canvas_LKPD.html` | Dokumen contoh untuk diuji di Canvas |

## Alamat mesin yang dipakai skill

- Utama (versi dikunci): `https://cdn.jsdelivr.net/gh/muflihan-ak/lkpd-masw@v1.0.0/mesin/mesin-lkpd.js`
- Cadangan (GitHub Pages): `https://muflihan-ak.github.io/lkpd-masw/mesin/mesin-lkpd.js`

## Ketentuan

- Repo **Public** (syarat jsDelivr). **Dilarang** menaruh data pribadi siswa/guru di repo ini.
- Setiap perubahan mesin dirilis dengan **tag versi baru** (mis. `v1.0.1`), lalu alamat di skill diperbarui. Tag yang sudah dirilis jangan diubah.
- Hanya pengelola (Kepala Madrasah/tim TI) yang memiliki akses tulis.
