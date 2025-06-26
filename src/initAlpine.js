// src/initAlpine.js
; (function () {
    const el = document.documentElement; // or document.body, whichever you chose

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

    // listen for our custom events
    window.addEventListener('open-modal', () => modalForPostOpen = true);
    window.addEventListener('close-modal', () => modalForPostOpen = false);

    // if you still need the existing custom-date-time watcher:
    $watch('modalForCustomDateTime', v => v ? window.disableBodyScroll() : window.enableBodyScroll());
  `);
})();
