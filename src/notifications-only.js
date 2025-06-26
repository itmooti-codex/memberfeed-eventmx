import { notificationStore, GLOBAL_AUTHOR_ID } from "./config.js";
import { fetchGraphQL } from "./api/fetch.js";
import { GET__CONTACTS_NOTIFICATION_PREFERENCEE } from "./api/queries.js";
import { renderNotificationToggles } from "./ui/notificationPreference.js";
import { connectNotification, initNotificationEvents, refreshNotificationSubscription } from "./notifications.js";

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
  initNotificationsOnly(GLOBAL_AUTHOR_ID);
});
