/**
 * Kodin Digiapu – script.js
 * Kaikki interaktiiviset toiminnot: teema, navigointi, hinta-toggle, takaisin ylös, evästebanneri
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==================================================================
  // 1. TUMMA/VALOISA TEEMA (SVG-KYTKIMELLÄ)
  // ==================================================================
  // HUOM: Teemaa hallitaan nyt <html>-elementissä (document.documentElement)
  // Tämä skripti vain hallinnoi NAPIN toimintaa.
  // Varsinainen teeman lataus tapahtuu <head>-skriptissä välähdyksen estämiseksi.
  
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement; // Kohdistetaan <html>

  // Vaihda teemaa napilla
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';

      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // Seuraa selaimen teemamuutoksia (jos käyttäjä ei ole tallentanut valintaa)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', newTheme);
    }
  });

  // Haetaan body-elementti vasta tässä, koska sitä tarvitaan alempana
  const body = document.body; 

  // ==================================================================
  // 2. MOBIILINAVIGAATIO (PÄIVITETTY ARIA-TUELLE JA IKONIN VAIHDOLLE)
  // ==================================================================
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      // Vaihdetaan 'show'-luokka
      const isVisible = navLinks.classList.toggle('show');
      // PÄIVITETÄÄN ARIA-ATTRIBUUTTI ruudunlukijoille
      navToggle.setAttribute('aria-expanded', isVisible);
      // Vaihda ikoni (fa-bars <-> fa-times)
      navToggle.innerHTML = isVisible ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Sulje valikko, kun linkkiä klikataan
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('show');
        // Suljetaan myös aria-attribuutti ja ikoni
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
    if (!priceToggleDeducted) return; // Varmistus, ettei kaadu alasivuilla

    const isDeducted = priceToggleDeducted.checked;
    const priceDisplay = document.getElementById('price-display');
    const priceDesc = document.getElementById('price-description');
    const vatInfo = document.getElementById('vat-info-text');
    const expNormal = document.getElementById('explanation-without-deduction');
    const expDeducted = document.getElementById('explanation-with-deduction');

    if (isDeducted) {
      priceDisplay.textContent = '39€'; // KORJATTU HINTA
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
  
  // Lisätään kuuntelija vain, jos elementti on olemassa
  const priceToggleInputs = document.querySelectorAll('input[name="price-option"]');
  if (priceToggleInputs.length > 0) {
    priceToggleInputs.forEach(input => {
      input.addEventListener('change', updatePriceDisplay);
    });
    // Alusta heti
    updatePriceDisplay();
  }

  // ==================================================================
  // 4. TAKAISIN YLÖS -PAINIKE
  // ==================================================================
  const toTopBtn = document.getElementById('toTop');

  if (toTopBtn) {
    window.addEventListener('scroll', () => {
      // Näytä nappi vain, jos evästebanneri EI OLE näkyvissä
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
      // Jos valintaa EI ole tehty, näytä banneri
      banner.style.display = 'block';
      // LISÄÄ LUOKKA, JOKA SIIRTÄÄ MOBIILIPALKKIA
      body.classList.add('cookie-banner-is-visible');
    }

    // Mitä tapahtuu kun hyväksytään
    acceptBtn.addEventListener('click', function() {
      // Päivitetään suostumus Googlelle
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
      // POISTA LUOKKA, MOBIILIPALKKI PALAA ALAS
      body.classList.remove('cookie-banner-is-visible');
    });

    // Mitä tapahtuu kun hylätään
    denyBtn.addEventListener('click', function() {
      localStorage.setItem('cookie_consent_choice', 'denied');
      banner.style.display = 'none';
      // POISTA LUOKKA, MOBIILIPALKKI PALAA ALAS
      body.classList.remove('cookie-banner-is-visible');
    });
  }
  
  // ==================================================================
  // 6. OHJESIVUN VAIHTOPAINIKKEET (ANDROID/IPHONE)
  // (PÄIVITETTY: Käytetään .active-luokkaa fade-efektin kanssa)
  // ==================================================================
  const platformToggleInputs = document.querySelectorAll('input[name="platform-option"]');
  const androidContent = document.getElementById('android-instructions');
  const iphoneContent = document.getElementById('iphone-instructions');

  const updatePlatformContent = () => {
    // Varmistetaan, että ollaan oikealla sivulla
    if (!androidContent || !iphoneContent) return;

    const selectedPlatform = document.querySelector('input[name="platform-option"]:checked').value;

    if (selectedPlatform === 'android') {
      androidContent.style.display = 'block';
      androidContent.classList.add('active');
      iphoneContent.classList.remove('active');
      iphoneContent.style.display = 'none';
    } else {
      iphoneContent.style.display = 'block';
      iphoneContent.classList.add('active');
      androidContent.classList.remove('active');
      androidContent.style.display = 'none';
    }
  };

  // Lisätään kuuntelija vain, jos elementtejä on sivulla
  if (platformToggleInputs.length > 0) {
    platformToggleInputs.forEach(input => {
      input.addEventListener('change', updatePlatformContent);
    });
    // Aseta oletustila heti latauksessa
    updatePlatformContent(); 
  }
// ==================================================================
  // 7. MOBIILI-CTA-PALKIN KELLUMISEN KORJAUS (Visual Viewport API)
  // ==================================================================
  const mobileCta = document.querySelector('.mobile-sticky-cta');

  if (mobileCta && window.visualViewport) {
    const updateCtaPosition = () => {
      // Haetaan visuaalisen näkymän alareunan etäisyys
      const viewportBottom = window.visualViewport.height - window.visualViewport.pageTop - window.visualViewport.height;
      
      // Asetetaan bottom-arvo dynaamisesti. 
      // 0px tarkoittaa, että se on kiinni näytön alareunassa.
      mobileCta.style.bottom = `${window.visualViewport.offsetBottom || 0}px`;
    };

    // Suorita heti ja aina kun selainikkunan koko muuttuu
    window.visualViewport.addEventListener('resize', updateCtaPosition);
    updateCtaPosition(); // Aseta oikea paikka heti latauksessa
  }
}); // <-- TÄMÄ ON KOKO TIEDOSTON VIIMEINEN SULKU