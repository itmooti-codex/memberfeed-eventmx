export function initRichText() {
  $(document).on('click', '.toolbar button', function (e) {
    e.preventDefault();
    const cmd = $(this).data('cmd');
    const editor = $(this)
      .closest('.comment-form, #post-creation-form')
      .find('.editor')[0];
    if (!editor) return;
    editor.focus();
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
  });
}

function applyFormat(cmd, editor, value) {
  editor.focus();
  if (cmd === 'link') {
    document.execCommand('createLink', false, value);
  } else {
    document.execCommand(cmd, false, null);
  }
}
$(document).on('input', '.editor', function () {
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
});
