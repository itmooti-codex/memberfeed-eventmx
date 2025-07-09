import { DEFAULT_AVATAR } from "../config.js";

export const tribute = new Tribute({
  collection: [
    {
      trigger: "@",
      menuItemTemplate: (item) =>
        `<div class="mention-item flex items-center gap-4 h-6">
           <img src="${item.original.image || DEFAULT_AVATAR}" width="24" height="24" class = "rounded-full size-6 shrink-0"/>
           <span class = "p3 text-[var(--color-black)]">${item.string}</span>
         </div>`,
      selectTemplate: function (item) {
        const el = this.current.element;
        if (el && el.__quill) {
          const quill = el.__quill;
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'mention', {
            id: item.original.value,
            name: item.original.key,
          }, 'user');
          quill.insertText(range.index + 1, ' ', 'user');
          quill.setSelection(range.index + 2, 0, 'user');
          return '';
        }
        return `<span contenteditable="false" class="mention" data-mention-id="${item.original.value}">${item.original.key}</span>`;
      },
      values: [],
    },
  ],
});
