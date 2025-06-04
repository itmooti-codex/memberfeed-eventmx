import { fetchGraphQL } from '../../api/fetch.js';
import { MARK_NOTIFICATION_READ } from '../../api/queries.js';
import { GLOBAL_AUTHOR_ID, INACTIVITY_MS, renderedNotificationIds } from '../../config.js';
import { parseDate, timeAgo } from '../../utils/formatter.js';
import { startNotificationSocket } from './socket.js';

export function initNotifications() {
  const bell = document.querySelector('.notificationWrapperToggler');
  const wrapper = document.querySelector('.notificationsWrapper');
  let socketMgr;
  let inactivityTimer;

  bell.addEventListener('click', () => {
    wrapper.classList.toggle('hidden');
    wrapper.classList.toggle('flex');
  });

  function renderNotification(data) {
    const isRead =
      Array.isArray(data.Read_Contacts) &&
      data.Read_Contacts.some((rc) => rc.id === GLOBAL_AUTHOR_ID);

    const item = document.createElement('div');
    item.className =
      'notification-item mb-2 px-4 py-2 shadow-sm cursor-pointer flex items-start justify-between w-full ' +
      (isRead ? 'read' : 'unread');

    if (isRead) {
      const rc = data.Read_Contacts.find((rc) => rc.id === GLOBAL_AUTHOR_ID);
      item.dataset.readRecordId = rc.id;
    }

    if (renderedNotificationIds.has(data.ID)) return;
    renderedNotificationIds.add(data.ID);

    const textsWrapper = document.createElement('div');
    textsWrapper.className = 'flex flex-col';

    const title = document.createElement('div');
    title.className = 'text-[14px]';
    title.textContent = data.Title;

    const content = document.createElement('div');
    content.className = 'text-[12px]';
    content.textContent = data.Content;

    const timestamp = document.createElement('div');
    timestamp.textContent = timeAgo(parseDate(data.Date_Added));
    timestamp.className = 'text-xs text-gray-500';

    textsWrapper.append(title, content);
    item.append(textsWrapper, timestamp);

    item.addEventListener('click', async () => {
      const payload = {
        read_announcement_id: data.ID,
        read_contact_id: GLOBAL_AUTHOR_ID,
      };
      if (!item.classList.contains('read')) {
        try {
          await fetchGraphQL(MARK_NOTIFICATION_READ, { payload });
          item.classList.replace('unread', 'read');
        } catch (err) {
          console.error('Mark read failed', err);
        }
      }
    });

    document.getElementById('output').prepend(item);
    updateBellIndicator();
  }

  socketMgr = startNotificationSocket(renderNotification);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => socketMgr.close(), INACTIVITY_MS);
    } else {
      clearTimeout(inactivityTimer);
      socketMgr.reconnect();
    }
  });
}

document.getElementById('markAllAsRead').addEventListener('click', async () => {
  const unreadItems = document.querySelectorAll('.notification-item.unread');

  for (const item of unreadItems) {
    const payload = {
      read_announcement_id: item.dataset.announcementId,
      read_contact_id: GLOBAL_AUTHOR_ID,
    };
    try {
      await fetchGraphQL(MARK_NOTIFICATION_READ, { payload });
      item.classList.replace('unread', 'read');
      updateBellIndicator();
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  }
});

function updateBellIndicator() {
  const unreadCount = document.querySelectorAll('.notification-item.unread').length;
  const bell = document.querySelector('.notificationWrapperToggler');
  bell.classList.toggle('bell-indicator', unreadCount > 0);
}
