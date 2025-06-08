import React from "react";
import { X, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface KidData {
  name: string;
  points: number;
  avatarUrl: string;
  dayStreak: number;
  goalsThisMonth: number;
  rank: number;
}

interface UserDetailsPanelProps {
  kidData: KidData;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({
  kidData,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
        fixed md:absolute right-0 top-0 h-full w-80 max-w-[90vw] 
        bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto z-50 
        shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0 md:shadow-none
      `}
      >
        <div className="space-y-4">
          {/* User Profile Card */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              {/* Header with Close Button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-primary-kid hover:bg-orange-50 p-1"
                >
                  <X className="h-4 w-4" />
                  <span className="ml-1 text-sm">Close Details</span>
                </Button>
              </div>

              {/* User Info Row */}
              <div className="flex items-center gap-4 mb-6">
                {/* Avatar */}
                <Avatar className="w-16 h-16 ring-2 ring-orange-200">
                  <AvatarImage src={kidData.avatarUrl} alt={kidData.name} />
                  <AvatarFallback className="bg-primary-kid text-white text-lg font-bold">
                    {kidData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* User Info Text Column */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {kidData.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    UI/UX Designer & Developer
                  </p>

                  {/* Points Row */}
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary-kid fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {kidData.points} Points
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-kid">
                    {kidData.dayStreak}
                  </div>
                  <div className="text-xs text-gray-500">Days Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-kid">
                    {kidData.goalsThisMonth}
                  </div>
                  <div className="text-xs text-gray-500">Goals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-kid">
                    {kidData.rank}nd
                  </div>
                  <div className="text-xs text-gray-500">Place</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Streak Card */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800">Weekly Streak</h4>
                <span className="text-xs text-gray-500">May 2024</span>
              </div>

              <div className="text-sm text-gray-600 mb-4">4/4 Weeks</div>

              {/* Week Calendar */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={day} className="text-center">
                    <p className="text-xs text-gray-400 mb-1">{day}</p>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index < 4
                          ? "bg-primary-kid text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {29 + index}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">3 Courses</span>
                  <span className="font-medium text-gray-800">
                    17 Completed
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium text-gray-800">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Watch Time Card */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4">
                Weekly Watch Time
              </h4>
              <div className="text-center">
                <div className="gradient-bg-primary rounded-lg p-4 text-white mb-4">
                  <div className="text-xs opacity-90 mb-1">6hrs</div>
                  <div className="text-xl font-bold">4:24m</div>
                  <div className="text-xs opacity-90 mt-1">4hrs</div>
                </div>
                <div className="text-sm text-gray-600">4/4 Weeks</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
