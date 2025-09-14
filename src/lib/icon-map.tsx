import { Coffee, Bus, ShoppingCart, Gift, LucideProps } from 'lucide-react';
import React, { ForwardRefExoticComponent, RefAttributes } from 'react';

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export const iconMap: { [key: string]: LucideIcon } = {
  Coffee,
  Bus,
  ShoppingCart,
  Gift,
};

export const iconNames = Object.keys(iconMap);

export const getIcon = (name: string | undefined): LucideIcon => {
  if (name && iconMap[name]) {
    return iconMap[name];
  }
  return Gift; // Default icon
};