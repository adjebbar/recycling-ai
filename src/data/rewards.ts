import { Coffee, Bus, ShoppingCart } from 'lucide-react';

export interface Reward {
  id: number;
  name: string;
  cost: number;
  icon: React.ElementType;
}

export const rewards: Reward[] = [
  { id: 3, name: "Coffee Coupon", cost: 50, icon: Coffee },
  { id: 1, name: "Bus Ticket", cost: 100, icon: Bus },
  { id: 2, name: "Market Voucher", cost: 250, icon: ShoppingCart },
].sort((a, b) => a.cost - b.cost);