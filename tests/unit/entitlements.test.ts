import { describe, it, expect } from 'vitest';
import { getPlanFeatures, getRouteFeature, hasFeature, normalizePlan } from '@/shared/entitlements';

describe('normalizePlan', () => {
  it('defaults unknown and empty values to free', () => {
    expect(normalizePlan(null)).toBe('free');
    expect(normalizePlan('enterprise')).toBe('free');
    expect(normalizePlan('lifetime')).toBe('lifetime');
  });
});

describe('plan matrix', () => {
  it('grants the intended cumulative features', () => {
    expect(getPlanFeatures('free')).toEqual(['dashboard', 'students', 'spp', 'transactions']);
    expect(hasFeature('basic', 'reports')).toBe(true);
    expect(hasFeature('basic', 'student_import')).toBe(true);
    expect(hasFeature('basic', 'enrollment')).toBe(false);
    for (const feature of ['enrollment', 'realtime_dashboard', 'payroll', 'inventory'] as const) {
      expect(hasFeature('pro', feature)).toBe(true);
      expect(hasFeature('lifetime', feature)).toBe(true);
    }
  });

  it('downgrade removes mutation entitlement while route matching includes nested paths', () => {
    expect(hasFeature('free', 'payroll')).toBe(false);
    expect(hasFeature('basic', 'inventory')).toBe(false);
    expect(getRouteFeature('/payroll/history/2026')).toBe('payroll');
    expect(getRouteFeature('/reports?year=2026')).toBe('reports');
  });
});
