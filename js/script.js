/**
 * Kodin Digiapu – script.js
 * Kaikki interaktiiviset toiminnot: teema, navigointi, hinta-toggle, palvelut-toggle, takaisin ylös
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==================================================================
  // 1. TUMMA/VALOISA TEEMA
  // ==================================================================
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');

  // Lataa tallennettu teema tai käytä selaimen oletusta
  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  body.setAttribute('data-theme', savedTheme);
  themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

  // Vaihda teemaa napilla
  themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  });

  // Seuraa selaimen teemamuutoksia (jos käyttäjä ei ole tallentanut valintaa)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      body.setAttribute('data-theme', newTheme);
      themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  });

  // ==================================================================
  // 2. MOBIILINAVIGAATIO
  // ==================================================================
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });

    // Sulje valikko, kun linkkiä klikataan
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('show');
      });
    });
  }

  // ==================================================================
  // 3. HINTA-TOGGLE (60€ ↔ 39€)
  // ==================================================================
  const updatePriceDisplay = () => {
    const isDeducted = document.getElementById('toggle-deducted').checked;
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

  document.querySelectorAll('input[name="price-option"]').forEach(input => {
    input.addEventListener('change', updatePriceDisplay);
  });

  updatePriceDisplay(); // Alusta heti

  // ==================================================================
  // 4. KOTI / YRITYS -TOGGLE (palvelut)
  // ==================================================================
  const updateClientView = () => {
    const isHome = document.getElementById('client-home').checked;
    document.getElementById('home-services').classList.toggle('active', isHome);
    document.getElementById('business-services').classList.toggle('active', !isHome);
  };

  document.querySelectorAll('input[name="client-type"]').forEach(input => {
    input.addEventListener('change', updateClientView);
  });

  updateClientView(); // Alusta

  // ==================================================================
  // 5. TAKAISIN YLÖS -PAINIKE
  // ==================================================================
  const toTopBtn = document.getElementById('toTop');

  window.addEventListener('scroll', () => {
    toTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
