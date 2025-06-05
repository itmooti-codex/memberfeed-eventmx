import assert from 'assert';
import { formatContent } from '../src/utils/formatter.js';

// Minimal document stub for decodeEntities
global.document = {
  createElement() {
    return {
      innerHTML: '',
      get value() { return this.innerHTML; }
    };
  }
};

action();

function action() {
  testDoubleQuotedHref();
  testSingleQuotedHref();
  console.log('All tests passed');
}

function testDoubleQuotedHref() {
  const input = '<p>Go to <a href="https://example.com">Example</a></p>';
  const output = formatContent(input);
  assert.ok(/<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">Example<\/a>/.test(output));
}

function testSingleQuotedHref() {
  const input = "<p>Go to <a href='https://example.com'>Example</a></p>";
  const output = formatContent(input);
  assert.ok(/<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">Example<\/a>/.test(output));
}
