import { fetchGraphQL } from "../../api/fetch.js";
import {
  CREATE_FORUM_POST_MUTATION,
  FETCH_CONTACTS_QUERY,
  CREATE_NOTIFICATION,
} from "../../api/queries.js";
import {
  state,
  GLOBAL_PAGE_TAG,
  GLOBAL_AUTHOR_ID,
  GLOBAL_AUTHOR_DISPLAY_NAME,
  DEFAULT_AVATAR,
} from "../../config.js";
import { findNode, buildTree, mapItem } from "../../ui/render.js";
import {
  pendingFile,
  fileTypeCheck,
  setPendingFile,
  setFileTypeCheck,
} from "../uploads/handlers.js";
import { processFileFields } from "../../utils/handleFile.js";
import { applyFilterAndRender } from "./filters.js";
import { showToast } from "../../ui/toast.js";
import { updateCurrentUserUI } from "../../ui/user.js";

async function ensureCurrentUser() {
  if (state.currentUser) {
    updateCurrentUserUI(state);
    return;
  }
  try {
    const res = await fetchGraphQL(FETCH_CONTACTS_QUERY);
    const contacts = res?.data?.calcContacts || [];
    const current = contacts.find((c) => c.Contact_ID === GLOBAL_AUTHOR_ID);
    if (current) {
      state.currentUser = {
        display_name: current.Display_Name || "Anonymous",
        profile_image: current.Profile_Image || DEFAULT_AVATAR,
      };
      updateCurrentUserUI(state);
    }
  } catch (err) {
    console.error("Failed to fetch current user", err);
  }
}
function processContent(rawHtml) {
  const allowedTags = [
    'b',
    'i',
    'u',
    'a',
    'br',
    'p',
    'span',
    'div',
    'ul',
    'ol',
    'li',
    'strong',
    'em'
  ];
  const allowedAttrs = [
    'href',
    'target',
    'class',
    'style',
    'data-mention-id'
  ];
  rawHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs
  });

  const isOnlyUrl = rawHtml.trim().match(/^(https?:\/\/[^\s]+)$/);
  const link = isOnlyUrl ? rawHtml.trim() : null;

  const yt =
    link &&
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(link);
  const vi = link && /vimeo\.com\/(\d+)/.exec(link);
  const loom = link && /loom\.com\/share\/([a-zA-Z0-9]+)/.exec(link);

  if (yt) {
    return `
    <a class="block mb-2" href="https://www.youtube.com/watch?v=${yt[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.youtube.com/watch?v=${yt[1]}</a>
    <iframe class="!w-full" width="560" height="315" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
  } else if (vi) {
    return `
    <a class="block mb-2" href="https://player.vimeo.com/video/${vi[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://player.vimeo.com/video/${vi[1]}</a>
    <iframe class="!w-full" width="560" height="315" src="https://player.vimeo.com/video/${vi[1]}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
  } else if (loom) {
    return `
    <a class="block mb-2" href="https://www.loom.com/share/${loom[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.loom.com/share/${loom[1]}</a>
    <iframe class="!w-full" width="560" height="315" src="https://www.loom.com/embed/${loom[1]}" frameborder="0" allowfullscreen></iframe>`;
  } else if (link) {
    return `<a class="block mb-2" href="${link}" target="_blank" style="color: blue; text-decoration: underline;">${link}</a>`;
  }

  const container = document.createElement("div");
  container.innerHTML = rawHtml;

  container.querySelectorAll("a").forEach((a) => {
    const href = a.href;

    const ytMatch =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(href);
    const viMatch = /vimeo\.com\/(\d+)/.exec(href);
    const loomMatch = /loom\.com\/share\/([a-zA-Z0-9]+)/.exec(href);

    let iframeHTML = null;

    if (ytMatch) {
      iframeHTML = `
      <a class="block mb-2" href="https://www.youtube.com/watch?v=${ytMatch[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.youtube.com/watch?v=${ytMatch[1]}</a>
      <iframe class="!w-full" width="300" height="315" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
    } else if (viMatch) {
      iframeHTML = `
      <a class="block mb-2" href="https://player.vimeo.com/video/${viMatch[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://player.vimeo.com/video/${viMatch[1]}</a>
      <iframe class="!w-full" width="300" height="315" src="https://player.vimeo.com/video/${viMatch[1]}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
    } else if (loomMatch) {
      iframeHTML = `
      <a class="block mb-2" href="https://www.loom.com/share/${loomMatch[1]}" target="_blank" style="color: blue; text-decoration: underline;">https://www.loom.com/share/${loomMatch[1]}</a>
      <iframe class="!w-full" width="300" height="315" src="https://www.loom.com/embed/${loomMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
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
      a.style.color = "blue";
      a.style.textDecoration = "underline";
    }
  });

  return DOMPurify.sanitize(container.innerHTML, {
    ALLOWED_TAGS: [...allowedTags, 'iframe'],
    ALLOWED_ATTR: [
      ...allowedAttrs,
      'width',
      'height',
      'allow',
      'allowfullscreen',
      'frameborder'
    ]
  });
}

async function sendNotificationsAfterPost(forumData) {
  if (!forumData || !forumData.id || !Array.isArray(state.allContacts)) return;
  const {
    id,
    parent_forum_id,
    forum_type,
    copy,
    Author,
    Parent_Forum,
  } = forumData;

  const type = forum_type || "Post";
  const isPost = type === "Post";
  const mentionedIds = Array.from(copy.matchAll(/data-mention-id=['"](\d+)['"]/g)).map(m => Number(m[1]));
  const postAuthorName = Author?.display_name || "Someone";
  const parentForumAuthorId = Parent_Forum?.author_id || null;

  const payload = state.allContacts.map(contactId => {
    const isMentioned = mentionedIds.includes(contactId);
    const isParentOwner = contactId === parentForumAuthorId;
    const isSelfMention = isMentioned && isParentOwner;

    let title = `${postAuthorName} created a ${type.toLowerCase()}.`;
    let notification_type = type;

    if (isMentioned) {
      if (isPost) {
        title = `${postAuthorName} mentioned you in a post.`;
      } else if (isSelfMention) {
        title = `${postAuthorName} mentioned you in a ${type.toLowerCase()} in your post.`;
      } else if (isParentOwner) {
        title = `${postAuthorName} mentioned you in a ${type.toLowerCase()} in your comment.`;
      } else {
        title = `${postAuthorName} mentioned you in a ${type.toLowerCase()}.`;
      }
      notification_type = `${type} Mention`;
    } else if (!isPost && isParentOwner) {
      title = type === "Comment"
        ? `${postAuthorName} commented on your post.`
        : `${postAuthorName} replied to your comment.`;
    }

    return {
      notified_contact_id: contactId,
      parent_forum_id: id,
      ...(isPost ? {} : { parent_forum_if_not_a_post: parent_forum_id }),
      notification_type,
      title,
    };
  });

  try {
    await fetchGraphQL(CREATE_NOTIFICATION, { payload });
    console.log("Notifications sent successfully");
  } catch (err) {
    console.error("Failed to send notifications", err);
  }
}

export async function createForumToSubmit(
  depthOfForum,
  forumType,
  formElementId,
  uidParam,
) {
  console.log("all contacts are", state.allContacts);
  depthOfForum = Number(depthOfForum);
  const computedType =
    depthOfForum === 0 ? "Post" : depthOfForum === 1 ? "Comment" : "Reply";
  forumType = forumType || computedType;

  await ensureCurrentUser();
  const $btn = $(this);
  const formWrapper = document.querySelector(`.${formElementId}`);
  const editor = $(`.${formElementId} .editor`);
  const htmlContent = editor.html().trim();
  if (!htmlContent && !pendingFile) {
    console.warn("No content to submit");
    return;
  }

  $btn.prop("disabled", true);
  $("#upload-options").prop("disabled", true);
  formWrapper.classList.add("state-disabled");
  if (forumType === "Post") {
    document.querySelector(".createPostMainModal").classList.add("state-disabled");
  }

  let parentForumId;
  if (forumType !== "Post" && uidParam) {
    const node = findNode(state.postsStore, uidParam);
    parentForumId = node ? node.id : null;
  }
  let publishedDatePayload = Date.now();
  let forumStatusForPayload = "Published - Not flagged";
  const scheduledDateUnix = document.getElementById('scheduledDateContainer');
  if (forumType === "Post" && scheduledDateUnix) {
    if (scheduledDateUnix.innerText.trim() === '') {
      publishedDatePayload = Date.now();
      forumStatusForPayload = "Published - Not flagged";
    } else {
      publishedDatePayload = scheduledDateUnix.innerText.trim();
      forumStatusForPayload = "Scheduled";
    }
  }

  const payload = {
    author_id: GLOBAL_AUTHOR_ID,
    Author: {
      display_name: GLOBAL_AUTHOR_DISPLAY_NAME,
    },
    copy: processContent(htmlContent),
    published_date: publishedDatePayload,
    depth: depthOfForum,
    Mentioned_Contacts_Data: [],
    forum_type: forumType,
    forum_status: forumStatusForPayload,
  };

  if (forumType === "Post") {
    payload.forum_tag = GLOBAL_PAGE_TAG;
  } else {
    payload.parent_forum_id = parentForumId || null;
    payload.forum_tag = GLOBAL_PAGE_TAG;
  }

  editor.find("span.mention").each(function () {
    payload.Mentioned_Contacts_Data.push({
      mentioned_contact_id: $(this).data("mention-id"),
    });
  });

  let finalPayload = { ...payload };

  if (pendingFile) {
    const fileFields = [{ fieldName: "file_content", file: pendingFile }];
    const toSubmitFields = {};
    await processFileFields(
      toSubmitFields,
      fileFields,
      awsParam,
      awsParamUrl,
    );
    let fileData =
      typeof toSubmitFields.file_content === 'string'
        ? JSON.parse(toSubmitFields.file_content)
        : toSubmitFields.file_content;
    fileData.name = fileData.name || pendingFile.name;
    fileData.size = fileData.size || pendingFile.size;
    fileData.type = fileData.type || pendingFile.type;
    finalPayload.file_content = JSON.stringify(fileData);
    finalPayload.file_type = fileTypeCheck;
  }

  try {
    const res = await fetchGraphQL(CREATE_FORUM_POST_MUTATION, {
      payload: finalPayload,
    });
    const raw = res.data?.createForumPost;
    if (raw && raw.id) {
      console.log("Post created with ID:", raw.id);
      await sendNotificationsAfterPost(raw);
    }
    if (raw) {
      if (!raw.Author) {
        raw.Author = {
          display_name: state.currentUser?.display_name || "Anonymous",
          profile_image: state.currentUser?.profile_image || DEFAULT_AVATAR,
        };
      }
      const nodeDepth = Number(raw.depth ?? depthOfForum);
      let parentDisable = false;
      if (forumType !== "Post" && uidParam) {
        const parentNode = findNode(state.postsStore, uidParam);
        parentDisable = parentNode ? parentNode.commentsDisabled : false;
      }
      const newNode = mapItem(
        raw,
        nodeDepth,
        parentDisable || raw.disable_new_comments === true,
      );
      newNode.isCollapsed = false;

      if (forumType === "Post") {
        state.postsStore.unshift(newNode);
        raw.ForumComments = [];
        state.rawItems.unshift(raw);
      } else {
        const parent = findNode(state.postsStore, uidParam);
        if (parent) {
          parent.children.push(newNode);
          parent.isCollapsed = false;
          state.collapsedState[parent.uid] = false;
        } else {
          state.postsStore.unshift(newNode);
        }
        state.rawItems.push(raw);
      }
      state.postsStore = buildTree(state.postsStore, state.rawItems);
      applyFilterAndRender();
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-uid="${newNode.uid}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      state.ignoreNextSocketUpdate = true;
      showToast(forumType === "Post" ? "Post created" : "Comment added");
      if (forumType === "Post") {
        $("#create-post-modal").addClass("hidden").removeClass("show");
      } else {
        $(`.${formElementId}`).remove();
      }
    }
    if (scheduledDateUnix) scheduledDateUnix.textContent = '';
    editor.html("");
    setPendingFile(null);
    setFileTypeCheck("");
    $("#file-input").val("");
  } catch (err) {
    console.error("Post failed", err);
  } finally {
    $btn.prop("disabled", false);
    const filepondCloseButton = document.querySelector(
      ".filepond--action-remove-item",
    );
    if (filepondCloseButton) {
      filepondCloseButton.click();
    }
    $("#upload-options").prop("disabled", false);
    formWrapper.classList.remove("state-disabled");
    if (forumType === "Post") {
      document.querySelector(".createPostMainModal").classList.remove("state-disabled");
    }
  }
}

window.createForumToSubmit = createForumToSubmit;
export { ensureCurrentUser };
