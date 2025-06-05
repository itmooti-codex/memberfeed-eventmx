import { safeArray, timeAgo, parseDate } from '../utils/formatter.js';
import { GLOBAL_AUTHOR_ID, DEFAULT_AVATAR, state } from '../config.js';

$.views.helpers({
  processContent: function (rawHtml) {
    const isOnlyUrl = rawHtml.trim().match(/^(https?:\/\/[^\s]+)$/);
    const link = isOnlyUrl ? rawHtml.trim() : null;

    const yt = link && /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(link);
    const vi = link && /vimeo\.com\/(\d+)/.exec(link);
    const loom = link && /loom\.com\/share\/([a-zA-Z0-9]+)/.exec(link);

    if (yt) {
      return `<iframe class="!w-full" width="560" height="315" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
    } else if (vi) {
      return `<iframe class="!w-full" width="560" height="315" src="https://player.vimeo.com/video/${vi[1]}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
    } else if (loom) {
      return `<iframe class="!w-full"  width="560" height="315" src="https://www.loom.com/embed/${loom[1]}" frameborder="0" allowfullscreen></iframe>`;
    }

    const container = document.createElement("div");
    container.innerHTML = rawHtml;

    container.querySelectorAll("a").forEach(a => {
      const href = a.href;

      const ytMatch = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(href);
      const viMatch = /vimeo\.com\/(\d+)/.exec(href);
      const loomMatch = /loom\.com\/share\/([a-zA-Z0-9]+)/.exec(href);

      let iframeHTML = null;

      if (ytMatch) {
        iframeHTML = `<iframe class="!w-full" width="315" height="315" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
      } else if (viMatch) {
        iframeHTML = `<iframe class="!w-full" width="315" height="315" src="https://player.vimeo.com/video/${viMatch[1]}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
      } else if (loomMatch) {
        iframeHTML = `<iframe class="!w-full" width="315" height="315" src="https://www.loom.com/embed/${loomMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
      }

      if (iframeHTML) {
        a.classList.add("video-link");
        a.setAttribute("target", "_blank");

        const tooltipWrapper = document.createElement("span");
        tooltipWrapper.classList.add("video-tooltip-wrapper");

        const tooltip = document.createElement("span");
        tooltip.classList.add("video-tooltip");
        tooltip.innerHTML = iframeHTML;

        a.parentNode.insertBefore(tooltipWrapper, a);
        tooltipWrapper.appendChild(a);
        tooltipWrapper.appendChild(tooltip);
      } else {
        a.setAttribute("target", "_blank");
        a.style.color = "red";
        a.style.textDecoration = "underline";
      }
    });

    return container.innerHTML;
  }
});

export function buildTree(existingPosts, rawPosts, rawComments) {
  const byUid = new Map();

  const collapsedMap = new Map();
  (function gather(arr) {
    for (const item of arr) {
      collapsedMap.set(item.uid, item.isCollapsed);
      gather(item.children || []);
    }
  })(existingPosts);

  function cloneState(uid) {
    if (state.collapsedState.hasOwnProperty(uid)) {
      return { isCollapsed: state.collapsedState[uid] };
    }
    state.collapsedState[uid] = true;
    return { isCollapsed: true };
  }

  const posts = rawPosts.map((raw) => {
    const node = mapItem(raw, 0);
    Object.assign(node, cloneState(node.uid));
    state.collapsedState[node.uid] = node.isCollapsed;
    byUid.set(node.id, node);
    return node;
  });

  const comments = rawComments.map((raw) => {
    const node = mapItem(raw, 1);
    Object.assign(node, cloneState(node.uid));
    state.collapsedState[node.uid] = node.isCollapsed;
    byUid.set(node.id, node);
    return node;
  });

  comments.forEach((node) => {
    const parentId = node.reply_to_comment_id || node.forumPostId;
    const parent = byUid.get(parentId);
    if (parent) {
      node.depth = parent.depth + 1;
      parent.children.push(node);
    }
  });

  return posts;
}

export function mapItem(raw, depth = 0) {
  const createdAt = parseDate(raw.post_published_date || raw.created_at);

  // find any upvote record by this user
  const postUpvotes = safeArray(raw.Member_Post_Upvotes_Data);
  const commentUpvotes = safeArray(raw.Member_Comment_Upvotes_Data);
  const userUpvote =
    depth === 0
      ? postUpvotes.find((u) => u.member_post_upvote_id === GLOBAL_AUTHOR_ID)
      : commentUpvotes.find(
          (u) => u.member_comment_upvote_id === GLOBAL_AUTHOR_ID
        );

  // make sure Contacts_Data is always an array
  const contacts = safeArray(raw.Contacts_Data);
  const hasBookmarked =
    depth === 0 && contacts.some((c) => c.contact_id === GLOBAL_AUTHOR_ID);
  const bookmarkRecordId =
    depth === 0
      ? contacts.find((c) => c.contact_id === GLOBAL_AUTHOR_ID)?.id || null
      : null;

  return {
    id: raw.id,
    uid: raw.unique_id,
    authorId: raw.author_id,
    canDelete: raw.author_id === GLOBAL_AUTHOR_ID,
    depth,
    authorName: raw.Author?.display_name || "Anonymous",
    authorImage: raw.Author?.profile_image || DEFAULT_AVATAR,
    createdAt,
    timeAgo: createdAt ? timeAgo(createdAt) : "",
    content: raw.post_copy ?? raw.comment ?? "",
    upvotes: postUpvotes.length + commentUpvotes.length,
    hasUpvoted: Boolean(userUpvote),
    voteRecordId: userUpvote?.id || null,
    hasBookmarked,
    bookmarkRecordId,
    children: [],
    isCollapsed: true,
    forumPostId: depth === 0 ? raw.id : raw.forum_post_id,
    reply_to_comment_id: raw.reply_to_comment_id || null,
    isFeatured: raw.featured_post === true,
    fileType: raw.file_type || "None",
    fileContent:
      typeof raw.file_content === "string"
        ? raw.file_content
        : raw.file_content?.link || "",
    fileContentName:
      typeof raw.file_content === "string"
        ? raw.file_content
        : raw.file_content?.name || "",

    fileContentComment:
      typeof raw.file === "string" ? raw.file : raw.file?.link || null,
    fileContentCommentName:
      typeof raw.file === "string" ? raw.file : raw.file?.name || "",
  };
}

export function findNode(arr, uid) {
  for (const x of arr) {
    if (x.uid === uid) return x;
    const found = findNode(x.children, uid);
    if (found) return found;
  }
  return null;
}

export const tmpl = $.templates("#tmpl-item");
