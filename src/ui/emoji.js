export const emojiPickerHtml = `
  <div class="emoji-wrapper relative">
    <button type="button" class="emoji-toggle">😊</button>
    <div class="emoji-picker hidden absolute bg-white border rounded shadow-md p-1 mt-1 z-10">
      <span class="cursor-pointer px-1">😀</span>
      <span class="cursor-pointer px-1">😂</span>
      <span class="cursor-pointer px-1">😍</span>
      <span class="cursor-pointer px-1">😎</span>
      <span class="cursor-pointer px-1">🤔</span>
      <span class="cursor-pointer px-1">😢</span>
      <span class="cursor-pointer px-1">👍</span>
      <span class="cursor-pointer px-1">🎉</span>
      <span class="cursor-pointer px-1">🚀</span>
      <span class="cursor-pointer px-1">🥳</span>
    </div>
  </div>
`;
export const recorederDesign = `
              <div id="recordBtn"
                class="recordBtn w-full flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[2px] border-dashed border-[var(--grey-200)] bg-[var(--grey-300)] px-3 py-6 transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-shade)]">
                <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16.9881 19.3334C19.7828 19.3334 22.0476 17.0953 22.0476 14.3334V7.66675C22.0476 4.90484 19.7828 2.66675 16.9881 2.66675C14.1935 2.66675 11.9286 4.90484 11.9286 7.66675V14.3334C11.9286 17.0953 14.1935 19.3334 16.9881 19.3334ZM26.8095 14.2739C26.8095 14.1429 26.7024 14.0358 26.5714 14.0358H24.7857C24.6548 14.0358 24.5476 14.1429 24.5476 14.2739C24.5476 18.4495 21.1637 21.8334 16.9881 21.8334C12.8125 21.8334 9.42859 18.4495 9.42859 14.2739C9.42859 14.1429 9.32145 14.0358 9.1905 14.0358H7.40478C7.27383 14.0358 7.16669 14.1429 7.16669 14.2739C7.16669 19.2947 10.9345 23.4376 15.7976 24.0239V27.0715H11.4732C11.0655 27.0715 10.7381 27.4971 10.7381 28.0239V29.0953C10.7381 29.2263 10.8214 29.3334 10.9226 29.3334H23.0536C23.1548 29.3334 23.2381 29.2263 23.2381 29.0953V28.0239C23.2381 27.4971 22.9107 27.0715 22.503 27.0715H18.0595V24.0388C22.9792 23.5031 26.8095 19.3364 26.8095 14.2739Z"
                    fill="#737373" />
                </svg>
                <div class="justify-start text-center p3 text-balck">Record
                  Audio
                </div>
              </div>
`;
export const uploadDesign = `
<div  @click="($event) => $event.target.closest('.upload-section')?.querySelector('.filepond--drop-label')?.click()"
                class="classUploadFiles dragover inline-flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[2px] border-dashed border-[var(--grey-200)] bg-[var(--grey-300)] px-3 py-6 transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-shade)]">
                <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M29.8329 19.3337V28.2223C29.8329 28.517 29.7158 28.7996 29.5075 29.008C29.2991 29.2164 29.0165 29.3334 28.7218 29.3334H4.27819C3.98351 29.3334 3.70091 29.2164 3.49254 29.008C3.28417 28.7996 3.16711 28.517 3.16711 28.2223V19.3337C3.16711 19.0391 3.28417 18.7565 3.49254 18.5481C3.70091 18.3397 3.98351 18.2227 4.27819 18.2227C4.57286 18.2227 4.85547 18.3397 5.06384 18.5481C5.2722 18.7565 5.38926 19.0391 5.38926 19.3337V27.1113H27.6108V19.3337C27.6108 19.0391 27.7278 18.7565 27.9362 18.5481C28.1446 18.3397 28.4272 18.2227 28.7218 18.2227C29.0165 18.2227 29.2991 18.3397 29.5075 18.5481C29.7158 18.7565 29.8329 19.0391 29.8329 19.3337ZM11.7307 10.1202L15.3889 6.46055V19.3337C15.3889 19.6284 15.506 19.911 15.7144 20.1194C15.9227 20.3278 16.2053 20.4448 16.5 20.4448C16.7947 20.4448 17.0773 20.3278 17.2857 20.1194C17.494 19.911 17.6111 19.6284 17.6111 19.3337V6.46055L21.2693 10.1202C21.4778 10.3286 21.7605 10.4458 22.0554 10.4458C22.3502 10.4458 22.633 10.3286 22.8415 10.1202C23.05 9.91167 23.1671 9.62891 23.1671 9.33407C23.1671 9.03923 23.05 8.75647 22.8415 8.54798L17.2861 2.99261C17.1829 2.88931 17.0604 2.80736 16.9255 2.75144C16.7906 2.69553 16.646 2.66675 16.5 2.66675C16.354 2.66675 16.2094 2.69553 16.0745 2.75144C15.9397 2.80736 15.8171 2.88931 15.7139 2.99261L10.1586 8.54798C9.95007 8.75647 9.83294 9.03923 9.83294 9.33407C9.83294 9.62891 9.95007 9.91167 10.1586 10.1202C10.367 10.3286 10.6498 10.4458 10.9446 10.4458C11.2395 10.4458 11.5222 10.3286 11.7307 10.1202Z"
                    fill="#737373" />
                </svg>

                <div class="justify-start text-center p3 text-balck">Upload
                  File
                </div>
              </div>
`;

import { saveSelection, restoreSelection } from '../utils/caret.js';

export function initEmojiHandlers() {
  $(document).on('keyup mouseup input', '.editor', function () {
    saveSelection();
  });
  $(document).on('click', '.emoji-toggle', function (e) {
    e.stopPropagation();
    const picker = $(this).siblings('.emoji-picker');
    $('.emoji-picker').not(picker).addClass('hidden');
    picker.toggleClass('hidden');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.emoji-picker, .emoji-toggle').length) {
      $('.emoji-picker').addClass('hidden');
    }
  });

  $(document).on('click', '.emoji-picker span', function () {
    const emoji = $(this).text();
    const container = $(this).closest('.comment-form, .post-form');
    const editor = container.find('.editor')[0];
    if (editor) insertEmoji(editor, emoji);
  });
}

function insertEmoji(editor, emoji) {
  editor.focus();
  restoreSelection(editor);
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(emoji));
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  saveSelection();
}
