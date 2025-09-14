"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useRewards } from "@/hooks/useRewards";
import { getIcon } from "@/lib/icon-map";
import { Skeleton } from "@/components/ui/skeleton";

const RewardsPage = () => {
  const { points, spendPoints } = useAuth();
  const { rewards, isLoading } = useRewards();
  const animatedPoints = useAnimatedCounter(points);

  const handleRedeem = async (cost: number, name: string) => {
    if (points >= cost) {
      await spendPoints(cost);
      showSuccess(`"${name}" redeemed successfully!`);
    } else {
      showError("Not enough points to redeem this reward.");
    }
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Redeem Rewards</h1>
        <p className="text-lg text-muted-foreground">
          You have <span className="font-bold text-primary">{animatedPoints}</span> points.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col bg-card/60 backdrop-blur-md">
              <CardHeader className="flex-row gap-4 items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          rewards.map((reward) => {
            const Icon = getIcon(reward.icon);
            const canRedeem = points >= reward.cost;
            return (
              <Card key={reward.id} className="flex flex-col bg-card/60 backdrop-blur-md">
                <CardHeader className="flex-row gap-4 items-center">
                  <Icon className="w-10 h-10 text-primary" />
                  <div>
                    <CardTitle>{reward.name}</CardTitle>
                    <CardDescription>{reward.cost} Points</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">Redeem this reward and enjoy your benefits!</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleRedeem(reward.cost, reward.name)} 
                    disabled={!canRedeem}
                    className="w-full"
                  >
                    {canRedeem ? "Redeem" : "Not enough points"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RewardsPage;