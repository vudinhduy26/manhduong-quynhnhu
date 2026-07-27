// ==========================================================================
// Minimalism Dark Red Wedding Invitation App Logic
// Mạnh Dưỡng & Quỳnh Như | 18.10.2026
// ==========================================================================

// ─────────────────────────────────────────────────────────────────────────
//  CẤU HÌNH — DÁN ĐƯỜNG DẪN GOOGLE APPS SCRIPT VÀO ĐÂY
//
//  Chừng nào ô này còn để trống, xác nhận của khách CHỈ nằm trên máy của họ
//  và BẠN SẼ KHÔNG NHẬN ĐƯỢC GÌ. Các bước lấy đường dẫn: xem HUONG-DAN-RSVP.md
//
//  Ví dụ sau khi điền:
//  const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxxxxx.../exec';
// ─────────────────────────────────────────────────────────────────────────
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwFPmXyiZg0dJldpByFxjyXrW2DkuHgGC33Ldx0Z4dnJnHasqEqtKgEPhhTV55F61ky/exec';

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll lock helper — shared by the envelope overlay and the lightbox so the
  // two never fight over document.body.style.overflow.
  let scrollLocks = 0;
  const lockScroll = () => {
    scrollLocks++;
    document.documentElement.classList.add('no-scroll');
  };
  const unlockScroll = () => {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) document.documentElement.classList.remove('no-scroll');
  };

  // 1. AMBIENT FALLING PARTICLES (Hearts & Petals)
  const HEART_SVG = `
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  `;
  const PARTICLE_COLORS = ['#ece4d8', '#a8323b', '#c9a24a', '#7a1f26'];

  const spawnParticles = (container, count) => {
    if (!container || reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.fontSize = `${10 + Math.random() * 14}px`;
      p.style.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      p.style.setProperty('--sway', `${(Math.random() - 0.5) * 60}px`);
      p.style.animationDuration = `${7 + Math.random() * 6}s`;
      p.style.animationDelay = `${Math.random() * 4}s`;
      p.innerHTML = HEART_SVG;
      container.appendChild(p);
    }
  };

  // Lớp tim rơi của phong bì (bị ẩn cùng phong bì khi mở thiệp).
  const particleContainer = document.getElementById('particle-container');
  spawnParticles(particleContainer, 18);

  // Lớp tim rơi của trang chính — nằm ngoài phong bì nên vẫn chạy sau khi mở.
  // Chỉ tạo lúc mở thiệp: trước đó nó bị phong bì che, tạo sẵn chỉ tốn CPU.
  const pageParticles = document.getElementById('page-particles');

  // 2. ENVELOPE OPENING ANIMATION
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const btnOpenEnvelope = document.getElementById('btn-open-envelope');
  const audio = document.getElementById('wedding-audio');
  const musicBtn = document.getElementById('music-toggle');

  const mainContent = document.getElementById('main-content');
  let invitationOpened = false;

  // The overlay is position:fixed, so without this the page behind it still
  // scrolls (and the scrollbar is still draggable) before the card is opened.
  if (envelopeOverlay) {
    lockScroll();
    if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
  }

  const setMusicState = (playing) => {
    if (!musicBtn) return;
    musicBtn.classList.toggle('playing', playing);
    musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
  };

  const openInvitation = () => {
    if (invitationOpened) return;
    invitationOpened = true;

    if (envelopeOverlay) {
      envelopeOverlay.classList.add('opened');
      unlockScroll();
      setTimeout(() => {
        envelopeOverlay.style.visibility = 'hidden';
        // Gỡ hẳn tim của phong bì: giữ lại chỉ tốn CPU cho thứ không ai nhìn thấy.
        if (particleContainer) particleContainer.innerHTML = '';
      }, 900);
    }
    if (mainContent) mainContent.removeAttribute('aria-hidden');

    // Tim tiếp tục rơi trên trang chính sau khi mở thiệp.
    if (pageParticles) {
      spawnParticles(pageParticles, 12);
      requestAnimationFrame(() => pageParticles.classList.add('on'));
    }

    // Attempt auto-play music
    if (audio) {
      audio.play()
        .then(() => setMusicState(true))
        .catch(err => {
          console.log('Audio autoplay prevented by browser policy:', err);
        });
    }
  };

  if (btnOpenEnvelope) {
    btnOpenEnvelope.addEventListener('click', openInvitation);
  }

  // Auto open if URL has ?open=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('open') === '1') {
    openInvitation();
  }

  // 3. MUSIC PLAYER TOGGLE
  if (musicBtn && audio) {
    musicBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play()
          .then(() => {
            setMusicState(true);
            showToast('Đang phát nhạc tiệc cưới 🎵');
          })
          .catch(() => {
            setMusicState(false);
            showToast('Không phát được nhạc, vui lòng thử lại');
          });
      } else {
        audio.pause();
        setMusicState(false);
        showToast('Đã tạm dừng nhạc ⏸️');
      }
    });
  }

  // 4. REALTIME COUNTDOWN TIMER (Target: October 18, 2026 11:00:00)
  const targetDate = new Date('2026-10-18T11:00:00+07:00').getTime();
  const cd = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds')
  };

  const paintCountdown = (d, h, m, s) => {
    if (cd.days) cd.days.textContent = String(d).padStart(2, '0');
    if (cd.hours) cd.hours.textContent = String(h).padStart(2, '0');
    if (cd.minutes) cd.minutes.textContent = String(m).padStart(2, '0');
    if (cd.seconds) cd.seconds.textContent = String(s).padStart(2, '0');
  };

  let countdownTimer = null;
  const updateCountdown = () => {
    const diff = targetDate - Date.now();

    if (diff <= 0) {
      paintCountdown(0, 0, 0, 0);
      if (countdownTimer) clearInterval(countdownTimer);
      return;
    }

    paintCountdown(
      Math.floor(diff / 86400000),
      Math.floor((diff % 86400000) / 3600000),
      Math.floor((diff % 3600000) / 60000),
      Math.floor((diff % 60000) / 1000)
    );
  };

  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);

  // 5. GALLERY LIGHTBOX MODAL with Prev/Next Navigation
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');

  // Fall back to the <img> src so a gallery item missing data-src still works.
  const galleryImages = [...galleryItems].map(
    item => item.getAttribute('data-src') || item.querySelector('img')?.src
  ).filter(Boolean);

  let currentIndex = 0;
  let fadeTimer = null;
  let lastFocused = null;

  if (lightboxModal && lightboxImg && galleryImages.length) {
    lightboxImg.style.transition = 'opacity 0.15s ease';

    const paintSlide = () => {
      lightboxImg.src = galleryImages[currentIndex];
      if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
    };

    const openLightbox = (index) => {
      // A pending fade from an earlier swipe would otherwise overwrite the
      // image we are about to show.
      if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
      lastFocused = document.activeElement;
      currentIndex = index;
      lightboxImg.style.opacity = '1';
      paintSlide();
      lightboxModal.classList.add('active');
      lockScroll();
      if (lightboxClose) lightboxClose.focus();
    };

    const closeLightbox = () => {
      if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
      lightboxModal.classList.remove('active');
      unlockScroll();
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    const goTo = (step) => {
      currentIndex = (currentIndex + step + galleryImages.length) % galleryImages.length;
      if (fadeTimer) clearTimeout(fadeTimer);
      lightboxImg.style.opacity = '0';
      fadeTimer = setTimeout(() => {
        paintSlide();
        lightboxImg.style.opacity = '1';
        fadeTimer = null;
      }, 150);
    };

    const showPrev = () => goTo(-1);
    const showNext = () => goTo(1);

    galleryItems.forEach((item, index) => {
      // The items are <div>s — make them reachable and operable by keyboard.
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      const label = item.querySelector('img')?.alt;
      if (label) item.setAttribute('aria-label', `Xem ${label}`);

      item.addEventListener('click', () => openLightbox(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    // Touch swipe for lightbox — ignore mostly-vertical drags so scrolling the
    // overlay does not register as a swipe.
    let touchStartX = 0;
    let touchStartY = 0;
    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    lightboxModal.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) showNext(); else showPrev();
      }
    }, { passive: true });
  }

  // 6. SCROLL REVEAL (IntersectionObserver)
  // .reveal starts at opacity:0, so if the observer is unavailable or motion is
  // reduced we must reveal everything up front or the page stays blank.
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  // 7. ADD TO CALENDAR EVENT
  const btnAddCalendar = document.getElementById('btn-add-calendar');
  if (btnAddCalendar) {
    btnAddCalendar.addEventListener('click', () => {
      const title = encodeURIComponent('Lễ Cưới Mạnh Dưỡng & Quỳnh Như');
      const details = encodeURIComponent('Trân trọng kính mời quý khách đến dự lễ cưới của Mạnh Dưỡng & Quỳnh Như tại Nhà thờ Trung Lao, Nam Định.');
      const location = encodeURIComponent('Nhà thờ Trung Lao, Nam Định');
      const dates = '20261018T040000Z/20261018T060000Z'; // UTC 11:00 AM VN time

      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
      window.open(googleCalUrl, '_blank');
    });
  }

  // 8. RSVP FORM SUBMISSION & DYNAMIC GUESTBOOK
  const rsvpForm = document.getElementById('rsvp-form');
  const guestbookList = document.getElementById('guestbook-list');

  const guestbookStatus = document.getElementById('guestbook-status');

  const setGuestbookStatus = (text) => {
    if (!guestbookStatus) return;
    guestbookStatus.textContent = text || '';
    guestbookStatus.hidden = !text;
  };

  // Nạp lời chúc từ Google Sheets. Đây là chiều ngược lại của việc gửi form:
  // Sheet là nguồn dữ liệu duy nhất, nên mọi khách đều thấy cùng một danh sách.
  const loadWishes = async () => {
    if (!guestbookList) return;
    if (!RSVP_ENDPOINT) {
      setGuestbookStatus('Chưa kết nối máy chủ nên chưa hiển thị được lời chúc.');
      guestbookList.setAttribute('aria-busy', 'false');
      return;
    }

    setGuestbookStatus('Đang tải lời chúc…');
    guestbookList.setAttribute('aria-busy', 'true');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(RSVP_ENDPOINT, { signal: controller.signal, redirect: 'follow' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Máy chủ trả về lỗi');

      guestbookList.querySelectorAll('.wish-card').forEach(el => el.remove());

      const wishes = Array.isArray(data.wishes) ? data.wishes : [];
      if (!wishes.length) {
        setGuestbookStatus('Chưa có lời chúc nào — hãy là người đầu tiên!');
      } else {
        setGuestbookStatus('');
        wishes.forEach(w => renderWishCard(w));
      }
    } catch (err) {
      console.error('[Sổ lưu bút] Không tải được:', err);
      setGuestbookStatus('Không tải được lời chúc, vui lòng thử lại sau.');
    } finally {
      clearTimeout(timeout);
      guestbookList.setAttribute('aria-busy', 'false');
    }
  };

  loadWishes();

  // Gửi bản ghi về Google Sheets. Dùng Content-Type text/plain để trình duyệt coi
  // đây là "simple request" — không phát sinh preflight OPTIONS, thứ mà Google
  // Apps Script không trả lời được.
  const sendToSheet = async (payload) => {
    if (!RSVP_ENDPOINT) {
      console.warn(
        '[RSVP] Chưa cấu hình RSVP_ENDPOINT — xác nhận của khách CHỈ lưu trên máy họ, ' +
        'bạn sẽ không nhận được gì. Xem HUONG-DAN-RSVP.md để thiết lập.'
      );
      return { ok: false, unconfigured: true };
    }
    // Mạng yếu ở nhà hàng có thể treo vô hạn; không có mốc dừng thì nút sẽ kẹt ở
    // "Đang gửi..." và khách không bao giờ thử lại được.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: controller.signal
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Máy chủ từ chối');
      return data;
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Quá thời gian chờ');
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

  if (rsvpForm) {
    const submitBtn = rsvpForm.querySelector('.btn-submit-rsvp');
    const submitLabel = submitBtn ? submitBtn.textContent : '';
    let sending = false;

    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return; // chặn double-click tạo hai dòng trùng trong Sheet

      const nameInput = document.getElementById('guest-name');
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        showToast('Vui lòng nhập họ và tên của bạn');
        return;
      }

      const side = document.querySelector('input[name="guest-side"]:checked')?.value || '';
      const attendance = document.querySelector('input[name="attendance"]:checked')?.value || '';
      const countSelect = document.getElementById('guest-count');
      const countValue = countSelect ? countSelect.value : '';
      const countLabel = countSelect ? countSelect.options[countSelect.selectedIndex].text : '';
      const message = document.getElementById('guest-message').value.trim();

      // Số người đi cùng chỉ gửi về Sheet cho bạn xem, không hiển thị công khai.
      const newWish = {
        name,
        side,
        attendance,
        message: message || 'Chúc hai bạn trăm năm hạnh phúc!',
        date: new Date().toLocaleDateString('vi-VN')
      };

      sending = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';
      }

      let result;
      try {
        result = await sendToSheet({
          name,
          side,
          attendance,
          countValue,
          countLabel,
          message: newWish.message
        });
      } catch (err) {
        console.error('[RSVP] Gửi thất bại:', err);
        sending = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        }
        // Không hiển thị lời chúc: thà báo lỗi thật còn hơn để khách tưởng đã gửi được.
        showToast('Gửi không thành công, vui lòng kiểm tra mạng và thử lại');
        return;
      }

      sending = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      }

      // Hiện ngay lời chúc vừa gửi để khách thấy phản hồi tức thì; lần tải trang
      // sau nó sẽ đến từ Sheet như mọi lời chúc khác.
      setGuestbookStatus('');
      renderWishCard(newWish, guestbookList.querySelector('.wish-card'));

      showToast(
        result.unconfigured
          ? 'Đã ghi nhận trên máy bạn (chưa kết nối máy chủ)'
          : 'Cảm ơn bạn đã gửi xác nhận & lời chúc! ❤️'
      );
      rsvpForm.reset();
    });
  }

  // `before` is the node to insert ahead of; omit to append at the end.
  function renderWishCard(wish, before) {
    if (!guestbookList) return;
    const name = String(wish.name ?? '').trim();
    if (!name) return;

    const meta = [wish.side, wish.attendance].map(v => String(v ?? '').trim()).filter(Boolean).join(' • ');
    const date = String(wish.date ?? '').trim();
    const card = document.createElement('div');
    card.className = 'wish-card';

    card.innerHTML = `
      <div class="wish-header">
        <div class="wish-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</div>
        <div class="wish-who">
          <div class="wish-author">${escapeHtml(name)}</div>
          <div class="wish-side">${escapeHtml(meta)}</div>
        </div>
      </div>
      <p class="wish-text">&ldquo;${escapeHtml(String(wish.message ?? ''))}&rdquo;</p>
      ${date ? `<div class="wish-date">${escapeHtml(date)}</div>` : ''}
    `;

    if (before) {
      guestbookList.insertBefore(card, before);
    } else {
      guestbookList.appendChild(card);
    }
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

});

// Global Copy Account Function
// navigator.clipboard is undefined on plain http:// and file:// — reading
// .writeText off it would throw synchronously, so check before using it and
// fall back to the legacy execCommand path.
window.copyAcc = function (accNumber) {
  const ok = () => showToast(`Đã sao chép STK: ${accNumber}`);
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = accNumber;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (err) {
      copied = false;
    }
    document.body.removeChild(ta);
    if (copied) ok(); else showToast(`STK: ${accNumber}`);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(accNumber).then(ok).catch(fallback);
  } else {
    fallback();
  }
};

// Global Toast function
let toastTimer = null;
window.showToast = function (msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  // Without clearing, an earlier toast's timer hides this one too early.
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, 3200);
};
