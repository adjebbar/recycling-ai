"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Recycle, ScanLine } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import CommunityImpact from "@/components/CommunityImpact";
import RecyclingBenefits from "@/components/RecyclingBenefits";
import GettingStarted from "@/components/GettingStarted";
import { useRewards } from "@/hooks/useRewards";
import RewardsCarousel from "@/components/RewardsCarousel";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const { user, points } = useAuth();
  const { rewards } = useRewards();
  const animatedPoints = useAnimatedCounter(points);

  const nextReward = useMemo(() => {
    if (!user) return null;
    return rewards.find(reward => points < reward.cost);
  }, [points, rewards, user]);

  const progress = nextReward ? (points / nextReward.cost) * 100 : 100;

  return (
    <div className="container mx-auto p-4">
      <section className="py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <Recycle className="mx-auto md:mx-0 h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {user ? t('home.welcomeBack') : t('home.joinRevolution')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {t('home.subtitle')}
            </p>
            <Link to="/scanner">
              <Button size="lg">
                <ScanLine className="mr-2 h-5 w-5" />
                {t('home.startScanning')}
              </Button>
            </Link>
          </div>
          
          {points > 0 && (
            <div className="space-y-6">
              <Card className="w-full bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>{user ? t('home.yourPoints') : t('home.yourUnsavedPoints')}</CardTitle>
                  {!user && <CardDescription>{t('home.saveProgress')}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-primary">{animatedPoints}</p>
                </CardContent>
              </Card>

              {user && nextReward && (
                <Card className="w-full bg-card/60 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle>{t('home.nextReward')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold mb-2">{nextReward.name}</p>
                    <Progress value={progress} className="w-full mb-2" />
                    <p className="text-sm text-muted-foreground text-right">
                      {t('home.pointsProgress', { points: points, cost: nextReward.cost })}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      {!user && <GettingStarted />}
      <CommunityImpact />
      <RecyclingBenefits />
      <RewardsCarousel />
    </div>
  );
};

export default Index;