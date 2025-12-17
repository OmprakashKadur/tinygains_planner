"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  Rectangle,
} from "recharts";

interface WeekdayChartProps {
  data: { day: string; count: number }[];
}

export function WeekdayChart({ data }: WeekdayChartProps) {
  return (
    <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30">
      <h3 className="font-bold text-on-surface text-lg mb-2">
        Most Productive Days
      </h3>
      <p className="text-sm text-on-surface-variant mb-6">
        Total goals completed by day of week
      </p>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              dy={10}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            {/* YAxis removed as per instruction */}
            <Tooltip
              cursor={{ fill: "hsl(var(--surface-variant) / 0.1)" }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-surface-container-highest/95 backdrop-blur-sm border border-outline-variant p-3 rounded-xl shadow-xl">
                      <p className="font-bold text-on-surface text-sm mb-1">
                        {label}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{payload[0].value} Goals</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 6, 6]}
              barSize={32}
              activeBar={<Rectangle fill="#047857" stroke="#047857" />}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.count > 0
                      ? "#10b981"
                      : "hsl(var(--outline-variant) / 0.3)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
