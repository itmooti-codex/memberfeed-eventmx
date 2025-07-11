
window.APP_CONFIG = {};

import credentials from "./credentials.js";
export const env =
  credentials ||
  (typeof import.meta !== "undefined" && import.meta.env) ||
  (typeof process !== "undefined" && process.env) ||
  {};
export const cfg = (typeof window !== "undefined" && window.APP_CONFIG) || {};

export const API_KEY = cfg.API_KEY || env.API_KEY || "";
export const awsParam = cfg.PARAM || env.PARAM || "";
export const awsParamUrl = cfg.PARAM_URL || env.PARAM_URL || "";
export const HTTP_ENDPOINT =
  cfg.HTTP_ENDPOINT ||
  env.HTTP_ENDPOINT ||
  "";
export const WS_ENDPOINT =
  cfg.WS_ENDPOINT ||
  env.WS_ENDPOINT ||
  "";

if (typeof window !== "undefined") {
  window.awsParam = awsParam;
  window.awsParamUrl = awsParamUrl;
}
export const PROTOCOL = "vitalstats";
export const SUB_ID = "feed-subscription";
export const NOTIF_SUB_ID = "notification-subscription";
export const KEEPALIVE_MS = 80000;
export const MAX_BACKOFF = 30000;
export const INACTIVITY_MS = 10 * 60 * 1000; 
export let GLOBAL_AUTHOR_ID = '';
export let GLOBAL_AUTHOR_DISPLAY_NAME = "Anonymous";
//export let ACCOUNT_NAME = cfg.ACCOUNT_NAME || env.ACCOUNT_NAME || "Eventmx";
export function setGlobals(authorId, pageTag, displayName, accountName = ACCOUNT_NAME) {
  GLOBAL_AUTHOR_ID = Number(authorId);
  if (typeof window !== "undefined") {
    window.GLOBAL_PAGE_TAG = pageTag;
  }
  GLOBAL_AUTHOR_DISPLAY_NAME = displayName;
  ACCOUNT_NAME = accountName;
}
export const DEFAULT_AVATAR =
  "https://files.ontraport.com/media/b0456fe87439430680b173369cc54cea.php03bzcx?Expires=4895186056&Signature=fw-mkSjms67rj5eIsiDF9QfHb4EAe29jfz~yn3XT0--8jLdK4OGkxWBZR9YHSh26ZAp5EHj~6g5CUUncgjztHHKU9c9ymvZYfSbPO9JGht~ZJnr2Gwmp6vsvIpYvE1pEywTeoigeyClFm1dHrS7VakQk9uYac4Sw0suU4MpRGYQPFB6w3HUw-eO5TvaOLabtuSlgdyGRie6Ve0R7kzU76uXDvlhhWGMZ7alNCTdS7txSgUOT8oL9pJP832UsasK4~M~Na0ku1oY-8a7GcvvVv6j7yE0V0COB9OP0FbC8z7eSdZ8r7avFK~f9Wl0SEfS6MkPQR2YwWjr55bbJJhZnZA__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA";
export const state = {
  socket: null,
  notificationSocket: null,
  notifIsConnecting: false,
  notifKeepAliveTimer: null,
  notifBackoff :1000,
  allContacts: [],
  backoff: 1000,
  keepAliveTimer: null,
  rawItems: [],
  postsStore: [],
  notificationStore: [],
  collapsedState: {},
  currentFilter: "Recent",
  currentFileFilter: "All",
  currentSort: "Latest",
  currentSearchTerm: "",
  debounceTimer: null,
  currentUser: null,
  initialPostsLoaded: false,
  initialDomRendered: false,
  isConnecting: false,
  ignoreNextSocketUpdate: false,
  ignoreNextModalUpdate: false,
  userRole: "subscriber"
};
export const notificationStore = {
  preferences: null
};


export const searchInput = document.getElementById("searchPost");
export const clearIcon = document.querySelector(".clearIcon");
export const searchIcon = document.querySelector(".searchIcon");
// Combined list of contact IDs used when selecting a user from the modal.

export const userContactIds = [feedUserContactId];
