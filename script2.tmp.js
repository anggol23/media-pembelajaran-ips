
    // Kuis Auth Logic
    // Dashboard Guru Logic
    const formLoginGuru = document.getElementById('form-login-guru');
    const guruUsernameInput = document.getElementById('guru-username');
    const guruPasswordInput = document.getElementById('guru-password');
    const guruLoginError = document.getElementById('guru-login-error');
    const guruLoginPanel = document.getElementById('guru-login-panel');
    const dashboardGuruContent = document.getElementById('dashboard-guru-content');
    const GURU_USERNAME = 'guru12345';
    const GURU_PASSWORD = 'guru###';
    const GURU_AUTH_KEY = 'guruDashboardLoggedIn';

    function isGuruLoggedIn() {
      return localStorage.getItem(GURU_AUTH_KEY) === 'true';
    }

    function updateGuruDashboardAccess() {
      const loggedIn = isGuruLoggedIn();
      if (guruLoginPanel) guruLoginPanel.classList.toggle('hidden', loggedIn);
      if (dashboardGuruContent) dashboardGuruContent.classList.toggle('hidden', !loggedIn);
    }

    if (formLoginGuru) {
      formLoginGuru.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = guruUsernameInput ? guruUsernameInput.value.trim() : '';
        const password = guruPasswordInput ? guruPasswordInput.value : '';

        if (username === GURU_USERNAME && password === GURU_PASSWORD) {
          localStorage.setItem(GURU_AUTH_KEY, 'true');
          if (guruLoginError) {
            guruLoginError.textContent = '';
            guruLoginError.classList.add('hidden');
          }
          updateGuruDashboardAccess();
          if (typeof window._refreshSemuaPanel === 'function') {
            window._refreshSemuaPanel();
          }
          if (typeof window.mulaiDashboardGuruPolling === 'function') {
            window.mulaiDashboardGuruPolling();
          }
        } else {
          localStorage.removeItem(GURU_AUTH_KEY);
          if (guruLoginError) {
            guruLoginError.textContent = 'Username atau password guru salah!';
            guruLoginError.classList.remove('hidden');
          }
          updateGuruDashboardAccess();
        }
      });
    }

    updateGuruDashboardAccess();

    const formDashboardGuru = document.getElementById('form-dashboard-guru');
    const kodeKuisGuruInput = document.getElementById('kode-kuis-guru');
    const dashboardGuruSuccess = document.getElementById('dashboard-guru-success');
    if(formDashboardGuru) {
      // Set input value dari localStorage jika ada
      const kodeKuisTersimpan = localStorage.getItem('kodeKuisGuru') || 'IPS2024';
      kodeKuisGuruInput.value = kodeKuisTersimpan;
      formDashboardGuru.addEventListener('submit', function(e) {
        e.preventDefault();
        const kodeBaru = kodeKuisGuruInput.value.trim();
        if(!kodeBaru) return;
        localStorage.setItem('kodeKuisGuru', kodeBaru);
        dashboardGuruSuccess.textContent = 'Kode kuis berhasil disimpan!';
        dashboardGuruSuccess.classList.remove('hidden');
        setTimeout(()=>dashboardGuruSuccess.classList.add('hidden'), 2000);
      });
    }

    // Kuis Auth Logic
    const formKuisAuth = document.getElementById('form-kuis-auth');
    const kodeKuisInput = document.getElementById('kode-kuis');
    const namaLengkapInput = document.getElementById('nama-lengkap');
    const noAbsenInput = document.getElementById('no-absen');
    const errorAuth = document.getElementById('kuis-auth-error');
    const kuisAuthDiv = document.getElementById('kuis-auth');
    const kuisTitle = document.getElementById('kuis-title');
    const characterSelection = document.getElementById('character-selection');
    window.siswaNama = '';
    window.siswaAbsen = '';
    if(formKuisAuth) {
      formKuisAuth.addEventListener('submit', function(e) {
        e.preventDefault();
        const kode = kodeKuisInput.value.trim();
        const nama = namaLengkapInput.value.trim();
        const absen = noAbsenInput.value.trim();
        const kodeKuisBenar = localStorage.getItem('kodeKuisGuru') || 'IPS2024';
        if(!kode || !nama || !absen) {
          errorAuth.textContent = 'Semua data harus diisi.';
          errorAuth.classList.remove('hidden');
          return;
        }
        if(kode !== kodeKuisBenar) {
          errorAuth.textContent = 'Kode kuis salah!';
          errorAuth.classList.remove('hidden');
          return;
        }
        // Sukses login, masukkan ke daftar peserta (tanpa karakter)
        window.siswaNama = nama;
        window.siswaAbsen = absen;
        try {
          const pesertaKey = 'daftarPesertaKuis';
          let daftar = [];
          try { daftar = JSON.parse(localStorage.getItem(pesertaKey)) || []; } catch(e) { daftar = []; }
          const idx = daftar.findIndex(p => p.nama === nama && p.absen === absen);
          const pesertaBaru = { nama, absen, karakter: -1, waktu: new Date().toISOString() };
          if(idx >= 0) daftar[idx] = pesertaBaru;
          else daftar.push(pesertaBaru);
          localStorage.setItem(pesertaKey, JSON.stringify(daftar));
        } catch(e) {}
        errorAuth.classList.add('hidden');
        kuisAuthDiv.style.display = 'none';
        document.getElementById('waiting-room').style.display = '';
        tampilkanWaitingList();
        tampilkanCharacterSelectionDiWaiting();
        tungguKuisDimulaiOlehGuru();
      });
    }

    // Fungsi halaman tunggu siswa
    function tampilkanWaitingList() {
      const el = document.getElementById('waiting-list');
      if (!el) return;
      let daftar = [];
      try { daftar = JSON.parse(localStorage.getItem('daftarPesertaKuis')) || []; } catch(e) { daftar = []; }
      el.innerHTML = daftar.length === 0 ? '<div class="text-gray-400">Belum ada peserta lain.</div>' :
        '<ul class="text-left">' + daftar.map(p => `<li class="mb-1">${p.nama} <span class="text-xs text-gray-500">(Absen: ${p.absen})</span></li>`).join('') + '</ul>';
    }
    function tungguKuisDimulaiOlehGuru() {
      // Cek status setiap 1 detik
      const interval = setInterval(() => {
        if(localStorage.getItem('kuisSudahDimulai') === 'true') {
          clearInterval(interval);
          document.getElementById('waiting-room').style.display = 'none';
          // Cek apakah karakter sudah dipilih
          let charIdx = selectedCharacter;
          if (charIdx === -1 || typeof charIdx !== 'number') {
            // Cek ke localStorage daftarPesertaKuis
            try {
              const pesertaKey = 'daftarPesertaKuis';
              let daftar = [];
              try { daftar = JSON.parse(localStorage.getItem(pesertaKey)) || []; } catch(e) { daftar = []; }
              const idx = daftar.findIndex(p => p.nama === window.siswaNama && p.absen === window.siswaAbsen);
              if(idx >= 0 && typeof daftar[idx].karakter === 'number' && daftar[idx].karakter >= 0) {
                charIdx = daftar[idx].karakter;
                selectedCharacter = charIdx;
              }
            } catch(e) {}
          }
          if(charIdx === -1 || typeof charIdx !== 'number') {
            // Karakter belum dipilih: tampilkan pilihan karakter standalone (bukan di dalam waiting-room)
            document.getElementById('waiting-room').style.display = 'none';
            document.getElementById('quiz-container').classList.add('hidden');
            document.getElementById('character-selection').style.display = '';
            // Refresh highlight seandainya ada yang sudah dipilih sebelumnya
            document.querySelectorAll('#character-selection .character-card').forEach((el, i) => {
              el.classList.toggle('ring-4', i === selectedCharacter);
              el.classList.toggle('ring-emerald-400', i === selectedCharacter);
            });
            return;
          }
          // Jika karakter sudah dipilih, baru jalankan countdown dan mulai kuis
          mulaiCountdownAnim(function() {
            kuisTitle.style.display = '';
            mulaiKuisSetelahPilihKarakter();
          });
        } else {
          tampilkanWaitingList();
        }
      }, 1000);
    }

    // Tampilkan pilihan karakter di waiting room menggunakan innerHTML (BUKAN memindahkan elemen)
    function tampilkanCharacterSelectionDiWaiting() {
      const dest = document.getElementById('waiting-character-selection');
      if (!dest) return;
      const chars = [
        { emoji: 'ðŸ‘¨', nama: 'Andi',   cls: 'from-blue-100 to-blue-50 border-blue-200' },
        { emoji: 'ðŸ‘©', nama: 'Sinta',  cls: 'from-pink-100 to-pink-50 border-pink-200' },
        { emoji: 'ðŸ§‘â€ðŸ¦±', nama: 'Rafa',   cls: 'from-purple-100 to-purple-50 border-purple-200' },
        { emoji: 'ðŸ‘³', nama: 'Hendra', cls: 'from-yellow-100 to-yellow-50 border-yellow-200' },
        { emoji: 'ðŸ§”', nama: 'Budi',   cls: 'from-green-100 to-green-50 border-green-200' },
        { emoji: 'ðŸ‘©â€ðŸ¦°', nama: 'Dina',   cls: 'from-red-100 to-red-50 border-red-200' },
        { emoji: 'ðŸ¦¹', nama: 'Supra',  cls: 'from-cyan-100 to-cyan-50 border-cyan-200' },
        { emoji: 'ðŸ¦¸', nama: 'Sary',   cls: 'from-orange-100 to-orange-50 border-orange-200' },
      ];
      dest.innerHTML = `
        <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">Pilih Karaktermu! ðŸ‘¤</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          ${chars.map((c, i) => `
            <div onclick="selectCharacter(${i})" class="character-card bg-gradient-to-br ${c.cls} p-4 rounded-2xl border-2 cursor-pointer hover:scale-110 transition-transform text-center">
              <div class="text-5xl mb-2">${c.emoji}</div>
              <p class="font-bold text-gray-800 text-sm">${c.nama}</p>
            </div>`).join('')}
        </div>`;
    }

    // Setelah countdown, cek karakter sudah dipilih, jika belum, tetap di halaman karakter
    function mulaiKuisSetelahPilihKarakter() {
      // Guard: jangan mulai kuis jika guru belum menekan Mulai Kuis
      if (localStorage.getItem('kuisSudahDimulai') !== 'true') {
        // Kembalikan ke waiting room jika somehow dipanggil sebelum waktunya
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('character-selection').style.display = 'none';
        document.getElementById('waiting-room').style.display = '';
        return;
      }
      // Sinkronkan selectedCharacter dengan localStorage jika perlu
      let charIdx = selectedCharacter;
      if (charIdx === -1 || typeof charIdx !== 'number') {
        try {
          const pesertaKey = 'daftarPesertaKuis';
          let daftar = [];
          try { daftar = JSON.parse(localStorage.getItem(pesertaKey)) || []; } catch(e) { daftar = []; }
          const idx = daftar.findIndex(p => p.nama === window.siswaNama && p.absen === window.siswaAbsen);
          if(idx >= 0 && typeof daftar[idx].karakter === 'number' && daftar[idx].karakter >= 0) {
            charIdx = daftar[idx].karakter;
            selectedCharacter = charIdx;
          }
        } catch(e) {}
      }
      // Jika karakter belum dipilih, tampilkan pemilihan karakter dan JANGAN lanjut ke soal
      if(charIdx === -1 || typeof charIdx !== 'number') {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('character-selection').style.display = '';
        // Alert hanya sekali
        if (!window._sudahAlertPilihKarakter) {
          window._sudahAlertPilihKarakter = true;
          alert('Silakan pilih karakter terlebih dahulu!');
        }
        // Jangan panggil mulaiKuisSetelahPilihKarakter() lagi otomatis!
        return;
      }
      // Jika karakter sudah dipilih, pastikan character-selection disembunyikan dan quiz-container tampil
      document.getElementById('character-selection').style.display = 'none';
      document.getElementById('kuis-title').style.display = '';
      document.getElementById('quiz-container').classList.remove('hidden');
      document.getElementById('total-questions').textContent = quizData.length;
      if (typeof selectedCharacter === 'number' && selectedCharacter >= 0) {
        loadQuestion();
      }
      window._sudahAlertPilihKarakter = false;
    }

    // Fungsi animasi countdown 3 2 1
    function mulaiCountdownAnim(callback) {
      const countdownDiv = document.getElementById('countdown-anim');
      const numberDiv = document.getElementById('countdown-number');
      countdownDiv.style.display = '';
      let count = 3;
      numberDiv.textContent = count;
      numberDiv.classList.remove('text-red-500','text-yellow-500','text-emerald-600');
      numberDiv.classList.add('text-emerald-600');
      const colors = ['text-emerald-600','text-yellow-500','text-red-500'];
      const interval = setInterval(() => {
        count--;
        if(count > 0) {
          numberDiv.textContent = count;
          numberDiv.className = 'text-7xl font-extrabold animate-bounce ' + colors[3-count];
        } else if(count === 0) {
          numberDiv.textContent = 'Mulai!';
          numberDiv.className = 'text-7xl font-extrabold animate-bounce text-emerald-600';
        } else {
          clearInterval(interval);
          countdownDiv.style.display = 'none';
          if(typeof callback === 'function') callback();
        }
      }, 1000);
    }

    // Simpan jawaban siswa untuk review
    let siswaJawaban = [];
    // Modifikasi fungsi submit jawaban quiz (asumsi ada fungsi submitQuiz atau showResults)
    // Patch ke fungsi showResults (atau fungsi serupa) di bawah ini:
    // --- PATCH START ---
    // Temukan fungsi yang menampilkan hasil, lalu tambahkan kode berikut:
    function showResults() {
      // Calculate score only for multiple choice questions (10 questions), not the reflection
      const multiChoiceQuestions = 10;
      const percentage = (correctCount / multiChoiceQuestions) * 100;
      
      // SAVE SCORE TO LEADERBOARD
      try {
        const scoresKey = 'kuisScores';
        let scores = [];
        try { scores = JSON.parse(localStorage.getItem(scoresKey)) || []; } catch(e) { scores = []; }
        
        // Find if this student already has a score, if so replace it with the highest
        const existingIdx = scores.findIndex(s => s.nama === window.siswaNama && s.absen === window.siswaAbsen);
        const newScore = { nama: window.siswaNama, absen: window.siswaAbsen, score: correctCount, percentage: percentage, time: new Date().toISOString() };
        
        if (existingIdx >= 0) {
          // Replace only if new score is higher
          if (correctCount > scores[existingIdx].score) {
            scores[existingIdx] = newScore;
          }
        } else {
          scores.push(newScore);
        }
        localStorage.setItem(scoresKey, JSON.stringify(scores));
      } catch(e) {
        console.error('Error saving score:', e);
      }
      // UPDATE PROGRESS sebagai selesai
      try {
        const progressKey = 'kuisProgress';
        let allProgress = {};
        try { allProgress = JSON.parse(localStorage.getItem(progressKey)) || {}; } catch(e) { allProgress = {}; }
        const key = window.siswaNama + '__' + window.siswaAbsen;
        allProgress[key] = {
          nama: window.siswaNama,
          absen: window.siswaAbsen,
          soal: 10,
          benar: correctCount,
          karakter: selectedCharacter,
          selesai: true,
          update: new Date().toISOString()
        };
        localStorage.setItem(progressKey, JSON.stringify(allProgress));
      } catch(e) {}
      
      document.getElementById('quiz-container').classList.add('hidden');
      document.getElementById('results-container').classList.remove('hidden');
      let icon, title, message;
      const namaSiswaTampil = window.siswaNama || '-';
      if (percentage >= 80) {
        icon = 'ðŸ†';
        title = `${namaSiswaTampil} Juara!`;
        message = `<p class="text-gray-700"><strong>${namaSiswaTampil}</strong> Finish Line dengan sempurna! ðŸŽ‰ Kamu sangat memahami SDA!</p>`;
      } else if (percentage >= 60) {
        icon = 'ðŸ‘';
        title = `${namaSiswaTampil} Bagus!`;
        message = `<p class="text-gray-700"><strong>${namaSiswaTampil}</strong> mencapai garis finish dengan baik! ðŸ’ª Pelajari materi lebih dalam untuk hasil lebih sempurna!</p>`;
      } else {
        icon = 'ðŸ“š';
        title = `${namaSiswaTampil} Tetap Semangat!`;
        message = `<p class="text-gray-700"><strong>${namaSiswaTampil}</strong> perlu latihan lebih! ðŸš€ Baca ulang materi dan coba lagi!`;
      }
      document.getElementById('results-icon').textContent = icon;
      document.getElementById('results-title').textContent = title;
      document.getElementById('results-score').textContent = `${correctCount}/${multiChoiceQuestions} Benar (${Math.round(percentage)}%)`;
      document.getElementById('results-message').innerHTML = message;

      // Tampilkan identitas siswa
      const resultsSiswa = document.getElementById('results-siswa');
      if(resultsSiswa) {
        resultsSiswa.innerHTML = `<div class="mb-2"><b>Nama:</b> ${window.siswaNama || '-'}<br><b>No Absen:</b> ${window.siswaAbsen || '-'}</div>`;
      }
      // Tampilkan ulasan jawaban
      const resultsReview = document.getElementById('results-review');
      if(resultsReview) {
        let html = '<b>Ulasan Jawaban:</b><ol class="list-decimal ml-6 mt-2">';
        for(let i=0; i<multiChoiceQuestions; i++) {
          const q = quizData[i];
          const ans = answers[i];
          const selected = ans && typeof ans.selected === 'number' ? q.options[ans.selected] : '-';
          const isCorrect = ans && ans.selected === q.correct;
          html += `<li class="mb-2">${q.question}<br><span class="inline-block px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">Jawaban Anda: ${selected}${isCorrect ? ' (Benar)' : ' (Salah)'}</span></li>`;
        }
        // Tambahkan ulasan jawaban reflektif (ambil dari textarea reflection-answer)
        const reflektifIdx = multiChoiceQuestions;
        let reflektifAns = '';
        if (answers[reflektifIdx] && answers[reflektifIdx].value) {
          reflektifAns = answers[reflektifIdx].value;
        } else {
          // fallback: ambil dari textarea jika belum tersimpan
          const refleksiInput = document.getElementById('reflection-answer');
          if (refleksiInput && refleksiInput.value) {
            reflektifAns = refleksiInput.value;
          }
        }
        html += `<li class="mb-2"><b>Pertanyaan Refleksi:</b><br><span class="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700">${reflektifAns ? reflektifAns : 'Belum dijawab'}</span></li>`;
        html += '</ol>';
        resultsReview.innerHTML = html;
      }
    }
    // --- PATCH END ---
    // Quiz Data
    const quizData = [
      {
        question: "Sumber daya alam adalah â€¦",
        options: [
          "Segala sesuatu yang dibuat manusia untuk memenuhi kebutuhan hidup",
          "Segala sesuatu yang berasal dari alam dan dapat dimanfaatkan manusia",
          "Semua barang yang dijual di pasar",
          "Semua benda yang ada di rumah"
        ],
        correct: 1
      },
      {
        question: "Contoh sumber daya alam yang dapat diperbarui adalah â€¦",
        options: [
          "Batu bara",
          "Minyak bumi",
          "Air",
          "Emas"
        ],
        correct: 2
      },
      {
        question: "Berikut yang termasuk sumber daya alam yang tidak dapat diperbarui adalah â€¦",
        options: [
          "Matahari",
          "Angin",
          "Minyak bumi",
          "Air"
        ],
        correct: 2
      },
      {
        question: "Manfaat hutan sebagai sumber daya alam adalah â€¦",
        options: [
          "Tempat pembuangan sampah",
          "Sumber bahan makanan dan kayu",
          "Tempat pembangunan pabrik",
          "Tempat parkir kendaraan"
        ],
        correct: 1
      },
      {
        question: "Contoh sumber daya alam yang berasal dari hewan adalah â€¦",
        options: [
          "Kayu",
          "Susu",
          "Batu",
          "Pasir"
        ],
        correct: 1
      },
      {
        question: "Tanah dimanfaatkan manusia untuk â€¦",
        options: [
          "Tempat menanam tanaman",
          "Tempat membuang limbah",
          "Tempat membakar sampah",
          "Tempat menyimpan batu"
        ],
        correct: 0
      },
      {
        question: "Berikut yang termasuk sumber daya alam hayati adalah â€¦",
        options: [
          "Tumbuhan",
          "Air",
          "Batu",
          "Tanah"
        ],
        correct: 0
      },
      {
        question: "Contoh sumber daya alam yang dimanfaatkan sebagai bahan bakar adalah â€¦",
        options: [
          "Minyak bumi",
          "Air laut",
          "Tanah liat",
          "Pasir"
        ],
        correct: 0
      },
      {
        question: "Sumber daya alam yang berasal dari makhluk hidup disebut â€¦",
        options: [
          "SDA nonhayati",
          "SDA buatan",
          "SDA hayati",
          "SDA tambang"
        ],
        correct: 2
      },
      {
        question: "Berikut ini yang merupakan manfaat air bagi manusia adalah â€¦",
        options: [
          "Untuk bahan bangunan",
          "Untuk minum dan kebutuhan sehari-hari",
          "Untuk membuat kendaraan",
          "Untuk membuat plastik"
        ],
        correct: 1
      },
      {
        question: "Tonton video dibawah ini, dengarkan dan amati untuk bisa menjawab pertanyaan refleksi dibawah ini",
        isReflection: true,
        type: "deskripsi"
      }
    ];

    const characters = ['ðŸ‘¨', 'ðŸ‘©', 'ðŸ§‘â€ðŸ¦±', 'ðŸ‘³', 'ðŸ§”', 'ðŸ‘©â€ðŸ¦°', 'ðŸ¦¹', 'ðŸ¦¸'];
    const characterNames = ['Andi', 'Sinta', 'Rafa', 'Hendra', 'Budi', 'Dina', 'Supra', 'Sary'];

    let currentQuestion = 0;
    let selectedCharacter = -1;
    let answers = new Array(quizData.length).fill(null);
    let correctCount = 0;

    const defaultConfig = {
      main_title: 'Sumber Daya Alam',
      subtitle: 'Media Pembelajaran IPS - SMP Kelas VII'
    };

    // Initialize SDK
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => {
          document.getElementById('main-title').textContent = config.main_title || defaultConfig.main_title;
          document.getElementById('subtitle').textContent = config.subtitle || defaultConfig.subtitle;
        },
        mapToCapabilities: (config) => ({
          recolorables: [],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
          ['main_title', config.main_title || defaultConfig.main_title],
          ['subtitle', config.subtitle || defaultConfig.subtitle]
        ])
      });
    }

    // Navigation
    function showSection(sectionId) {
      if (sectionId === 'dashboard-guru') {
        updateGuruDashboardAccess();
      }

      document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
      });
      document.getElementById(sectionId).classList.remove('hidden');
      
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
          btn.classList.add('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showSDATab(tabId) {
      document.querySelectorAll('.sda-content').forEach(content => {
        content.classList.add('hidden');
      });
      document.getElementById('tab-' + tabId).classList.remove('hidden');
      
      document.querySelectorAll('.sda-tab').forEach(tab => {
        tab.classList.remove('bg-emerald-500', 'text-white');
        tab.classList.add('bg-gray-200', 'text-gray-700');
        if (tab.dataset.tab === tabId) {
          tab.classList.remove('bg-gray-200', 'text-gray-700');
          tab.classList.add('bg-emerald-500', 'text-white');
        }
      });
    }

    // Racing Quiz Functions
    function selectCharacter(index) {
      selectedCharacter = index;
      // Simpan karakter ke localStorage daftarPesertaKuis
      try {
        const pesertaKey = 'daftarPesertaKuis';
        let daftar = [];
        try { daftar = JSON.parse(localStorage.getItem(pesertaKey)) || []; } catch(e) { daftar = []; }
        const idx = daftar.findIndex(p => p.nama === window.siswaNama && p.absen === window.siswaAbsen);
        if(idx >= 0) {
          daftar[idx].karakter = index;
          localStorage.setItem(pesertaKey, JSON.stringify(daftar));
        }
      } catch(e) {}
      // Highlight pilihan karakter
      document.querySelectorAll('.character-card').forEach((el, i) => {
        if(i === index) el.classList.add('ring-4', 'ring-emerald-400');
        else el.classList.remove('ring-4', 'ring-emerald-400');
      });
      // Hanya lanjut ke soal jika kuis sudah dimulai oleh guru
      if (localStorage.getItem('kuisSudahDimulai') === 'true') {
        // Karakter baru dipilih setelah guru mulai: jalankan countdown lalu mulai soal
        mulaiCountdownAnim(function() {
          kuisTitle.style.display = '';
          mulaiKuisSetelahPilihKarakter();
        });
      } else {
        // Tampilkan konfirmasi bahwa karakter telah tersimpan, masih menunggu guru
        const info = document.getElementById('waiting-character-info');
        if (info) {
          const karakterNama = ['Andi','Sinta','Rafa','Hendra','Budi','Dina','Supra','Sary'];
          const karakterEmojis = ['ðŸ‘¨','ðŸ‘©','ðŸ§‘\u200dðŸ¦±','ðŸ‘³','ðŸ§”','ðŸ‘©\u200dðŸ¦°','ðŸ¦¹','ðŸ¦¸'];
          info.innerHTML = `<div class="flex items-center gap-2 justify-center text-emerald-700 font-semibold mt-2">
            <span style="font-size:1.8rem">${karakterEmojis[index] || 'ðŸƒ'}</span>
            <span>Karakter <b>${karakterNama[index] || ''}</b> dipilih! Menunggu guru memulai kuis...</span>
          </div>`;
        }
      }
    }

    function joinWithCode() {
      const code = document.getElementById('quiz-code-input').value;
      if (code.length > 0) {
        selectCharacter(0); // Use first character by default
      }
    }

    function loadQuestion() {
      const question = quizData[currentQuestion];
      const isReflection = question.isReflection;
      
      document.getElementById('question-text').textContent = `${currentQuestion + 1}. ${question.question}`;
      document.getElementById('current-question').textContent = currentQuestion + 1;
      document.getElementById('progress-bar').style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;
      
      // Hide/show reflection containers
      if (isReflection) {
        document.getElementById('reflection-video-container').classList.remove('hidden');
        document.getElementById('reflection-form-container').classList.remove('hidden');
        document.getElementById('options-container').classList.add('hidden');
      } else {
        document.getElementById('reflection-video-container').classList.add('hidden');
        document.getElementById('reflection-form-container').classList.add('hidden');
        document.getElementById('options-container').classList.remove('hidden');
      }
      
      if (!isReflection) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
          const optionBtn = document.createElement('button');
          optionBtn.className = 'quiz-option w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-400 transition-all';
          optionBtn.innerHTML = `<span class="font-bold text-emerald-600 mr-3">${String.fromCharCode(65 + index)}.</span> <span>${option}</span>`;
          
          // restore selection and evaluation state
          if (answers[currentQuestion] && answers[currentQuestion].type === 'choice') {
            if (answers[currentQuestion].value === index) {
              optionBtn.classList.add('selected');
            }
            if (answers[currentQuestion].evaluated) {
              const isCorrect = index === question.correct;
              if (answers[currentQuestion].value === index) {
                optionBtn.classList.add(isCorrect ? 'correct' : 'wrong');
              }
              // disable all options once evaluated
              optionBtn.disabled = true;
            }
          }
          
          optionBtn.onclick = () => selectAnswer(index);
          optionsContainer.appendChild(optionBtn);
        });
      } else {
        // For reflection, restore previous answer if exists
        const reflectionAnswer = document.getElementById('reflection-answer');
        if (answers[currentQuestion] && answers[currentQuestion].type === 'reflection') {
          reflectionAnswer.value = answers[currentQuestion].value;
        } else {
          reflectionAnswer.value = '';
        }
        document.getElementById('reflection-feedback').classList.add('hidden');
      }

      document.getElementById('feedback-message').innerHTML = '';
      document.getElementById('prev-btn').disabled = currentQuestion === 0;
      
      if (currentQuestion === quizData.length - 1) {
        document.getElementById('next-btn').textContent = 'Lihat Hasil âœ“';
      } else {
        document.getElementById('next-btn').textContent = 'Selanjutnya â†’';
      }
      
      // For reflection, button is enabled after submission
      if (isReflection) {
        document.getElementById('next-btn').disabled = !answers[currentQuestion] || answers[currentQuestion].type !== 'reflection';
      } else {
        document.getElementById('next-btn').disabled = answers[currentQuestion] === null;
      }
    }

    function selectAnswer(index) {
      // store response but do not evaluate yet
      answers[currentQuestion] = { type: 'choice', value: index, evaluated: false };
      // highlight selection only
      document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        btn.classList.remove('selected', 'correct', 'wrong');
        if (i === index) {
          btn.classList.add('selected');
        }
      });
      document.getElementById('next-btn').disabled = false;
    }
    
    function submitReflection() {
      const reflectionAnswer = document.getElementById('reflection-answer').value.trim();
      const feedback = document.getElementById('reflection-feedback');
      
      if (reflectionAnswer.length < 50) {
        feedback.classList.remove('hidden');
        feedback.innerHTML = '<div class="bg-red-50 border border-red-200 rounded-xl p-4"><p class="text-red-700 font-semibold">âŒ Jawaban terlalu singkat! Minimal 50 karakter diperlukan.</p></div>';
        return;
      }
      
      answers[currentQuestion] = { type: 'reflection', value: reflectionAnswer };
      
      feedback.classList.remove('hidden');
      feedback.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 answer-feedback">
          <p class="text-green-700 font-semibold">âœ… Jawaban refleksi Anda telah diterima!</p>
          <p class="text-green-600 text-sm mt-2">Terima kasih! Menampilkan hasil skor...</p>
        </div>
      `;
      
      document.getElementById('next-btn').disabled = false;
      // langsung lanjut ke hasil tanpa perlu klik
      showResults();
    }

    function animateRacerRun() {
      const racer = document.getElementById('racer-position');
      const distance = (correctCount / quizData.length) * 100;
      racer.textContent = characters[selectedCharacter];
      racer.classList.remove('falling');
      racer.classList.add('running');
      racer.style.left = distance + '%';
      
      setTimeout(() => {
        racer.classList.remove('running');
      }, 800);
    }

    function evaluateAnswerIfNeeded() {
      const entry = answers[currentQuestion];
      if (!entry || entry.type !== 'choice' || entry.evaluated) return;
      const index = entry.value;
      const question = quizData[currentQuestion];
      const isCorrect = index === question.correct;

      // apply feedback classes and disable options
      document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        btn.disabled = true;
        if (i === index) {
          btn.classList.remove('selected');
          btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
      });

      if (isCorrect) {
        correctCount++;
        animateRacerRun();
        showFeedback('âœ… Jawaban Benar!', 'text-green-600');
      } else {
        animateRacerFall();
        showFeedback('âŒ Jawaban Salah!', 'text-red-600');
      }

      updateStats();
      entry.evaluated = true;
    }

    function animateRacerFall() {
      const racer = document.getElementById('racer-position');
      racer.textContent = characters[selectedCharacter];
      racer.classList.remove('running');
      racer.classList.add('falling');
      
      setTimeout(() => {
        racer.classList.remove('falling');
        const distance = (correctCount / quizData.length) * 100;
        racer.style.left = distance + '%';
      }, 800);
    }

    function showFeedback(message, className) {
      const feedbackDiv = document.getElementById('feedback-message');
      feedbackDiv.innerHTML = `<div class="answer-feedback bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200"><p class="font-bold ${className}">${message}</p></div>`;
    }

    function updateStats() {
      const distance = (correctCount / quizData.length) * 100;
      document.getElementById('racer-distance').textContent = Math.round(distance) + '%';
      document.getElementById('answers-count').textContent = (currentQuestion + 1) + '/' + quizData.length;
      document.getElementById('correct-count').textContent = correctCount;
      // Simpan progress realtime ke localStorage untuk dashboard guru
      try {
        const progressKey = 'kuisProgress';
        let allProgress = {};
        try { allProgress = JSON.parse(localStorage.getItem(progressKey)) || {}; } catch(e) { allProgress = {}; }
        const key = window.siswaNama + '__' + window.siswaAbsen;
        allProgress[key] = {
          nama: window.siswaNama,
          absen: window.siswaAbsen,
          soal: currentQuestion + 1,
          benar: correctCount,
          karakter: selectedCharacter,
          selesai: false,
          update: new Date().toISOString()
        };
        localStorage.setItem(progressKey, JSON.stringify(allProgress));
      } catch(e) {}
    }

    function nextQuestion() {
      // evaluate the current answer if not yet done
      const entry = answers[currentQuestion];
      if (entry && entry.type === 'choice' && !entry.evaluated) {
        evaluateAnswerIfNeeded();
      }

      if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        loadQuestion();
      } else {
        showResults();
      }
    }

    function prevQuestion() {
      if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
      }
    }

    function showResults() {
      // Calculate score only for multiple choice questions (10 questions), not the reflection
      const multiChoiceQuestions = 10;
      const percentage = (correctCount / multiChoiceQuestions) * 100;
      document.getElementById('quiz-container').classList.add('hidden');
      document.getElementById('results-container').classList.remove('hidden');
      let icon, title, message;
      const namaSiswaTampil = window.siswaNama || '-';
      if (percentage >= 80) {
        icon = 'ðŸ†';
        title = `${namaSiswaTampil} Juara!`;
        message = `<p class="text-gray-700"><strong>${namaSiswaTampil}</strong> Finish Line dengan sempurna! ðŸŽ‰ Kamu sangat memahami SDA!</p>`;
      } else if (percentage >= 60) {
        icon = 'ðŸ‘';
        title = `${namaSiswaTampil} Bagus!`;
        message = `<p class="text-gray-700"><strong>${namaSiswaTampil}</strong> mencapai garis finish dengan baik! ðŸ’ª Pelajari materi lebih dalam untuk hasil lebih sempurna!</p>`;
      } else {
        icon = 'ðŸ“š';
        title = `${namaSiswaTampil} Tetap Semangat!`;
        message = `<p class="text-gray-700"><strong>${namaSiswaTampil}</strong> perlu latihan lebih! ðŸš€ Baca ulang materi dan coba lagi!`;
      }
      document.getElementById('results-icon').textContent = icon;
      document.getElementById('results-title').textContent = title;
      document.getElementById('results-score').textContent = `${correctCount}/${multiChoiceQuestions} Benar (${Math.round(percentage)}%)`;
      document.getElementById('results-message').innerHTML = message;

      // --- Tambahan: identitas siswa dan ulasan jawaban ---
      const resultsSiswa = document.getElementById('results-siswa');
      if(resultsSiswa) {
        resultsSiswa.innerHTML = `<div class="mb-2"><b>Nama:</b> ${window.siswaNama || '-'}<br><b>No Absen:</b> ${window.siswaAbsen || '-'}</div>`;
      }
      // Review jawaban
      const resultsReview = document.getElementById('results-review');
      if(resultsReview) {
        let html = '<b>Ulasan Jawaban:</b><ol class="list-decimal ml-6 mt-2">';
        for(let i=0; i<multiChoiceQuestions; i++) {
          const q = quizData[i];
          const ans = answers[i];
          const selected = ans && typeof ans.selected === 'number' ? q.options[ans.selected] : '-';
          const isCorrect = ans && ans.selected === q.correct;
          html += `<li class="mb-2">${q.question}<br><span class="inline-block px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">Jawaban Anda: ${selected}${isCorrect ? ' (Benar)' : ' (Salah)'}</span></li>`;
        }
        // Tambahkan ulasan jawaban reflektif (ambil dari answers)
        const reflektifIdx = multiChoiceQuestions;
        let reflektifAns = '';
        if (answers[reflektifIdx] && answers[reflektifIdx].value) {
          reflektifAns = answers[reflektifIdx].value;
        } else {
          // fallback: ambil dari textarea jika belum tersimpan
          const refleksiInput = document.getElementById('reflection-answer');
          if (refleksiInput && refleksiInput.value) {
            reflektifAns = refleksiInput.value;
          }
        }
        html += `<li class="mb-2"><b>Pertanyaan Refleksi:</b><br><span class="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700">${reflektifAns ? reflektifAns : 'Belum dijawab'}</span></li>`;
        html += '</ol>';
        resultsReview.innerHTML = html;
      }
    }

    function restartQuiz() {
      currentQuestion = 0;
      selectedCharacter = -1;
      answers = new Array(quizData.length).fill(null);
      correctCount = 0;
      
      document.getElementById('results-container').classList.add('hidden');
      document.getElementById('character-selection').classList.remove('hidden');
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      showSection('beranda');
    });
  
