// ===== Zampa Landing Page — main.js =====

document.addEventListener('DOMContentLoaded', () => {
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
  const SUPPORTED_LANGS = ['es', 'en', 'ca', 'eu', 'gl', 'pt', 'de', 'fr', 'it'];
  const DEFAULT_LANG = 'es';
  const STORAGE_KEY = 'zampa-lang';

  let currentTranslations = {};

  /**
   * Map a browser language code (e.g. "en-US", "ca", "pt-BR") to a supported lang.
   */
  function detectLanguage() {
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();

    // Exact match first (e.g. "es", "ca")
    if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

    // Prefix match (e.g. "en-US" -> "en", "pt-BR" -> "pt")
    const prefix = browserLang.split('-')[0];
    if (SUPPORTED_LANGS.includes(prefix)) return prefix;

    return DEFAULT_LANG;
  }

  /**
   * Resolve the initial language: saved preference > browser detection > fallback.
   */
  function getInitialLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
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
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterStatus = document.getElementById('newsletterStatus');

  if (newsletterForm && newsletterEmail && newsletterStatus) {
    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!newsletterEmail.checkValidity()) {
        newsletterEmail.reportValidity();
        return;
      }

      const email = newsletterEmail.value.trim();
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      newsletterStatus.textContent = '';

      try {
        const params = new URLSearchParams({
          g: 'TeiJTc',
          email,
          $fields: '$email'
        });
        const res = await fetch('https://manage.kmail-lists.com/ajax/subscriptions/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });

        const json = await res.json();
        if (res.ok && !json.errors) {
          newsletterStatus.textContent = currentTranslations['newsletter.success'] || '¡Suscrito! Revisa tu bandeja de entrada.';
          newsletterForm.reset();
        } else {
          console.error('Klaviyo error', res.status, json);
          newsletterStatus.textContent = `[DEBUG] ${res.status}: ${JSON.stringify(json).substring(0, 120)}`;
          submitBtn.disabled = false;
        }
      } catch (err) {
        console.error('Klaviyo fetch error:', err);
        newsletterStatus.textContent = `[DEBUG catch] ${err.message}`;
        submitBtn.disabled = false;
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
