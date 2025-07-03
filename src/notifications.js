import {
  state,
  PROTOCOL,
  WS_ENDPOINT,
  KEEPALIVE_MS,
  MAX_BACKOFF,
  NOTIF_SUB_ID,
  GLOBAL_AUTHOR_ID
} from "./config.js";
import { GET_NOTIFICATIONS } from "./api/queries.js";
import { fetchGraphQL } from "./api/fetch.js";
import { openPostModalById } from "./features/posts/postModal.js";

const notificationTemplate = $.templates("#notificationTemplate");

function getNotificationContainers() {
  return Array.from(
    document.querySelectorAll(
      "#notificationContainerSocket, #notificationContainerPage"
    )
  );
}

function applyNotificationFilters() {
  const configs = [
    {
      container: document.getElementById("notificationContainerSocket"),
      noNotif: document.getElementById("noNotification"),
      filter: document.getElementById("notificationDropdownFilter"),
    },
    {
      container: document.getElementById("notificationContainerPage"),
      noNotif: document.getElementById("noNotificationPage"),
      filter: document.getElementById("notificationPageFilter"),
    },
  ];

  configs.forEach((cfg) => {
    if (!cfg.container) return;
    const selected = cfg.filter?.__x?.$data?.selected || "all";
    cfg.container
      .querySelectorAll(".read")
      .forEach((el) => el.classList.toggle("hidden", selected === "unread"));

    const unreadEls = cfg.container.querySelectorAll(".unread");
    if (selected === "unread" && unreadEls.length === 0) {
      cfg.noNotif?.classList.remove("hidden");
      cfg.container.classList.add("hidden");
    } else {
      cfg.noNotif?.classList.add("hidden");
      cfg.container.classList.remove("hidden");
    }
  });
}

export function refreshNotificationSubscription() {
  if (
    !state.notificationSocket ||
    state.notificationSocket.readyState !== WebSocket.OPEN
  ) {
    console.log("Notification socket is not open, cannot refresh subscription.");
    return;
  }

  state.notificationSocket.send(
    JSON.stringify({
      id: NOTIF_SUB_ID,
      type: "GQL_STOP"
    })
  );

  const updatedQuery = GET_NOTIFICATIONS();

  state.notificationSocket.send(
    JSON.stringify({
      id: NOTIF_SUB_ID,
      type: "GQL_START",
      payload: {
        query: updatedQuery,
        variables: {
          author_id: GLOBAL_AUTHOR_ID,
          notified_contact_id: GLOBAL_AUTHOR_ID
        }
      }
    })
  );
}

export function connectNotification() {
  if (
    state.notifIsConnecting ||
    (state.notificationSocket &&
      (state.notificationSocket.readyState === WebSocket.OPEN ||
        state.notificationSocket.readyState === WebSocket.CONNECTING))
  ) {
    return;
  }

  state.notifIsConnecting = true;
  state.notificationSocket = new WebSocket(WS_ENDPOINT, PROTOCOL);

  const notifContainers = getNotificationContainers();
  for (const c of notifContainers) {
    c.innerHTML = `
      <div class="flex w-12 mx-auto my-6">
        <div class="relative">
          <div class="w-12 h-12 rounded-full absolute border border-solid border-gray-200"></div>
          <div class="w-12 h-12 rounded-full animate-spin absolute border border-solid border-[var(--color-primary)] border-t-transparent"></div>
        </div>
      </div>`;
  }

  state.notificationSocket.addEventListener("open", () => {
    state.notifBackoff = 1000;
    state.notificationSocket.send(JSON.stringify({ type: "CONNECTION_INIT" }));

    state.notifKeepAliveTimer = setInterval(() => {
      state.notificationSocket.send(JSON.stringify({ type: "KEEP_ALIVE" }));
    }, KEEPALIVE_MS);

    state.notifIsConnecting = false;
  });

  state.notificationSocket.addEventListener("message", ({ data }) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      console.error("Invalid JSON", data);
      return;
    }
    const query = GET_NOTIFICATIONS();
    if (msg.type === "CONNECTION_ACK") {
      state.notificationSocket.send(
        JSON.stringify({
          id: NOTIF_SUB_ID,
          type: "GQL_START",
          payload: {
            query: query,
            variables: { author_id: GLOBAL_AUTHOR_ID, notified_contact_id: GLOBAL_AUTHOR_ID },
          },
        })
      );
    } else if (
      msg.type === "GQL_DATA" &&
      msg.id === NOTIF_SUB_ID &&
      msg.payload?.data
    ) {
      const notifications = msg.payload.data.subscribeToAnnouncements;
      const notifContainers = getNotificationContainers();

      for (const container of notifContainers) {
        container.innerHTML = "";

        if (!notifications || (Array.isArray(notifications) && notifications.length === 0)) {
          container.innerHTML = `<div class="text-gray-500 text-sm p-4">
          <img src="https://files.ontraport.com/media/4f5adef807a84d569b0bf6743a268746.phprrasoq?Expires=4905043225&Signature=NP9brHRE8f0BLfizRjPCy-6e~WXpIeawbrbNE8TqYDku8jiOL3NvAbUuA8THfU7-Rt~YtIOnCaEAoGdJoR-dx5bAnLKVucgpFgIt3mOhNwMi~LBOxB8RRDHgqobq2oBjo73U~qQqIV~u7I8YzGNo~rJlEDPRqWDyYxcAveh-pECCmXingqIY7rF9fa9d8jOfjNPsW~gsT3L7D1bm~1SX-95xpLHSun6ucLw0yu8amQtEu2FAeAlpNXl4OHLZgBG32LN2RWvTlAevuiuPq8Qhi5uSZYBD91tTNNQupK186cRLxqVLMwg6s0v0LVuGia7kW9DYKgiV4S9Py~9dwY6OIA__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA" class="size-1/2 mx-auto shrink-0"/>
          </div>`;
          continue;
        }

        if (Array.isArray(notifications)) {
          notifications.forEach((notif) => {
            if (notif?.Title) {
              const html = notificationTemplate.render(notif);
              container.insertAdjacentHTML("beforeend", html);
            }
          });
        } else if (notifications?.Title) {
          const html = notificationTemplate.render(notifications);
          container.insertAdjacentHTML("beforeend", html);
        }
      }

      applyNotificationFilters();
    } else if (msg.type === "GQL_ERROR") {
      console.error("Notification subscription error", msg.payload);
    } else if (msg.type === "GQL_COMPLETE") {
      if (
        state.notificationSocket &&
        state.notificationSocket.readyState === WebSocket.OPEN
      ) {
        state.notificationSocket.send(JSON.stringify({ type: "CONNECTION_TERMINATE" }));
        state.notificationSocket.close();
      }
    }
  });

  state.notificationSocket.addEventListener("error", (e) => {
    console.error("Notification WebSocket error", e);
    state.notifIsConnecting = false;
  });

  state.notificationSocket.addEventListener("close", () => {
    clearInterval(state.notifKeepAliveTimer);
    state.notifKeepAliveTimer = null;
    state.notificationSocket = null;
    state.notifIsConnecting = false;
    setTimeout(connectNotification, state.notifBackoff);
    state.notifBackoff = Math.min(state.notifBackoff * 2, MAX_BACKOFF);
  });
}

export function initNotificationEvents() {
  document.addEventListener("click", async (e) => {
    const notifEl = e.target.closest(".notification");
    if (notifEl) {
      const forumId = notifEl.getAttribute("data-parentforumid");
      const targetId = notifEl.getAttribute("data-targetid");
      const notifType = notifEl.getAttribute("data-notiftype") || "";
      if (forumId) {
        try {
          const body = document.querySelector("body");
          if (body && body.__x && body.__x.$data) {
            body.__x.$data.showNotifications = false;
          }
        } catch {
          console.error("Failed to hide notifications modal");
        }
        const highlight = /Comment|Reply/.test(notifType) ? targetId : null;
        openPostModalById(forumId, "", highlight, false);
      }
    }

    const markAllTop = e.target.id === "markAllNotificationAsRead";
    const markAllPage = e.target.id === "markAllNotificationAsReadPage";
    const markAll = markAllTop || markAllPage;

    let targetContainers = [];
    if (markAllTop) {
      const c = document.getElementById("notificationContainerSocket");
      if (c) targetContainers.push(c);
    } else if (markAllPage) {
      const c = document.getElementById("notificationContainerPage");
      if (c) targetContainers.push(c);
    }

    let ids = [];

    if (markAll) {
      console.log("Marking all notifications as read");
      const elements = [];
      targetContainers.forEach((c) => {
        elements.push(...c.querySelectorAll("[data-announcement].unread"));
      });
      ids = elements.map((el) => el.getAttribute("data-announcement"));
    } else {
      const unreadElements = document.querySelectorAll(".unread");
      for (const el of unreadElements) {
        if (el.contains(e.target)) {
          const announcementId = el.getAttribute("data-announcement");
          if (!announcementId) return;
          ids = [announcementId];
          break;
        }
      }
    }

    if (!ids.length) return;

    const variables = {
      payload: { is_read: true },
    };

    const UPDATE_ANNOUNCEMENT = `
      mutation updateAnnouncements($payload: AnnouncementUpdateInput = null) {
        updateAnnouncements(query: [{ whereIn: { id: [${ids.join(",")}] } }], payload: $payload) {
          is_read
        }
      }
    `;

    try {
      if (markAllTop) {
        $(".notificationsLoader").removeClass("hidden").addClass("flex");
        $(".topNavAllNotification")?.click();
      } else if (markAllPage){
        $("#allNotificationInPage")?.click();
      }
      await fetchGraphQL(UPDATE_ANNOUNCEMENT, variables, UPDATE_ANNOUNCEMENT);

      if (markAll) {
        targetContainers.forEach((c) => {
          c.querySelectorAll("[data-announcement].unread").forEach((el) => {
            el.classList.remove("unread");
            el.classList.add("read");
          });
        });
      } else {
        document.querySelectorAll(".unread").forEach((el) => {
          if (ids.includes(el.getAttribute("data-announcement"))) {
            el.classList.remove("unread");
            el.classList.add("read");
          }
        });
      }
      applyNotificationFilters();
    } catch (error) {
      console.error("Error marking announcement(s) as read:", error);
    } finally {
      if (markAllTop) {
        $(".notificationsLoader").removeClass("flex").addClass("hidden");
      }
    }
  });
}
