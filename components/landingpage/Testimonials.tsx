import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Parent of Emma (7 years old)",
      content: "My daughter absolutely loves the interactive lessons! She's been learning math through games and doesn't even realize she's studying. Her grades have improved significantly.",
      rating: 5,
      avatar: "SJ",
      highlight: "Interactive lessons"
    },
    {
      name: "Michael Chen",
      role: "Parent of Alex (9 years old)",
      content: "The progress tracking feature is amazing. I can see exactly what Alex is learning and where he needs more practice. The platform makes learning so engaging!",
      rating: 5,
      avatar: "MC",
      highlight: "Progress tracking"
    },
    {
      name: "Lisa Rodriguez",
      role: "Parent of Sofia (6 years old)",
      content: "Sofia started reading so much better after using this platform. The storytelling features are incredible and she's always excited for her next lesson.",
      rating: 5,
      avatar: "LR",
      highlight: "Reading improvement"
    },
    {
      name: "David Park",
      role: "Parent of Ryan (8 years old)",
      content: "As a busy parent, I love how I can monitor Ryan's learning progress. The parent dashboard gives me peace of mind and Ryan loves earning badges!",
      rating: 5,
      avatar: "DP",
      highlight: "Parent dashboard"
    },
    {
      name: "Amy Williams",
      role: "Parent of Zoe (10 years old)",
      content: "The science experiments are Zoe's favorite! She's always asking to do 'just one more lesson.' It's wonderful to see her so passionate about learning.",
      rating: 5,
      avatar: "AW",
      highlight: "Science experiments"
    },
    {
      name: "James Thompson",
      role: "Parent of Lucas (7 years old)",
      content: "Lucas used to struggle with math, but now he's actually asking for extra practice! The gamified approach really works for keeping kids motivated.",
      rating: 5,
      avatar: "JT",
      highlight: "Gamified learning"
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Parents Are Saying
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from families who've seen amazing results with our learning platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={testimonial.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="text-6xl">💭</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12 p-8 bg-muted/50 rounded-2xl">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-2xl font-bold mb-4">Join 50,000+ Happy Families</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            See why thousands of parents trust us with their children's education. 
            Start your free trial today and watch your child fall in love with learning!
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.9/5 average rating</span>
            </div>
            <div>•</div>
            <div>50,000+ active students</div>
            <div>•</div>
            <div>99% parent satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};
