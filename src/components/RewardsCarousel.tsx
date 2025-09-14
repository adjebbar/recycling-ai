"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRewards } from "@/hooks/useRewards";
import { getIcon } from "@/lib/icon-map";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";

const RewardsCarousel = () => {
  const { rewards, isLoading } = useRewards();
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto mt-16">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!rewards || rewards.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 text-center">
      <h2 className="text-3xl font-bold mb-6">Récompenses en Vedette</h2>
      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-4xl mx-auto"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {rewards.map((reward) => {
            const Icon = getIcon(reward.icon);
            return (
              <CarouselItem key={reward.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Link to="/rewards">
                    <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col items-center justify-center text-center p-6 hover:bg-accent/50 transition-colors">
                      <Icon className="w-12 h-12 text-primary mb-4" />
                      <CardHeader className="p-0">
                        <CardTitle>{reward.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-2">
                        <p className="text-sm text-muted-foreground">{reward.cost} Points</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

export default RewardsCarousel;