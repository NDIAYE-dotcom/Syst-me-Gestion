// src/utils/focusScroll.js
// Permet de scroller automatiquement le champ actif dans le modal pour mobile

export function enableModalInputScroll(modalSelector = '.modal') {
  if (typeof window === 'undefined') return;
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  function scrollToInput(e) {
    const input = e.target;
    if (input && modal.contains(input)) {
      setTimeout(() => {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 200); // Laisse le temps au clavier de s'afficher
    }
  }

  // Ajoute l'écoute sur tous les inputs du modal
  modal.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('focus', scrollToInput);
  });

  // Nettoyage si besoin
  return () => {
    modal.querySelectorAll('input, select, textarea').forEach((el) => {
      el.removeEventListener('focus', scrollToInput);
    });
  };
}
