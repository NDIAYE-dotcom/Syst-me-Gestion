// src/utils/mobileKeyboardSafeModal.js
// Système avancé pour garantir la responsivité du modal avec clavier mobile

export function enableKeyboardSafeModal(modalSelector = '.modal') {
  if (typeof window === 'undefined') return;
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  let lastViewportHeight = window.innerHeight;
  let lastPaddingBottom = 0;

  function adjustModalHeight() {
    // Utilise la hauteur visible du viewport
    let vh = window.innerHeight;
    if (window.visualViewport) {
      vh = window.visualViewport.height;
    }
    modal.style.height = vh + 'px';
    modal.style.maxHeight = vh + 'px';
    modal.style.minHeight = vh + 'px';
    lastViewportHeight = vh;
  }

  function adjustPaddingForKeyboard() {
    // Détecte la zone masquée par le clavier (si possible)
    let keyboardHeight = 0;
    if (window.visualViewport) {
      keyboardHeight = window.innerHeight - window.visualViewport.height;
    }
    if (keyboardHeight > 0) {
      modal.style.paddingBottom = keyboardHeight + 24 + 'px';
      lastPaddingBottom = keyboardHeight + 24;
    } else {
      modal.style.paddingBottom = '24px';
      lastPaddingBottom = 24;
    }
  }

  function onFocusInput(e) {
    const input = e.target;
    if (input && modal.contains(input)) {
      setTimeout(() => {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        adjustPaddingForKeyboard();
      }, 200);
    }
  }

  function onResize() {
    adjustModalHeight();
    adjustPaddingForKeyboard();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
  }

  modal.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('focus', onFocusInput);
  });

  // Initialisation
  adjustModalHeight();
  adjustPaddingForKeyboard();

  // Nettoyage
  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onResize);
    }
    modal.querySelectorAll('input, select, textarea').forEach((el) => {
      el.removeEventListener('focus', onFocusInput);
    });
    modal.style.height = '';
    modal.style.maxHeight = '';
    modal.style.minHeight = '';
    modal.style.paddingBottom = '';
  };
}
