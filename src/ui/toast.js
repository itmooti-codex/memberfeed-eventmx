export function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-wrapper');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast flex items-center gap-4';
  toast.innerHTML = `
    <span class="toast-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2C9.34784 2 6.8043 3.05357 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C6.8043 20.9464 9.34784 22 12 22ZM10.4375 15.125H11.375V12.625H10.4375C9.91797 12.625 9.5 12.207 9.5 11.6875C9.5 11.168 9.91797 10.75 10.4375 10.75H12.3125C12.832 10.75 13.25 11.168 13.25 11.6875V15.125H13.5625C14.082 15.125 14.5 15.543 14.5 16.0625C14.5 16.582 14.082 17 13.5625 17H10.4375C9.91797 17 9.5 16.582 9.5 16.0625C9.5 15.543 9.91797 15.125 10.4375 15.125ZM12 7C12.3315 7 12.6495 7.1317 12.8839 7.36612C13.1183 7.60054 13.25 7.91848 13.25 8.25C13.25 8.58152 13.1183 8.89946 12.8839 9.13388C12.6495 9.3683 12.3315 9.5 12 9.5C11.6685 9.5 11.3505 9.3683 11.1161 9.13388C10.8817 8.89946 10.75 8.58152 10.75 8.25C10.75 7.91848 10.8817 7.60054 11.1161 7.36612C11.3505 7.1317 11.6685 7 12 7Z" fill="#035933"/>
      </svg>
    </span>
    <span class="toast-message text-nowrap">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 1500);
  }, duration);
}
