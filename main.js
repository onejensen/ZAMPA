// ===== Zampa Landing Page — main.js =====

document.addEventListener('DOMContentLoaded', () => {
  const LANG_OPTIONS = [
    { code: 'es', label: 'Español' },
    { code: 'ca', label: 'Català' },
    { code: 'eu', label: 'Euskara' },
    { code: 'gl', label: 'Galego' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'fi', label: 'Suomi' },
    { code: 'sv', label: 'Svenska' },
    { code: 'no', label: 'Norsk' }
  ];
  const SUPPORTED_LANGS = LANG_OPTIONS.map(lang => lang.code);
  const LANGUAGE_ALIASES = { nb: 'no', nn: 'no' };

  // ----- Burger Menu Toggle -----
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.header__nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      nav.classList.toggle('open');
    });

    // Close mobile nav when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('open');
      });
    });
  }

  // ----- Smooth Scroll for Same-Page Anchor Links -----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile nav if open
        if (burger) burger.classList.remove('active');
        if (nav) nav.classList.remove('open');
      }
    });
  });

  // ----- Language Selector -----
  const langSelector = document.querySelector('.lang-selector');
  const langBtn = document.querySelector('.lang-selector__btn');
  const langDropdown = document.querySelector('.lang-selector__dropdown');

  if (langBtn && langSelector) {
    if (langDropdown) {
      langDropdown.innerHTML = LANG_OPTIONS.map(({ code, label }) => `
        <button data-lang="${code.toUpperCase()}">${label}</button>
      `).join('');
    }

    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelector.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!langSelector.contains(e.target)) {
        langSelector.classList.remove('open');
      }
    });

    // Language selection — wired to i18n system
    if (langDropdown) {
      langDropdown.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.getAttribute('data-lang');
          const label = langBtn.querySelector('.lang-selector__label');
          if (label) label.textContent = lang;

          // Update active state
          langDropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          langSelector.classList.remove('open');

          // Trigger i18n language switch
          setLanguage(lang.toLowerCase());
        });
      });
    }
  }

  // ----- FAQ Accordion — Only One Open at a Time -----
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item && other.open) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });

  // ----- Scroll Animations (IntersectionObserver) -----
  const revealElements = document.querySelectorAll(
    '.fade-up, .fade-left, .fade-right, .fade-zoom, [data-stagger]'
  );

  document.querySelectorAll('[data-stagger]').forEach(container => {
    Array.from(container.children).forEach((child, i) => {
      child.style.setProperty('--reveal-index', i);
    });
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ===== i18n System =====
  const DEFAULT_LANG = 'es';
  const STORAGE_KEY = 'zampa-lang';

  let currentTranslations = {};

  function normalizeLanguage(lang) {
    const normalized = (lang || '').toLowerCase();
    return LANGUAGE_ALIASES[normalized] || normalized;
  }

  /**
   * Map a browser language code (e.g. "en-US", "ca", "pt-BR") to a supported lang.
   */
  function detectLanguage() {
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();

    // Exact match first (e.g. "es", "ca")
    if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

    // Prefix match (e.g. "en-US" -> "en", "pt-BR" -> "pt")
    const prefix = normalizeLanguage(browserLang.split('-')[0]);
    if (SUPPORTED_LANGS.includes(prefix)) return prefix;

    return DEFAULT_LANG;
  }

  /**
   * Resolve the initial language: saved preference > browser detection > fallback.
   */
  function getInitialLanguage() {
    const saved = normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    return detectLanguage();
  }

  /**
   * Fetch a translation JSON and apply it to the page.
   */
  async function loadTranslations(lang) {
    try {
      const resp = await fetch(`i18n/${lang}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      currentTranslations = await resp.json();
      applyTranslations();
    } catch (err) {
      console.warn(`[i18n] Failed to load ${lang}, falling back to ${DEFAULT_LANG}`, err);
      if (lang !== DEFAULT_LANG) {
        await loadTranslations(DEFAULT_LANG);
      }
    }
  }

  /**
   * Apply loaded translations to all elements with [data-i18n].
   */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (currentTranslations[key] != null) {
        if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = currentTranslations[key];
        } else {
          el.textContent = currentTranslations[key];
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (currentTranslations[key] != null) {
        el.setAttribute('placeholder', currentTranslations[key]);
      }
    });
  }

  // ----- Newsletter signup -----
  function setupNewsletterForm(formId, emailId, statusId) {
    const form = document.getElementById(formId);
    const emailInput = document.getElementById(emailId);
    const statusEl = document.getElementById(statusId);
    if (!form || !emailInput || !statusEl) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
      }

      const email = emailInput.value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      statusEl.textContent = '';

      try {
        const params = new URLSearchParams({ g: 'TeiJTc', email, $fields: '$email' });
        const res = await fetch('https://manage.kmail-lists.com/ajax/subscriptions/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });

        const json = await res.json();
        if (json.success) {
          statusEl.textContent = currentTranslations['newsletter.success'] || '¡Gracias por suscribirte! Bienvenido a Zampa';
          form.reset();
        } else {
          statusEl.textContent = currentTranslations['newsletter.error'] || 'Algo salió mal. Inténtalo de nuevo.';
          submitBtn.disabled = false;
        }
      } catch {
        statusEl.textContent = currentTranslations['newsletter.error'] || 'Algo salió mal. Inténtalo de nuevo.';
        submitBtn.disabled = false;
      }
    });
  }

  setupNewsletterForm('newsletterForm', 'newsletterEmail', 'newsletterStatus');

  // ----- Referral share button -----
  // Cliente invita a su bar/restaurante de confianza a registrarse.
  // Primera opción: Web Share API nativa (iOS/Android comparten a WhatsApp,
  // SMS, Mail, etc.). Si no está disponible (desktop), abrimos wa.me con el
  // mensaje precargado. Si tampoco se puede abrir ventana, copiamos al
  // portapapeles como último recurso.
  const referralBtn = document.getElementById('referralShareBtn');
  if (referralBtn) {
    const referralStatus = document.getElementById('referralStatus');
    const shareUrl = `${window.location.origin}/#merchants`;

    function setStatus(text) {
      if (referralStatus) referralStatus.textContent = text || '';
    }

    referralBtn.addEventListener('click', async () => {
      const text = currentTranslations['referral.share_text']
        || 'Hola! ¿Conoces Zampa? Es una app gratis donde los restaurantes publican su menú del día y los clientes los encuentran cerca. Creo que os puede encajar:';
      setStatus('');

      if (navigator.share) {
        try {
          await navigator.share({ title: 'Zampa', text, url: shareUrl });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
          // continúa al fallback
        }
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
      const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (popup) return;

      try {
        await navigator.clipboard.writeText(`${text} ${shareUrl}`);
        setStatus(currentTranslations['referral.copied'] || '¡Copiado! Pégalo donde quieras.');
      } catch {
        setStatus(currentTranslations['referral.share_error'] || 'No se pudo abrir la app para compartir.');
      }
    });
  }

  /**
   * Update UI state to reflect the active language.
   */
  function updateLangUI(lang) {
    const code = lang.toUpperCase();

    // Update the selector label
    const label = document.querySelector('.lang-selector__label');
    if (label) label.textContent = code;

    // Update active button in dropdown
    if (langDropdown) {
      langDropdown.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === code);
      });
    }

    // Update <html lang="">
    document.documentElement.lang = lang;
  }

  /**
   * Public: switch language, persist, and re-render.
   */
  async function setLanguage(lang) {
    lang = normalizeLanguage(lang);
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, lang);
    updateLangUI(lang);
    await loadTranslations(lang);
  }

  // ----- Initialise i18n on page load -----
  const initialLang = getInitialLanguage();
  updateLangUI(initialLang);
  loadTranslations(initialLang);
});
