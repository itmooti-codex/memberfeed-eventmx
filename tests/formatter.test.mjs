import assert from 'assert';
import { formatContent } from '../src/utils/formatter.js';

// Minimal DOM stub for decodeEntities
global.document = {
  createElement: () => {
    return {
      _value: '',
      get innerHTML() { return this._value; },
      set innerHTML(v) { this._value = v; this.value = v; },
      value: ''
    };
  }
};

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
  console.log('All tests passed');
} catch (err) {
  console.error(err);
  process.exit(1);
}
