
    // Dashboard Guru: Animasi Peserta
    function tampilkanAnimasiPesertaGuru() {
      const el = document.getElementById('guru-animasi-peserta');
      if (!el) return;
      const pesertaKey = 'daftarPesertaKuis';
      let daftar = [];
      try { daftar = JSON.parse(localStorage.getItem(pesertaKey)) || []; } catch(e) { daftar = []; }
      // Karakter emoji sesuai urutan quiz
      const karakterEmojis = ["ðŸ‘¨", "ðŸ‘©", "ðŸ§‘â€ðŸ¦±", "ðŸ‘³", "ðŸ§”", "ðŸ‘©â€ðŸ¦°", "ðŸ¦¹", "ðŸ¦¸"];
      el.innerHTML = daftar.length === 0 ? '<div class="text-gray-400">Belum ada peserta yang menyelesaikan kuis.</div>' :
        daftar.map((p, idx) => {
          const emoji = karakterEmojis[p.karakter] || 'â“';
          return `<div class="flex flex-col items-center animate-bounce relative group" style="animation-duration:${1.5 + Math.random()}s">
            <span style="font-size:3rem;">${emoji}</span>
            <span class="font-bold mt-2">${p.nama}</span>
            <span class="text-xs text-gray-500">Absen: ${p.absen}</span>
            <button onclick="hapusPesertaKuis('${p.nama.replace(/'/g, '\'')}', '${p.absen}')" class='absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity' title='Hapus Peserta'>&times;</button>
          </div>`;
        }).join('');
    // Fungsi hapus peserta dari localStorage (agar global)
    window.hapusPesertaKuis = function(nama, absen) {
      if(!confirm(`Hapus peserta ${nama} (Absen: ${absen})?`)) return;
      const pesertaKey = 'daftarPesertaKuis';
      let daftar = [];
      try { daftar = JSON.parse(localStorage.getItem(pesertaKey)) || []; } catch(e) { daftar = []; }
      const baru = daftar.filter(p => !(p.nama === nama && p.absen === absen));
      localStorage.setItem(pesertaKey, JSON.stringify(baru));
      tampilkanAnimasiPesertaGuru();
    }
    }
    // Tampilkan animasi peserta setiap kali dashboard guru dibuka
    document.addEventListener('DOMContentLoaded', () => {
      const navBtns = document.querySelectorAll('.nav-btn[data-section]');
      navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          if (this.getAttribute('data-section') === 'dashboard-guru') {
            setTimeout(() => {
              tampilkanAnimasiPesertaGuru();
              tampilkanAnimasiBalapanGuru();
            }, 200);
            // Update status mulai kuis
            updateStatusMulaiKuisGuru();
          }
        });
      });

      // Tambahkan event handler untuk tombol Mulai & Akhiri Kuis
      const btnMulaiKuisGuru = document.getElementById('btn-mulai-kuis-guru');
      if (btnMulaiKuisGuru) {
        btnMulaiKuisGuru.addEventListener('click', function() {
          localStorage.setItem('kuisSudahDimulai', 'true');
          localStorage.removeItem('kuisSudahBerakhir');
          updateStatusMulaiKuisGuru();
        });
      }
      const btnAkhiriKuisGuru = document.getElementById('btn-akhiri-kuis-guru');
      if (btnAkhiriKuisGuru) {
        btnAkhiriKuisGuru.addEventListener('click', function() {
          localStorage.removeItem('kuisSudahDimulai');
          localStorage.setItem('kuisSudahBerakhir', 'true');
          updateStatusMulaiKuisGuru();
        });
      }

      // Status tampilan Mulai/Akhiri Kuis
      function updateStatusMulaiKuisGuru() {
        const statusSpan = document.getElementById('status-mulai-kuis-guru');
        if (!statusSpan) return;
        if (localStorage.getItem('kuisSudahBerakhir') === 'true') {
          statusSpan.textContent = 'Kuis sudah diakhiri!';
          statusSpan.classList.remove('text-gray-500', 'text-green-600', 'font-bold');
          statusSpan.classList.add('text-red-600', 'font-bold');
          tampilkanAnimasiBalapanGuru();
          tampilkanLeaderboardRealtime();
          tampilkanRankingSiswa();
          tampilkanStatusMultiplayer();
        } else if (localStorage.getItem('kuisSudahDimulai') === 'true') {
          statusSpan.textContent = 'Kuis sudah dimulai!';
          statusSpan.classList.remove('text-gray-500', 'text-red-600');
          statusSpan.classList.add('text-green-600', 'font-bold');
          tampilkanAnimasiBalapanGuru();
          tampilkanStatusMultiplayer();
        } else {
          statusSpan.textContent = 'Kuis belum dimulai.';
          statusSpan.classList.remove('text-green-600', 'font-bold', 'text-red-600');
          statusSpan.classList.add('text-gray-500');
        }
      }

      // ===== LEADERBOARD REALTIME =====
      window.autoRefreshLeaderboard = false;
      window.autoRefreshInterval = null;

      function tampilkanLeaderboardRealtime() {
        const el = document.getElementById('guru-leaderboard');
        if (!el) return;
        const scoresKey = 'kuisScores';
        let scores = [];
        try { scores = JSON.parse(localStorage.getItem(scoresKey)) || []; } catch(e) { scores = []; }
        
        // Sort by score descending, then by time
        scores.sort((a, b) => b.score - a.score || new Date(a.time) - new Date(b.time));
        
        if (scores.length === 0) {
          el.innerHTML = '<div class="text-center text-gray-400">Belum ada peserta yang menyelesaikan kuis.</div>';
          return;
        }
        
        let html = '<div class="overflow-x-auto"><table class="w-full text-sm">';
        html += '<thead class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"><tr><th class="p-3 text-left">Ranking</th><th class="p-3 text-left">Nama</th><th class="p-3 text-center">Absen</th><th class="p-3 text-center">Skor</th><th class="p-3 text-center">%</th><th class="p-3 text-center">Waktu</th></tr></thead>';
        html += '<tbody>';
        scores.forEach((score, idx) => {
          const medal = idx === 0 ? 'ðŸ¥‡' : idx === 1 ? 'ðŸ¥ˆ' : idx === 2 ? 'ðŸ¥‰' : `#${idx+1}`;
          const percent = Math.round((score.score / 10) * 100);
          const time = new Date(score.time).toLocaleTimeString('id-ID');
          const rowColor = idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-gray-50' : idx === 2 ? 'bg-orange-50' : '';
          html += `<tr class="${rowColor} border-b border-gray-200">
            <td class="p-3 font-bold text-lg">${medal}</td>
            <td class="p-3 font-semibold text-gray-800">${score.nama}</td>
            <td class="p-3 text-center text-gray-600">${score.absen}</td>
            <td class="p-3 text-center font-bold text-emerald-600">${score.score}</td>
            <td class="p-3 text-center font-bold text-blue-600">${percent}%</td>
            <td class="p-3 text-center text-gray-600 text-xs">${time}</td>
          </tr>`;
        });
        html += '</tbody></table></div>';
        el.innerHTML = html;
      }

      // ===== RANKING SISWA =====
      function tampilkanRankingSiswa() {
        const el = document.getElementById('guru-ranking');
        if (!el) return;
        const scoresKey = 'kuisScores';
        let scores = [];
        try { scores = JSON.parse(localStorage.getItem(scoresKey)) || []; } catch(e) { scores = []; }
        
        scores.sort((a, b) => b.score - a.score || new Date(a.time) - new Date(b.time));
        
        if (scores.length === 0) {
          el.innerHTML = '<div class="text-center text-gray-400">Belum ada data ranking.</div>';
          return;
        }
        
        let html = '';
        scores.forEach((score, idx) => {
          const medal = idx === 0 ? 'ðŸ¥‡ JUARA' : idx === 1 ? 'ðŸ¥ˆ RUNNER UP' : idx === 2 ? 'ðŸ¥‰ BRONZE' : `#${idx+1}`;
          const percent = Math.round((score.score / 10) * 100);
          const gradients = ['from-yellow-400 to-yellow-200', 'from-gray-400 to-gray-200', 'from-orange-400 to-orange-200'];
          const gradient = gradients[idx] || 'from-blue-200 to-blue-100';
          const rankClass = `bg-gradient-to-r ${gradient}`;
          
          html += `
          <div class="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 ${rankClass}">
            <div class="text-4xl w-16 text-center">${['ðŸ¥‡', 'ðŸ¥ˆ', 'ðŸ¥‰'][idx] || 'ðŸ“Š'}</div>
            <div class="flex-1">
              <p class="font-bold text-lg text-gray-800">${score.nama}</p>
              <p class="text-sm text-gray-600">No Absen: ${score.absen}</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-emerald-600">${score.score}/10</p>
              <p class="text-sm font-semibold text-blue-600">${percent}%</p>
              <p class="text-xs text-gray-500">${medal}</p>
            </div>
          </div>`;
        });
        el.innerHTML = html;
      }

      // ===== MULTIPLAYER QUIZ STATUS =====
      function tampilkanStatusMultiplayer() {
        const pesertaKey = 'daftarPesertaKuis';
        const scoresKey = 'kuisScores';
        let peserta = [];
        let scores = [];
        try { peserta = JSON.parse(localStorage.getItem(pesertaKey)) || []; } catch(e) { peserta = []; }
        try { scores = JSON.parse(localStorage.getItem(scoresKey)) || []; } catch(e) { scores = []; }
        
        const totalPeserta = peserta.length;
        const selesai = scores.length;
        const proses = totalPeserta - selesai;
        
        document.getElementById('multiplayer-total-peserta').textContent = totalPeserta;
        document.getElementById('multiplayer-selesai').textContent = selesai;
        document.getElementById('multiplayer-proses').textContent = proses;
        
        // List of participants
        const el = document.getElementById('guru-multiplayer-list');
        if (!el) return;
        
        if (peserta.length === 0) {
          el.innerHTML = '<div class="text-center text-gray-400">Belum ada peserta yang bergabung.</div>';
          return;
        }
        
        let html = '';
        peserta.forEach(p => {
          const sudahSelesai = scores.some(s => s.nama === p.nama && s.absen === p.absen);
          const status = sudahSelesai ? 'âœ… Selesai' : 'â³ Mengerjakan';
          const statusColor = sudahSelesai ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50';
          const score = scores.find(s => s.nama === p.nama && s.absen === p.absen);
          const scoreText = sudahSelesai ? `${score.score}/10 (${Math.round((score.score/10)*100)}%)` : '-';
          
          html += `
          <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div class="flex-1">
              <p class="font-semibold text-gray-800">${p.nama}</p>
              <p class="text-xs text-gray-500">Absen: ${p.absen}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold ${statusColor} px-2 py-1 rounded">${status}</p>
              <p class="text-xs text-gray-600 mt-1">${scoreText}</p>
            </div>
          </div>`;
        });
        el.innerHTML = html;
      }

      // ===== ANIMASI BALAPAN REALTIME =====
      window.autoRefreshBalapan = false;
      window.autoRefreshBalapanInterval = null;

      function tampilkanAnimasiBalapanGuru() {
        const el = document.getElementById('guru-animasi-balapan');
        if (!el) return;
        const karakterEmojis = ['ðŸ‘¨','ðŸ‘©','ðŸ§‘\u200dðŸ¦±','ðŸ‘³','ðŸ§”','ðŸ‘©\u200dðŸ¦°','ðŸ¦¹','ðŸ¦¸'];
        const karakterNama = ['Andi','Sinta','Rafa','Hendra','Budi','Dina','Supra','Sary'];

        // Ambil data peserta
        let peserta = [];
        try { peserta = JSON.parse(localStorage.getItem('daftarPesertaKuis')) || []; } catch(e) { peserta = []; }

        // Ambil data progress realtime
        let allProgress = {};
        try { allProgress = JSON.parse(localStorage.getItem('kuisProgress')) || {}; } catch(e) { allProgress = {}; }

        // Ambil data skor selesai
        let scores = [];
        try { scores = JSON.parse(localStorage.getItem('kuisScores')) || []; } catch(e) { scores = []; }

        if (peserta.length === 0) {
          el.innerHTML = '<div class="text-center text-gray-400">Belum ada peserta yang bergabung.</div>';
          return;
        }

        // Urutkan peserta berdasarkan progress tertinggi
        const pesertaDenganData = peserta.map(p => {
          const key = p.nama + '__' + p.absen;
          const prog = allProgress[key];
          const skor = scores.find(s => s.nama === p.nama && s.absen === p.absen);
          const benar = prog ? prog.benar : (skor ? skor.score : 0);
          const soal = prog ? prog.soal : (skor ? 10 : 0);
          const selesai = (prog && prog.selesai) || !!skor;
          const karakter = (prog && prog.karakter >= 0) ? prog.karakter : (p.karakter >= 0 ? p.karakter : 0);
          return { ...p, benar, soal, selesai, karakter };
        });
        pesertaDenganData.sort((a, b) => b.benar - a.benar || b.soal - a.soal);

        let html = '';
        pesertaDenganData.forEach((p, idx) => {
          const pct = Math.round((p.benar / 10) * 100);
          const emoji = karakterEmojis[p.karakter] || 'ðŸƒ';
          const charNama = karakterNama[p.karakter] || '';
          const statusLabel = p.selesai
            ? `<span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">âœ… Selesai (${p.benar}/10)</span>`
            : `<span class="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">â³ Soal ${p.soal}/10</span>`;
          const rankBadge = idx === 0 ? 'ðŸ¥‡' : idx === 1 ? 'ðŸ¥ˆ' : idx === 2 ? 'ðŸ¥‰' : `<span class="text-gray-500 font-bold">#${idx+1}</span>`;
          // Posisi karakter: clamp antara 0 dan 88% agar tidak keluar trek
          const posLeft = Math.min(pct * 0.88, 88);
          // Warna trek berdasar ranking
          const trackColors = [
            'from-yellow-300 to-green-300',
            'from-gray-300 to-green-200',
            'from-orange-300 to-green-200',
          ];
          const trackColor = trackColors[idx] || 'from-green-200 to-teal-200';

          html += `
          <div class="rounded-2xl border-2 ${p.selesai ? 'border-emerald-400' : 'border-gray-200'} p-4 bg-gradient-to-r from-gray-50 to-white">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">${rankBadge}</span>
                <span class="font-bold text-gray-800">${p.nama}</span>
                <span class="text-xs text-gray-500">(Absen: ${p.absen})</span>
              </div>
              <div class="flex items-center gap-2">${statusLabel}<span class="font-bold text-blue-600 text-sm">${pct}%</span></div>
            </div>
            <div class="relative h-14 rounded-xl overflow-hidden border-2 border-gray-300 bg-gradient-to-r ${trackColor}">
              <!-- Garis finish -->
              <div class="absolute right-0 top-0 bottom-0 w-1" style="background:repeating-linear-gradient(180deg,#000 0,#000 6px,#fff 6px,#fff 12px)"></div>
              <!-- Flag finish -->
              <div class="absolute right-2 top-1 text-xs">ðŸ</div>
              <!-- Karakter pembalap -->
              <div class="absolute top-1/2 -translate-y-1/2 text-3xl transition-all duration-700 ease-out" style="left:${posLeft}%">${emoji}</div>
              <!-- Label nama karakter -->
              <div class="absolute bottom-0.5 text-xs text-gray-700 font-semibold transition-all duration-700" style="left:calc(${posLeft}% + 2px)">${charNama || p.nama.split(' ')[0]}</div>
            </div>
            <!-- Progress bar teks -->
            <div class="mt-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700 ${p.selesai ? 'bg-emerald-500' : 'bg-orange-400'}" style="width:${pct}%"></div>
            </div>
          </div>`;
        });
        el.innerHTML = html;
      }

      document.getElementById('btn-refresh-balapan')?.addEventListener('click', tampilkanAnimasiBalapanGuru);

      document.getElementById('btn-auto-refresh-balapan')?.addEventListener('click', function() {
        window.autoRefreshBalapan = !window.autoRefreshBalapan;
        if (window.autoRefreshBalapan) {
          this.textContent = 'â¸ Stop Live';
          this.classList.remove('from-orange-500','to-amber-500');
          this.classList.add('from-red-500','to-rose-500');
          window.autoRefreshBalapanInterval = setInterval(tampilkanAnimasiBalapanGuru, 1500);
          tampilkanAnimasiBalapanGuru();
        } else {
          this.textContent = 'â–¶ Live (Auto)';
          this.classList.remove('from-red-500','to-rose-500');
          this.classList.add('from-orange-500','to-amber-500');
          clearInterval(window.autoRefreshBalapanInterval);
        }
      });

      document.getElementById('btn-reset-progress')?.addEventListener('click', function() {
        if (confirm('Hapus semua data progress balapan? (Data skor tidak akan terhapus)')) {
          localStorage.removeItem('kuisProgress');
          tampilkanAnimasiBalapanGuru();
        }
      });

      // Event listeners for buttons
      document.getElementById('btn-refresh-leaderboard')?.addEventListener('click', tampilkanLeaderboardRealtime);
      document.getElementById('btn-refresh-ranking')?.addEventListener('click', tampilkanRankingSiswa);
      document.getElementById('btn-refresh-multiplayer')?.addEventListener('click', tampilkanStatusMultiplayer);
      
      document.getElementById('btn-auto-refresh-leaderboard')?.addEventListener('click', function() {
        window.autoRefreshLeaderboard = !window.autoRefreshLeaderboard;
        if (window.autoRefreshLeaderboard) {
          this.textContent = 'â¸ Stop Auto Refresh';
          this.classList.remove('from-green-500', 'to-emerald-500');
          this.classList.add('from-red-500', 'to-rose-500');
          window.autoRefreshInterval = setInterval(tampilkanLeaderboardRealtime, 2000);
          tampilkanLeaderboardRealtime();
        } else {
          this.textContent = 'â–¶ Auto Refresh';
          this.classList.remove('from-red-500', 'to-rose-500');
          this.classList.add('from-green-500', 'to-emerald-500');
          clearInterval(window.autoRefreshInterval);
        }
      });

      document.getElementById('btn-clear-scores')?.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua skor? Tindakan ini tidak dapat dibatalkan!')) {
          localStorage.removeItem('kuisScores');
          tampilkanRankingSiswa();
          tampilkanLeaderboardRealtime();
          tampilkanStatusMultiplayer();
          alert('Semua skor telah dihapus!');
        }
      });

      document.getElementById('btn-export-ranking')?.addEventListener('click', function() {
        const scoresKey = 'kuisScores';
        let scores = [];
        try { scores = JSON.parse(localStorage.getItem(scoresKey)) || []; } catch(e) { scores = []; }
        
        scores.sort((a, b) => b.score - a.score || new Date(a.time) - new Date(b.time));
        
        if (scores.length === 0) {
          alert('Tidak ada data ranking untuk diekspor!');
          return;
        }
        
        let csv = 'Ranking,Nama,No Absen,Skor,Persentase,Waktu\n';
        scores.forEach((score, idx) => {
          const percent = Math.round((score.score / 10) * 100);
          const time = new Date(score.time).toLocaleString('id-ID');
          csv += `${idx+1},"${score.nama}",${score.absen},${score.score},${percent}%,"${time}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Ranking-Kuis-${new Date().toLocaleDateString('id-ID')}.csv`;
        link.click();
      });

      document.getElementById('btn-send-notification')?.addEventListener('click', function() {
        const message = prompt('Masukkan pesan yang ingin dikirim ke semua peserta:');
        if (message) {
          localStorage.setItem('guruBroadcastMessage', message);
          localStorage.setItem('guruBroadcastTime', new Date().toISOString());
          alert(`Pesan terkirim: "${message}"`);
        }
      });
    });
    
