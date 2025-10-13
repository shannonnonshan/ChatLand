"use client";

import React, { useEffect, useState } from "react";

type ReportData = {
  totalUsers?: number;
  newUsersInLast3Days?: number;
  totalConnections?: number;
  // allow future extensibility
  [key: string]: any;
};

export default function AdminReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Adjust the path if your backend is mounted at a different origin
      const res = await fetch("/admin/report", {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReportData = await res.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRefresh = () => fetchReport();

  const renderCard = (label: string, value: number | undefined) => {
    if (typeof value === "undefined" || value === null) return null;
    return (
      <div className="bg-white shadow-md rounded-2xl p-4 min-w-[180px]">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-2 text-3xl font-semibold">{value}</div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Admin — Report</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-gray-600">Loading report...</div>
      )}

      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}

      {!loading && report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {renderCard("Total users", report.totalUsers)}
          {renderCard("New users (last 3 days)", report.newUsersInLast3Days)}
          {renderCard("Total connections", report.totalConnections)}
        </div>
      )}

      {!loading && !report && !error && (
        <div className="text-gray-500">No report data available.</div>
      )}

      {/* Optional: show raw JSON for debugging */}
      {report && (
        <details className="mt-6 p-4 bg-gray-50 rounded-md">
          <summary className="cursor-pointer">Raw report JSON (debug)</summary>
          <pre className="mt-2 text-sm overflow-auto max-h-48">{JSON.stringify(report, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
