let openModals = 0;

export function disableBodyScroll() {
  openModals++;
  if (openModals === 1) {
    document.body.classList.add('overflow-hidden');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
}

export function enableBodyScroll() {
  if (openModals > 0) {
    openModals--;
  }
  if (openModals === 0) {
    document.body.classList.remove('overflow-hidden');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}
