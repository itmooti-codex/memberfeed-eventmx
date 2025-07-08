import { GET_SINGLE_POST_SUBSCRIPTION } from "../../api/queries.js";
import { buildTree } from "../../ui/render.js";
import { renderItems } from "../../ui/render.js";
import { setupPlyr } from "../../utils/plyr.js";
import { PROTOCOL, WS_ENDPOINT, KEEPALIVE_MS, state } from "../../config.js";
import { mergeLists } from "../../utils/merge.js";

let modalTree = [];
let modalRawItems = [];
let highlightId = null;

function scrollAndHighlight() {
  if (!highlightId) return;
  const container = document.getElementById("modalFeedRoot");
  const target = container?.querySelector(`[data-id="${highlightId}"]`);
  if (target) {
    target.classList.add("highlighted");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => target.classList.remove("highlighted"), 2000);
  }
  highlightId = null;
}

function expandPathToId(tree, id) {
  function dfs(nodes) {
    for (const node of nodes) {
      if (node.id === id) {
        return [node];
      }
      const path = dfs(node.children);
      if (path) {
        node.isCollapsed = false;
        state.collapsedState[node.uid] = false;
        return [node, ...path];
      }
    }
    return null;
  }
  dfs(tree);
}
function renderModal(openForm = false) {
  const container = document.getElementById("modalFeedRoot");
  if (!container) return;
  const scrollable = container.querySelector(".item");
  const prevScroll = scrollable ? scrollable.scrollTop : 0;
  container.innerHTML = renderItems(modalTree, { inModal: true });
  if (
    modalTree.length &&
    Array.isArray(modalTree[0].children) &&
    modalTree[0].children.length === 0
  ) {
    const html = `
  <div class="flex items-center justify-center p-4 w-full shrink-0">
    <img
      src="https://files.ontraport.com/media/7cb0246253aa468f9f13c0043ee37640.phpkhswnn?Expires=4904960534&Signature=eOqtZ4CkICqtnm5bq9pcsIrr-3U8AlMO0IZtMCBwSo-BtLoc5wyB0tq6Y7WTQXBIR5x18ww5jQIBjv7Av9i404Shh4tSvkRusGsCZibIQ~giPi0W1~uLCyX-DMFoSVQYTp8m53fTO0q0JtjPl9OnqwG8No6NNQBfP9zMP9Jo6Zx8DV4rRihfOz7r6TI0IHs-XLfzSi4Cbhn36xCMrxTmaZ6hQ9B22sUMJ6RiLyzMOPjCJfMDuGEBT10rOt7xYMM2-mIgCWXlv1oI4TzVAXznljefNYUzaOs~dwbH7lhsHQoU3yGaTDAdr6ofMAqTF1BznXZbbUi--8sYRvqQskahMA__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA"
      class="size-full shrink-0 object-contain"
      alt="No posts found"
    >
  </div>
`;

    const commentForm = document.querySelector('.actions');
    if (commentForm) {
      commentForm.insertAdjacentHTML('afterend', html);
    }
  }
  requestAnimationFrame(() => {
    const newScrollable = container.querySelector(".item");
    if (newScrollable) {
      newScrollable.scrollTop = prevScroll;
    }
    setupPlyr();
    scrollAndHighlight();
    if (openForm) {
      const btn = container.querySelector(
        '.item[data-depth="0"] .btn-comment'
      );
      if (btn) {
        $(btn).trigger("click");
      }
    }
  });
}

export function rerenderModal() {
  renderModal(false);
}

export function getModalTree() {
  return modalTree;
}

const MODAL_SKELETON = `
  <div id="modal-skeleton-loader" class="p-4 w-[855px] max-[855px]:w-full">
    <div class="skeleton-item flex gap-4 mb-4">
      <div class="skeleton-avatar"></div>
      <div class="flex-1 flex flex-col gap-2">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line medium"></div>
      </div>
    </div>
  </div>`;
const DELETED_MODAL_HTML = `
  <div class="flex items-start justify-between p-4 w-[855px] max-[855px]:w-full max-[855px]:w-full">
    <div class="font-semibold">
    <img src="https://files.ontraport.com/media/18ded122924c40dda5df5dfd30bd4874.phpju0bt7?Expires=4904280560&Signature=P4Q2t4zBd-FYETAdawPhNOvkAbj3qsmstq7FP5OdK52k72q6WGTEOy4NT9orvOk5nHhkf2DE9Y7ibtCgTbZ4NoezM-uTRcP8vpcfm6oXjeACVaqFwTEhgazYWm3xnF1YFU2ssPnvtmYI7kxGEtxTLPLovzYZMeOtkIm7PYhDHR094-Uc8x-VLyKktEFjjFbZ3zshhTnM50~t5zfjbuRDTJ16wY1YaWotp2DQVPwlzvbuzg6Rs2Vuo02a7rBq8370klWcfE835qHwYDYtxfiTvt8cPwqmeilTLemlBBNR~WYrmX39KTEgh2rxdbpFfZSKsx~1xmz8REkyIF6USwjsYA__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA" />
    </div>
    <div x-on:click="modalForPostOpen = false"
      class="group flex cursor-pointer items-center justify-start gap-2 rounded-[34px] bg-zinc-100 p-2 transition-all hover:bg-[var(--color-primary-shade)]">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18.8535 18.146C18.8999 18.1925 18.9368 18.2476 18.9619 18.3083C18.9871 18.369 19 18.4341 19 18.4997C19 18.5654 18.9871 18.6305 18.9619 18.6912C18.9368 18.7519 18.8999 18.807 18.8535 18.8535C18.807 18.8999 18.7519 18.9368 18.6912 18.9619C18.6305 18.9871 18.5654 19 18.4997 19C18.4341 19 18.369 18.9871 18.3083 18.9619C18.2476 18.9368 18.1925 18.8999 18.146 18.8535L14 14.7068L9.85398 18.8535C9.76017 18.9473 9.63292 19 9.50025 19C9.36758 19 9.24033 18.9473 9.14652 18.8535C9.0527 18.7597 9 18.6324 9 18.4997C9 18.3671 9.0527 18.2398 9.14652 18.146L13.2932 14L9.14652 9.85398C9.0527 9.76017 9 9.63292 9 9.50025C9 9.36758 9.0527 9.24033 9.14652 9.14652C9.24033 9.0527 9.36758 9 9.50025 9C9.63292 9 9.76017 9.0527 9.85398 9.14652L14 13.2932L18.146 9.14652C18.2398 9.0527 18.3671 9 18.4997 9C18.6324 9 18.7597 9.0527 18.8535 9.14652C18.9473 9.24033 19 9.36758 19 9.50025C19 9.63292 18.9473 9.76017 18.8535 9.85398L14.7068 14L18.8535 18.146Z"
          fill="#0E0E0E"></path>
      </svg>
    </div>
  </div>`;

function normalize(node, list) {
  const {
    Author_ID,
    Date_Added,
    Published_Date,
    Disable_New_Comments,
    Featured_Feed,
    File_Content,
    File_Type,
    ID,
    Copy,
    Feed_Status,
    Unique_ID,
    Depth,
    Feed_Type,
    Parent_Feed_ID,
    Author,
    Bookmarking_Contacts_Data,
    Feed_Reactors_Data,
    Feeds,
    file_name,
    file_link,
    file_size,
    image_orientation,
  } = node;
  list.push({
    author_id: Author_ID,
    created_at: Date_Added,
    published_date: Published_Date,
    disable_new_comments: Disable_New_Comments,
    featured_feed: Featured_Feed,
    file_content: File_Content,
    file_type: File_Type,
    file_name,
    file_link,
    file_size,
    image_orientation,
    id: ID,
    copy: Copy,
    feed_status: Feed_Status,
    unique_id: Unique_ID,
    depth: Depth,
    feed_type: Feed_Type,
    parent_feed_id: Parent_Feed_ID,
    Author,
    Bookmarking_Contacts_Data,
    Feed_Reactors_Data,
  });
  if (Array.isArray(Feeds)) {
    Feeds.forEach((child) => normalize(child, list));
  }
}

const POST_MODAL_SUB_ID = "post-modal-subscription";
let modalSocket = null;
let keepAliveTimer = null;

function closeModalSocket() {
  if (modalSocket && modalSocket.readyState === WebSocket.OPEN) {
    modalSocket.send(JSON.stringify({ type: "CONNECTION_TERMINATE" }));
    modalSocket.close();
  }
  clearInterval(keepAliveTimer);
  keepAliveTimer = null;
  modalSocket = null;
  state.ignoreNextModalUpdate = false;
}

export function openPostModalById(postId, author = "", highlight = null, openForm = true) {
  if (!postId) return;

  highlightId = highlight ? Number(highlight) : null;

  modalRawItems = [];
  modalTree = [];

  window.dispatchEvent(new CustomEvent('open-modal'));

  const container = document.getElementById("modalFeedRoot");
  if (container) {
    container.innerHTML = MODAL_SKELETON;
  }

  const titleEl = document.getElementById("defaultModalTitle");
  if (titleEl) {
    titleEl.textContent = author || "";
  }

  closeModalSocket();
  modalSocket = new WebSocket(WS_ENDPOINT, PROTOCOL);

  let firstUpdate = openForm;

  modalSocket.addEventListener("open", () => {
    modalSocket.send(JSON.stringify({ type: "CONNECTION_INIT" }));
    keepAliveTimer = setInterval(() => {
      modalSocket.send(JSON.stringify({ type: "KEEP_ALIVE" }));
    }, KEEPALIVE_MS);
  });

  modalSocket.addEventListener("message", ({ data }) => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch {
      
        return;
      }

      if (msg.type === "CONNECTION_ACK") {
        modalSocket.send(
          JSON.stringify({
            id: POST_MODAL_SUB_ID,
            type: "GQL_START",
            payload: {
              query: GET_SINGLE_POST_SUBSCRIPTION,
              variables: { id: postId },
            },
          })
        );
      } else if (
        msg.type === "GQL_DATA" &&
        msg.id === POST_MODAL_SUB_ID &&
        msg.payload?.data
      ) {
        if (state.ignoreNextModalUpdate) {
          state.ignoreNextModalUpdate = false;
          return;
        }
        const data = msg.payload.data.subscribeToFeed;
        if (!data) {
       
          if (container) {
            container.innerHTML = DELETED_MODAL_HTML;
          }
          return;
        }
        const list = [];
        normalize(data, list);
        modalRawItems = mergeLists(modalRawItems, list);
        modalTree = buildTree(modalTree, modalRawItems);
        if (highlightId) {
          expandPathToId(modalTree, highlightId);
        }
        if (container) {
          renderModal(firstUpdate);
          firstUpdate = false;
        }
      } else if (msg.type === "GQL_ERROR") {
     
      } else if (msg.type === "GQL_COMPLETE") {
        closeModalSocket();
      }
    });

    modalSocket.addEventListener("error", (e) => {
    
      closeModalSocket();
    });

  modalSocket.addEventListener("close", () => {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
    modalSocket = null;
  });
}

export function initPostModalHandlers() {
  $(document).on("click", ".openPostModal", function () {
    const postId = $(this).data("id");
    const author = $(this).data("author");
    openPostModalById(postId, author);
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest('[x-on\\:click="modalForPostOpen = false"]')) {
      window.dispatchEvent(new CustomEvent('close-modal'));
      closeModalSocket();
    }
  });
}
