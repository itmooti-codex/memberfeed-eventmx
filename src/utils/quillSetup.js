export function initQuillEditor(element) {
  if (!window.Quill || !element) return null;
  if (element.__quill) return element.__quill;
  const placeholder = element.getAttribute('data-placeholder') || '';
  const quill = new Quill(element, {
    theme: 'snow',
    placeholder,
    modules: { toolbar: false },
  });
  // Keep the editor class only on the Quill root so
  // reinitialization doesn't target the container again
  quill.root.classList.add('editor');
  element.classList.remove('editor');
  // Remove the old contenteditable attribute to avoid nested editable areas
  element.removeAttribute('contenteditable');
  return quill;
}

