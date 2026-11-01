import { describe, expect, it } from 'vitest';
import { projectStatuses, publicFigures, safeProjectLinks, validateFinance, validateProjectDates } from '@/lib/projects';
import type { ProjectFinance } from '@/lib/projects';
const f: ProjectFinance = { project_id: 'test', currency: 'UGX', budget: 500, budget_approved: false, funding_target: 1000, funding_received: 250, funding_verified: false, beneficiaries_reached: 12, beneficiaries_verified: false };
describe('Project management rules', () => {
  it('supports exactly the six requested statuses', () => expect([...projectStatuses]).toEqual(['planned','upcoming','active','on_hold','completed','cancelled']));
  it('hides budgets without disclosure approval', () => { expect(publicFigures(f).budget).toBeNull(); expect(publicFigures({ ...f, budget_approved: true }).budget).toBe(500); });
  it('hides funding received until verified', () => { expect(publicFigures(f).funding_received).toBeNull(); expect(publicFigures({ ...f, funding_verified: true }).funding_received).toBe(250); });
  it('hides beneficiaries until verified', () => { expect(publicFigures(f).beneficiaries_reached).toBeNull(); expect(publicFigures({ ...f, beneficiaries_verified: true }).beneficiaries_reached).toBe(12); });
  it('keeps the funding target public', () => expect(publicFigures(f).funding_target).toBe(1000));
  it('rejects reversed dates', () => { expect(() => validateProjectDates('2026-11-02','2026-11-01')).toThrow(); expect(() => validateProjectDates('2026-11-01','2026-11-02')).not.toThrow(); });
  it('rejects negative amounts and fractional beneficiaries', () => { expect(() => validateFinance({ ...f, budget: -1 })).toThrow(); expect(() => validateFinance({ ...f, beneficiaries_reached: 1.5 })).toThrow(); });
  it('rejects executable document or campaign links', () => expect(safeProjectLinks([{ label: 'Unsafe', url: 'javascript:alert(1)' }, { label: 'Report', url: 'https://example.org/report.pdf' }])).toEqual([{ label: 'Report', url: 'https://example.org/report.pdf' }]));
});
