import { describe, expect, it } from 'vitest';
import { FMT, fmtDuration } from './format';

describe('FMT', () => {
  it('formats sub-minute laps as ss.mmm', () => {
    expect(FMT(53.4)).toBe('53.400');
  });

  it('formats minute-plus laps as m:ss.mmm', () => {
    expect(FMT(62.8)).toBe('1:02.800');
  });

  it('renders an em dash for null / NaN', () => {
    expect(FMT(null)).toBe('—');
    expect(FMT(Number.NaN)).toBe('—');
  });
});

describe('fmtDuration', () => {
  it('formats a stint duration as m:ss min', () => {
    expect(fmtDuration(1230)).toBe('20:30 min');
  });

  it('rounds and carries seconds into the minute', () => {
    expect(fmtDuration(119.6)).toBe('2:00 min');
  });

  it('renders an em dash for null / NaN', () => {
    expect(fmtDuration(null)).toBe('—');
  });
});
