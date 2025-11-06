/**
 * Kodin Digiapu – script.js
 * Kaikki interaktiiviset toiminnot: teema, navigointi, hinta-toggle, takaisin ylös, evästebanneri
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==================================================================
  // 1. TUMMA/VALOISA TEEMA (SVG-KYTKIMELLÄ)
  // ==================================================================
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement; 

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', newTheme);
    }
  });

  const body = document.body; 

  // ==================================================================
  // 2. MOBIILINAVIGAATIO (PÄIVITETTY ARIA-TUELLE JA IKONIN VAIHDOLLE)
  // ==================================================================
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isVisible = navLinks.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', isVisible);
      navToggle.innerHTML = isVisible ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // ==================================================================
  // 3. HINTA-TOGGLE (PÄIVITETTY 2025 SÄÄNNÖILLÄ)
  // ==================================================================
  const updatePriceDisplay = () => {
    const priceToggleDeducted = document.getElementById('toggle-deducted');
    if (!priceToggleDeducted) return; 

    const isDeducted = priceToggleDeducted.checked;
    const priceDisplay = document.getElementById('price-display');
    const priceDesc = document.getElementById('price-description');
    const vatInfo = document.getElementById('vat-info-text');
    const expNormal = document.getElementById('explanation-without-deduction');
    const expDeducted = document.getElementById('explanation-with-deduction');

    if (isDeducted) {
      priceDisplay.textContent = '39€'; 
      priceDisplay.className = 'price-display deducted';
      priceDesc.textContent = '/ tunti kotitalousvähennyksellä';
      expNormal.style.display = 'none';
      expDeducted.style.display = 'block';
      vatInfo.style.display = 'none';
    } else {
      priceDisplay.textContent = '60€';
      priceDisplay.className = 'price-display normal';
      priceDesc.textContent = '/ tunti';
      expNormal.style.display = 'block';
      expDeducted.style.display = 'none';
      vatInfo.style.display = 'block';
    }
  };
  
  const priceToggleInputs = document.querySelectorAll('input[name="price-option"]');
  if (priceToggleInputs.length > 0) {
    priceToggleInputs.forEach(input => {
      input.addEventListener('change', updatePriceDisplay);
    });
    updatePriceDisplay();
  }

  // ==================================================================
  // 4. TAKAISIN YLÖS -PAINIKE
  // ==================================================================
  const toTopBtn = document.getElementById('toTop');

  if (toTopBtn) {
    window.addEventListener('scroll', () => {
      if (!body.classList.contains('cookie-banner-is-visible')) {
        toTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
      } else {
        toTopBtn.style.display = 'none';
      }
    });

    toTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==================================================================
  // 5. EVÄSTEBANNERIN JA MOBIILIPALKIN HALLINTA (PÄIVITETTY)
  // ==================================================================
  const banner = document.getElementById('cookie-consent-banner');
  const acceptBtn = document.getElementById('btn-consent-accept');
  const denyBtn = document.getElementById('btn-consent-deny');

  if (banner && acceptBtn && denyBtn) {
    const consentChoice = localStorage.getItem('cookie_consent_choice');

    if (!consentChoice) {
      banner.style.display = 'block';
      body.classList.add('cookie-banner-is-visible');
    }

    // Mitä tapahtuu kun hyväksytään
    acceptBtn.addEventListener('click', function() {
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      }
      localStorage.setItem('cookie_consent_choice', 'granted');
      banner.style.display = 'none';
      body.classList.remove('cookie-banner-is-visible');
    });

    // **TÄMÄ ON KRIITTINEN KORJAUS GOOGLE TAGILLE**
    // Mitä tapahtuu kun hylätään
    denyBtn.addEventListener('click', function() {
      // **LISÄTTY:** Päivitetään suostumus myös hylätessä
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      }
      localStorage.setItem('cookie_consent_choice', 'denied');
      banner.style.display = 'none';
      body.classList.remove('cookie-banner-is-visible');
    });
  }
  
  // ==================================================================
  // 6. OHJESIVUN VAIHTOPAINIKKEET (ANDROID/IPHONE)
  // ==================================================================
  const platformToggleInputs = document.querySelectorAll('input[name="platform-option"]');
  const androidContent = document.getElementById('android-instructions');
  const iphoneContent = document.getElementById('iphone-instructions');

  const updatePlatformContent = () => {
    if (!androidContent || !iphoneContent) return;

    const selectedPlatform = document.querySelector('input[name="platform-option"]:checked').value;

    if (selectedPlatform === 'android') {
      androidContent.style.display = 'block';
      setTimeout(() => androidContent.classList.add('active'), 10);
      iphoneContent.classList.remove('active');
      setTimeout(() => {
        if (document.querySelector('input[name="platform-option"]:checked').value === 'android') {
            iphoneContent.style.display = 'none';
        }
      }, 400); 

    } else {
      iphoneContent.style.display = 'block';
      setTimeout(() => iphoneContent.classList.add('active'), 10);
      androidContent.classList.remove('active');
      setTimeout(() => {
         if (document.querySelector('input[name="platform-option"]:checked').value === 'iphone') {
            androidContent.style.display = 'none';
         }
      }, 400);
    }
  };

  if (platformToggleInputs.length > 0) {
    platformToggleInputs.forEach(input => {
      input.addEventListener('change', updatePlatformContent);
    });
    updatePlatformContent(); 
  }
  
  // ==================================================================
  // 7. MOBIILI-CTA-PALKIN KELLUMISEN KORJAUS (Visual Viewport API)
  // ==================================================================
  const mobileCta = document.querySelector('.mobile-sticky-cta');

  if (mobileCta && window.visualViewport) {
    const updateCtaPosition = () => {
      mobileCta.style.bottom = `${window.visualViewport.offsetBottom || 0}px`;
    };
    window.visualViewport.addEventListener('resize', updateCtaPosition);
    updateCtaPosition(); 
  }

}); // <-- TÄMÄ ON KOKO TIEDOSTON VIIMEINEN SULKU