import { restoreSelection, saveSelection } from './caret.js';

export function initRichText() {
 $(document).on('keyup mouseup input focus touchend', '.editor', function () {
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

// function applyFormat(cmd, editor, value) {
//   const isStyle = cmd === 'bold' || cmd === 'italic' || cmd === 'underline';
//   const isEmpty = editor.textContent.replace(/\u200B/g, '').trim() === '';

//   if (isStyle && isEmpty) {
//     const tag =
//       cmd === 'bold' ? 'strong' : cmd === 'italic' ? 'em' : 'u';
//     document.execCommand('insertHTML', false, `<${tag}>\u200B</${tag}>`);
//     const node = editor.querySelector(`${tag}`);
//     if (node && node.firstChild) {
//       const range = document.createRange();
//       range.setStart(node.firstChild, 1);
//       range.collapse(true);
//       const sel = window.getSelection();
//       sel.removeAllRanges();
//       sel.addRange(range);
//     }
//   } else if (cmd === 'link') {
//     document.execCommand('createLink', false, value);
//   } else {
//     document.execCommand(cmd, false, null);
//   }
// }



function applyFormat(cmd, editor, value) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const isStyle = cmd === 'bold' || cmd === 'italic' || cmd === 'underline';

  let tag;
  if (isStyle) {
    tag = cmd === 'bold' ? 'strong' : cmd === 'italic' ? 'em' : 'u';
  } else if (cmd === 'link') {
    tag = 'a';
  } else {
    return;
  }

  const wrapper = document.createElement(tag);
  if (cmd === 'link') {
    wrapper.setAttribute('href', value);
    wrapper.setAttribute('target', '_blank');
  }

  if (range.collapsed) {
    wrapper.textContent = '\u200B';
    range.insertNode(wrapper);
    range.setStart(wrapper.firstChild, 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return;
  }

  const contents = range.extractContents();
  wrapper.appendChild(contents);
  range.insertNode(wrapper);
  range.selectNodeContents(wrapper);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}


function updateToolbar(editor) {
  const toolbar = $(editor)
    .closest('.comment-form, #post-creation-form')
    .find('.toolbar');
  toolbar.find('button').each(function () {
    const cmd = $(this).data('cmd');
    if (!cmd || cmd === 'link') return;
    $(this).toggleClass('active', isFormatActive(cmd, editor));
  });
}

function isFormatActive(cmd, editor) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  let node = sel.getRangeAt(0).startContainer;
  while (node && node !== editor) {
    const name = node.nodeName;
    if (cmd === 'bold' && name === 'STRONG') return true;
    if (cmd === 'italic' && name === 'EM') return true;
    if (cmd === 'underline' && name === 'U') return true;
    node = node.parentNode;
  }
  return false;
}


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
$(document).on('input', '.editor', function () {
  // Remove leading zero-width space if present
  if (this.firstChild && this.firstChild.nodeType === 3 && this.firstChild.nodeValue.startsWith('\u200B')) {
    this.firstChild.nodeValue = this.firstChild.nodeValue.replace(/^\u200B/, '');
  }
  const html = this.innerHTML.trim().toLowerCase();
  const hasFormat = this.querySelector('strong, em, u, a');
  if (html === '<br>' || html === '<div><br></div>' || (!hasFormat && this.textContent.trim() === '')) {
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