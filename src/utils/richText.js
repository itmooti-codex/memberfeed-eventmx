import { initQuillEditor } from './quillSetup.js';
import { saveSelection, restoreSelection } from './caret.js';

function updateToolbar(quill) {
  const toolbar = quill.root
    .closest('.comment-form, #post-creation-form')
    ?.querySelector('.toolbar');
  if (!toolbar) return;
  toolbar.querySelectorAll('button').forEach(btn => {
    const cmd = btn.getAttribute('data-cmd');
    if (!cmd || cmd === 'link') return;
    const active = quill.getFormat()[cmd] || false;
    btn.classList.toggle('active', !!active);
  });
}

export function initRichText() {
  document.querySelectorAll('.editor').forEach(el => {
    if (el.classList.contains('ql-editor') && el.parentElement?.__quill) {
      return;
    }
    const quill = initQuillEditor(el);
    if (quill) {
      quill.on('selection-change', () => {
        updateToolbar(quill);
        saveSelection();
      });
      quill.on('text-change', () => {
        updateToolbar(quill);
        saveSelection();
      });
    }
  });

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.toolbar button');
    if (!btn) return;
    e.preventDefault();
    const cmd = btn.getAttribute('data-cmd');
    const container = btn.closest('.comment-form, #post-creation-form');
    const quillContainer = container?.querySelector('.ql-container');
    const quill = quillContainer ? quillContainer.__quill : null;
    if (!quill) return;

    quill.focus();
    restoreSelection(quill.root);

    if (cmd === 'link') {
      let url = prompt('Enter URL');
      if (url) {
        url = url.trim();
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }
        quill.format('link', url);
      }
    } else {
      const current = quill.getFormat()[cmd];
      quill.format(cmd, !current);
    }
    updateToolbar(quill);
    saveSelection();
  });
}
