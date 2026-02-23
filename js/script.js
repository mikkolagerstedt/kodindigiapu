/**
 * Kodin Digiapu – script.js (PÄIVITETTY)
 * Teema, navigointi, ankkuriskrolli, hinta-toggle, takaisin ylös, evästebanneri,
 * ohjesivun platform-toggle, mobiili-CTA (VisualViewport fix)
 *
 * + GA4: consent update (analytics_storage)
 * + GA4: lead events (phone / whatsapp / contact_form)
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

  // =========================================================
  // 1. TUMMA/VALOISA TEEMA
  // =========================================================
  const themeToggle = $('#themeToggle');

  const setTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'light' : 'dark');
    });
  }

  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (mql && typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        htmlEl.setAttribute('data-theme', e.matches ? 'dark' : 'light');
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
      e.stopPropagation(); // TÄMÄ RIVI ON KORJAUS
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
  // 2b. ANKKURILINKKIEN SMOOTH SCROLL (fixed header huomioiden)
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
    const consentChoice = localStorage.getItem('cookie_consent_choice'); // 'granted' | 'denied' | null

    if (!consentChoice) {
      showBanner();
    } else {
      // Aseta tallennettu valinta myös GA:lle heti
      if (consentChoice === 'granted') safeCallGtagConsentUpdate('granted');
      if (consentChoice === 'denied') safeCallGtagConsentUpdate('denied');

      banner.style.display = 'none';
      body.classList.remove('cookie-banner-is-visible');
      updateToTopVisibility();
    }

    acceptBtn.addEventListener('click', () => {
      safeCallGtagConsentUpdate('granted');
      localStorage.setItem('cookie_consent_choice', 'granted');

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
      localStorage.setItem('cookie_consent_choice', 'denied');
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

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', () => fireLeadEvent('contact_form'));
  }

  // =========================================================
  // 6. OHJESIVUN VAIHTOPAINIKKEET (ANDROID/IPHONE)
  // =========================================================
  const platformToggleInputs = $$('input[name="platform-option"]');
  const androidContent = $('#android-instructions');
  const iphoneContent = $('#iphone-instructions');

  const updatePlatformContent = () => {
    if (!androidContent || !iphoneContent) return;

    const checked = $('input[name="platform-option"]:checked');
    if (!checked) return;

    const selected = checked.value;

    if (selected === 'android') {
      androidContent.style.display = 'block';
      iphoneContent.style.display = 'none';
      androidContent.classList.add('active');
      iphoneContent.classList.remove('active');
    } else {
      iphoneContent.style.display = 'block';
      androidContent.style.display = 'none';
      iphoneContent.classList.add('active');
      androidContent.classList.remove('active');
    }
  };

  if (platformToggleInputs.length > 0) {
    platformToggleInputs.forEach((input) => input.addEventListener('change', updatePlatformContent));
    updatePlatformContent();
  }

  // =========================================================
  // 7. MOBIILI-CTA-PALKIN KELLUMISEN KORJAUS (VisualViewport)
  // =========================================================
  const mobileCta = $('.mobile-sticky-cta');

  const getViewportBottomInset = () => {
    if (!window.visualViewport) return 0;
    const vv = window.visualViewport;
    return Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop)));
  };

  const updateCtaPosition = () => {
    if (!mobileCta) return;
    const inset = getViewportBottomInset();
    mobileCta.style.bottom = `${inset}px`;
  };

  if (mobileCta && window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateCtaPosition);
    window.visualViewport.addEventListener('scroll', updateCtaPosition);
    updateCtaPosition();
  }
});
