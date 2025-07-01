import { notificationStore, GLOBAL_AUTHOR_ID } from "./config.js";
import { fetchGraphQL } from "./api/fetch.js";
import { GET__CONTACTS_NOTIFICATION_PREFERENCEE } from "./api/queries.js";
import { renderNotificationToggles } from "./ui/notificationPreference.js";
import { disableBodyScroll, enableBodyScroll } from "./utils/bodyScroll.js";
import {
  connectNotification,
  initNotificationEvents,
  refreshNotificationSubscription,
} from "./notifications.js";

// Helpers used by JsRender templates. These are normally added in main.js
// but notifications-only.js runs on its own page without main.js, so we
// must register the helpers here as well.
$.views.helpers({
  formatDate(unix) {
    if (!unix) return "";
    const date = new Date(Number(unix) * 1000);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month}, ${year}, ${hours}:${minutes}`;
  },
});

// Fetch and render notification preferences
function getNotificationPreferences(contactId) {
  return fetchGraphQL(GET__CONTACTS_NOTIFICATION_PREFERENCEE, { id: contactId })
    .then((res) => {
      const data = res?.data?.getContact;
      if (data) {
        notificationStore.preferences = data;
        renderNotificationToggles(data);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch notification preferences", err);
    });
}

// Initialize notifications only
function initNotificationsOnly(contactId) {
  getNotificationPreferences(contactId);
  connectNotification();
  initNotificationEvents();
  refreshNotificationSubscription();
}

// Call this on DOMContentLoaded or as needed
window.addEventListener("DOMContentLoaded", () => {
  window.disableBodyScroll = disableBodyScroll;
  window.enableBodyScroll = enableBodyScroll;
  initNotificationsOnly(GLOBAL_AUTHOR_ID);
});
