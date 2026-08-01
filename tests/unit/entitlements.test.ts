import assert from 'node:assert/strict';
import test from 'node:test';
import { getPlanFeatures, getRouteFeature, hasFeature, normalizePlan } from '../../src/shared/entitlements/index.ts';

test('normalizePlan defaults unknown and empty values to free', () => {
  assert.equal(normalizePlan(null), 'free');
  assert.equal(normalizePlan('enterprise'), 'free');
  assert.equal(normalizePlan('lifetime'), 'lifetime');
});

test('plan matrix grants the intended cumulative features', () => {
  assert.deepEqual(getPlanFeatures('free'), ['dashboard', 'students', 'spp', 'transactions']);
  assert.equal(hasFeature('basic', 'reports'), true);
  assert.equal(hasFeature('basic', 'student_import'), true);
  assert.equal(hasFeature('basic', 'enrollment'), false);
  for (const feature of ['enrollment', 'realtime_dashboard', 'payroll', 'inventory'] as const) {
    assert.equal(hasFeature('pro', feature), true);
    assert.equal(hasFeature('lifetime', feature), true);
  }
});

test('downgrade removes mutation entitlement while route matching includes nested paths', () => {
  assert.equal(hasFeature('free', 'payroll'), false);
  assert.equal(hasFeature('basic', 'inventory'), false);
  assert.equal(getRouteFeature('/payroll/history/2026'), 'payroll');
  assert.equal(getRouteFeature('/reports?year=2026'), 'reports');
});