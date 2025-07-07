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
  $(document).on('keyup mouseup input focus', '.editor', function () {
    ensureCursor(this);
    saveSelection();
    updateToolbar(this);
  });

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
        applyFormat('link', editor, url);
      }
    } else {
      applyFormat(cmd, editor);
    }

    updateToolbar(editor);
    saveSelection();
  });

  $(document).on('input', '.editor', function () {
    const html = this.innerHTML.trim().toLowerCase();
    const hasFormat = this.querySelector('strong, em, u, a');
    if (
      html === '<br>' ||
      html === '<div><br></div>' ||
      (!hasFormat && this.textContent.trim() === '')
    ) {
      this.innerHTML = '';
      const range = document.createRange();
      range.selectNodeContents(this);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    updateToolbar(this);
    saveSelection();
  });
}

function ensureCursor(editor) {
  const text = editor.textContent.replace(/\u200B/g, '');
  if (!text) {
    editor.innerHTML = '\u200B';
    const range = document.createRange();
    range.setStart(editor.firstChild, 1);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function applyFormat(cmd, editor, value) {
  if (cmd === 'link') {
    document.execCommand('createLink', false, value);
  } else {
    document.execCommand(cmd, false, null);
  }
}

function updateToolbar(editor) {
  const toolbar = $(editor)
    .closest('.comment-form, #post-creation-form')
    .find('.toolbar');
  toolbar.find('button').each(function () {
    const cmd = $(this).data('cmd');
    if (!cmd || cmd === 'link') return;
    $(this).toggleClass('active', document.queryCommandState(cmd));
  });
}

/*
This implementation ensures that:
1. An invisible zero-width space is inserted when the editor is empty (ensureCursor),
   giving the browser a valid text node for execCommand to act on immediately (including iOS Safari).
2. Toolbar buttons will correctly toggle on and off—even before typing—because queryCommandState
   is evaluated at the caret position within that zero-width space.
3. Multiple formats can be applied or removed in combination without requiring additional keystrokes.
4. Selection state is saved and restored around each toolbar action to maintain expected behavior.
*/ 
