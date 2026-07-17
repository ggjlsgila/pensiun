// 1. DAFTAR KATEGORI DAN SUB-KATEGORI BAWAAN SESUAI CATATAN BUKU KAMU
let elemenBarisYangAkanDihapus = null; // Menyimpan baris sementara saat modal muncul
let tipePenghapusanYangBerjalan = "";
let myChartInstance = null; // Variabel global untuk menampung diagram
const daftarKategoriBawaan = [
{
    id: "biaya_rutin",
    nama: "💸 Biaya Hidup Rutin",
    subs: [
      "Belanja dapur & bahan makanan pokok",
      "Listrik (pascabayar / token)",
      "Air (PAM / sumur bor)",
      "Gas untuk memasak",
      "Lingkungan (kebersihan & keamanan)",
    ],
  },
  {
    id: "kesehatan",
    nama: "🩺 Kesehatan & Perawatan",
    subs: [
      "Premi asuransi kesehatan / BPJS ",
      "Obat rutin & vitamin / suplemen",
      "check-up berkala",
    ],
  },
  {
    id: "transportasi",
    nama: "🚗 Transportasi & Mobilitas",
    subs: [
      "Bahan bakar (BBM) & tol bulanan",
      "servis kendaraan & ganti oli",
      " pajak STNK tahunan",
      "Transportasi umum (kereta, MRT, taksi online)",
    ],
  },
  {
    id: "komunikasi",
    nama: "📱 Komunikasi & Informasi",
    subs: ["Internet rumah / wifi bulanan", "Pulsa & paket data handphone"],
  },
  {
    id: "aset",
    nama: "🏠 Alokasi Pajak & Rumah",
    subs: [
      "Alokasi untuk pajak PBB tahunan",
      "Tabungan  untuk renovasi/perawatan rumah",
    ],
  },
  {
    id: "gaya_hidup",
    nama: "🎪 Gaya Hidup & Sosial",
    subs: [
      "Hiburan, rekreasi, & liburan",
      "Budget hobi masa tua",
      "Sosial & keagamaan (zakat, sedekah, donasi)",
      "Iuran acara / undangan kerabat",
      "Hadiah & uang saku cucu",
    ],
  },
  {
    id: "kustom",
    nama: "➕ Kategori Tambahan Anda",
    subs: ["Silakan tulis pengeluaran tambahan lainnya di sini"],
  },
];


const wrapperKategori = document.getElementById("wrapper-kategori");

// FUNGSI UNTUK MERUBAH ANGKA MENJADI FORMAT RUPIAH DAN TITIK SAAT DIKETIK
function formatInputRupiah(elemen) {
  let value = elemen.value.replace(/\D/g, ""); // Hapus semua karakter non-angka
  if (value) {
    elemen.value = "Rp " + value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else {
    elemen.value = "";
  }
}

// FUNGSI UNTUK MENGUBAH TEKS RUPIAH KEMBALI JADI ANGKA MURNI UNTUK DIHITUNG
function bersihkanAngka(teks) {
  return parseFloat(teks.replace(/[^0-9]/g, "")) || 0;
}

// =========================================================================
// PERBAIKAN: LOGIKA RENDER & TOMBOL GAYA HIDUP BERLIPAT GANDA TAK TERBATAS
// =========================================================================
function renderKotakKategori() {
  var savedData = localStorage.getItem("dataKalkulatorPensiun");
  wrapperKategori.innerHTML = ""; // Bersihkan kontainer agar steril

  // 1. Render semua menu bawaan asli buku (Rutin, Kesehatan, Transport, dll)
  daftarKategoriBawaan.forEach((cat) => {
    if (cat.id === "kustom") return; // Lewati id kustom lama agar diganti tombol dinamis baru
    buatElemenKotakKategoriHTML(cat.id, cat.nama, cat.subs, savedData);
  });
}
renderKotakKategori(); // Jalankan fungsi render di awal

// 2. LOGIKA UTAMA TOMBOL PANDUAN: Berfungsi mengaktifkan klik tombol HTML secara berulang kali tanpa batas
// =========================================================================
// 3. FUNGSI MESIN PENCETAK KOTAK MENU BARU BESERTA TOMBOL BAWAANNYA
// =========================================================================
function buatElemenKotakKategoriHTML(idKat, namaKat, daftarSubs, savedData) {
  const divLuar = document.createElement("div");
  divLuar.className = "kotak-kategori-luar";

  // Struktur kotak kategori utama. Tombol "+ Item" dan "🗑️" (Sudah Diberi Pengaman)
  divLuar.innerHTML = `
    <div class="header-kategori">
      <div class="nama-kategori-utama">${namaKat}</div>
      <div class="area-aksi-header">
        <button type="button" class="btn-item" onclick="tambahBaris('box-${idKat}', '${namaKat}')">+ Item</button>
        <button type="button" class="btn-tong" onclick="konfirmasiHapusSatuBlokKategori(this)">🗑️</button>
      </div>
    </div>
    <div id="box-${idKat}"></div>
  `;
  wrapperKategori.appendChild(divLuar);

  // Otomatis buatkan satu baris input kosong pertama di dalam kategori baru tersebut
  if (daftarSubs) {
    daftarSubs.forEach((subNama) => {
      tambahBaris(`box-${idKat}`, namaKat, subNama, "");
    });
  }
}

// FUNGSI UNTUK MENAMBAH BARIS ITEM DENGAN DETEKSI INPUT RUPIAH OTOMATIS
function tambahBaris(idKontainer, namaKat, valueNama = "", valueUang = "") {
  var tempat = document.getElementById(idKontainer);
  var divBaru = document.createElement("div");
  divBaru.className = "baris";
  divBaru.innerHTML = `
      <input type="text" class="nama-sub" data-kat="${namaKat}" value="${valueNama}" placeholder="Nama item...">
      <input type="text" class="uang-sub" value="${valueUang}" placeholder="Rp 0" oninput="formatInputRupiah(this)">
      <button type="button" class="btn-silang" onclick="konfirmasiHapusBaris(this)">✕</button>
  `;
  tempat.appendChild(divBaru);

  var inputUang = divBaru.querySelector(".uang-sub");
  if (valueUang) {
    formatInputRupiah(inputUang);
  }
} // <-- BATAS PENUTUP FUNGSI TAMBAHBARIS YANG BENAR

// FUNGSI BARU: Memunculkan pop-up kustom tepat di tengah-tengah layar
// =========================================================================
// LOGIKA SULAP KALIMAT: SEMUA TOMBOL HAPUS PAKAI SATU POP-UP KOTAK PUTIH
// =========================================================================

// 1. Pemicu klik Tombol Silang (✕) -> Menghapus satu baris item
// 1. Pemicu klik Tombol Silang (✕) -> Menghapus satu baris item
function konfirmasiHapusBaris(tombol) {
  elemenBarisYangAkanDihapus = tombol.parentElement;
  tipePenghapusanYangBerjalan = "baris";

  document.getElementById("teksModalKonfirmasi").innerText =
    "Apakah kamu yakin ingin menghapus sub-menu ini?";
  document.getElementById("modalKonfirmasi").style.display = "flex";
}

// 2. Pemicu klik Tombol Tong Sampah Bawaan (🗑️) -> Mengosongkan isian menu
function kosongkanSatuKotak(idKontainer) {
  elemenBarisYangAkanDihapus = document.getElementById(idKontainer);
  tipePenghapusanYangBerjalan = "kosongkan_blok";

  document.getElementById("teksModalKonfirmasi").innerText =
    "Apakah kamu yakin ingin mengosongkan semua item di dalam kategori ini?";
  document.getElementById("modalKonfirmasi").style.display = "flex";
}

// 3. Pemicu klik Tombol Tong Sampah Kustom Baru (🗑️) -> Menghapus satu bab penuh
function konfirmasiHapusSatuBlokKategori(tombol) {
  elemenBarisYangAkanDihapus = tombol.parentElement.parentElement.parentElement;
  tipePenghapusanYangBerjalan = "hapus_blok";

  document.getElementById("teksModalKonfirmasi").innerText =
    "Apakah kamu yakin ingin menghapus seluruh kategori menu beserta isinya ini?";
  document.getElementById("modalKonfirmasi").style.display = "flex";
}

// 4. PENGENDALI AKSI TOMBOL DI DALAM POP-UP KOTAK PUTIH
document.addEventListener("DOMContentLoaded", function () {
  // Jika tombol merah "Hapus" di dalam pop-up diklik
  document.getElementById("btnYaHapus").onclick = function () {
    if (elemenBarisYangAkanDihapus) {
      if (
        tipePenghapusanYangBerjalan === "baris" ||
        tipePenghapusanYangBerjalan === "hapus_blok"
      ) {
        elemenBarisYangAkanDihapus.remove(); // Hapus elemennya dari layar
      } else if (tipePenghapusanYangBerjalan === "kosongkan_blok") {
        elemenBarisYangAkanDihapus.innerHTML = ""; // Hanya bersihkan isi dalamnya saja
      }
    }
    tutupModalKustom();
  };

  // Jika tombol abu-abu "Batal" di dalam pop-up diklik
  document.getElementById("btnBatalHapus").onclick = function () {
    tutupModalKustom();
  };
});

// Fungsi untuk menutup kembali kotak pop-up putih tengah layar
function tutupModalKustom() {
  document.getElementById("modalKonfirmasi").style.display = "none";
  elemenBarisYangAkanDihapus = null;
  tipePenghapusanYangBerjalan = "";
}

function kosongkanSatuKotak(idKontainer) {
  // Menambahkan alert konfirmasi sebelum menghapus isi kotak
  if (
    confirm(
      "Apakah kamu yakin ingin mengosongkan semua item di dalam kategori ini?",
    )
  ) {
    document.getElementById(idKontainer).innerHTML = "";
  }
}

// FUNGSI SIMPAN DATA KE MEMORI LOCALSTORAGE BROWSER (SUDAH DISARING)
function simpanKeBrowser() {
  var subs = document.querySelectorAll(".nama-sub");
  var uangs = document.querySelectorAll(".uang-sub");
  var dataSimpan = [];

  subs.forEach(function (sub, index) {
    var namaItem = sub.value.trim();
    var nominalUang = bersihkanAngka(uangs[index].value);

    // HANYA SIMPAN JIKA NAMA DIISI DAN NOMINALNYA LEBIH DARI 0
    if (namaItem !== "" && nominalUang > 0) {
      dataSimpan.push({
        kategori: sub.getAttribute("data-kat"),
        idBox: sub.parentElement.parentElement.id,
        nama: sub.value,
        biaya: uangs[index].value,
      });
    }
  });

  localStorage.setItem(
    "usiaPensiun",
    document.getElementById("usia-pensiun").value,
  );
  localStorage.setItem(
    "harapanHidup",
    document.getElementById("harapan-hidup").value,
  );
  localStorage.setItem("dataKalkulatorPensiun", JSON.stringify(dataSimpan));
  alert("Data yang terisi berhasil dikunci di memori HP/Laptop kamu! 👍");
}

// MEMUAT DATA OTOMATIS SAAT HALAMAN WEB DIBUKA
window.onload = function () {
  var savedUsia = localStorage.getItem("usiaPensiun");
  var savedHarapan = localStorage.getItem("harapanHidup");
  var savedData = localStorage.getItem("dataKalkulatorPensiun");

  if (savedUsia) document.getElementById("usia-pensiun").value = savedUsia;
  if (savedHarapan)
    document.getElementById("harapan-hidup").value = savedHarapan;

  if (savedData) {
    var daftarData = JSON.parse(savedData);
    daftarData.forEach(function (item) {
      tambahBaris(item.idBox, item.kategori, item.nama, item.biaya);
    });
  }
  hitungDurasiLive(); // Jalankan hitungan tahun di awal
};

// FUNGSI RESET TOTAL HALAMAN DAN MEMORI
function hapusSemuaData() {
  if (confirm("Apakah kamu yakin ingin menghapus semua data?")) {
    localStorage.clear();
    location.reload();
  }
}
document.getElementById("btnReset").onclick = hapusSemuaData;

// FUNGSI MENGHITUNG DAN MENAMPILKAN DURASI PENSIUN SECARA LIVE DI KOTAK ATAS
function hitungDurasiLive() {
  const usiaPensiun =
    parseInt(document.getElementById("usia-pensiun").value) || 0;
  const harapanHidup =
    parseInt(document.getElementById("harapan-hidup").value) || 0;
  const infoDurasi = document.getElementById("info-durasi-live");
  const durasi = harapanHidup - usiaPensiun;

  if (durasi > 0) {
    infoDurasi.innerText = durasi + " Tahun";
    infoDurasi.style.color = "#2d6a4f";
  } else {
    infoDurasi.innerText = "Usia tidak valid";
    infoDurasi.style.color = "#dc3545";
  }
}
// =========================================================================
// LOGIKA HITUNG INFLASI OPSIONAL (SUDAH DISATUKAN DENGAN LOOP FOR ASLI)
// =========================================================================
document.getElementById("formBiaya").onsubmit = function (event) {
  event.preventDefault();
  var subs = document.querySelectorAll(".nama-sub");
  var uangs = document.querySelectorAll(".uang-sub");
  var totalKeseluruhan = 0;
  var totalPerKategori = {};
  var teksKategori = "";

  if (uangs.length === 0) {
    alert("Belum ada item pengeluaran yang tersedia!");
    return;
  }

  var usiaPensiun =
    parseInt(document.getElementById("usia-pensiun").value) || 0;
  var harapanHidup =
    parseInt(document.getElementById("harapan-hidup").value) || 0;

  var durasiPensiun = harapanHidup - usiaPensiun;
  if (durasiPensiun <= 0) {
    alert("Angka Harapan Hidup harus lebih besar!");
    return;
  }

  // LOOP FOR ASLI KAMU UNTUK MENGHITUNG DAN MENYARING UANG
  var adaDataDihitung = false;
  for (var i = 0; i < uangs.length; i++) {
    var nama = subs[i].value.trim();
    var nilai = bersihkanAngka(uangs[i].value);
    var kategori = subs[i].getAttribute("data-kat") || "Lain-lain";

    if (nama !== "" && nilai > 0) {
      adaDataDihitung = true;
      totalKeseluruhan += nilai;

      if (!totalPerKategori[kategori]) {
        totalPerKategori[kategori] = 0;
      }
      totalPerKategori[kategori] += nilai;
    }
  }

  if (!adaDataDihitung) {
    alert(
      "Silakan isi minimal satu nama item dan nominal rupiah untuk memulai perhitungan!",
    );
    return;
  }

  // PROSES PERHITUNGAN INFLASI SECARA MATEMATIS
  var usiaSekarang = 30;
  var sisaWaktuMenujuPensiun = durasiPensiun;

  if (sisaWaktuMenujuPensiun < 0) sisaWaktuMenujuPensiun = 0;

  var isInflasiAktif = document.getElementById("pakai-inflasi").checked;
  var basisBiayaBulanan = totalKeseluruhan;
  var teksStatusInflasi = " *(Tanpa Inflasi)*";

  if (isInflasiAktif && sisaWaktuMenujuPensiun > 0) {
    var lajuInflasi = 0.04;
    basisBiayaBulanan =
      totalKeseluruhan * Math.pow(1 + lajuInflasi, sisaWaktuMenujuPensiun);
    teksStatusInflasi =
      " *(Sudah Termasuk Inflasi 4% Tahun Ke-" + sisaWaktuMenujuPensiun + ")*";
  }

  // VARIABEL TOTALTAHUN DAN KEBAWAHNYA MENGGUNAKAN BASISBIAYABULANAN
  var totalTahun = basisBiayaBulanan * 12;
  var totalKebutuhanPensiun = totalTahun * durasiPensiun;

  // REKAPAN PER KATEGORI
  teksKategori +=
    '<h4 style="margin: 0 0 10px 0; color: #1b4332; font-size: 15px;">📊 Rekapan per Kategori</h4>';
  for (var namaBab in totalPerKategori) {
    var totalBab = totalPerKategori[namaBab];
    teksKategori +=
      '<div style="margin: 6px 0; font-size: 14px; display: flex; justify-content: space-between; background: #f8f9fa; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">' +
      "<span>📁 Total <b>" +
      namaBab +
      "</b></span>" +
      '<span style="font-weight: bold; color: #1b4332;">Rp ' +
      totalBab.toLocaleString("id-ID") +
      "</span>" +
      "</div>";
  }

  // LOGIKA KESIMPULAN BULANAN
  // =========================================================================
  // LOGIKA BARU: KESIMPULAN BULANAN BERDASARKAN PATOKAN BUKU GAYA HIDUP
  // =========================================================================
  var teksKesimpulan = "";
  if (basisBiayaBulanan > 20000000) {
    // Di atas 20 Juta
    teksKesimpulan =
      "Pengeluaran bulanan Anda (Rp " +
      Math.round(basisBiayaBulanan).toLocaleString("id-ID") +
      "/bulan)" +
      teksStatusInflasi +
      " berada di atas kategori Mewah (Patokan: > Rp 20.000.000). Anggaran ini sangat besar. Disarankan untuk meninjau kembali pos gaya hidup atau memastikan Anda memiliki aset produktif yang sangat kuat untuk menopangnya.";
  } else if (basisBiayaBulanan > 10000000) {
    // 10 Juta - 20 Juta
    teksKesimpulan =
      "Pengeluaran bulanan Anda (Rp " +
      Math.round(basisBiayaBulanan).toLocaleString("id-ID") +
      "/bulan)" +
      teksStatusInflasi +
      " masuk dalam kategori gaya hidup Mewah (Patokan: Rp 10.000.000 - Rp 20.000.000). Untuk mempertahankan kenyamanan tinggi ini di masa tua, fokus utama Anda adalah memperbesar konsistensi investasi rutin sejak dini.";
  } else if (basisBiayaBulanan > 5000000) {
    // 5 Juta - 10 Juta
    teksKesimpulan =
      "Pengeluaran bulanan Anda (Rp " +
      Math.round(basisBiayaBulanan).toLocaleString("id-ID") +
      "/bulan)" +
      teksStatusInflasi +
      " masuk dalam kategori gaya hidup Menengah (Patokan: Rp 5.000.000 - Rp 10.000.000). Ini adalah standar yang ideal untuk hidup nyaman dan seimbang. Pastikan jaminan kesehatan tetap aktif agar tabungan aman.";
  } else {
    // Di bawah 5 Juta
    teksKesimpulan =
      "Pengeluaran bulanan Anda (Rp " +
      Math.round(basisBiayaBulanan).toLocaleString("id-ID") +
      "/bulan)" +
      teksStatusInflasi +
      " masuk dalam kategori gaya hidup Sederhana (Patokan: ≤ Rp 5.000.000). Rencana anggaran Anda sangat efisien dan hemat. Fokus utama Anda ke depan adalah menjaga gaya hidup sehat agar dana rutin ini tidak terganggu.";
  }

  var teksTotal =
    '<h4 style="margin: 15px 0 10px 0; color: #1b4332; font-size: 15px;">💰 Rekapan Semua / Total Akhir</h4>';
  teksTotal += "<hr style='border-top: 1px solid #ddd; margin-bottom: 10px;'>";
  teksTotal +=
    '<p style="font-size: 14px; margin: 6px 0; display: flex; justify-content: space-between;"><span><b>Total Pengeluaran Bulanan (Semua Menu):</b></span> <b style="font-size: 15px; color: #2d6a4f;">Rp ' +
    Math.round(basisBiayaBulanan).toLocaleString("id-ID") +
    teksStatusInflasi +
    "</b></p>";
  teksTotal +=
    '<p style="font-size: 14px; margin: 6px 0; display: flex; justify-content: space-between;"><span><b>Total Pengeluaran Tahunan:</b></span> <span>Rp ' +
    Math.round(totalTahun).toLocaleString("id-ID") +
    "</span></p>";
  teksTotal +=
    '<p style="font-size: 14px; margin: 6px 0; color: #006064; display: flex; justify-content: space-between;"><span><b>Durasi Masa Pensiun:</b></span> <b>' +
    durasiPensiun +
    " Tahun</b></p>";
  teksTotal += '<hr style="border-top: 2px dashed #28a745; margin: 12px 0;">';
  teksTotal +=
    '<p style="font-size: 16px; margin: 5px 0; color: #28a745;"><b>Total Dana Pensiun yang Harus Disiapkan:</b><br><span style="font-weight: bold; font-size: 22px; display: block; margin-top: 5px; color: #2d6a4f;">Rp ' +
    Math.round(totalKebutuhanPensiun).toLocaleString("id-ID") +
    "</span></p>";

  teksTotal +=
    '<div style="margin-top: 20px; padding: 12px; background-color: #e8f5e9; border-left: 4px solid #2d6a4f; border-radius: 4px; font-size: 13px; line-height: 1.5; color: #1b4332; text-align: justify;">';
  teksTotal += "💡 <b>Kesimpulan Bulanan:</b> " + teksKesimpulan;
  teksTotal += "</div>";

  document.getElementById("teks-hasil").innerHTML = teksKategori;
  document.getElementById("total-akhir").innerHTML = teksTotal;
  document.getElementById("box-hasil").style.display = "block";

  // =========================================================================
  // FUNGSI GAMBAR DIAGRAM LINGKARAN BAWAAN (100% OFFLINE & BEBAS ERROR)
  // =========================================================================
  var namaBabArray = Object.keys(totalPerKategori);
  var totalUangArray = Object.values(totalPerKategori);
  var canvas = document.getElementById("diagramPensiun");
  var ctx = canvas.getContext("2d");

  canvas.width = 300;
  canvas.height = 300;

  var totalDataUang = totalUangArray.reduce(function (a, b) {
    return a + b;
  }, 0);
  var pusatX = canvas.width / 2;
  var pusatY = canvas.height / 2;
  var radius = Math.min(pusatX, pusatY) * 0.8;
  var sudutAwal = -Math.PI / 2;

  var warnaWarni = [
    "#4ea8de",
    "#ffb703",
    "#ff4d6d",
    "#9d4edd",
    "#fb8500",
    "#2a9d8f",
    "#72efdd",
    "#6c757d",
  ];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var k = 0; k < totalUangArray.length; k++) {
    var nilaiUang = totalUangArray[k];
    var besarSudut = (nilaiUang / totalDataUang) * Math.PI * 2;
    var sudutAkhir = sudutAwal + besarSudut;

    ctx.beginPath();
    ctx.moveTo(pusatX, pusatY);
    ctx.arc(pusatX, pusatY, radius, sudutAwal, sudutAkhir);
    ctx.fillStyle = warnaWarni[k % warnaWarni.length];
    ctx.fill();
    ctx.closePath();

    var sudutTengah = sudutAwal + besarSudut / 2;
    var teksX = pusatX + Math.cos(sudutTengah) * radius * 0.55;
    var teksY = pusatY + Math.sin(sudutTengah) * radius * 0.55;
    var persentase = Math.round((nilaiUang / totalDataUang) * 100);

    if (persentase > 3) {
      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(persentase + "%", teksX, teksY);
    }
    sudutAwal = sudutAkhir;
  }

  // =========================================================================
  // 15. OTOMATIS MEMBUAT TEKS PETUNJUK WARNA LEGENDA DIAGRAM (SELALU DI SAMPING)
  // KODE BARU: Hapus flex-direction dari JS agar bisa diatur secara fleksibel oleh CSS
  //  KODE BARU: Berikan hak kendali arah sepenuhnya ke file CSS kamu
  var pembungkusDiagram = canvas.parentNode;
  pembungkusDiagram.className = "wadah-diagram-utama"; // Hubungkan ke class .wadah-diagram-utama di CSS kamu tadi
  pembungkusDiagram.style.cssText =
    "display: flex !important; align-items: center !important; justify-content: center !important; gap: 20px !important; width: 100% !important; max-width: 550px !important; margin: 20px auto !important;";

  // Atur posisi canvas diagram di sebelah kiri
  canvas.style.margin = "0";
  canvas.style.flexShrink = "0";

  var wadahLegenda = document.getElementById("legendaDiagramPensiun");
  if (!wadahLegenda) {
    wadahLegenda = document.createElement("div");
    wadahLegenda.id = "legendaDiagramPensiun";
    pembungkusDiagram.appendChild(wadahLegenda);
  }

  // =========================================================================
  // FIX FINAL LEGENDA: OTOMATIS MENYESUAIKAN LAYAR HP (KE BAWAH) DAN PC (KE SAMPING)
  // =========================================================================
  if (window.innerWidth < 480) {
    // Pengaturan Khusus Layar HP (Diagram susun atas-bawah, Legenda rata tengah)
    pembungkusDiagram.style.setProperty(
      "flex-direction",
      "column",
      "important",
    );
    wadahLegenda.style.cssText =
      "display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 8px !important; width: 100% !important; text-align: center !important; margin-top: 15px !important;";
  } else {
    // Pengaturan Khusus Layar Laptop/PC (Diagram & Legenda tetap berdampingan kiri-kanan)
    pembungkusDiagram.style.setProperty("flex-direction", "row", "important");
    wadahLegenda.style.cssText =
      "display: flex !important; flex-direction: column !important; align-items: flex-start !important; justify-content: center !important; gap: 10px !important; min-width: 200px !important; text-align: left !important; margin: 0 !important;";
  }
  wadahLegenda.innerHTML = "";

  for (var m = 0; m < namaBabArray.length; m++) {
    var itemLegenda = document.createElement("div");

    // Desain baris teks legenda yang rapi tanpa background kaku
    itemLegenda.style.cssText =
      "display: flex !important; align-items: center !important; gap: 8px !important; font-size: 12px !important; font-family: Arial, sans-serif !important; color: #333 !important; white-space: nowrap !important;";

    // Kotak sampel warna
    var kotakWarna = document.createElement("span");
    kotakWarna.style.cssText =
      "display: inline-block !important; width: 12px !important; height: 12px !important; border-radius: 3px !important; flex-shrink: 0 !important; background-color:" +
      warnaWarni[m % warnaWarni.length];

    var teksNamaBab = document.createElement("span");
    teksNamaBab.innerHTML = "<b>" + namaBabArray[m] + "</b>";

    itemLegenda.appendChild(kotakWarna);
    itemLegenda.appendChild(teksNamaBab);
    wadahLegenda.appendChild(itemLegenda);
  }

  document.getElementById("box-hasil").scrollIntoView({ behavior: "smooth" });
};

// =========================================================================
// PENGENDALI MODAL KUSTOM TAMBAH KATEGORI UTAMA DI TENGAH LAYAR HP & PC
// =========================================================================

// 1. Fungsi untuk memunculkan modal putih di tengah layar
function bukaModalKategoriUtama() {
  document.getElementById("inputNamaKategoriBaru").value = "📦 Kategori Baru"; // Nama default bawaan kamu
  document.getElementById("modalTambahKategoriUtama").style.display = "flex";
}

// 2. Fungsi untuk menutup modal jika tombol batal diklik
function tutupModalKategoriUtama() {
  document.getElementById("modalTambahKategoriUtama").style.display = "none";
}

// 3. Fungsi eksekusi yang mengambil teks ketikan lalu mencetaknya ke layar
function eksekusiTambahKategoriUtama() {
  var namaKategoriBaru = document
    .getElementById("inputNamaKategoriBaru")
    .value.trim();

  if (namaKategoriBaru === "") {
    alert("Nama kategori tidak boleh kosong!");
    return;
  }

  // Membuat id kotak unik dan memanggil mesin pencetak bawaan asli milikmu (Menjaga keaslian logika lamamu!)
  var idBaru = "kat_kustom_" + Date.now();
  buatElemenKotakKategoriHTML(idBaru, namaKategoriBaru, [""], false);

  tutupModalKategoriUtama(); // Tutup pop-up setelah sukses mencetak
}

// =========================================================================
// LOGIKA TOMBOL HUBUNGAN HALAMAN HASIL (TOGGLE REKAPAN & PENGGERAK TOMBOL CETAK PDF)
// =========================================================================
document.addEventListener("DOMContentLoaded", function () {
  // 1. Pengendali Tombol Lipat (Hide/Show) Rekapan Menu Kategori
  const btnToggle = document.getElementById("btnToggleRekapan");
  const teksHasil = document.getElementById("teks-hasil");

  if (btnToggle && teksHasil) {
    btnToggle.onclick = function () {
      if (teksHasil.style.display === "none") {
        teksHasil.style.display = "block"; // Munculkan kembali daftar menu
        btnToggle.innerText = "👁️ Sembunyikan Rekapan Kategori";
        btnToggle.style.background = "#e8f5e9";
        btnToggle.style.color = "#2d6a4f";
      } else {
        teksHasil.style.display = "none"; // Sembunyikan daftar menu
        btnToggle.innerText = "👁️ Tampilkan Rekapan Kategori";
        btnToggle.style.background = "#f1f3f5";
        btnToggle.style.color = "#4a5568";
      }
    };
  }

  // 2. Pengendali Tombol Cetak / Unduh Laporan PDF
  const btnCetak = document.getElementById("btnCetakPDF");
  if (btnCetak) {
    btnCetak.onclick = function () {
      window.print(); // Memicu pop-up simpan PDF resmi perangkat
    };
  }
});
