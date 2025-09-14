"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { ScanLine } from "lucide-react";
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
    const sortedRewards = [...rewards].sort((a, b) => a.cost - b.cost);
    return sortedRewards.find(reward => points < reward.cost);
  }, [points, rewards, user]);

  const progress = nextReward ? (points / nextReward.cost) * 100 : 100;

  return (
    <div className="container mx-auto p-4">
      <section className="text-center py-16 md:py-24">
        <div
          className="max-w-3xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-primary">{t('home.hero.recycle')}</span>{t('home.hero.earnRepeat')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/scanner">
              <Button size="lg">
                <ScanLine className="mr-2 h-5 w-5" />
                {t('home.startScanning')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {user && (
        <section
          className="max-w-3xl mx-auto -mt-12 mb-16 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="w-full bg-card/70 backdrop-blur-lg border">
              <CardHeader>
                <CardTitle>{t('home.yourPoints')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{animatedPoints}</p>
              </CardContent>
            </Card>

            {nextReward ? (
              <Card className="w-full bg-card/70 backdrop-blur-lg border">
                <CardHeader>
                  <CardTitle>{t('home.nextReward')}</CardTitle>
                  <CardDescription>{nextReward.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="w-full mb-2" />
                  <p className="text-sm text-muted-foreground text-right">
                    {t('home.pointsProgress', { points: points, cost: nextReward.cost })}
                  </p>
                </CardContent>
              </Card>
            ) : (
               <Card className="w-full bg-card/70 backdrop-blur-lg border">
                <CardHeader>
                  <CardTitle>{t('home.allRewardsUnlocked')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('home.allRewardsUnlockedDesc')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        {!user && <GettingStarted />}
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <CommunityImpact />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
        <RecyclingBenefits />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <RewardsCarousel />
      </div>
    </div>
  );
};

export default Index;