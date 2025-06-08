import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Users, Shield, Clock, Zap, Focus, Timer } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Focus,
      title: "ADHD-Friendly Design",
      description: "Interface designed to minimize distractions and maximize focus with clear visual cues and organized layouts.",
      color: "from-orange-500 to-red-500",
      badge: "Core"
    },
    {
      icon: Timer,
      title: "Bite-Sized Lessons",
      description: "Short, engaging activities perfect for ADHD attention spans - typically 5-15 minutes each.",
      color: "from-red-500 to-pink-500",
      badge: "Focus"
    },
    {
      icon: Gamepad2,
      title: "Gamified Learning",
      description: "Turn education into an adventure with points, badges, and fun challenges that keep kids engaged.",
      color: "from-orange-500 to-yellow-500",
      badge: "Popular"
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Visual progress tracking that celebrates small wins and builds confidence for ADHD learners.",
      color: "from-red-500 to-orange-500",
      badge: "Motivating"
    },
    {
      icon: Users,
      title: "Safe Social Learning",
      description: "Connect with other ADHD kids in a secure, understanding environment built for neurodivergent children.",
      color: "from-pink-500 to-red-500",
      badge: "Safe"
    },
    {
      icon: Shield,
      title: "Parent Dashboard",
      description: "ADHD-aware reporting helps parents understand their child's learning patterns and celebrate progress.",
      color: "from-orange-600 to-red-600",
      badge: "Trusted"
    }
  ];

  return (
    <section id="features" className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built Specifically for ADHD Minds
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to work with ADHD, not against it. We celebrate neurodivergent learning styles!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
