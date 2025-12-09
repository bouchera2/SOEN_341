import { toCsvField } from '../routes/eventExports.js';

test('toCsvField returns trimmed string for valid input', () => {
  expect(toCsvField('  Hello  ')).toBe('Hello');
});

test('toCsvField returns undefined for empty string', () => {
  expect(toCsvField('   ')).toBeUndefined();
});

