let saved = null;

export function saveSelection() {
  const active = document.activeElement;
  if (active && active.__quill) {
    const range = active.__quill.getSelection();
    if (range) {
      saved = { type: 'quill', quill: active.__quill, range };
      return;
    }
  }
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    saved = { type: 'dom', range: sel.getRangeAt(0).cloneRange() };
  }
}

export function restoreSelection(el) {
  if (!saved) return;
  if (saved.type === 'quill' && el.__quill === saved.quill) {
    saved.quill.setSelection(saved.range);
    return;
  }
  if (saved.type === 'dom') {
    const sel = window.getSelection();
    if (el.contains(saved.range.startContainer)) {
      sel.removeAllRanges();
      sel.addRange(saved.range);
    }
  }
}

export function moveCursorToEnd(el) {
  if (el.__quill) {
    const quill = el.__quill;
    const len = quill.getLength();
    quill.setSelection(len, 0);
    quill.focus();
    saved = { type: 'quill', quill, range: { index: len, length: 0 } };
  } else {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
    saved = { type: 'dom', range: range.cloneRange() };
  }
}
