import { addDays, addMonths, addWeeks, isEqual } from 'date-fns';
import { ContractsService, type ScheduleInput } from './contracts.service';

/**
 * Unit tests for the pure scheduling logic. No database — `buildSchedule` is a
 * deterministic function of its input (UI-SPEC: real-DB integration tests live
 * elsewhere; this is the pure-logic layer).
 */
describe('ContractsService.buildSchedule', () => {
  const startDate = new Date('2026-06-01T00:00:00.000Z');

  const baseInput: Omit<ScheduleInput, 'paymentType'> = {
    startDate,
    downPayment: 1000,
    dailyPrice: 100,
    weeklyPrice: 500,
    monthlyPrice: 2000,
    cashPrice: 9000,
  };

  describe('DAILY', () => {
    const schedule = ContractsService.buildSchedule({
      ...baseInput,
      paymentType: 'DAILY',
    });

    it('generates 31 items: 1 down payment + 30 daily installments', () => {
      expect(schedule).toHaveLength(31);
      expect(schedule.filter((i) => i.isDownPayment)).toHaveLength(1);
      expect(schedule.filter((i) => !i.isDownPayment)).toHaveLength(30);
    });

    it('puts the down payment first, due on the start date', () => {
      const [first] = schedule;
      expect(first.isDownPayment).toBe(true);
      expect(first.amount).toBe(1000);
      expect(isEqual(first.dueDate, startDate)).toBe(true);
    });

    it('charges dailyPrice for every installment', () => {
      const installments = schedule.filter((i) => !i.isDownPayment);
      expect(installments.every((i) => i.amount === 100)).toBe(true);
    });

    it('spaces installments one day apart, first due the day after start', () => {
      const installments = schedule.filter((i) => !i.isDownPayment);
      expect(isEqual(installments[0].dueDate, addDays(startDate, 1))).toBe(true);
      expect(isEqual(installments[29].dueDate, addDays(startDate, 30))).toBe(
        true,
      );
    });
  });

  describe('WEEKLY', () => {
    const schedule = ContractsService.buildSchedule({
      ...baseInput,
      paymentType: 'WEEKLY',
    });

    it('generates 13 items: 1 down payment + 12 weekly installments', () => {
      expect(schedule).toHaveLength(13);
      expect(schedule.filter((i) => i.isDownPayment)).toHaveLength(1);
      expect(schedule.filter((i) => !i.isDownPayment)).toHaveLength(12);
    });

    it('charges weeklyPrice and spaces installments 7 days apart', () => {
      const installments = schedule.filter((i) => !i.isDownPayment);
      expect(installments.every((i) => i.amount === 500)).toBe(true);
      expect(isEqual(installments[0].dueDate, addWeeks(startDate, 1))).toBe(
        true,
      );
      expect(isEqual(installments[11].dueDate, addWeeks(startDate, 12))).toBe(
        true,
      );
    });
  });

  describe('MONTHLY', () => {
    const schedule = ContractsService.buildSchedule({
      ...baseInput,
      paymentType: 'MONTHLY',
    });

    it('generates 13 items: 1 down payment + 12 monthly installments', () => {
      expect(schedule).toHaveLength(13);
      expect(schedule.filter((i) => !i.isDownPayment)).toHaveLength(12);
    });

    it('charges monthlyPrice and spaces installments one month apart', () => {
      const installments = schedule.filter((i) => !i.isDownPayment);
      expect(installments.every((i) => i.amount === 2000)).toBe(true);
      expect(isEqual(installments[0].dueDate, addMonths(startDate, 1))).toBe(
        true,
      );
      expect(isEqual(installments[11].dueDate, addMonths(startDate, 12))).toBe(
        true,
      );
    });
  });

  describe('CASH', () => {
    const schedule = ContractsService.buildSchedule({
      ...baseInput,
      paymentType: 'CASH',
    });

    it('generates a single payment for the full cash price, due on start date', () => {
      expect(schedule).toHaveLength(1);
      const [only] = schedule;
      expect(only.amount).toBe(9000);
      expect(isEqual(only.dueDate, startDate)).toBe(true);
    });

    it('marks the single cash payment as the down-payment-equivalent (releases stock)', () => {
      // CASH has no separate down payment (PRD); the lump payment is what
      // releases goods, so it carries the down-payment flag for stock logic.
      expect(schedule[0].isDownPayment).toBe(true);
    });
  });

  it('totals equal downPayment + (count × installment price)', () => {
    const schedule = ContractsService.buildSchedule({
      ...baseInput,
      paymentType: 'DAILY',
    });
    const total = schedule.reduce((sum, i) => sum + i.amount, 0);
    expect(total).toBe(1000 + 30 * 100);
  });
});
