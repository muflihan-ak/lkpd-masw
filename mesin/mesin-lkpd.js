/*!
 * Mesin LKPD Madrasah Syubbanul Wathon (MTs & MA) — Kurikulum Berbasis Cinta
 * Versi 1.0.0 · https://github.com/muflihan-ak/lkpd-masw
 * Merender LKPD Peserta Didik + Panduan Guru (A4, halaman otomatis) dari window.LKPD yang ditulis Gemini.
 * Fitur: toolbar (Tampilan, Rapikan Halaman, Unduh Word .docx, Unduh PDF tanpa dialog cetak),
 * LKPD tanpa kop surat, teks dapat diedit, pemeriksaan otomatis KBC (SK Dirjen Pendis 6077/2025, KMA 1503/2025).
 * Repo ini TIDAK memuat data pribadi peserta didik.
 */
(function () {
"use strict";
if (window.__MESIN_LKPD_SW__) return; window.__MESIN_LKPD_SW__ = true;
const VERSI = "1.0.0";
const SRC = (document.currentScript && document.currentScript.src) || "";
const BASE = SRC ? SRC.replace(/mesin\/mesin-lkpd(\.min)?\.js.*$/, "") : "https://cdn.jsdelivr.net/gh/muflihan-ak/lkpd-masw@v1.0.0/";

/* ===================== KONSTANTA ===================== */
const MADRASAH = {
  MA: { nama: "MA Syubbanul Wathon", panjang: "Madrasah Aliyah Syubbanul Wathon", tempat: "Tegalrejo",
        kepala: "Muflihan Ahmad Kundriasworo, S.Si., Gr.", nipyKepala: "",
        fase: ["E", "F"] },
  MTs: { nama: "MTs Syubbanul Wathon", panjang: "Madrasah Tsanawiyah Syubbanul Wathon", tempat: "Tegalrejo",
        kepala: "Achmad Jamari, S.Pd.I., Gr.", nipyKepala: "0103101",
        fase: ["D"] }
};
const PANCA = ["Cinta Allah dan Rasul-Nya", "Cinta Ilmu", "Cinta Lingkungan", "Cinta Diri dan Sesama", "Cinta Tanah Air"];
const DIMENSI = ["Keimanan dan Ketakwaan kepada Tuhan YME", "Kewargaan", "Penalaran Kritis", "Kreativitas", "Kolaborasi", "Kemandirian", "Kesehatan", "Komunikasi"];
const ALUR = {
  FIDS: { nama: "FIDS (Feel–Imagine–Do–Share)", tahap: { feel: "Merasakan", imagine: "Membayangkan", do: "Melakukan", share: "Berbagi" } },
  ARKA: { nama: "ARKA (Aktivitas–Refleksi–Konsep–Aplikasi)", tahap: { aktivitas: "Mengalami", refleksi: "Merenungkan", konsep: "Memahami konsep", aplikasi: "Menerapkan" } },
  MMM: { nama: "Memahami–Mengaplikasi–Merefleksi", tahap: { memahami: "Pembelajaran Mendalam", mengaplikasi: "Pembelajaran Mendalam", merefleksi: "Pembelajaran Mendalam" } }
};
const SUMBER_CP = {
  PAI_ARAB: "Keputusan Dirjen Pendis Nomor 9941 Tahun 2025 tentang CP PAI dan Bahasa Arab pada Madrasah",
  UMUM: "Lampiran II Keputusan Kepala BSKAP Nomor 046/H/KR/2025 tentang Capaian Pembelajaran"
};
const HURUF = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MM = 96 / 25.4;
const AR_RE = /[؀-ۿ]/;

/* ===================== CSS ===================== */
const CSS = `
:root{--h:#0B2B2A;--h2:#DCE7DF;--h3:#C5D5CA;--h4:#EEF3EF;--e:#B89146;--e2:#F1E9D8;--e3:#F7F2E8;--t:#182322;--abu:#5E6A68;--garis:#9AA5A2}
body{margin:0;background:#E3EAE5}
#lk-app{font-family:"Segoe UI",Arial,"Liberation Sans",Helvetica,sans-serif;color:var(--t)}
#lk-bar{position:sticky;top:0;z-index:20;background:var(--h);color:#fff;padding:8px 12px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;box-shadow:0 2px 6px rgba(0,0,0,.25)}
#lk-bar .judul{font-weight:700;margin-right:8px;font-size:14px}
#lk-bar button,#lk-bar label.btn,#lk-bar select{background:#fff;color:var(--h);border:0;border-radius:6px;padding:7px 11px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
#lk-bar button.utama{background:var(--e);color:var(--t)}
#lk-bar input[type=file]{display:none}
#lk-status{font-size:12.5px;padding:7px 14px;background:var(--h2);color:var(--h);border-bottom:1px solid var(--h3);font-family:"Segoe UI",Arial,sans-serif}
#lk-status.warn{background:#F7F2E8;color:#5E4A1E;border-color:#E3D3B2}
#lk-status .info{color:var(--t);opacity:.85}
#lk-toast{position:fixed;right:16px;bottom:16px;max-width:420px;background:var(--t);color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;display:none;z-index:30;font-family:"Segoe UI",Arial,sans-serif}
#lk-toast a{color:var(--e);cursor:pointer;text-decoration:underline}
#lk-doc{padding:18px 0 40px}
.lk-page{width:210mm;height:297mm;box-sizing:border-box;margin:0 auto 16px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.18);position:relative;overflow:hidden;padding:14mm 17mm 12mm 17mm;display:flex;flex-direction:column;font-size:11pt;line-height:1.42}
.lk-page.sembunyi{display:none}
.lk-rh{display:flex;justify-content:space-between;align-items:flex-end;font-size:8.5pt;color:var(--abu);border-bottom:1.2pt solid var(--h);padding-bottom:1.5mm;margin-bottom:4mm;height:6mm;flex:none}
.lk-rh b{color:var(--h)}
.lk-body{flex:1 1 auto;overflow:hidden;outline:none}
.lk-ft{flex:none;height:7mm;display:flex;justify-content:space-between;align-items:flex-end;font-size:8.5pt;color:var(--abu);border-top:.6pt solid #c9c9c9;padding-top:1.5mm;margin-top:2mm}
.blk{margin:0 0 3.2mm}
.lk-page.pertama .lk-rh{visibility:hidden;height:0;margin:0;padding:0;border:0}
.band{border:1.4pt solid var(--h);border-radius:3mm;overflow:hidden}
.band .atas{background:var(--h);color:#fff;padding:2.6mm 4mm 2.8mm}
.band .label{font-size:8.5pt;letter-spacing:2.2px;font-weight:700;opacity:.92}
.band .jdl{font-size:17pt;font-weight:800;line-height:1.18;margin-top:.8mm}
.band .sub{font-size:10pt;margin-top:.8mm;opacity:.95}
.band .info{display:flex;flex-wrap:wrap;gap:1.6mm 5mm;padding:2.4mm 4mm;background:var(--h2);font-size:9.5pt}
.band .info span b{color:var(--h)}
.band.guru .atas{background:var(--h);border-bottom:1.6mm solid var(--e)}
.band.guru .label{color:var(--e);opacity:1}
.band.guru{border-color:var(--e)}
.band.guru .info{background:var(--e2)}
.chips{display:flex;flex-wrap:wrap;gap:1.6mm;align-items:center;font-size:9pt}
.chip{border:1pt solid var(--h);color:var(--h);border-radius:10mm;padding:.5mm 2.8mm;font-weight:700;background:#fff}
.chips .lbl{font-weight:700;color:var(--abu);margin-right:1mm}
.ident{display:grid;grid-template-columns:1fr 1fr;gap:0 6mm;border:1pt solid var(--garis);border-radius:2mm;padding:2mm 4mm 2.5mm;font-size:10.5pt}
.ident .f{display:flex;align-items:flex-end;gap:2mm;height:8.5mm}
.ident .f span{white-space:nowrap}
.ident .f i{flex:1;border-bottom:1pt dotted #777;height:5mm;font-style:normal}
.ident .ang{grid-column:1/3;margin-top:2.5mm}
.ident .ang ol{margin:1mm 0 0;padding-left:6mm;columns:2;column-gap:8mm}
.ident .ang li{height:7.5mm;border-bottom:1pt dotted #777;margin-right:2mm}
.sec{display:flex;align-items:center;gap:2.6mm;margin:4.5mm 0 2.2mm;font-size:12.5pt;font-weight:800;color:var(--h)}
.sec .no{display:inline-flex;align-items:center;justify-content:center;min-width:7mm;height:7mm;border-radius:2mm;background:var(--h);color:#fff;font-size:11pt}
.sec .t{border-bottom:1.2pt solid var(--h3);flex:1;padding-bottom:.6mm}
.guru-mode .sec{color:var(--h)}.guru-mode .sec .no{background:var(--e);color:var(--t)}.guru-mode .sec .t{border-color:#E3D3B2}
.blk p{margin:0 0 1.6mm}
.blk ol,.blk ul{margin:0 0 1mm;padding-left:6.5mm}
.blk li{margin:0 0 1mm}
.kotak-info{border-left:2.4mm solid var(--h);background:var(--h2);padding:2.4mm 3.6mm;border-radius:0 2mm 2mm 0}
.kotak-misi{border:1.4pt dashed var(--h);border-radius:2.5mm;padding:2.6mm 4mm;background:#fff}
.kotak-misi .lbl{font-size:8.5pt;font-weight:800;letter-spacing:1.5px;color:var(--h)}
.kotak-misi .isi{font-size:12pt;font-weight:700;margin-top:.6mm}
.tadabbur{border:1pt solid var(--h3);border-radius:2.5mm;padding:2.4mm 4mm;background:var(--h4)}
.arab,[lang=ar]{font-family:"Traditional Arabic","Amiri","Scheherazade New","Noto Naskh Arabic","Arabic Typesetting","Arial",serif;font-size:19pt;line-height:1.9;direction:rtl;text-align:right}
p.arab{margin:0 0 1mm}
.terjemah{font-style:italic}
.sumber{font-size:9pt;color:var(--abu)}
.cek{font-size:8.5pt;color:var(--t);background:var(--e2);border:1pt solid var(--e);border-radius:1.5mm;padding:.4mm 2mm;display:inline-block;margin-top:1mm}
.tahap{border:1pt solid var(--h3);border-radius:2.5mm;overflow:hidden}
.tahap .kepala{display:flex;align-items:center;gap:3mm;background:var(--h2);padding:1.8mm 3.6mm;border-bottom:1pt solid var(--h3)}
.tahap .badge{background:var(--h);color:#fff;font-weight:800;font-size:9pt;letter-spacing:1px;border-radius:1.5mm;padding:.6mm 2.4mm;text-transform:uppercase}
.tahap .nm{font-weight:800;font-size:11.5pt}
.tahap .ket{margin-left:auto;font-size:8.5pt;color:var(--abu)}
.tahap .isi{padding:2.2mm 3.6mm 1mm}
.lanjut{font-size:9pt;color:var(--abu);font-style:italic;margin:0 0 1.5mm}
.garis{margin:.5mm 0 1mm}
.garis .g{height:8mm;border-bottom:1pt dotted #8a8a8a}
.garis .lbl{font-size:9.5pt;font-weight:700;color:var(--abu)}
.kotak{border:1pt solid var(--garis);border-radius:2mm;position:relative}
.kotak .lbl{position:absolute;top:1.2mm;left:2.5mm;font-size:8.5pt;color:var(--abu)}
table.t{width:100%;border-collapse:collapse;font-size:10pt;table-layout:fixed}
table.t th,table.t td{border:1pt solid #8f8f8f;padding:1.4mm 2mm;vertical-align:top;word-wrap:break-word}
table.t th{background:var(--h2);color:var(--h);font-weight:700;text-align:center}
.guru-mode table.t th{background:var(--e2);color:var(--t)}
table.t td.c{text-align:center}
table.t.isian td{height:8.5mm}
table.t.kv td:first-child{width:33%;font-weight:700;background:var(--h4)}
.soal{display:flex;gap:2mm;align-items:baseline}
.soal .n{font-weight:700;min-width:5mm}
.soal .q{flex:1}
.lvl{font-size:7.5pt;font-weight:800;border:1pt solid var(--garis);border-radius:1mm;padding:0 1.2mm;color:var(--abu);white-space:nowrap;margin-left:1.5mm}
.lvl.hots{border-color:var(--e);background:var(--e2);color:var(--t)}
.soal-wrap .garis{margin-left:7mm}
.centang{display:flex;flex-wrap:wrap;gap:1.5mm 6mm}
.centang span:before{content:"";display:inline-block;width:3.6mm;height:3.6mm;border:1pt solid #555;margin-right:1.6mm;vertical-align:-0.6mm;border-radius:.6mm}
.bantuan{border:1pt solid var(--h3);background:var(--h4);border-radius:2.5mm;padding:2mm 3.6mm}
.bantuan .lbl{font-weight:800;color:var(--h);font-size:9.5pt}
.tantangan{border:1.2pt solid var(--e);background:var(--e3);border-radius:2.5mm;padding:2mm 3.6mm}
.tantangan .lbl{font-weight:800;color:var(--t);font-size:9.5pt}
.skala th.sk{width:15mm;font-size:8.5pt}
.skala td.sk{text-align:center}
.ttd{display:grid;grid-template-columns:1fr 1fr;gap:10mm;margin-top:6mm;font-size:10.5pt}
.ttd .nm{margin-top:18mm;font-weight:700;text-decoration:underline}
.catatan-kaki{font-size:8.5pt;color:var(--abu);border-top:.6pt solid #ccc;padding-top:1.5mm}
.lk-body [contenteditable]:focus,.lk-body:focus{outline:none}
@media print{body{background:#fff}#lk-bar,#lk-status,#lk-toast{display:none!important}#lk-doc{padding:0}.lk-page{margin:0;box-shadow:none;page-break-after:always}.lk-page.sembunyi{display:none}@page{size:A4;margin:0}}
@media screen and (max-width:820px){.lk-page{transform-origin:top left}}
`;

/* ===================== UTIL ===================== */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const arr = x => (x === undefined || x === null) ? [] : [].concat(x);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const T = (v, nama) => (v === undefined || v === null || String(v).trim() === "") ? `{{belum diisi: ${nama}}}` : String(v);
const norm = s => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
function tandaiArab(html) {
  // bungkus teks Arab polos yang tidak berada di dalam elemen ber-lang="ar"
  if (!AR_RE.test(html) || /lang=["']ar/.test(html)) return html;
  return html.replace(/([؀-ۿ][؀-ۿً-ٰٟ\s،؛؟.!:()ۖ-ۭ0-9]*[؀-ۿً-ٰٟ)])/g, '<span lang="ar" dir="rtl" class="arab">$1</span>');
}
function toast(html, ms) { const t = $("#lk-toast"); t.innerHTML = html; t.style.display = "block"; clearTimeout(t._t); t._t = setTimeout(() => t.style.display = "none", ms || 8000); }
function bacaFile(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); }

/* ===================== DATA ===================== */
let K = {}, S = {}, G = {}, M = MADRASAH.MA, MODE = "semua";
function siapkanData() {
  const D = window.LKPD || {};
  K = Object.assign({ madrasah: "MA", kelompok: "UMUM", tahunAjaran: "2026/2027", semester: "Ganjil", bentuk: "Kelompok", alur: "MMM", jumlahAnggota: 4 }, D.konfig || {});
  K.madrasah = /mts/i.test(K.madrasah) ? "MTs" : "MA";
  K.kelompok = /pai|arab/i.test(K.kelompok) ? "PAI_ARAB" : "UMUM";
  K.alur = String(K.alur || "MMM").toUpperCase(); if (!ALUR[K.alur]) K.alur = "MMM";
  K.temaKBC = arr(K.temaKBC);
  M = MADRASAH[K.madrasah];
  S = D.siswa || {}; G = D.guru || {};
}
function namaTahap(t) {
  const k = norm(t), al = ALUR[K.alur].tahap;
  for (const a of Object.keys(ALUR)) for (const x of Object.keys(ALUR[a].tahap)) if (k === x) return { kode: t, ket: ALUR[a].tahap[x] };
  return { kode: t || "Tahap", ket: "" };
}

/* ===================== PEMBANGUN BLOK ===================== */
function blk(html, cls, opt) { const b = el("div", "blk" + (cls ? " " + cls : ""), html); if (opt && opt.keep) b.dataset.keep = "1"; if (opt && opt.split) b.dataset.split = opt.split; return b; }
function sec(no, judul) { return blk(`<div class="sec"><span class="no">${no}</span><span class="t">${judul}</span></div>`, "", { keep: 1 }); }
function garisHTML(n, lbl) { n = Math.max(1, Math.min(+n || 3, 30)); let h = lbl ? `<div class="lbl">${lbl}</div>` : ""; for (let i = 0; i < n; i++) h += '<div class="g"></div>'; return `<div class="garis" data-split="garis">${h}</div>`; }
function tabelHTML(kolom, baris, opt) {
  opt = opt || {}; kolom = arr(kolom); if (!kolom.length) kolom = ["No", "Data/Pengamatan", "Keterangan"];
  const lebar = arr(opt.lebar);
  let h = `<table class="t isian${opt.cls ? " " + opt.cls : ""}"><colgroup>${kolom.map((k, i) => `<col${lebar[i] ? ` style="width:${lebar[i]}"` : (/^no\.?$/i.test(k) ? ' style="width:10mm"' : "")}>`).join("")}</colgroup><thead><tr>${kolom.map(k => `<th>${k}</th>`).join("")}</tr></thead><tbody>`;
  const isi = arr(opt.isi);
  const n = Math.max(+baris || 0, isi.length || 0) || 4;
  for (let r = 0; r < n; r++) {
    const row = isi[r] !== undefined ? arr(isi[r]) : [];
    h += "<tr>" + kolom.map((k, c) => {
      let v = row[c];
      if (v === undefined && c === 0 && /^no\.?$/i.test(kolom[0])) v = r + 1;
      return `<td${(c === 0 && /^no\.?$/i.test(kolom[0])) ? ' class="c"' : ""}>${v === undefined ? "" : v}</td>`;
    }).join("") + "</tr>";
  }
  return h + "</tbody></table>";
}
function ruangHTML(r) {
  r = r || {}; const j = norm(r.jenis);
  if (j === "tabel") return tabelHTML(r.kolom, r.baris, { isi: r.isi, lebar: r.lebar });
  if (j === "kotak") return `<div class="kotak" style="height:${Math.max(15, Math.min(+r.tinggi || 45, 200))}mm"><span class="lbl">${r.label || ""}</span></div>`;
  if (j === "centang") return `${r.label ? `<p><b>${r.label}</b></p>` : ""}<div class="centang">${arr(r.pilihan).map(p => `<span>${p}</span>`).join("")}</div>`;
  if (j === "teks") return tandaiArab(T(r.isi, "teks ruang"));
  return garisHTML(r.baris || 3, r.label);
}
function soalBlok(no, q) {
  q = typeof q === "string" ? { soal: q } : (q || {});
  const lv = String(q.level || "").toUpperCase(), hots = /C[456]/.test(lv);
  let h = `<div class="soal-wrap"><div class="soal"><span class="n">${no}.</span><span class="q">${tandaiArab(T(q.soal, "soal"))}${lv ? `<span class="lvl${hots ? " hots" : ""}">${hots ? "HOTS · " : ""}${lv}</span>` : ""}</span></div>`;
  h += q.ruang ? ruangHTML(q.ruang) : garisHTML(q.baris === 0 ? 1 : (q.baris || 3));
  return blk(h + "</div>");
}

function bangunSiswa() {
  const B = [], no = (() => { let i = 0; return () => HURUF[i++]; })();
  const tema = K.temaKBC.length ? K.temaKBC.map(t => `<span class="chip">♥ ${t}</span>`).join("") : '<span class="chip">{{belum diisi: Tema KBC}}</span>';
  const kelasTeks = `${K.kelas ? "Kelas " + K.kelas + " · " : ""}Fase ${T(K.fase, "fase")}`;
  B.push(blk(`<div class="band"><div class="atas"><div class="label">LEMBAR KERJA PESERTA DIDIK · ${esc(M.nama.toUpperCase())}</div>
    <div class="jdl">${T(K.judul, "judul LKPD")}</div>${K.subjudul ? `<div class="sub">${K.subjudul}</div>` : ""}</div>
    <div class="info"><span><b>Mapel:</b> ${T(K.mapel, "mapel")}</span><span><b>${kelasTeks}</b></span><span><b>Materi:</b> ${T(K.materiPokok, "materi pokok")}</span><span><b>Waktu:</b> ${T(K.alokasiWaktu, "alokasi waktu")}</span><span><b>Kegiatan:</b> ${esc(K.bentuk)}</span></div></div>`));
  B.push(blk(`<div class="chips"><span class="lbl">Tema Cinta:</span>${tema}</div>${K.materiInsersi ? `<p class="sumber" style="margin:1.2mm 0 0"><b>Materi Insersi:</b> ${K.materiInsersi}</p>` : ""}`));
  const kel = /kelompok/i.test(K.bentuk);
  const n = Math.max(2, Math.min(+K.jumlahAnggota || 4, 8));
  B.push(blk(`<div class="ident">${kel ? `<div class="f"><span>Nama Kelompok</span><i></i></div>` : `<div class="f"><span>Nama</span><i></i></div>`}<div class="f"><span>Kelas</span><i></i></div>
    <div class="f"><span>Hari/Tanggal</span><i></i></div><div class="f"><span>No. Absen</span><i></i></div>
    ${kel ? `<div class="ang"><span>Anggota kelompok:</span><ol>${"<li></li>".repeat(n)}</ol></div>` : ""}</div>`));
  // Tujuan
  B.push(sec(no(), "Tujuan Pembelajaran"));
  B.push(blk(`<p>Setelah kegiatan ini, kamu diharapkan mampu:</p><ol>${arr(S.tujuan).map(t => `<li>${T(t, "TP")}</li>`).join("") || "<li>{{belum diisi: tujuan}}</li>"}</ol>`));
  // Petunjuk
  B.push(sec(no(), "Petunjuk Belajar"));
  B.push(blk(`<div class="kotak-info"><ol style="margin:0">${(arr(S.petunjuk).length ? arr(S.petunjuk) : ["{{belum diisi: petunjuk}}"]).map(t => `<li>${t}</li>`).join("")}</ol></div>`));
  // Tadabbur
  if (S.tadabbur && (S.tadabbur.arab || S.tadabbur.terjemah || S.tadabbur.renungan)) {
    const d = S.tadabbur;
    B.push(sec(no(), d.judul || (K.kelompok === "PAI_ARAB" ? "Tadabbur" : "Renungan Nilai")));
    let h = '<div class="tadabbur">';
    if (d.arab) h += `<p class="arab" lang="ar" dir="rtl">${d.arab}</p>`;
    if (d.terjemah) h += `<p class="terjemah">“${d.terjemah}”</p>`;
    if (d.sumber) h += `<p class="sumber">(${d.sumber})</p>`;
    if (d.renungan) h += `<p>${tandaiArab(d.renungan)}</p>`;
    h += "</div>";
    B.push(blk(h));
  }
  // Stimulus
  if (S.stimulus) {
    const st = S.stimulus;
    B.push(sec(no(), st.judul ? "Ayo Amati: " + st.judul : "Ayo Amati"));
    B.push(blk(tandaiArab(T(st.teks, "teks stimulus"))));
    if (st.tabel) B.push(blk((st.tabel.judul ? `<p><b>${st.tabel.judul}</b></p>` : "") + tabelHTML(st.tabel.kolom, 0, { isi: st.tabel.baris, cls: "data" }), "", { split: "tabel" }));
    if (st.sumber) B.push(blk(`<p class="sumber">Sumber: ${st.sumber}</p>`));
  }
  // Misi
  if (S.misi) B.push(blk(`<div class="kotak-misi"><div class="lbl">MISI KITA HARI INI</div><div class="isi">${tandaiArab(S.misi)}</div></div>`));
  // Alat bahan
  if (arr(S.alatBahan).length) { B.push(sec(no(), "Alat, Bahan, dan Sumber Belajar")); B.push(blk(`<ul>${arr(S.alatBahan).map(a => `<li>${a}</li>`).join("")}</ul>`)); }
  // Kegiatan
  B.push(sec(no(), "Kegiatan Belajar · Alur " + ALUR[K.alur].nama));
  arr(S.kegiatan).forEach((kg, i) => {
    const t = namaTahap(kg.tahap);
    const kepala = `<div class="kepala"><span class="badge">${esc(t.kode)}</span><span class="nm">${T(kg.judul, "judul kegiatan")}</span>${t.ket ? `<span class="ket">${t.ket}</span>` : ""}</div>`;
    const ins = arr(kg.instruksi);
    B.push(blk(`<div class="tahap">${kepala}<div class="isi">${kg.pengantar ? `<p>${tandaiArab(kg.pengantar)}</p>` : ""}${ins.length ? `<ol>${ins.map(x => `<li>${tandaiArab(x)}</li>`).join("")}</ol>` : ""}</div></div>`, "", { keep: arr(kg.ruang).length ? 1 : 0 }));
    arr(kg.ruang).forEach(r => {
      if (norm(r.jenis) === "pertanyaan") arr(r.daftar).forEach((q, j) => B.push(soalBlok((i + 1) + "." + (j + 1), q)));
      else B.push(blk(ruangHTML(r), "", { split: norm(r.jenis) === "tabel" ? "tabel" : norm(r.jenis) === "kotak" ? "kotak" : (norm(r.jenis) === "garis" || !r.jenis ? "garis" : "") }));
    });
  });
  if (!arr(S.kegiatan).length) B.push(blk("<p>{{belum diisi: kegiatan}}</p>"));
  if (arr(S.bantuan).length) B.push(blk(`<div class="bantuan"><div class="lbl">💡 Butuh bantuan? Coba langkah ini</div><ul style="margin:.8mm 0 0">${arr(S.bantuan).map(x => `<li>${x}</li>`).join("")}</ul></div>`));
  // Analisis
  if (arr(S.analisis).length) {
    B.push(sec(no(), "Ayo Bernalar: Analisis dan Diskusi"));
    arr(S.analisis).forEach((q, i) => B.push(soalBlok(i + 1, q)));
  }
  // Kesimpulan
  if (S.kesimpulan) {
    B.push(sec(no(), "Kesimpulan"));
    const ks = typeof S.kesimpulan === "string" ? { prompt: S.kesimpulan } : S.kesimpulan;
    B.push(blk(`<p>${T(ks.prompt, "prompt kesimpulan")}</p>${garisHTML(ks.baris || 4)}`));
  }
  // Tantangan
  if (S.tantangan) {
    const tt = typeof S.tantangan === "string" ? { soal: S.tantangan } : S.tantangan;
    B.push(blk(`<div class="tantangan"><div class="lbl">🚀 Tantangan Tambahan (pengayaan)</div><p style="margin:.8mm 0 0">${tandaiArab(T(tt.soal, "soal tantangan"))}</p>${garisHTML(tt.baris || 3)}</div>`));
  }
  // Refleksi
  const rf = S.refleksi || {};
  B.push(sec(no(), "Refleksi Diri · Panca Cinta"));
  arr(rf.pertanyaan).forEach((q, i) => B.push(soalBlok(i + 1, typeof q === "string" ? { soal: q, baris: 2 } : q)));
  const sk = arr(rf.sikap);
  if (sk.length) {
    const kol = ["Selalu", "Sering", "Kadang", "Belum"];
    B.push(blk(`<p style="margin-bottom:1mm"><b>Beri tanda centang (✓) sesuai dirimu dengan jujur.</b></p><table class="t skala"><colgroup><col style="width:9mm"><col><col style="width:30mm">${kol.map(() => '<col style="width:14mm">').join("")}</colgroup><thead><tr><th>No</th><th>Pernyataan</th><th>Tema Cinta</th>${kol.map(k => `<th class="sk">${k}</th>`).join("")}</tr></thead><tbody>${sk.map((s, i) => { s = typeof s === "string" ? { pernyataan: s } : s; return `<tr><td class="c">${i + 1}</td><td>${T(s.pernyataan, "pernyataan sikap")}</td><td>${s.cinta || ""}</td>${kol.map(() => '<td class="sk"></td>').join("")}</tr>`; }).join("")}</tbody></table>`, "", { split: "tabel" }));
  }
  if (!arr(rf.pertanyaan).length && !sk.length) B.push(blk("<p>{{belum diisi: refleksi}}</p>"));
  B.push(blk(`<p style="text-align:center;font-weight:700;color:var(--h);margin-top:3mm">Selamat! Kamu telah belajar dengan penuh cinta. 🌿</p>`));
  return B;
}

function bangunGuru() {
  const B = []; let i = 0; const no = () => ++i;
  B.push(blk(`<div class="band guru"><div class="atas"><div class="label">PANDUAN GURU · TIDAK DIBAGIKAN KEPADA PESERTA DIDIK</div><div class="jdl">${T(K.judul, "judul LKPD")}</div></div>
   <div class="info"><span><b>Mapel:</b> ${T(K.mapel, "mapel")}</span><span><b>Fase/Kelas:</b> ${T(K.fase, "fase")}${K.kelas ? " / " + K.kelas : ""}</span><span><b>Semester:</b> ${esc(K.semester)}</span><span><b>Tahun Ajaran:</b> ${esc(K.tahunAjaran)}</span></div></div>`));
  B.push(sec(no(), "Identitas dan Rancangan"));
  const dim = arr(G.dimensiProfil);
  const rows = [["Madrasah", M.panjang], ["Mata Pelajaran", T(K.mapel, "mapel")], ["Fase / Kelas / Semester", `${T(K.fase, "fase")} / ${K.kelas || "-"} / ${K.semester}`],
    ["Materi Pokok", T(K.materiPokok, "materi pokok")], ["Tema Kurikulum Berbasis Cinta", K.temaKBC.join(", ") || "{{belum diisi: Tema KBC}}"], ["Materi Insersi", T(K.materiInsersi, "materi insersi")],
    ["Alokasi Waktu", T(K.alokasiWaktu, "alokasi waktu")], ["Bentuk Kegiatan", K.bentuk], ["Alur Pembelajaran", ALUR[K.alur].nama],
    ["Dimensi Profil Lulusan", dim.join(", ") || "{{belum diisi: dimensi profil lulusan}}"], ["Guru Mata Pelajaran", T(K.guruNama, "nama guru")]];
  B.push(blk(`<table class="t kv"><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</tbody></table>`, "", { split: "tabel" }));
  B.push(sec(no(), "Capaian Pembelajaran dan Pemetaan Tema KBC"));
  const cp = arr(G.cp);
  B.push(blk(`<table class="t"><colgroup><col style="width:30mm"><col><col style="width:22mm"></colgroup><thead><tr><th>Elemen</th><th>Capaian Pembelajaran (kutipan)</th><th>Tema KBC</th></tr></thead><tbody>${(cp.length ? cp : [{}]).map(r => `<tr><td>${T(r.elemen, "elemen")}</td><td>${tandaiArab(T(r.cp, "kutipan CP"))}</td><td class="c">${T(r.tema, "nomor tema")}</td></tr>`).join("")}</tbody></table>`, "", { split: "tabel" }));
  B.push(blk(`<p class="sumber">Sumber CP: ${SUMBER_CP[K.kelompok]}. Nomor Tema KBC: 1 Cinta Allah dan Rasul-Nya · 2 Cinta Ilmu · 3 Cinta Lingkungan · 4 Cinta Diri dan Sesama · 5 Cinta Tanah Air. ${K.pemetaanResmi ? "Pemetaan mengikuti Lampiran 1 SK Dirjen Pendis 6077/2025." : "Pemetaan madrasah mengikuti pola Lampiran 1 SK Dirjen Pendis 6077/2025."}</p>`));
  B.push(sec(no(), "Tujuan Pembelajaran"));
  B.push(blk(`<ol>${arr(S.tujuan).map(t => `<li>${t}</li>`).join("") || "<li>{{belum diisi: tujuan}}</li>"}</ol>`));
  if (arr(G.alurPenggunaan).length) {
    B.push(sec(no(), "Alur Penggunaan LKPD"));
    B.push(blk(`<table class="t"><colgroup><col style="width:26mm"><col><col style="width:30mm"><col style="width:18mm"></colgroup><thead><tr><th>Tahap</th><th>Kegiatan Guru dan Peserta Didik</th><th>Prinsip Pembelajaran Mendalam</th><th>Waktu</th></tr></thead><tbody>${arr(G.alurPenggunaan).map(r => `<tr><td><b>${T(r.tahap, "tahap")}</b></td><td>${T(r.kegiatan, "kegiatan")}</td><td>${r.prinsip || ""}</td><td class="c">${r.waktu || ""}</td></tr>`).join("")}</tbody></table>`, "", { split: "tabel" }));
  }
  if (arr(G.miskonsepsi).length) { B.push(sec(no(), "Kemungkinan Miskonsepsi dan Cara Meluruskan")); B.push(blk(`<ul>${arr(G.miskonsepsi).map(x => `<li>${tandaiArab(x)}</li>`).join("")}</ul>`)); }
  B.push(sec(no(), "Kunci dan Pedoman Jawaban"));
  const kc = arr(G.kunci);
  B.push(blk(`<table class="t"><colgroup><col style="width:32mm"><col></colgroup><thead><tr><th>Bagian / Nomor</th><th>Jawaban atau Pedoman Jawaban</th></tr></thead><tbody>${(kc.length ? kc : [{}]).map(r => `<tr><td>${T(r.bagian, "bagian")}</td><td>${tandaiArab(T(r.jawaban, "jawaban"))}</td></tr>`).join("")}</tbody></table>`, "", { split: "tabel" }));
  B.push(sec(no(), "Rubrik Penilaian Kinerja dan Produk"));
  const rb = arr((G.rubrik || {}).aspek || G.rubrik);
  B.push(blk(`<table class="t"><colgroup><col style="width:27mm"><col><col><col><col></colgroup><thead><tr><th>Aspek</th><th>4 · Sangat Baik</th><th>3 · Baik</th><th>2 · Cukup</th><th>1 · Perlu Bimbingan</th></tr></thead><tbody>${(rb.length ? rb : [{}]).map(a => { const k = arr(a.kriteria); return `<tr><td><b>${T(a.nama, "nama aspek")}</b></td>${[0, 1, 2, 3].map(j => `<td>${T(k[j], "deskriptor")}</td>`).join("")}</tr>`; }).join("")}</tbody></table>`, "", { split: "tabel" }));
  B.push(blk(`<p class="sumber">Nilai = (jumlah skor ÷ ${rb.length * 4 || 16}) × 100. Rubrik bersifat asesmen formatif; hasilnya dipakai sebagai umpan balik (prinsip asesmen edukatif KMA 1503/2025).</p>`));
  B.push(sec(no(), "Lembar Observasi Sikap · Nilai Cinta"));
  const ob = arr(G.observasiSikap).map(o => typeof o === "string" ? { indikator: o } : o);
  const obs = ob.length ? ob : [{ indikator: "{{belum diisi: indikator sikap}}" }];
  B.push(blk(`<p style="margin-bottom:1mm">Isi dengan skor 1–4 berdasarkan pengamatan selama kegiatan. Indikator:</p><ol>${obs.map(o => `<li>${o.indikator}${o.cinta ? ` <i>(${o.cinta})</i>` : ""}</li>`).join("")}</ol>`));
  B.push(blk(tabelHTML(["No", "Nama Peserta Didik"].concat(obs.map((o, j) => "Ind. " + (j + 1))).concat(["Catatan"]), 10, { lebar: ["9mm", "52mm"] }), "", { split: "tabel" }));
  const df = G.diferensiasi || {};
  if (df.bantuan || df.reguler || df.pengayaan) {
    B.push(sec(no(), "Diferensiasi Pembelajaran"));
    B.push(blk(`<table class="t kv"><tbody>${[["Bantuan (scaffolding)", df.bantuan], ["Reguler", df.reguler], ["Pengayaan", df.pengayaan]].filter(r => r[1]).map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</tbody></table>`, "", { split: "tabel" }));
  }
  if (arr(G.tindakLanjut).length) { B.push(sec(no(), "Saran Tindak Lanjut")); B.push(blk(`<ul>${arr(G.tindakLanjut).map(x => `<li>${x}</li>`).join("")}</ul>`)); }
  const cat = arr(G.catatanVerifikasi).slice();
  if ($$("[lang=ar]", wadahSementara).length || AR_RE.test(JSON.stringify(window.LKPD || {}))) cat.unshift("LKPD ini memuat teks Arab. Periksa kembali ketepatan lafaz, harakat, dan rujukan ayat/hadis sebelum dicetak.");
  if (cat.length) { B.push(sec(no(), "Catatan Verifikasi untuk Guru")); B.push(blk(`<div class="bantuan"><ul style="margin:0">${cat.map(x => `<li>${x}</li>`).join("")}</ul></div>`)); }
  B.push(blk(`<div class="ttd"><div>Mengetahui,<br>Kepala ${M.nama}<div class="nm">${M.kepala}</div>NIPY. ${M.nipyKepala || "................"}</div><div>${M.tempat}, ${K.tanggal || "...................."}<br>Guru Mata Pelajaran<div class="nm">${T(K.guruNama, "nama guru")}</div>NIPY. ${K.guruNipy || "................"}</div></div>`));
  B.push(blk(`<p class="catatan-kaki">Disusun mengacu pada KMA Nomor 1503 Tahun 2025 (Pembelajaran Mendalam dan Kurikulum Berbasis Cinta), Keputusan Dirjen Pendis Nomor 6077 Tahun 2025 (Panduan KBC), dan ${SUMBER_CP[K.kelompok]}. Dibuat dengan Mesin LKPD v${VERSI}.</p>`));
  return B;
}
const wadahSementara = document.createElement("div");

/* ===================== HALAMAN OTOMATIS ===================== */
function halamanBaru(bagian) {
  const p = el("section", "lk-page"); p.dataset.bagian = bagian;
  const judul = bagian === "guru" ? "Panduan Guru" : "LKPD Peserta Didik";
  p.innerHTML = `<div class="lk-rh"><span><b>${esc(judul)}</b> · ${esc(K.mapel || "")} · ${K.kelas ? "Kelas " + esc(K.kelas) : "Fase " + esc(K.fase || "")}</span><span>${esc(M.nama)}</span></div><div class="lk-body" contenteditable="true" spellcheck="false"></div><div class="lk-ft"><span>${esc(K.judul || "")}</span><span class="hal"></span></div>`;
  if (bagian === "guru") p.classList.add("guru-mode");
  if (!$(`.lk-page[data-bagian=${bagian}]`)) p.classList.add("pertama");
  $("#lk-doc").appendChild(p); return p;
}
const penuh = body => body.scrollHeight > body.clientHeight + 1;
function belah(b, body) {
  // coba bagi blok (tabel per baris / garis per baris) agar sebagian muat di halaman ini
  const jenis = b.dataset.split || (b.querySelector("[data-split=garis]") && !b.querySelector("table") ? "garis" : "");
  if (jenis === "tabel") {
    const tb = b.querySelector("table"); if (!tb || !tb.tBodies[0]) return null;
    const rows = Array.from(tb.tBodies[0].rows); if (rows.length < 2) return null;
    const sisa = b.cloneNode(true); const sb = sisa.querySelector("table").tBodies[0];
    Array.from(sb.rows).forEach(r => r.remove());
    while (penuh(body) && tb.tBodies[0].rows.length > 1) { sb.insertBefore(tb.tBodies[0].rows[tb.tBodies[0].rows.length - 1], sb.firstChild); }
    if (penuh(body)) { Array.from(sb.rows).forEach(r => tb.tBodies[0].appendChild(r)); return null; }
    if (!sb.rows.length) return null;
    $$("p", sisa).forEach(p => { if (!p.closest("table")) p.remove(); });
    sisa.insertAdjacentHTML("afterbegin", '<p class="lanjut">(lanjutan tabel)</p>');
    return sisa;
  }
  if (jenis === "kotak") {
    const k = $(".kotak", b); if (!k || k.dataset.susut) return null;
    const asli = parseFloat(k.style.height) || 45;
    const sisaPx = body.getBoundingClientRect().bottom - k.getBoundingClientRect().top - 4 * MM;
    const mm = Math.floor(sisaPx / MM);
    if (mm >= Math.max(30, asli * 0.6)) { k.style.height = mm + "mm"; k.dataset.susut = "1"; if (!penuh(body)) return "OK"; k.style.height = asli + "mm"; }
    return null;
  }
  if (jenis === "garis") {
    const gs = $$(".garis .g", b); if (gs.length < 2) return null;
    const wadah = gs[0].parentElement; const pindah = [];
    while (penuh(body) && wadah.querySelectorAll(".g").length > 1) { const g = wadah.querySelectorAll(".g"); pindah.push(g[g.length - 1]); g[g.length - 1].remove(); }
    if (penuh(body) || !pindah.length) { pindah.reverse().forEach(g => wadah.appendChild(g)); return null; }
    const sisa = el("div", "blk", `<div class="garis" data-split="garis">${'<div class="g"></div>'.repeat(pindah.length)}</div>`); sisa.dataset.split = "garis";
    return sisa;
  }
  return null;
}
function tata(blokSiswa, blokGuru) {
  const doc = $("#lk-doc"); doc.innerHTML = "";
  const susun = (bloks, bagian) => {
    let p = halamanBaru(bagian), body = $(".lk-body", p);
    const antre = bloks.slice();
    while (antre.length) {
      const b = antre.shift();
      body.appendChild(b);
      if (!penuh(body)) continue;
      // terlalu penuh
      const sisa = belah(b, body);
      if (sisa === "OK") continue;
      if (sisa) { antre.unshift(sisa); p = halamanBaru(bagian); body = $(".lk-body", p); continue; }
      if (body.children.length === 1) { p = halamanBaru(bagian); body = $(".lk-body", p); continue; } // satu blok terlalu besar: biarkan (diperingatkan)
      b.remove();
      // bawa judul (keep) ke halaman berikutnya bersama blok ini
      const ikut = [];
      while (body.lastElementChild && body.lastElementChild.dataset.keep === "1") { ikut.unshift(body.lastElementChild); body.lastElementChild.remove(); }
      if (!body.children.length) {
        ikut.forEach(x => body.appendChild(x)); body.appendChild(b);
        const s2 = belah(b, body); if (s2 && s2 !== "OK") antre.unshift(s2);
        p = halamanBaru(bagian); body = $(".lk-body", p); continue;
      }
      p = halamanBaru(bagian); body = $(".lk-body", p);
      ikut.forEach(x => body.appendChild(x));
      antre.unshift(b);
    }
  };
  susun(blokSiswa, "siswa");
  susun(blokGuru, "guru");
  nomoriHalaman(); terapkanMode();
}
function nomoriHalaman() {
  ["siswa", "guru"].forEach(bg => { const ps = $$(`.lk-page[data-bagian=${bg}]`); ps.forEach((p, i) => { $(".hal", p).textContent = `${bg === "guru" ? "Panduan Guru" : "LKPD"} · Halaman ${i + 1} dari ${ps.length}`; }); });
}
function rapikan() {
  const ambil = bg => $$(`.lk-page[data-bagian=${bg}] .lk-body > .blk`);
  const s = ambil("siswa"), g = ambil("guru");
  tata(gabungBlok(s), gabungBlok(g)); periksa(); toast("Halaman dirapikan ulang.", 3000);
}
function gabungBlok(list) {
  // gabungkan kembali potongan tabel/garis agar tidak terpecah berlebihan
  { const out = []; list.forEach(b => {
      const prev = out[out.length - 1];
      if (prev && b.querySelector(".lanjut") && prev.dataset.split === "tabel" && b.dataset.split === "tabel") { const tb = prev.querySelector("tbody"); $$("tbody tr", b).forEach(r => tb.appendChild(r)); return; }
      if (prev && b.dataset.split === "garis" && b.children.length === 1 && b.firstElementChild.classList.contains("garis") && prev.querySelector(".garis")) { const gs = prev.querySelectorAll(".garis"); const w = gs[gs.length - 1]; $$(".g", b).forEach(x => w.appendChild(x)); return; }
      out.push(b); }); return out; }
}
function terapkanMode() {
  $$(".lk-page").forEach(p => p.classList.toggle("sembunyi", MODE !== "semua" && p.dataset.bagian !== MODE));
}

/* ===================== PEMERIKSAAN OTOMATIS ===================== */
function periksa() {
  const w = [], info = [];
  const D = window.LKPD;
  if (!D) w.push("Data window.LKPD tidak ditemukan");
  if (!M.fase.includes(String(K.fase || "").toUpperCase())) w.push(`Fase "${K.fase || "-"}" tidak sesuai ${K.madrasah} (seharusnya ${M.fase.join("/")})`);
  if (!K.temaKBC.length || K.temaKBC.length > 3 || K.temaKBC.some(x => !PANCA.some(p => norm(x).startsWith(norm(p).slice(0, 12))))) w.push("temaKBC harus 1–3 nama topik Panca Cinta (SK 6077/2025)");
  if (!String(K.materiInsersi || "").trim()) w.push("materiInsersi belum diisi");
  const tahapSah = Object.keys(ALUR[K.alur].tahap);
  const kg = arr(S.kegiatan);
  if (kg.length < 2) w.push("Kegiatan minimal 2 tahap");
  const salah = kg.filter(x => !tahapSah.includes(norm(x.tahap))).map(x => x.tahap || "(kosong)");
  if (salah.length) w.push(`Tahap ${salah.join(", ")} tidak sesuai alur ${K.alur} (${tahapSah.join("/")})`);
  if (!arr(S.tujuan).some(t => /cinta|wujud|bentuk|peduli|kasih|syukur|amanah|tanggung jawab|ukhuwah|hormat|santun|jujur/i.test(t))) w.push("Tujuan belum memuat frasa nilai cinta");
  const lv = arr(S.analisis).map(q => (String((q || {}).level || "").match(/C(\d)/i) || [])[1]).filter(Boolean).map(Number);
  if (!lv.some(x => x >= 4)) w.push("Analisis belum memuat soal HOTS (C4–C6)");
  if (lv.some((x, i) => i && x < lv[i - 1])) info.push("urutan level analisis tidak naik bertahap");
  const rf = S.refleksi || {}; if (!arr(rf.sikap).length) w.push("Refleksi sikap Panca Cinta belum diisi");
  if (K.kelompok === "PAI_ARAB" && !(S.tadabbur && (S.tadabbur.arab || S.tadabbur.terjemah))) w.push("Mapel PAI/Arab wajib memuat tadabbur ayat/hadis");
  if (S.tadabbur && S.tadabbur.arab && !S.tadabbur.sumber) w.push("Teks Arab tadabbur belum mencantumkan sumber");
  const rb = arr((G.rubrik || {}).aspek || G.rubrik);
  if (rb.length < 3) w.push("Rubrik minimal 3 aspek");
  if (rb.length && !/cinta|adab|sikap/i.test((rb[rb.length - 1] || {}).nama || "")) w.push("Aspek terakhir rubrik sebaiknya 'Sikap & Nilai Cinta' / 'Adab & Nilai Cinta'");
  if (!arr(G.kunci).length) w.push("Kunci/pedoman jawaban belum diisi");
  if (!arr(G.cp).length) w.push("CP belum diisi di Panduan Guru");
  const teks = $("#lk-doc").innerText;
  const ph = teks.match(/\{\{[^}]*\}\}/g) || []; if (ph.length) w.push(ph.length + " bagian belum diisi, mis. " + ph[0]);
  const siswaTeks = $$(".lk-page[data-bagian=siswa]").map(p => p.innerText).join(" ");
  if (/kunci jawaban/i.test(siswaTeks)) w.push("Bagian siswa memuat kata 'kunci jawaban'");
  const lebih = $$(".lk-page").filter(p => penuh($(".lk-body", p))).map(p => `${p.dataset.bagian === "guru" ? "Guru" : "LKPD"} hlm. ${$$(`.lk-page[data-bagian=${p.dataset.bagian}]`).indexOf(p) + 1}`);
  if (lebih.length) w.push("Isi melebihi halaman: " + lebih.join(", ") + " — klik 'Rapikan Halaman'");
  if ($$("#lk-doc [lang=ar]").length) info.push("ada teks Arab — wajib dicek guru");
  const ns = $$(".lk-page[data-bagian=siswa]").length, ng = $$(".lk-page[data-bagian=guru]").length;
  const st = $("#lk-status"); st.className = w.length ? "warn" : "";
  st.innerHTML = (w.length ? "⚠ Pemeriksaan otomatis: " + w.map(esc).join(" · ") : `✔ Pemeriksaan otomatis lulus (mesin v${VERSI}): Tema KBC, alur ${K.alur}, HOTS, refleksi Panca Cinta, kunci terpisah — LKPD ${ns} hlm. + Panduan Guru ${ng} hlm.`) +
    (info.length ? ` <span class="info">ℹ ${info.map(esc).join(" · ")}</span>` : "");
}

/* ===================== EKSPOR WORD (.docx) ===================== */
const DX = {
  x: s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
  run(text, f) {
    f = f || {}; if (!text) return "";
    const ar = AR_RE.test(text);
    let pr = "";
    if (f.b) pr += "<w:b/><w:bCs/>"; if (f.i) pr += "<w:i/><w:iCs/>"; if (f.u) pr += '<w:u w:val="single"/>';
    if (f.color) pr += `<w:color w:val="${f.color}"/>`;
    const sz = f.sz || (ar ? 34 : 22);
    pr += ar ? `<w:rFonts w:ascii="Traditional Arabic" w:hAnsi="Traditional Arabic" w:cs="Traditional Arabic"/><w:rtl/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>` : `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`;
    return text.split("\n").map((t, i) => (i ? "<w:r><w:br/></w:r>" : "") + `<w:r><w:rPr>${pr}</w:rPr><w:t xml:space="preserve">${DX.x(t)}</w:t></w:r>`).join("");
  },
  runs(node, f) {
    f = Object.assign({}, f || {}); let out = "";
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) { const t = n.nodeValue.replace(/\s+/g, " "); if (t.trim() || t === " ") out += DX.run(t, f); return; }
      if (n.nodeType !== 1) return;
      const tg = n.tagName, g = Object.assign({}, f);
      if (tg === "BR") { out += "<w:r><w:br/></w:r>"; return; }
      if (tg === "B" || tg === "STRONG" || n.classList.contains("nm")) g.b = true;
      if (tg === "I" || tg === "EM" || n.classList.contains("terjemah")) g.i = true;
      if (tg === "SUP") { out += DX.runs(n, g).replace(/<w:rPr>/g, '<w:rPr><w:vertAlign w:val="superscript"/>'); return; }
      if (tg === "SUB") { out += DX.runs(n, g).replace(/<w:rPr>/g, '<w:rPr><w:vertAlign w:val="subscript"/>'); return; }
      if (n.classList.contains("lvl")) { out += DX.run(" [" + n.textContent.trim() + "]", { sz: 16, b: true, color: "182322" }); return; }
      out += DX.runs(n, g);
    });
    return out;
  },
  p(inner, o) {
    o = o || {}; let pr = "";
    if (o.style) pr += `<w:pStyle w:val="${o.style}"/>`;
    if (o.keep) pr += "<w:keepNext/>";
    if (o.border) pr += `<w:pBdr><w:bottom w:val="dotted" w:sz="6" w:space="1" w:color="9AA5A2"/></w:pBdr>`;
    if (o.shade) pr += `<w:shd w:val="clear" w:color="auto" w:fill="${o.shade}"/>`;
    if (o.bidi) pr += "<w:bidi/>";
    pr += `<w:spacing w:before="${o.before || 0}" w:after="${o.after === undefined ? 80 : o.after}"${o.line ? ` w:line="${o.line}" w:lineRule="exact"` : ""}/>`;
    if (o.ind) pr += `<w:ind w:left="${o.ind}" w:hanging="${o.hang || 0}"/>`;
    if (o.jc) pr += `<w:jc w:val="${o.jc}"/>`;
    return `<w:p><w:pPr>${pr}</w:pPr>${inner || ""}</w:p>`;
  },
  tbl(rowsXml, widths, o) {
    o = o || {}; const tot = widths.reduce((a, b) => a + b, 0);
    const bd = o.noBorder ? "" : `<w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(s => `<w:${s} w:val="single" w:sz="6" w:space="0" w:color="9AA5A2"/>`).join("")}</w:tblBorders>`;
    return `<w:tbl><w:tblPr><w:tblW w:w="${tot}" w:type="dxa"/>${bd}<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(w => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>${rowsXml}</w:tbl>` + DX.p("", { after: 60 });
  },
  tc(inner, w, o) { o = o || {}; return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${o.span ? `<w:gridSpan w:val="${o.span}"/>` : ""}${o.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>` : ""}${o.vc ? '<w:vAlign w:val="center"/>' : ""}</w:tcPr>${inner || DX.p("")}</w:tc>`; },
  tr(cells, o) { o = o || {}; return `<w:tr><w:trPr>${o.h ? `<w:trHeight w:val="${o.h}" w:hRule="${o.rule || "atLeast"}"/>` : ""}${o.header ? "<w:tblHeader/>" : ""}<w:cantSplit/></w:trPr>${cells}</w:tr>`; }
};
const LEBAR = 9921; // 175 mm dalam twip (A4 - margin 17,5 mm)
const mm2tw = mm => Math.round(mm * 56.7);
let GAMBAR = [];
function dxGambar(dataUrl, wmm, imgEl) {
  const m = /^data:image\/(png|jpe?g);base64,(.*)$/.exec(dataUrl || ""); if (!m) return "";
  const id = GAMBAR.length + 1, ext = m[1] === "png" ? "png" : "jpeg";
  const rasio = 0.2;
  const cx = Math.round(wmm * 36000), cy = Math.round(wmm * rasio * 36000);
  GAMBAR.push({ id, ext, b64: m[2] });
  return DX.p(`<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Gambar${id}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="img${id}.${ext}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`, { after: 120 });
}
function dxTabel(tb) {
  const cols = $$("col", tb), rowsEl = Array.from(tb.rows);
  const nCol = Math.max(...rowsEl.map(r => Array.from(r.cells).reduce((a, c) => a + (c.colSpan || 1), 0)));
  const TOT = 175; let fixed = Array(nCol).fill(0);
  if (cols.length === nCol) fixed = cols.map(c => { const v = c.style.width || ""; return /mm$/.test(v) ? parseFloat(v) : /%$/.test(v) ? parseFloat(v) / 100 * TOT : 0; });
  else if (tb.classList.contains("kv") && nCol === 2) fixed = [TOT * 0.33, 0];
  const pakai = fixed.reduce((a, b) => a + b, 0), kosong = fixed.filter(x => !x).length;
  let widths = fixed.map(x => x || Math.max(12, (TOT - pakai) / (kosong || 1)));
  const sum = widths.reduce((a, b) => a + b, 0); widths = widths.map(w => Math.round(w / sum * LEBAR));
  const isian = tb.classList.contains("isian");
  let xml = "";
  rowsEl.forEach(r => {
    const head = r.parentElement.tagName === "THEAD"; let ci = 0;
    const cells = Array.from(r.cells).map(c => {
      const span = c.colSpan || 1, w = widths.slice(ci, ci + span).reduce((a, b) => a + b, 0); ci += span;
      const ar = AR_RE.test(c.textContent);
      const inner = DX.p(DX.runs(c, head ? { b: true, sz: 19 } : { sz: 20 }), { after: 0, jc: head || c.classList.contains("c") || c.classList.contains("sk") ? "center" : (ar ? "right" : undefined), bidi: ar && !head });
      return DX.tc(inner, w, { span: span > 1 ? span : 0, fill: head ? "DCE7DF" : (c.tagName === "TD" && tb.classList.contains("kv") && c.cellIndex === 0 ? "EEF3EF" : ""), vc: head });
    }).join("");
    xml += DX.tr(cells, { header: head, h: isian && !head ? 480 : 0 });
  });
  return DX.tbl(xml, widths);
}
function dxBlok(b) {
  let x = "";
  const walk = node => {
    Array.from(node.children).forEach(n => {
      const c = n.classList, tg = n.tagName;
      if (c.contains("band")) {
        const atas = $(".atas", n), info = $(".info", n), guru = c.contains("guru");
        const fill = guru ? "0B2B2A" : "0B2B2A";
        const lbl = DX.p(DX.run($(".label", atas).textContent, { b: true, sz: 17, color: guru ? "B89146" : "FFFFFF" }), { after: 20 });
        const jdl = DX.p(DX.run($(".jdl", atas).textContent, { b: true, sz: 34, color: "FFFFFF" }), { after: 20 });
        const sub = $(".sub", atas) ? DX.p(DX.run($(".sub", atas).textContent, { sz: 20, color: "FFFFFF" }), { after: 20 }) : "";
        const inf = DX.p(Array.from(info.children).map((s, i) => (i ? DX.run("   |   ", { sz: 19, color: "5E6A68" }) : "") + DX.runs(s, { sz: 19 })).join(""), { after: 0 });
        x += DX.tbl(DX.tr(DX.tc(lbl + jdl + sub, LEBAR, { fill })) + DX.tr(DX.tc(inf, LEBAR, { fill: guru ? "F1E9D8" : "DCE7DF" })), [LEBAR]); return;
      }
      if (c.contains("sec")) { x += DX.p(DX.run((($(".no", n) || {}).textContent || "") + ". " + (($(".t", n) || {}).textContent || n.textContent), { b: true, sz: 25, color: n.closest(".guru-mode") ? "0B2B2A" : "0B2B2A" }), { before: 160, after: 80, keep: true, border: false }); return; }
      if (c.contains("ident")) {
        const fs = $$(".f", n).map(f => f.textContent.trim());
        let rows = ""; for (let i = 0; i < fs.length; i += 2) rows += DX.tr(DX.tc(DX.p(DX.run(fs[i] + " : ", { sz: 21 }), { after: 0 }), LEBAR / 2) + DX.tc(DX.p(DX.run((fs[i + 1] || "") + (fs[i + 1] ? " : " : ""), { sz: 21 }), { after: 0 }), LEBAR / 2), { h: 480 });
        const ang = $$(".ang li", n); if (ang.length) { let cells = ""; const half = Math.ceil(ang.length / 2); for (let i = 0; i < half; i++) rows += DX.tr(DX.tc(DX.p(DX.run((i + 1) + ". ", { sz: 21 }), { after: 0 }), LEBAR / 2) + DX.tc(DX.p(i + half < ang.length ? DX.run((i + half + 1) + ". ", { sz: 21 }) : "", { after: 0 }), LEBAR / 2), { h: 440 }); x += DX.p(DX.run("Anggota kelompok:", { sz: 20 }), { after: 0 }); }
        x += DX.tbl(rows, [LEBAR / 2, LEBAR / 2]); return;
      }
      if (c.contains("garis")) { const l = $(".lbl", n); if (l) x += DX.p(DX.run(l.textContent, { b: true, sz: 19, color: "5E6A68" }), { after: 0 }); $$(".g", n).forEach(() => x += DX.p("", { border: true, line: 454, after: 0, ind: n.closest(".soal-wrap") ? 400 : 0 })); return; }
      if (c.contains("kotak")) { const h = parseFloat(n.style.height) || 45; const l = $(".lbl", n); x += DX.tbl(DX.tr(DX.tc(DX.p(DX.run(l ? l.textContent : "", { sz: 17, color: "5E6A68" }), { after: 0 }), LEBAR), { h: mm2tw(h), rule: "exact" }), [LEBAR]); return; }
      if (tg === "TABLE") { x += dxTabel(n); return; }
      if (c.contains("tahap")) {
        const kp = $(".kepala", n);
        x += DX.tbl(DX.tr(DX.tc(DX.p(DX.run($(".badge", kp).textContent.toUpperCase() + "  ", { b: true, sz: 19, color: "0B2B2A" }) + DX.run($(".nm", kp).textContent, { b: true, sz: 23 }) + ($(".ket", kp) ? DX.run("  · " + $(".ket", kp).textContent, { sz: 17, color: "5E6A68" }) : ""), { after: 0 }), LEBAR, { fill: "DCE7DF" })), [LEBAR]).replace(/<w:p><w:pPr><w:spacing w:before="0" w:after="60"\/><\/w:pPr><\/w:p>$/, "");
        walk($(".isi", n)); return;
      }
      if (c.contains("soal-wrap")) { const s = $(".soal", n); x += DX.p(DX.run($(".n", s).textContent + " ", { b: true }) + DX.runs($(".q", s)), { ind: 400, hang: 400, keep: true, after: 40, bidi: false }); Array.from(n.children).slice(1).forEach(ch => { const t = el("div"); t.appendChild(ch.cloneNode(true)); walk(t); }); return; }
      if (c.contains("chips") || c.contains("centang")) { x += DX.p(Array.from(n.children).map(s => DX.run((c.contains("centang") ? "☐ " : "") + s.textContent.trim() + "   ", { b: s.classList.contains("chip") || s.classList.contains("lbl"), sz: 20, color: s.classList.contains("chip") ? "0B2B2A" : undefined })).join("")); return; }
      if (c.contains("kotak-info") || c.contains("kotak-misi") || c.contains("tadabbur") || c.contains("bantuan") || c.contains("tantangan")) {
        const fill = c.contains("kotak-info") ? "DCE7DF" : c.contains("bantuan") ? "EEF3EF" : c.contains("tantangan") ? "F7F2E8" : "FFFFFF";
        const simpan = x; x = ""; walkIsi(n); const inner = x || DX.p(""); x = simpan;
        x += DX.tbl(DX.tr(DX.tc(inner, LEBAR, { fill })), [LEBAR]); return;
      }
      if (c.contains("ttd")) {
        const cols = Array.from(n.children).map(d => { let s = ""; d.childNodes.forEach(k => { if (k.nodeType === 3) { if (k.nodeValue.trim()) s += DX.p(DX.run(k.nodeValue.trim()), { after: 0 }); } else if (k.classList && k.classList.contains("nm")) s += DX.p("", { after: 0 }) + DX.p("", { after: 0 }) + DX.p("", { after: 0 }) + DX.p(DX.run(k.textContent, { b: true, u: true }), { after: 0 }); }); return s; });
        x += DX.tbl(DX.tr(DX.tc(cols[0], LEBAR / 2) + DX.tc(cols[1], LEBAR / 2)), [LEBAR / 2, LEBAR / 2], { noBorder: true }); return;
      }
      if (tg === "OL" || tg === "UL") { let k = 0; $$(":scope > li", n).forEach(li => { k++; x += DX.p(DX.run((tg === "OL" ? k + "." : "•") + "\t") + DX.runs(li), { ind: 400, hang: 400, after: 40, bidi: AR_RE.test(li.textContent) && !/[a-z]{3}/i.test(li.textContent) }); }); return; }
      if (tg === "P" || c.contains("lbl") || c.contains("isi") || tg === "DIV" && !n.children.length) {
        const ar = c.contains("arab") || (AR_RE.test(n.textContent) && !/[a-z]{4}/i.test(n.textContent));
        x += DX.p(DX.runs(n, { sz: c.contains("sumber") || c.contains("catatan-kaki") ? 17 : undefined, color: c.contains("sumber") || c.contains("catatan-kaki") ? "5E6A68" : undefined, b: c.contains("lbl") || c.contains("isi") && n.closest(".kotak-misi") }), { bidi: ar, jc: ar ? "right" : (n.style.textAlign === "center" ? "center" : undefined) }); return;
      }
      walk(n);
    });
  };
  const walkIsi = node => walk(node);
  walk(b);
  return x;
}
function dokumenXml() {
  GAMBAR = [];
  let body = "";
  ["siswa", "guru"].forEach((bg, ix) => {
    if (MODE !== "semua" && MODE !== bg) return;
    const bloks = $$(`.lk-page[data-bagian=${bg}] .lk-body > .blk`);
    if (!bloks.length) return;
    if (body) body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    gabungBlok(bloks.map(b => b.cloneNode(true))).forEach(b => { const l = b.querySelector(".lanjut"); if (l) l.remove(); body += dxBlok(b); });
  });
  // gabungkan tabel lanjutan yang bersebelahan tidak perlu; Word mengatur halaman sendiri
  const sect = `<w:sectPr><w:footerReference w:type="default" r:id="rIdFt"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="992" w:bottom="1134" w:left="992" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}${sect}</w:body></w:document>`;
}
function zipStore(files) {
  const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = crcT[(c ^ u[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  files.forEach(f => {
    const name = enc.encode(f.name), data = typeof f.data === "string" ? enc.encode(f.data) : f.data, c = crc(data);
    const head = new Uint8Array([0x50, 0x4b, 3, 4, 20, 0, 0, 0, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(data.length), ...u32(data.length), ...u16(name.length), 0, 0]);
    parts.push(head, name, data);
    central.push(new Uint8Array([0x50, 0x4b, 1, 2, 20, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(data.length), ...u32(data.length), ...u16(name.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(off)]), name);
    off += head.length + name.length + data.length;
  });
  const cs = central.reduce((a, b) => a + b.length, 0);
  const end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cs), ...u32(off), 0, 0]);
  return new Blob([...parts, ...central, end], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}
function namaFile(ext) {
  const bag = MODE === "siswa" ? "_Siswa" : MODE === "guru" ? "_PanduanGuru" : "";
  return ("LKPD_" + (K.mapel || "") + "_" + (K.kelas || K.fase || "") + "_" + (K.materiPokok || K.judul || "")).replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").slice(0, 80) + bag + "." + ext;
}
function unduhBlob(blob, nama) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }
function unduhWord() {
  try {
    const doc = dokumenXml();
    const b64 = s => { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
    const ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`;
    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
    const drels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdSt" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdFt" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>${GAMBAR.map(g => `<Relationship Id="rIdImg${g.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img${g.id}.${g.ext}"/>`).join("")}</Relationships>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Traditional Arabic" w:eastAsia="Arial"/><w:color w:val="182322"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="id-ID" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>`;
    const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="C9C9C9"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="9921"/></w:tabs></w:pPr><w:r><w:rPr><w:color w:val="5E6A68"/><w:sz w:val="17"/></w:rPr><w:t xml:space="preserve">${DX.x(M.nama + " · LKPD " + (K.mapel || ""))}</w:t></w:r><w:r><w:rPr><w:sz w:val="17"/></w:rPr><w:tab/><w:t xml:space="preserve">Halaman </w:t></w:r><w:r><w:rPr><w:sz w:val="17"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="17"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="17"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:sz w:val="17"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:sz w:val="17"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;
    const files = [{ name: "[Content_Types].xml", data: ct }, { name: "_rels/.rels", data: rels }, { name: "word/document.xml", data: doc }, { name: "word/_rels/document.xml.rels", data: drels }, { name: "word/styles.xml", data: styles }, { name: "word/footer1.xml", data: footer }];
    GAMBAR.forEach(g => files.push({ name: `word/media/img${g.id}.${g.ext}`, data: b64(g.b64) }));
    unduhBlob(zipStore(files), namaFile("docx"));
    toast("File Word (.docx) diunduh. Tata letak halaman di Word diatur ulang otomatis oleh Word.", 6000);
  } catch (e) { console.error(e); toast("Gagal membuat Word: " + esc(e.message)); }
}

/* ===================== EKSPOR PDF (tanpa dialog cetak) ===================== */
async function gambarLembar(sec, skala) {
  const w = sec.offsetWidth, h = sec.offsetHeight;
  const k = sec.cloneNode(true); k.style.margin = "0"; k.style.boxShadow = "none";
  $$("[contenteditable]", k).forEach(e => e.removeAttribute("contenteditable"));
  const xhtml = new XMLSerializer().serializeToString(k);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" id="lk-app" style="width:${w}px;height:${h}px;background:#fff"><style><![CDATA[${CSS}]]></style>${xhtml}</div></foreignObject></svg>`;
  const im = new Image(); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await im.decode(); await new Promise(r => setTimeout(r, 30));
  const PW = Math.round(794 * skala), PH = Math.round(1123 * skala), c = document.createElement("canvas"); c.width = PW; c.height = PH;
  const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, PW, PH); x.drawImage(im, 0, 0, PW, PH);
  const url = c.toDataURL("image/jpeg", 0.85), bin = atob(url.split(",")[1]), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return { data: u, w: PW, h: PH };
}
function rakitPdf(hal) {
  const enc = new TextEncoder(), parts = [], off = []; let len = 0;
  const push = x => { const u = typeof x === "string" ? enc.encode(x) : x; parts.push(u); len += u.length; };
  const obj = (n, f) => { off[n] = len; push(n + " 0 obj\n"); f(); push("\nendobj\n"); };
  push("%PDF-1.4\n"); const N = hal.length;
  obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () => push(`<< /Type /Pages /Kids [${hal.map((_, i) => (3 + 3 * i) + " 0 R").join(" ")}] /Count ${N} >>`));
  hal.forEach((g, i) => { const p = 3 + 3 * i, cs = `q 595.28 0 0 841.89 0 0 cm /Im${i} Do Q`;
    obj(p, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${i} ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`));
    obj(p + 1, () => push(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    obj(p + 2, () => { push(`<< /Type /XObject /Subtype /Image /Width ${g.w} /Height ${g.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${g.data.length} >>\nstream\n`); push(g.data); push("\nendstream"); }); });
  const xref = len, total = 3 + 3 * N;
  push(`xref\n0 ${total}\n0000000000 65535 f \n` + off.slice(1).map(o => String(o).padStart(10, "0") + " 00000 n \n").join(""));
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: "application/pdf" });
}
async function unduhPdf() {
  document.activeElement && document.activeElement.blur(); const sel = window.getSelection(); sel && sel.removeAllRanges();
  const hal = $$(".lk-page").filter(p => !p.classList.contains("sembunyi")), hasil = [];
  try {
    for (let i = 0; i < hal.length; i++) { toast(`Membuat PDF… halaman ${i + 1} dari ${hal.length}`, 60000); hasil.push(await gambarLembar(hal[i], 2)); }
    unduhBlob(rakitPdf(hasil), namaFile("pdf"));
    toast(`PDF diunduh: ${hal.length} halaman A4. Untuk PDF berteks (bisa disalin), unduh Word lalu simpan sebagai PDF.`, 9000);
  } catch (e) { console.error(e); toast("Gagal membuat PDF: " + esc(e.message) + ". Coba unduh Word lalu simpan sebagai PDF."); }
}

/* ===================== TOOLBAR & MULAI ===================== */
const TOOLBAR = `<div id="lk-bar"><span class="judul">📘 LKPD · ${"%M%"}</span>
<select id="lk-mode" title="Bagian yang ditampilkan dan diunduh"><option value="semua">Tampilan: Lengkap</option><option value="siswa">Hanya LKPD Siswa</option><option value="guru">Hanya Panduan Guru</option></select>
<button id="lk-rapi" title="Susun ulang halaman setelah mengedit">↻ Rapikan Halaman</button>
<button id="lk-word">⬇ Unduh Word</button><button id="lk-pdf" class="utama">⬇ Unduh PDF</button></div>
<div id="lk-status">Memeriksa…</div><div id="lk-toast"></div><main id="lk-doc"></main>`;
async function mulai() {
  siapkanData();
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  if (!document.querySelector("meta[name=viewport]")) { const m = document.createElement("meta"); m.name = "viewport"; m.content = "width=device-width, initial-scale=1.0"; document.head.appendChild(m); }
  const app = el("div"); app.id = "lk-app"; app.innerHTML = TOOLBAR.replace("%M%", esc(M.nama));
  const lama = document.getElementById("app"); if (lama) lama.replaceWith(app); else document.body.appendChild(app);
  document.title = "LKPD " + (K.mapel || "") + " — " + (K.judul || M.nama);
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  tata(bangunSiswa(), bangunGuru());
  periksa();
  $("#lk-mode").addEventListener("change", e => { MODE = e.target.value; terapkanMode(); toast(MODE === "semua" ? "Menampilkan LKPD + Panduan Guru." : MODE === "siswa" ? "Hanya LKPD Siswa (untuk dicetak/dibagikan). Unduhan mengikuti tampilan ini." : "Hanya Panduan Guru. Unduhan mengikuti tampilan ini.", 5000); });
  $("#lk-rapi").addEventListener("click", rapikan);
  $("#lk-word").addEventListener("click", unduhWord);
  $("#lk-pdf").addEventListener("click", unduhPdf);
  let tm; document.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(periksa, 800); });
  window.MesinLKPD = { versi: VERSI, rapikan, periksa, unduhWord, unduhPdf };
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai); else mulai();
})();
