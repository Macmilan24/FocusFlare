import React from "react";
import { Trophy, Target, Medal, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface KidData {
  name: string;
  points: number;
  avatarUrl: string;
  dayStreak: number;
  goalsThisMonth: number;
  rank: number;
}

interface UserProfileCardProps {
  kidData: KidData;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  kidData,
}) => {
  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card className="border-orange-200">
        <CardHeader className="text-center pb-4">
          <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-orange-200">
            <AvatarImage src={kidData.avatarUrl} alt={kidData.name} />
            <AvatarFallback className="bg-primary-kid text-white text-xl font-bold">
              {kidData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg text-gray-800">{kidData.name}</h3>
          <p className="text-sm text-gray-600">FocusFlare Explorer</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-lg text-gray-800">
              {kidData.points} Points
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Day Streak */}
        <Card className="gradient-bg-primary text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Days Streak</p>
                <p className="text-2xl font-bold">{kidData.dayStreak}</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Goals This Month */}
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Goals in Month</p>
                <p className="text-2xl font-bold">{kidData.goalsThisMonth}</p>
              </div>
              <Target className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Rank */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">2nd Place</p>
                <p className="text-2xl font-bold">#{kidData.rank}</p>
              </div>
              <Medal className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="border-orange-200">
        <CardHeader>
          <h4 className="font-semibold text-gray-800">Weekly Streak</h4>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm text-gray-600">4/4 Weeks</span>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700"
            >
              May 2024
            </Badge>
          </div>

          {/* Week Calendar */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => (
                <div key={day} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{day}</p>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index < 4
                        ? "bg-primary-kid text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {29 + index}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Progress Summary */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">3 Courses In Progress</span>
              <span className="font-medium text-gray-800">17 Completed</span>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Weekly Watch Time</p>
              <div className="gradient-bg-primary rounded-lg p-3 text-white">
                <p className="text-xs opacity-90">6hrs</p>
                <p className="text-lg font-bold">4:24m</p>
                <p className="text-xs opacity-90">4hrs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
