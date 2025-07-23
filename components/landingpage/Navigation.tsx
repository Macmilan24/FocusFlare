"use client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Logo/logo.png"
                alt="FocusFlare Logo"
                width={260}
                height={260}
              />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="#features"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#courses"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Courses
              </a>
              <a
                href="#testimonials"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Reviews
              </a>
              <Link href="/auth/signin" passHref>
                <Button variant="outline" className="ml-4">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register" passHref>
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card rounded-lg mt-2 border">
              <a
                href="#features"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              >
                Features
              </a>
              <a
                href="#courses"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              >
                Courses
              </a>
              <a
                href="#testimonials"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              >
                Reviews
              </a>
              <div className="pt-2 space-y-2">
                <Link href="/auth/signin" passHref>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" passHref>
                  <Button className="w-full ">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
