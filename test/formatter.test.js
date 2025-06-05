import assert from 'assert';
import { formatContent } from '../src/utils/formatter.js';

// No DOM needed for decodeEntities in tests

action();

function action() {
  testDoubleQuotedHref();
  testSingleQuotedHref();
  testDecodeEntities();
  testMentionStrip();
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

function testDecodeEntities() {
  const input = '&lt;b&gt;&lt;i&gt;a&lt;/i&gt;&lt;/b&gt;';
  const output = formatContent(input);
  assert.ok(output.includes('<b><i>a</i></b>'));
}

function testMentionStrip() {
  const input = '<span class="mention" data-mention-id="1">@foo</span>';
  const output = formatContent(input);
  assert.ok(output.includes('@foo') && !output.includes('<span'));
}
