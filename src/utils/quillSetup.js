import MentionBlot from './mentionBlot.js';

export function initQuillEditor(element) {
  if (!window.Quill || !element) return null;
  if (element.__quill) return element.__quill;

  if (!window.__mentionBlotRegistered) {
    window.Quill.register(MentionBlot, true);
    window.__mentionBlotRegistered = true;
  }

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
  quill.focus();
  return quill;
}

