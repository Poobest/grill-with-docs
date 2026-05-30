import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  isSuspended: boolean;
  contractLimit: number;
}

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

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lists a tenant's customers for selection in the create-contract flow. */
  async list(tenantId: string): Promise<CustomerListItem[]> {
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      isSuspended: c.isSuspended,
      contractLimit: c.contractLimit,
    }));
  }

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
