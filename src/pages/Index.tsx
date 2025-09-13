"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { ScanLine } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { points } = useUser();

  return (
    <div className="container mx-auto p-4 text-center">
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to RecycleApp</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Scan plastic bottles, earn points, and get rewards!
        </p>
        
        <Card className="max-w-sm mx-auto mb-8">
          <CardHeader>
            <CardTitle>Your Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">{points}</p>
          </CardContent>
        </Card>

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