/**
 * Tests for AuthContext
 * Tests validation helpers and auth flow logic.
 *
 * Run: cd frontend && npm run test:run
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  normalizeEmail,
  isValidPassword,
  isValidPhone,
} from './AuthContext';

// ── Validation Helpers ─────────────────────────────────────────────────────

describe('normalizeEmail', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });

  it('handles already normalized email', () => {
    expect(normalizeEmail('user@example.com')).toBe('user@example.com');
  });

  it('handles empty string', () => {
    expect(normalizeEmail('')).toBe('');
  });
});

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });

  it('accepts admin demo email', () => {
    expect(isValidEmail('admin@apoteksehat.com')).toBe(true);
  });
});

describe('isValidPassword', () => {
  it('accepts 6 character password', () => {
    expect(isValidPassword('123456').valid).toBe(true);
  });

  it('rejects password shorter than 6', () => {
    const result = isValidPassword('12345');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('minimal 6');
  });

  it('rejects empty password', () => {
    const result = isValidPassword('');
    expect(result.valid).toBe(false);
  });

  it('accepts long password', () => {
    expect(isValidPassword('a'.repeat(128)).valid).toBe(true);
  });

  it('rejects password longer than 128', () => {
    const result = isValidPassword('a'.repeat(129));
    expect(result.valid).toBe(false);
    expect(result.message).toContain('panjang');
  });
});

describe('isValidPhone', () => {
  it('accepts Indonesian mobile number starting with 08', () => {
    expect(isValidPhone('08123456789')).toBe(true);
  });

  it('accepts with +62 prefix', () => {
    expect(isValidPhone('+628123456789')).toBe(true);
  });

  it('accepts with 62 prefix', () => {
    expect(isValidPhone('628123456789')).toBe(true);
  });

  it('rejects too short', () => {
    expect(isValidPhone('08123')).toBe(false);
  });

  it('rejects non-numeric', () => {
    expect(isValidPhone('abcdefghij')).toBe(false);
  });

  it('rejects empty', () => {
    expect(isValidPhone('')).toBe(false);
  });

  it('handles phone with dashes', () => {
    expect(isValidPhone('081-234-567-89')).toBe(true);
  });
});
