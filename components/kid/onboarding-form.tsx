"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completeOnboarding } from "@/actions/kid.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const onboardingFormSchema = z.object({
  gradeLevelId: z.string({
    required_error: "Please select your grade level.",
  }),
  favoriteSubject: z.string({
    required_error: "Please pick your favorite subject.",
  }),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

interface OnboardingFormProps {
  userId: string;
  gradeLevels: { id: string; name: string }[];
  subjects: { name: string }[];
}

export function OnboardingForm({
  userId,
  gradeLevels,
  subjects,
}: OnboardingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
  });

  function onSubmit(data: OnboardingFormValues) {
    startTransition(async () => {
      const result = await completeOnboarding(
        userId,
        data.gradeLevelId,
        data.favoriteSubject
      );
      if (result.success) {
        toast.success("Awesome! Your treasure map is ready!");
        router.push("/kid/roadmap");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Let's Get Started!</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tell us a little about yourself to create your personalized learning
          adventure.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="gradeLevelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What grade are you in?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your grade level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradeLevels.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="favoriteSubject"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Which subject sounds the most fun?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                      disabled={isPending}
                    >
                      {subjects.map((subject) => (
                        <FormItem
                          key={subject.name}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={subject.name} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {subject.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create My Treasure Map!
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
