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

  // ----- Smooth Scroll for Anchor Links -----
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

    // Language selection
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
});
