import { computeNextStatusOrder, ProjectLite } from '../order';

describe('computeNextStatusOrder', () => {
  function list(orders: Array<number | null | undefined>): ProjectLite[] {
    return orders.map((o, i) => ({ id: `p${i}`, statusOrder: o }));
  }

  it('inserts into empty list → 0', () => {
    expect(computeNextStatusOrder(list([]), 0)).toBe(0);
    expect(computeNextStatusOrder(list([]), 5)).toBe(0);
  });

  it('inserts at start when only next exists → next - 1000', () => {
    expect(computeNextStatusOrder(list([5000]), 0)).toBe(4000);
  });

  it('inserts at end when only prev exists → prev + 1000', () => {
    expect(computeNextStatusOrder(list([1000, 2000, 3000]), 3)).toBe(4000);
  });

  it('inserts between with sufficient gap → midpoint', () => {
    // Between 1000 and 5000 at index 1
    expect(computeNextStatusOrder(list([1000, 5000]), 1)).toBe(3000);
  });

  it('inserts between with dense gap (<=1) → prev + 1', () => {
    // Between 1000 and 1001 gap=1 → 1000+1=1001
    expect(computeNextStatusOrder(list([1000, 1001]), 1)).toBe(1001);
  });

  it('bounds destIndex within [0, length]', () => {
    expect(computeNextStatusOrder(list([1000, 2000]), -10)).toBe(0); // treated as start → next - 1000 = 0? No next is 1000 → 0
    expect(computeNextStatusOrder(list([1000, 2000]), 999)).toBe(3000); // end → prev + 1000
  });
});
