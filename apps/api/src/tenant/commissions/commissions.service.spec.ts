import { CommissionsService } from './commissions.service';

describe('CommissionsService (pure calculation)', () => {
  const rates = { installmentRate: 0.05, cashRate: 0.02 };

  describe('rateFor', () => {
    it('uses the installment rate for DAILY, WEEKLY and MONTHLY', () => {
      expect(CommissionsService.rateFor('DAILY', rates)).toBe(0.05);
      expect(CommissionsService.rateFor('WEEKLY', rates)).toBe(0.05);
      expect(CommissionsService.rateFor('MONTHLY', rates)).toBe(0.05);
    });

    it('uses the cash rate for CASH', () => {
      expect(CommissionsService.rateFor('CASH', rates)).toBe(0.02);
    });
  });

  describe('commissionAmount', () => {
    it('multiplies collected amount by rate', () => {
      expect(CommissionsService.commissionAmount(1000, 0.05)).toBe(50);
    });

    it('rounds to 2 decimal places (THB)', () => {
      // 333 × 0.05 = 16.65
      expect(CommissionsService.commissionAmount(333, 0.05)).toBe(16.65);
      // 777 × 0.025 = 19.425 → 19.43
      expect(CommissionsService.commissionAmount(777, 0.025)).toBe(19.43);
    });

    it('returns 0 when the rate is 0', () => {
      expect(CommissionsService.commissionAmount(5000, 0)).toBe(0);
    });
  });

  it('computes a Sale-Lead override commission via the same formula', () => {
    // Sale Lead earns overrideRate on a team member collection (ADR-0002).
    const overrideRate = 0.01;
    expect(CommissionsService.commissionAmount(1000, overrideRate)).toBe(10);
  });
});
