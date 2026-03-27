import { describe, it, expect, beforeEach } from 'vitest';
import { f, fK, fKd, p, p2, dp, pc, rc } from './format';
import { CFG } from '../state';

describe('format functions', () => {
  beforeEach(() => {
    CFG.currency = 'EUR';
    CFG.lang = 'cs';
  });

  describe('f() — integer with locale separator', () => {
    it('formátuje celé číslo', () => {
      const result = f(1234567);
      // cs-CZ uses non-breaking space as thousands separator
      expect(result.replace(/\s/g, '')).toBe('1234567');
    });

    it('zaokrouhlí desetinné číslo', () => {
      expect(f(1234.7).replace(/\s/g, '')).toBe('1235');
    });

    it('zvládne nulu', () => {
      expect(f(0)).toBe('0');
    });

    it('zvládne záporné číslo', () => {
      const result = f(-500);
      expect(result.replace(/[^\d-]/g, '')).toBe('-500');
    });
  });

  describe('fK() — thousands abbreviation', () => {
    it('zkracuje na k pro čísla >= 1000', () => {
      expect(fK(12300)).toBe('12k');
    });

    it('nezakracuje čísla < 1000', () => {
      expect(fK(500)).toBe('500');
    });

    it('zaokrouhlí na celé k', () => {
      expect(fK(12800)).toBe('13k');
    });
  });

  describe('fKd() — thousands with decimal', () => {
    it('vždy zobrazí jedno desetinné místo', () => {
      expect(fKd(12345)).toBe('12.3k');
    });

    it('malé číslo', () => {
      expect(fKd(500)).toBe('0.5k');
    });
  });

  describe('p() — percentage', () => {
    it('převede na procenta s 1 desetinným místem', () => {
      expect(p(0.205)).toBe('20.5%');
    });

    it('nula', () => {
      expect(p(0)).toBe('0.0%');
    });

    it('100%', () => {
      expect(p(1)).toBe('100.0%');
    });
  });

  describe('p2() — percentage with 2 decimals', () => {
    it('CVR formát', () => {
      expect(p2(0.00145)).toBe('0.14%'); // 0.00145 * 100 = 0.145 → toFixed(2) = 0.14 (banker's rounding)
    });

    it('vyšší přesnost', () => {
      expect(p2(0.1234)).toBe('12.34%');
    });
  });

  describe('dp() — delta percentage', () => {
    it('kladný delta má +', () => {
      expect(dp(0.15)).toBe('+15.0%');
    });

    it('záporný delta nemá +', () => {
      expect(dp(-0.10)).toBe('-10.0%');
    });

    it('nula má +', () => {
      expect(dp(0)).toBe('+0.0%');
    });
  });

  describe('pc() — PNO color', () => {
    it('vysoké PNO → červená', () => {
      expect(pc(0.30)).toBe('#DC2626');
    });

    it('střední PNO → oranžová', () => {
      expect(pc(0.22)).toBe('#D97706');
    });

    it('nízké PNO → zelená', () => {
      expect(pc(0.15)).toBe('#16A34A');
    });

    it('přesně 0.28 → oranžová (hranice)', () => {
      expect(pc(0.28)).toBe('#D97706');
    });

    it('přesně 0.20 → zelená (hranice)', () => {
      expect(pc(0.20)).toBe('#16A34A');
    });
  });

  describe('rc() — ROAS color', () => {
    it('vysoký ROAS → zelená', () => {
      expect(rc(8)).toBe('#16A34A');
    });

    it('střední ROAS → oranžová', () => {
      expect(rc(5)).toBe('#D97706');
    });

    it('nízký ROAS → červená', () => {
      expect(rc(3)).toBe('#DC2626');
    });

    it('přesně 7 → zelená (hranice)', () => {
      expect(rc(7)).toBe('#16A34A');
    });

    it('přesně 4 → oranžová (hranice)', () => {
      expect(rc(4)).toBe('#D97706');
    });
  });
});
