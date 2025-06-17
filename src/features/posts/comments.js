import { state } from "../../config.js";
import { findNode } from "../../ui/render.js";
import { emojiPickerHtml,uploadDesign,recorederDesign } from "../../ui/emoji.js";
import { moveCursorToEnd } from "../../utils/caret.js";
import { tribute } from "../../utils/tribute.js";
import { initFilePond } from "../../utils/filePond.js";
import { applyFilterAndRender } from "./filters.js";

export function initCommentHandlers() {
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

    const nextDepth = Math.min((node.depth || 0) + 1, 2);
    const nextType = nextDepth === 1 ? "Comment" : "Reply";

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
        <div class="flex items-center gap-2" id="dropArea">
        ${emojiPickerHtml}
        
        <button onclick="createForumToSubmit('${nextDepth}','${nextType}','comment-form','${uid}');">Post</button>
        </div>
        <div class= "flex items-center gap-2">
        ${uploadDesign}
        ${recorederDesign}
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
    const node = findNode(state.postsStore, uid);
    if (node) {
      node.isCollapsed = !node.isCollapsed;
      state.collapsedState[node.uid] = node.isCollapsed;
      applyFilterAndRender();
    }
  });
}
