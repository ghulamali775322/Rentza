"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Props = {
  title: string;
  data: { name: string; value: number; color: string }[];
};

export default function DonutCard({ title, data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">

      {/* Header */}
      <div className="mb-4">
        <div className="mb-4 flex items-center justify-between">
  <h3 className="text-sm font-semibold text-gray-700">
    {title}
  </h3>
</div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[150px] h-[150px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                cornerRadius={8}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.3
                    }
                    style={{
                      filter:
                        activeIndex === index
                          ? "drop-shadow(0px 0px 6px rgba(0,0,0,0.2))"
                          : "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-900 transition-all duration-200">
              {activeItem ? activeItem.value : total}
            </span>
            <span className="text-xs text-gray-400 mt-1 capitalize">
              {activeItem ? activeItem.name : "Total"}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm font-medium text-gray-700 mt-3">
        {data.map((item, i) => (
          <div
            key={i}
            onClick={() =>
              setActiveIndex(activeIndex === i ? null : i)
            }
            className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${
              activeIndex === i ? "scale-105" : "opacity-80 hover:opacity-100"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name} ({item.value})
          </div>
        ))}
      </div>
    </div>
  );
}