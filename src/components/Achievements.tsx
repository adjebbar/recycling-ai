"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { achievementsList } from "@/lib/achievements";
import { cn } from "@/lib/utils";

interface AchievementsProps {
  points: number;
  totalScans: number;
}

const Achievements = ({ points, totalScans }: AchievementsProps) => {
  const userStats = { points, totalScans };

  return (
    <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Succès</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 text-center">
          {achievementsList.map((achievement) => {
            const isUnlocked = achievement.condition(userStats);
            return (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center justify-center w-16 h-16 rounded-full bg-muted transition-all",
                          isUnlocked ? "bg-primary/20 text-primary" : "opacity-40"
                        )}
                      >
                        <achievement.Icon className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-medium truncate w-full">{achievement.name}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {!isUnlocked && <p className="text-xs text-destructive">(Verrouillé)</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Achievements;