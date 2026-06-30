import { describe, expect, it } from 'vitest';
import { displayName, publicDriver, showsKartHistory, showsTeam } from './identity';
import { DEFAULT_VISIBILITY, type DriverProfile } from './types';

const base: DriverProfile = {
  id: 'd1',
  displayMode: 'named',
  fullName: 'Ada Kovač',
  alias: 'DriftKing',
  abbreviation: 'KOV',
  number: 57,
  nationality: 'CH',
  avatarUrl: 'https://img/ada.jpg',
  socials: { instagram: '@driftking' },
  visibility: { ...DEFAULT_VISIBILITY },
};

describe('displayName', () => {
  it('shows the full name when Named', () => {
    expect(displayName(base)).toBe('Ada Kovač');
  });
  it('shows the alias when Alias', () => {
    expect(displayName({ ...base, displayMode: 'alias' })).toBe('DriftKing');
  });
  it('shows a codename when Mystery', () => {
    expect(displayName({ ...base, displayMode: 'mystery' })).toBe('Driver #57');
  });
  it('falls back through alias then codename when fields are missing', () => {
    expect(displayName({ ...base, displayMode: 'named', fullName: undefined })).toBe('DriftKing');
    expect(
      displayName({ ...base, displayMode: 'mystery', number: undefined, abbreviation: undefined }),
    ).toBe('Mystery driver');
  });
});

describe('publicDriver — masking', () => {
  it('Named reveals name, nationality, socials and avatar', () => {
    const pub = publicDriver(base);
    expect(pub).toMatchObject({
      name: 'Ada Kovač',
      nationality: 'CH',
      avatarUrl: 'https://img/ada.jpg',
      masked: false,
    });
    expect(pub.socials).toEqual({ instagram: '@driftking' });
  });

  it('Mystery withholds everything identifying', () => {
    const pub = publicDriver({ ...base, displayMode: 'mystery' });
    expect(pub).toMatchObject({ name: 'Driver #57', masked: true, avatarUrl: null });
    expect(pub.nationality).toBeUndefined();
    expect(pub.socials).toBeUndefined();
    expect(pub.abbreviation).toBeUndefined();
  });

  it('per-field toggles hide fields even when Named', () => {
    const pub = publicDriver({
      ...base,
      visibility: { ...DEFAULT_VISIBILITY, nationality: false, socials: false },
    });
    expect(pub.name).toBe('Ada Kovač');
    expect(pub.nationality).toBeUndefined();
    expect(pub.socials).toBeUndefined();
  });

  it('still exposes the kart number for the timing tower even when masked', () => {
    expect(publicDriver({ ...base, displayMode: 'mystery' }).number).toBe(57);
  });
});

describe('history / team gating', () => {
  it('mystery hides kart history and team; toggles gate them otherwise', () => {
    expect(showsKartHistory({ ...base, displayMode: 'mystery' })).toBe(false);
    expect(showsTeam({ ...base, displayMode: 'mystery' })).toBe(false);
    expect(showsKartHistory(base)).toBe(true);
    expect(
      showsKartHistory({ ...base, visibility: { ...DEFAULT_VISIBILITY, kartHistory: false } }),
    ).toBe(false);
  });
});
