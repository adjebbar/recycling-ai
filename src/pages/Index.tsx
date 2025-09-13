"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/context/UserContext";
import { rewards } from "@/data/rewards";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Recycle, ScanLine } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import CommunityImpact from "@/components/CommunityImpact";
import RecyclingBenefits from "@/components/RecyclingBenefits";

const Index = () => {
  const { points } = useUser();
  const animatedPoints = useAnimatedCounter(points);

  const nextReward = useMemo(() => {
    return rewards.find(reward => points < reward.cost);
  }, [points]);

  const progress = nextReward ? (points / nextReward.cost) * 100 : 100;

  return (
    <div className="container mx-auto p-4">
      <section className="py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <Recycle className="mx-auto md:mx-0 h-16 w-16 text-primary/80 mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to RecycleApp</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Scan plastic bottles, earn points, and redeem exciting rewards!
            </p>
            <Link to="/scanner">
              <Button size="lg">
                <ScanLine className="mr-2 h-5 w-5" />
                Start Scanning
              </Button>
            </Link>
          </div>
          <div className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Your Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{animatedPoints}</p>
              </CardContent>
            </Card>

            {nextReward && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Next Reward</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">{nextReward.name}</p>
                  <Progress value={progress} className="w-full mb-2" />
                  <p className="text-sm text-muted-foreground text-right">
                    {points}/{nextReward.cost} points
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <CommunityImpact />
      <RecyclingBenefits />
    </div>
  );
};

export default Index;