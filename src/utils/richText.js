// import { restoreSelection, saveSelection } from './caret.js';

// export function initRichText() {
//  $(document).on('keyup mouseup input focus', '.editor', function () {
//     ensureCursor(this);
//     saveSelection();
//     updateToolbar(this);
//   });
//   $(document).on('click', '.toolbar button', function (e) {
//     e.preventDefault();
//     const cmd = $(this).data('cmd');
//     const editor = $(this)
//       .closest('.comment-form, #post-creation-form')
//       .find('.editor')[0];
//     if (!editor) return;
   
//     editor.focus();
//     ensureCursor(editor);
//     restoreSelection(editor);
   
//     if (cmd === 'link') {
//       let url = prompt('Enter URL');
//       if (url) {
//         url = url.trim();
//         if (!/^https?:\/\//i.test(url)) {
//           url = `https://${url}`;
//         }
//         applyFormat('link', editor, url);
//       }
//     } else {
//       applyFormat(cmd, editor);
//     }
//     updateToolbar(editor);
//     saveSelection();
//   });
// }

// function ensureCursor(editor) {
//   const text = editor.textContent.replace(/\u200B/g, '');
//   if (!text) {
//     editor.innerHTML = '\u200B';
//     const range = document.createRange();
//     range.setStart(editor.firstChild, 1);
//     range.collapse(true);
//     const sel = window.getSelection();
//     sel.removeAllRanges();
//     sel.addRange(range);
//   }
// }

// function applyFormat(cmd, editor, value) {
//   if (cmd === 'link') {
//     document.execCommand('createLink', false, value);
//   } else {
//     document.execCommand(cmd, false, null);
//   }
// }

// function updateToolbar(editor) {
//   const toolbar = $(editor)
//     .closest('.comment-form, #post-creation-form')
//     .find('.toolbar');
//   toolbar.find('button').each(function () {
//     const cmd = $(this).data('cmd');
//     if (!cmd || cmd === "link") return;
//     $(this).toggleClass('active', document.queryCommandState(cmd));
//   });
// }
// $(document).on('input', '.editor', function () {
//   const html = this.innerHTML.trim().toLowerCase();
//   const hasFormat = this.querySelector('strong, em, u, a');
//   if (html === '<br>' || html === '<div><br></div>' || (!hasFormat && this.textContent.trim() === '')) {
//     this.innerHTML = '';
//     const range = document.createRange();
//     range.selectNodeContents(this);
//     range.collapse(false);
//     const sel = window.getSelection();
//     sel.removeAllRanges();
//     sel.addRange(range);
//   }
//   updateToolbar(this);
//   saveSelection();
// });



import { restoreSelection, saveSelection } from './caret.js';

export function initRichText() {
  // Whenever the user types, clicks, or focuses, update toolbar & save selection
  $(document).on('keyup mouseup input focus', '.editor', function () {
    saveSelection();
    updateToolbar(this);
  });

  // Clean up stray <br> placeholders and re-position the caret
  $(document).on('input', '.editor', function () {
    const html = this.innerHTML.trim().toLowerCase();
    const hasFormat = this.querySelector('strong, em, u, a');
    if (
      html === '<br>' ||
      html === '<div><br></div>' ||
      (!hasFormat && this.textContent.trim() === '')
    ) {
      this.innerHTML = '';
      placeCursorAtEnd(this);
    }
    saveSelection();
    updateToolbar(this);
  });

  // Handle toolbar clicks
  $(document).on('click', '.toolbar button', function (e) {
    e.preventDefault();
    const cmd = $(this).data('cmd');
    const editor = $(this)
      .closest('.comment-form, #post-creation-form')
      .find('.editor')[0];
    if (!editor) return;

    editor.focus();
    ensureCursor(editor);
    restoreSelection(editor);

    if (cmd === 'link') {
      let url = prompt('Enter URL');
      if (url) {
        url = url.trim();
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }
        document.execCommand('createLink', false, url);
      }
    } else {
      document.execCommand(cmd, false, null);
    }

    saveSelection();
    updateToolbar(editor);
  });
}

function ensureCursor(editor) {
  const html = editor.innerHTML.trim().toLowerCase();
  if (!html || html === '<br>' || html === '<div><br></div>') {
    // only when truly empty…
    editor.innerHTML = '\u200B';      // inject zero-width space
  }
  placeCursorAtEnd(editor);
}

function placeCursorAtEnd(editor) {
  const sel = window.getSelection();
  const range = document.createRange();
  let node = editor;
  // find deepest last child
  while (node.lastChild) node = node.lastChild;
  if (node.nodeType === Node.TEXT_NODE) {
    range.setStart(node, node.textContent.length);
  } else {
    range.selectNodeContents(editor);
    range.collapse(false);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

function updateToolbar(editor) {
  const toolbar = $(editor)
    .closest('.comment-form, #post-creation-form')
    .find('.toolbar');
  ['bold', 'italic', 'underline'].forEach(cmd => {
    toolbar
      .find(`button[data-cmd="${cmd}"]`)
      .toggleClass('active', document.queryCommandState(cmd));
  });
}

/*
1- ensureCursor only acts on truly empty content (innerHTML '', <br>, <div><br></div>), so existing <strong>, <em>, <u>, <a> tags survive.
2- placeCursorAtEnd walks to the last text node (or collapse at end) so the caret is always ready.
3- updateToolbar loops through your three formatting commands—no more stale “active” states.
4- This lets you click Bold/Italic/Underline (and combine or untoggle them) immediately, even before typing anything, on desktop or iOS Safari.
*/
