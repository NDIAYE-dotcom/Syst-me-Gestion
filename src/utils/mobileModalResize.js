// src/utils/mobileModalResize.js
// Gère dynamiquement la hauteur du modal sur mobile lors de l'ouverture du clavier

export function enableMobileModalResize(modalSelector = '.modal') {
  if (typeof window === 'undefined') return;
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  let lastHeight = window.innerHeight;

  function resizeModal() {
    // Utilise la hauteur visible du viewport
    const vh = window.innerHeight;
    if (modal) {
      modal.style.height = vh + 'px';
      modal.style.maxHeight = vh + 'px';
      modal.style.minHeight = vh + 'px';
      lastHeight = vh;
    }
  }

  // Sur mobile, resize sur chaque changement de taille (clavier ouvert/fermé)
  window.addEventListener('resize', resizeModal);
  window.addEventListener('orientationchange', resizeModal);

  // Initialisation
  resizeModal();

  // Nettoyage
  return () => {
    window.removeEventListener('resize', resizeModal);
    window.removeEventListener('orientationchange', resizeModal);
    if (modal) {
      modal.style.height = '';
      modal.style.maxHeight = '';
      modal.style.minHeight = '';
    }
  };
}
