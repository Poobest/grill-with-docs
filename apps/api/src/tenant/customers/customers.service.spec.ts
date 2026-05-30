import { CustomersService } from './customers.service';

describe('CustomersService.canCreateContract', () => {
  it('allows a customer below their contract limit', () => {
    const result = CustomersService.canCreateContract({
      isSuspended: false,
      activeContractCount: 0,
      contractLimit: 1,
    });
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('blocks a suspended customer', () => {
    const result = CustomersService.canCreateContract({
      isSuspended: true,
      activeContractCount: 0,
      contractLimit: 5,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('SUSPENDED');
  });

  it('blocks a customer who is at their contract limit', () => {
    const result = CustomersService.canCreateContract({
      isSuspended: false,
      activeContractCount: 1,
      contractLimit: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('LIMIT_REACHED');
  });

  it('blocks a customer over their contract limit', () => {
    const result = CustomersService.canCreateContract({
      isSuspended: false,
      activeContractCount: 3,
      contractLimit: 2,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('LIMIT_REACHED');
  });

  it('treats suspension as the priority reason over the limit', () => {
    const result = CustomersService.canCreateContract({
      isSuspended: true,
      activeContractCount: 9,
      contractLimit: 1,
    });
    expect(result.reason).toBe('SUSPENDED');
  });
});
