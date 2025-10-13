"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type HourlyData = { hour: number; count: number };

type DashboardData = {
  adminId: number;
  adminName: string;
  newUsersInLast24h: number;
  totalPosts: number;
  hourlyNewUsers: HourlyData[];
};

export default function AdminPage() {
  const params = useParams();
  const adminId = params.id;

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${adminId}`);
      if (!res.ok) throw new Error(await res.text() || "Failed to fetch dashboard");
      const data: DashboardData = await res.json();
      setDashboard(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [adminId]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={fetchDashboard}
          className="px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-gray-600">Loading dashboard...</div>}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}

      {!loading && dashboard && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white shadow-md rounded-2xl p-4 min-w-[180px]">
              <div className="text-sm text-gray-500">New users (last 24h)</div>
              <div className="mt-2 text-3xl font-semibold">{dashboard.newUsersInLast24h}</div>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-4 min-w-[180px]">
              <div className="text-sm text-gray-500">Total posts</div>
              <div className="mt-2 text-3xl font-semibold">{dashboard.totalPosts}</div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-4">New Users Trend (Last 24h)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dashboard.hourlyNewUsers.map(h => ({ hour: `${h.hour}:00`, count: h.count }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!loading && !dashboard && !error && (
        <div className="text-gray-500">No dashboard data available or not an admin.</div>
      )}

    </div>
  );
}
