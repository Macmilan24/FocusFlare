/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE: components/kid/user-details-panel.tsx

import React from "react";
import {
  Star,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  Calendar as CalendarIcon,
  BookCheck,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { type KidData, type DailyActivity } from "@/types/kid"; // Use your real data types
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Props this component will receive from its parent.
interface UserDetailsPanelProps {
  kidData: KidData;
  dailyActivityData: DailyActivity[];
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date; // The currently viewed week's date
  onDateChange: (date: Date) => void; // Function to call when the date changes
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Focus Time
            </span>
            <span className="font-bold text-orange-500">
              {payload[0].value} mins
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({
  kidData,
  dailyActivityData,
  isOpen,
  onClose,
  selectedDate,
  onDateChange,
}) => {
  const dayInitials = ["M", "T", "W", "T", "F", "S", "S"];

  const panelClasses = `
    fixed right-0 top-0 h-full w-full max-w-sm 
    bg-[#FFFBF7] dark:bg-slate-900/95 backdrop-blur-sm 
    border-l border-orange-100 dark:border-slate-800 
    p-4 overflow-y-auto z-50 shadow-lg transform 
    transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "translate-x-full"}
  `;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside className={panelClasses}>
        <div className="space-y-4">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Close details panel"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-orange-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {/* Main Profile Card */}
          <Card className="border border-orange-100 shadow-inner shadow-orange-50 bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-orange-400">
                  <AvatarImage
                    src={kidData.avatarUrl || undefined}
                    alt={kidData.name}
                  />
                  <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                    {kidData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {kidData.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Student
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {kidData.points} Points
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="border border-orange-100 shadow-inner shadow-orange-50 bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {kidData.dailyStreak}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Days Streak
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {kidData.badgesEarnedCount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Badges
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {kidData.rank}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rank
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Streak Card - Now fully functional */}
          <Card className="border border-orange-100 shadow-inner shadow-orange-50 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Weekly Streak
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMM, yyyy")}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && onDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-7 gap-1">
                {dayInitials.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-slate-400 mb-1">{day}</div>
                    <div
                      className={`h-9 w-9 rounded-md flex items-center justify-center ${
                        kidData.streakCalendar[index]
                          ? "bg-orange-500 text-white"
                          : "bg-orange-50 dark:bg-slate-700"
                      }`}
                    >
                      {kidData.streakCalendar[index] && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Progress Cards - Design Refined */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-orange-100 shadow-inner shadow-orange-50 bg-white dark:bg-slate-800">
              <CardContent className="p-3 text-center">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {kidData.coursesInProgressCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  In Progress
                </p>
              </CardContent>
            </Card>
            <Card className="border border-orange-100 shadow-inner shadow-orange-50 bg-white dark:bg-slate-800">
              <CardContent className="p-3 text-center">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <BookCheck className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {kidData.coursesCompletedCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Watch Time Card - Now fully functional */}
          <Card className="border border-orange-100 shadow-inner shadow-orange-50 bg-white dark:bg-slate-800">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Weekly Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={dailyActivityData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="Focus Time (minutes)"
                    fill="#FF4500"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </aside>
    </>
  );
};
