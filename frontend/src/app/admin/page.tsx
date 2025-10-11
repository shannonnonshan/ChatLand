import React from 'react';
import { UserIcon, UsersIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center">Admin Report Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {/* Tổng số người dùng */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform border-b-4 border-blue-500">
          <UsersIcon className="h-8 w-8 text-blue-500 mb-2" />
          <h2 className="text-lg font-bold text-gray-700 mb-1">Total Users</h2>
          <p className="text-3xl font-extrabold text-blue-700">[Loading]</p>
        </div>
        {/* Số lượng bạn bè đã kết nối */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform border-b-4 border-green-500">
          <UserIcon className="h-8 w-8 text-green-500 mb-2" />
          <h2 className="text-lg font-bold text-gray-700 mb-1">Friend Connections</h2>
          <p className="text-3xl font-extrabold text-green-700">[Loading]</p>
        </div>
        {/* Số lượng báo cáo vi phạm */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform border-b-4 border-red-500">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500 mb-2" />
          <h2 className="text-lg font-bold text-gray-700 mb-1">Reports</h2>
          <p className="text-3xl font-extrabold text-red-700">[Loading]</p>
        </div>
      </div>
      {/* Bảng danh sách báo cáo vi phạm (nếu có) */}
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Report Details</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 font-semibold text-gray-700">Report ID</th>
              <th className="py-2 px-4 font-semibold text-gray-700">User</th>
              <th className="py-2 px-4 font-semibold text-gray-700">Reason</th>
              <th className="py-2 px-4 font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-blue-50">
              <td className="py-2 px-4 text-blue-700 font-bold">[ID]</td>
              <td className="py-2 px-4 text-gray-800">[User]</td>
              <td className="py-2 px-4 text-gray-800">[Reason]</td>
              <td className="py-2 px-4 text-gray-800">[Date]</td>
            </tr>
            {/* ...existing code... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
