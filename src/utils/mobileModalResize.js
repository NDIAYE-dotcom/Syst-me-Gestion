// src/utils/mobileModalResize.js
// Gère dynamiquement la hauteur du modal sur mobile lors de l'ouverture du clavier

export function enableMobileModalResize(modalSelector = '.modal') {
  if (typeof window === 'undefined') return;
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  let lastHeight = window.innerHeight;

  function resizeModal() {
    // Utilise la hauteur visible du viewport ou 100svh si supporté
    let vh = window.innerHeight;
    if (window.visualViewport) {
      vh = window.visualViewport.height;
    }
    // Teste le support de 100svh
    if (CSS && CSS.supports && CSS.supports('height: 100svh')) {
      modal.style.height = '100svh';
      modal.style.maxHeight = '100svh';
      modal.style.minHeight = '100svh';
    } else {
      modal.style.height = vh + 'px';
      modal.style.maxHeight = vh + 'px';
      modal.style.minHeight = vh + 'px';
    }
    lastHeight = vh;
  }
  // Scroll automatique vers le champ actif lors du focus
  function scrollToActiveInput(e) {
    const input = e.target;
    if (input && modal.contains(input)) {
      setTimeout(() => {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 200);
    }
  }
  modal.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('focus', scrollToActiveInput);
  });

  // Sur mobile, resize sur chaque changement de taille (clavier ouvert/fermé)
  window.addEventListener('resize', resizeModal);
  window.addEventListener('orientationchange', resizeModal);

  // Initialisation
  resizeModal();

  // Nettoyage
  return () => {
    window.removeEventListener('resize', resizeModal);
    window.removeEventListener('orientationchange', resizeModal);
    modal.querySelectorAll('input, select, textarea').forEach((el) => {
      el.removeEventListener('focus', scrollToActiveInput);
    });
    if (modal) {
      modal.style.height = '';
      modal.style.maxHeight = '';
      modal.style.minHeight = '';
    }
  };
}
