import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, createContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)];
const core = scripts.find(match => match[1] === 'text-cleaner-core')[2];
const context = createContext({ TextEncoder, Intl });
new Script(core).runInContext(context);
const { cleanText, countText, MAX_BYTES } = context.TextCleaner;

test('default cleanup fixes line endings and spacing while keeping paragraphs', () => {
  const result = cleanText('  First\t  line \r\n\r\n Second   paragraph.  \rThird line.\r\n');
  assert.equal(result.text, 'First line\n\nSecond paragraph.\nThird line.\n');
  assert.equal(result.duplicatesRemoved, 0);
});

test('turning off spacing options preserves indentation and tabs', () => {
  const input = '  indented\t\ttext  \n next';
  assert.equal(cleanText(input, { trimEdges: false, collapseSpaces: false }).text, input);
});

test('duplicate removal retains first occurrences, order, and paragraph breaks', () => {
  const result = cleanText('Apple\nPear\nApple\n\n\nPear\nBanana', { removeDuplicates: true });
  assert.equal(result.text, 'Apple\nPear\n\n\nBanana');
  assert.equal(result.duplicatesRemoved, 2);
});

test('duplicate matching respects the selected case behavior', () => {
  const text = 'Hello\nhello\nHELLO';
  assert.equal(cleanText(text, { removeDuplicates: true }).text, text);
  assert.equal(cleanText(text, { removeDuplicates: true, ignoreCase: true }).text, 'Hello');
});

test('duplicates are compared after cleanup and case conversion', () => {
  const result = cleanText('  hello  world\nHELLO WORLD\nAnother', {
    removeDuplicates: true, letterCase: 'upper',
  });
  assert.equal(result.text, 'HELLO WORLD\nANOTHER');
  assert.equal(result.duplicatesRemoved, 1);
});

test('blank-line removal handles whitespace-only lines even when trimming is off', () => {
  assert.equal(cleanText('first\n \t \n\n second \n', {
    trimEdges: false, removeBlankLines: true,
  }).text, 'first\n second ');
});

test('Arabic marks, emoji joiners, and literal HTML stay intact', () => {
  const text = 'السَّلَامُ عَلَيْكُمْ\n👨‍👩‍👧‍👦\n<script>alert("example")</script>\nنیم\u200cفاصله';
  assert.equal(cleanText(text).text, text);
});

test('character counts treat combined marks and joined emoji as visible characters', () => {
  assert.equal(countText('e\u0301').characters, 1);
  assert.equal(countText('👨‍👩‍👧‍👦').characters, 1);
  assert.equal(countText('مرحبا بالعالم').words, 2);
});

test('line counts handle CRLF without counting both newline characters as lines', () => {
  assert.equal(countText('').lines, 0);
  assert.equal(countText('a\r\nb\rc\n').lines, 4);
  assert.equal(countText('').words, 0);
  assert.equal(countText('').characters, 0);
});

test('size checks use UTF-8 bytes and allow the documented exact boundary', () => {
  assert.equal(cleanText('x'.repeat(MAX_BYTES)).text.length, MAX_BYTES);
  assert.throws(() => cleanText('x'.repeat(MAX_BYTES + 1)), /250 KB/);
  assert.throws(() => cleanText('م'.repeat(MAX_BYTES / 2 + 1)), /250 KB/);
});

test('invalid input and unknown casing are rejected with actionable errors', () => {
  assert.throws(() => cleanText(null), /string/);
  assert.throws(() => cleanText('text', { letterCase: 'unknown' }), /letter case/);
});

test('counting has a useful fallback when Intl.Segmenter is unavailable', () => {
  const fallback = createContext({ TextEncoder, Intl: {} });
  new Script(core).runInContext(fallback);
  assert.equal(fallback.TextCleaner.countText('مرحبا world 123').words, 3);
  assert.equal(fallback.TextCleaner.countText('😀').characters, 1);
});

test('all app scripts are valid JavaScript and need no external resources', () => {
  assert.equal(scripts.length, 2);
  for (const [, , script] of scripts) {
    assert.doesNotThrow(() => new Script(script));
    assert.doesNotMatch(script, /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB)\b/);
  }
  assert.doesNotMatch(html, /<(script|link|img)\b[^>]*(src|href)\s*=/i);
});
