import { fetchGraphQL } from "../../api/fetch.js";
import { CREATE_FORUM_POST_MUTATION } from "../../api/queries.js";
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
import { ensureCurrentUser } from "./user.js";
import { processContent } from "./content.js";
import { sendNotificationsAfterPost } from "./notifications.js";

export async function createForumToSubmit(
  depthOfForum,
  forumType,
  formElementId,
  uidParam,
) {
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
    alert("Please enter some content or upload a file.");
    return null;
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


