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

const Index = () => {
  const { points } = useUser();
  const animatedPoints = useAnimatedCounter(points);

  const nextReward = useMemo(() => {
    return rewards.find(reward => points < reward.cost);
  }, [points]);

  const progress = nextReward ? (points / nextReward.cost) * 100 : 100;

  return (
    <div className="container mx-auto p-4 text-center">
      <div className="py-12">
        <Recycle className="mx-auto h-16 w-16 text-primary/80 mb-4" />
        <h1 className="text-4xl font-bold mb-4">Welcome to RecycleApp</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Scan plastic bottles, earn points, and get rewards!
        </p>
        
        <Card className="max-w-sm mx-auto mb-8">
          <CardHeader>
            <CardTitle>Your Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">{animatedPoints}</p>
          </CardContent>
        </Card>

        {nextReward && (
          <div className="max-w-sm mx-auto mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              {nextReward.cost - points} points to your next reward: {nextReward.name}
            </p>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Link to="/scanner">
          <Button size="lg">
            <ScanLine className="mr-2 h-5 w-5" />
            Start Scanning
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;