// components/charts/activity-bar-chart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "next-themes"; // To adapt chart colors to light/dark mode
import { ActivityOverTimePoint } from "@/actions/progress.actions"; // Your data type

interface ActivityBarChartProps {
  data: ActivityOverTimePoint[]; // Expects { date: string (YYYY-MM-DD), count: number }
}

// Helper to format date for XAxis (e.g., "Apr 1", "May 15")
const formatDateTick = (dateString: string) => {
  const date = new Date(dateString + "T00:00:00"); // Ensure it's parsed as local date
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function ActivityBarChart({ data }: ActivityBarChartProps) {
  const { theme } = useTheme(); // For theme-aware colors

  const barColor = theme === "dark" ? "#a855f7" : "#8b5cf6"; // Example: Purple
  const gridColor = theme === "dark" ? "#374151" : "#e5e7eb"; // Gray
  const textColor = theme === "dark" ? "#cbd5e1" : "#4b5563"; // Slate

  // Find max value for YAxis domain to give some padding
  const maxCount = Math.max(...data.map((d) => d.count), 0);
  const yAxisMax = Math.ceil((maxCount + 1) / 5) * 5; // Round up to nearest 5, or just maxCount + some_padding

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
        No activity data to display.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 0, // No right margin if no right YAxis
          left: -25, // Negative margin to pull YAxis ticks closer
          bottom: 5,
        }}
        barGap={4} // Gap between bars in the same group (not relevant for single bar)
        barCategoryGap="20%" // Gap between categories (dates)
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
          vertical={false}
        />{" "}
        {/* Hide vertical grid lines */}
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick} // Format date ticks
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd" // Show first and last tick
          // You might need more advanced tick control for many data points (e.g., every Nth tick)
          // tickCount={7} // Example: try to show around 7 ticks
        />
        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          domain={[0, yAxisMax === 0 ? 5 : yAxisMax]} // Ensure YAxis starts at 0 and has a sensible max
          allowDecimals={false}
        />
        <Tooltip
          cursor={{
            fill:
              theme === "dark"
                ? "rgba(100,116,139,0.2)"
                : "rgba(203,213,225,0.3)",
          }} // Light gray hover, theme aware
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", // bg-gray-800 or bg-white
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb", // border-gray-700 or border-gray-200
            borderRadius: "0.5rem", // rounded-lg
            color: textColor,
          }}
          labelFormatter={formatDateTick} // Format date in tooltip label
        />
        {/* <Legend /> // Not needed for a single data series */}
        <Bar dataKey="count" name="Activities" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            // You can conditionally set fill color based on value if needed
            <Cell key={`cell-${index}`} fill={barColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
