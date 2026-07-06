/* ==========================================================
   TASK GROUP
   SCRIPT.JS FINAL
   ========================================================== */

/* ==========================================================
   KONFIGURASI
========================================================== */

const STORAGE_KEY = "taskGroupData";

const JSON_FILE = "data-tugas.json";

/* ==========================================================
   DATA APLIKASI
========================================================== */

let daftarTugas = [];

let hasilFilter = [];

let idEdit = null;

/* ==========================================================
   ELEMENT HTML
========================================================== */

const taskContainer = document.getElementById("taskContainer");

const taskForm = document.getElementById("taskForm");

const loading = document.getElementById("loading");

const emptyState = document.getElementById("emptyState");

const hasil = document.getElementById("hasil");

/* ---------- Search & Filter ---------- */

const searchInput = document.getElementById("searchInput");

const statusFilter = document.getElementById("statusFilter");

const priorityFilter = document.getElementById("priorityFilter");

const resetFilterBtn = document.getElementById("resetFilterBtn");

/* ---------- Statistik ---------- */

const totalTask = document.getElementById("totalTask");

const taskPending = document.getElementById("taskPending");

const taskProcess = document.getElementById("taskProcess");

const taskDone = document.getElementById("taskDone");

const highPriorityTask = document.getElementById("highPriorityTask");

/* ---------- Progress ---------- */

const progressBar = document.getElementById("progressBar");

const progressText = document.getElementById("progressText");

const progressDetail = document.getElementById("progressDetail");

/* ---------- Dark Mode ---------- */

const darkModeBtn = document.getElementById("darkModeBtn");

/* ---------- Toast ---------- */

const toastElement = document.getElementById("liveToast");

const toastMessage = document.getElementById("toastMessage");

/* ---------- Modal Edit ---------- */

const editModalElement = document.getElementById("editModal");

const btnUpdate = document.getElementById("btnUpdate");

/* ==========================================================
   INISIALISASI
========================================================== */

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {

    aktifkanDarkMode();

    pasangEvent();

    await loadData();

}
/* ==========================================================
   LOAD DATA
========================================================== */

async function loadData() {

    showLoading();

    try {

        const localData = localStorage.getItem(STORAGE_KEY);

        if (localData) {

            daftarTugas = JSON.parse(localData);

        } else {

            const response = await fetch(JSON_FILE);

            if (!response.ok) {
                throw new Error("Gagal mengambil data JSON.");
            }

            daftarTugas = await response.json();

            saveData();
        }

        hasilFilter = [...daftarTugas];

        renderData(hasilFilter);

        updateStatistik();

        updateProgress();

    } catch (error) {

        console.error(error);

        taskContainer.innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger text-center">

                    <h5>Gagal Memuat Data</h5>

                    <p class="mb-0">
                        Periksa file <strong>${JSON_FILE}</strong>
                        atau jalankan menggunakan Live Server.
                    </p>

                </div>

            </div>

        `;

    } finally {

        hideLoading();

    }

}

/* ==========================================================
   LOCAL STORAGE
========================================================== */

function saveData() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(daftarTugas)

    );

}

/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    loading.classList.remove("d-none");

}

function hideLoading() {

    loading.classList.add("d-none");

}

/* ==========================================================
   REFRESH DATA
========================================================== */

function refreshData() {

    hasilFilter = [...daftarTugas];

    renderData(hasilFilter);

    updateStatistik();

    updateProgress();

    saveData();

}
/* ==========================================================
   RENDER DATA
========================================================== */

function renderData(data) {

    taskContainer.innerHTML = "";

    if (data.length === 0) {

        emptyState.classList.remove("d-none");

        return;

    }

    emptyState.classList.add("d-none");

    data.forEach((tugas) => {

        taskContainer.insertAdjacentHTML(

            "beforeend",

            createTaskCard(tugas)

        );

    });

}

/* ==========================================================
   MEMBUAT CARD TUGAS
========================================================== */

function createTaskCard(tugas) {

    const badgeStatus = getStatusBadge(tugas.status);

    const badgePrioritas = getPriorityBadge(tugas.prioritas);

    const deadline = getDeadlineInfo(tugas.deadline);

    return `

<div class="col-lg-4 col-md-6">

    <div class="card task-card shadow-sm h-100">

        <div class="card-body d-flex flex-column">

            <h4 class="mb-3">

                ${tugas.judulTugas}

            </h4>

            <p>

                <strong>👤 Anggota</strong><br>

                ${tugas.anggota}

            </p>

            <p>

                <strong>📂 Kategori</strong><br>

                ${tugas.kategori}

            </p>

            <p>

                <strong>📅 Deadline</strong><br>

                ${tugas.deadline}

                <br>

                <small class="${deadline.className}">

                    ${deadline.text}

                </small>

            </p>

            <p>

                ${badgeStatus}

                ${badgePrioritas}

            </p>

            <p class="flex-grow-1">

                ${tugas.deskripsi}

            </p>

            <div class="d-grid gap-2">

                <button
                    class="btn btn-warning"
                    onclick="editTugas(${tugas.id})">

                    <i class="bi bi-pencil-square"></i>

                    Edit

                </button>

                <button
                    class="btn btn-danger"
                    onclick="hapusTugas(${tugas.id})">

                    <i class="bi bi-trash"></i>

                    Hapus

                </button>

            </div>

        </div>

    </div>

</div>

`;

}
/* ==========================================================
   BADGE STATUS
========================================================== */

function getStatusBadge(status) {

    switch (status) {

        case "Belum Dikerjakan":

            return `<span class="badge bg-secondary">${status}</span>`;

        case "Proses":

            return `<span class="badge bg-warning text-dark">${status}</span>`;

        case "Selesai":

            return `<span class="badge bg-success">${status}</span>`;

        default:

            return `<span class="badge bg-dark">${status}</span>`;

    }

}

/* ==========================================================
   BADGE PRIORITAS
========================================================== */

function getPriorityBadge(prioritas) {

    switch (prioritas) {

        case "Rendah":

            return `<span class="badge bg-success">${prioritas}</span>`;

        case "Sedang":

            return `<span class="badge bg-warning text-dark">${prioritas}</span>`;

        case "Tinggi":

            return `<span class="badge bg-danger">${prioritas}</span>`;

        default:

            return `<span class="badge bg-dark">${prioritas}</span>`;

    }

}
/* ==========================================================
   INFORMASI DEADLINE
========================================================== */

function getDeadlineInfo(deadline) {

    const hariIni = new Date();

    const batas = new Date(deadline);

    hariIni.setHours(0,0,0,0);

    batas.setHours(0,0,0,0);

    const selisih = Math.ceil(

        (batas - hariIni)

        /

        (1000 * 60 * 60 * 24)

    );

    if (selisih < 0) {

        return {

            text: "🔴 Terlambat",

            className: "deadline-danger"

        };

    }

    if (selisih <= 3) {

        return {

            text: `🟡 ${selisih} hari lagi`,

            className: "deadline-warning"

        };

    }

    return {

        text: `🟢 Masih ${selisih} hari`,

        className: "text-success"

    };

}
/* ==========================================================
   UPDATE STATISTIK
========================================================== */

function updateStatistik() {

    totalTask.textContent = daftarTugas.length;

    taskPending.textContent = daftarTugas.filter(

        tugas => tugas.status === "Belum Dikerjakan"

    ).length;

    taskProcess.textContent = daftarTugas.filter(

        tugas => tugas.status === "Proses"

    ).length;

    taskDone.textContent = daftarTugas.filter(

        tugas => tugas.status === "Selesai"

    ).length;

    highPriorityTask.textContent = daftarTugas.filter(

        tugas => tugas.prioritas === "Tinggi"

    ).length;

}
/* ==========================================================
   UPDATE PROGRESS
========================================================== */

function updateProgress() {

    const total = daftarTugas.length;

    const selesai = daftarTugas.filter(

        tugas => tugas.status === "Selesai"

    ).length;

    const persen = total === 0

        ? 0

        : Math.round((selesai / total) * 100);

    progressBar.style.width = persen + "%";

    progressBar.textContent = persen + "%";

    progressText.textContent = persen + "%";

    progressDetail.textContent =

        `${selesai} dari ${total} tugas selesai`;

    updateProgressColor(persen);

}
/* ==========================================================
   WARNA PROGRESS
========================================================== */

function updateProgressColor(persen) {

    progressBar.classList.remove(

        "bg-danger",

        "bg-warning",

        "bg-success"

    );

    if (persen < 40) {

        progressBar.classList.add("bg-danger");

    }

    else if (persen < 80) {

        progressBar.classList.add("bg-warning");

    }

    else {

        progressBar.classList.add("bg-success");

    }

}
/* ==========================================================
   HITUNG RINGKASAN
========================================================== */

function getRingkasanProyek() {

    return {

        total: daftarTugas.length,

        pending: daftarTugas.filter(

            tugas => tugas.status === "Belum Dikerjakan"

        ).length,

        proses: daftarTugas.filter(

            tugas => tugas.status === "Proses"

        ).length,

        selesai: daftarTugas.filter(

            tugas => tugas.status === "Selesai"

        ).length,

        tinggi: daftarTugas.filter(

            tugas => tugas.prioritas === "Tinggi"

        ).length

    };

}
/* ==========================================================
   PASANG EVENT
========================================================== */

function pasangEvent() {

    searchInput.addEventListener(

        "input",

        filterData

    );

    statusFilter.addEventListener(

        "change",

        filterData

    );

    priorityFilter.addEventListener(

        "change",

        filterData

    );

    resetFilterBtn.addEventListener(

        "click",

        resetFilter

    );

    taskForm.addEventListener(

        "submit",

        tambahTugas

    );

}
/* ==========================================================
   FILTER DATA
========================================================== */

function filterData() {

    const keyword =

        searchInput.value.trim().toLowerCase();

    const status =

        statusFilter.value;

    const prioritas =

        priorityFilter.value;

    hasilFilter = daftarTugas.filter((tugas) => {

        const cocokKeyword =

            tugas.judulTugas.toLowerCase().includes(keyword)

            ||

            tugas.anggota.toLowerCase().includes(keyword)

            ||

            tugas.kategori.toLowerCase().includes(keyword)

            ||

            tugas.deskripsi.toLowerCase().includes(keyword);

        const cocokStatus =

            status === ""

            ||

            tugas.status === status;

        const cocokPrioritas =

            prioritas === ""

            ||

            tugas.prioritas === prioritas;

        return (

            cocokKeyword

            &&

            cocokStatus

            &&

            cocokPrioritas

        );

    });

    renderData(hasilFilter);

}
/* ==========================================================
   RESET FILTER
========================================================== */

function resetFilter() {

    searchInput.value = "";

    statusFilter.value = "";

    priorityFilter.value = "";

    hasilFilter = [...daftarTugas];

    renderData(hasilFilter);

}
/* ==========================================================
   CARI BERDASARKAN ID
========================================================== */

function cariTugas(id) {

    return daftarTugas.find(

        tugas => tugas.id === id

    );

}
/* ==========================================================
   VALIDASI FORM
========================================================== */

function validasiForm(data) {

    bersihkanError();

    let valid = true;

    if (data.judulTugas.length < 5) {

        document.getElementById("judulError").textContent =
            "Judul minimal 5 karakter.";

        valid = false;

    }

    if (data.anggota.length < 3) {

        document.getElementById("anggotaError").textContent =
            "Nama anggota minimal 3 karakter.";

        valid = false;

    }

    if (data.deadline === "") {

        document.getElementById("deadlineError").textContent =
            "Pilih deadline.";

        valid = false;

    }

    if (data.status === "") {

        document.getElementById("statusError").textContent =
            "Pilih status.";

        valid = false;

    }

    if (data.prioritas === "") {

        document.getElementById("prioritasError").textContent =
            "Pilih prioritas.";

        valid = false;

    }

    return valid;

}
/* ==========================================================
   BERSIHKAN ERROR
========================================================== */

function bersihkanError() {

    document.getElementById("judulError").textContent = "";

    document.getElementById("anggotaError").textContent = "";

    document.getElementById("deadlineError").textContent = "";

    document.getElementById("statusError").textContent = "";

    document.getElementById("prioritasError").textContent = "";

}
/* ==========================================================
   TAMBAH TUGAS
========================================================== */

function tambahTugas(event) {

    event.preventDefault();

    const tugasBaru = {

        id: Date.now(),

        judulTugas: document.getElementById("judul").value.trim(),

        anggota: document.getElementById("anggota").value.trim(),

        kategori: document.getElementById("kategori").value.trim(),

        deadline: document.getElementById("deadline").value,

        status: document.getElementById("status").value,

        prioritas: document.getElementById("prioritas").value,

        deskripsi: document.getElementById("deskripsi").value.trim()

    };

    if (!validasiForm(tugasBaru)) {

        return;

    }

    daftarTugas.push(tugasBaru);

    refreshData();

    taskForm.reset();

    tampilRingkasan(tugasBaru);

    tampilToast("Tugas berhasil ditambahkan.");

}
/* ==========================================================
   RINGKASAN DATA
========================================================== */

function tampilRingkasan(tugas) {

    hasil.classList.remove("d-none");

    hasil.innerHTML = `

        <h5>✅ Data Berhasil Ditambahkan</h5>

        <hr>

        <p><strong>Judul :</strong> ${tugas.judulTugas}</p>

        <p><strong>Anggota :</strong> ${tugas.anggota}</p>

        <p><strong>Kategori :</strong> ${tugas.kategori}</p>

        <p><strong>Deadline :</strong> ${tugas.deadline}</p>

        <p><strong>Status :</strong> ${tugas.status}</p>

        <p><strong>Prioritas :</strong> ${tugas.prioritas}</p>

    `;

    hasil.scrollIntoView({

        behavior: "smooth"

    });

}
/* ==========================================================
   EDIT TUGAS
========================================================== */

function editTugas(id) {

    const tugas = cariTugas(id);

    if (!tugas) return;

    idEdit = id;

    document.getElementById("editId").value = tugas.id;

    document.getElementById("editJudul").value = tugas.judulTugas;

    document.getElementById("editAnggota").value = tugas.anggota;

    document.getElementById("editKategori").value = tugas.kategori;

    document.getElementById("editDeadline").value = tugas.deadline;

    document.getElementById("editStatus").value = tugas.status;

    document.getElementById("editPrioritas").value = tugas.prioritas;

    document.getElementById("editDeskripsi").value = tugas.deskripsi;

    const modal = new bootstrap.Modal(editModalElement);

    modal.show();

}
/* ==========================================================
   EVENT BUTTON UPDATE
========================================================== */

btnUpdate.addEventListener(

    "click",

    simpanPerubahan

);
/* ==========================================================
   SIMPAN PERUBAHAN
========================================================== */

function simpanPerubahan() {

    const tugas = cariTugas(idEdit);

    if (!tugas) return;

    const dataBaru = {

        judulTugas: document.getElementById("editJudul").value.trim(),

        anggota: document.getElementById("editAnggota").value.trim(),

        kategori: document.getElementById("editKategori").value.trim(),

        deadline: document.getElementById("editDeadline").value,

        status: document.getElementById("editStatus").value,

        prioritas: document.getElementById("editPrioritas").value,

        deskripsi: document.getElementById("editDeskripsi").value.trim()

    };

    if (!validasiForm(dataBaru)) {

        return;

    }

    Object.assign(tugas, dataBaru);

    refreshData();

    bootstrap.Modal.getInstance(

        editModalElement

    ).hide();

    tampilToast("Tugas berhasil diperbarui.");

}
/* ==========================================================
   HAPUS TUGAS
========================================================== */

function hapusTugas(id) {

    const yakin = confirm(

        "Apakah Anda yakin ingin menghapus tugas ini?"

    );

    if (!yakin) return;

    daftarTugas = daftarTugas.filter(

        tugas => tugas.id !== id

    );

    refreshData();

    tampilToast("Tugas berhasil dihapus.");

}
/* ==========================================================
   TOAST NOTIFICATION
========================================================== */

function tampilToast(pesan) {

    if (!toastElement) return;

    toastMessage.textContent = pesan;

    const toast = new bootstrap.Toast(toastElement, {

        delay: 2500

    });

    toast.show();

}
/* ==========================================================
   DARK MODE
========================================================== */

function aktifkanDarkMode() {

    const tema = localStorage.getItem("theme");

    if (tema === "dark") {

        document.body.classList.add("dark-mode");

        ubahIconDarkMode(true);

    }

    darkModeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        const darkAktif = document.body.classList.contains("dark-mode");

        localStorage.setItem(

            "theme",

            darkAktif ? "dark" : "light"

        );

        ubahIconDarkMode(darkAktif);

    });

}
/* ==========================================================
   UBAH ICON DARK MODE
========================================================== */

function ubahIconDarkMode(dark) {

    if (dark) {

        darkModeBtn.innerHTML =

        '<i class="bi bi-sun-fill"></i> Light Mode';

    }

    else {

        darkModeBtn.innerHTML =

        '<i class="bi bi-moon-stars-fill"></i> Dark Mode';

    }

}
/* ==========================================================
   FORMAT TANGGAL
========================================================== */

function formatTanggal(tanggal) {

    return new Date(tanggal).toLocaleDateString(

        "id-ID",

        {

            day: "2-digit",

            month: "long",

            year: "numeric"

        }

    );

}
/* ==========================================================
   RESET RINGKASAN
========================================================== */

function resetRingkasan() {

    hasil.classList.add("d-none");

    hasil.innerHTML = "";

}
/* ==========================================================
   DEBUG
========================================================== */

console.log("Task Group siap digunakan.");
