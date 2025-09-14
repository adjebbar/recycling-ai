"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Recycle, UserPlus, ScanLine, Trophy, LucideProps } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

const LandingHeader = () => (
  <header className="absolute top-0 left-0 right-0 z-10 py-4">
    <div className="container mx-auto flex justify-between items-center px-4">
      <Link to="/" className="flex items-center space-x-2">
        <Recycle className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-gray-800">RecycleApp</span>
      </Link>
      <div className="space-x-2">
        <Button asChild variant="ghost">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  </header>
);

interface FeatureCardProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
    <Card className="text-center bg-white/60 backdrop-blur-sm border border-green-100 shadow-lg animate-fade-in-up rounded-xl" style={{ animationDelay: delay }}>
        <CardContent className="p-8">
            <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);


const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-cyan-50 text-gray-800 overflow-x-hidden">
      <LandingHeader />
      <main>
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center text-center pt-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Scan. <span className="text-primary">Earn.</span> Recycle.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Turn your plastic waste into rewards. Join our community and make a difference, one bottle at a time.
              </p>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full">
                  <Link to="/scanner">Start Scanning</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white/70 backdrop-blur-md">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
                    <p className="text-muted-foreground mt-2">Simple steps to start making an impact.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <FeatureCard 
                        icon={UserPlus}
                        title="Create an Account"
                        description="Sign up for free to track your progress and earn points."
                        delay="0.8s"
                    />
                    <FeatureCard 
                        icon={ScanLine}
                        title="Scan Plastic Bottles"
                        description="Use your phone's camera to scan barcodes on plastic bottles."
                        delay="1.0s"
                    />
                    <FeatureCard 
                        icon={Trophy}
                        title="Redeem Rewards"
                        description="Exchange your points for exciting rewards and discounts."
                        delay="1.2s"
                    />
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;