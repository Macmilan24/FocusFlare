// Next.js 13+ loading page using Lottie animation
"use client";
import React from "react";
import dynamic from "next/dynamic";
import loadingAnimation from "@/public/animation/loading animation.json";

// Dynamically import lottie-react to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-48 h-48">
        <Lottie animationData={loadingAnimation} loop autoplay />
      </div>
      <p className="mt-8 text-lg text-muted-foreground font-semibold animate-pulse">
        Loading, please wait...
      </p>
    </div>
  );
}
