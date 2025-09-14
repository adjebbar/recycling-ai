"use client";

import { useAuth } from "@/context/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Badge } from "@/components/ui/badge";
import Achievements from "@/components/Achievements";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, points } = useAuth();
  const { data: scanHistory, isLoading } = useProfileData();
  const animatedPoints = useAnimatedCounter(points);

  const totalScans = scanHistory?.length ?? 0;

  return (
    <div className="container mx-auto p-4 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('profile.title')}</h1>
        <p className="text-lg text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto mb-8">
        <Card className="bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle>{t('profile.totalPoints')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{animatedPoints.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle>{t('profile.bottlesRecycled')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalScans.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Achievements />

      <Card className="max-w-4xl mx-auto mt-8 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{t('profile.recentActivity')}</CardTitle>
          <CardDescription>{t('profile.recentActivityDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('profile.date')}</TableHead>
                <TableHead>{t('profile.barcode')}</TableHead>
                <TableHead className="text-right">{t('profile.points')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                scanHistory?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.scanned_at), 'PPp')}</TableCell>
                    <TableCell className="font-mono">{item.product_barcode}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">+{item.points_earned}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;