import Quill from 'quill';

const Inline = Quill.import('blots/inline');

class MentionBlot extends Inline {
  static create(value) {
    const node = super.create();
    if (value && value.id) node.setAttribute('data-mention-id', value.id);
    node.classList.add('mention');
    node.setAttribute('contenteditable', 'false');
    node.textContent = value && value.name ? value.name : '';
    return node;
  }

  static formats(node) {
    return node.getAttribute('data-mention-id');
  }
}

MentionBlot.blotName = 'mention';
MentionBlot.tagName = 'span';
MentionBlot.className = 'mention';

export default MentionBlot;
