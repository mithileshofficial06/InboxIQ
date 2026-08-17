/**
 * sanitizeFilterValue is the only thing between user search text and a raw
 * PostgREST `.or()` filter expression. Those expressions use `,` and `.` as
 * delimiters and parentheses to group, so unescaped input could append filters
 * of its own — these tests pin the character stripping directly.
 */

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';

import { sanitizeFilterValue } from '../../src/routes/email.routes';

describe('sanitizeFilterValue', () => {
  it('leaves ordinary search text intact', () => {
    expect(sanitizeFilterValue('invoice from amazon')).toBe('invoice from amazon');
  });

  it.each([
    [',', 'a,b'],
    ['.', 'a.b'],
    ['(', 'a(b'],
    [')', 'a)b'],
    ['*', 'a*b'],
    ['%', 'a%b'],
    ['\\', 'a\\b'],
    ['"', 'a"b'],
    ["'", "a'b"],
  ])('strips the %s character', (_label, input) => {
    expect(sanitizeFilterValue(input)).toBe('a b');
  });

  it('neutralizes an attempt to append another filter condition', () => {
    const injected = 'x,sender_email.ilike.%@victim.com%';

    const result = sanitizeFilterValue(injected);

    expect(result).not.toContain(',');
    expect(result).not.toContain('.');
    expect(result).not.toContain('%');
  });

  it('collapses runs of whitespace left behind by stripping', () => {
    expect(sanitizeFilterValue('a,,,,b')).toBe('a b');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeFilterValue('  spaced  ')).toBe('spaced');
  });

  it('returns an empty string when input is only syntax characters', () => {
    // The caller skips the filter entirely on an empty result.
    expect(sanitizeFilterValue(',.()*%')).toBe('');
  });

  it('caps the value at 100 characters', () => {
    expect(sanitizeFilterValue('a'.repeat(500))).toHaveLength(100);
  });

  it('preserves non-ASCII text', () => {
    expect(sanitizeFilterValue('café münchen')).toBe('café münchen');
  });
});
