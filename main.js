/* ==========================================================
   Sistem Tabel Periodik - script.js
   Daftar isi:
   1. Helper
   2. Tema, hero, tab, dan scroll
   3. Data unsur dan fungsi perhitungan
   4. Tabel periodik interaktif
   5. Game detektif unsur
   6. Kuis 15 soal
   ========================================================== */


/* ---------- 1. Helper ---------- */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const inRange = (n, from, to) => n >= from && n <= to;


/* ---------- 2. Tema, hero, tab, dan scroll ---------- */

// Tombol ganti tema terang/gelap
$("#theme-btn").onclick = () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;

  root.dataset.theme = isDark ? "light" : "dark";
};

// Garis spektrum di hero: tinggi dan warna dibuat dari rumus sin dan hsl
$("#spectrum").innerHTML = Array.from({ length: 48 }, (_, i) => {
  const height = 20 + Math.abs(Math.sin(i * 1.7)) * 60;
  const hue = i * 6.5;
  return `<i style="height:${height}px;background:hsl(${hue},75%,58%);animation-delay:${i * 22}ms"></i>`;
}).join("");

// Tab: tombol ke-i menampilkan panel ke-i di dalam wadah .tabs yang sama
$$(".tabs").forEach((wrapper) => {
  const buttons = [...wrapper.querySelectorAll(".tab-btn")];
  const panels = [...wrapper.querySelectorAll(".tab-panel")];

  buttons.forEach((button, i) => {
    button.onclick = () => {
      buttons.forEach((b, j) => {
        b.classList.toggle("on", i === j);
        panels[j].classList.toggle("on", i === j);
      });
    };
  });
});

// Progress bar dan penanda menu aktif saat scroll
const sections = $$("section[id]");
const navLinks = $$("nav a");

addEventListener(
  "scroll",
  () => {
    const page = document.documentElement;
    const percent = (scrollY / (page.scrollHeight - innerHeight)) * 100;
    $("#bar").style.width = percent + "%";

    let current = -1;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top < innerHeight * 0.35) current = i;
    });
    navLinks.forEach((link, i) => link.classList.toggle("on", i === current));
  },
  { passive: true }
);


/* ---------- 3. Data unsur dan fungsi perhitungan ---------- */

// Simbol 118 unsur, urut berdasarkan nomor atom
const SYMBOLS = `
  H He Li Be B C N O F Ne
  Na Mg Al Si P S Cl Ar
  K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr
  Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe
  Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu
  Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn
  Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr
  Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og
`.trim().split(/\s+/);

// Nama unsur dalam bahasa Indonesia, urutannya sama dengan SYMBOLS
const NAMES = `
  Hidrogen, Helium, Litium, Berilium, Boron, Karbon, Nitrogen, Oksigen, Fluorin, Neon,
  Natrium, Magnesium, Aluminium, Silikon, Fosfor, Belerang, Klorin, Argon,
  Kalium, Kalsium, Skandium, Titanium, Vanadium, Kromium, Mangan, Besi, Kobalt, Nikel,
  Tembaga, Seng, Galium, Germanium, Arsen, Selenium, Bromin, Kripton,
  Rubidium, Stronsium, Itrium, Zirkonium, Niobium, Molibdenum, Teknesium, Rutenium,
  Rodium, Paladium, Perak, Kadmium, Indium, Timah, Antimon, Telurium, Iodin, Xenon,
  Sesium, Barium, Lantanum, Serium, Praseodimium, Neodimium, Prometium, Samarium,
  Europium, Gadolinium, Terbium, Disprosium, Holmium, Erbium, Tulium, Iterbium, Lutesium,
  Hafnium, Tantalum, Tungsten, Renium, Osmium, Iridium, Platina, Emas, Raksa, Talium,
  Timbal, Bismut, Polonium, Astatin, Radon,
  Fransium, Radium, Aktinium, Torium, Protaktinium, Uranium, Neptunium, Plutonium,
  Amerisium, Kurium, Berkelium, Kalifornium, Einsteinium, Fermium, Mendelevium,
  Nobelium, Lawrensium, Rutherfordium, Dubnium, Seaborgium, Bohrium, Hasium, Meitnerium,
  Darmstadtium, Roentgenium, Kopernisium, Nihonium, Flerovium, Moskovium, Livermorium,
  Tenesin, Oganeson
`.trim().split(/\s*,\s*/);

// 10 kategori unsur beserta warnanya
const CATEGORY_NAMES = [
  "Logam alkali",         // 0
  "Alkali tanah",         // 1
  "Logam transisi",       // 2
  "Logam pasca-transisi", // 3
  "Metaloid",             // 4
  "Nonlogam",             // 5
  "Halogen",              // 6
  "Gas mulia",            // 7
  "Lantanida",            // 8
  "Aktinida",             // 9
];

const CATEGORY_COLORS = [
  "#e5604d", "#e8913a", "#c9a227", "#4aa38a", "#3f9ac4",
  "#5b7fe0", "#9a64d6", "#d65fa3", "#7aa84a", "#b0764a",
];

// Menentukan kategori unsur dari nomor atom z (hasil: angka 0-9)
function getCategory(z) {
  const isOneOf = (list) => list.includes(z);

  if (isOneOf([3, 11, 19, 37, 55, 87])) return 0;      // alkali
  if (isOneOf([4, 12, 20, 38, 56, 88])) return 1;      // alkali tanah
  if (inRange(z, 57, 71)) return 8;                    // lantanida
  if (inRange(z, 89, 103)) return 9;                   // aktinida
  if (isOneOf([2, 10, 18, 36, 54, 86, 118])) return 7; // gas mulia
  if (isOneOf([9, 17, 35, 53, 85, 117])) return 6;     // halogen
  if (isOneOf([5, 14, 32, 33, 51, 52])) return 4;      // metaloid
  if (isOneOf([1, 6, 7, 8, 15, 16, 34])) return 5;     // nonlogam
  if (isOneOf([13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116])) return 3; // pasca-transisi
  return 2;                                            // sisanya logam transisi
}

// Posisi unsur di grid: [baris, kolom]
// Baris 9 dan 10 dipakai untuk lantanida dan aktinida
function getPosition(z) {
  if (z === 1) return [1, 1];
  if (z === 2) return [1, 18];
  if (z <= 4) return [2, z - 2];
  if (z <= 10) return [2, z + 8];
  if (z <= 12) return [3, z - 10];
  if (z <= 18) return [3, z];
  if (z <= 36) return [4, z - 18];
  if (z <= 54) return [5, z - 36];
  if (z <= 56) return [6, z - 54];
  if (z <= 71) return [9, z - 54];
  if (z <= 86) return [6, z - 68];
  if (z <= 88) return [7, z - 86];
  if (z <= 103) return [10, z - 86];
  return [7, z - 100];
}

// Urutan pengisian subkulit (aturan Aufbau) dan kapasitas tiap subkulit
const AUFBAU_ORDER = [
  [1, "s"], [2, "s"], [2, "p"], [3, "s"], [3, "p"], [4, "s"], [3, "d"],
  [4, "p"], [5, "s"], [4, "d"], [5, "p"], [6, "s"], [4, "f"], [5, "d"],
  [6, "p"], [7, "s"], [5, "f"], [6, "d"], [7, "p"],
];
const SUBSHELL_CAPACITY = { s: 2, p: 6, d: 10, f: 14 };

// Konfigurasi elektron, contoh: 1s2 2s2 2p6 ...
function getConfiguration(z) {
  let remaining = z;
  const parts = [];

  for (const [shell, type] of AUFBAU_ORDER) {
    if (remaining <= 0) break;
    const electrons = Math.min(remaining, SUBSHELL_CAPACITY[type]);
    parts.push(`${shell}${type}<sup>${electrons}</sup>`);
    remaining -= electrons;
  }
  return parts.join(" ");
}

// Periode, golongan, blok, dan elektron valensi
function getInfo(z) {
  const [row, col] = getPosition(z);
  const isF = row > 8; // lantanida atau aktinida

  let block = "d";
  if (isF) block = "f";
  else if (z === 2 || col <= 2) block = "s";
  else if (col >= 13) block = "p";

  let valence = "bervariasi";
  if (!isF) {
    if (z === 2) valence = 2;
    else if (col <= 2) valence = col;
    else if (col >= 13) valence = col - 10;
  }

  return {
    period: isF ? (z <= 71 ? 6 : 7) : row,
    group: isF ? "-" : col,
    block,
    valence,
  };
}


/* ---------- 4. Tabel periodik interaktif ---------- */
const tableEl = $("#table");
let activeCategory = null; // kategori yang sedang difilter (null = semua)

// Membuat 118 kotak unsur
SYMBOLS.forEach((symbol, i) => {
  const z = i + 1;
  const [row, col] = getPosition(z);
  const category = getCategory(z);

  const tile = document.createElement("button");
  tile.className = "el";
  tile.style.gridArea = `${row} / ${col}`;
  tile.style.setProperty("--c", CATEGORY_COLORS[category]);
  tile.dataset.category = category;
  tile.title = NAMES[i];
  tile.setAttribute("aria-label", NAMES[i]);
  tile.innerHTML = `<small>${z}</small>${symbol}`;
  tile.onclick = () => showDetail(z);

  tableEl.append(tile);
});

// Penanda rentang lantanida (57-71) dan aktinida (89-103)
[[6, "57–71"], [7, "89–103"]].forEach(([row, text]) => {
  const marker = document.createElement("div");
  marker.className = "placeholder";
  marker.style.gridArea = `${row} / 3`;
  marker.textContent = text;
  tableEl.append(marker);
});

// Panel detail unsur yang diklik
function showDetail(z) {
  const category = getCategory(z);
  const info = getInfo(z);
  const panel = $("#detail");

  panel.style.setProperty("--c", CATEGORY_COLORS[category]);
  panel.innerHTML = `
    <div class="big-tile"><span>${z}</span><b>${SYMBOLS[z - 1]}</b></div>
    <dl class="detail-list">
      <div><dt>Nama</dt><dd>${NAMES[z - 1]}</dd></div>
      <div><dt>Kategori</dt><dd>${CATEGORY_NAMES[category]}</dd></div>
      <div><dt>Periode</dt><dd>${info.period}</dd></div>
      <div><dt>Golongan</dt><dd>${info.group}</dd></div>
      <div><dt>Blok</dt><dd>${info.block}</dd></div>
      <div><dt>Elektron valensi</dt><dd>${info.valence}</dd></div>
      <div style="grid-column: 1 / -1">
        <dt>Konfigurasi elektron</dt><dd>${getConfiguration(z)}</dd>
      </div>
    </dl>`;
}

// Menyaring tabel berdasarkan kategori dan kolom cari
function applyFilter() {
  const query = $("#search").value.trim().toLowerCase();

  $$(".el").forEach((tile, i) => {
    const matchesSearch =
      !query ||
      SYMBOLS[i].toLowerCase() === query ||
      NAMES[i].toLowerCase().includes(query) ||
      String(i + 1) === query;

    const matchesCategory =
      activeCategory === null || Number(tile.dataset.category) === activeCategory;

    tile.classList.toggle("dim", !(matchesCategory && matchesSearch));
  });
}

// Legenda kategori (juga berfungsi sebagai tombol filter)
$("#legend").innerHTML = CATEGORY_NAMES.map(
  (name, i) =>
    `<button class="legend-btn" style="--c:${CATEGORY_COLORS[i]}" data-category="${i}">${name}</button>`
).join("");

$$(".legend-btn").forEach((button) => {
  button.onclick = () => {
    const category = Number(button.dataset.category);
    activeCategory = activeCategory === category ? null : category;

    $$(".legend-btn").forEach((b) =>
      b.classList.toggle("on", Number(b.dataset.category) === activeCategory)
    );
    applyFilter();
  };
});

$("#search").oninput = applyFilter;

showDetail(11); // tampilan awal: natrium


/* ---------- 5. Game detektif unsur ---------- */
let targetZ = 0;

// Membuat soal baru (unsur nomor 1-86, tanpa lantanida)
function newPuzzle() {
  do {
    targetZ = 1 + Math.floor(Math.random() * 86);
  } while (inRange(targetZ, 57, 71));

  const info = getInfo(targetZ);
  const clues = [
    ["Periode", info.period],
    ["Golongan", info.group],
    ["Blok", info.block],
    ["Kategori", CATEGORY_NAMES[getCategory(targetZ)]],
  ];

  $("#clues").innerHTML = clues.map(([label, value]) => `<div><b>${value}</b>${label}</div>`).join("");
  $("#feedback").textContent = "";
  $("#guess-input").value = "";
}

// Memeriksa jawaban (simbol atau nama, tidak peka huruf besar/kecil)
$("#guess-btn").onclick = () => {
  const answer = $("#guess-input").value.trim().toLowerCase();
  if (!answer) return;

  const correct =
    answer === SYMBOLS[targetZ - 1].toLowerCase() ||
    answer === NAMES[targetZ - 1].toLowerCase();

  $("#feedback").textContent = correct
    ? `Benar, itu ${NAMES[targetZ - 1]} (${SYMBOLS[targetZ - 1]}).`
    : "Belum tepat. Cari letaknya di tabel lalu coba lagi.";

  if (correct) setTimeout(newPuzzle, 1400);
};

$("#guess-input").onkeydown = (e) => {
  if (e.key === "Enter") $("#guess-btn").click();
};

$("#hint-btn").onclick = () => {
  $("#feedback").textContent = `Petunjuk: nomor atomnya ${targetZ}.`;
};

$("#new-btn").onclick = newPuzzle;

newPuzzle();


/* ---------- 6. Kuis 15 soal ---------- */
// Format tiap soal: [pertanyaan, [pilihan], indeks jawaban benar, pembahasan]
const QUESTIONS = [
  [
    "Dasar pengelompokan unsur pada sistem periodik modern adalah…",
    ["Massa atom", "Nomor atom", "Jumlah neutron", "Titik leleh"],
    1,
    "Moseley menunjukkan bahwa nomor atom (jumlah proton) adalah dasar urutan unsur.",
  ],
  [
    "Pada triade Döbereiner Li–Na–K, jika Ar Li = 7 dan K = 39, perkiraan Ar Na adalah…",
    ["23", "20", "32", "46"],
    0,
    "Unsur tengah mendekati rata-rata: (7 + 39) / 2 = 23.",
  ],
  [
    "Pengelompokan yang menyatakan unsur ke-8 mirip dengan unsur pertama dikemukakan oleh…",
    ["Döbereiner", "Newlands", "Mendeleev", "Moseley"],
    1,
    "Itu hukum oktaf Newlands, yang dianalogikan dengan tangga nada.",
  ],
  [
    "Mendeleev menyisakan ruang kosong untuk eka-silikon, yang kemudian ditemukan sebagai…",
    ["Galium", "Skandium", "Germanium", "Arsen"],
    2,
    "Sifat eka-silikon yang diprediksi cocok dengan germanium (Ge).",
  ],
  [
    "Sistem periodik modern memiliki…",
    ["7 periode dan 18 golongan", "8 periode dan 16 golongan", "7 periode dan 8 golongan", "18 periode dan 7 golongan"],
    0,
    "Periode (jumlah kulit) ada 7 dan golongan diberi nomor 1 sampai 18.",
  ],
  [
    "Konfigurasi 1s² 2s² 2p⁶ 3s² 3p⁵ terletak pada…",
    ["Periode 3, golongan 15", "Periode 3, golongan 17", "Periode 5, golongan 3", "Periode 2, golongan 17"],
    1,
    "Kulit terbesar n = 3 berarti periode 3. Elektron valensi 3s² 3p⁵ berjumlah 7, jadi golongan 17 (klorin).",
  ],
  [
    "Manakah yang termasuk logam alkali?",
    ["Mg", "Na", "Al", "Ne"],
    1,
    "Natrium (Na) ada di golongan 1. Mg alkali tanah, Al pasca-transisi, Ne gas mulia.",
  ],
  [
    "Gas mulia sangat stabil karena…",
    ["Memiliki banyak proton", "Kulit valensinya terisi penuh", "Massa atomnya kecil", "Mudah melepas elektron"],
    1,
    "Konfigurasi duplet atau oktet membuatnya sukar bereaksi.",
  ],
  [
    "Jari-jari atom mengecil dari kiri ke kanan dalam satu periode karena…",
    ["Jumlah kulit bertambah", "Muatan inti efektif bertambah sementara jumlah kulit tetap", "Jumlah neutron berkurang", "Elektron valensi berkurang"],
    1,
    "Tarikan inti pada kulit valensi makin kuat sehingga atom menyusut.",
  ],
  [
    "Energi ionisasi pertama tertinggi dimiliki oleh…",
    ["Li", "F", "He", "Cs"],
    2,
    "He berukuran sangat kecil dan kulitnya penuh, sehingga elektronnya paling sulit dilepas.",
  ],
  [
    "Unsur dengan keelektronegatifan terbesar adalah…",
    ["O", "Cl", "N", "F"],
    3,
    "Fluorin bernilai 3,98 pada skala Pauling.",
  ],
  [
    "Unsur Fe termasuk blok…",
    ["s", "p", "d", "f"],
    2,
    "Fe (Z = 26) berakhir di subkulit 3d, jadi logam transisi blok d.",
  ],
  [
    "Elektron valensi 3s² 3p⁴ menunjukkan unsur golongan…",
    ["14", "15", "16", "18"],
    2,
    "Enam elektron valensi berarti golongan 16 (kalkogen). Periode 3 menunjuk ke belerang.",
  ],
  [
    "Manakah yang tergolong metaloid?",
    ["Si", "Na", "Cl", "Cu"],
    0,
    "Silikon bersifat semikonduktor dan menjadi dasar chip komputer.",
  ],
  [
    "Urutan jari-jari atom yang benar dari kecil ke besar adalah…",
    ["K < Na < Li", "Li < Na < K", "Na < Li < K", "Li < K < Na"],
    1,
    "Dalam satu golongan, jari-jari bertambah ke bawah karena jumlah kulit bertambah.",
  ],
];

let questionIndex = 0;
let score = 0;

// Menampilkan soal saat ini, atau skor akhir jika semua soal selesai
function renderQuestion() {
  const box = $("#quiz");

  // Layar hasil
  if (questionIndex >= QUESTIONS.length) {
    let message = "Pelajari lagi Bab 2, lalu coba ulang.";
    if (score >= 13) message = "Luar biasa, pemahamanmu sudah kuat.";
    else if (score >= 9) message = "Bagus, tinggal sedikit lagi.";

    box.innerHTML = `
      <h3 style="margin-top:0">Skor kamu ${score} dari ${QUESTIONS.length}</h3>
      <p>${message}</p>
      <button class="btn" id="restart-btn">Ulangi kuis</button>`;

    $("#quiz-progress").style.width = "100%";
    $("#restart-btn").onclick = () => {
      questionIndex = 0;
      score = 0;
      renderQuestion();
    };
    return;
  }

  // Layar soal
  const [question, options, correctIndex, explanation] = QUESTIONS[questionIndex];
  $("#quiz-progress").style.width = (questionIndex / QUESTIONS.length) * 100 + "%";

  box.innerHTML =
    `<p class="muted" style="margin:0 0 6px">Soal ${questionIndex + 1} dari ${QUESTIONS.length}</p>` +
    `<h4>${question}</h4>` +
    options.map((text, i) => `<button class="option" data-i="${i}">${text}</button>`).join("") +
    `<p id="explanation" aria-live="polite"></p>`;

  $$(".option").forEach((button) => {
    button.onclick = () => {
      const chosen = Number(button.dataset.i);
      const isCorrect = chosen === correctIndex;

      // Kunci semua pilihan dan tandai jawaban yang benar
      $$(".option").forEach((option, i) => {
        option.disabled = true;
        if (i === correctIndex) option.classList.add("ok");
      });

      if (isCorrect) score++;
      else button.classList.add("no");

      const isLast = questionIndex === QUESTIONS.length - 1;
      $("#explanation").innerHTML =
        (isCorrect ? "Benar. " : "Kurang tepat. ") +
        explanation +
        `<br><button class="btn" id="next-btn" style="margin-top:12px">` +
        (isLast ? "Lihat skor" : "Soal berikutnya") +
        `</button>`;

      $("#next-btn").onclick = () => {
        questionIndex++;
        renderQuestion();
      };
    };
  });
}

renderQuestion();
