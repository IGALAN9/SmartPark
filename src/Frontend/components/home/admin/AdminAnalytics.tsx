"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type FloorData = {
  id: string;
  name: string;
  available: number;
  total: number;
};
type MallData = {
  id: string;
  name: string;
  address: string;
  floors: FloorData[];
};

type GlobalStats = {
  totalSlots: number;
  totalAvailable: number;
  totalOccupied: number;
};
type MallStats = {
  name: string;
  total: number;
  occupied: number;
};

const COLORS = {
  Available: "#10B981", 
  Occupied: "#EF4444", 
};

export default function AdminAnalytics() {
  const [mallStats, setMallStats] = useState<MallStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/malls"); 
        if (!res.ok) throw new Error("Failed to fetch data");
        
        const data: MallData[] = await res.json();

        // Proses data untuk "Occupancy per Mall"
        let totalSlots = 0;
        let totalAvailable = 0;

        const processedMallStats = data.map((mall) => {
          const mallTotal = mall.floors.reduce((acc, floor) => acc + floor.total, 0);
          const mallAvailable = mall.floors.reduce((acc, floor) => acc + floor.available, 0);
          
          totalSlots += mallTotal;
          totalAvailable += mallAvailable;

          return {
            name: mall.name,
            total: mallTotal,
            occupied: mallTotal - mallAvailable,
          };
        });
        
        // Hitung statistik global
        const globalOccupied = totalSlots - totalAvailable;
        
        setMallStats(processedMallStats);
        setGlobalStats({
          totalSlots,
          totalAvailable,
            totalOccupied: globalOccupied,
        });

      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) return <p className="text-center text-indigo-600">Loading analytics...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!globalStats) return null;

  // Data untuk chart
  const chartData = [
    { name: "Available", value: globalStats.totalAvailable },
    { name: "Occupied", value: globalStats.totalOccupied },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        Real-Time Analytics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="flex flex-col items-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Total Occupancy (All Malls)
          </h4>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={({ value, percent }: any) => `${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Available' ? COLORS.Available : COLORS.Occupied} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="font-bold text-lg mt-4">
            Total Slots: {globalStats.totalSlots}
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Occupancy by Mall
          </h4>
          <div className="space-y-3">
            {mallStats.map((mall) => (
              <div key={mall.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{mall.name}</span>
                  <span className="text-sm font-medium">
                    {mall.occupied} / {mall.total} Occupied
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-indigo-600 h-4 rounded-full"
                    style={{ width: `${mall.total > 0 ? (mall.occupied / mall.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}