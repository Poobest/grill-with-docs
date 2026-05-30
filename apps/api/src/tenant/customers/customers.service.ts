export interface ContractEligibilityInput {
  isSuspended: boolean;
  /** Number of contracts the customer currently has in an active/open state. */
  activeContractCount: number;
  contractLimit: number;
}

export type EligibilityReason = 'SUSPENDED' | 'LIMIT_REACHED';

export interface EligibilityResult {
  allowed: boolean;
  reason?: EligibilityReason;
}

export class CustomersService {
  /**
   * Decides whether a customer may take on a new contract. Pure decision —
   * the caller supplies the current active-contract count from the database.
   *
   * Rules (PRD): a suspended customer is blocked; a customer at or over their
   * contract limit is blocked; otherwise allowed.
   */
  static canCreateContract(input: ContractEligibilityInput): EligibilityResult {
    if (input.isSuspended) {
      return { allowed: false, reason: 'SUSPENDED' };
    }
    if (input.activeContractCount >= input.contractLimit) {
      return { allowed: false, reason: 'LIMIT_REACHED' };
    }
    return { allowed: true };
  }
}
