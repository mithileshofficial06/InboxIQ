/**
 * The OAuth state nonce is the only thing stopping an attacker from binding a
 * victim's session to their own Google account. verifyState guards a
 * timingSafeEqual call that throws outright on unequal-length buffers, so the
 * pre-checks below are load-bearing, not defensive noise.
 */

// generateState/verifyState are pure crypto and never touch the Google SDK.
// Stubbing it keeps this suite fast and avoids pulling in the whole googleapis
// surface just to reach two functions.
jest.mock('googleapis', () => ({ google: { auth: { OAuth2: class {} } } }));

import { generateState, verifyState } from '../../src/config/google';

describe('generateState', () => {
  it('produces a non-empty base64url string', () => {
    const state = generateState();

    expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(state.length).toBeGreaterThan(0);
  });

  it('produces a distinct value on every call', () => {
    const states = new Set(Array.from({ length: 50 }, () => generateState()));

    expect(states.size).toBe(50);
  });
});

describe('verifyState', () => {
  it('accepts a matching pair', () => {
    const state = generateState();

    expect(verifyState(state, state)).toBe(true);
  });

  it('rejects a mismatched pair of equal length', () => {
    expect(verifyState('a'.repeat(32), 'b'.repeat(32))).toBe(false);
  });

  it('rejects values of differing length without throwing', () => {
    // timingSafeEqual throws on length mismatch — this must be caught earlier.
    expect(() => verifyState('short', 'a-much-longer-value')).not.toThrow();
    expect(verifyState('short', 'a-much-longer-value')).toBe(false);
  });

  it('rejects empty strings', () => {
    expect(verifyState('', '')).toBe(false);
  });

  it.each([
    ['undefined received', undefined, 'expected'],
    ['undefined expected', 'received', undefined],
    ['both undefined', undefined, undefined],
    ['non-string received', 123, 'expected'],
    ['array received', ['a', 'b'], 'expected'],
    ['null expected', 'received', null],
  ])('rejects %s', (_label, received, expected) => {
    expect(verifyState(received, expected)).toBe(false);
  });
});
