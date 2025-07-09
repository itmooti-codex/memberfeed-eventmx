export function initQuillEditor(element) {
  if (!window.Quill || !element) return null;
  if (element.__quill) return element.__quill;
  const placeholder = element.getAttribute('data-placeholder') || '';
  const quill = new Quill(element, {
    theme: 'snow',
    placeholder,
    modules: { toolbar: false },
  });
  quill.root.classList.add('editor');
  element.removeAttribute('contenteditable');
  return quill;
}

