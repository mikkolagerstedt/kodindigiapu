/**
 * Kodin Digiapu – script.js (PÄIVITETTY & OPTIMOITU)
 * Teema, navigointi, ankkuriskrolli, hinta-toggle, takaisin ylös, evästebanneri,
 * mobiili-CTA.
 *
 * + GA4: consent update (analytics_storage) turvallisesti
 * + GA4: lead events (phone / whatsapp / contact_form)
 * + aria-invalid siistitty (poistetaan kokonaan validissa tilassa)
 * + localStorage luku/kirjoitus suojattu try/catchilla
 * + Yhteystietokenttien ristiinnollaus simple-contact-formissa
 */

document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const body = document.body;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // =========================================================
  // 0. HELPERS
  // =========================================================
  const headerEl = $('header');
  const getHeaderOffset = () => {
    const h = headerEl ? headerEl.getBoundingClientRect().height : 0;
    return Math.max(0, Math.round(h) + 12);
  };

  const safeCallGtagConsentUpdate = (state) => {
    // state: 'granted' | 'denied'
    try {
      if (typeof gtag === 'function') {
        gtag('consent', 'update', { analytics_storage: state });
      }
    } catch (e) {}
  };

  const fireLeadEvent = (method) => {
    // method: 'phone' | 'whatsapp' | 'contact_form'
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', { method });
      }
    } catch (e) {}
  };

  // Pääyhteyslomakkeen validointi
  const setupFinnishFormValidation = (form) => {
    if (!form) return;

    const text = {
      required: 'Täytä tämä kenttä.',
      messageRequired: 'Kirjoita viesti ennen lähettämistä.',
      contactRequired: 'Anna puhelinnumero tai sähköpostiosoite.',
      phoneInvalid: 'Anna toimiva puhelinnumero.',
      emailInvalid: 'Anna toimiva sähköpostiosoite.',
      submitError: 'Lähetys ei onnistunut. Kokeile hetken kuluttua uudelleen.'
    };

    const fields = {
      name: form.querySelector('#name'),
      phone: form.querySelector('#phone'),
      email: form.querySelector('#email'),
      message: form.querySelector('#message')
    };

    const errors = {
      name: form.querySelector('#name-error'),
      phone: form.querySelector('#phone-error'),
      email: form.querySelector('#email-error'),
      message: form.querySelector('#message-error'),
      contact: form.querySelector('#contact-error'),
      submit: form.querySelector('#submit-error')
    };

    const setError = (field, errorEl, message) => {
      if (!field || !errorEl) return;
      if (message) {
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.removeAttribute('aria-invalid');
      }
      errorEl.textContent = message || '';
    };

    const clearSubmitError = () => {
      if (errors.submit) errors.submit.textContent = '';
    };

    const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhoneValid = (value) => {
      if (!value) return true;
      const digits = value.replace(/[^0-9]/g, '');
      return /^[0-9+()\-\s]+$/.test(value) && digits.length >= 6;
    };

    const validate = () => {
      let valid = true;
      clearSubmitError();

      const name = (fields.name?.value || '').trim();
      const phone = (fields.phone?.value || '').trim();
      const email = (fields.email?.value || '').trim();
      const message = (fields.message?.value || '').trim();

      setError(fields.name, errors.name, '');
      setError(fields.phone, errors.phone, '');
      setError(fields.email, errors.email, '');
      setError(fields.message, errors.message, '');
      if (errors.contact) errors.contact.textContent = '';

      if (!name) {
        setError(fields.name, errors.name, text.required);
        valid = false;
      }

      if (!message) {
        setError(fields.message, errors.message, text.messageRequired);
        valid = false;
      }

      if (!phone && !email) {
        if (errors.contact) errors.contact.textContent = text.contactRequired;
        if (fields.phone) fields.phone.setAttribute('aria-invalid', 'true');
        if (fields.email) fields.email.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (phone && !isPhoneValid(phone)) {
        setError(fields.phone, errors.phone, text.phoneInvalid);
        valid = false;
      }

      if (email && !isEmailValid(email)) {
        setError(fields.email, errors.email, text.emailInvalid);
        valid = false;
      }

      return valid;
    };

    [fields.name, fields.phone, fields.email, fields.message].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => validate());
      field.addEventListener('blur', () => validate());
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validate()) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Lähetetään...';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('submit_failed');

        fireLeadEvent('contact_form');
        window.location.href = '/kiitos.html';
      } catch (err) {
        if (errors.submit) errors.submit.textContent = text.submitError;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText || 'Lähetä viesti';
        }
      }
    });
  };

  // Kompakti yhteyslomake (alasivut)
  const setupSimpleContactForm = (form) => {
    if (!form) return;

    const submitError = form.querySelector('.form-submit-error');
    const submitBtn = form.querySelector('button[type="submit"]');
    const fields = {
      name: form.querySelector('input[name="name"]'),
      phone: form.querySelector('input[name="phone"]'),
      email: form.querySelector('input[name="email"]'),
      message: form.querySelector('textarea[name="message"]')
    };
    const errors = {
      name: form.querySelector('.form-error[data-error-for="name"]'),
      phone: form.querySelector('.form-error[data-error-for="phone"]'),
      email: form.querySelector('.form-error[data-error-for="email"]'),
      message: form.querySelector('.form-error[data-error-for="message"]'),
      contact: form.querySelector('.form-error[data-error-for="contact"]')
    };

    const text = {
      required: 'Täytä tämä kenttä.',
      messageRequired: 'Kirjoita viesti ennen lähettämistä.',
      contactRequired: 'Anna puhelinnumero tai sähköpostiosoite.',
      phoneInvalid: 'Anna toimiva puhelinnumero.',
      emailInvalid: 'Anna toimiva sähköpostiosoite.',
      submitError: 'Lähetys ei onnistunut. Kokeile hetken kuluttua uudelleen.'
    };

    const isPhoneValid = (value) => {
      const digits = value.replace(/[^0-9]/g, '');
      return /^[0-9+()\-\s]+$/.test(value) && digits.length >= 6;
    };

    const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const setError = (field, errorEl, message) => {
      if (field) {
        if (message) {
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.removeAttribute('aria-invalid');
        }
      }
      if (errorEl) errorEl.textContent = message || '';
    };

    const clearErrors = () => {
      setError(fields.name, errors.name, '');
      setError(fields.phone, errors.phone, '');
      setError(fields.email, errors.email, '');
      setError(fields.message, errors.message, '');
      if (errors.contact) errors.contact.textContent = '';
      if (submitError) submitError.textContent = '';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = (fields.name?.value || '').trim();
      const phone = (fields.phone?.value || '').trim();
      const email = (fields.email?.value || '').trim();
      const message = (fields.message?.value || '').trim();
      let valid = true;

      clearErrors();

      if (!name) {
        setError(fields.name, errors.name, text.required);
        valid = false;
      }

      if (!message) {
        setError(fields.message, errors.message, text.messageRequired);
        valid = false;
      }

      if (!phone && !email) {
        if (errors.contact) errors.contact.textContent = text.contactRequired;
        if (fields.phone) fields.phone.setAttribute('aria-invalid', 'true');
        if (fields.email) fields.email.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (phone && !isPhoneValid(phone)) {
        setError(fields.phone, errors.phone, text.phoneInvalid);
        valid = false;
      }

      if (email && !isEmailValid(email)) {
        setError(fields.email, errors.email, text.emailInvalid);
        valid = false;
      }

      if (!valid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Lähetetään...';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('submit_failed');

        fireLeadEvent('contact_form');
        window.location.href = '/kiitos.html';
      } catch (err) {
        if (submitError) submitError.textContent = text.submitError;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText || 'Lähetä viesti';
        }
      }
    });

    // UX-hionta: Yhteystietokenttien ristiinnollaus
    [fields.name, fields.phone, fields.email, fields.message].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        if (field === fields.name) setError(fields.name, errors.name, '');
        
        if (field === fields.phone) {
          setError(fields.phone, errors.phone, '');
          if (errors.contact && (fields.phone?.value || '').trim()) {
            errors.contact.textContent = '';
            if (fields.email && (!errors.email || !errors.email.textContent)) {
              setError(fields.email, errors.email, ''); 
            }
          }
        }
        
        if (field === fields.email) {
          setError(fields.email, errors.email, '');
          if (errors.contact && (fields.email?.value || '').trim()) {
            errors.contact.textContent = '';
            if (fields.phone && (!errors.phone || !errors.phone.textContent)) {
              setError(fields.phone, errors.phone, '');
            }
          }
        }
        
        if (field === fields.message) setError(fields.message, errors.message, '');
      });
    });
  };

  // =========================================================
  // 1. TUMMA/VALOISA TEEMA
  // =========================================================
  const themeToggle = $('#themeToggle');
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const themeColorMeta = $('#theme-color-meta');
  const syncThemeColorMeta = (theme) => {
    if (!themeColorMeta) return;
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#0b1220' : '#f8fafc');
  };
  let savedTheme = null;
  try {
    const rawTheme = localStorage.getItem('theme');
    if (rawTheme === 'light' || rawTheme === 'dark') savedTheme = rawTheme;
  } catch (e) {}

  const currentTheme = htmlEl.getAttribute('data-theme');
  const hasValidCurrentTheme = currentTheme === 'light' || currentTheme === 'dark';

  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  } else if (!hasValidCurrentTheme) {
    const prefersDark = mql ? mql.matches : false;
    htmlEl.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  syncThemeColorMeta(htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  const setTheme = (theme) => {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', safeTheme);
    syncThemeColorMeta(safeTheme);
    try {
      localStorage.setItem('theme', safeTheme);
    } catch (e) {}
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'light' : 'dark');
    });
  }

  if (mql && typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', (e) => {
      let hasUserTheme = false;
      try {
        const rawTheme = localStorage.getItem('theme');
        hasUserTheme = rawTheme === 'light' || rawTheme === 'dark';
      } catch (err) {}

      if (!hasUserTheme) {
        const nextTheme = e.matches ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', nextTheme);
        syncThemeColorMeta(nextTheme);
      }
    });
  }

  // =========================================================
  // 2. MOBIILINAVIGAATIO (ARIA + sulkeutuu ulos/ESC)
  // =========================================================
  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');

  const openMenu = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.add('show');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.innerHTML = '<i class="fas fa-times"></i>';
    body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    body.style.overflow = '';
  };

  const isMenuOpen = () => navLinks && navLinks.classList.contains('show');

  if (navToggle && navLinks) {
    navToggle.setAttribute('aria-expanded', 'false');

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });

    $$('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('click', (e) => {
      if (!isMenuOpen()) return;
      const clickedInsideMenu = navLinks.contains(e.target);
      const clickedToggle = navToggle.contains(e.target);
      if (!clickedInsideMenu && !clickedToggle) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen()) closeMenu();
    });
  }

  // =========================================================
  // 2b. ANKKURILINKKIEN SMOOTH SCROLL
  // =========================================================
  const handleAnchorClick = (e) => {
    const a = e.currentTarget;
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#')) return;

    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const y = window.scrollY + target.getBoundingClientRect().top - getHeaderOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });

    closeMenu();
  };

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', handleAnchorClick));

  // =========================================================
  // 3. HINTA-TOGGLE
  // =========================================================
  const priceDisplay = $('#price-display');
  const priceDesc = $('#price-description');
  const vatInfo = $('#vat-info-text');
  const expNormal = $('#explanation-without-deduction');
  const expDeducted = $('#explanation-with-deduction');

  const readPriceFromDataset = (key, fallback) => {
    if (!priceDisplay) return fallback;
    const v = priceDisplay.dataset ? priceDisplay.dataset[key] : null;
    const n = v ? Number(String(v).replace(',', '.')) : NaN;
    return Number.isFinite(n) ? n : fallback;
  };

  const NORMAL_HOURLY = readPriceFromDataset('normal', 60);
  const DEDUCTED_HOURLY = readPriceFromDataset('deducted', 39);

  const updatePriceDisplay = () => {
    const deductedRadio = $('#toggle-deducted');
    if (!deductedRadio || !priceDisplay || !priceDesc) return;

    const isDeducted = deductedRadio.checked;

    if (isDeducted) {
      priceDisplay.textContent = `${DEDUCTED_HOURLY}€`;
      priceDisplay.className = 'price-display deducted';
      priceDesc.textContent = '/ tunti kotitalousvähennyksellä (suuntaa-antava)';
      if (expNormal) expNormal.style.display = 'none';
      if (expDeducted) expDeducted.style.display = 'block';
      if (vatInfo) vatInfo.style.display = 'none';
    } else {
      priceDisplay.textContent = `${NORMAL_HOURLY}€`;
      priceDisplay.className = 'price-display normal';
      priceDesc.textContent = '/ tunti';
      if (expNormal) expNormal.style.display = 'block';
      if (expDeducted) expDeducted.style.display = 'none';
      if (vatInfo) vatInfo.style.display = 'block';
    }
  };

  const priceToggleInputs = $$('input[name="price-option"]');
  if (priceToggleInputs.length > 0) {
    priceToggleInputs.forEach((input) => input.addEventListener('change', updatePriceDisplay));
    updatePriceDisplay();
  }

  // =========================================================
  // 4. TAKAISIN YLÖS -PAINIKE
  // =========================================================
  const toTopBtn = $('#toTop');
  let ticking = false;

  const updateToTopVisibility = () => {
    if (!toTopBtn) return;

    const cookieVisible = body.classList.contains('cookie-banner-is-visible');
    if (cookieVisible) {
      toTopBtn.style.display = 'none';
      return;
    }
    toTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  };

  if (toTopBtn) {
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          updateToTopVisibility();
          ticking = false;
        });
      },
      { passive: true }
    );

    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateToTopVisibility();
  }

  // =========================================================
  // 5. EVÄSTEBANNERI (consent + remember)
  // =========================================================
  const banner = $('#cookie-consent-banner');
  const acceptBtn = $('#btn-consent-accept');
  const denyBtn = $('#btn-consent-deny');

  const hideBanner = () => {
    if (!banner) return;
    banner.style.display = 'none';
    body.classList.remove('cookie-banner-is-visible');
    updateToTopVisibility();
  };

  const showBanner = () => {
    if (!banner) return;
    banner.style.display = 'block';
    body.classList.add('cookie-banner-is-visible');
    updateToTopVisibility();
  };

  if (banner && acceptBtn && denyBtn) {
    let consentChoice = null;

    try {
      const rawChoice = localStorage.getItem('cookie_consent_choice');
      if (rawChoice === 'granted' || rawChoice === 'denied') {
        consentChoice = rawChoice;
      }
    } catch (e) {}

    if (!consentChoice) {
      showBanner();
    } else {
      // Varmistetaan tila, vaikka tämä ajetaankin myös HTML:n <head>-osiossa
      safeCallGtagConsentUpdate(consentChoice);
      banner.style.display = 'none';
      body.classList.remove('cookie-banner-is-visible');
      updateToTopVisibility();
    }

    acceptBtn.addEventListener('click', () => {
      safeCallGtagConsentUpdate('granted');
      try { localStorage.setItem('cookie_consent_choice', 'granted'); } catch (e) {}

      // Lähetä page_view heti kun lupa annetaan
      try {
        if (typeof gtag === 'function') {
          gtag('event', 'page_view');
        }
      } catch (e) {}

      hideBanner();
    });

    denyBtn.addEventListener('click', () => {
      safeCallGtagConsentUpdate('denied');
      try { localStorage.setItem('cookie_consent_choice', 'denied'); } catch (e) {}
      hideBanner();
    });
  }

  // =========================================================
  // 5b. GA4 LEAD EVENTS (phone / whatsapp / form)
  // =========================================================
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener('click', () => fireLeadEvent('phone'));
  });

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener('click', () => fireLeadEvent('whatsapp'));
  });

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    setupFinnishFormValidation(contactForm);
  }

  document.querySelectorAll('.js-simple-contact-form').forEach((form) => {
    setupSimpleContactForm(form);
  });

});
