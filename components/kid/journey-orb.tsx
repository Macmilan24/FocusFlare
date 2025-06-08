"use client";

import React from "react";
import Link from "next/link"; // For future navigation
import { ArrowRightCircle, Zap } from "lucide-react"; // Placeholder icons

interface Quest {
  id: string;
  title: string;
  category: string;
  // icon?: React.ElementType; // For a specific icon component
  iconName?: string; // For lucide icon names, etc.
  href?: string; // Link to the quest
}

interface JourneyOrbProps {
  currentQuest: Quest;
  className?: string;
}

export function JourneyOrb({ currentQuest, className }: JourneyOrbProps) {
  const IconComponent = currentQuest.iconName === "Zap" ? Zap : ArrowRightCircle;

  const handleQuestClick = () => {
    console.log("Journey Orb clicked for quest:", currentQuest.id);
    // Later: router.push(currentQuest.href || `/kid/content/${currentQuest.id}`);
  };

  return (
    <div
      className={`group relative flex flex-col items-center justify-center p-6 md:p-8 aspect-square w-full max-w-xs mx-auto rounded-full cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 ${className}
        orb-shadow
        border-4 border-white/50 
      `}
      style={{
        backgroundImage: `linear-gradient(to bottom right, hsl(var(--primary-kid)), hsl(var(--primary-kid)) 70%, hsl(var(--secondary-kid)))`,
      }}
      onClick={handleQuestClick}
      title={`Start: ${currentQuest.title}`}
    >
      {/* Optional: Inner "highlight" ring */}
      {/* <div className="absolute inset-2 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-all duration-300"></div> */}
      
      <IconComponent className="w-12 h-12 md:w-16 md:h-16 text-white mb-3 transition-transform duration-300 group-hover:scale-110" />
      
      <p className="text-xs font-body text-white/80 uppercase tracking-wider group-hover:text-white">
        Next Adventure
      </p>
      <h2 className="text-xl md:text-2xl font-heading font-bold text-center text-white mt-1 mb-1 leading-tight">
        {currentQuest.title}
      </h2>
      <p className="text-sm font-body text-white/90 group-hover:text-white">
        {currentQuest.category}
      </p>

      {/* Subtle "Go" arrow that appears more on hover */}
      <ArrowRightCircle className="absolute bottom-4 right-4 w-6 h-6 text-white/50 opacity-50 group-hover:opacity-100 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
    </div>
  );
}
 