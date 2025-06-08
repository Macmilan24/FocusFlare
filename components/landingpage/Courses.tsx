import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Clock, Users, Play } from "lucide-react";
import Link from "next/link";

export const Courses = () => {
  const courses = [
    {
      title: "Math Adventures for Beginners",
      description:
        "Learn counting, addition, and subtraction through fun games and interactive activities.",
      emoji: "🔢",
      duration: "2 weeks",
      students: "1,234",
      rating: 4.9,
      progress: 0,
      level: "Beginner",
      lessons: 12,
      color: "from-blue-500 to-purple-500",
    },
    {
      title: "Reading & Storytelling",
      description:
        "Improve reading skills with exciting stories and interactive reading exercises.",
      emoji: "📚",
      duration: "3 weeks",
      students: "892",
      rating: 4.8,
      progress: 0,
      level: "Beginner",
      lessons: 18,
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Creative Art Studio",
      description:
        "Express creativity through digital art, drawing, and creative projects.",
      emoji: "🎨",
      duration: "4 weeks",
      students: "2,156",
      rating: 4.9,
      progress: 0,
      level: "All Levels",
      lessons: 24,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Science Explorers",
      description:
        "Discover amazing scientific facts through experiments and interactive lessons.",
      emoji: "🧪",
      duration: "5 weeks",
      students: "745",
      rating: 4.7,
      progress: 0,
      level: "Intermediate",
      lessons: 30,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Music & Rhythm",
      description: "Learn about music, rhythm, and even create your own songs.",
      emoji: "🎵",
      duration: "3 weeks",
      students: "567",
      rating: 4.8,
      progress: 0,
      level: "Beginner",
      lessons: 15,
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "World Geography Fun",
      description:
        "Explore countries, cultures, and amazing places around the world.",
      emoji: "🌍",
      duration: "4 weeks",
      students: "834",
      rating: 4.6,
      progress: 0,
      level: "All Levels",
      lessons: 20,
      color: "from-teal-500 to-cyan-500",
    },
  ];

  return (
    <section id="courses" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Popular Learning Adventures
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our exciting collection of courses designed to make
            learning fun and engaging
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${course.color}`}></div>

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{course.emoji}</div>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.students}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {course.lessons} lessons
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <Link href="/auth/register" passHref>
                  <Button className="w-full group-hover:shadow-md transition-all bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    <Play className="mr-2 h-4 w-4" />
                    Start Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/auth/register" passHref>
            <Button variant="outline" size="lg">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
