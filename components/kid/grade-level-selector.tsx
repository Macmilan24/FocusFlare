"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // Using shadcn Button
import { cn } from "@/lib/utils";

interface Grade {
  id: string;
  name: string;
  icon?: string; // For future icon display
}

interface GradeLevelSelectorProps {
  grades: Grade[];
  selectedGradeId: string;
  onSelectGrade: (gradeId: string) => void;
  className?: string;
}

export function GradeLevelSelector({
  grades,
  selectedGradeId,
  onSelectGrade,
  className,
}: GradeLevelSelectorProps) {
  if (!grades || grades.length === 0) {
    return null; // Don't render if no grades are provided
  }

  return (
    <div className={cn("flex flex-wrap gap-2 p-3 bg-card-kid border border-border-kid rounded-lg shadow ", className)}>
      {grades.map((grade) => (
        <Button
          key={grade.id}
          variant={selectedGradeId === grade.id ? "default" : "outline"}
          onClick={() => onSelectGrade(grade.id)}
          className={cn(
            "transition-all duration-150 ease-in-out font-body", // Ensure Poppins is applied if not default
            selectedGradeId === grade.id
              ? "scale-105 shadow-lg" // Custom styles for selected button
              : "hover:bg-primary-kid/10 hover:border-primary-kid" // Custom hover for unselected
          )}
          size="sm"
        >
          {grade.icon || grade.name}
        </Button>
      ))}
    </div>
  );
} 