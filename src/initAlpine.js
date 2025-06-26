// src/initAlpine.js
; (function () {
    // target the <html> root so it’s “outside” of <body>
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
    $watch('modalForPostOpen', v => {
      if (v) {
        window.disableBodyScroll();
      } else {
        window.enableBodyScroll();
        window.pauseAllPlayers?.();
      }
    });
    $watch('modalForCustomDateTime', v => v ? window.disableBodyScroll() : window.enableBodyScroll());
  `);
})();
