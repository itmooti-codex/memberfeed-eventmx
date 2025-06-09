import {
  state,
  PROTOCOL,
  WS_ENDPOINT,
  SUB_ID,
  KEEPALIVE_MS,
  MAX_BACKOFF,
  INACTIVITY_MS,
  GLOBAL_AUTHOR_ID,
  setGlobalAuthorId,
  DEFAULT_AVATAR,
  GLOBAL_PAGE_TAG,
} from "./config.js";
import {
  GQL_QUERY,
  FETCH_CONTACTS_QUERY,
  GET_CONTACTS_BY_TAGS,
} from "./api/queries.js";
import { safeArray } from "./utils/formatter.js";
import { buildTree } from "./ui/render.js";
import { flattenComments } from "./utils/posts.js";
import { mergeLists } from "./utils/merge.js";
import { initPosts, applyFilterAndRender } from "./features/posts/index.js";
import { fetchGraphQL } from "./api/fetch.js";
import { tribute } from "./utils/tribute.js";
import { initFilePond, resumeAudioContext } from "./utils/filePond.js";
import { initNotifications } from "./features/notifications/index.js";
import "./features/uploads/handlers.js";
import { initEmojiHandlers } from "./ui/emoji.js";
import { initRichText } from "./utils/richText.js";
import { setupPlyr } from "./utils/plyr.js";

function terminateAndClose() {
  if (state.socket && state.socket.readyState === WebSocket.OPEN) {
    state.socket.send(JSON.stringify({ type: "CONNECTION_TERMINATE" }));
    state.socket.close();
  }
}

export function connect() {
  if (
    state.isConnecting ||
    (state.socket &&
      (state.socket.readyState === WebSocket.OPEN ||
        state.socket.readyState === WebSocket.CONNECTING))
  ) {
    return;
  }
  state.isConnecting = true;
  state.socket = new WebSocket(WS_ENDPOINT, PROTOCOL);
  state.socket.addEventListener("open", () => {
    state.backoff = 1000;
    state.socket.send(JSON.stringify({ type: "CONNECTION_INIT" }));
    state.keepAliveTimer = setInterval(() => {
      state.socket.send(JSON.stringify({ type: "KEEP_ALIVE" }));
    }, KEEPALIVE_MS);
    state.isConnecting = false;
  });
  state.socket.addEventListener("message", ({ data }) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      console.error("Invalid JSON", data);
      return;
    }
    if (msg.type === "CONNECTION_ACK") {
      state.socket.send(
        JSON.stringify({
          id: SUB_ID,
          type: "GQL_START",
          payload: {
            query: GQL_QUERY,
            variables: { forum_tag: GLOBAL_PAGE_TAG },
          },
        })
      );
    } else if (
      msg.type === "GQL_DATA" &&
      msg.id === SUB_ID &&
      msg.payload?.data
    ) {
      const incoming = msg.payload.data.subscribeToForumPosts ?? [];
      state.rawPosts = mergeLists(state.rawPosts, incoming);
      state.rawComments = flattenComments(state.rawPosts);
      state.postsStore = buildTree(
        state.postsStore,
        state.rawPosts,
        state.rawComments
      );
      state.initialPostsLoaded = true;
      if (state.ignoreNextSocketUpdate) {
        state.ignoreNextSocketUpdate = false;
      } else {
        applyFilterAndRender();
      }
      requestAnimationFrame(setupPlyr);
    } else if (msg.type === "GQL_ERROR") {
      console.error("Subscription error", msg.payload);
    } else if (msg.type === "GQL_COMPLETE") {
      console.warn("Subscription complete");
      // Modern servers keep the connection open after sending GQL_COMPLETE.
      // Avoid sending an extra GQL_START which previously caused the server
      // to close the socket and trigger a reconnect.
      // Close the connection gracefully so the reconnect logic can
      // establish a fresh subscription if needed.
      if (state.socket && state.socket.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify({ type: "CONNECTION_TERMINATE" }));
        state.socket.close();
      }
    }
  });
  state.socket.addEventListener("error", (e) => {
    console.error("WebSocket error", e);
    state.isConnecting = false;
  });
  state.socket.addEventListener("close", () => {
    clearInterval(state.keepAliveTimer);
    state.keepAliveTimer = null;
    state.socket = null;
    state.isConnecting = false;
    setTimeout(connect, state.backoff);
    state.backoff = Math.min(state.backoff * 2, MAX_BACKOFF);
  });
}

let inactivityTimer;

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      clearInterval(state.keepAliveTimer);
      terminateAndClose();
    }, INACTIVITY_MS);
  } else {
    clearTimeout(inactivityTimer);
    if (!state.socket || state.socket.readyState === WebSocket.CLOSED) {
      fetchGraphQL(GET_CONTACTS_BY_TAGS, {
        id: GLOBAL_AUTHOR_ID,
        name: GLOBAL_PAGE_TAG,
      }).then((res) => {
        const result = res?.data?.calcContacts;
        if (Array.isArray(result) && result.length > 0) {
          connect();
        } else {
          const el = document.getElementById("forum-root");
          document.getElementById("skeleton-loader")?.remove();
          el.replaceChildren(
            Object.assign(document.createElement("h2"), {
              className: "text-center text-gray-500",
              textContent: "No posts found.",
            })
          );
        }
      });
    } else if (!state.keepAliveTimer) {
      state.keepAliveTimer = setInterval(() => {
        if (state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(JSON.stringify({ type: "KEEP_ALIVE" }));
        }
      }, KEEPALIVE_MS);
    }
  }
});

function startApp() {
  tribute.attach(document.getElementById("post-editor"));
  fetchGraphQL(FETCH_CONTACTS_QUERY).then((res) => {
    const contacts = res.data.calcContacts;
    tribute.collection[0].values = contacts.map((c) => ({
      key: c.Display_Name || "Anonymous",
      value: c.Contact_ID,
      image: c.Profile_Image,
    }));
    const current = contacts.find((c) => c.Contact_ID === GLOBAL_AUTHOR_ID);
    if (current) {
      state.currentUser = {
        display_name: current.Display_Name || "Anonymous",
        profile_image: current.Profile_Image || DEFAULT_AVATAR,
      };
    }
  });

  initPosts();
  initFilePond();
  initNotifications();
  initEmojiHandlers();
  initRichText();

  fetchGraphQL(GET_CONTACTS_BY_TAGS, {
    id: GLOBAL_AUTHOR_ID,
    name: GLOBAL_PAGE_TAG,
  }).then((res) => {
    const result = res?.data?.calcContacts;
    if (Array.isArray(result) && result.length > 0) {
      connect();
    } else {
      const el = document.getElementById("forum-root");
      document.getElementById("skeleton-loader")?.remove();
      el.replaceChildren(
        Object.assign(document.createElement("h2"), {
          className: "text-center text-gray-500",
          textContent: "No posts found.",
        })
      );
    }
  });

  const trigger = document.getElementById("create-post-trigger");
  const modal = document.getElementById("create-post-modal");
  const closeBtn = document.getElementById("close-post-modal");

  if (trigger && modal) {
    trigger.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.classList.add("show");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("show");
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeBtn?.click();
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const loginModal = document.getElementById("login-modal");
  const loginBtn = document.getElementById("login-button");
  const closeLoginBtn = document.getElementById("close-login-modal");
  const loginInput = document.getElementById("login-user-id");
  let initialized = false;

  function init(id) {
    if (!initialized && id) {
      setGlobalAuthorId(id);
      loginModal?.classList.add("hidden");
      startApp();
      initialized = true;
    }
  }

  loginBtn?.addEventListener("click", () => {
    const id = parseInt(loginInput?.value, 10);
    init(isNaN(id) ? undefined : id);
  });

  closeLoginBtn?.addEventListener("click", () => {
    loginModal?.classList.add("hidden");
  });
});

window.addEventListener(
  "touchstart",
  () => {
    resumeAudioContext();
  },
  { once: true }
);
