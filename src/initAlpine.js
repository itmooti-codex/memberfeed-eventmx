import Alpine from 'alpinejs';
import focus from '@alpinejs/focus';

; (function () {
    const el = document.documentElement;

    el.setAttribute('x-data', `{
    showNotifications: false,
    showSettings: false,
    modalForPostOpen: false,
    openSettings: false,
    openScheduleDatePicker: false,
    modalForCustomDateTime: false,
    selectedDate: '',
    today: new Date().toISOString().split('T')[0]
  }`);

    el.setAttribute('x-init', `
    // toggle body scroll when the modal opens/closes
    $watch('modalForPostOpen', v => {
      if (v) {
        window.disableBodyScroll();
      } else {
        window.enableBodyScroll();
        window.pauseAllPlayers?.();
      }
    });
    window.addEventListener('open-modal', () => modalForPostOpen = true);
    window.addEventListener('close-modal', () => modalForPostOpen = false);
    $watch('modalForCustomDateTime', v => v ? window.disableBodyScroll() : window.enableBodyScroll());
  `);
})();

// Register plugins
Alpine.plugin(focus);

// Start Alpine.js
Alpine.start();
