import assert from 'assert';
import { formatContent } from '../src/utils/formatter.js';

// No DOM needed for decodeEntities in tests

function runTest(description, input, expectedSubstring) {
  const result = formatContent(input);
  assert.ok(result.includes(expectedSubstring), `${description}: expected '${expectedSubstring}' in '${result}'`);
}

try {
  runTest('http url in sentence', 'Check http://example.com now', '<a href="http://example.com"');
  runTest('www url in sentence', 'Visit www.example.com today', '<a href="https://www.example.com"');
  runTest('url at start with punctuation', '(http://example.com)', '<a href="http://example.com)"');
  const linked = '<a href="http://example.com">http://example.com</a>';
  const processed = formatContent(linked);
  assert.ok(processed.startsWith('<a href="http://example.com"'), 'existing anchor preserved');
  runTest('formatted text preserved', '&lt;b&gt;&lt;i&gt;a&lt;/i&gt;&lt;/b&gt;', '<b><i>a</i></b>');
  runTest('mention stripped', '<span class="mention" data-mention-id="1">@foo</span>', '@foo');
  console.log('All tests passed');
} catch (err) {
  console.error(err);
  process.exit(1);
}
