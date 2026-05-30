export type CommissionPaymentType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CASH';

export interface CommissionRates {
  /** Rate applied to installment (DAILY/WEEKLY/MONTHLY) collections. */
  installmentRate: number;
  /** Rate applied to CASH collections. */
  cashRate: number;
}

export class CommissionsService {
  /**
   * Selects the applicable rate for a collected payment. CASH uses `cashRate`,
   * every installment type uses `installmentRate` (ADR-0002).
   */
  static rateFor(
    paymentType: CommissionPaymentType,
    rates: CommissionRates,
  ): number {
    return paymentType === 'CASH' ? rates.cashRate : rates.installmentRate;
  }

  /**
   * Commission earned on a single approved payment = collected amount × rate,
   * rounded to 2 decimal places (THB). Commission is computed on real
   * collections, never on contract value (ADR-0002).
   */
  static commissionAmount(collectedAmount: number, rate: number): number {
    return Math.round(collectedAmount * rate * 100) / 100;
  }
}
