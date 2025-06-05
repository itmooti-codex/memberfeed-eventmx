import { fetchGraphQL } from '../../api/fetch.js';
import {
  CREATE_POST_MUTATION,
  CREATE_COMMENT_MUTATION,
  DELETE_FORUM_POST_MUTATION,
  DELETE_FORUM_COMMENT_MUTATION,
  CREATE_POST_VOTE_MUTATION,
  DELETE_POST_VOTE_MUTATION,
  CREATE_COMMENT_VOTE_MUTATION,
  DELETE_COMMENT_VOTE_MUTATION,
  CREATE_POST_BOOKMARK_MUTATION,
  DELETE_POST_BOOKMARK_MUTATION
} from '../../api/queries.js';
import {
  state,
  GLOBAL_AUTHOR_ID,
  DEFAULT_AVATAR,
} from '../../config.js';
import { findNode, tmpl, mapItem } from '../../ui/render.js';
import {
  pendingFile,
  fileTypeCheck,
  setPendingFile,
  setFileTypeCheck,
} from '../uploads/handlers.js';
import { emojiPickerHtml } from '../../ui/emoji.js';
import { moveCursorToEnd } from '../../utils/caret.js';
import { tribute } from '../../utils/tribute.js';
import { initFilePond } from '../../utils/filePond.js';
import { processFileFields } from '../../utils/handleFile.js';
import { applyFilterAndRender } from "./filters.js";
import { showToast } from '../../ui/toast.js';
import { removeRawById, flattenComments, findRawById } from '../../utils/posts.js';
import { safeArray } from '../../utils/formatter.js';
import { setupPlyr } from '../../utils/plyr.js';

const deleteModal = document.getElementById('delete-modal');
const deleteModalTitle = document.getElementById('delete-modal-title');
let pendingDelete = null;
function processContent(rawHtml) {
  const isOnlyUrl = rawHtml.trim().match(/^(https?:\/\/[^\s]+)$/);
  const link = isOnlyUrl ? rawHtml.trim() : null;

  const yt = link && /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(link);
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

  container.querySelectorAll("a").forEach(a => {
    const href = a.href;

    const ytMatch = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(href);
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

  return container.innerHTML;
}

export function initPostHandlers() {
$(document).on("click", ".btn-comment", function (e) {
  e.stopPropagation();
  const uid = $(this).data("uid");
  const container = $(this).closest(".item");
  const existing = container.find(".comment-form");

  if (existing.length) {
    existing.remove();
    return;
  }

  $(".comment-form").remove();
  const node = findNode(state.postsStore, uid);
  const mentionHtml = `<span contenteditable="false" class="mention" data-mention-id="${node.authorId}">@${node.authorName}</span>&nbsp;`;

  const $form = $(`
    <div class="comment-form my-2">
      <div class="toolbar mb-2">
        <button data-cmd="bold"><b>B</b></button>
        <button data-cmd="italic"><i>I</i></button>
        <button data-cmd="underline"><u>U</u></button>
        <button data-cmd="link"><i class="fa-solid fa-link"></i></button>
      </div>
      <div class="editor min-h-[80px] resize-y p-2 rounded" contenteditable="true" data-placeholder="Write a reply...">${mentionHtml}</div>
      <div class="upload-section w-full mt-2 flex flex-col gap-2">
        <div class="flex items-center gap-2">
        ${emojiPickerHtml}
        <button id="recordBtn" class="recordBtn"><i class="fa-solid fa-microphone"></i> Start Recording</button>
        <button class="btn-submit-comment" data-uid="${uid}">Post</button>
        </div>
        <input type="file" id="file-input" class="file-input" style="display: none;"
          accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
        <canvas class="canvasWaveform waveform w-full mt-2" id="waveform" width="450" height="100"></canvas>
      </div>
    </div>
  `);
  container.append($form);
  const inserted = container.find(".comment-form");
  if (inserted.length) {
    const editorEl = inserted.find(".editor")[0];
    if (editorEl) {
      tribute.attach(editorEl);
    }
    container.find(".children").addClass("visible");
    initFilePond();
    // scroll to the newly inserted textarea so it's in view
    requestAnimationFrame(() => {
      inserted[0].scrollIntoView({ behavior: "smooth", block: "center" });
      if (editorEl) {
        moveCursorToEnd(editorEl);
      }
    });
  }
});

$(document).on("click", function (e) {
  if (!$(e.target).closest(".comment-form, #post-creation-form").length) {
    $("#upload-menu").hide();
  }
});

$(document).on("click", ".ribbon", function () {
  const uid = $(this).data("uid");
  let node = findNode(state.postsStore, uid);
  if (node) {
    node.isCollapsed = !node.isCollapsed;
    state.collapsedState[node.uid] = node.isCollapsed;
    applyFilterAndRender();
  }
});

$(document).on("click", ".btn-delete", function () {
  const uid = $(this).data("uid");
  pendingDelete = { uid };
  const node = findNode(state.postsStore, uid);
  const label = node.depth === 0 ? "post" : node.depth === 1 ? "comment" : "reply";
  deleteModalTitle.textContent = `Do you want to delete this ${label}?`;
  deleteModal.classList.remove("hidden");
});

$(document).on("click", "#delete-cancel", function () {
  deleteModal.classList.add("hidden");
  pendingDelete = null;
});

$(document).on("click", "#delete-confirm", function () {
  if (!pendingDelete) return;
  const uid = pendingDelete.uid;
  deleteModal.classList.add("hidden");
  const $item = $(`[data-uid="${uid}"]`).closest(".item");
  $item.addClass("state-disabled");

  let node;
  (function find(arr) {
    for (const x of arr) {
      if (x.uid === uid) {
        node = x;
        return;
      }
      find(x.children);
      if (node) return;
    }
  })(state.postsStore);

  const mutation =
    node.depth === 0
      ? DELETE_FORUM_POST_MUTATION
      : DELETE_FORUM_COMMENT_MUTATION;
  const variables = { id: node.id };

  fetchGraphQL(mutation, variables)
    .then(() => {
      removeNode(state.postsStore, uid);
      removeRawById(state.rawPosts, node.id);
      state.rawComments = flattenComments(state.rawPosts);
      $(`[data-uid="${uid}"]`).closest('.item').remove();
      showToast("Deleted");
      state.ignoreNextSocketUpdate = true;
    })
    .catch((err) => {
      console.error("Delete failed", err);
      $item.removeClass("state-disabled");
      showToast("Delete failed");
    })
    .finally(() => {
      pendingDelete = null;
    });
});

$(document).on("click", "#submit-post", async function () {
  requestAnimationFrame(setupPlyr);
  const $btn = $(this);
  const formWrapper = document.querySelector(".post-form ");
  const editor = $("#post-editor");
  const htmlContent = editor.html().trim();
  if (!htmlContent && !pendingFile) return;

  $btn.prop("disabled", true);
  $("#upload-options").prop("disabled", true);
  formWrapper.classList.add("state-disabled");

  const payload = {
    author_id: GLOBAL_AUTHOR_ID,
    post_copy: processContent(htmlContent),
    post_status: "Published - Not flagged",
    post_published_date: Date.now(),
    Mentioned_Users_Data: [],
  };

  editor.find("span.mention").each(function () {
    payload.Mentioned_Users_Data.push({
      mentioned_user_id: $(this).data("mention-id"),
    });
  });

  let finalPayload = { ...payload };

  if (pendingFile) {
    const fileFields = [{ fieldName: "file_content", file: pendingFile }];
    const toSubmitFields = {};
    await processFileFields(toSubmitFields, fileFields, awsParam, awsParamUrl);
    let fileData =
      typeof toSubmitFields.file_content === "string"
        ? JSON.parse(toSubmitFields.file_content)
        : toSubmitFields.file_content;
    fileData.name = fileData.name || pendingFile.name;
    fileData.size = fileData.size || pendingFile.size;
    fileData.type = fileData.type || pendingFile.type;
    finalPayload.file_content = JSON.stringify(fileData);
    finalPayload.file_type = fileTypeCheck;
  }

  try {
    const res = await fetchGraphQL(CREATE_POST_MUTATION, { payload: finalPayload });
    const raw = res.data?.createForumPost;
    if (raw) {
      if (!raw.Author) {
        raw.Author = {
          display_name: state.currentUser?.display_name || 'Anonymous',
          profile_image: state.currentUser?.profile_image || DEFAULT_AVATAR,
        };
      }
      const newNode = mapItem(raw, 0);
      newNode.isCollapsed = false;
      state.postsStore.unshift(newNode);
      raw.ForumComments = [];
      state.rawPosts.unshift(raw);
      state.rawComments = flattenComments(state.rawPosts);
      applyFilterAndRender();
      state.ignoreNextSocketUpdate = true;
      showToast("Post created");
      $("#create-post-modal").addClass("hidden").removeClass("show");
    }
    editor.html("");
    setPendingFile(null);
    setFileTypeCheck("");
    $("#file-input").val("");
  } catch (err) {
    console.error("Post failed", err);
  } finally {
    $btn.prop("disabled", false);
    const filepondCloseButton = document.querySelector(
      ".filepond--action-remove-item"
    );
    if (filepondCloseButton) {
      filepondCloseButton.click();
    }

    $("#upload-options").prop("disabled", false);
    formWrapper.classList.remove("state-disabled");
  }
});

$(document).on("click", ".btn-submit-comment", async function () {
  const $btn = $(this);
  const $form = $btn.closest(".comment-form");
  const editor = $form.find(".editor");
  const htmlContent = editor.html().trim();
  if (!htmlContent && !pendingFile) return;

  $btn.prop("disabled", true);
  $form.addClass("state-disabled");
  const uid = $btn.data("uid");
  const node = findNode(state.postsStore, uid);

  const payload = {
    forum_post_id: node.depth === 0 ? node.id : null,
    reply_to_comment_id: node.depth > 0 ? node.id : null,
    author_id: GLOBAL_AUTHOR_ID,
    comment: processContent(htmlContent),
    Comment_or_Reply_Mentions_Data: [],
  };

  editor.find("span.mention").each(function () {
    payload.Comment_or_Reply_Mentions_Data.push({
      comment_or_reply_mention_id: $(this).data("mention-id"),
    });
  });

  let finalPayload = { ...payload };

  if (pendingFile) {
    const fileFields = [{ fieldName: "file", file: pendingFile }];
    const toSubmitFields = {};
    await processFileFields(toSubmitFields, fileFields, awsParam, awsParamUrl);
    let fileData =
      typeof toSubmitFields.file === "string"
        ? JSON.parse(toSubmitFields.file)
        : toSubmitFields.file;
    fileData.name = fileData.name || pendingFile.name;
    fileData.size = fileData.size || pendingFile.size;
    fileData.type = fileData.type || pendingFile.type;
    finalPayload.file = JSON.stringify(fileData);
    // finalPayload.file_type =
    //   fileTypeCheck.charAt(0).toUpperCase() +
    //   fileTypeCheck.slice(1).toLowerCase();
    finalPayload.file_type = fileTypeCheck;
  }

  try {
    const res = await fetchGraphQL(CREATE_COMMENT_MUTATION, { payload: finalPayload });
    const raw = res.data?.createForumComment;
    if (raw) {
      if (!raw.Author) {
        raw.Author = {
          display_name: state.currentUser?.display_name || 'Anonymous',
          profile_image: state.currentUser?.profile_image || DEFAULT_AVATAR,
        };
      }
      const newComment = mapItem(raw, node.depth + 1);
      newComment.isCollapsed = false;
      node.children.push(newComment);
      node.isCollapsed = false;
      const parentRaw = findRawById(state.rawPosts, node.id);
      if (parentRaw) {
        parentRaw.ForumComments = parentRaw.ForumComments || [];
        raw.ForumComments = [];
      parentRaw.ForumComments.push(raw);
      state.rawComments = flattenComments(state.rawPosts);
      }
      applyFilterAndRender();
      state.ignoreNextSocketUpdate = true;
      showToast("Comment posted");
    }
    setPendingFile(null);
    setFileTypeCheck("");
    $form.remove();
    node.isCollapsed = false;
    state.collapsedState[node.uid] = node.isCollapsed;
    $(`[data-uid="${uid}"]`).find(".children").addClass("visible");
  } catch (err) {
    console.error("Comment failed", err);
  } finally {
    $btn.prop("disabled", false);
    $form.remove("state-disabled");
  }
});

function removeNode(arr, uid) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].uid === uid) {
      arr.splice(i, 1);
      return true;
    }
    if (removeNode(arr[i].children, uid)) return true;
  }
  return false;
}

// HANDLE LIKE / UNLIKE
$(document).on("click", ".btn-like", async function () {
  const uid = $(this).data("uid");
  const node = findNode(state.postsStore, uid);
  const isPost = node.depth === 0;
  $(this).addClass("state-disabled");
  let toastMsg = "";

  try {
    if (node.hasUpvoted) {
      await fetchGraphQL(
        isPost ? DELETE_POST_VOTE_MUTATION : DELETE_COMMENT_VOTE_MUTATION,
        { id: node.voteRecordId }
      );
      const rawItem = findRawById(state.rawPosts, node.id);
      if (rawItem) {
        const key = isPost
          ? 'Member_Post_Upvotes_Data'
          : 'Member_Comment_Upvotes_Data';
        rawItem[key] = safeArray(rawItem[key]).filter(
          (u) => u.id !== node.voteRecordId
        );
      }
      node.upvotes--;
      node.hasUpvoted = false;
      node.voteRecordId = null;
      toastMsg = "Vote removed";
    } else {
      const payload = isPost
        ? { post_upvote_id: node.id, member_post_upvote_id: GLOBAL_AUTHOR_ID }
        : {
            forum_comment_upvote_id: node.id,
            member_comment_upvote_id: GLOBAL_AUTHOR_ID,
          };
      const mutation = isPost
        ? CREATE_POST_VOTE_MUTATION
        : CREATE_COMMENT_VOTE_MUTATION;
      const res = await fetchGraphQL(mutation, { payload });
      const newId =
        res.data.createMemberPostUpvotesPostUpvotes?.id ||
        res.data.createMemberCommentUpvotesForumCommentUpvotes?.id;
      const rawItem = findRawById(state.rawPosts, node.id);
      if (rawItem) {
        const key = isPost
          ? 'Member_Post_Upvotes_Data'
          : 'Member_Comment_Upvotes_Data';
        rawItem[key] = [
          ...safeArray(rawItem[key]),
          isPost
            ? {
                id: newId,
                post_upvote_id: node.id,
                member_post_upvote_id: GLOBAL_AUTHOR_ID,
              }
            : {
                id: newId,
                forum_comment_upvote_id: node.id,
                member_comment_upvote_id: GLOBAL_AUTHOR_ID,
              },
        ];
      }
      node.upvotes++;
      node.hasUpvoted = true;
      node.voteRecordId = newId;
      toastMsg = "Voted";
    }
  } catch (err) {
    console.log("error is", err);
  } finally {
    $(this).removeClass("state-disabled");
  }
  const $item = $(`[data-uid="${uid}"]`);
  $item.find('.btn-like span').text(node.upvotes);
  $item.find('.btn-like').toggleClass('liked', node.hasUpvoted);
  if (toastMsg) showToast(toastMsg);
});

// HANDLE BOOKMARK / UNBOOKMARK (posts only)
$(document).on("click", ".btn-bookmark", async function () {
  const uid = $(this).data("uid");
  const node = findNode(state.postsStore, uid);
  $(this).addClass("state-disabled");
  let toastMsg = "";

  try {
    if (node.hasBookmarked) {
      await fetchGraphQL(DELETE_POST_BOOKMARK_MUTATION, {
        id: node.bookmarkRecordId,
      });
      const rawItem = findRawById(state.rawPosts, node.id);
      if (rawItem) {
        rawItem.Contacts_Data = safeArray(rawItem.Contacts_Data).filter(
          (c) => c.id !== node.bookmarkRecordId
        );
      }
      node.hasBookmarked = false;
      node.bookmarkRecordId = null;
      toastMsg = "Bookmark removed";
    } else {
      const payload = { contact_id: GLOBAL_AUTHOR_ID, saved_post_id: node.id };
      const res = await fetchGraphQL(CREATE_POST_BOOKMARK_MUTATION, {
        payload,
      });
      const rawItem = findRawById(state.rawPosts, node.id);
      if (rawItem) {
        rawItem.Contacts_Data = [
          ...safeArray(rawItem.Contacts_Data),
          {
            id: res.data.createOSavedPostContact.id,
            saved_post_id: node.id,
            contact_id: GLOBAL_AUTHOR_ID,
          },
        ];
      }
      node.hasBookmarked = true;
      node.bookmarkRecordId = res.data.createOSavedPostContact.id;
      toastMsg = "Bookmarked";
    }
  } catch (err) {
    console.log("error is", err);
  } finally {
    $(this).removeClass("state-disabled");
  }
  const $item = $(`[data-uid="${uid}"]`);
  $item.find('.btn-bookmark').toggleClass('bookmarked', node.hasBookmarked);
  if (toastMsg) showToast(toastMsg);
});
}
