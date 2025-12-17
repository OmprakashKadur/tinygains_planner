"use client";

import { ReportData } from "@/actions/reports";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ActivityChart({ data }: { data: ReportData["activity"] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
      <div className="mb-6">
        <h3 className="font-bold text-on-surface text-lg">Activity Trend</h3>
        <p className="text-sm text-on-surface-variant">
          Goals completed over the last 30 days
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              minTickGap={30}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-surface-container-highest/95 backdrop-blur-sm border border-outline-variant p-3 rounded-xl shadow-xl">
                      <p className="font-bold text-on-surface text-sm mb-1">
                        {label}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{payload[0].value} Completed</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{
                stroke: "#10b981",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCompleted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
