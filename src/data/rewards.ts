export interface Reward {
  id: number;
  name: string;
  cost: number;
}

export const rewards: Reward[] = [
  { id: 3, name: "Coffee Coupon", cost: 50 },
  { id: 1, name: "Bus Ticket", cost: 100 },
  { id: 2, name: "Market Voucher", cost: 250 },
].sort((a, b) => a.cost - b.cost);