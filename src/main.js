import * as cfg from './config.js';
const {
  PROTOCOL,
  WS_ENDPOINT,
  SUB_ID,
  KEEPALIVE_MS,
  MAX_BACKOFF
} = cfg;
import { GQL_QUERY, FETCH_CONTACTS_QUERY } from './api/queries.js';
import { mergeWithExisting } from './ui/render.js';
import { applyFilterAndRender } from './events/forumEvents.js';
import { fetchGraphQL } from './api/fetch.js';
import { tribute } from './utils/tribute.js';
import { initFilePond, resumeAudioContext } from './utils/filePond.js';
import { initNotifications } from './events/notificationEvents.js';
import './events/uploadHandlers.js';

export function connect() {
  cfg.socket = new WebSocket(WS_ENDPOINT, PROTOCOL);
  cfg.socket.addEventListener("open", () => {
    cfg.backoff = 1000;
    cfg.socket.send(JSON.stringify({ type: "CONNECTION_INIT" }));
    cfg.keepAliveTimer = setInterval(() => {
      cfg.socket.send(JSON.stringify({ type: "KEEP_ALIVE" }));
    }, KEEPALIVE_MS);
  });
  cfg.socket.addEventListener("message", ({ data }) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      console.error("Invalid JSON", data);
      return;
    }
    if (msg.type === "CONNECTION_ACK") {
      cfg.socket.send(
        JSON.stringify({
          id: SUB_ID,
          type: "GQL_START",
          payload: { query: GQL_QUERY },
        })
      );
    } else if (
      msg.type === "GQL_DATA" &&
      msg.id === SUB_ID &&
      msg.payload?.data
    ) {
      const raws = msg.payload.data.subscribeToForumPosts ?? [];
      // Merge new data with existing posts to preserve UI state
      cfg.postsStore = mergeWithExisting(cfg.postsStore, raws);
      applyFilterAndRender();
      // iniitilize plyr js 
      requestAnimationFrame(() => {
        Plyr.setup('.js-player');
      });
    } else if (msg.type === "GQL_ERROR") {
      console.error("Subscription error", msg.payload);
    } else if (msg.type === "GQL_COMPLETE") {
      console.warn("Subscription complete");
    }
  });
  cfg.socket.addEventListener("error", (e) => console.error("WebSocket error", e));
  cfg.socket.addEventListener("close", () => {
    clearInterval(cfg.keepAliveTimer);
    setTimeout(connect, cfg.backoff);
    cfg.backoff = Math.min(cfg.backoff * 2, MAX_BACKOFF);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  tribute.attach(document.getElementById('post-editor'));
  fetchGraphQL(FETCH_CONTACTS_QUERY).then((res) => {
    const contacts = res.data.calcContacts;
    tribute.collection[0].values = contacts.map((c) => ({
      key: c.Display_Name || 'Anonymous',
      value: c.Contact_ID,
      image: c.Profile_Image,
    }));
  });
  initFilePond();
  connect();
  initNotifications();
});

window.addEventListener('touchstart', () => {
  resumeAudioContext();
}, { once: true });
