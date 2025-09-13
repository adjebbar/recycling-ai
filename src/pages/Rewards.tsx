"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { rewards } from "@/data/rewards";

const RewardsPage = () => {
  const { points, spendPoints } = useUser();

  const handleRedeem = (cost: number, name: string) => {
    if (points >= cost) {
      spendPoints(cost);
      showSuccess(`"${name}" redeemed successfully!`);
    } else {
      showError("Not enough points to redeem this reward.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Redeem Rewards</h1>
      <p className="mb-8 text-lg">You have <span className="font-bold text-primary">{points}</span> points.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardHeader>
              <CardTitle>{reward.name}</CardTitle>
              <CardDescription>{reward.cost} Points</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Redeem this reward and enjoy your benefits!</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleRedeem(reward.cost, reward.name)} disabled={points < reward.cost}>
                Redeem
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RewardsPage;