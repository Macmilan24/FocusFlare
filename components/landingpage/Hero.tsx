import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Star, Users, BookOpen } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 ">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Learning Made{" "}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Fun & Focused
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Specially designed for kids with ADHD! Interactive lessons,
              focus-friendly activities, and bite-sized learning that works with
              your child's unique brain.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth/register" passHref>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Your Focus Journey
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Watch Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-orange-400 text-orange-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5 rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  15k+ ADHD kids thriving
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-pink-100 to-pink-200  border-pink-200  animate-fade-in">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-semibold text-lg mb-2">Art & Creativity</h3>
                <p className="text-sm text-muted-foreground">
                  Express yourself through digital art
                </p>
              </Card>

              <Card
                className="p-6 bg-gradient-to-br from-blue-100 to-blue-200  border-blue-200  animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="text-4xl mb-4">🔢</div>
                <h3 className="font-semibold text-lg mb-2">Math Adventures</h3>
                <p className="text-sm text-muted-foreground">
                  Make numbers fun and exciting
                </p>
              </Card>

              <Card
                className="p-6 bg-gradient-to-br from-green-100 to-green-200 border-green-200  animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-semibold text-lg mb-2">Reading Stories</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive storytelling
                </p>
              </Card>

              <Card
                className="p-6 bg-gradient-to-br from-yellow-100 to-yellow-200  border-yellow-200  animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="text-4xl mb-4">🧪</div>
                <h3 className="font-semibold text-lg mb-2">Science Fun</h3>
                <p className="text-sm text-muted-foreground">
                  Discover the world around you
                </p>
              </Card>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
            <div
              className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};
