/* ============================================================
   ABARTECHZ — SCRIPT v4.0
   All 8 refined interactions
   ============================================================ */
'use strict';

const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];

const FORM_SUBMIT_EMAIL = 'info.abartechz@gmail.com';

async function sendForm(formName, formData) {
  formData.append('_subject', `AbarTechz Website Submission - ${formName}`);
  formData.append('_captcha', 'false');
  formData.append('Submission Date & Time', new Date().toLocaleString());
  formData.append('Form Identifier', formName);
  
  const response = await fetch(`https://formsubmit.co/ajax/${FORM_SUBMIT_EMAIL}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Form submission failed.');
  }
  
  return await response.json();
}

/* ============================================================
   1. SCROLL PROGRESS BAR
   ============================================================ */
(function () {
  const bar = qs('#scroll-progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const p = h.scrollHeight - window.innerHeight;
    bar.style.width = p > 0 ? (window.scrollY / p * 100) + '%' : '0%';
  }, { passive: true });
})();

/* ============================================================
   2. STICKY HEADER
   ============================================================ */
(function () {
  const header = qs('#header');
  if (!header) return;
  const tick = () => header.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ============================================================
   3. ACTIVE NAV LINK
   ============================================================ */
(function () {
  const sections = qsa('section[id]');
  const links    = qsa('.header__nav-link');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 120;
    sections.forEach(sec => {
      if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + sec.id));
      }
    });
  }, { passive: true });
})();

/* ============================================================
   4. MOBILE MENU
   ============================================================ */
(function () {
  const burger = qs('#burger-btn');
  const nav    = qs('#nav-menu');
  if (!burger || !nav) return;
  const close = () => { burger.classList.remove('is-open'); nav.classList.remove('is-open'); document.body.style.overflow = ''; };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  qsa('.header__nav-link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
})();

/* ============================================================
   5. SMOOTH SCROLL
   ============================================================ */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id === '#') return;
  const target = qs(id);
  if (!target) return;
  e.preventDefault();
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
});

/* ============================================================
   6. SCROLL REVEAL
   ============================================================ */
(function () {
  const els = qsa('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ============================================================
   7. BUTTON RIPPLE
   ============================================================ */
(function () {
  const s = document.createElement('style');
  s.textContent = '@keyframes _rpl{to{transform:scale(1);opacity:0}}';
  document.head.appendChild(s);
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    Object.assign(r.style, {
      position: 'absolute', width: size + 'px', height: size + 'px',
      left: (e.clientX - rect.left - size / 2) + 'px', top: (e.clientY - rect.top - size / 2) + 'px',
      borderRadius: '50%', background: 'rgba(255,255,255,0.20)', transform: 'scale(0)',
      animation: '_rpl 0.55s linear', pointerEvents: 'none', zIndex: '10'
    });
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
})();

/* ============================================================
   8. FOOTER YEAR
   ============================================================ */
(function () {
  const el = qs('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   9. HERO PARALLAX
   ============================================================ */
(function () {
  if (window.innerWidth < 768) return;
  const orb1 = qs('.hero__orb--1');
  const orb2 = qs('.hero__orb--2');
  const hero = qs('.hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > hero.offsetHeight) return;
    const p = y / hero.offsetHeight;
    if (orb1) orb1.style.transform = `translateY(${p * 60}px)`;
    if (orb2) orb2.style.transform = `translateY(${p * -40}px)`;
  }, { passive: true });
})();

/* ============================================================
   10. CONTACT FORM
   ============================================================ */
(function () {
  const form    = qs('#contact-form');
  const overlay = qs('#success-overlay');
  if (!form) return;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const flds = {
    name:    { el: qs('#c-name', form),    err: qs('#c-name-error', form) },
    email:   { el: qs('#c-email', form),   err: qs('#c-email-error', form) },
    message: { el: qs('#c-message', form), err: qs('#c-message-error', form) }
  };

  const validate = k => {
    const { el, err } = flds[k];
    const v = el.value.trim();
    let msg = '';
    if (k === 'name'   && (!v || v.length < 2)) msg = 'Name is required (min 2 chars).';
    if (k === 'email'  && (!v || !emailRe.test(v))) msg = 'Enter a valid email.';
    if (k === 'message'&& (!v || v.length < 10)) msg = 'Message is required (min 10 chars).';
    el.classList.toggle('is-error', !!msg);
    el.classList.toggle('is-valid', !msg && !!v);
    err.textContent = msg;
    return !msg;
  };

  Object.keys(flds).forEach(k => {
    flds[k].el.addEventListener('blur',  () => validate(k));
    flds[k].el.addEventListener('input', () => { if (flds[k].el.classList.contains('is-error')) validate(k); });
  });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!Object.keys(flds).map(k => validate(k)).every(Boolean)) return;
      const btn = form.querySelector('[type="submit"]');
      const orig = btn.innerHTML; btn.innerHTML = 'Sending…'; btn.disabled = true;
      try {
        const fd = new FormData(form);
        fd.set('Name', flds.name.el.value.trim());
        fd.set('Email', flds.email.el.value.trim());
        fd.set('Message', flds.message.el.value.trim());

        await sendForm('Contact Us Form', fd);

        form.reset();
        Object.values(flds).forEach(f => f.el.classList.remove('is-error','is-valid'));
        if (overlay) overlay.classList.add('is-visible');
      } catch (err) {
        console.error('Contact submit error:', err);
        alert('❌ Failed to send message. Please check your network and try again.');
      } finally {
        btn.innerHTML = orig; btn.disabled = false;
      }
    });

  const closeBtn = qs('#success-close');
  if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('is-visible'));
  if (overlay)  overlay.addEventListener('click',  e => { if (e.target === overlay) overlay.classList.remove('is-visible'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay) overlay.classList.remove('is-visible'); });
})();

/* ============================================================
   11. MEETING TOAST — 5-second floating confirmation
   ============================================================ */
function showMeetingToast(date, time, mode) {
  const toast    = qs('#meeting-toast');
  const details  = qs('#meeting-toast-details');
  const progress = qs('#meeting-toast-progress');
  const closeBtn = qs('#meeting-toast-close');
  if (!toast) return;

  const fmtDate = d => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  if (details) details.innerHTML = `
    <span><strong>Date:</strong> ${fmtDate(date)}</span>
    <span><strong>Time:</strong> ${time || '—'}</span>
    <span><strong>Mode:</strong> ${mode || '—'}</span>
  `;

  toast.classList.add('is-visible');
  if (progress) {
    progress.classList.remove('is-running');
    void progress.offsetWidth; // reflow
    progress.classList.add('is-running');
  }

  let timer = setTimeout(() => closeMeetingToast(), 5000);

  if (closeBtn) {
    closeBtn.onclick = () => { clearTimeout(timer); closeMeetingToast(); };
  }

  function closeMeetingToast() {
    toast.classList.remove('is-visible');
    // redirect to home after toast closes
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }
}

/* ============================================================
   12. SCHEDULE MEETING MODAL
   ============================================================ */
(function () {
  const overlay   = qs('#schedule-modal');
  const closeBtn  = qs('#modal-close');
  const stepForm  = qs('#modal-step-form');
  const form      = qs('#schedule-form');
  if (!overlay || !form) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^[\d\s\-\(\)]{6,}$/;

  // Open
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.js-schedule-trigger');
    if (!trigger) return;
    e.preventDefault();
    const purpose = trigger.dataset.purpose || '';
    const pf = qs('#m-purpose');
    if (pf && purpose) pf.value = purpose;
    stepForm.classList.remove('modal__step--hidden');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  });

  const closeModal = () => {
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Fields
  const mf = {
    name:    { el: qs('#m-name'),    err: qs('#m-name-error') },
    email:   { el: qs('#m-email'),   err: qs('#m-email-error') },
    phone:   { el: qs('#m-phone'),   err: qs('#m-phone-error') },
    purpose: { el: qs('#m-purpose'), err: qs('#m-purpose-error') },
    date:    { el: qs('#m-date'),    err: qs('#m-date-error') },
    time:    { el: qs('#m-time'),    err: qs('#m-time-error') }
  };

  const validateF = k => {
    const { el, err } = mf[k];
    if (!el) return true;
    const v = el.value.trim();
    let msg = '';
    if (k === 'name'   && (!v || v.length < 2)) msg = 'Full name required (min 2 chars).';
    if (k === 'email'  && (!v || !emailRe.test(v))) msg = 'Enter a valid email.';
    if (k === 'phone'  && (!v || !phoneRe.test(v))) msg = 'Enter a valid phone number.';
    if (k === 'purpose'&& !v) msg = 'Please select a meeting purpose.';
    if (k === 'date'   && !v) msg = 'Please select a date.';
    if (k === 'time'   && !v) msg = 'Please select a time.';
    el.classList.toggle('is-error', !!msg);
    el.classList.toggle('is-valid', !msg && !!v);
    if (err) err.textContent = msg;
    return !msg;
  };

  const validateMode = () => {
    const sel = qs('#m-mode-select');
    const err = qs('#m-mode-error');
    if (!sel || !sel.value) { if (err) err.textContent = 'Please select a meeting platform.'; return false; }
    if (err) err.textContent = '';
    return true;
  };

  Object.keys(mf).forEach(k => {
    const el = mf[k].el;
    if (!el) return;
    el.addEventListener('blur',  () => validateF(k));
    el.addEventListener('input', () => { if (el.classList.contains('is-error')) validateF(k); });
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', () => { if (el.classList.contains('is-error')) validateF(k); });
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok1 = Object.keys(mf).map(k => validateF(k)).every(Boolean);
    const ok2 = validateMode();
    if (!ok1 || !ok2) return;

    const btn  = form.querySelector('.modal__submit');
    const orig = btn.innerHTML;
    btn.innerHTML = 'Scheduling…'; btn.disabled = true;

    try {
      const fd = new FormData(form);
      fd.set('Full Name', mf.name.el.value.trim());
      fd.set('Email', mf.email.el.value.trim());
      fd.set('Contact Number', (qs('#m-country-code') ? qs('#m-country-code').value : '') + ' ' + mf.phone.el.value.trim());
      fd.set('Company Name', qs('#m-company') ? qs('#m-company').value.trim() : '');
      fd.set('Meeting Purpose', mf.purpose.el.value.trim());
      fd.set('Preferred Date', mf.date.el.value.trim());
      fd.set('Preferred Time', mf.time.el.value.trim());
      fd.set('Meeting Mode', qs('#m-mode-select') ? qs('#m-mode-select').value : '');

      await sendForm('Schedule Meeting Modal', fd);

      const dateVal = mf.date.el.value;
      const timeVal = mf.time.el.value;
      const modeVal = qs('#m-mode-select') ? qs('#m-mode-select').value : '';

      // Reset form
      form.reset();
      Object.values(mf).forEach(f => { if (f.el) f.el.classList.remove('is-error','is-valid'); });
      const modeErr = qs('#m-mode-error'); if (modeErr) modeErr.textContent = '';

      // Close modal
      closeModal();

      // Show floating toast
      showMeetingToast(dateVal, timeVal, modeVal);
    } catch (err) {
      console.error('Schedule submit error:', err);
      alert('❌ Failed to schedule meeting. Please check your network and try again.');
    } finally {
      btn.innerHTML = orig; btn.disabled = false;
    }
  });
})();

/* ============================================================
   13. NEWSLETTER
   ============================================================ */
(function () {
  const form  = qs('#newsletter-form');
  const input = qs('#newsletter-email');
  const msg   = qs('#newsletter-msg');
  if (!form) return;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const v = input ? input.value.trim() : '';
    if (!v || !emailRe.test(v)) {
      if (msg) { msg.textContent = 'Enter a valid email.'; msg.className = 'footer__newsletter-msg is-error'; }
      return;
    }
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.innerHTML; btn.innerHTML = '…'; btn.disabled = true;
    try {
      const fd = new FormData();
      fd.append('Email', v);

      await sendForm('Newsletter Subscription', fd);

      form.reset();
      if (msg) {
        msg.textContent = '✓ Subscribed! Welcome to AbarTechz.';
        msg.className = 'footer__newsletter-msg is-success';
        setTimeout(() => { msg.textContent = ''; msg.className = 'footer__newsletter-msg'; }, 5000);
      }
    } catch (err) {
      console.error('Newsletter submit error:', err);
      if (msg) {
        msg.textContent = 'Submission failed. Try again.';
        msg.className = 'footer__newsletter-msg is-error';
      }
    } finally {
      btn.innerHTML = orig; btn.disabled = false;
    }
  });
})();

/* ============================================================
   14. SIGN IN — FLOATING LOGIN CARD
   ============================================================ */
(function () {
  const overlay     = qs('#login-overlay');
  const card        = qs('#login-card');
  const signinBtn   = qs('#signin-btn');
  const closeMain   = qs('#login-close');
  const closeMain2  = qs('#login-close-2');
  const requestBtn  = qs('#request-access-btn');
  const backBtn     = qs('#login-back-btn');
  const sentClose   = qs('#login-sent-close');

  const stepMain    = qs('#login-step-main');
  const stepRequest = qs('#login-step-request');
  const stepSent    = qs('#login-step-sent');

  const loginForm   = qs('#login-form');
  const requestForm = qs('#request-form');

  if (!overlay) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showStep = step => {
    [stepMain, stepRequest, stepSent].forEach(s => { if (s) s.classList.add('login-step--hidden'); });
    if (step) step.classList.remove('login-step--hidden');
  };

  const openLogin = () => {
    showStep(stepMain);
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  };

  const closeLogin = () => {
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  };

  if (signinBtn)  signinBtn.addEventListener('click', openLogin);

  document.addEventListener('click', e => {
    const trigger = e.target.closest('.js-signin-trigger');
    if (!trigger) return;
    e.preventDefault();
    openLogin();
  });
  if (closeMain)  closeMain.addEventListener('click', closeLogin);
  if (closeMain2) closeMain2.addEventListener('click', closeLogin);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLogin(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLogin(); });

  if (requestBtn) requestBtn.addEventListener('click', () => showStep(stepRequest));
  if (backBtn)    backBtn.addEventListener('click',    () => showStep(stepMain));
  if (sentClose)  sentClose.addEventListener('click',  () => { closeLogin(); showStep(stepMain); });

  // Password toggle
  const pwdToggle = qs('#pwd-toggle');
  const pwdInput  = qs('#l-password');
  if (pwdToggle && pwdInput) {
    pwdToggle.addEventListener('click', () => {
      pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Login form submit (simulated)
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailEl  = qs('#l-email');
      const emailErr = qs('#l-email-error');
      const pwdEl    = qs('#l-password');
      const pwdErr   = qs('#l-password-error');
      let ok = true;

      if (!emailEl.value.trim() || !emailRe.test(emailEl.value.trim())) {
        emailEl.classList.add('is-error'); if (emailErr) emailErr.textContent = 'Enter a valid email.'; ok = false;
      } else { emailEl.classList.remove('is-error'); if (emailErr) emailErr.textContent = ''; }

      if (!pwdEl.value || pwdEl.value.length < 6) {
        pwdEl.classList.add('is-error'); if (pwdErr) pwdErr.textContent = 'Password must be at least 6 characters.'; ok = false;
      } else { pwdEl.classList.remove('is-error'); if (pwdErr) pwdErr.textContent = ''; }

      if (!ok) return;
      // Simulated: just close for now
      const btn = loginForm.querySelector('[type="submit"]');
      const orig = btn.innerHTML; btn.innerHTML = 'Signing in…'; btn.disabled = true;
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; closeLogin(); }, 1000);
    });
  }

  // Request access submit
  if (requestForm) {
    requestForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailEl  = qs('#r-email');
      const emailErr = qs('#r-email-error');
      if (!emailEl.value.trim() || !emailRe.test(emailEl.value.trim())) {
        emailEl.classList.add('is-error'); if (emailErr) emailErr.textContent = 'Enter a valid email.'; return;
      }
      emailEl.classList.remove('is-error'); if (emailErr) emailErr.textContent = '';
      const btn = requestForm.querySelector('[type="submit"]');
      const orig = btn.innerHTML; btn.innerHTML = 'Sending…'; btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = orig; btn.disabled = false;
        requestForm.reset();
        showStep(stepSent);
      }, 1000);
    });
  }

  // Open Login if URL hash is #signin on load
  if (window.location.hash === '#signin') {
    setTimeout(openLogin, 300);
  }

  // Listen for hashchange to support direct triggers on page
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#signin') {
      openLogin();
    }
  });
})();

/* ============================================================
   15. INNOVATOR APPLICATION MODAL
   ============================================================ */
(function () {
  const overlay   = qs('#innovator-modal');
  const closeBtn  = qs('#innovator-modal-close');
  const form      = qs('#innovator-form');
  if (!overlay) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^[\d\s\+\-\(\)]{6,}$/;

  // Handle file name display and style updates on change
  const resumeEl = qs('#i-resume');
  if (resumeEl) {
    resumeEl.addEventListener('change', () => {
      const file = resumeEl.files[0];
      const textEl = qs('.file-upload-text', resumeEl.parentElement);
      if (file) {
        textEl.textContent = file.name;
        resumeEl.parentElement.classList.add('is-valid');
        resumeEl.parentElement.classList.remove('is-error');
        const errEl = qs('#i-resume-error');
        if (errEl) errEl.textContent = '';
      } else {
        textEl.textContent = 'Choose file (PDF, DOC, DOCX)';
        resumeEl.parentElement.classList.remove('is-valid');
      }
    });
  }

  document.addEventListener('click', e => {
    if (e.target.closest('.js-innovator-form')) {
      e.preventDefault();
      overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
  });

  const close = () => {
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    if (form) {
      form.reset();
      const textEl = qs('.file-upload-text', form);
      if (textEl) textEl.textContent = 'Choose file (PDF, DOC, DOCX)';
      const wrapEl = qs('.file-upload-wrap', form);
      if (wrapEl) wrapEl.classList.remove('is-valid', 'is-error');
      qsa('.form-input', form).forEach(el => el.classList.remove('is-error', 'is-valid'));
      qsa('.form-error', form).forEach(el => el.textContent = '');
    }
  };
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const nameEl  = qs('#i-name');   const nameErr  = qs('#i-name-error');
      const emailEl = qs('#i-email');  const emailErr = qs('#i-email-error');
      const phoneEl = qs('#i-phone');  const phoneErr = qs('#i-phone-error');
      const fileEl  = qs('#i-resume'); const fileErr  = qs('#i-resume-error');
      const whyEl   = qs('#i-why');    const whyErr   = qs('#i-why-error');
      const fileWrap = qs('.file-upload-wrap');
      let ok = true;

      const chk = (el, err, cond, msg) => {
        if (cond) {
          el.classList.add('is-error');
          if (err) err.textContent = msg;
          ok = false;
        } else {
          el.classList.remove('is-error');
          if (err) err.textContent = '';
        }
      };

      chk(nameEl,  nameErr,  !nameEl.value.trim() || nameEl.value.trim().length < 2,  'Name is required.');
      chk(emailEl, emailErr, !emailEl.value.trim() || !emailRe.test(emailEl.value),    'Enter a valid email.');
      chk(phoneEl, phoneErr, !phoneEl.value.trim() || !phoneRe.test(phoneEl.value),    'Enter a valid phone number.');
      chk(whyEl,   whyErr,   !whyEl.value.trim() || whyEl.value.trim().length < 10,    'Please tell us more (min 10 chars).');

      // File validation
      const file = fileEl && fileEl.files[0];
      let fileMsg = '';
      if (!file) {
        fileMsg = 'Please upload your resume.';
      } else {
        const allowedExts = ['pdf', 'doc', 'docx'];
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowedExts.includes(ext)) {
          fileMsg = 'Only PDF, DOC, and DOCX files are allowed.';
        } else if (file.size > 5 * 1024 * 1024) {
          fileMsg = 'File size must be under 5MB.';
        }
      }

      if (fileMsg) {
        if (fileWrap) fileWrap.classList.add('is-error');
        if (fileErr) fileErr.textContent = fileMsg;
        ok = false;
      } else {
        if (fileWrap) {
          fileWrap.classList.remove('is-error');
          fileWrap.classList.add('is-valid');
        }
        if (fileErr) fileErr.textContent = '';
      }

      if (!ok) return;
      const btn = form.querySelector('[type="submit"]');
      const orig = btn.innerHTML; btn.innerHTML = 'Submitting…'; btn.disabled = true;

      try {
        const fd = new FormData();
        fd.append('Name', nameEl.value.trim());
        fd.append('Email', emailEl.value.trim());
        fd.append('Phone Number', phoneEl.value.trim());
        fd.append('Why Join', whyEl.value.trim());
        fd.append('Resume File', file);

        await sendForm('Become an Innovator Form', fd);

        close();
        alert('✅ Application submitted! We\'ll review it and reach out within 48 hours.');
      } catch (err) {
        console.error('Innovator form error:', err);
        alert('❌ Failed to submit application. Please check your network and try again.');
      } finally {
        btn.innerHTML = orig; btn.disabled = false;
      }
    });
  }
})();

/* ============================================================
   16. TIMELINE STAGGER
   ============================================================ */
qsa('.ct-node').forEach((el, i) => { el.style.transitionDelay = (i * 0.12) + 's'; });
