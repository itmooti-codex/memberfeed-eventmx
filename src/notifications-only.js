import { notificationStore, GLOBAL_AUTHOR_ID, state, DEFAULT_AVATAR } from "./config.js";
import { fetchGraphQL } from "./api/fetch.js";
import { GET__CONTACTS_NOTIFICATION_PREFERENCEE, FETCH_CONTACTS_QUERY } from "./api/queries.js";
import { tribute } from "./utils/tribute.js";
import { createFeedToSubmit } from "./features/posts/actions.js";
import {
  renderNotificationToggles,
  toggleAllOff,
  toggleOption,
} from "./ui/notificationPreference.js";
import { disableBodyScroll, enableBodyScroll } from "./utils/bodyScroll.js";
import {
  connectNotification,
  initNotificationEvents,
  refreshNotificationSubscription,
} from "./notifications.js";
import { initCommentHandlers } from "./features/posts/comments.js";
import { initReactionHandlers } from "./features/posts/reactions.js";
import { initPostModalHandlers } from "./features/posts/postModal.js";
import { initPreviewHandlers } from "./features/posts/preview.js";
import { initModerationHandlers } from "./features/posts/moderation.js";
import { updateCurrentUserUI } from "./ui/user.js";
import { initEmojiHandlers } from "./ui/emoji.js";
import { initGifPicker } from "./ui/gif.js";
import jsrender from 'jsrender';
window.$ = jsrender;

// Helpers used by JsRender templates. These are normally added in main.js
// but notifications-only.js runs on its own page without main.js, so we
// must register the helpers here as well.
$.views.helpers({
  totalComments(comments) {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.children?.length || 0);
    }, 0);
  },
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

function fetchContactsAndCurrentUser(contactId) {
  return fetchGraphQL(FETCH_CONTACTS_QUERY)
    .then((res) => {
      const contacts = res?.data?.feedContacts || [];
      state.allContacts = contacts.map((c) => c.Contact_ID);
      tribute.collection[0].values = contacts.map((c) => ({
        key: c.Display_Name || "Anonymous",
        value: c.Contact_ID,
        image: c.Profile_Image || DEFAULT_AVATAR,
      }));
      const current = contacts.find((c) => c.Contact_ID === contactId);
      if (current) {
        state.currentUser = {
          display_name: current.Display_Name || "Anonymous",
          profile_image: current.Profile_Image || DEFAULT_AVATAR,
        };
        updateCurrentUserUI(state);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch contacts", err);
    });
}

// Initialize notifications only
function initNotificationsOnly(contactId) {
  getNotificationPreferences(contactId);
  connectNotification();
  initNotificationEvents();
  initEmojiHandlers();
  initGifPicker();
  initCommentHandlers();
  initReactionHandlers();
  initModerationHandlers();
  initPostModalHandlers();
  initPreviewHandlers();
  refreshNotificationSubscription();
}

function updateLines() {
  const comments = document.querySelectorAll('.mainComment');
  comments.forEach((comment) => {
    const container = comment.closest('.commentContainer');
    const ribbon = container?.querySelector('.ribbonForOpeningReplies');
    if (ribbon && ribbon.classList.contains('ribbonForOpeningReplies')) {
      const commentRect = comment.getBoundingClientRect();
      const ribbonRect = ribbon.getBoundingClientRect();
      const verticalDistance =
        ribbonRect.top + ribbonRect.height / 2 - commentRect.bottom;
      comment.style.setProperty('--line-height', `${verticalDistance}px`);
      comment.classList.add('line-ready');
    }
  });
}

const style = document.createElement('style');
style.textContent = `
    .mainComment.line-ready::after {
        height: var(--line-height);
        width:16px;
        border-left: 1px solid var(--grey-200);
        border-bottom: 1px solid var(--grey-200);
        box-sizing: border-box;
        border-radius: 0 0 0 12px;
    }
`;
document.head.appendChild(style); 

// Call this on DOMContentLoaded or as needed
window.addEventListener("DOMContentLoaded", () => {
  window.disableBodyScroll = disableBodyScroll;
  window.enableBodyScroll = enableBodyScroll;
  window.toggleAllOff = toggleAllOff;
  window.toggleOption = toggleOption;
  window.createFeedToSubmit = createFeedToSubmit;
  fetchContactsAndCurrentUser(GLOBAL_AUTHOR_ID).then(() => {
    updateLines();
  });
  initNotificationsOnly(GLOBAL_AUTHOR_ID);
  const observer = new MutationObserver(() => updateLines());
  observer.observe(document.body, { childList: true, subtree: true });
});
