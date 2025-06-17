import { state } from "../../config.js";
import { findNode } from "../../ui/render.js";
import {  uploadDesign, recorederDesign, toolbarDesign } from "../../ui/emoji.js";
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
    <div class="comment-form mt-2 flex w-full flex-col items-start justify-start gap-2">
  ${toolbarDesign}
  <div class="flex min-h-32 resize-y flex-col items-start justify-center gap-4 self-stretch rounded-xl bg-[var(--grey-300)] px-3 py-2 focus-within:border focus-within:border-[var(--color-primary)]">
    <div contenteditable="true" id="editor" data-placeholder="Write a reply..." class="p2 editor flex-1 resize-y justify-start self-stretch outline-none">${mentionHtml}</div>
  </div>
  <div class="upload-section mt-2 flex w-full flex-col gap-2">
    <div class="flex items-center gap-2" id="dropArea">${uploadDesign} ${recorederDesign}</div>
    <input type="file" id="file-input" class="file-input" style="display: none;" accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
    <canvas class="canvasWaveform waveform mt-2 w-full" id="waveform" width="450" height="100"></canvas>
    <div class="flex items-center gap-2">
      <div class="ml-auto flex cursor-pointer items-center justify-end gap-3" id="submitForumPost" onclick="createForumToSubmit('${nextDepth}','${nextType}','comment-form','${uid}');">
        <div class="group flex items-center justify-start gap-2 rounded bg-[var(--grey-100)] px-3 py-2 transition-all hover:bg-[var(--color-primary)]">
          <div class="p3 justify-start text-center text-white">Post</div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="group-hover:fill-white" d="M10.4282 5.99409C10.4285 6.12138 10.3948 6.24645 10.3306 6.35635C10.2664 6.46625 10.174 6.557 10.0629 6.61922L2.56502 10.9062C2.45742 10.9672 2.33595 10.9995 2.21227 11C2.09832 10.9994 1.98616 10.9715 1.88517 10.9187C1.78417 10.8659 1.69727 10.7898 1.63172 10.6965C1.56617 10.6033 1.52386 10.4958 1.50834 10.3829C1.49282 10.27 1.50453 10.155 1.54249 10.0476L2.74809 6.47767C2.75987 6.44277 2.78216 6.41236 2.8119 6.39062C2.84163 6.36888 2.87736 6.35686 2.9142 6.35622H6.14162C6.19059 6.35633 6.23906 6.34636 6.28402 6.32695C6.32898 6.30754 6.36946 6.27909 6.40296 6.24337C6.43646 6.20765 6.46226 6.16543 6.47875 6.11932C6.49525 6.07321 6.50208 6.0242 6.49884 5.97534C6.49074 5.88348 6.44824 5.79808 6.37985 5.73623C6.31145 5.67438 6.22222 5.64065 6.13002 5.64179H2.91509C2.87772 5.64179 2.84129 5.63008 2.81094 5.60829C2.78058 5.5865 2.75782 5.55574 2.74586 5.52034L1.54026 1.95088C1.49228 1.81406 1.48705 1.66588 1.52529 1.52603C1.56352 1.38617 1.6434 1.26126 1.75432 1.16789C1.86524 1.07451 2.00194 1.01709 2.14626 1.00326C2.29059 0.989426 2.43571 1.01983 2.56234 1.09044L10.0638 5.37209C10.1743 5.43416 10.2662 5.52447 10.3302 5.63377C10.3942 5.74307 10.4281 5.86742 10.4282 5.99409Z" fill="white" />
          </svg>
        </div>
      </div>
    </div>
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
