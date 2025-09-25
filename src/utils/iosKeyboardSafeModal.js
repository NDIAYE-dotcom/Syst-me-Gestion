// src/utils/iosKeyboardSafeModal.js
// Optimisation supplémentaire pour iOS/Safari : padding dynamique et scroll forcé

export function enableIOSKeyboardSafeModal(modalSelector = '.modal') {
  if (typeof window === 'undefined') return;
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  // Détection iOS/Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (!isIOS) return;

  let lastPaddingBottom = 0;

  function adjustPaddingForKeyboard() {
    // Estimation de la hauteur du clavier (iOS ne donne pas l'info exacte)
    // On utilise la différence entre window.innerHeight et document.documentElement.clientHeight
    const keyboardHeight = window.screen.height - window.innerHeight;
    if (keyboardHeight > 100) {
      modal.style.paddingBottom = keyboardHeight + 32 + 'px';
      lastPaddingBottom = keyboardHeight + 32;
    } else {
      modal.style.paddingBottom = '32px';
      lastPaddingBottom = 32;
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
    adjustPaddingForKeyboard();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  modal.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('focus', onFocusInput);
  });

  // Initialisation
  adjustPaddingForKeyboard();

  // Nettoyage
  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    modal.querySelectorAll('input, select, textarea').forEach((el) => {
      el.removeEventListener('focus', onFocusInput);
    });
    modal.style.paddingBottom = '';
  };
}
