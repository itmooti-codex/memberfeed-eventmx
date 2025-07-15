import { restoreSelection, saveSelection } from './caret.js';

export function initRichText() {
  $(document).on('keyup mouseup input focus touchend', '.editor', function () {
    ensureCursor(this);
    saveSelection();
    syncFormatting(this);
    updateToolbar(this);
  });

  $(document).on('click', '.toolbar button[data-cmd="bold"], .toolbar button[data-cmd="italic"], .toolbar button[data-cmd="underline"]', function (e) {
    e.preventDefault();
    const cmd = $(this).data('cmd');
    const editor = $(this)
      .closest('.comment-form, #post-creation-form')
      .find('.editor')[0];
    if (!editor) return;

    if (!$('#gif-modal').is(':visible')) {
      editor.focus();
    }
    ensureCursor(editor);
    restoreSelection(editor);

    if (cmd === 'link') {
      let url = prompt('Enter URL');
      if (url) {
        url = url.trim();
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        applyFormat('link', editor, url);
      }
    } else {
      const wasActive = $(this).hasClass('active');
      applyFormat(cmd, editor);
      $(this).toggleClass('active', !wasActive);
      syncFormatting(editor);
    }
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
    return;
  }

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  if (
    range.collapsed &&
    editor.textContent.replace(/\u200B/g, '').trim() === ''
  ) {
    const ph = document.createTextNode('\u200B');
    range.insertNode(ph);
    range.setStart(ph, 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  document.execCommand(cmd, false, null);
}

function isFormatActive(cmd) {
  return document.queryCommandState(cmd);
}

function updateToolbar(editor) {
  const toolbar = $(editor)
    .closest('.comment-form, #post-creation-form')
    .find('.toolbar');
  toolbar.find('button[data-cmd="bold"],button[data-cmd="italic"],button[data-cmd="underline"]').each(function () {
    const cmd = $(this).data('cmd');
    if (!cmd || cmd === 'link') return;
    if (isFormatActive(cmd)) $(this).addClass('active');
  });
}

function syncFormatting(editor) {
  const toolbar = $(editor)
    .closest('.comment-form, #post-creation-form')
    .find('.toolbar');
  const formats = [
    { cmd: 'bold', want: toolbar.find('button[data-cmd="bold"]').hasClass('active') },
    { cmd: 'italic', want: toolbar.find('button[data-cmd="italic"]').hasClass('active') },
    { cmd: 'underline', want: toolbar.find('button[data-cmd="underline"]').hasClass('active') }
  ];
  formats.forEach(f => {
    const has = document.queryCommandState(f.cmd);
    if (f.want && !has) document.execCommand(f.cmd, false, null);
    if (!f.want && has) document.execCommand(f.cmd, false, null);
  });
}

$(document).on('input', '.editor', function () {
  if (
    this.firstChild &&
    this.firstChild.nodeType === 3 &&
    this.firstChild.nodeValue.startsWith('\u200B')
  ) {
    const sel = window.getSelection();
    let offset = null;
    if (
      sel &&
      sel.rangeCount &&
      sel.getRangeAt(0).startContainer === this.firstChild
    ) {
      offset = sel.getRangeAt(0).startOffset;
    }
    this.firstChild.nodeValue = this.firstChild.nodeValue.replace(/^\u200B/, '');
    if (offset !== null) {
      const range = document.createRange();
      range.setStart(this.firstChild, Math.max(0, offset - 1));
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

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

  syncFormatting(this);
  updateToolbar(this);
  saveSelection();
});
