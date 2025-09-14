"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface DailyBonusProps {
  isOpen: boolean;
  onClaim: () => void;
  onClose: () => void;
  bonusAmount: number;
}

export const DailyBonus = ({ isOpen, onClaim, onClose, bonusAmount }: DailyBonusProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Gift className="w-16 h-16 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Daily Bonus!</DialogTitle>
          <DialogDescription className="text-center">
            Welcome back! Claim your daily bonus to keep your recycling streak going.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center my-4">
          <p className="text-4xl font-bold text-primary">+{bonusAmount} Points</p>
        </div>
        <DialogFooter>
          <Button onClick={onClaim} className="w-full">Claim Bonus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};